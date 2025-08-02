// src/lib/generate-hashes.ts
import { hashPassword } from './hash-password';

async function generate() {
  const passwords = ['admin123', 'customer123', 'staff123'];
  for (const password of passwords) {
    const hash = await hashPassword(password);
    console.log(`Password: ${password}, Hash: ${hash}`);
  }
}

generate();