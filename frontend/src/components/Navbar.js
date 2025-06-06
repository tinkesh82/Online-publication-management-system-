// frontend/src/components/Navbar.js
import React, { useEffect } from "react"; // Added useEffect for logging
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Navbar = () => {
  const { user, logout, isAuthenticated, loading, token } = useAuth(); // Added loading and token for logging
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Navbar - useEffect - Auth State Change:", {
      isAuthenticated,
      user,
      isLoading: loading,
      tokenFromContext: token,
      tokenFromLocalStorage: localStorage.getItem("token"),
    });
  }, [isAuthenticated, user, loading, token]); // Log whenever these key auth states change

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading && !token) {
    // If truly loading and no token yet, maybe show minimal navbar or nothing
    // This condition might be too aggressive, but helps see if loading state is the factor
    console.log(
      "Navbar: Auth is loading and no token yet, rendering minimal state."
    );
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li style={{ marginRight: "auto" }}></li>
          <li>Loading Auth...</li>
        </ul>
      </nav>
    );
  }

  console.log("Navbar - Render:", {
    isAuthenticated,
    user,
    isLoading: loading,
  });

  return (
    <nav>
      {/* ... rest of your navbar JSX ... same as before ... */}
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {isAuthenticated && user ? ( // Added check for user object itself
          <>
            <li
              style={{
                marginRight: "auto",
                color: "white",
                padding: "0.5rem 1rem",
              }}
            >
              Hi, {user.username} {/* Can now safely use user.username */}
            </li>
            <li>
              <Link to="/profile">My Profile</Link>
            </li>

            {user.role === "user" /* Use user.role safely */ && (
              <>
                <li>
                  <Link to="/dashboard/my-publications">My Publications</Link>
                </li>
                <li>
                  <Link to="/dashboard/submit-publication">Submit New</Link>
                </li>
              </>
            )}
            {user.role === "reviewer" && (
              <li>
                <Link to="/dashboard/review-queue">Review Queue</Link>
              </li>
            )}
            {user.role === "admin" && (
              <>
                <li>
                  <Link to="/admin/users">User Management</Link>
                </li>
                <li>
                  <Link to="/admin/publications">Publication Mgmt</Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li style={{ marginRight: "auto" }}></li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
