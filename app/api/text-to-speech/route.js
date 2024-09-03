import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Leer el texto desde el cuerpo de la solicitud
    const { text, voice = 'alloy' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Generar el archivo de audio utilizando la API de OpenAI
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
    });

    // Definir la ruta donde se almacenará el archivo
    const fileName = `/speech-${Date.now()}-${Math.random()}.mp3`
    const speechFile = path.join(process.cwd(), 'public', fileName);

    // Convertir la respuesta a un Buffer y escribir el archivo en el sistema de archivos
    const buffer = Buffer.from(await mp3.arrayBuffer());
    //await fs.promises.writeFile(speechFile, buffer);

    // Devolver la URL del archivo de audio generado
    return NextResponse.json({ dataBuffer: buffer });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return NextResponse.json({ error: 'Error in text-to-speech' }, { status: 500 });
  }
}

