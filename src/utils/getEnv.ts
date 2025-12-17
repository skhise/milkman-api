export const getEnv = (key: string, fallback?: string) => {
  const value = process.env[key];
  if (!value && fallback === undefined) {
    throw new Error(`Missing required env var ${key}`);
  }
  return value ?? fallback ?? '';
};
