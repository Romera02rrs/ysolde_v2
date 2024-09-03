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

    console.log('File type: ', file.type)

    let transcription = ""

    if (file.type == "audio/mp4"){
      const blob = new Blob([file], { type: 'audio/m4a' });
      const newFile = new File([blob], 'audio.m4a', { type: 'audio/m4a' });
      transcription = await openai.audio.transcriptions.create({
        file: newFile,
        model: 'whisper-1'
      });
    }else{
      transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1'
      });
    }

    console.log('Transcription: ', transcription);

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in transcription:', error);
    return NextResponse.json({ error: 'Error in transcription' }, { status: 500 });
  }
}
