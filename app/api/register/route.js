// api/register.js
import connectToDatabase from '@/app/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(request) {
  await connectToDatabase();

  const { email, password } = await request.json();

  // Verifica si el usuario ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  // Hashear la contraseña antes de almacenarla
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear el nuevo usuario con la contraseña hasheada
  const user = new User({
    email,
    password: hashedPassword, // Almacenar la contraseña hasheada
  });

  // Guardar el usuario en la base de datos
  await user.save();

  return NextResponse.json({ message: 'User created successfully' });
}
