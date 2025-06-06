import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import publicationService from "../../api/publicationService";
import PublicationForm from "../../components/PublicationForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import useAuth from "../../hooks/useAuth";

const EditPublicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // For submission
  const [pageLoading, setPageLoading] = useState(true); // For fetching initial data
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPublicationData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await publicationService.getPublicationById(id);
      if (response.success) {
        const pubData = response.data;
        // Authorization check: only owner or admin can edit
        const isOwner = user?._id === pubData.publisher?._id;
        const isAdmin = user?.role === "admin";
        const canEdit =
          (isOwner &&
            ["pending_review", "needs_correction"].includes(pubData.status)) ||
          isAdmin;

        if (!canEdit) {
          setError(
            "You are not authorized to edit this publication or it's not in an editable state."
          );
          setInitialData(null); // Prevent form rendering
          return;
        }
        setInitialData(pubData);
      } else {
        setError(response.message || "Failed to fetch publication data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching publication.");
    } finally {
      setPageLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchPublicationData();
  }, [fetchPublicationData]);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await publicationService.updatePublication(id, formData);
      if (response.success) {
        setSuccessMessage("Publication updated successfully!");
        setTimeout(() => {
          navigate(`/publications/${id}`); // Or to my-publications
        }, 2000);
      } else {
        setError(response.message || "Failed to update publication.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during update."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <h1>Edit Publication</h1>
      {error && !initialData && <p className="error-message">{error}</p>}{" "}
      {/* Show main error if no form */}
      {initialData ? (
        <PublicationForm
          onSubmit={handleSubmit}
          initialData={initialData}
          isLoading={isLoading}
          error={error && initialData ? error : ""} // Show form-specific error
          successMessage={successMessage}
        />
      ) : (
        !error && (
          <p>Loading publication data or publication not found/editable...</p>
        )
      )}
    </div>
  );
};

export default EditPublicationPage;
