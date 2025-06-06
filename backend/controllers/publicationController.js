import Publication from "../models/Publication.js";
import User from "../models/User.js"; // For populating publisher/reviewer
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAbsoluteFilePath = (relativePath) => {
  return path.join(__dirname, "..", relativePath);
};

const deletePublicationFile = (filePath) => {
  if (filePath) {
    const fullPath = getAbsoluteFilePath(filePath);
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (fs.existsSync(fullPath) && fullPath.startsWith(uploadsDir)) {
      fs.unlink(fullPath, (err) => {
        if (err) console.error(`Error deleting file ${fullPath}:`, err);
        else console.log(`File ${fullPath} deleted successfully.`);
      });
    } else {
      console.warn(
        `Attempted to delete file outside uploads directory or file not found: ${fullPath}`
      );
    }
  }
};

const parseAuthorNames = (authorNamesInput) => {
  if (!authorNamesInput) return null;
  let parsed;
  if (typeof authorNamesInput === "string") {
    try {
      parsed = JSON.parse(authorNamesInput);
    } catch (e) {
      return {
        error: "Author names, if a string, must be a valid JSON array.",
      };
    }
  } else if (Array.isArray(authorNamesInput)) {
    parsed = authorNamesInput;
  } else {
    return {
      error:
        "Author names must be an array or a JSON string representing an array.",
    };
  }

  if (
    !Array.isArray(parsed) ||
    parsed.length === 0 ||
    !parsed.every((name) => typeof name === "string" && name.trim().length > 0)
  ) {
    return {
      error: "Author names must be a non-empty array of non-empty strings.",
    };
  }
  return parsed.map((name) => name.trim());
};

// @desc    Create a new publication
// @route   POST /api/publications
// @access  Private (User/Admin)
export const createPublication = async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Publication PDF file is required." });
  }

  const {
    title,
    description,
    authorNames: authorNamesInput,
    category,
    doi,
    dateOfPublication,
    volume,
  } = req.body;

  const parsedAuthors = parseAuthorNames(authorNamesInput);
  if (parsedAuthors && parsedAuthors.error) {
    deletePublicationFile(`/uploads/publications/${req.file.filename}`);
    return res
      .status(400)
      .json({ success: false, message: parsedAuthors.error });
  }
  if (!parsedAuthors) {
    deletePublicationFile(`/uploads/publications/${req.file.filename}`);
    return res.status(400).json({
      success: false,
      message:
        "Author names are required and must be a non-empty array of strings.",
    });
  }

  if (!title || !category || !dateOfPublication) {
    deletePublicationFile(`/uploads/publications/${req.file.filename}`);
    return res.status(400).json({
      success: false,
      message:
        "Please provide title, category, and date of publication (e.g., YYYY-MM-DD).",
    });
  }

  const parsedDate = new Date(dateOfPublication);
  if (isNaN(parsedDate.getTime())) {
    deletePublicationFile(`/uploads/publications/${req.file.filename}`);
    return res.status(400).json({
      success: false,
      message:
        "Invalid date format for date of publication. Please use a format like YYYY-MM-DD.",
    });
  }

  try {
    const contentPath = `/uploads/publications/${req.file.filename}`;

    const publication = await Publication.create({
      title,
      description: description || "",
      authorNames: parsedAuthors,
      category,
      content: contentPath,
      doi,
      dateOfPublication: parsedDate, // yearOfPublication will be set by pre-save hook
      volume: volume || undefined, // Add volume, default to undefined if not provided
      publisher: req.user.id,
    });
    res.status(201).json({ success: true, data: publication });
  } catch (error) {
    deletePublicationFile(`/uploads/publications/${req.file.filename}`);
    next(error);
  }
};

