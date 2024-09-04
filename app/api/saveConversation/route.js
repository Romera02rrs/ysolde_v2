import { NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/mongoose";
import User from "@/models/User";
import Conversation from "@/models/Conversation";
import jwt from "jsonwebtoken";
import { UploadClient } from "@uploadcare/upload-client";

// Configurar el cliente de Uploadcare para subir archivos
const uploadClient = new UploadClient({
  publicKey: process.env.UPLOADCARE_PUBLIC_KEY,
});

export async function POST(request) {
  await connectToDatabase();

  const { chatResponse, audioResponse, token } = await request.json();

  if (!text || !token || audioResponse) {
    return NextResponse.json(
      { error: "Chat response, file audio and authentication is required" },
      { status: 400 }
    );
  }

  let userId = "";
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // TODO: .txt is correct?
  const uploadResponse = await uploadClient.uploadFile(audioResponse, {
    filename: `${userId}-${Date.now()}.txt`,
  });

  const audioResponseUrl = uploadResponse.cdnUrl;

  // Crear un nuevo mensaje con el texto y el enlace al audio
  const newMessage = { chatResponse, audioResponseUrl };

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
    message: "Audio generated and saved",
    audioResponseUrl,
  });
}
