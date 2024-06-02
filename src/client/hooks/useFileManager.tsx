import { useState, useEffect, ChangeEvent } from "react";
import {
  getFiles,
  uploadMultipleFiles,
  uploadFolders,
  deleteFile,
  deleteFolder,
  compressFile,
  compressFolder,
  downloadFile,
  downloadFolder,
  renameFile,
  renameFolder,
} from "../api";
import { generateTree, isObjectEmpty } from "../utils";

const useFileManager = (username: string) => {
  const [files, setFiles] = useState({});
  const [currentFolder, setCurrentFolder] = useState(
    localStorage.getItem("currentFolder") ?? ""
  );
  const [currentFiles, setCurrentFiles] = useState({});
  const [newName, setNewName] = useState("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadFolder, setUploadFolder] = useState<FileList | null>(null);

  const fetchFiles = async () => {
    const data = await getFiles(username);
    setFiles(generateTree(data));
  };

  const updateCurrentFiles = () => {
    if (Object.keys(files).length) {
      localStorage.setItem("currentFolder", currentFolder);
      const paths = currentFolder.split("/").filter((path) => path !== "");
      let result = { ...files };
      paths.forEach((path) => {
        result = (result as Record<string, any>)[path];
      });
      setCurrentFiles(result);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [username]);

  useEffect(() => {
    updateCurrentFiles();
  }, [currentFolder, files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(e.target.files);
  };

  const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadFolder(e.target.files);
  };

  const handleFileUpload = async () => {
    if (!uploadFiles) {
      alert("Choose files");
      return;
    }
    await uploadMultipleFiles(uploadFiles, username, currentFolder);
    await fetchFiles();
  };

  const handleFolderUpload = async () => {
    if (!uploadFolder) {
      alert("Choose folder");
      return;
    }
    await uploadFolders(uploadFolder, username, currentFolder);
    await fetchFiles();
  };

  const handleItemClick = (key: string, navigate: (path: string) => void) => {
    if (key.includes(".")) {
      navigate(`/filedetail/${currentFiles[key].file.id}`);
    } else {
      setCurrentFolder((prev) => `${prev}${key}/`);
    }
  };

  const handleParentClick = () => {
    const paths = currentFolder.split("/").filter((path) => path !== "");
    setCurrentFolder(
      paths.length > 1 ? paths.slice(0, -1).join("/") + "/" : ""
    );
  };

  const handleDelete = async (key: string) => {
    const isFile = isObjectEmpty(currentFiles[key]);
    if (isFile) {
      await deleteFile(currentFiles[key].file.id);
    } else {
      await deleteFolder(username, `${currentFolder}${key}`);
    }
    await fetchFiles();
  };

  const handleCompress = async (key: string) => {
    const isFile = isObjectEmpty(currentFiles[key]);
    if (isFile) {
      await compressFile(currentFiles[key].file.id);
    } else {
      await compressFolder(
        username,
        `${currentFolder}${key}/`,
        key,
        currentFolder
      );
    }
    await fetchFiles();
  };

  const handleDownload = async (key: string) => {
    const isFile = isObjectEmpty(currentFiles[key]);
    const data = isFile
      ? await downloadFile(currentFiles[key].file.id)
      : await downloadFolder(
          username,
          `${currentFolder}${key}/`,
          key,
          currentFolder
        );

    const dataArray = new Uint8Array(data.data.data);
    const blob = new Blob([dataArray]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = isFile ? key : data.filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  };

  const handleRename = async (key: string) => {
    const isFile = isObjectEmpty(currentFiles[key]);
    if (isFile) {
      await renameFile(currentFiles[key].file.id, newName, currentFolder);
    } else {
      await renameFolder(
        username,
        `${currentFolder}${key}/`,
        newName,
        currentFolder
      );
    }
    await fetchFiles();
  };

  return {
    files,
    currentFiles,
    currentFolder,
    newName,
    handleFileChange,
    handleFolderChange,
    handleFileUpload,
    handleFolderUpload,
    handleItemClick,
    handleParentClick,
    handleDelete,
    handleCompress,
    handleDownload,
    handleNameChange,
    handleRename,
  };
};

export default useFileManager;
