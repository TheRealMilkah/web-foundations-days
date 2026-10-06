const textarea = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeBtn = document.querySelector("#theme-toggle");
const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";
function updateCounts() {
  const len = textarea.value.length;
  charCount.textContent = `${len} / 200 characters`;
  charCount.classList.remove("warning","over");
  if (len > 200) charCount.classList.add("over");
  else if (len > 180) charCount.classList.add("warning");
  const trimmed = textarea.value.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  wordCount.textContent = `${words} words`;
}
function clearAll() {
  textarea.value = "";
  updateCounts();
  localStorage.removeItem(DRAFT_KEY);
  textarea.focus();
}
textarea.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem(DRAFT_KEY, textarea.value);
});
clearBtn.addEventListener("click", clearAll);
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Escape") clearAll();
});
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeBtn.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});
const saved = localStorage.getItem(DRAFT_KEY);
if (saved) textarea.value = saved;
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "Light mode";
}
updateCounts();