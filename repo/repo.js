const db = require("../db");

async function showAllPosts({
  page = 1,
  limit = 10,
  category,
  month,
  year,
} = {}) {
  page = Number(page);
  limit = Number(limit);
  const offset = (page - 1) * limit;

  const conditions = ["a.status = 'published'"];
  const params = [];

  if (category) {
    params.push(category);
    conditions.push(`c.name ILIKE $${params.length}`);
  }
  if (month) {
    params.push(Number(month));
    conditions.push(`EXTRACT(MONTH FROM a.published_at) = $${params.length}`);
  }
  if (year) {
    params.push(Number(year));
    conditions.push(`EXTRACT(YEAR FROM a.published_at) = $${params.length}`);
  }

  params.push(limit, offset);
  const limitIdx = params.length - 1;
  const offsetIdx = params.length;

  const result = await db.query(
    `SELECT a.*, c.name AS category FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE ${conditions.join(" AND ")}
     ORDER BY a.id ASC LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );
  return result.rows;
}

async function drafts({ page = 1, limit = 10 } = {}) {
  page = Number(page);
  limit = Number(limit);
  const offset = (page - 1) * limit;
  const result = await db.query(
    "SELECT * FROM articles WHERE status = 'draft' ORDER BY id ASC LIMIT $1 OFFSET $2",
    [limit, offset],
  );

  return result.rows;
}

async function getBySlug(slug) {
  const result = await db.query(
    `SELECT a.*, c.name AS category FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE a.slug = $1 AND a.status = 'published'`,
    [slug],
  );
  return result.rows[0] || null;
}

async function newPost(title, body, category_name, status) {
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const publishedAt = status === "published" ? new Date() : null;

  const categoryResult = await db.query(
    "SELECT id FROM categories WHERE name ILIKE $1",
    [category_name],
  );

  if (categoryResult.rows.length === 0) {
    return null;
  }

  const category_id = categoryResult.rows[0].id;

  const result = await db.query(
    "INSERT INTO articles (title, slug, body, category_id, status, published_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
    [title, slug, body, category_id, status, publishedAt],
  );

  return result.rows[0];
}

async function deletePost(slug) {
  const result = await db.query(
    "DELETE FROM articles WHERE slug = $1 RETURNING *;",
    [slug],
  );
  return result.rows[0] || null;
}

async function updatePost(slug, updates) {
  const { title, body, category_name, status } = updates;
  const setClauses = [];
  const params = [];

  if (title !== undefined) {
    params.push(title);
    setClauses.push(`title = $${params.length}`);
    params.push(title.toLowerCase().replace(/\s+/g, "-"));
    setClauses.push(`slug = $${params.length}`);
  }

  if (body !== undefined) {
    params.push(body);
    setClauses.push(`body = $${params.length}`);
  }

  if (category_name !== undefined) {
    const categoryResult = await db.query(
      "SELECT id FROM categories WHERE name ILIKE $1",
      [category_name],
    );

    if (categoryResult.rows.length === 0) {
      return null;
    }

    params.push(categoryResult.rows[0].id);
    setClauses.push(`category_id = $${params.length}`);
  }

  if (status !== undefined) {
    params.push(status);
    setClauses.push(`status = $${params.length}`);
    params.push(status === "published" ? new Date() : null);
    setClauses.push(`published_at = $${params.length}`);
  }

  if (setClauses.length === 0) {
    const result = await db.query(
      "SELECT * FROM articles WHERE slug = $1",
      [slug],
    );
    return result.rows[0] || null;
  }

  params.push(slug);
  const slugIdx = params.length;

  const result = await db.query(
    `UPDATE articles SET ${setClauses.join(", ")} WHERE slug = $${slugIdx} RETURNING *;`,
    params,
  );

  return result.rows[0] || null;
}

module.exports = {
  showAllPosts,
  drafts,
  getBySlug,
  newPost,
  deletePost,
  updatePost,
};
