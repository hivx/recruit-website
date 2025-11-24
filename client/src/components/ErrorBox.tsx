type Props = Readonly<{
  message?: string;
  onRetry?: () => void;
}>;

export function ErrorBox({ message = "Có lỗi xảy ra.", onRetry }: Props) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-4">
      <div>
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg bg-red-600 text-black text-sm"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
