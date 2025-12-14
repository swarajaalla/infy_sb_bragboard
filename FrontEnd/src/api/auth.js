export async function registerUser(data) {
  try {
    console.log("Attempting to register at:", "http://127.0.0.1:8000/auth/register");
    const res = await fetch("http://127.0.0.1:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("Register response:", res.status, res.statusText);
    return res;
  } catch (error) {
    console.error("Register fetch error:", error);
    throw error;
  }
}

export async function loginUser(data) {
  try {
    console.log("Attempting to login at:", "http://127.0.0.1:8000/auth/login");
    const res = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    console.log("Login response:", res.status, res.statusText);
    return res;
  } catch (error) {
    console.error("Login fetch error:", error);
    throw error;
  }
}
