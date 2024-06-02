import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { getFile } from "../api";

interface FileDetail {
  filename: string;
  data: any;
}

const FileDetail = () => {
  const { id } = useParams();
  const [file, setFile] = useState<FileDetail>({} as FileDetail);
  const navigate = useNavigate();

  if (!localStorage.getItem("user")) {
    alert("User is not authorized.");
    navigate("/");
    return;
  }

  useEffect(() => {
    const fetchFile = async () => {
      const data = await getFile(id ?? "");
      setFile(data);
    };
    fetchFile();
  }, []);

  const getTextContent = () => {
    const uint8Array = new Uint8Array(file.data.data);
    const textDecoder = new TextDecoder("utf-8");
    return textDecoder.decode(uint8Array);
  };

  const getImageUrl = () => {
    const uint8Array = new Uint8Array(file.data.data);
    const blob = new Blob([uint8Array], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
  };

  return (
    <div>
      <div>{file.filename}</div>
      <div>
        <Link to="/filelist">Back</Link>
      </div>
      {file.filename && file?.filename.slice(-3) === "txt" && (
        <div>{getTextContent()}</div>
      )}
      {file.filename &&
        (file.filename.slice(-3) === "jpg" ||
          file.filename.slice(-3) === "png") && <img src={getImageUrl()} />}
    </div>
  );
};

export default FileDetail;
