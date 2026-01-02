## WriteFlow – Server (Backend)

This folder contains the **backend** for WriteFlow.

It’s responsible for:
- Authentication (admin login + JWT verification)
- Blog management (CRUD + publish toggle + views counter)
- Comments and moderation (approve/delete)
- Newsletter subscriptions
- Newsletter email notifications (SMTP)
- AI features:
  - Generate blog content (Gemini)
  - Generate SEO fields (meta description + tags)
  - Generate a thumbnail image from the blog title (AI image → ImageKit)
- File uploads (blog thumbnail images)

---

### Tech Stack

- **Node.js** (ESM modules)
- **Express** (REST API)
- **MongoDB + Mongoose** (data storage)
- **JWT (jsonwebtoken)** (auth)
- **Multer** (multipart/form-data file uploads)
- **ImageKit** (image storage + transformation)
- **Google Gemini** via `@google/genai` (AI content + SEO generation)
- **Nodemailer** (SMTP email notifications)
- Simple in-memory rate limiting (custom middleware)

---

### Folder Structure

```
server/
  config/
    db.js                 # MongoDB connection
    gemini.js             # Gemini client + generateContent helper
    imagekit.js           # ImageKit SDK configuration
  controllers/
    adminController.js    # Admin login + dashboard + comment moderation
    blogController.js     # Blog CRUD + AI endpoints
    newsletterController.js
  middleware/
    auth.js               # JWT verification
    errorHandler.js       # Central error handler + async handler
    multer.js             # Upload middleware
    rateLimiter.js        # API/login/AI rate limiting
    validator.js          # Input validation helpers
  models/
    Blog.js
    Comment.js
    Subscriber.js
  routes/
    adminRoutes.js
    blogRoutes.js
    newsletterRoutes.js
  server.js               # Express app entry
  .env.example            # Example env variables
```

---

### API Overview

Base URL (local): `http://localhost:3000`

#### Admin
- `POST /api/admin/login`
- `GET /api/admin/dashboard` (auth)
- `GET /api/admin/blogs` (auth)
- `GET /api/admin/comments` (auth)
- `PATCH /api/admin/comments/approve-comment/:id` (auth)
- `DELETE /api/admin/comments/delete-comment/:id` (auth)

#### Blogs
- `GET /api/blogs/all` (published only)
- `GET /api/blogs/:id` (increments views)
- `POST /api/blogs/add` (auth, multipart)
- `PUT /api/blogs/update/:id` (auth, multipart)
- `DELETE /api/blogs/:id` (auth)
- `POST /api/blogs/toggle-publish/:id` (auth)

#### Comments
- `POST /api/blogs/add-comment/:id`
- `GET /api/blogs/comments/:id` (approved only)

#### AI Tools
- `POST /api/blogs/generate-content` (auth, rate-limited)
- `POST /api/blogs/generate-seo` (auth, rate-limited)
- `POST /api/blogs/generate-image` (auth, rate-limited)

#### Newsletter
- `POST /api/newsletter/subscribe`

When SMTP is configured, subscribing also sends a welcome email with recent posts.

---

### Authentication & Authorization

- Admin logs in using `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Server returns a JWT.
- Client sends the token on protected endpoints:

```
Authorization: Bearer <token>
```

Middleware:
- `middleware/auth.js` verifies token using `JWT_SECRET`.

---

### Blog Management Logic

- Blog model includes:
  - `title`, `subTitle`, `description` (HTML), `category`, `image`
  - `isPublished` (drafts supported)
  - `metaDescription` + `tags` (SEO)
  - `views` (auto-increment on read)

For blog creation/update:
- Image can come from an uploaded file (`multipart/form-data`) **or** a generated URL (`imageUrl`).

---

### AI Features

#### 1) Content generation
- Uses Gemini (`GEMINI_API_KEY`) and returns markdown content.

#### 2) SEO generation
- Uses Gemini to return a JSON object:
  - `metaDescription` (short plain text)
  - `tags` (array of strings)

#### 3) Image generation (title → thumbnail)
- Generates an image from a prompt built from `title` + `category`.
- Downloads the generated image and uploads it to ImageKit.
- Returns an optimized ImageKit URL.

Note: this uses a public image generation endpoint; you can swap it to a paid provider if you need stricter reliability.

---

### Upload Handling (Images)

- Multer accepts uploads as `image`.
- The server uploads the file to ImageKit and returns an optimized URL.
- Temporary files are cleaned up after upload.

---

### Environment Variables

Copy the example file and fill it:

```bash
cd server
copy .env.example .env
```

Required values (see `.env.example`):
- `MONGODB_URI`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `JWT_SECRET`
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- `GEMINI_API_KEY`
- `PORT`
- `CLIENT_URL`
- `NODE_ENV`

For email notifications:
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`
- `MAIL_FROM` (optional)

Security notes:
- Never commit `.env`.
- Use a strong `JWT_SECRET`.
- Keep API keys in a secrets manager in production.

---

### Run Locally

```bash
cd server
npm install
npm run server
```

This runs with Nodemon and auto-restarts on changes.

---

### Error Handling

- `middleware/errorHandler.js` provides:
  - a centralized error handler
  - an `asyncHandler` wrapper to avoid repetitive try/catch
  - an `AppError` helper for clean HTTP errors

---

### Troubleshooting

- **404 Route not found**: the server process may not have restarted after code changes.
- **CORS issues**: ensure `CLIENT_URL` matches your frontend URL (usually `http://localhost:5173`).
- **Mongo connection fails**: check `MONGODB_URI` and network access.
