const TOKEN_KEY = "access_token";

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
};

export const isLoggedIn = () => {
  return !!getToken();
};
