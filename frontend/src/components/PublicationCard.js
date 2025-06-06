import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import publicationService from "../api/publicationService";

const PublicationCard = ({ publication }) => {
  const detailUrl =
    publication.status === "pending_review" || "publish" || "need_correction"
      ? `/publications/review/${publication._id}`
      : `/publications/${publication._id}`;

  const handleViewDetailsClick = () => {
    console.log(
      `PUBLICATION_CARD: Clicked "View Details" for Pub ID: ${
        publication._id
      }. Current token in localStorage: ${
        localStorage.getItem("token") ? "EXISTS" : "MISSING/NULL"
      }`
    );
  };

  return (
    <div className="publication-card">
      <h3>
        <Link to={`/publications/${publication._id}`}>{publication.title}</Link>
      </h3>
      <p>
        <strong>Authors:</strong> {publication.authorNames.join(", ")}
      </p>
      <p>
        <strong>Category:</strong> {publication.category}
      </p>
      <p>
        <strong>Published:</strong> {formatDate(publication.dateOfPublication)}{" "}
        (Volume: {publication.volume || "N/A"})
      </p>
      {publication.doi && (
        <p>
          <strong>DOI:</strong> {publication.doi}
        </p>
      )}
      <p>
        <strong>Status:</strong>
        {publication.status.replace("_", " ")}
      </p>
      {publication.publisher && (
        <p>
          <strong>Uploaded by:</strong> {publication.publisher.username}
        </p>
      )}
      <Link to={detailUrl} className="btn btn-secondary">
        View Details
      </Link>

      <a
        href={publicationService.getPublicationPdfUrl(publication.content)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn"
        style={{ marginLeft: "10px" }}
      >
        View PDF
      </a>
    </div>
  );
};

export default PublicationCard;
