import axiosInstance from "./axiosInstance";

// Admin: Add a new reviewer (or user with role 'reviewer')
const addReviewer = async (userData) => {
  // userData: { username, email, password } backend sets role to 'reviewer'
  const response = await axiosInstance.post("/users/add-reviewer", userData);
  return response.data;
};

// Admin: Add a new user (general purpose, role can be specified)
// This endpoint is not explicitly in backend, but /users/:id (PUT) could set role.
// For now, we use addReviewer for specific purpose. A general add user might be:
const addUser = async (userDataWithRole) => {
  // For this to work, your backend should allow creating users with specific roles by admin
  // Let's assume your backend userController.js has a general createUserByAdmin or similar
  // or you adapt the registerUser logic to allow admin to specify role.
  // As it stands, the backend has /users/add-reviewer.
  // To make a general add user:
  // 1. Modify backend authController.registerUser to allow admin to pass role for any user.
  // 2. Or create a new admin route POST /api/users for generic user creation by admin.
  // For now, this function will be a placeholder or call register with admin privileges.

  // This is a conceptual example; needs backend support if not using add-reviewer specifically.
  // const response = await axiosInstance.post('/users', userDataWithRole); // hypothetical
  // return response.data;
  if (userDataWithRole.role === "reviewer") {
    return addReviewer(userDataWithRole);
  }
  // For other roles, requires backend adjustment or using update user on a newly registered basic user.
  console.warn(
    "General addUser with role needs backend support. Using addReviewer for 'reviewer' role."
  );
  throw new Error(
    "General addUser with role requires backend implementation or use addReviewer."
  );
};

// Admin: Get all users (can filter by role)
const getAllUsers = async (role = null) => {
  const params = role ? { role } : {};
  const response = await axiosInstance.get("/users", { params });
  return response.data;
};

// Admin: Get user by ID
const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};

// Admin: Update user details or role
const updateUser = async (id, userData) => {
  // userData: { username, email, role }
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

// Admin: Delete a user
const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};

const userService = {
  addReviewer,
  addUser, // conceptual
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};

export default userService;
