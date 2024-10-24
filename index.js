const express = require("express");
const mysql = require("mysql");
const app = express();
const expressPort = 3000;

app.use(express.json());

const dataBase = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "root",
    database: "restaurantss",
});

dataBase.connect((err) => {
    if (err) {
        console.log("Error connecting to the database");
    } else {
        console.log("Connected to the database");
    }
});

app.listen(expressPort, () => {
    console.log(`Server running on port: ${expressPort}`);
});

// Get all items
app.get("/items", (req, res) => {
    const sql = "SELECT * FROM items";
    dataBase.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error" });
        }
        res.status(200).json(result);
    });
});


app.post("/createItem", (req, res) => {
    const { name, price, description } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required." });
    }

    const insertItemSql = "INSERT INTO items (name, price, description) VALUES (?, ?, ?)";
    dataBase.query(insertItemSql, [name, price, description || null], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        res.status(201).json({ message: "Item created successfully.", id: result.insertId });
    });
});




app.put("/updateItem/:id", (req, res) => {
    const { id } = req.params;
    const { name, description, price, id_category } = req.body;

    if (!name || !description || !price || !id_category) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = "UPDATE items SET name = ?, description = ?, price = ?, id_category = ? WHERE id = ?";
    dataBase.query(sql, [name, description, price, id_category, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Error updating item", details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item updated successfully" });
    });
});


app.delete("/deleteItem/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM items WHERE id = ?";
    dataBase.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Item not found");
        }

        res.status(200).send("Item deleted successfully");
    });
});
