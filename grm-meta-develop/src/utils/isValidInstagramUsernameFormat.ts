export const isValidInstagramUsernameFormat = (username: string): boolean => {
  
  const trimmedUsername = username.trim();
  
 
  if (/\s+$|\/$/.test(username)) {
    return false;
  }

  
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
  return instagramRegex.test(trimmedUsername);
};