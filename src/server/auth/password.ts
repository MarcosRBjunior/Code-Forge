import { hash, verify } from "@node-rs/argon2";

/*
 * argon2id com os parâmetros mínimos recomendados pela OWASP (m=19 MiB, t=2, p=1).
 * `algorithm: 2` = Algorithm.Argon2id (o pacote exporta um const enum, que o isolatedModules não deixa usar).
 */
const ARGON2_OPTIONS = { algorithm: 2, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

/**
 * Hash de uma senha aleatória descartada, com os MESMOS parâmetros acima. O login de um e-mail inexistente
 * verifica contra ele para gastar o mesmo tempo de um e-mail existente. Se mudar ARGON2_OPTIONS, gere outro
 * (o teste de auth confere que os parâmetros batem).
 */
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$2X2p2i4GVcUyCw8rK0iXDQ$0TYjgXbJ9cTiAwaFLQtOoiM/uNLbo42goYgSBmLxS4U";

export const PASSWORD_HASH_PARAMS = ARGON2_OPTIONS;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

/** Nunca lança: hash corrompido conta como senha errada. */
export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}
