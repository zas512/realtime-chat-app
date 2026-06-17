import dotenv from "dotenv";

dotenv.config();

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT, JWT_SECRET } = process.env;

export const config = { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT, JWT_SECRET };