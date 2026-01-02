## WriteFlow – Client (Frontend)

WriteFlow is an AI-powered blog app. This folder contains the **frontend** built with React.

It’s responsible for:
- Rendering the public blog UI (home, blog details, comments, newsletter)
- Handling **admin login** and session persistence
- Providing the **admin dashboard** to create/edit/publish blogs
- Calling backend APIs for blogs, AI tools (content/SEO/image), and newsletter

---

### Tech Stack

- **React 19** (UI)
- **Vite** (dev server + build)
- **React Router** (routing)
- **Context API** (global state: auth token, search input, accent mode)
- **Tailwind CSS** (styling) + `@tailwindcss/vite`
- **Axios** (API calls)
- **Quill** (rich-text editor for blog content)
- **Marked** (Markdown → HTML for AI-generated content)
- **react-hot-toast** (notifications)
- **moment** (dates)

---

### Folder Structure (high level)

```
client/
	public/                 # Static assets
	src/
		assets/               # Images + shared assets map
		components/           # Reusable UI components
			admin/              # Admin-only UI components
		context/              # AppContext (token, blogs, search, accent mode)
		pages/                # Route-level pages (Home, Blog, Admin pages)
		App.jsx               # Routes
		main.jsx              # App bootstrap
		index.css             # Global styles (Tailwind + app styles)
	vite.config.js          # Vite configuration
	.env                    # Frontend env vars (local)
```

---

### Key Features

#### Public UI
- Blog listing with category tabs and search
- Blog details page with rich-text rendering
- Comments: view approved comments + add comment
- Newsletter subscription form
- Responsive layout (works on mobile and desktop)

#### Admin Experience
- Admin login with JWT token storage and auto session restore
- Create blog with:
	- Image upload or **AI-generated thumbnail**
	- Rich text editor (Quill)
	- AI content generation (Markdown → HTML)
	- SEO helpers: meta description + tags
- Edit blog with the same tools
- Publish/unpublish controls (draft support)

#### UX / Design
- Reusable components and consistent UI patterns
- Accent / theme mode switching (stored in `localStorage`)
- Toast-based feedback for actions and failures

---

### How the Frontend Talks to the Backend

The app uses Axios to call the backend REST API.

- Base URL is configured using `VITE_BASE_URL`.
- For admin endpoints, the JWT token is attached as `Authorization: Bearer <token>`.

API calls are made from:
- `src/context/AppContext.jsx` (global token handling + blog fetch)
- Admin pages (Add/Edit blog, SEO generation, image generation)
- Blog page (blog details + comments)

---

### Environment Variables

Create `client/.env`:

```env
VITE_BASE_URL=http://localhost:3000
```

Notes:
- `VITE_BASE_URL` must point to your backend server.
- Vite exposes only variables prefixed with `VITE_`.

---

### Run Locally

```bash
cd client
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

---

### Best Practices Followed

- Clear separation of **pages** vs **components**
- Centralized API configuration and auth header handling
- Reusable UI building blocks
- Defensive UI handling for rate-limits / API failures
- Responsive layout and accessible form inputs

---

### Troubleshooting

- **401 Unauthorized** on admin requests: log in again (token expired).
- **404 for an API route**: make sure the backend is running and restarted after changes.
- **CORS errors**: verify `CLIENT_URL` on the server matches your frontend URL.
