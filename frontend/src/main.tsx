import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers";
import App from "@/app/App";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import "@/index.css";

// StrictMode intentionally omitted here because its development-only double mount made
// auth bootstrap and data-heavy pages appear substantially slower during local testing.
createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary><AppProviders><App /></AppProviders></AppErrorBoundary>,
);
