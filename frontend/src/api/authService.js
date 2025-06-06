import axiosInstance from "./axiosInstance";

const register = async (userData) => {
  const response = await axiosInstance.post("/auth/register", userData);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    // You might want to store user object or role separately if needed frequently
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      })
    );
  }
  return response.data;
};

const login = async (userData) => {
  const response = await axiosInstance.post("/auth/login", userData);
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      })
    );
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    if (response.data.success && response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch current user", error);
    logout(); // Clear local storage if 'me' fails
    return null;
  }
};

const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getStoredUser,
};

export default authService;
