// utils/authFlag.js
export const setAuthFlag = (ttlMs) => {
  const expiresAt = Date.now() + ttlMs;
  localStorage.setItem("authFlag", JSON.stringify({ value: true, expiresAt }));
};

export const getAuthFlag = () => {
  const raw = localStorage.getItem("authFlag");
  if (!raw) return false;

  try {
    const { value, expiresAt } = JSON.parse(raw);
    if (!value || !expiresAt) return false;

    if (Date.now() > expiresAt) {
      localStorage.removeItem("authFlag");
      return false;
    }

    return true;
  } catch {
    localStorage.removeItem("authFlag");
    return false;
  }
};
