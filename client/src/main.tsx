import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { AppProviders } from "@/providers";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // Có thể thêm logic reset state toàn cục nếu cần
          globalThis.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
    </AppProviders>
  </StrictMode>
);
