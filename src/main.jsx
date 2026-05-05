import React from "react";
import { createRoot } from "react-dom/client";
import Hossegor2026 from "../Hossegor2026.jsx";
import "./styles.css";

const BUILD_TIME =
  typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "dev";
const STORAGE_KEY = "hossegor-2026-activities";

function summarizeStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
    const sizeKB = (new Blob([raw]).size / 1024).toFixed(1);
    let count = "?";
    try {
      const parsed = JSON.parse(raw || "[]");
      if (Array.isArray(parsed)) count = parsed.length;
    } catch {
      count = "JSON invalide";
    }
    return { sizeKB, count, preview: raw.slice(0, 400) };
  } catch (e) {
    return { sizeKB: "?", count: "?", preview: `read failed: ${e.message}` };
  }
}

function DiagFallback({ error, componentStack }) {
  const storage = summarizeStorage();
  const report = [
    `BUILD: ${BUILD_TIME}`,
    `UA: ${navigator.userAgent}`,
    `URL: ${location.href}`,
    `Standalone: ${window.matchMedia("(display-mode: standalone)").matches}`,
    "",
    `ERROR: ${error?.message ?? String(error)}`,
    error?.source ? `SOURCE: ${error.source}` : "",
    "",
    "STACK:",
    error?.stack ?? "(no stack)",
    "",
    "COMPONENT STACK:",
    componentStack ?? "(no component stack)",
    "",
    `LOCALSTORAGE: ${storage.sizeKB} KB, ${storage.count} activités`,
    `PREVIEW: ${storage.preview}`,
  ]
    .filter(Boolean)
    .join("\n");

  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = report;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        alert("Impossible de copier — sélectionne le texte manuellement.");
      }
      document.body.removeChild(ta);
    }
  };

  const reset = () => {
    if (!window.confirm("Effacer toutes les données locales et recharger ?"))
      return;
    try {
      window.localStorage.clear();
    } catch {}
    location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        color: "#1b4332",
        padding: "20px",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "14px",
        lineHeight: 1.4,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
        Crash diagnostique
      </h1>
      <p style={{ marginBottom: 16, color: "#52796f" }}>
        L'app a planté. Copie le rapport ci-dessous et envoie-le pour analyse.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={copy}
          style={{
            flex: 1,
            background: "#2d6a4f",
            color: "white",
            border: 0,
            padding: "12px 16px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {copied ? "✓ Copié" : "Copier le rapport"}
        </button>
        <button
          onClick={reset}
          style={{
            flex: 1,
            background: "#ef476f",
            color: "white",
            border: 0,
            padding: "12px 16px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          Réinitialiser
        </button>
      </div>

      <pre
        style={{
          background: "#f0f7f4",
          padding: 12,
          borderRadius: 8,
          fontSize: 11,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: "60vh",
          overflow: "auto",
          border: "1px solid #d8eadf",
        }}
      >
        {report}
      </pre>
    </div>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, componentStack: null };
    this.onError = (event) => {
      if (this.state.error) return;
      const err = event.error ?? new Error(event.message || "window.error");
      err.source = `${event.filename}:${event.lineno}:${event.colno}`;
      this.setState({ error: err });
    };
    this.onRejection = (event) => {
      if (this.state.error) return;
      const reason = event.reason;
      const err =
        reason instanceof Error
          ? reason
          : new Error(
              typeof reason === "string" ? reason : JSON.stringify(reason),
            );
      this.setState({ error: err });
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, componentStack: info?.componentStack });
  }

  componentDidMount() {
    window.addEventListener("error", this.onError);
    window.addEventListener("unhandledrejection", this.onRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.onError);
    window.removeEventListener("unhandledrejection", this.onRejection);
  }

  render() {
    if (this.state.error) {
      return (
        <DiagFallback
          error={this.state.error}
          componentStack={this.state.componentStack}
        />
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Hossegor2026 />
    </AppErrorBoundary>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}
