const db = require("../db");

async function showAllPosts({ page = 1, limit = 10, category, month, year } = {}) {
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

module.exports = {
  showAllPosts,
  drafts,
  getBySlug,
};
