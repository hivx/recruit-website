// src/utils/myToast.tsx
import { createRoot } from "react-dom/client";

let root: ReturnType<typeof createRoot> | null = null;
let timer: NodeJS.Timeout | null = null;

function show(message: string, type: "success" | "error" | "info") {
  function ToastView({
    message,
    type = "success",
  }: {
    readonly message: string;
    readonly type?: "success" | "error" | "info";
  }) {
    let color = "bg-blue-600";

    if (type === "success") {
      color = "bg-green-600";
    } else if (type === "error") {
      color = "bg-red-600";
    }

    return (
      <div
        className={`
        fixed bottom-6 right-6 z-50
        ${color} text-white
        px-5 py-3 rounded-xl shadow-lg
        animate-fade-in-up
      `}
      >
        {message}
      </div>
    );
  }
  if (!root) {
    const div = document.createElement("div");
    document.body.appendChild(div);
    root = createRoot(div);
  }

  root.render(<ToastView message={message} type={type} />);

  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    root?.unmount();
    root = null;
  }, 2500);
}

export const Toast = {
  success: (msg: string) => show(msg, "success"),
  error: (msg: string) => show(msg, "error"),
  info: (msg: string) => show(msg, "info"),
};
