import dotenv from "dotenv";
dotenv.config();

export const DB = process.env.DATABASE!;
export const PORT = process.env.PORT!;
