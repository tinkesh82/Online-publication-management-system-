import User from "../models/User.js";

// @desc    Admin: Add a new reviewer
// @route   POST /api/users/add-reviewer
// @access  Private/Admin
export const addReviewer = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please provide username, email, and password for the reviewer.",
        });
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Reviewer with this email or username already exists",
        });
    }

    const reviewer = await User.create({
      username,
      email,
      password,
      role: "reviewer",
    });

    res.status(201).json({
      success: true,
      message: "Reviewer added successfully",
      data: {
        _id: reviewer._id,
        username: reviewer.username,
        email: reviewer.email,
        role: reviewer.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all users (can be filtered by role)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const users = await User.find(query).select("-password");
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update user role or details
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  const { username, email, role } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent admin from changing their own role if they are the only admin (optional safeguard)
    if (user.role === "admin" && req.user.id === user.id.toString()) {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1 && role && role !== "admin") {
        return res
          .status(400)
          .json({
            success: false,
            message: "Cannot change role of the only admin.",
          });
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;
    if (role && ["user", "reviewer", "admin"].includes(role)) {
      user.role = role;
    }

    const updatedUser = await user.save();
    // Re-fetch to ensure password is not selected if it was accidentally selected during save
    const userToReturn = await User.findById(updatedUser._id).select(
      "-password"
    );

    res.status(200).json({ success: true, data: userToReturn });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent admin from deleting themselves (optional safeguard)
    if (req.user.id === user.id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot delete self." });
    }

    // Add logic here to handle user's publications if needed (e.g., reassign, delete)
    // For now, we just delete the user.

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User removed" });
  } catch (error) {
    next(error);
  }
};
