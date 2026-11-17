import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";

export default function KeyGuard({ children }: { children: React.ReactNode }) {
  const settings = useStore((s) => s.settings);
  const navigate = useNavigate();

  if (!settings?.apiKey) {
    navigate("/settings");
    return null;
  }

  return <>{children}</>;
}
