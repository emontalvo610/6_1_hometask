import { ChangeEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onChangeUsername = (e: ChangeEvent<HTMLInputElement>) =>
    setUsername(e.target.value);
  const onChangePassword = (e: ChangeEvent<HTMLInputElement>) =>
    setPassword(e.target.value);
  const onClickLogin = async () => {
    try {
      if (!username) {
        alert("Username is required.");
        return;
      }
      if (!password) {
        alert("Password is required.");
        return;
      }
      await login(username, password);
      localStorage.setItem("user", username);
      navigate("/files");
    } catch (error) {
      alert("Login failed");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div>
      <div>
        <label>Username: </label>
        <input value={username} onChange={onChangeUsername} />
      </div>
      <div>
        <label>Password: </label>
        <input value={password} type="password" onChange={onChangePassword} />
      </div>
      <button onClick={onClickLogin}>Log in</button>
    </div>
  );
};

export default Login;
