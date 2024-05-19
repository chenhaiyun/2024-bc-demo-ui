import { BrowserRouter, Routes, Route } from "react-router-dom";
import Agent from "./pages/Agent";
import TestSend from "./pages/TestSend";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/agent/:id" element={<Agent />} />
        <Route path="/send" element={<TestSend />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
