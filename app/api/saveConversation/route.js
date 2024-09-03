import { NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/mongoose';
import User from '@/models/User';
import Conversation from '@/models/Conversation';
import jwt from 'jsonwebtoken';
import { UploadClient } from '@uploadcare/upload-client';

// Configurar el cliente de Uploadcare para subir archivos
const uploadClient = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});


export async function POST(request) {
  await connectToDatabase();

  const { text, voice = 'alloy', token } = await request.json();

  if (!text || !token) {
    return NextResponse.json({ error: 'Text and authentication token required' }, { status: 400 });
  }

  // Verificar el token y obtener el usuario
  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const baseUrl = new URL(request.url).origin;

  const bufferResponse = await fetch(`${baseUrl}/api/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
    }),
  })
    .then((res) => res.json())
    .then((data) => data.dataBuffer);

  // Convertir el objeto a un Buffer
  const audioBuffer = Buffer.from(bufferResponse.data);

  // Subir el archivo a Uploadcare
  const uploadResponse = await uploadClient.uploadFile(audioBuffer, {
    filename: `${userId}-${Date.now()}.mp3`,
  });

  const audioUrl = uploadResponse.cdnUrl; // URL del archivo en Uploadcare
  
  // Crear un nuevo mensaje con el texto y el enlace al audio
  const newMessage = { text, audioUrl };

  // Buscar o crear una conversación para este usuario
  let conversation = await Conversation.findOne({ user: userId });
  if (!conversation) {
    conversation = new Conversation({ user: userId, messages: [newMessage] });
  } else {
    conversation.messages.push(newMessage);
  }

  // Guardar la conversación
  await conversation.save();

  // Enviar la respuesta con el enlace al audio y la información del archivo (opcional)
  return NextResponse.json({ 
    message: 'Audio generated and saved', 
    audioUrl, 
  });
}
