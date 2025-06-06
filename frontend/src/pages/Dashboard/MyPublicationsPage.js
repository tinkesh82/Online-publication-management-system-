import React, { useState, useEffect, useCallback } from "react";
import publicationService from "../../api/publicationService";
import PublicationCard from "../../components/PublicationCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

const MyPublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyPublications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await publicationService.getMyPublications();
      if (data.success) {
        setPublications(data.data);
      } else {
        setError(data.message || "Failed to fetch publications.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching your publications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyPublications();
  }, [fetchMyPublications]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Submitted Publications</h1>
        <Link to="/dashboard/submit-publication" className="btn">
          Submit New Publication
        </Link>
      </div>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : publications.length > 0 ? (
        <div className="publication-grid">
          {publications.map((pub) => (
            <PublicationCard key={pub._id} publication={pub} />
          ))}
        </div>
      ) : (
        <p>You have not submitted any publications yet.</p>
      )}
    </div>
  );
};

export default MyPublicationsPage;
