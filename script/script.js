const express = require("express");
const mysql = require("mysql");
const app = express();
const expressPort = 3001;

app.use(express.json());

const dataBase = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: "3306",
    password: "root",
    database: "restaurantss2",
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


app.get("/items", (req, res) => {
    const sql = `
        SELECT items.*, item_category.id_category 
        FROM items 
        LEFT JOIN item_category ON items.id = item_category.item_id
    `;

    dataBase.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", message: err.message });
        }

        res.status(200).json(result);
    });
});



app.post("/createItem", (req, res) => {
    const { name, price, description, id_category } = req.body;

    if (!name || !price || !id_category) {
        return res.status(400).json({ message: "Name, price, and category are required." });
    }

    const insertItemSql = "INSERT INTO items (name, price, description) VALUES (?, ?, ?)";
    const values = [name, price, description];

    dataBase.query(insertItemSql, values, (err, categoryResult) => {
        if (err) {
            return res.status(500).json({ message: "Error inserting item", error: err.message });
        }
        const item_id = categoryResult.insertId;

        const insertItemSqlid = "INSERT INTO item_category(item_id, id_category) VALUES (?, ?)";
        const valuesid = [item_id, id_category];

        dataBase.query(insertItemSqlid, valuesid, (err, result) => {
            if (err) {
                return res.status(500).send(err.message);
            }
           
            res.status(201).json({ id: item_id, name, price, description, id_category });
        });
    });
});



app.put("/updateItem/:id", (req, res) => {
    const { name, price, description, id_category } = req.body;
    const itemId = req.params.id; 

    if (!name || !price || !id_category) {
        return res.status(400).json({ message: "Name, price, and category are required." });
    }

    const updateItemSql = "UPDATE items SET name = ?, price = ?, description = ? WHERE id = ?";
    const values = [name, price, description, itemId]; 

    dataBase.query(updateItemSql, values, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error updating item", error: err.message });
        }

        const updateItemSqlid = "UPDATE item_category SET id_category = ? WHERE item_id = ?";
        const valuesid = [id_category, itemId];

        dataBase.query(updateItemSqlid, valuesid, (err, result) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            res.status(200).json({ id: itemId, name, price, description, id_category });
        });
    });
});



app.delete("/deleteItem/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM items WHERE id = ?";
    
    dataBase.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Server error", message: err.message });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        const deleteCategorySql = "DELETE FROM item_category WHERE item_id = ?";
        dataBase.query(deleteCategorySql, [id], (err) => {
            if (err) {
                return res.status(500).json({ error: "Error deleting item from category", message: err.message });
            }
            res.status(200).json({ message: "Item and associated category data deleted successfully" });
        });
    });
});

