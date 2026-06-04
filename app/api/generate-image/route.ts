import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title } = await req.json();

  if (!title) {
    return NextResponse.json({ success: false, error: "Title is required." }, { status: 400 });
  }

  const query = encodeURIComponent(title);
  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&w=600&h=300`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ success: false, error: "Image not found." }, { status: 500 });
  }

  const data = await res.json();
  const imageUrl = data.urls?.regular ?? data.urls?.small;

  return NextResponse.json({ success: true, imageUrl });
}