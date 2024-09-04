import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Leer el texto desde el cuerpo de la solicitud
    const { text, voice = "alloy" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Generar el archivo de audio utilizando la API de OpenAI
    const audioResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    //const buffer = Buffer.from(await audioResponse.arrayBuffer());

    // Devolver la URL del archivo de audio generado
    const arrayBuffer = await audioResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    return NextResponse.json({ dataBuffer: uint8Array });
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    return NextResponse.json(
      { error: "Error in text-to-speech" },
      { status: 500 }
    );
  }
}
