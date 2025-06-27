
export default function getDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  };
  return date.toLocaleDateString(undefined, options);
}
