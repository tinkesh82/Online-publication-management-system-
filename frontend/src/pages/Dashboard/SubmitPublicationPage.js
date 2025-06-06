import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import publicationService from "../../api/publicationService";
import PublicationForm from "../../components/PublicationForm";

const SubmitPublicationPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const response = await publicationService.createPublication(formData);
      if (response.success) {
        setSuccessMessage(
          "Publication submitted successfully! It is now pending review."
        );
        // Optionally redirect after a delay or clear form
        setTimeout(() => {
          navigate("/dashboard/my-publications");
        }, 2000);
      } else {
        setError(response.message || "Failed to submit publication.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during submission."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Submit New Publication</h1>
      <PublicationForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        successMessage={successMessage}
      />
    </div>
  );
};

export default SubmitPublicationPage;
