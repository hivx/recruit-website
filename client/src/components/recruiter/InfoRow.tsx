// src/components/recruiter/InfoRow.tsx
interface InfoRowProps {
  readonly label: string;
  readonly value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <div className="text-gray-500 font-medium">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}
