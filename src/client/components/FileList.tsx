import { useState, useEffect, ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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

const FileList = () => {
  const [username] = useState(localStorage.getItem("user") ?? "");
  const [files, setFiles] = useState({});
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadFolder, setUploadFolder] = useState<FileList | null>(null);
  const [currentFolder, setCurrentFolder] = useState(
    localStorage.getItem("currentFolder") ?? ""
  );
  const [currentFiles, setCurrentFiles] = useState({});
  const [newname, setNewName] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFiles = async () => {
      const data = await getFiles(username);
      setFiles(generateTree(data));
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (Object.keys(files).length) {
      localStorage.setItem("currentFolder", currentFolder);
      const paths = currentFolder.split("/");
      let result = { ...files };
      paths
        .filter((path) => path !== "")
        .forEach((path) => {
          result = (result as Record<string, any>)[path];
        });
      setCurrentFiles(result);
    }
  }, [currentFolder, files]);

  const onChangeFiles = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(e.target.files);
  };

  const onChangeFolder = (e: ChangeEvent<HTMLInputElement>) => {
    setUploadFolder(e.target.files);
  };

  const onClickUploadFiles = async () => {
    if (uploadFiles === null) {
      alert("Choose files");
      return;
    }
    await uploadMultipleFiles(uploadFiles, username, currentFolder);
    const data = await getFiles(username);
    setFiles(generateTree(data));
  };

  const onClickUploadFolder = async () => {
    if (uploadFolder === null) {
      alert("Choose folder");
      return;
    }
    await uploadFolders(uploadFolder, username, currentFolder);
    const data = await getFiles(username);
    setFiles(generateTree(data));
  };

  const onClickItem = (key: string) => {
    if (key.indexOf(".") === -1) {
      setCurrentFolder((prev) => `${prev}${key}/`);
    } else {
      navigate(`/filedetail/${currentFiles[key].file.id}`);
    }
  };

  const onClickParent = () => {
    const paths = currentFolder.split("/").filter((path) => path !== "");
    setCurrentFolder(
      paths.length > 1 ? paths.slice(0, -1).join("/") + "/" : ""
    );
  };

  const onClickDelete = async (key: string) => {
    if (isObjectEmpty(currentFiles[key])) {
      await deleteFile(currentFiles[key].file.id);
      const data = await getFiles(username);
      setFiles(generateTree(data));
    } else {
      await deleteFolder(username, currentFolder + key);
      const data = await getFiles(username);
      setFiles(generateTree(data));
    }
  };

  const onClickCompress = async (key: string) => {
    if (isObjectEmpty(currentFiles[key])) {
      await compressFile(currentFiles[key].file.id);
      const data = await getFiles(username);
      setFiles(generateTree(data));
    } else {
      await compressFolder(
        username,
        currentFolder + key + "/",
        key,
        currentFolder
      );
      const data = await getFiles(username);
      setFiles(generateTree(data));
    }
  };

  const onClickDownload = async (key: string) => {
    if (isObjectEmpty(currentFiles[key])) {
      const data = await downloadFile(currentFiles[key].file.id);
      const dataArray = new Uint8Array(data.data.data);
      const blob = new Blob([dataArray]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      const data = await downloadFolder(
        username,
        currentFolder + key + "/",
        key,
        currentFolder
      );
      const dataArray = new Uint8Array(data.data.data);
      const blob = new Blob([dataArray]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) =>
    setNewName(e.target.value);

  const onClickRename = async (key: string) => {
    if (isObjectEmpty(currentFiles[key])) {
      await renameFile(currentFiles[key].file.id, newname, currentFolder);
      const data = await getFiles(username);
      setFiles(generateTree(data));
    } else {
      await renameFolder(
        username,
        currentFolder + key + "/",
        newname,
        currentFolder
      );
      const data = await getFiles(username);
      setFiles(generateTree(data));
    }
  };

  return (
    <div>
      <div>
        <label>Files</label>
        <input type="file" onChange={onChangeFiles} multiple />
        <button onClick={onClickUploadFiles}>Upload Files</button>
      </div>
      <div>
        <label>Folder</label>
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={onChangeFolder}
        />
        <button onClick={onClickUploadFolder}>Upload Folder</button>
      </div>
      <div>
        <input value={newname} onChange={onChangeName} />
      </div>
      <div>
        <Link to="/recyclebin">Trash Bin</Link>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentFolder !== "" && (
              <tr>
                <td onClick={onClickParent}>..</td>
              </tr>
            )}
            {Object.keys(currentFiles)?.map((file) => (
              <tr key={file}>
                <td onClick={() => onClickItem(file)}>{file}</td>
                <td>
                  <button onClick={() => onClickDelete(file)}>Delete</button>
                  <button onClick={() => onClickRename(file)}>Rename</button>
                  <button onClick={() => onClickCompress(file)}>
                    Compress
                  </button>
                  <button onClick={() => onClickDownload(file)}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileList;
