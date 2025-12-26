// src/components/ErrorBox.tsx
import { motion } from "framer-motion";
import { AlertCircle, RotateCcw } from "lucide-react";

type Props = Readonly<{
  message?: string;
  onRetry?: () => void;
}>;

export function ErrorBox({ message = "Có lỗi xảy ra.", onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="
        p-4
        bg-red-50 border border-red-200
        rounded-xl
        flex items-start justify-between gap-4
      "
    >
      {/* MESSAGE */}
      <div className="flex items-start gap-2 text-red-700">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>

      {/* ACTION */}
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRetry}
          className="
            inline-flex items-center gap-1.5
            px-3 py-1.5
            rounded-lg
            bg-red-600 text-white
            text-sm font-medium
            hover:bg-red-700
            transition
            shrink-0 cursor-pointer
          "
        >
          <RotateCcw className="w-4 h-4" />
          Thử lại
        </motion.button>
      )}
    </motion.div>
  );
}
