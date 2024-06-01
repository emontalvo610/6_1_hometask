import { useState, useEffect, ChangeEvent } from "react";

import { getFiles, upalodMultipleFiles, upalodFolder } from "../api";

interface FileItem {
  filename: string;
  size: number;
  id: string;
  path: string;
}

interface User {
  id: string;
  username: string;
}

const isObjectEmpty = (obj: object) => {
  const keys = Object.keys(obj);
  return keys.length === 1 && keys[0] === "file";
};

const generateTree = (filePaths) => {
  const tree = {};

  filePaths.forEach((filePath) => {
    const pathParts = filePath.path.split("/");
    let currentNode = tree;

    pathParts.forEach((part, index) => {
      if (!currentNode[part]) {
        currentNode[part] =
          index === pathParts.length - 1 ? { file: filePath } : {};
      }
      currentNode = currentNode[part];
    });
  });

  // Sorting the keys (folders first, sorted alphabetically)
  const sortKeys = (node) => {
    const keys = Object.keys(node);
    keys.sort((a, b) => {
      if (!isObjectEmpty(node[a]) && isObjectEmpty(node[b])) {
        return -1; // Folder before file
      } else if (isObjectEmpty(node[a]) && !isObjectEmpty(node[b])) {
        return 1; // File after folder
      } else {
        return a.localeCompare(b, undefined, { sensitivity: "base" }); // Sort alphabetically ignoring case
      }
    });

    return keys;
  };

  // Recursively sort the tree structure
  const sortTree = (node) => {
    const sortedKeys = sortKeys(node);
    sortedKeys.forEach((key) => {
      if (!isObjectEmpty(node[key])) {
        node[key] = sortTree(node[key]);
      }
    });

    return sortedKeys.reduce((sortedNode, key) => {
      sortedNode[key] = node[key];
      return sortedNode;
    }, {});
  };

  return sortTree(tree);
};

const FileLists = () => {
  const [username] = useState(localStorage.getItem("user") ?? "");
  const [files, setFiles] = useState({});
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadFolder, setUploadFolder] = useState<FileList | null>(null);
  const [currentFolder, setCurrentFolder] = useState("");
  const [currentFiles, setCurrentFiles] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      const data = await getFiles(username);
      setFiles(generateTree(data));
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const paths = currentFolder.split("/");
    let result = { ...files };
    paths
      .filter((path) => path !== "")
      .forEach((path) => {
        result = (result as Record<string, any>)[path];
      });
    setCurrentFiles(result);
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
    await upalodMultipleFiles(uploadFiles, username, currentFolder);
    const data = await getFiles(username);
    setFiles(generateTree(data));
  };

  const onClickUploadFolder = async () => {
    if (uploadFolder === null) {
      alert("Choose folder");
      return;
    }
    await upalodFolder(uploadFolder, username, currentFolder);
    const data = await getFiles(username);
    setFiles(generateTree(data));
  };

  const onClickItem = (key: string) => {
    if (key.indexOf(".") === -1) {
      setCurrentFolder((prev) => `${prev}${key}/`);
    }
  };

  const onClickParent = () => {
    const paths = currentFolder.split("/").filter((path) => path !== "");
    setCurrentFolder(
      paths.length > 1 ? paths.slice(0, -1).join("/") + "/" : ""
    );
  };

  console.log(currentFolder);

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
        <table>
          <thead>
            <tr>
              <th>Filename</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td onClick={onClickParent}>..</td>
            </tr>
            {Object.keys(currentFiles).map((file) => (
              <tr key={file}>
                <td onClick={() => onClickItem(file)}>{file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileLists;
