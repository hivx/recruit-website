// src/components/Loader.tsx
type LoaderProps = Readonly<{
  size?: number;
}>;

export function Loader({ size = 24 }: LoaderProps) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
      style={{ width: size, height: size }}
    />
  );
}
