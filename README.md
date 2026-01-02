# WriteFlow – AI Powered Blog App

WriteFlow is a full‑stack blog platform that helps you **write, manage, and publish blog posts faster**.

It includes:
- A clean **public blog UI** for readers
- A secure **admin panel** for managing content
- AI tools to generate **blog content**, **SEO fields**, and **thumbnail images**

This repository is split into two parts:
- `client/` → React frontend
- `server/` → Node/Express backend

---

## Key Features

### Blogging
- Create, edit, publish/unpublish blog posts
- Draft support (`isPublished`)
- Rich text editor for content
- Categories + search
- Tags + meta description
- View count tracking

### Comments
- Add comments on blogs
- Admin moderation: approve/delete comments

### Newsletter
- Email subscription endpoint
- Email notifications for newly published blogs (SMTP)

### AI Tools
- Generate blog content (Markdown) with Gemini
- Generate SEO metadata (meta description + tags)
- Generate a thumbnail image from the blog title

### UI / UX
- Responsive layout (mobile → desktop)
- Reusable components and consistent styling
- Accent/theme mode (stored in localStorage)

---

## High-Level Architecture

```
Browser (React)
  |
  |  REST API (Axios)
  v
Server (Express)
  |
  |  Mongoose
  v
MongoDB

AI:
- Gemini API (content + SEO)
Images:
- ImageKit (upload + optimize)
```

---

## Project Structure

```
WriteFlow/
  client/
    src/
    public/
    README.md
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
    server.js
    README.md
  README.md
```

---

## Tech Stack

### Frontend
- React + Vite
- React Router
- Context API
- Tailwind CSS
- Axios
- Quill editor

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer (file uploads)
- ImageKit (image storage)
- Google Gemini (`@google/genai`) for AI

---

## Setup (Run Locally)

### 1) Backend

```bash
cd server
npm install
copy .env.example .env
npm run server
```

Backend runs on: `http://localhost:3000`

### 2) Frontend

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
```

Then run:

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Environment Setup Notes

- Don’t commit `.env` files.
- Use strong secrets (`JWT_SECRET`).
- In production, store keys in a secret manager.

---

## Screenshots

> Add screenshots here for GitHub/portfolio.

- Home page (blog list)
- Blog details page
- Admin dashboard
- Create/Edit blog

---

## Roadmap / Future Enhancements

- Tag pages / tag filters in URL (SEO-friendly)
- Pagination and server-side search
- Image generation provider selection (OpenAI/Stability/Replicate)
- Richer editor features (code blocks, embeds)
- Role-based access (multiple admins)
- Deploy scripts + CI

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Make changes with clear commits
4. Open a pull request

---

## License

This project is released under the MIT License (update this if you use a different license).
