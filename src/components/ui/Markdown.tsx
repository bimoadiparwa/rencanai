import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLang } from "../../i18n";

export function Markdown({ text }: { text: string }) {
  const { t } = useLang();
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || t("ui.emptyDoc")}</ReactMarkdown>
    </div>
  );
}
