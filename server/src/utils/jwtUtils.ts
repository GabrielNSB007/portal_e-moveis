import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET_KEY ?? process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não foi definido no .env");
  }

  return secret;
}

function getJwtExpiration() {
  const expiration = process.env.JWT_ACCESS_EXPIRATION;

  if (!expiration) {
    return 86400;
  }

  return Number(expiration);
}

export function generateAccessToken(userId: string) {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: getJwtExpiration(),
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret());
}
