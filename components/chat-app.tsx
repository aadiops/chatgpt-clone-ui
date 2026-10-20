@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0b1020;
  --bg-alt: #111827;
  --panel: #111827;
  --panel-strong: #1f2937;
  --sidebar: #111827;
  --sidebar-soft: #1f2937;
  --surface: rgba(255, 255, 255, 0.04);
  --surface-strong: rgba(255, 255, 255, 0.08);
  --line: rgba(255, 255, 255, 0.08);
  --text: #f3f4f6;
  --text-muted: #94a3b8;
  --accent: #10a37f;
  --accent-2: #65d6ad;
  --shadow: rgba(15, 23, 42, 0.5);
}

html,
body {
  margin: 0;
  min-height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

body {
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

button,
input,
textarea,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.chat-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.chat-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.chat-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.chat-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 9999px;
}

.prose {
  color: #e5e7eb;
  line-height: 1.7;
}

.prose p,
.prose ul,
.prose ol,
.prose pre,
.prose blockquote,
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  margin-top: 0;
  margin-bottom: 0.8rem;
}

.prose code {
  background: rgba(148, 163, 184, 0.12);
  color: #f9fafb;
  padding: 0.12rem 0.35rem;
  border-radius: 0.35rem;
  font-size: 0.92em;
}

.prose pre {
  background: #0f172a;
  border: 1px solid rgba(148,163,184,0.2);
  border-radius: 0.8rem;
  padding: 1rem;
  overflow-x: auto;
}

.prose pre code {
  background: transparent;
  padding: 0;
}

.prose a {
  color: #67e8f9;
  text-decoration: underline;
}

.prose blockquote {
  border-left: 3px solid rgba(148,163,184,0.6);
  color: #cbd5e1;
  padding-left: 1rem;
}

.prose table {
  width: 100%;
  border-collapse: collapse;
}

.prose th,
.prose td {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 0.75rem;
}
