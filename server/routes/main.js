const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// routes
router.get("", async (req, res) => {
  try {
    let perPage = 4;
    let page = req.query.page || 1;
    const data = await Post.aggregate([{ '$sort': { 'createdAt': 1 } }])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      data: data,
      current: page,
      locals: { title: "Blogs" },
      nextPage: hasNextPage ? nextPage : null
    });

  } catch(err) {
    console.log(err);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;
    const data = await Post.findById({ _id: slug });
    res.render("post", { data: data, locals: { title: data.title }, });
  } catch(err) {
    console.log(err);
  }
});

router.post("/search", async (req, res) => {
  try {
    let slug = req.body.searchTerm;
    const searchNoSpecialChar = slug.replace(/[^a-zA-Z0-9]/g, "");

    const data = await Post.find(
      {
        '$or': [
          { title: { '$regex': new RegExp(searchNoSpecialChar, 'i') } },
          { body: { '$regex': new RegExp(searchNoSpecialChar, 'i') } }
        ]
      }
    );
    console.log(data);
    res.render("search", { data: data, locals: { title: "Search" }, });
  } catch(err) {
    console.log(err);
  }
});


module.exports = router;
