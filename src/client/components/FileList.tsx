import { Link, useNavigate } from "react-router-dom";
import useFileManager from "../hooks/useFileManager";

const FileList = () => {
  const username = localStorage.getItem("user") ?? "";
  const navigate = useNavigate();

  const {
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
  } = useFileManager(username);

  return (
    <div>
      <div>
        <label>Files</label>
        <input type="file" onChange={handleFileChange} multiple />
        <button onClick={handleFileUpload}>Upload Files</button>
      </div>
      <div>
        <label>Folder</label>
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFolderChange}
        />
        <button onClick={handleFolderUpload}>Upload Folder</button>
      </div>
      <div>
        <input value={newName} onChange={handleNameChange} />
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
            {currentFolder && (
              <tr>
                <td onClick={handleParentClick}>..</td>
              </tr>
            )}
            {Object.keys(currentFiles).map((file) => (
              <tr key={file}>
                <td onClick={() => handleItemClick(file, navigate)}>{file}</td>
                <td>
                  <button onClick={() => handleDelete(file)}>Delete</button>
                  <button onClick={() => handleRename(file)}>Rename</button>
                  <button onClick={() => handleCompress(file)}>Compress</button>
                  <button onClick={() => handleDownload(file)}>Download</button>
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
