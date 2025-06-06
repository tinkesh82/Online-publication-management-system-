import mongoose from "mongoose";

const PublicationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [250, "Description cannot be more than 250 characters"],
    },
    authorNames: {
      type: [String],
      required: [true, "At least one author name is required"],
      validate: [
        {
          validator: (val) => val.length > 0,
          message: "Author names array cannot be empty.",
        },
        {
          validator: (val) =>
            val.every(
              (name) => typeof name === "string" && name.trim().length > 0
            ),
          message: "All author names must be non-empty strings.",
        },
      ],
    },
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["magazine", "book", "research_paper", "journal"],
    },
    content: {
      type: String,
      required: [true, "Publication PDF is required"],
    },
    doi: {
      type: String,
      trim: true,
    },
    dateOfPublication: {
      type: Date,
      required: [true, "Date of publication is required (e.g., YYYY-MM-DD)"],
    },
    yearOfPublication: {
      // Derived from dateOfPublication
      type: Number,
      index: true,
    },
    volume: {
      type: String, // Using String for flexibility (e.g., "Vol. 3", "Special Issue")
      trim: true,
      // required: false, // Default is optional. Add 'required: true' if mandatory.
    },
    status: {
      type: String,
      enum: ["pending_review", "needs_correction", "published", "rejected"],
      default: "pending_review",
    },
    reviewerComments: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically set yearOfPublication from dateOfPublication
PublicationSchema.pre("save", function (next) {
  if (this.isModified("dateOfPublication") || this.isNew) {
    if (
      this.dateOfPublication instanceof Date &&
      !isNaN(this.dateOfPublication)
    ) {
      this.yearOfPublication = this.dateOfPublication.getFullYear();
    } else {
      if (!this.dateOfPublication) {
        // If dateOfPublication is cleared or invalid
        this.yearOfPublication = undefined;
      }
    }
  }
  next();
});

// Indexes
PublicationSchema.index({
  title: "text",
  description: "text",
  authorNames: "text",
});
PublicationSchema.index({ category: 1 });
// yearOfPublication is already indexed above
PublicationSchema.index({ status: 1 });
PublicationSchema.index({ dateOfPublication: 1 });

const Publication = mongoose.model("Publication", PublicationSchema);
export default Publication;
