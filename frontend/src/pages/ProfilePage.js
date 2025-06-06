// frontend/src/pages/ProfilePage.js
import React, { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import authService from "../api/authService"; // If you want to re-fetch /me
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

const ProfilePage = () => {
  const {
    user: contextUser,
    token,
    loading: authLoading,
    initializeAuth,
  } = useAuth();
  const [userData, setUserData] = useState(contextUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Use user from context if already loaded, otherwise fetch
    if (contextUser && !authLoading) {
      setUserData(contextUser);
      setLoading(false);
    } else if (!authLoading && token) {
      // If context user not loaded but token exists, try fetching
      const fetchMe = async () => {
        try {
          const freshUser = await authService.getCurrentUser();
          if (freshUser) {
            setUserData(freshUser);
            // Optionally re-trigger context initialization if it didn't pick up this user
            // initializeAuth(); // Be careful with infinite loops if not managed correctly
          } else {
            setError("Could not fetch user details.");
          }
        } catch (err) {
          setError(err.response?.data?.message || "Failed to fetch profile.");
        } finally {
          setLoading(false);
        }
      };
      fetchMe();
    } else if (!authLoading && !token) {
      setError("You are not logged in.");
      setLoading(false);
    }
  }, [contextUser, token, authLoading, initializeAuth]);

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!userData) {
    return <p>No user data available. Please log in.</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>My Profile</h1>
      <div
        className="publication-detail"
        style={{ maxWidth: "600px", margin: "20px auto" }}
      >
        <p>
          <strong>Username:</strong> {userData.username}
        </p>
        <p>
          <strong>Email:</strong> {userData.email}
        </p>
        <p>
          <strong>Role:</strong> {userData.role}
        </p>
        <p>
          <strong>Joined:</strong> {formatDate(userData.createdAt)}
        </p>
        {/* You can add more details if available, e.g., last updated */}
      </div>
    </div>
  );
};

export default ProfilePage;
