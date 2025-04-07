/**
 * Validates a Facebook page URL (must be a valid Facebook URL)
 * @param url The Facebook page URL to validate
 * @returns An object containing validation result and error message if any
 */
export const validateFacebookPageUrl = (
  url: string
): { isValid: boolean; errorMessage: string | null } => {
  if (!url) {
    return {
      isValid: false,
      errorMessage: "Facebook page URL is required",
    };
  }

  let urlObj: URL;

  try {
    urlObj = new URL(url);
  } catch {
    return {
      isValid: false,
      errorMessage: "Invalid URL format",
    };
  }

  const isFacebookDomain = urlObj.hostname.includes("facebook.com");

  if (!isFacebookDomain) {
    return {
      isValid: false,
      errorMessage: "URL must be from facebook.com",
    };
  }

  const pathParts = urlObj.pathname.split("/").filter(Boolean);

  if (pathParts.length === 0) {
    return {
      isValid: false,
      errorMessage: "URL must include a page name",
    };
  }

  const pageName = pathParts[0];

  if (pageName.length < 5 || pageName.length > 30) {
    return {
      isValid: false,
      errorMessage: "Page name must be between 5 and 30 characters long",
    };
  }

  const validRegex = /^[a-zA-Z0-9._]+$/;
  if (!validRegex.test(pageName)) {
    return {
      isValid: false,
      errorMessage:
        "Page name can only contain letters, numbers, periods, and underscores",
    };
  }

  return {
    isValid: true,
    errorMessage: null,
  };
};
