import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../../api/userService"; // Using addReviewer specifically for now
import useAuth from "../../hooks/useAuth"; // To check if admin is adding for role setting logic on backend

const AdminAddUserPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reviewer"); // Default to reviewer for this form
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user: adminUser } = useAuth(); // The logged-in admin

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // The backend `registerUser` route allows admin to specify role.
    // The backend `addReviewer` route specifically creates a user with 'reviewer' role.
    // We'll use `addReviewer` if role is 'reviewer', otherwise we'd need a more general admin user creation endpoint.
    // For simplicity, this form primarily targets adding reviewers.
    // If you need to add users with other roles, the backend `register` needs to be hit with admin privileges.
    // Or enhance userService.addUser and its backend counterpart.

    let userData = { username, email, password };

    try {
      let response;
      if (role === "reviewer") {
        response = await userService.addReviewer(userData); //This creates a reviewer directly
      } else {
        // For other roles, ideally call a general admin-create-user endpoint
        // or use the main registration endpoint if it's configured to allow admins to set roles.
        // The current backend's /api/auth/register will create a 'user' unless an admin is logged in AND passes 'role'
        // This frontend uses a dedicated /api/users/add-reviewer for reviewers.
        // So, to add an 'admin' or 'user' via this form, the backend's 'register' route logic needs to be leveraged.
        // For this example, we'll just stick to adding reviewers as it's explicitly supported by a backend route.
        setError(
          "This form is currently configured to add Reviewers. To add other roles, backend adjustments for a general admin user creation endpoint might be needed, or use the main registration and then edit role."
        );
        setLoading(false);
        return;
      }

      if (response.success) {
        setSuccessMessage(
          `${
            role.charAt(0).toUpperCase() + role.slice(1)
          } '${username}' added successfully!`
        );
        setUsername("");
        setEmail("");
        setPassword("");
        setTimeout(() => navigate("/admin/users"), 2000);
      } else {
        setError(response.message || `Failed to add ${role}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error adding ${role}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Add New User/Reviewer</h1>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username *</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password (min 6 characters) *</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">
            Role * (Currently supports Reviewer directly)
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            {/* <option value="user">User</option> */}
            <option value="reviewer">Reviewer</option>
            {/* <option value="admin">Admin</option> */}
          </select>
          <small>
            To add 'user' or 'admin', use main registration and edit role, or
            backend needs general admin user creation.
          </small>
        </div>
        <button type="submit" disabled={loading}>
          {loading
            ? "Adding..."
            : `Add ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </button>
      </form>
    </div>
  );
};

export default AdminAddUserPage;
