import React, { useState, useEffect, useCallback } from "react";
import userService from "../../api/userService";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";

const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getAllUsers(filterRole || null);
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to fetch users.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await userService.deleteUser(userId);
        setUsers(users.filter((user) => user._id !== userId));
        alert("User deleted successfully.");
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete user.");
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>User Management</h1>
        <Link to="/admin/users/add" className="btn">
          Add New User/Reviewer
        </Link>
      </div>

      <div className="form-group">
        <label htmlFor="filterRole">Filter by Role:</label>
        <select
          id="filterRole"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <Link
                    to={`/admin/users/edit/${user._id}`}
                    className="btn btn-secondary"
                    style={{ marginRight: "5px" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!loading && users.length === 0 && <p>No users found.</p>}
    </div>
  );
};

export default AdminUserManagementPage;
