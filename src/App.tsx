import { HashRouter, Routes, Route } from "react-router-dom";
import Agent from "./pages/Agent";
import TestSend from "./pages/TestSend";
import Settings from "./pages/Settings";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<div>HOME</div>} />
        <Route path="/agent/:id" element={<Agent />} />
        <Route path="/send" element={<TestSend />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
