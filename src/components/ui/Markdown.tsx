import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { useLang } from "../../i18n";

export function Markdown({ text }: { text: string }) {
  const { t } = useLang();
  return (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{text || t("ui.emptyDoc")}</ReactMarkdown>
    </div>
  );
}
