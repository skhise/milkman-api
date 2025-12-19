export const getEnv = (key, fallback) => {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value ?? fallback ?? '';
};
