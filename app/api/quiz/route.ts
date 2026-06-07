import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const FORMAT_RULES: Record<string, string> = {
  multiple_choice: `Generate ONLY multiple choice questions.
Each question MUST have:
- "type": "multiple_choice"
- "options": exactly 4 distinct options as an array
- "correct_answer": must match one option exactly`,

  true_false: `Generate ONLY true/false questions.
Each question MUST have:
- "type": "true_false"
- "options": exactly ["True", "False"]
- "correct_answer": either "True" or "False"`,

  short_answer: `Generate ONLY short answer questions.
Each question MUST have:
- "type": "short_answer"
- "options": [] (empty array)
- "correct_answer": a concise expected answer (max 5 words)`,

  mixed: `Generate a MIX of question types.
Distribute roughly: 40% multiple_choice, 30% true_false, 30% short_answer.
Each question MUST have:
- "type": one of "multiple_choice" | "true_false" | "short_answer"
- "options": 4 options if multiple_choice, ["True","False"] if true_false, [] if short_answer
- "correct_answer": must follow the rules for the chosen type`,
};

export async function POST(req: NextRequest) {
  const {
    title,
    prompt,
    category,
    difficulty,
    numQuestions,
    timer,
    language,
    questionType = "multiple_choice",
  } = await req.json();

  if (!title && !prompt) {
    return NextResponse.json(
      { success: false, error: "Title or prompt is required." },
      { status: 400 }
    );
  }

  const formatRule = FORMAT_RULES[questionType] ?? FORMAT_RULES.multiple_choice;

  const systemPrompt = `You are an expert quiz creator.
Generate exactly ${numQuestions} questions in ${language}.
Respond ONLY with valid JSON, no text before or after.
Use this exact structure:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_answer": "option A",
      "indice": "hint text"
    }
  ]
}

${formatRule}

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
Question type: ${questionType}`;

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