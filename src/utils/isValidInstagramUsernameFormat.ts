export const isValidInstagramUsernameFormat = (username: string): boolean => {
  const trimmed = username.trim();

  const hasInvalidCharacters = /[@\s]/.test(trimmed);
  const looksLikeURL =
    /^https?:\/\//i.test(trimmed) || /instagram\.com/i.test(trimmed);

  return !hasInvalidCharacters && !looksLikeURL;
};
