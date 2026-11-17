// Pre-hydration theme + language: avoids dark-mode flash and lang mismatch.
(function () {
  try {
    var parsed;
    try {
      parsed = JSON.parse(localStorage.getItem("rencanai-store") || "{}");
    } catch (e) {
      parsed = null;
    }
    var state =
      parsed && typeof parsed === "object" && parsed.state && typeof parsed.state === "object"
        ? parsed.state
        : {};
    var theme = state.theme;
    if (theme !== "light" && theme !== "dark" && theme !== "system") {
      theme = "system";
    }
    var dark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0a0a0b" : "#fafafa");
    var lang = localStorage.getItem("rencanai-lang");
    if (lang === "en" || lang === "id") document.documentElement.lang = lang;
  } catch (e) {}
})();
