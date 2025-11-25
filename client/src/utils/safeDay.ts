export function safeDate(input: string | null): Date | null {
  if (!input) return null;

  // Convert MySQL datetime ("2025-11-15 18:29:37.288") → ISO ("2025-11-15T18:29:37.288")
  const iso = input.replace(" ", "T");

  const d = new Date(iso);

  // ESLint-compliant
  return Number.isNaN(d.getTime()) ? null : d;
}
