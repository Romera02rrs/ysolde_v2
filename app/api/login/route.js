// api/register.js
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';



export async function POST(request) {
  await connectToDatabase();

  try {
    const { email, password } = await request.json();

    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar la contraseña usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Si la contraseña es correcta, generar un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Devolver una respuesta exitosa con el token
    return NextResponse.json({ message: 'Login successful', token }, { status: 200 });

  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again later.' },
      { status: 500 }
    );
  }
}