import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function ensureOrdersTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(50) NOT NULL,
      customer_email VARCHAR(255),
      delivery_address TEXT NOT NULL,
      items LONGTEXT NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Orders table is ready!");
}

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MitanshCakes backend is running!",
  });
});

/* =========================
   DATABASE TEST
========================= */

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 1 AS connected"
    );

    res.json({
      success: true,
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error(
      "Database test error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
      error: error.message,
    });
  }
});

/* =========================
   PRODUCTS
========================= */

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
    console.error(
      "Products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load products.",
      error: error.message,
    });
  }
});

/* =========================
   ALL ORDERS
   ADMIN USES THIS
========================= */

app.get("/api/orders", async (req, res) => {
  try {
    await ensureOrdersTable();

    const [orders] = await db.query(
      "SELECT * FROM orders ORDER BY id DESC"
    );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load orders.",
      error: error.message,
    });
  }
});

/* =========================
   CUSTOMER MY ORDERS
   SEARCH BY PHONE
========================= */

app.get(
  "/api/orders/customer",
  async (req, res) => {
    try {
      await ensureOrdersTable();

      const phone = String(
        req.query.phone || ""
      ).trim();

      if (!phone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is required.",
        });
      }

      const [orders] = await db.query(
        `
        SELECT *
        FROM orders
        WHERE customer_phone = ?
        ORDER BY id DESC
        `,
        [phone]
      );

      res.json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Customer orders error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load customer orders.",
        error: error.message,
      });
    }
  }
);

/* =========================
   PLACE NEW ORDER
========================= */

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
      message:
        "Missing required order details.",
    });
  }

  try {
    await ensureOrdersTable();

    const itemsData =
      typeof items === "string"
        ? items
        : JSON.stringify(items);

    const amount = Number(total_amount);

    if (!Number.isFinite(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

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
        amount,
        status || "Pending",
      ]
    );

    console.log(
      `🍰 NEW ORDER CREATED: #${result.insertId}`
    );

    res.json({
      success: true,
      message:
        "Order placed successfully! 🎉",
      orderId: result.insertId,
    });
  } catch (error) {
    console.error(
      "Order insert error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to place order.",
      error: error.message,
    });
  }
});

/* =========================
   START SERVER
========================= */

async function startServer() {
  try {
    await ensureOrdersTable();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `🚀 MitanshCakes server running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "❌ Could not initialize database:",
      error
    );

    process.exit(1);
  }
}

startServer();