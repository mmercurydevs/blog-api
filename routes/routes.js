const express = require("express");
const router = express.Router();
const repo = require("../repo/repo");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // cap at 100 to prevent oversized queries
    const { category, month, year } = req.query;

    const posts = await repo.showAllPosts({
      page,
      limit,
      category,
      month,
      year,
    });

    return res.json(posts);
  } catch (err) {
    console.log("Error displaying blog posts: ", err);
    res.status(500).send("Internal server error.");
  }
});

router.get("/drafts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const drafts = await repo.drafts({ page, limit });

    return res.json(drafts);
  } catch (err) {
    console.log("Error displaying drafts: ", err);
    res.status(500).send("Internal server error.");
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const post = await repo.getBySlug(req.params.slug);

    if (!post) return res.status(404).json({ error: "Post not found." });

    return res.json(post);
  } catch (err) {
    console.log("Error fetching post by slug: ", err);
    res.status(500).send("Internal server error.");
  }
});

router.post("/new", async (req, res) => {
  try {
    const { title, body, category, status } = req.body;

    const newPost = await repo.newPost(title, body, category, status);

    if (!newPost) {
      return res.status(404).json({ error: "Category not found." });
    }

    return res.status(201).json({ message: "Post created.", post: newPost });
  } catch (err) {
    console.log("Error creating a new post: ", err);
    res.status(500).send("Internal server error.");
  }
});

router.patch("/:slug", async (req, res) => {
  try {
    const { title, body, category, status } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (body !== undefined) updates.body = body;
    if (category !== undefined) updates.category_name = category;
    if (status !== undefined) updates.status = status;

    const updatedPost = await repo.updatePost(req.params.slug, updates);

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res.status(200).json({ message: "Post updated.", post: updatedPost });
  } catch (err) {
    console.log("Error updating post: ", err);
    res.status(500).send("Internal server error.");
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const deletedPost = await repo.deletePost(req.params.slug);

    if (!deletedPost) {
      return res.status(404).json({ error: "Post not found." });
    }

    return res
      .status(200)
      .json({ message: "Post deleted.", post: deletedPost });
  } catch (err) {
    console.log("Error deleting post: ", err);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
