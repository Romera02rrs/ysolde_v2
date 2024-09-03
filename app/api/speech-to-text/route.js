import { NextResponse } from "next/server";
import OpenAI from "openai";
import mime from "mime-types"; // Paquete para manejar tipos MIME

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
    // Verificar el tipo MIME y cambiarlo si es necesario
    let fileType = file.type;
    if (fileType === "audio/mp4") {
      fileType = "mp4"; // Cambia el tipo MIME a 'video/mp4'

      // Reempaquetar el archivo como un Blob con el nuevo tipo MIME
      const buffer = await file.arrayBuffer();
      const blob = new Blob([buffer], { type: fileType });

      console.log("New file type:", blob);

      // Enviar el archivo a OpenAI para la transcripción
      transcription = await openai.audio.transcriptions.create({
        file: blob,
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
