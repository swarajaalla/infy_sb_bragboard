// Lightweight fetch-based API wrapper to avoid requiring `axios` dependency
const BASE = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("access_token") || null;
}

async function request(method, url, data) {
  const headers = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body;
  // If caller passed URLSearchParams (form-encoded), send as-is
  if (data instanceof URLSearchParams) {
    body = data.toString();
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  } else {
    headers["Content-Type"] = "application/json";
    body = data ? JSON.stringify(data) : undefined;
  }

  const res = await fetch(BASE + url, {
    method,
    headers,
    body,
  });

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (!res.ok) throw { response: { data: json } };
    return { data: json };
  }

  if (!res.ok) throw { response: { data: await res.text() } };
  return { data: null };
}

const api = {
  get: (url) => request("GET", url),
  post: (url, data) => request("POST", url, data),
  put: (url, data) => request("PUT", url, data),
  delete: (url) => request("DELETE", url),
};

export default api;
