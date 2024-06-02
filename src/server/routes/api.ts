import { Router, Request, Response } from "express";
import JSZip from "jszip";
import multer from "multer";
import userSchema from "../schemas/userSchema";
import fileSchema from "../schemas/fileSchema";
import mongoose from "mongoose";
const cron = require("node-cron");

import { DELETE_LIMIT } from "../constant";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = Router();

// Schedule the cron job to run every minute
cron.schedule("* * * * *", async () => {
  try {
    // Find files that have exceeded the DELETE_LIMIT
    const expiredFiles = await FileModel.find({
      isDeleted: true,
      deletedAt: { $lte: Date.now() - DELETE_LIMIT },
    });

    // Delete the expired files from the database
    await FileModel.deleteMany({
      _id: { $in: expiredFiles.map((file) => file._id) },
    });

    console.log(`Deleted ${expiredFiles.length} expired files.`);
  } catch (error) {
    console.error("Error deleting expired files:", error);
  }
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

const UserModel = db.model("user", userSchema);
const FileModel = db.model("file", fileSchema);

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await UserModel.findOne({ username, password });

  if (user) {
    res.json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

router.post(
  "/uploadfolder",
  upload.array("files"),
  async (req: Request, res: Response) => {
    const { username, parent, paths } = req.body;

    if (!req.files) {
      return res.status(400).send("No file uploaded");
    }

    const filePaths = paths.split(",");

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

router.post("/files", async (req: Request, res: Response) => {
  const { user } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }

  res.json(
    files
      .filter((file) => file.isDeleted !== true)
      .map((file) => ({
        filename: file.filename,
        size: file.size,
        id: file.id,
        path: file.path,
      }))
  );
});

router.post(
  "/uploadfiles",
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

router.delete("/file/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await FileModel.findById(id);
  if (file) {
    file.isDeleted = true;
    file.deletedAt = Date.now();
    await file.save();
  }
  res.send("Delete the file successfully");
});

router.post("/folder/delete", async (req: Request, res: Response) => {
  const { user, path } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  for (let i = 0; i < files.length; i++) {
    if (files[i].path?.indexOf(path) === 0) {
      files[i].isDeleted = true;
      files[i].deletedAt = Date.now();
      await files[i].save();
    }
  }
  res.send("Delete the folder successfully");
});

router.put("/file/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await FileModel.findById(id);
  if (file) {
    file.isDeleted = false;
    await file.save();
  }
  res.send("Restore the file successfully");
});

router.post("/folder/restore", async (req: Request, res: Response) => {
  const { user, path } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  for (let i = 0; i < files.length; i++) {
    if (files[i].path?.indexOf(path) === 0) {
      files[i].isDeleted = false;
      await files[i].save();
    }
  }
  res.send("Restore the folder successfully");
});

router.post("/deletedfiles", async (req: Request, res: Response) => {
  const { user } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  } else {
    res.json(files);
  }
});

router.post("/file/compress/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const file = await FileModel.findById(id);
  if (file) {
    const zip = new JSZip();

    const fileData = Buffer.from(file.data!.buffer);
    zip.file(file.filename!, fileData);

    const zipped = await zip.generateAsync({ type: "nodebuffer" });
    const newFile = new FileModel({
      filename:
        file.filename?.slice(0, file.filename.lastIndexOf(".")) + ".zip",
      data: zipped,
      user: file.user,
      size: file.size,
      path: file.path?.slice(0, file.path.lastIndexOf(".")) + ".zip",
    });
    await newFile.save();
  }
  res.send("Compress the file successfully");
});

router.post("/folder/compress", async (req: Request, res: Response) => {
  const { user, path, folderName, parent } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  const zip = new JSZip();
  const folder = zip.folder(folderName);
  for (let i = 0; i < files.length; i++) {
    if (files[i].path?.indexOf(path) === 0 && files[i].isDeleted !== true) {
      const fileData = Buffer.from(files[i].data!.buffer);
      folder!.file(files[i].path!.slice(path.length), fileData);
    }
  }
  const zipped = await zip.generateAsync({ type: "nodebuffer" });
  const newFile = new FileModel({
    filename: folderName + ".zip",
    data: zipped,
    user: user,
    size: zipped.length,
    path: parent + folderName + ".zip",
  });
  await newFile.save();
  res.send({ message: "Compress the file successfully" });
});

router.get("/file/download/:id", async (req, res) => {
  const { id } = req.params;
  const file = await FileModel.findById(id);

  if (!file) {
    return res.status(404).send("File not found");
  }

  res.json({ data: file.data });
});

router.post("/folder/download", async (req, res) => {
  const { user, path, folderName, parent } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }
  const zip = new JSZip();
  const folder = zip.folder(folderName);
  for (let i = 0; i < files.length; i++) {
    if (files[i].path?.indexOf(path) === 0 && files[i].isDeleted !== true) {
      const fileData = Buffer.from(files[i].data.buffer);
      folder!.file(files[i].path.slice(path.length), fileData);
    }
  }
  const zipped = await zip.generateAsync({ type: "nodebuffer" });
  res.json({
    filename: folderName + ".zip",
    data: zipped,
  });
});

router.get("/file/detail/:id", async (req, res) => {
  const { id } = req.params;
  const file = await FileModel.findById(id);

  if (!file) {
    return res.status(404).send("File not found");
  }

  res.json({ data: file.data, filename: file.filename });
});

router.post("/file/rename/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newname, parent } = req.body;
  const file = await FileModel.findById(id);
  if (file) {
    const paths = file.path?.split("/");
    file.filename = newname;
    file.path = parent + newname;
    await file.save();
  }
  res.send({ message: "Rename the file successfully" });
});

router.post("/folder/rename", async (req: Request, res: Response) => {
  const { user, path, newname, parent } = req.body;
  const files = await FileModel.find({ user });
  if (!files.length) {
    res.json([]);
    return;
  }

  for (let i = 0; i < files.length; i++) {
    if (files[i].path?.indexOf(path) === 0 && files[i].isDeleted !== true) {
      files[i].filename = newname;
      files[i].path =
        parent + newname + "/" + files[i].path?.slice(path.length);
      await files[i].save();
    }
  }
  res.send({ message: "Rename the fodler successfully" });
});

export default router;
