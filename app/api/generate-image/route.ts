import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title } = await req.json();

  if (!title) {
    return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
  }

  const prompt = encodeURIComponent(
    `educational quiz cover about ${title}, flat design, colorful, modern illustration, clean background, no text, professional`
  );

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${prompt}?width=600&height=300&nologo=true&seed=${Date.now()}`;

  try {
    // Télécharge l'image côté serveur et convertit en base64
    const res = await fetch(pollinationsUrl, {
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`Pollinations error: ${res.status}`);

    const blob = await res.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = blob.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ success: true, imageUrl: dataUrl });

  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message ?? "Failed to generate image." },
      { status: 500 }
    );
  }
}