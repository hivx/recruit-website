// src/components/ErrorFallback.tsx
import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({ error, resetErrorBoundary }: Readonly<FallbackProps>) {
  return (
    <div className="p-6 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-xl space-y-3">
      <h2 className="text-red-600 font-semibold text-lg">Đã có lỗi không mong muốn</h2>
      <pre className="text-sm whitespace-pre-wrap text-red-700">{error?.message}</pre>
      <div className="flex gap-2">
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50"
        >
          Thử lại
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-600 text-white"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
