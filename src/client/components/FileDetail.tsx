import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getFile } from "../api";

interface FileDetail {
  filename: string;
  data: any;
}

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState<FileDetail | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      alert("User is not authorized.");
      navigate("/");
      return;
    }

    const fetchFile = async () => {
      try {
        const data = await getFile(id ?? "");
        setFile(data);
      } catch (error) {
        console.error("Failed to fetch file", error);
        navigate("/filelist"); // Redirect or handle error as appropriate
      }
    };

    fetchFile();
  }, [id, navigate]);

  const isTextFile = file?.filename?.endsWith(".txt");
  const isImageFile =
    file?.filename?.endsWith(".jpg") || file?.filename?.endsWith(".png");

  const getTextContent = () => {
    const uint8Array = new Uint8Array(file?.data.data);
    const textDecoder = new TextDecoder("utf-8");
    return textDecoder.decode(uint8Array);
  };

  const getImageUrl = () => {
    const uint8Array = new Uint8Array(file?.data.data);
    const blob = new Blob([uint8Array], { type: "image/jpeg" });
    return URL.createObjectURL(blob);
  };

  if (!file) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>{file.filename}</div>
      <div>
        <Link to="/filelist">Back</Link>
      </div>
      {isTextFile && <div>{getTextContent()}</div>}
      {isImageFile && <img src={getImageUrl()} alt={file.filename} />}
    </div>
  );
};

export default FileDetail;
