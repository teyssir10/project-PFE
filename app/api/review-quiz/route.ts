import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { title, difficulty, questions } = await req.json();

  if (!questions || questions.length === 0) {
    return NextResponse.json({ success: false, error: "No questions provided." }, { status: 400 });
  }

  const serialized = questions.map((q: any, i: number) => {
    const text = q.text || q.question || "(empty question)";

    const options: string[] = Array.isArray(q.options)
      ? q.options.map((o: any) => (typeof o === "string" ? o : o.text || "(empty option)"))
      : [];

    let correct = "(none marked)";
    if (q.correctOptionId && Array.isArray(q.options)) {
      const found = q.options.find((o: any) => o.id === q.correctOptionId);
      correct = found ? (found.text || found) : "(none marked)";
    } else if (q.correctAnswer) {
      correct = q.correctAnswer;
    }


    const typeLabel = q.type === "short" || q.type === "short_answer"
      ? "short_answer (free text — no options required)"
      : q.type || "multiple_choice";

    return `Q${i + 1} [${typeLabel}]: ${text}
Options: ${options.length > 0 ? options.join(" | ") : q.type === "short" || q.type === "short_answer" ? "N/A (short answer question)" : "N/A"}
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

IMPORTANT QUESTION TYPE RULES:
- "short_answer" questions require NO options. They expect a free-text answer. NEVER penalize a short_answer question for missing options. It is valid as long as it has a correct_answer text.
- "multiple_choice" questions MUST have at least 2 options and a correct answer marked.
- "true_false" questions MUST have exactly 2 options (True/False).

Check for these issues:
- multiple_choice or true_false questions with no options
- Questions with no correct answer marked (except short_answer which uses correct_answer text)
- Correct answer that doesn't match any option (only for multiple_choice/true_false)
- Nonsensical, random, or offensive content
- Empty question text
- Overall educational value

Return ONLY the JSON object. No markdown, no extra text.`;

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