import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userService from "../../api/userService";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminEditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    role: "user",
  });
  const [loading, setLoading] = useState(true); // Page loading
  const [updating, setUpdating] = useState(false); // Form submission loading
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setUserData(response.data);
      } else {
        setError(response.message || "Failed to fetch user data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching user.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError("");
    setSuccessMessage("");
    try {
      const { username, email, role } = userData;
      const response = await userService.updateUser(id, {
        username,
        email,
        role,
      });
      if (response.success) {
        setSuccessMessage("User updated successfully!");
        setTimeout(() => navigate("/admin/users"), 1500);
      } else {
        setError(response.message || "Failed to update user.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating user.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <h1>Edit User: {userData.username}</h1>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      {!userData._id && !error && <p>User not found.</p>}

      {userData._id && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={userData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              name="role"
              id="role"
              value={userData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="reviewer">Reviewer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={updating}>
            {updating ? "Updating..." : "Update User"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminEditUserPage;
