// src/utils/myToast.tsx
export function Toast({ message }: Readonly<{ message: string }>) {
  return (
    <div
      className="
      fixed bottom-6 right-6 z-50
      bg-green-600 text-white
      px-5 py-3 rounded-xl shadow-lg
      animate-fade-in-up
    "
    >
      {message}
    </div>
  );
}
