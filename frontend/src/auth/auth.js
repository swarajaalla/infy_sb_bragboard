export function saveUser(data) {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function logout() {
  localStorage.clear();
}
