import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Leer los datos del archivo del request
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let transcription = "";
    let fileType = file.type;

    if (fileType === "audio/mp4") {
      const buffer = await file.arrayBuffer();
      const newFile = new File([buffer], "audio.mp4", { type: "audio/mp4" });

      console.log("New file:", newFile);

      // Enviar el archivo a OpenAI para la transcripción
      transcription = await openai.audio.transcriptions.create({
        file: newFile,
        model: "whisper-1",
      });
    } else {
      // Enviar el archivo a OpenAI para la transcripción
      transcription = await openai.audio.transcriptions.create({
        file: file,
        model: "whisper-1",
      });
    }

    console.log(transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json(
      { error: "Error in transcription" },
      { status: 500 }
    );
  }
}
