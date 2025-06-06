import React, { useState, useEffect, useCallback } from "react";
import publicationService from "../../api/publicationService";
import PublicationCard from "../../components/PublicationCard";
import LoadingSpinner from "../../components/LoadingSpinner";

const ReviewQueuePage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviewQueue = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await publicationService.getReviewQueue();
      if (data.success) {
        setPublications(data.data);
      } else {
        setError(data.message || "Failed to fetch review queue.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while fetching the review queue."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewQueue();
  }, [fetchReviewQueue]);

  return (
    <div className="dashboard-container">
      <h1>Publications Pending Review</h1>
      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : publications.length > 0 ? (
        <div className="publication-grid">
          {publications.map((pub) => (
            <PublicationCard key={pub._id} publication={pub} />
            // Clicking on a card will lead to PublicationDetailPage where review can be submitted
          ))}
        </div>
      ) : (
        <p>No publications are currently pending review.</p>
      )}
    </div>
  );
};

export default ReviewQueuePage;
