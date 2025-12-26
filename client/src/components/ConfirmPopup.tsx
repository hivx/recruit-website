// src/components/ConfirmPopup.tsx
export interface ConfirmPopupProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly loading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmPopup({
  open,
  title,
  message,
  confirmText = "Xóa",
  cancelText = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>

        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg bg-red-600 text-white
              hover:bg-red-700 disabled:opacity-60
            "
          >
            {loading ? "Đang xóa..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
