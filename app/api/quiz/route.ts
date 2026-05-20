import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const {
    title,
    prompt,
    category,
    difficulty,
    numQuestions,
    timer,
    language,
  } = await req.json();

  if (!title && !prompt) {
    return NextResponse.json(
      { success: false, error: "Title or prompt is required." },
      { status: 400 }
    );
  }

  const systemPrompt = `You are an expert quiz creator.
Generate exactly ${numQuestions} questions in ${language}.
Respond ONLY with valid JSON, no text before or after.
Use this exact structure:
{
  "questions": [
    {
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "option A",
      "indice": "hint text"
    }
  ]
}

STRICT RULES FOR INDICE:
- Maximum 10 words
- NEVER repeat words from the question
- NEVER mention the answer directly
- Give a subtle clue that helps think
- Example: instead of 'Lossless Audio' write 'Used by audiophiles for perfect quality'`;

  const userPrompt = `Create a quiz about: "${title}".
${prompt ? `Details: ${prompt}` : ""}
Category: ${category}
Difficulty: ${difficulty}
Questions: ${numQuestions}
Time per question: ${timer} seconds
Language: ${language}
Make correct_answer match exactly one of the options.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    const parsed  = JSON.parse(content ?? "{}");

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid AI response format.");
    }

    return NextResponse.json({ success: true, data: parsed });

  } catch (error: any) {
    console.error("Groq error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to generate quiz." },
      { status: 500 }
    );
  }
}