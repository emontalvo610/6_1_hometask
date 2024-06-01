import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import ViteExpress from "vite-express";
import multer from "multer";
import JSZip from "jszip";

import { FILE_LIMIT, MONGO_URL } from "./costant";
import userSchema from "./models/User";
import fileSchema from "./models/File";

const app = express();

app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);

mongoose.connect(MONGO_URL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const UserModel = db.model("user", userSchema);
const FileModel = db.model("file", fileSchema);

app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username, password });

  if (user) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

app.post("/api/files", async (req: Request, res: Response) => {
  const { user } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  res.json(
    files.map((file) => ({
      filename: file.filename,
      size: file.size,
      id: file.id,
      path: file.path,
      isDeleted: file.isDeleted,
    }))
  );
});

app.post(
  "/api/uploadfolder",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const { username, parent, paths } = req.body;

    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }

    const filePaths = paths.split(",");
    console.log(filePaths);

    for (let i = 0; i < Number(req.files.length); i++) {
      const newFile = new FileModel({
        filename: req.files[i].originalname,
        data: req.files[i].buffer,
        user: username,
        size: req.files[i].size,
        path: parent + filePaths[i],
      });
      await newFile.save();
    }

    try {
      res.send("File uploaded to MongoDB");
    } catch (error) {
      res.status(500).send("Error uploading file to MongoDB");
    }
  }
);

app.post("/api/files", async (req: Request, res: Response) => {
  const { user } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  res.json(
    files
      .filter((file) => !file.isDeleted)
      .map((file) => ({
        filename: file.filename,
        size: file.size,
        id: file.id,
        path: file.path,
      }))
  );
});

app.post(
  "/api/uploadfiles",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const { username, parent } = req.body;

    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }

    for (let i = 0; i < Number(req.files.length); i++) {
      const newFile = new FileModel({
        filename: req.files[i].originalname,
        data: req.files[i].buffer,
        user: username,
        size: req.files[i].size,
        path: parent + req.files[i].originalname,
      });
      await newFile.save();
    }

    try {
      res.send("File uploaded to MongoDB");
    } catch (error) {
      res.status(500).send("Error uploading file to MongoDB");
    }
  }
);
