import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import { promisify } from "util";
import path from "path";
const ffmpeg = require('fluent-ffmpeg');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Promisify fs methods for convenience
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export async function POST(request) {
  try {
    // Leer los datos del archivo del request
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let transcription = "";
    const fileType = file.type;
    console.log("Original file type:", fileType);

    if (fileType === "audio/mp4") {
      const buffer = await file.arrayBuffer();
      const tempInputPath = path.join("/tmp", "input.mp4");
      const tempOutputPath = path.join("/tmp", "output.webm");

      // Guardar el archivo temporalmente para convertirlo
      await writeFile(tempInputPath, Buffer.from(buffer));

      // Convertir el archivo de mp4 a webm
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .output(tempOutputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      // Leer el archivo convertido
      const convertedBuffer = fs.readFileSync(tempOutputPath);
      const newFile = new File([convertedBuffer], "audio.webm", { type: "audio/webm" });

      // Enviar el archivo convertido a OpenAI para la transcripción
      transcription = await openai.audio.transcriptions.create({
        file: newFile,
        model: "whisper-1",
      });

      // Eliminar los archivos temporales
      await unlink(tempInputPath);
      await unlink(tempOutputPath);
    } else {
      // Enviar el archivo directamente a OpenAI para la transcripción
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
