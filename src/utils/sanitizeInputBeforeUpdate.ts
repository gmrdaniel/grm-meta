export const sanitizeInputBeforeUpdate = (value: string): string => {
  return value.replace(/@/g, "");
};
