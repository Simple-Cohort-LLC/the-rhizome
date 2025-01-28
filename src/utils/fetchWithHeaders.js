export const fetchWithHeaders = async (url, options = {}) => {
  const defaultHeaders = {
    "x-api-key": process.env.EXPO_PUBLIC_API_KEY,
    "content-type": "application/json",
  };
  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
    },
  };

  const res = await fetch(url, mergedOptions);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res;
};
