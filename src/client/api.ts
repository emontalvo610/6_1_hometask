import axios from "axios";

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

export const deleteFile = async (id: string) => {
  await axios.delete(`/api/file/${id}`);
};

export const deleteFolder = async (user: string, path: string) => {
  await axios.post("/api/folder/delete", { user, path });
};

export const getDeletedFiles = async (user: string) => {
  const res = await axios.post("/api/deletedfiles", { user });
  return res.data;
};

export const restoreFile = async (id: string) => {
  await axios.put(`/api/file/${id}`);
};

export const restoreFolder = async (user: string, path: string) => {
  await axios.post("/api/folder/restore", { user, path });
};

export const compressFile = async (id: string) => {
  await axios.post(`/api/file/compress/${id}`);
};

export const compressFolder = async (
  user: string,
  path: string,
  folderName: string,
  parent: string
) => {
  await axios.post(`/api/folder/compress`, { user, path, folderName, parent });
};

export const downloadFile = async (id: string) => {
  const res = await axios.get(`/api/file/download/${id}`);
  return res.data;
};

export const downloadFolder = async (
  user: string,
  path: string,
  folderName: string,
  parent: string
) => {
  const res = await axios.post(`/api/folder/download`, {
    user,
    path,
    folderName,
    parent,
  });
  return res.data;
};

export const getFile = async (id: string) => {
  const res = await axios.get(`/api/file/detail/${id}`);
  return res.data;
};

export const renameFile = async (
  id: string,
  newname: string,
  parent: string
) => {
  await axios.post(`/api/file/rename/${id}`, { newname, parent });
};

export const renameFolder = async (
  user: string,
  path: string,
  newname: string,
  parent: string
) => {
  await axios.post(`/api/folder/rename`, { user, path, newname, parent });
};
