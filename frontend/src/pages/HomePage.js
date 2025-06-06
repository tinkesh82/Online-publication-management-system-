import React, { useState, useEffect, useCallback } from "react";
import publicationService from "../api/publicationService";
import PublicationCard from "../components/PublicationCard";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";

const HomePage = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    title: "",
    authorName: "",
    category: "",
    year: "",
    sortBy: "recent",
    limit: 10,
  });

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { ...filters, page: currentPage };
      // Remove empty filter values
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });
      const data = await publicationService.getPublishedPublications(params);
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
    fetchPublications();
  }, [fetchPublications]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPublications(); // Re-fetch with current filters
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1>Welcome To Publication System</h1>

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
          <input
            type="text"
            name="title"
            placeholder="Filter by Title"
            value={filters.title}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="authorName"
            placeholder="Filter by Author"
            value={filters.authorName}
            onChange={handleFilterChange}
          />
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
          <input
            type="number"
            name="year"
            placeholder="Year (YYYY)"
            value={filters.year}
            onChange={handleFilterChange}
            style={{ width: "120px" }}
          />
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <option value="recent">Most Recent (Upload)</option>
            <option value="dateOfPublication_desc">
              Newest (Publication Date)
            </option>
            <option value="dateOfPublication_asc">
              Oldest (Publication Date)
            </option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
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
        <p>No publications found.</p>
      )}
    </div>
  );
};

export default HomePage;
