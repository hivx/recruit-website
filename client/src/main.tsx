// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { ErrorBoundary } from "react-error-boundary";
import App from "@/App";
import { ErrorFallback } from "@/components";
import { AppProviders } from "@/providers";

const rootEl = document.getElementById("root");

if (!rootEl) {
  throw new Error("Root element #root not found");
}

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => globalThis.location.reload()}
      >
        <App />
      </ErrorBoundary>
    </AppProviders>
  </StrictMode>,
);
