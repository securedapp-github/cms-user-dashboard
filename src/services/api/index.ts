const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("user_token");
  
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // Merge headers appropriately
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Unauthorized: clear token and redirect to login
    localStorage.removeItem("user_token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    // Attempt to parse standard error from response
    let errorMsg = 'An API error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {
      // JSON parse failed, use fallback
    }
    throw new Error(errorMsg);
  }

  // Not all responses will have a body (e.g. 204 No Content), but assuming most do
  try {
    return await response.json();
  } catch {
    return null; // For empty bodies
  }
};
