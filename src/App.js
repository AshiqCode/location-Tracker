import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Login";
import Admin from "./Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
