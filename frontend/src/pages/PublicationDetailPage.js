import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import publicationService from "../api/publicationService";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate } from "../utils/formatDate";

const PublicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [publication, setPublication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // For reviewer actions
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewerComments, setReviewerComments] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

  const fetchPublication = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await publicationService.getPublicationById(id);
      if (data.success) {
        setPublication(data.data);
      } else {
        setError(data.message || "Publication not found or access denied.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch publication details."
      );
      if (err.response?.status === 404 || err.response?.status === 403) {
        // navigate('/not-found', { replace: true }); // or an unauthorized page
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPublication();
  }, [fetchPublication]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setIsReviewing(true);
    try {
      const reviewData = { status: reviewStatus, reviewerComments };
      await publicationService.submitReview(id, reviewData);
      setReviewSuccess(
        "Review submitted successfully. Publication status updated."
      );
      fetchPublication(); // Refresh publication details
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsReviewing(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this publication? This action cannot be undone."
      )
    ) {
      try {
        if (user?.role === "admin") {
          await publicationService.adminDeletePublication(id);
        } else {
          await publicationService.deletePublication(id);
        }
        alert("Publication deleted successfully.");
        navigate(
          user?.role === "admin"
            ? "/admin/publications"
            : "/dashboard/my-publications"
        );
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete publication.");
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error-message">{error}</p>;
  if (!publication) return <p>Publication not found.</p>;

  const isOwner = isAuthenticated && user?._id === publication.publisher?._id;
  const isAdmin = isAuthenticated && user?.role === "admin";
  const canEdit =
    (isOwner &&
      ["pending_review", "needs_correction"].includes(publication.status)) ||
    isAdmin;
  const canDelete = (isOwner && publication.status !== "published") || isAdmin;
  const canReview =
    isAuthenticated &&
    (user?.role === "reviewer" || isAdmin) &&
    publication.status === "pending_review";

  return (
    <div className="publication-detail">
      <h1>{publication.title}</h1>
      <div className="meta-info">
        <p>
          <strong>Authors:</strong> {publication.authorNames.join(", ")}
        </p>
        <p>
          <strong>Category:</strong> {publication.category}
        </p>
        <p>
          <strong>Date of Publication:</strong>{" "}
          {formatDate(publication.dateOfPublication)}
        </p>
        {publication.yearOfPublication && (
          <p>
            <strong>Year:</strong> {publication.yearOfPublication}
          </p>
        )}
        {publication.volume && (
          <p>
            <strong>Volume:</strong> {publication.volume}
          </p>
        )}
        {publication.doi && (
          <p>
            <strong>DOI:</strong> {publication.doi}
          </p>
        )}
        <p>
          <strong>Status:</strong>{" "}
          <span
            style={{
              fontWeight: "bold",
              color:
                publication.status === "published"
                  ? "green"
                  : publication.status === "rejected"
                  ? "red"
                  : "orange",
            }}
          >
            {publication.status.replace("_", " ")}
          </span>
        </p>
        {publication.publisher && (
          <p>
            <strong>Submitted by:</strong> {publication.publisher.username}
          </p>
        )}
        {publication.reviewedBy && (
          <p>
            <strong>Reviewed by:</strong> {publication.reviewedBy.username}
          </p>
        )}
        {publication.reviewerComments && publication.status == "published" && (
          <p>
            <strong>Reviewer Comments:</strong> {publication.reviewerComments}
          </p>
        )}
      </div>

      {publication.description && (
        <div className="description">
          <p>{publication.description}</p>
        </div>
      )}

      <div className="actions">
        <a
          href={publicationService.getPublicationPdfUrl(publication.content)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          View PDF
        </a>
        {canEdit && (
          <Link
            to={`/dashboard/edit-publication/${id}`}
            className="btn"
            style={{ marginLeft: "10px" }}
          >
            Edit
          </Link>
        )}
        {canDelete && (
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            style={{ marginLeft: "10px" }}
          >
            Delete
          </button>
        )}
      </div>

      {canReview && (
        <div className="review-section">
          <h3>Submit Review</h3>
          {reviewError && <p className="error-message">{reviewError}</p>}
          {reviewSuccess && <p className="success-message">{reviewSuccess}</p>}
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label htmlFor="reviewStatus">New Status *</label>
              <select
                id="reviewStatus"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="published">Publish</option>
                <option value="needs_correction">Needs Correction</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            {(reviewStatus === "needs_correction" ||
              reviewStatus === "rejected" ||
              reviewStatus === "published") && (
              <div className="form-group">
                <label htmlFor="reviewerComments">
                  Comments (Required for Needs Correction/Reject) *
                </label>
                <textarea
                  id="reviewerComments"
                  value={reviewerComments}
                  onChange={(e) => setReviewerComments(e.target.value)}
                  rows="4"
                  required={
                    reviewStatus === "needs_correction" ||
                    reviewStatus === "rejected"
                  }
                ></textarea>
              </div>
            )}
            <button type="submit" className="btn" disabled={isReviewing}>
              {isReviewing ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}
      {publication.status === "needs_correction" && isOwner && !isAdmin && (
        <div
          className="alert alert-warning"
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid orange",
            backgroundColor: "#fff3cd",
          }}
        >
          <p>
            <strong>Action Required:</strong> This publication needs correction
            based on reviewer feedback.
          </p>
          <p>
            <strong>Reviewer Comments:</strong> {publication.reviewerComments}
          </p>
          <p>
            Please{" "}
            <Link to={`/dashboard/edit-publication/${id}`}>
              edit your publication
            </Link>{" "}
            and resubmit. Resubmitting will change the status back to
            'pending_review'.
          </p>
        </div>
      )}
    </div>
  );
};

export default PublicationDetailPage;
