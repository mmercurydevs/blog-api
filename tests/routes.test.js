const request = require("supertest");
const app = require("../index");
const db = require("../db");

async function createTestPost(slug, title = "Test Post", status = "draft") {
  await db.query(
    `INSERT INTO articles (title, slug, body, category_id, status, published_at)
     VALUES ($1, $2, $3, (SELECT id FROM categories WHERE name = 'Technology'), $4, $5)`,
    [
      title,
      slug,
      "Test body content",
      status,
      status === "published" ? new Date() : null,
    ],
  );
}

async function cleanupTestPosts() {
  await db.query("DELETE FROM articles WHERE slug LIKE 'test-%'");
}

afterEach(async () => {
  await cleanupTestPosts();
});

afterAll(async () => {
  await db.end();
});

describe("GET /", () => {
  it("should return a list of published posts", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("slug");
    expect(res.body[0]).toHaveProperty("category");
  });

  it("should only return published posts", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    res.body.forEach((post) => {
      expect(post.status).toBe("published");
    });
  });
});

describe("GET /drafts", () => {
  it("should return a list of draft posts", async () => {
    const res = await request(app).get("/drafts");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((post) => {
      expect(post.status).toBe("draft");
    });
  });
});

describe("GET /:slug", () => {
  it("should return a published post by slug", async () => {
    const res = await request(app).get(
      "/why-i-started-building-a-blog-api",
    );

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("why-i-started-building-a-blog-api");
    expect(res.body.title).toBe("Why I Started Building a Blog API");
  });

  it("should return 404 for a draft post", async () => {
    const res = await request(app).get(
      "/notes-from-a-tarot-pull-i-did-not-expect",
    );

    expect(res.status).toBe(404);
  });

  it("should return 404 for a non-existent slug", async () => {
    const res = await request(app).get("/test-non-existent");

    expect(res.status).toBe(404);
  });
});

describe("POST /new", () => {
  it("should create a new post with valid data", async () => {
    const res = await request(app)
      .post("/new")
      .send({
        title: "Test New Post",
        body: "This is a test post body.",
        category: "Technology",
        status: "draft",
      });

    expect(res.status).toBe(201);
    expect(res.body.post).toBeDefined();
    expect(res.body.post.title).toBe("Test New Post");
    expect(res.body.post.slug).toBe("test-new-post");
  });

  it("should set published_at when status is published", async () => {
    const res = await request(app)
      .post("/new")
      .send({
        title: "Test Published Post",
        body: "This is a published test post.",
        category: "Personal",
        status: "published",
      });

    expect(res.status).toBe(201);
    expect(res.body.post.status).toBe("published");
    expect(res.body.post.published_at).not.toBeNull();
  });

  it("should return 404 when category does not exist", async () => {
    const res = await request(app)
      .post("/new")
      .send({
        title: "Test Invalid Category",
        body: "This should fail.",
        category: "NonExistentCategory",
        status: "draft",
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Category not found.");
  });
});

describe("PATCH /:slug", () => {
  beforeEach(async () => {
    await createTestPost("test-post-patch", "Test Patch Post", "draft");
  });

  it("should update a post title and regenerate slug", async () => {
    const res = await request(app)
      .patch("/test-post-patch")
      .send({ title: "Test Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.post.title).toBe("Test Updated Title");
    expect(res.body.post.slug).toBe("test-updated-title");
  });

  it("should update post body", async () => {
    const res = await request(app)
      .patch("/test-post-patch")
      .send({ body: "Updated body content." });

    expect(res.status).toBe(200);
    expect(res.body.post.body).toBe("Updated body content.");
  });

  it("should update post status to published and set published_at", async () => {
    const res = await request(app)
      .patch("/test-post-patch")
      .send({ status: "published" });

    expect(res.status).toBe(200);
    expect(res.body.post.status).toBe("published");
    expect(res.body.post.published_at).not.toBeNull();
  });

  it("should update post category", async () => {
    const res = await request(app)
      .patch("/test-post-patch")
      .send({ category: "Personal" });

    expect(res.status).toBe(200);

    const check = await db.query(
      `SELECT c.name AS category FROM articles a
       JOIN categories c ON a.category_id = c.id
       WHERE a.slug = $1`,
      ["test-post-patch"],
    );
    expect(check.rows[0].category).toBe("Personal");
  });

  it("should return 404 when post does not exist", async () => {
    const res = await request(app)
      .patch("/test-non-existent")
      .send({ title: "Test New Title" });

    expect(res.status).toBe(404);
  });

  it("should return 404 when category does not exist", async () => {
    const res = await request(app)
      .patch("/test-post-patch")
      .send({ category: "NonExistentCategory" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /:slug", () => {
  beforeEach(async () => {
    await createTestPost("test-post-delete", "Test Delete Post", "draft");
  });

  it("should delete an existing post", async () => {
    const res = await request(app).delete("/test-post-delete");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post deleted.");
    expect(res.body.post.slug).toBe("test-post-delete");

    const check = await db.query(
      "SELECT * FROM articles WHERE slug = $1",
      ["test-post-delete"],
    );
    expect(check.rows.length).toBe(0);
  });

  it("should return 404 when post does not exist", async () => {
    const res = await request(app).delete("/test-non-existent");

    expect(res.status).toBe(404);
  });
});
