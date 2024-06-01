import { useState, useEffect, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchFileContent } from "../api";

// import { deleteFile, getFile, renameFile } from "../api";

interface FileDetail {
  filename: string;
  data: any;
  user: string;
  size: Number;
}

const FileDetailPage = () => {
  const { id } = useParams();
  const [file, setFile] = useState<FileDetail>({} as FileDetail);
  useEffect(() => {
    const fetchFile = async () => {
      const data = await fetchFileContent(id ?? "");
      console.log({ data });
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
      {file.filename && file?.filename.slice(-3) === "txt" && (
        <div>{getTextContent()}</div>
      )}
      {file.filename &&
        (file.filename.slice(-3) === "jpg" ||
          file.filename.slice(-3) === "png") && <img src={getImageUrl()} />}
    </div>
  );
};

export default FileDetailPage;
