import React, { useState, useEffect } from "react";

const PublicationForm = ({
  onSubmit,
  initialData = null,
  isLoading,
  error,
  successMessage,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authorNamesStr, setAuthorNamesStr] = useState(""); // Comma-separated string
  const [category, setCategory] = useState("research_paper");
  const [doi, setDoi] = useState("");
  const [dateOfPublication, setDateOfPublication] = useState("");
  const [volume, setVolume] = useState("");
  const [publicationPdf, setPublicationPdf] = useState(null);
  const [currentPdfPath, setCurrentPdfPath] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setAuthorNamesStr(
        initialData.authorNames ? initialData.authorNames.join(", ") : ""
      );
      setCategory(initialData.category || "research_paper");
      setDoi(initialData.doi || "");
      setDateOfPublication(
        initialData.dateOfPublication
          ? initialData.dateOfPublication.split("T")[0]
          : ""
      );
      setVolume(initialData.volume || "");
      setCurrentPdfPath(initialData.content || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    const authorsArray = authorNamesStr
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    if (authorsArray.length === 0) {
      alert("Please provide at least one author name.");
      return;
    }
    formData.append("authorNames", JSON.stringify(authorsArray)); // Send as JSON string array

    formData.append("category", category);
    if (doi) formData.append("doi", doi);
    formData.append("dateOfPublication", dateOfPublication);
    if (volume) formData.append("volume", volume);
    if (publicationPdf) {
      formData.append("publicationPdf", publicationPdf);
    } else if (!initialData && !publicationPdf) {
      // New submission requires PDF
      alert("Publication PDF is required for new submissions.");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="authorNamesStr">Author Names (comma-separated) *</label>
        <input
          type="text"
          id="authorNamesStr"
          value={authorNamesStr}
          onChange={(e) => setAuthorNamesStr(e.target.value)}
          placeholder="e.g., John Doe, Jane Smith"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="250"
        ></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="magazine">Magazine</option>
          <option value="book">Book</option>
          <option value="research_paper">Research Paper</option>
          <option value="journal">Journal</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="dateOfPublication">Date of Publication *</label>
        <input
          type="date"
          id="dateOfPublication"
          value={dateOfPublication}
          onChange={(e) => setDateOfPublication(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="volume">Volume/Issue</label>
        <input
          type="text"
          id="volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="doi">DOI</label>
        <input
          type="text"
          id="doi"
          value={doi}
          onChange={(e) => setDoi(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="publicationPdf">
          {initialData ? "Replace PDF (Optional)" : "Publication PDF *"}
        </label>
        <input
          type="file"
          id="publicationPdf"
          accept="application/pdf"
          onChange={(e) => setPublicationPdf(e.target.files[0])}
        />
        {currentPdfPath && (
          <p>
            Current file:{" "}
            <a
              href={`${process.env.REACT_APP_BASE_URL}${currentPdfPath}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Current PDF
            </a>
          </p>
        )}
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading
          ? "Submitting..."
          : initialData
          ? "Update Publication"
          : "Submit Publication"}
      </button>
    </form>
  );
};

export default PublicationForm;
