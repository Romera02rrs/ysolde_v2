import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Imprimir el tipo MIME del archivo recibido
    console.error('Received file type:', file.type);

    const supportedFormats = ['audio/flac', 'audio/m4a', 'audio/mp3', 'audio/mp4', 'audio/mpeg', 'audio/mpga', 'audio/oga', 'audio/ogg', 'audio/wav', 'audio/webm'];

    if (!supportedFormats.includes(file.type)) {
      console.warn('Unsupported file format:', file.type);
      return NextResponse.json({ error: `Unsupported file format: ${file.type}. Supported formats: ${supportedFormats.join(', ')}` }, { status: 400 });
    }

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1'
    });

    console.log(transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in transcription:', error);
    return NextResponse.json({ error: 'Error in transcription' }, { status: 500 });
  }
}
