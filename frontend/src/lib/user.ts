export function getFirstName(fullName?: string | null): string {
  return fullName?.trim().split(/\s+/)[0] || "Student";
}

export function getInitials(fullName?: string | null): string {
  if (!fullName) return "ST";
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
