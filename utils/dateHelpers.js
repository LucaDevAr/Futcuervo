// Configuración de zona horaria de Argentina
const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";

export const getArgentinaDate = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: ARGENTINA_TIMEZONE })
  );
};

export const getArgentinaDateString = () => {
  const argDate = getArgentinaDate();
  return argDate.toLocaleDateString("sv-SE"); // YYYY-MM-DD format
};

export const isToday = (date) => {
  if (!date) return false;

  const today = getArgentinaDate();
  const checkDate = new Date(date);

  return (
    today.getFullYear() === checkDate.getFullYear() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getDate() === checkDate.getDate()
  );
};

export const isYesterday = (date) => {
  if (!date) return false;

  const yesterday = getArgentinaDate();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);

  return (
    yesterday.getFullYear() === checkDate.getFullYear() &&
    yesterday.getMonth() === checkDate.getMonth() &&
    yesterday.getDate() === checkDate.getDate()
  );
};
