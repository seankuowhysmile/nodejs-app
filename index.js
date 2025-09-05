require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Todo = require("./models/todo");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB 連線
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error('error: ',err));


// ================== RESTful API ==================

// 查詢所有 Todo
app.get("/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos.map(t => ({ id: t._id, title: t.title, completed: t.completed })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增 Todo
app.post("/todos", async (req, res) => {
  try {
    const { title } = req.body;
    const todo = new Todo({ title });
    await todo.save();
    res.status(201).json({ id: todo._id, title: todo.title, completed: todo.completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新 Todo（title / completed）
app.put("/todos/:id", async (req, res) => {
  try {
    const { title, completed } = req.body;
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;

    await todo.save();
    res.json({ id: todo._id, title: todo.title, completed: todo.completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 刪除 Todo
app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });
    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
