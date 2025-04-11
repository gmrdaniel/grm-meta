export const sanitizeInputBeforeUpdate = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9._]/g, "");
};
