import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import PrdCreate from "./pages/PrdCreate";
import PrdEditor from "./pages/PrdEditor";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";
import { useStore } from "./store/useStore";
import { applyTheme, watchSystemTheme } from "./theme";

export default function App() {
  const theme = useStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
    return watchSystemTheme(() => useStore.getState().theme);
  }, [theme]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/prd/create" element={<PrdCreate />} />
        <Route path="/prd/:id" element={<PrdEditor />} />
        <Route path="/tasks/:prdId" element={<Tasks />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