// @desc    Get all PUBLISHED publications with filtering/searching
// @route   GET /api/publications
// @access  Public
export const getPublications = async (req, res, next) => {
  const {
    category,
    title,
    authorName,
    doi,
    year,
    startYear,
    endYear,
    specificDate,
    startDate,
    endDate,
    sortBy = "recent",
    page = 1,
    limit = 10,
  } = req.query;

  const query = { status: "published" };

  if (category) query.category = category;
  if (doi) query.doi = { $regex: doi.trim(), $options: "i" };

  if (title) query.title = { $regex: title.trim(), $options: "i" };
  if (authorName)
    query.authorNames = { $regex: authorName.trim(), $options: "i" };

  if (year && !isNaN(parseInt(year))) query.yearOfPublication = parseInt(year);
  else if (
    startYear &&
    endYear &&
    !isNaN(parseInt(startYear)) &&
    !isNaN(parseInt(endYear))
  ) {
    query.yearOfPublication = {
      $gte: parseInt(startYear),
      $lte: parseInt(endYear),
    };
  } else if (startYear && !isNaN(parseInt(startYear))) {
    query.yearOfPublication = { $gte: parseInt(startYear) };
  } else if (endYear && !isNaN(parseInt(endYear))) {
    query.yearOfPublication = { $lte: parseInt(endYear) };
  }

  if (specificDate) {
    const dayStart = new Date(specificDate);
    if (!isNaN(dayStart.getTime())) {
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(specificDate);
      dayEnd.setUTCHours(23, 59, 59, 999);
      query.dateOfPublication = { $gte: dayStart, $lte: dayEnd };
    }
  } else if (startDate && endDate) {
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (!isNaN(parsedStartDate.getTime()) && !isNaN(parsedEndDate.getTime())) {
      parsedStartDate.setUTCHours(0, 0, 0, 0);
      parsedEndDate.setUTCHours(23, 59, 59, 999);
      query.dateOfPublication = { $gte: parsedStartDate, $lte: parsedEndDate };
    }
  } else if (startDate) {
    const parsedStartDate = new Date(startDate);
    if (!isNaN(parsedStartDate.getTime())) {
      parsedStartDate.setUTCHours(0, 0, 0, 0);
      query.dateOfPublication = { $gte: parsedStartDate };
    }
  } else if (endDate) {
    const parsedEndDate = new Date(endDate);
    if (!isNaN(parsedEndDate.getTime())) {
      parsedEndDate.setUTCHours(23, 59, 59, 999);
      query.dateOfPublication = { $lte: parsedEndDate };
    }
  }

  let sortOptions = {};
  if (sortBy === "recent" || sortBy === "createdAt_desc")
    sortOptions.createdAt = -1;
  else if (sortBy === "createdAt_asc") sortOptions.createdAt = 1;
  else if (sortBy === "dateOfPublication_desc")
    sortOptions.dateOfPublication = -1;
  else if (sortBy === "dateOfPublication_asc")
    sortOptions.dateOfPublication = 1;
  else if (sortBy === "year_asc") sortOptions.yearOfPublication = 1;
  else if (sortBy === "year_desc") sortOptions.yearOfPublication = -1;
  else if (sortBy === "title_asc") sortOptions.title = 1;
  else if (sortBy === "title_desc") sortOptions.title = -1;
  else sortOptions.createdAt = -1;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const publications = await Publication.find(query)
      .populate("publisher", "username email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Publication.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      count: publications.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit),
      },
      data: publications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single publication by ID
// @route   GET /api/publications/:id
// @access  Public (conditionally for non-published)
export const getPublicationById = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id)
      .populate("publisher", "username email")
      .populate("reviewedBy", "username email");

    if (!publication) {
      return res
        .status(404)
        .json({ success: false, message: "Publication not found" });
    }

    const isOwner =
      req.user &&
      publication.publisher &&
      publication.publisher._id.toString() === req.user.id.toString();
    const isAdmin = req.user && req.user.role === "admin";
    const isReviewerForThisOrPending =
      req.user &&
      req.user.role === "reviewer" &&
      (publication.status === "pending_review" ||
        (publication.reviewedBy &&
          publication.reviewedBy._id.toString() === req.user.id.toString()));

    if (
      publication.status === "published" ||
      isOwner ||
      isAdmin ||
      isReviewerForThisOrPending
    ) {
      res.status(200).json({ success: true, data: publication });
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this publication details",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get publications by the logged-in user (as publisher)
// @route   GET /api/publications/my-publications
// @access  Private (User/Admin)
export const getMyPublications = async (req, res, next) => {
  try {
    const publications = await Publication.find({ publisher: req.user.id })
      .populate("publisher", "username")
      .populate("reviewedBy", "username")
      .sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own publication
// @route   PUT /api/publications/:id
// @access  Private (User who owns it, or Admin)
export const updatePublication = async (req, res, next) => {
  const {
    title,
    description,
    authorNames: authorNamesInput,
    category,
    doi,
    dateOfPublication,
    volume,
  } = req.body;
  let oldContentPath;

  try {
    let publication = await Publication.findById(req.params.id);

    if (!publication) {
      if (req.file)
        deletePublicationFile(`/uploads/publications/${req.file.filename}`);
      return res
        .status(404)
        .json({ success: false, message: "Publication not found" });
    }
    oldContentPath = publication.content;

    const isOwner =
      publication.publisher && publication.publisher.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      if (req.file)
        deletePublicationFile(`/uploads/publications/${req.file.filename}`);
      return res.status(401).json({
        success: false,
        message: "Not authorized to update this publication",
      });
    }

    if (
      isOwner &&
      !isAdmin &&
      !["pending_review", "needs_correction"].includes(publication.status)
    ) {
      if (req.file)
        deletePublicationFile(`/uploads/publications/${req.file.filename}`);
      return res.status(403).json({
        success: false,
        message: `Cannot update publication with status: ${publication.status}. Contact admin for changes to published work.`,
      });
    }

    if (req.file) {
      publication.content = `/uploads/publications/${req.file.filename}`;
    }

    if (title) publication.title = title;
    if (description !== undefined) publication.description = description;

    if (authorNamesInput) {
      const parsedAuthors = parseAuthorNames(authorNamesInput);
      if (parsedAuthors.error) {
        if (req.file && publication.content !== oldContentPath)
          deletePublicationFile(publication.content);
        else if (req.file) publication.content = oldContentPath;
        return res
          .status(400)
          .json({ success: false, message: parsedAuthors.error });
      }
      publication.authorNames = parsedAuthors;
    }

    if (category) publication.category = category;
    if (doi) publication.doi = doi;

    if (dateOfPublication) {
      const parsedDate = new Date(dateOfPublication);
      if (isNaN(parsedDate.getTime())) {
        if (req.file && publication.content !== oldContentPath)
          deletePublicationFile(publication.content);
        else if (req.file) publication.content = oldContentPath;
        return res.status(400).json({
          success: false,
          message: "Invalid date format for date of publication.",
        });
      }
      publication.dateOfPublication = parsedDate;
    }

    if (volume !== undefined) {
      // Check if 'volume' key exists in request body
      publication.volume = volume; // Assign it, allowing empty string or null
    }

    if (isOwner && publication.status === "needs_correction") {
      publication.status = "pending_review";
      publication.reviewerComments = "";
      publication.reviewedBy = undefined;
    }

    const updatedPublication = await publication.save();

    if (
      req.file &&
      oldContentPath &&
      oldContentPath !== updatedPublication.content
    ) {
      deletePublicationFile(oldContentPath);
    }

    res.status(200).json({ success: true, data: updatedPublication });
  } catch (error) {
    if (req.file) {
      const newFilePath = `/uploads/publications/${req.file.filename}`;
      if (newFilePath !== oldContentPath) {
        deletePublicationFile(newFilePath);
      }
    }
    next(error);
  }
};

// @desc    Delete own publication (User can delete only if not published)
// @route   DELETE /api/publications/:id
// @access  Private (User who owns it)
export const deletePublication = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res
        .status(404)
        .json({ success: false, message: "Publication not found" });
    }

    if (
      !publication.publisher ||
      publication.publisher.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to delete this publication",
      });
    }

    if (publication.status === "published") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete a published publication. Contact admin.",
      });
    }

    const filePath = publication.content;
    await publication.deleteOne();
    deletePublicationFile(filePath);

    res.status(200).json({ success: true, message: "Publication removed" });
  } catch (error) {
    next(error);
  }
};

