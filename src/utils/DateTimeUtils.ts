export const convertToMexicoCityTime = (date: Date): Date => {
  return new Date(
    date.toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );
};

export const formatDateInMexicoCityTime = (
  date: Date,
  options: Intl.DateTimeFormatOptions
): string => {
  return date.toLocaleDateString("es-MX", {
    ...options,
    timeZone: "America/Mexico_City",
  });
};

export const formatConfirmedDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  };
  return date.toLocaleDateString("es-MX", options);
};
