export function formatDate(iso: string): { day: string; time: string; full: string } {
  const date = new Date(iso);
  const day = date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { day, time, full: `${day} at ${time}` };
}
