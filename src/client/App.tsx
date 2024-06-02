import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import FileList from "./components/FileList";
import RecycleBin from "./components/RecycleBin";
import FileDetail from "./components/FileDetail";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/filelist" element={<FileList />} />
        <Route path="/recyclebin" element={<RecycleBin />} />
        <Route path="/filedetail/:id" element={<FileDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
