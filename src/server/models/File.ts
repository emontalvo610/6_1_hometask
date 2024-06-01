import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  data: Buffer,
  user: String,
  size: Number,
  isDeleted: Boolean,
  deletedAt: Date,
});

export default fileSchema;
