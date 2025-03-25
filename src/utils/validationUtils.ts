
/**
 * Validates a Facebook page URL or username
 * @param url The Facebook page URL or username to validate
 * @returns An object containing validation result and error message if any
 */
export const validateFacebookPageUrl = (url: string): { isValid: boolean; errorMessage: string | null } => {
  if (!url) return { isValid: false, errorMessage: "Facebook page URL is required" };
  
  let pageName = url;
  
  try {
    if (url.includes('facebook.com/')) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        pageName = pathParts[0];
      }
    } else if (url.includes('/')) {
      pageName = url.split('/').filter(Boolean)[0];
    }
  } catch (e) {
    console.log("URL parsing failed, using original input for validation");
  }
  
  if (pageName.length < 5 || pageName.length > 30) {
    return { 
      isValid: false, 
      errorMessage: "Page name must be between 5 and 30 characters long" 
    };
  }
  
  const validRegex = /^[a-zA-Z0-9._]+$/;
  if (!validRegex.test(pageName)) {
    return { 
      isValid: false, 
      errorMessage: "Page name can only contain letters, numbers, periods, and underscores" 
    };
  }
  
  return { isValid: true, errorMessage: null };
};
