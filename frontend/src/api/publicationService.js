import axiosInstance from "./axiosInstance";

const API_BASE_URL = process.env.REACT_APP_BASE_URL; // For PDF links

// Public: Get published publications
const getPublishedPublications = async (params = {}) => {
  // params: { category, title, authorName, doi, year, startYear, endYear, specificDate, startDate, endDate, sortBy, page, limit }
  const response = await axiosInstance.get("/publications", { params });
  return response.data;
};

// Public/Protected: Get a single publication by ID
const getPublicationById = async (id) => {
  const tokenForThisCall = localStorage.getItem("token"); // Get token right before the call
  console.log(
    `PUBLICATION_SERVICE (getPublicationById for ID: ${id}): Token from localStorage JUST BEFORE this specific Axios call: ${
      tokenForThisCall ? "EXISTS" : "MISSING/NULL"
    }`
  );
  const response = await axiosInstance.get(`/publications/${id}`);
  axiosInstance.get(`/publications/${id}`); // The actual call
  console.log(
    `PUBLICATION_SERVICE (getPublicationById for ID: ${id}): Axios response received:`,
    response
  );
  return response.data;
};

// User: Create a new publication
const createPublication = async (formData) => {
  // formData should be an instance of FormData
  const response = await axiosInstance.post("/publications", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// User: Get their own publications
const getMyPublications = async () => {
  const response = await axiosInstance.get("/publications/my-publications");
  return response.data;
};

// User/Admin: Update a publication
const updatePublication = async (id, formData) => {
  // formData should be an instance of FormData
  const response = await axiosInstance.put(`/publications/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// User: Delete their own publication (if not published)
const deletePublication = async (id) => {
  const response = await axiosInstance.delete(`/publications/${id}`);
  return response.data;
};

// Reviewer/Admin: Get review queue
const getReviewQueue = async () => {
  const response = await axiosInstance.get("/publications/review/queue");
  return response.data;
};

// Reviewer/Admin: Submit a review
const submitReview = async (id, reviewData) => {
  // reviewData: { status, reviewerComments }
  const response = await axiosInstance.put(
    `/publications/review/${id}`,
    reviewData
  );
  return response.data;
};

// Admin: Get all publications for management
const adminGetAllPublications = async (params = {}) => {
  // params: { status, category, publisherId, reviewerId, page, limit, sortBy, sortOrder }
  const response = await axiosInstance.get("/publications/admin/all", {
    params,
  });
  return response.data;
};

// Admin: Delete any publication
const adminDeletePublication = async (id) => {
  const response = await axiosInstance.delete(`/publications/admin/${id}`);
  return response.data;
};

const getPublicationPdfUrl = (contentPath) => {
  if (!contentPath) return "#";
  return `${API_BASE_URL}${
    contentPath.startsWith("/") ? contentPath : "/" + contentPath
  }`;
};

const publicationService = {
  getPublishedPublications,
  getPublicationById,
  createPublication,
  getMyPublications,
  updatePublication,
  deletePublication,
  getReviewQueue,
  submitReview,
  adminGetAllPublications,
  adminDeletePublication,
  getPublicationPdfUrl,
};

export default publicationService;
