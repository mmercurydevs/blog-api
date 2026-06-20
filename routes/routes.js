const express = require("express");
const router = express.Router();
const repo = require("../repo/repo");

// GET /
// Returns the list of all posts with status "published".
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const { category, month, year } = req.query;

    const posts = await repo.showAllPosts({ page, limit, category, month, year });

    return res.json(posts);
  } catch (err) {
    console.log("Error displaying blog posts: ", err);
    res.status(500).send("Internal server error.");
  }
});

// GET /drafts
// Returns the list of all posts with status "draft".
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

module.exports = router;
