import dotenv from "dotenv";

dotenv.config();

export const MONGO_URL = process.env.MONGODB_URI ?? "";
export const DELETE_LIMIT = Number(process.env.DELETE_LIMIT);
