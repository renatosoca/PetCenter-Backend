export const generateToken = (): string => {
  return Date.now().toString(32).substring(2) + Math.random().toString(32).substring(2);
};
