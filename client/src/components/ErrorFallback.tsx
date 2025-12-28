// src/components/ErrorFallback.tsx
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";

export function ErrorFallback({
  error,
  resetErrorBoundary,
}: Readonly<FallbackProps>) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          p-6 max-w-lg w-full
          bg-red-50 border border-red-200
          rounded-2xl shadow-lg
          space-y-4
        "
      >
        {/* ICON */}
        <motion.div
          initial={{ rotate: -8 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 14 }}
          className="flex items-center gap-2 text-red-600"
        >
          <AlertTriangle className="w-6 h-6" />
          <h2 className="font-semibold text-lg">Đã có lỗi không mong muốn</h2>
        </motion.div>

        {/* MESSAGE */}
        <pre
          className="
            text-sm whitespace-pre-wrap
            text-red-700 bg-white/60
            rounded-lg p-3
            border border-red-100
            max-h-40 overflow-auto
          "
        >
          {error instanceof Error ? error.message : String(error)}
        </pre>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={resetErrorBoundary}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-lg
              bg-white border border-gray-300
              text-gray-700 font-medium
              hover:bg-gray-50
              transition cursor-pointer
            "
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => globalThis.location.reload()}
            className="
              px-4 py-2 rounded-lg
              bg-red-600 text-white font-medium
              hover:bg-red-700
              transition cursor-pointer
            "
          >
            Tải lại trang
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
