import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { makeId } from "../lib/id";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import { Markdown } from "../components/ui/Markdown";
import { EmptyState } from "../components/ui/EmptyState";
import { chatCompletion, chatSystemPrompt, type AIMessage } from "../lib/chat";
import { getProvider, resolveSettings, type ProviderId } from "../lib/providers";
import { useLang } from "../i18n";
import type { Chat } from "../types";

export default function Chat() {
  const { t, lang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const prdId = new URLSearchParams(location.search).get("prdId") ?? undefined;

  const settings = useStore((s) => s.settings);
  const chats = useStore((s) => s.chats);
  const activeChatId = useStore((s) => s.activeChatId);
  const addMessage = useStore((s) => s.addMessage);
  const setActiveChat = useStore((s) => s.setActiveChat);
  const updatePrd = useStore((s) => s.updatePrd);
  const prds = useStore((s) => s.prds);

  const prd = prdId ? prds.find((p) => p.id === prdId) : undefined;
  const activeChat = chats.find((c) => c.id === activeChatId);

  const resolved = settings ? resolveSettings(settings) : null;
  const provider: ProviderId = resolved?.provider ?? "gemini";
  const info = getProvider(provider);
  const [model, setModel] = useState(settings?.model ?? info.defaultModel);
  const modelValue = info.models.some((m) => m.id === model) ? model : info.defaultModel;

  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [assistantText, setAssistantText] = useState("");
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [chatMinimized, setChatMinimized] = useState(false);

  useEffect(() => {
    const state = useStore.getState();
    if (!prdId) {
      const mostRecent = [...state.prds].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (mostRecent) {
        navigate(`/chat?prdId=${mostRecent.id}`);
        return;
      }
      setActiveChat(null);
      return;
    }
    let chat = state.chats.find((c) => c.prdId === prdId);
    if (!chat) {
      chat = {
        id: makeId(),
        title: `${t("chat.title")} — ${prd?.title ?? ""}`,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        prdId,
      };
      state.addChat(chat);
    }
    setActiveChat(chat.id);
  }, [prdId, navigate]);

  const handleNewChat = () => {
    if (!prdId) return;
    const state = useStore.getState();
    const samePrd = state.chats.filter((c) => c.prdId === prdId).length;
    const chat: Chat = {
      id: makeId(),
      title: `${t("chat.title")} — ${prd?.title ?? ""}${samePrd ? ` (${samePrd + 1})` : ""}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      prdId,
    };
    state.addChat(chat);
    setActiveChat(chat.id);
    setAssistantText("");
    setStatus(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || streaming || !activeChat || !settings?.apiKey.trim()) return;

    const userText = text;
    setText("");
    setAssistantText("");
    setStreaming(true);
    setStatus(null);

    addMessage(activeChat.id, { role: "user", content: userText });

    const prdContext = prd?.content ? `\n\n---\n# Current PRD: ${prd.title}\n${prd.content}\n---\n` : "";

    const messages: AIMessage[] = [
      { role: "system", content: chatSystemPrompt(lang) + prdContext },
      ...activeChat.messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userText },
    ];

    const { promise } = chatCompletion({
      provider,
      apiKey: settings.apiKey.trim(),
      model: modelValue,
      messages,
      onChunk: (chunk) => setAssistantText((prev) => prev + chunk),
      onError: (err) => {
        setStreaming(false);
        setStatus({ tone: "error", text: err.message });
      },
    });
    try {
      await promise;
    } catch {
      // Errors are reported through onError.
    }
    if (streaming) {
      setStreaming(false);
      if (assistantText) {
        addMessage(activeChat.id, { role: "assistant", content: assistantText });
      }
    }
  };

  const handleApply = () => {
    if (!prd) return;
    if (!assistantText || assistantText === prd.content) return;
    if (!window.confirm(`Apply the refined PRD to "${prd.title}"?`)) return;
    updatePrd(prd.id, { content: assistantText });
    setStatus({ tone: "ok", text: `Applied refined PRD to "${prd.title}".` });
    setTimeout(() => setStatus(null), 3000);
  };

  const toneClass = {
    ok: "border-emerald-700/30 bg-emerald-50 text-emerald-900 dark:border-emerald-700/40 dark:bg-emerald-950/60 dark:text-emerald-300",
    error: "border-danger/40 bg-danger/5 text-danger",
  } as const;

  const hasChanges = Boolean(assistantText && assistantText !== prd?.content);

  if (!prd) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">
          {t("nav.tagline")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t("chat.title")}</h1>
        <EmptyState
          title={t("chat.noPrd")}
          description={t("chat.empty")}
          action={
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/dashboard">
                <Button>{t("chat.switchPrd")}</Button>
              </Link>
              <Link to="/prd/create">
                <Button>{t("dash.new")}</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
            {t("nav.tagline")}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("chat.title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("chat.prd", { title: prd.title })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={modelValue}
            onChange={setModel}
            options={info.models.map((m) => ({ label: m.label, value: m.id }))}
            label={t("chat.model")}
            className="w-auto max-w-xs"
          />
          <Button variant="ghost" onClick={handleNewChat}>
            {t("chat.newChat")}
          </Button>
          <Button onClick={handleApply} disabled={streaming || !assistantText || !hasChanges}>
            {t("chat.applyToPrd")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setChatMinimized((prev) => !prev)}
            aria-label={chatMinimized ? t("chat.show") : t("chat.hide")}
          >
            {chatMinimized ? "▸ Show chat" : "▾ Hide chat"}
          </Button>
        </div>
      </div>

      {/* PRD comparison: Original vs Refined (documents) */}
      <div className={`grid gap-6 mb-8 ${chatMinimized ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 border-b border-line pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Original PRD
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose dark:prose-invert max-w-none">
            <Markdown text={prd.content || ""} />
          </div>
        </Card>
        <Card className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 border-b border-line pb-2">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Refined PRD
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {hasChanges ? "Changed" : "No changes"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose dark:prose-invert max-w-none">
            <Markdown text={assistantText || prd.content || ""} />
          </div>
        </Card>
      </div>

      {/* Chat box - flex scrollable, minimizable */}
      {!chatMinimized && (
        <Card className="flex flex-col h-[50vh] max-h-[60vh]">
          {/* Scrollable message area */}
          <div className="flex-1 overflow-y-auto p-4">
            {!activeChat?.messages.length && !streaming && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm text-muted">{t("chat.empty")}</p>
              </div>
            )}
            {activeChat?.messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div key={i} className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                    {t(isUser ? "chat.user" : "chat.assistant")}
                  </p>
                  <div
                    className={`rounded-2xl p-3 text-sm leading-relaxed max-w-[85%] ${isUser ? "bg-stamp text-white" : "bg-card border border-line text-ink"}`}
                  >
                    <Markdown text={m.content} />
                  </div>
                </div>
              );
            })}
            {streaming && (
              <div className="mb-4 flex justify-start">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {t("chat.assistant")}
                </p>
                <div className="rounded-2xl p-3 text-sm leading-relaxed max-w-[85%] bg-card border border-line text-ink">
                  {assistantText || <span className="text-muted">{t("ui.loading")}…</span>}
                </div>
              </div>
            )}
          </div>
          {/* Fixed input at bottom */}
          <form onSubmit={handleSend} className="border-t border-line p-4 flex items-end gap-2 bg-white/5 dark:bg-card/50 backdrop-blur-sm">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("chat.input")}
              ariaLabel={t("chat.input")}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={streaming || !text.trim() || !settings?.apiKey.trim()}
              loading={streaming}
            >
              {t("chat.send")}
            </Button>
          </form>
          {status && (
            <div role="status" className={`mt-3 rounded-md border px-4 py-3 text-sm ${toneClass[status.tone]}`}>
              {status.text}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