// --- Reviewer Actions ---

// @desc    Get all publications pending review
// @route   GET /api/publications/review/queue
// @access  Private (Reviewer/Admin)
export const getReviewQueue = async (req, res, next) => {
  try {
    const query = {
      $or: [{ status: "pending_review" }],
    };
    if (req.user.role === "admin") {
      query.$or.push({ status: "needs_correction" });
    }

    const publications = await Publication.find(query)
      .populate("publisher", "username email")
      .sort({ status: 1, createdAt: 1 });
    res
      .status(200)
      .json({ success: true, count: publications.length, data: publications });
  } catch (error) {
    next(error);
  }
};

// @desc    Reviewer: Submit a review (approve, reject, or request correction)
// @route   PUT /api/publications/review/:id
// @access  Private (Reviewer/Admin)
export const submitReview = async (req, res, next) => {
  const { status, reviewerComments } = req.body;
  const validStatuses = ["published", "rejected", "needs_correction"];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid review status. Must be one of: ${validStatuses.join(
        ", "
      )}`,
    });
  }
  if (
    (status === "needs_correction" || status === "rejected") &&
    (!reviewerComments || reviewerComments.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Reviewer comments are required for rejection or correction requests.",
    });
  }

  try {
    let publication = await Publication.findById(req.params.id);

    if (!publication) {
      return res
        .status(404)
        .json({ success: false, message: "Publication not found" });
    }

    if (
      publication.status !== "pending_review" &&
      !(req.user.role === "admin" && publication.status === "needs_correction")
    ) {
      return res.status(400).json({
        success: false,
        message: `Publication is not currently pending review (status: ${publication.status})`,
      });
    }

    publication.status = status;
    publication.reviewerComments = reviewerComments || "";
    publication.reviewedBy = req.user.id;

    const updatedPublication = await publication.save();
    res.status(200).json({ success: true, data: updatedPublication });
  } catch (error) {
    next(error);
  }
};

// --- Admin Actions ---

// @desc    Admin: Get all publications regardless of status for management
// @route   GET /api/publications/admin/all
// @access  Private (Admin)
export const adminGetAllPublications = async (req, res, next) => {
  const {
    status,
    category,
    publisherId,
    reviewerId,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (publisherId) query.publisher = publisherId;
  if (reviewerId) query.reviewedBy = reviewerId;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const publications = await Publication.find(query)
      .populate("publisher", "username email")
      .populate("reviewedBy", "username email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Publication.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      count: publications.length,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit),
      },
      data: publications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete any publication
// @route   DELETE /api/publications/admin/:id
// @access  Private (Admin)
export const adminDeletePublication = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res
        .status(404)
        .json({ success: false, message: "Publication not found" });
    }

    const filePath = publication.content;
    await publication.deleteOne();
    deletePublicationFile(filePath);

    res
      .status(200)
      .json({ success: true, message: "Publication removed by admin" });
  } catch (error) {
    next(error);
  }
};
