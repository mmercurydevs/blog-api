# Blog API

A RESTful API for a personal blog, built with Node.js, Express, and PostgreSQL. Supports creating, reading, updating, and deleting articles, with category filtering, pagination, and draft/publish workflow.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** PostgreSQL (via `pg`)
- **Testing:** Jest + Supertest
- **Containerization:** Docker

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or via Docker)

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
PORT=3000

DB_USER=postgres
DB_HOST=localhost
DB_NAME=blog
DB_PASSWORD=your_password
DB_PORT=5432
DB_MAX=10
```

3. Set up the database and seed data:

```bash
psql -U postgres -d blog -f seed.sql
```

4. Start the server:

```bash
node index.js
```

The API will be available at `http://localhost:3000`.

### Running with Docker

```bash
docker build -t blog-api .
docker run -p 3000:3000 --env-file .env blog-api
```

### Development (with auto-reload)

```bash
npx nodemon index.js
```

## API Reference

All routes are relative to the base URL (e.g. `http://localhost:3000`).

### Get all published posts

```
GET /
```

Query parameters:

| Parameter  | Type   | Description                        |
|------------|--------|------------------------------------|
| `page`     | number | Page number (default: 1)           |
| `limit`    | number | Posts per page (default: 10, max: 100) |
| `category` | string | Filter by category name            |
| `month`    | number | Filter by publication month (1–12) |
| `year`     | number | Filter by publication year         |

**Response:** `200 OK` — array of published article objects.

---

### Get all drafts

```
GET /drafts
```

Query parameters: `page`, `limit` (same as above).

**Response:** `200 OK` — array of draft article objects.

---

### Get a single post by slug

```
GET /:slug
```

Only returns published posts.

**Response:** `200 OK` — article object, or `404` if not found or is a draft.

---

### Create a new post

```
POST /new
```

**Request body (JSON):**

```json
{
  "title": "My New Post",
  "body": "Post content goes here.",
  "category": "Technology",
  "status": "draft"
}
```

- `status` must be `"draft"` or `"published"`.
- `published_at` is set automatically when status is `"published"`.
- The `slug` is generated from the title (lowercase, spaces replaced with hyphens).

**Response:** `201 Created` — `{ message, post }`, or `404` if the category does not exist.

---

### Update a post

```
PATCH /:slug
```

All fields are optional. Only provided fields are updated.

**Request body (JSON):**

```json
{
  "title": "Updated Title",
  "body": "Updated content.",
  "category": "Personal",
  "status": "published"
}
```

- Updating `title` regenerates the slug.
- Setting `status` to `"published"` sets `published_at` automatically.

**Response:** `200 OK` — `{ message, post }`, or `404` if not found.

---

### Delete a post

```
DELETE /:slug
```

**Response:** `200 OK` — `{ message, post }` with the deleted article, or `404` if not found.

---

## Database Schema

```sql
categories (id, name)
articles   (id, title, slug, body, category_id, status, published_at, created_at, updated_at)
```

Default seed data includes three categories — **Technology**, **Personal**, and **Tarot & Reflection** — and three sample articles.

## Running Tests

Tests use Jest and Supertest and run against a real database connection (no mocks).

```bash
npm test
```

Make sure the database is running and the `.env` file is configured before running tests. Test data is cleaned up automatically after each test.
