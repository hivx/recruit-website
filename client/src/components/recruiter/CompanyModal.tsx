// src/components/CompanyModal.tsx
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl"
          >
            {children}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
