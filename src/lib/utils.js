export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name = "Guest User") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(value) {
  if (!value) return "Flexible";
  if (value instanceof Date && Number.isNaN(value.getTime())) return "Flexible";

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(parsed);
}

export function totalStops(trip) {
  return trip?.days?.reduce((sum, day) => sum + (day.stops?.length || 0), 0) || 0;
}
