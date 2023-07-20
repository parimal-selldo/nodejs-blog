const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Just check the login
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if(!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(err) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
}

router.get("/admin", async (req, res) => {
  try {
    let locals = {
      title: "Admin Panel"
    }
    res.render("admin/index", { locals, layout: adminLayout });
  } catch(err) {
    console.log(err);
  }
});

/*
  POST/
  Admin - check login
*/

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch(err) {
    console.log(err);
  }
});

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const data = await Post.find();
    res.render("admin/dashboard", { locals: { title: "Dashboard" }, data, layout: adminLayout })
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  GET
  admin - create new post
*/
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    res.render("admin/add-post", { locals: { title: "Add post" }, layout: adminLayout })
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  POST
  admin - create new post
*/
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect("/dashboard");

    } catch(err) {
      console.log("err: "+ err);
    }
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  GET
  admin - update post
*/
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {

    const data = await Post.findOne({ _id: req.params.id });
    res.render("admin/edit-post", { locals: { title: "Edit post" }, data, layout: adminLayout} );
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  PUT
  admin - update post
*/
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });
    res.redirect(`/edit-post/${req.params.id}`);
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  DELETE
  admin - delete post
*/
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({
      _id: req.params.id
    });
    res.redirect("/dashboard");
  } catch(err) {
    console.log("err: "+ err);
  }
});

/*
  POST/
  Admin - register
*/
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User created", user })
    } catch (err) {
      if(err.code === 11000) { res.status(409).json({ message: "User already in use" }) }
      res.status(500).json({ message: "Internal server error" });
    }
  } catch(err) {
    console.log(err);
  }
});

/*
  GET/
  Admin - logout
*/
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
