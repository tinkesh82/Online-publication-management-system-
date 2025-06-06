import React, { useState, useEffect, useCallback } from "react";
import publicationService from "../../api/publicationService";
import PublicationCard from "../../components/PublicationCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";

const AdminPublicationManagementPage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
  });

  const fetchAdminPublications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, page: currentPage };
      Object.keys(params).forEach((key) => {
        // Remove empty filter values
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });
      const data = await publicationService.adminGetAllPublications(params);
      setPublications(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch publications."
      );
      setPublications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchAdminPublications();
  }, [fetchAdminPublications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAdminPublications();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="dashboard-container">
      <h1>All Publications (Admin View)</h1>

      <form
        onSubmit={handleFilterSubmit}
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="needs_correction">Needs Correction</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">All Categories</option>
            <option value="magazine">Magazine</option>
            <option value="book">Book</option>
            <option value="research_paper">Research Paper</option>
            <option value="journal">Journal</option>
          </select>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <option value="createdAt">Upload Date</option>
            <option value="dateOfPublication">Publication Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <select
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleFilterChange}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          <button type="submit">Apply Filters</button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : publications.length > 0 ? (
        <>
          <div className="publication-grid">
            {publications.map((pub) => (
              <PublicationCard key={pub._id} publication={pub} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <p>No publications found with current filters.</p>
      )}
    </div>
  );
};

export default AdminPublicationManagementPage;
