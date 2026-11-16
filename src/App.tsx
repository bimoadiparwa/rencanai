import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import PrdCreate from "./pages/PrdCreate";
import PrdEditor from "./pages/PrdEditor";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/prd/create" element={<PrdCreate />} />
      <Route path="/prd/:id" element={<PrdEditor />} />
      <Route path="/tasks/:prdId" element={<Tasks />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
