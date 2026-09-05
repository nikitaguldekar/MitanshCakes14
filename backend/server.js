import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MitanshCakes backend is running!",
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS connected");

    res.json({
      success: true,
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error("Database test error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY id DESC"
    );

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load products.",
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load orders.",
    });
  }
});

app.post("/api/orders", async (req, res) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    items,
    total_amount,
    status,
  } = req.body;

  if (
    !customer_name ||
    !customer_phone ||
    !delivery_address ||
    !items ||
    total_amount === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required order details.",
    });
  }

  try {
    const itemsData =
      typeof items === "string"
        ? items
        : JSON.stringify(items);

    const [result] = await db.query(
      `
      INSERT INTO orders
      (
        customer_name,
        customer_phone,
        customer_email,
        delivery_address,
        items,
        total_amount,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        customer_name,
        customer_phone,
        customer_email || null,
        delivery_address,
        itemsData,
        Number(total_amount),
        status || "Pending",
      ]
    );

    res.json({
      success: true,
      message: "Order placed successfully! 🎉",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error("Order insert error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order.",
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});