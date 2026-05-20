import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { title, difficulty, questions } = await req.json();

  if (!questions || questions.length === 0) {
    return NextResponse.json({ success: false, error: "No questions provided." }, { status: 400 });
  }

  // ✅ Serialize questions safely regardless of their internal format
  const serialized = questions.map((q: any, i: number) => {
    // Get question text
    const text = q.text || q.question || "(empty question)";

    // Get options — handle both {id, text} objects and plain strings
    const options: string[] = Array.isArray(q.options)
      ? q.options.map((o: any) => (typeof o === "string" ? o : o.text || "(empty option)"))
      : [];

    // Get correct answer — handle correctOptionId or correctAnswer
    let correct = "(none marked)";
    if (q.correctOptionId && Array.isArray(q.options)) {
      const found = q.options.find((o: any) => o.id === q.correctOptionId);
      correct = found ? (found.text || found) : "(none marked)";
    } else if (q.correctAnswer) {
      correct = q.correctAnswer;
    }

    return `Q${i + 1} [${q.type || "multiple"}]: ${text}
Options: ${options.length > 0 ? options.join(" | ") : "N/A"}
Correct: ${correct}`;
  }).join("\n\n");

  const systemPrompt = `You are a strict quiz quality reviewer. Analyze the quiz and return ONLY a valid JSON object with exactly these fields:
{
  "score": <integer between 0 and 100>,
  "decision": <"approve" or "needs_review" or "reject">,
  "remarks": [<string>, <string>]
}

Scoring rules:
- score >= 75 → decision must be "approve"
- score 50 to 74 → decision must be "needs_review"  
- score < 50 → decision must be "reject"

Check for these issues:
- Questions with no correct answer marked
- Correct answer that doesn't match any option
- Nonsensical, random, or offensive content
- Empty questions or options
- Overall educational value

Return ONLY the JSON object. No indice, no markdown, no extra text.`;

  const userPrompt = `Review this quiz:
Title: "${title || "Untitled"}"
Difficulty: ${difficulty || "unknown"}

Questions:
${serialized}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 512,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    console.log("Groq raw response:", content);

    const parsed = JSON.parse(content);

    // ✅ Validate required fields
    if (
      typeof parsed.score !== "number" ||
      !["approve", "needs_review", "reject"].includes(parsed.decision) ||
      !Array.isArray(parsed.remarks)
    ) {
      console.error("Invalid parsed response:", parsed);
      throw new Error("Invalid AI response format.");
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to review quiz." },
      { status: 500 }
    );
  }
}