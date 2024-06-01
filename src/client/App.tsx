import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import FileLists from "./components/FileLists";
import FileDetailPage from "./components/FileDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/files" element={<FileLists />} />
        <Route path="/file/:id" element={<FileDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
