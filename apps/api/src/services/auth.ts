import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

export async function login(username: string, password: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new Error('Username atau password salah');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Username atau password salah');

  return jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '24h',
  });
}
