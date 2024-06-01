import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import FileLists from "./components/FileLists";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/files" element={<FileLists />} />
      </Routes>
    </Router>
  );
}

export default App;
