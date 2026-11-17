// Pre-hydration theme + language: avoids dark-mode flash and lang mismatch.
(function () {
  try {
    var store = JSON.parse(localStorage.getItem("rencanai-store") || "{}");
    var theme = (store.state && store.state.theme) || "system";
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
