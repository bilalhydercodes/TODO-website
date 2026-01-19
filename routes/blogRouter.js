const express = require('express');
const blogController = require('../controllers/blogController');
const router = express.Router();

router.get('/blog', blogController.getBlogs);
router.get('/blog/new', blogController.getNewBlogForm);
router.post('/blog/new', blogController.postNewBlog);
router.get('/blog/post/:blogId', blogController.getBlog);

module.exports = router;
