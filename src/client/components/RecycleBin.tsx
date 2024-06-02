import { useState, useEffect } from "react";

import { getDeletedFiles, restoreFile, restoreFolder } from "../api";
import { generateTree, isObjectEmpty } from "../utils";
import { Link } from "react-router-dom";

const RecycleBin = () => {
  const [username] = useState(localStorage.getItem("user") ?? "");
  const [files, setFiles] = useState({});
  const [currentFolder, setCurrentFolder] = useState("");
  const [currentFiles, setCurrentFiles] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      const data = await getDeletedFiles(username);
      setFiles(generateTree(data));
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await getDeletedFiles(username);
      setFiles(generateTree(data));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
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

  const onClickRestore = async (key: string) => {
    if (isObjectEmpty(currentFiles[key])) {
      await restoreFile(currentFiles[key].file.id);
      const data = await getDeletedFiles(username);
      setFiles(generateTree(data));
    } else {
      await restoreFolder(username, currentFolder + key);
      const data = await getDeletedFiles(username);
      setFiles(generateTree(data));
    }
  };

  return (
    <div>
      <h2>Recycle Bin</h2>
      <div>
        <Link to="/filelist">Back</Link>
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
            {Object.keys(currentFiles).map((file) => (
              <tr key={file}>
                <td onClick={() => onClickItem(file)}>{file}</td>
                <td>
                  <button onClick={() => onClickRestore(file)}>Restore</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecycleBin;
