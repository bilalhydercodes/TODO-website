const Todo = require("../models/todoModel");

exports.getIndex = async (req, res) => {
  const q = req.query.q || "";

  const todos = await Todo.find({ userId: req.session.user._id })
  .sort({ createdAt: -1 });


  const total = todos.length;
  const completed = todos.filter(t => t.isCompleted).length;
  const pending = total - completed;

  res.render("todos/index", {
    pageTitle: "Todo App",
    todos,
    stats: { total, completed, pending },
    q,
    priority: true,
    sort: true,
    status: true,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user                // ✅ optional
  });
};



exports.getNew = (req, res) => {
  res.render("todos/new", {
    pageTitle: "Create Task",
  });
};

exports.postNew = (req, res) => {
  // later you will save to MongoDB
  const dueDate = req.body.dueDate || new Date().toISOString().slice(0, 10);

  const { title, description, priority} = req.body;
  const newTodo = new Todo({
    title,
    description,
    priority,
    dueDate,
    userId: req.session.user._id, // ✅ add this
  })
   newTodo.save().then(() => {
    console.log("✅ New Todo:", req.body);
    res.redirect("/todos");
  }).catch((err)=>{
    console.log(err,"error while adding form");

    
  })
};

exports.getEdit = async(req, res) => {
  const id = req.params.id;
  const todo = await Todo.findById(id);
  if (!todo) return res.redirect("/todos");

  res.render("todos/edit", {
    pageTitle: "Edit Todo",
    todo: todo,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user
    
  });
};

exports.postEdit = (req, res) => {
  const id = req.params.id;
   const {title, description, priority, dueDate } = req.body;
   Todo.findById(id).then((todo) => {
    todo.title = title;
    todo.description = description;
    todo.priority = priority;
    todo.dueDate = dueDate;
    return todo.save();
  }).then(() => {
    console.log("✅ Edit Todo:", id, req.body);
    res.redirect("/todos");
  }).catch((err) => {
    console.log(err, "error while editing form");
  });
};

exports.postDelete=(req, res) => {
  const id = req.params.id;
  Todo.findByIdAndDelete(id).then(() => {
    console.log("✅ Deleted Todo:", id);
    res.redirect("/todos");
  }).catch((err) => {
    console.log(err, "error while deleting todo");
  });
}

exports.getDetail = async (req, res) => {
  const id = req.params.id;
  const todo = await Todo.findById(id);
  if (!todo) return res.redirect("/todos");

  res.render("todos/detail", {
    pageTitle: "Task Details",
    todo: todo,
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user
  });
}


exports.toggleTodo = async (req, res) => {
  console.log("✅ TOGGLE ROUTE HIT:", req.params.id);

  const id = req.params.id;
  const todo = await Todo.findById(id);

  console.log("Before:", todo?.isCompleted);

  todo.isCompleted = !todo.isCompleted;
  await todo.save();

  const updated = await Todo.findById(id);
  console.log("After:", updated?.isCompleted);

  return res.redirect("/todos");
};


 