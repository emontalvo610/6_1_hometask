import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import multer from "multer";
import { MONGO_URL } from "./constant";

import router from "./routes/api";

const app = express();

app.use(bodyParser.json());

const storage = multer.memoryStorage();

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

mongoose.connect(MONGO_URL);

app.use("/api", router);
