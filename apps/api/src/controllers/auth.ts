import { Request, Response } from 'express';
import { login } from '../services/auth';

export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    const token = await login(username, password);
    res.json({ token });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login gagal';
    res.status(401).json({ error: message });
  }
}
