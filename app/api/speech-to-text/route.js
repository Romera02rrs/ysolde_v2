import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // Leer los datos del archivo del request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileEdited = new File([originalFile], originalFile.name, { type: 'mp4' });

    // Enviar el archivo a OpenAI para la transcripción
    const transcription = await openai.audio.transcriptions.create({
      file: fileEdited,
      model: 'whisper-1'
    });

    console.log(transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.log("FILE_FORMAT: ", file.type)
    console.error('Error in transcription:', error);
    return NextResponse.json({ error: 'Error in transcription' }, { status: 500 });
  }
}
