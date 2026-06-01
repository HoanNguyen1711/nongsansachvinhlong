// Helper to check if running in browser
const isBrowser = () => typeof window !== "undefined";

const BASE_URL = isBrowser()
  ? "" // On client-side (browser), use relative path to route through Caddy (inheriting host & HTTPS)
  : (process.env.NEXT_PUBLIC_API_URL || "http://backend:8000"); // On server-side (SSR), use backend service name

// Helper to normalize api endpoints (appending trailing slashes to root resource collections to prevent 307 redirects)
const normalizePath = (path: string): string => {
  const [routePath, queryString] = path.split("?");
  
  // Count slashes in routePath
  const slashCount = (routePath.match(/\//g) || []).length;
  
  // If it is a root resource (like "/products", "/categories", "/blogs") and not a file or sub-route
  if (slashCount === 1 && !routePath.endsWith("/") && !routePath.includes(".")) {
    const cleanPath = routePath + "/";
    return queryString ? `${cleanPath}?${queryString}` : cleanPath;
  }
  
  return path;
};

export const getAuthToken = (): string | null => {
  if (isBrowser()) {
    return localStorage.getItem("admin_token");
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (isBrowser()) {
    localStorage.setItem("admin_token", token);
  }
};

export const removeAuthToken = () => {
  if (isBrowser()) {
    localStorage.removeItem("admin_token");
  }
};

export const logoutAdmin = () => {
  removeAuthToken();
  if (isBrowser()) {
    window.location.href = "/ns-login-portal-2026";
  }
};

async function handleResponse(response: Response) {
  if (response.status === 401) {
    // Unauthorized: token expired or invalid
    logoutAdmin();
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }
  
  if (!response.ok) {
    let errorMessage = "Đã xảy ra lỗi hệ thống";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // JSON parsing failed
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

export const api = {
  async get(path: string, options: RequestOptions = {}) {
    const token = options.token !== undefined ? options.token : getAuthToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const response = await fetch(`${BASE_URL}/api${normalizePath(path)}`, {
      ...options,
      method: "GET",
      headers,
    });
    
    return handleResponse(response);
  },
  
  async post(path: string, data: any, options: RequestOptions = {}) {
    const token = options.token !== undefined ? options.token : getAuthToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const response = await fetch(`${BASE_URL}/api${normalizePath(path)}`, {
      ...options,
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  async put(path: string, data: any, options: RequestOptions = {}) {
    const token = options.token !== undefined ? options.token : getAuthToken();
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const response = await fetch(`${BASE_URL}/api${normalizePath(path)}`, {
      ...options,
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  async delete(path: string, options: RequestOptions = {}) {
    const token = options.token !== undefined ? options.token : getAuthToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const response = await fetch(`${BASE_URL}/api${normalizePath(path)}`, {
      ...options,
      method: "DELETE",
      headers,
    });
    
    return handleResponse(response);
  },
  
  async upload(path: string, file: File, options: RequestOptions = {}) {
    const token = options.token !== undefined ? options.token : getAuthToken();
    const headers = new Headers(options.headers);
    
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${BASE_URL}/api${normalizePath(path)}`, {
      ...options,
      method: "POST",
      headers,
      body: formData,
    });
    
    return handleResponse(response);
  }
};
