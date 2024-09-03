import { NextResponse } from "next/server";
import OpenAI from "openai";
import { File } from "buffer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const arrayBuffer = await request.arrayBuffer();

    if (!arrayBuffer) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convierte el ArrayBuffer en un Blob y luego en un File
    const blob = new Blob([arrayBuffer], { type: "audio/webm" });
    const file = new File([blob], "audio.webm", { type: "audio/webm" });

    console.log("File type: ", file.type);
    console.log("File name: ", file.name);

    // Verifica el tipo MIME y ajusta si es necesario
    if (file.type !== "audio/webm") {
      return NextResponse.json(
        { error: "Invalid file format. Please upload a webm audio file." },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file, // Envía el archivo convertido a la API de Whisper
      model: "whisper-1",
    });

    console.log("Transcription: ", transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json(
      { error: "Error in transcription" },
      { status: 500 }
    );
  }
}
