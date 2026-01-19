const Blog = require('../models/blogModel');

exports.getBlogs = (req, res, next) => {
  Blog.find({ userId: req.session.user._id })
    .then(blogs => {
      res.render('blog/blogs', {
        pageTitle: 'Blog',
        path: '/blog',
        blogs: blogs,
        currentPage:true,

      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .then(blog => {
      res.render('blog/blog-detail', {
        pageTitle: blog.title,
        path: '/blog',
        blog: blog,
        currentPage:true,
      });
    })
    .catch(err => console.log(err));
};

exports.getNewBlogForm = (req, res, next) => {
  res.render('blog/create-blog', {
    pageTitle: 'Create Blog',
    path: '/blog/new',
    currentPage:true,
  });
};

exports.postNewBlog = (req, res, next) => {
  const { title, content } = req.body;
  const blog = new Blog({
    title: title,
    content: content,
    author: req.session.user._id,
    userId:req.session.user._id
  });
  blog.save()
    .then(result => {
      res.redirect('/blog');
    })
    .catch(err => {
      console.log(err);
    });
};
