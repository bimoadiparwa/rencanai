// Defense-in-depth: strip dangerous constructs from a markdown string before it is
// persisted (localStorage). Rendering is hardened separately in Markdown.tsx via
// rehype-sanitize, which is the real XSS sink. This layer keeps the stored string
// free of executable payloads even if a future render path skips rehype-sanitize.
export function sanitizeMarkdown(text: string): string {
  return text
    // Remove <script>...</script> blocks entirely.
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    // Remove quoted inline event handlers: onerror="...", onload='...', etc.
    .replace(/\bon\w+\s*=(["'])[\s\S]*?\1/gi, "")
    // Remove unquoted inline event handlers: onerror=alert(1)
    .replace(/\bon\w+\s*=[^\s"'<>]+/gi, "")
    // Neutralize script-ish URL schemes.
    .replace(/(?:javascript|vbscript|data):\s*/gi, "");
}
