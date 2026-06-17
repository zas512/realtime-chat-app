import jwt from "jsonwebtoken";

const JWT = process.env.JWT_SECRET;
export function sign(payload: object) {
  return jwt.sign(payload, JWT!);
}

export function verify(token: string) {
  return jwt.verify(token, JWT!);
}
