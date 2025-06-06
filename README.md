

# Online Publication Management System

This project is a full-stack web application designed to streamline the lifecycle of online publications, from submission by authors, through peer review, to management by administrators. It features distinct roles for Users/Authors, Reviewers, and Administrators.

## Features

**General:**
*   User registration and secure login (JWT-based authentication).
*   Role-based access control for different functionalities.

**For Users/Authors:**
*   Submit new publications with metadata and PDF file uploads.
*   View a list of their own submitted publications and track their status (Pending Review, Needs Correction, Published, Rejected).
*   Update their submissions if in an editable state.
*   Delete their non-published submissions.
*   View their profile information.

**For Reviewers:**
*   Access a queue of publications awaiting their review.
*   View full publication details and download PDF content.
*   Submit reviews: change status (Published, Rejected, Needs Correction) and provide comments.

**For Administrators:**
*   Full user management: view all users, add new users (especially reviewers), edit user details/roles, delete users.
*   Full publication management: view all publications, filter by status/category, update any publication's details or status, delete any publication.
*   Can also act as a reviewer.

**Public:**
*   View a list of all "Published" publications with filtering and sorting.
*   View details and download PDF for published works.

## Technology Stack

**Backend:**
*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **MongoDB:** NoSQL document database.
*   **Mongoose:** ODM (Object Data Mapper) for MongoDB and Node.js.
*   **JSON Web Tokens (JWT):** For stateless authentication.
*   **bcryptjs:** For password hashing.
*   **Multer:** Middleware for handling `multipart/form-data` (file uploads).
*   **cors:** For enabling Cross-Origin Resource Sharing.
*   **dotenv:** For managing environment variables.

**Frontend:**
*   **React.js:** JavaScript library for building user interfaces.
*   **React Router:** For client-side navigation.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **Context API:** For global state management (e.g., authentication).
*   **CSS3:** For styling (using the `index.css` provided).

**Development Tools:**
*   Visual Studio Code (or preferred IDE)
*   Postman (for API testing)
*   MongoDB Compass (or `mongosh` for database management)
*   npm / yarn (for package management)
*   Git & GitHub/GitLab (for version control)

## Prerequisites

*   Node.js (v16.x LTS or later recommended)
*   npm (v8.x or later) or yarn (v1.22.x or later)
*   MongoDB Server (running locally or accessible via URI, e.g., MongoDB Atlas)
*   Git (for cloning the repository)

## Setup and Installation

**1. Clone the Repository:**
   ```bash
   git clone <your-repository-url>
   cd online-publication-system
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END

2. Backend Setup:

cd backend
npm install # or yarn install
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Create a .env file in the backend/ directory by copying .env.example.

Update the backend/.env file with your specific configurations:
env PORT=5000 MONGO_URI=mongodb://localhost:27017/online_publication_db # Replace with your MongoDB connection string JWT_SECRET=yourVeryStrongAndRandomJwtSecretKeyHere_ChangeThis NODE_ENV=development

Ensure your MongoDB server is running.

3. Frontend Setup:

cd ../frontend # From the project root, or just 'cd frontend' if you're in the root
npm install # or yarn install
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Create a .env file in the frontend/ directory by copying .env.example.

Update the frontend/.env file:
env REACT_APP_API_URL=http://localhost:5000/api REACT_APP_BASE_URL=http://localhost:5000
(Ensure REACT_APP_API_URL points to your backend server, and REACT_APP_BASE_URL is the root of your backend for static file access like PDFs).

Running the Application

Start the Backend Server:
Open a terminal in the backend/ directory and run:

npm run dev 
# This typically uses nodemon for auto-restarts during development.
# Alternatively, for a standard start: npm start
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

The backend server should be running on http://localhost:5000 (or the port specified in backend/.env).

Start the Frontend Development Server:
Open a new terminal in the frontend/ directory and run:

npm start
# or yarn start
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

This will usually open the application automatically in your web browser at http://localhost:3000.

API Endpoints Overview

(You can list key API endpoints here if desired, or refer to Postman documentation/API design documents if you have them. Example structure below)

Authentication (/api/auth):

POST /register: User registration.

POST /login: User login.

GET /me (Protected): Get current user details.

Publications (/api/publications):

GET /: List published publications.

POST / (Protected): Create a new publication.

GET /:id: Get a specific publication.

PUT /:id (Protected): Update a publication.

DELETE /:id (Protected): Delete own non-published publication.

GET /my-publications (Protected): List user's own publications.

GET /review/queue (Protected - Reviewer/Admin): Get publications for review.

PUT /review/:id (Protected - Reviewer/Admin): Submit a review.

GET /admin/all (Protected - Admin): Get all publications.

DELETE /admin/:id (Protected - Admin): Admin delete any publication.

Users (/api/users - Admin Protected):

GET /: List all users.

POST /add-reviewer: Create a new reviewer.

GET /:id: Get user by ID.

PUT /:id: Update user.

DELETE /:id: Delete user.

Static Files (/uploads):

GET /publications/:filename: Access uploaded PDF files.

Troubleshooting

Backend Not Starting:

Check backend/.env for correct MONGO_URI.

Ensure MongoDB server is running and accessible.

Look for errors in the backend terminal console.

Frontend Not Connecting to Backend (Network Error in browser console):

Ensure backend server is running.

Verify REACT_APP_API_URL in frontend/.env is correct and points to the running backend.

Check for CORS issues in the backend terminal if requests are being blocked.

Authentication Issues (Login fails, "Not Authorized"):

Verify JWT_SECRET is identical in the backend .env if you've changed it.

Check browser's Local Storage for the token after login.

Inspect Network tab for Authorization: Bearer <token> header on protected API calls.

Future Work / Enhancements

(Refer to section 7.8 or 8.5 of your project report for these)

Email Notifications

Advanced Search & Filtering

File Versioning

Detailed Admin Analytics Dashboard

Plagiarism Detection Integration

And more... (list other key future features)

