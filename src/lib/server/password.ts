export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3
  });
}

export async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
  return await Bun.password.verify(hash, password, "argon2id");
}
