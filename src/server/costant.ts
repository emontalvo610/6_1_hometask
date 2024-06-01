import dotenv from "dotenv";

dotenv.config();

export const MONGO_URL = process.env.MONGODB_URI ?? "";
export const FILE_LIMIT = Number(process.env.FILE_LIMIT);
