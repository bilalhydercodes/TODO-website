const express = require("express");
const todoController = require("../controllers/todoController");
const isAuth = require("../middleware/is-auth");

const todoRouter = express.Router();

todoRouter.get("/", isAuth, todoController.getIndex);      // /todos
todoRouter.get("/new", isAuth, todoController.getNew);     // /todos/new
todoRouter.post("/new", isAuth, todoController.postNew);   // /todos/new

todoRouter.get("/:id/edit", isAuth, todoController.getEdit);     // /todos/:id/edit
todoRouter.post("/:id/edit", isAuth, todoController.postEdit);
todoRouter.post("/:id/delete", isAuth, todoController.postDelete);
todoRouter.get("/:id/detail", isAuth, todoController.getDetail);

todoRouter.post("/:id/toggle", isAuth, todoController.toggleTodo);



module.exports = todoRouter;
