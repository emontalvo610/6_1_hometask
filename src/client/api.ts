import axios from "axios";
import JSZip from "jszip";

export const login = async (username: string, password: string) => {
  await axios.post("/api/login", { username, password });
};

export const getFiles = async (user: string) => {
  const res = await axios.post("/api/files", { user });
  return res.data;
};

export const uploadMultipleFiles = async (
  uploadFiles: FileList,
  username: string,
  parent: string
) => {
  const formData = new FormData();
  for (let i = 0; i < uploadFiles.length; i++) {
    formData.append("files", uploadFiles[i]);
  }
  formData.append("username", username);
  formData.append("parent", parent);

  const res = await axios.post("/api/uploadfiles", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const uploadFolders = async (
  uploadFiles: FileList,
  username: string,
  parent: string
) => {
  const formData = new FormData();
  const paths: string[] = [];
  for (let i = 0; i < uploadFiles.length; i++) {
    formData.append("files", uploadFiles[i]);
    paths.push(uploadFiles[i].webkitRelativePath);
  }
  formData.append("username", username);
  formData.append("parent", parent);
  formData.append("paths", paths.join(","));

  const res = await axios.post("/api/uploadfolder", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const fetchFileContent = async (id?: string) => {
  const res = await axios.get(`/api/file/${id}`);
  return res.data;
};
