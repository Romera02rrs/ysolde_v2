// app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { prompt, userId } = await request.json();
  console.log(prompt);

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant that helps users practice their English speaking skills." },
        { role: "user", content: prompt },
      ],
      model: "gpt-4o-mini",
     //user: userId,
    });

    const response = completion.choices[0].message?.content
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: "Error in chat completion" },
      { status: 500 }
    );
  }
}
