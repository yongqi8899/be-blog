import express from "express";
import cors from "cors";
import pg from "pg";
const { Pool } = pg;

const PORT = process.env.PORT || 8000; 

const app = express(); 
const pool = new Pool({ connectionString: process.env.PG_URI });

app.use(express.json());
app.use(cors());
// get all posts
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts");
    console.log(result);
    const rows = result.rows;
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// get a single post
app.get("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM posts WHERE id = $1", [
      id,
    ]);
    if (!rows.length) throw new Error("Order not found");
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// create a post
app.post("/posts", async (req, res) => {
  try {
    const { title, author, content, cover } = req.body;
    if (!title || !author || !content || !cover)
      throw new Error("Missing data");

    const { rows } = await pool.query(
      "INSERT INTO posts (title, author, content, cover) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, author, content, cover]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// update a post
app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, content, cover } = req.body;
    if (!title || !author || !content) throw new Error("Missing data");

    const { rows } = await pool.query(
      "UPDATE posts SET title = $1, author = $2, content = $3, cover = $4 WHERE id = $5 RETURNING *;",
      [title, author, content, cover, id]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Posts", error.stack);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
});
// delete a post
app.delete("/posts/:id", async (req, res) => {
  try {
    const {id} = req.params;
    await pool.query('DELETE FROM posts WHERE id = $1 RETURNING *', [id]);
    return res.json({ success: 'Posts deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
