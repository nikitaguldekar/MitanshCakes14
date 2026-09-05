import { useEffect, useState } from "react";

const BACKEND_URL =
  "https://reliable-light-production-157c.up.railway.app";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/orders`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Could not load orders"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Admin Orders Error:", error);

      setError(
        "Could not load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff8f5",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#963b3b",
          marginBottom: "8px",
        }}
      >
        MitanshCakes Admin Orders
      </h1>

      <p
        style={{
          fontSize: "18px",
          color: "#555",
          marginBottom: "30px",
        }}
      >
        View all customer orders
      </p>

      <button
        onClick={fetchOrders}
        style={{
          background: "#963b3b",
          color: "white",
          border: "none",
          padding: "14px 25px",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        Refresh Orders
      </button>

      {loading && (
        <p
          style={{
            fontSize: "18px",
            color: "#555",
          }}
        >
          Loading orders...
        </p>
      )}

      {error && (
        <p
          style={{
            color: "red",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <h2>No orders found</h2>
          <p>
            There are currently no orders in the database.
          </p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            background: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#963b3b",
                  color: "white",
                }}
              >
                <th style={tableCell}>Order ID</th>
                <th style={tableCell}>Customer</th>
                <th style={tableCell}>Phone</th>
                <th style={tableCell}>Email</th>
                <th style={tableCell}>Address</th>
                <th style={tableCell}>Items</th>
                <th style={tableCell}>Total</th>
                <th style={tableCell}>Status</th>
                <th style={tableCell}>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={tableCell}>
                    {order.id}
                  </td>

                  <td style={tableCell}>
                    {order.customer_name}
                  </td>

                  <td style={tableCell}>
                    {order.customer_phone}
                  </td>

                  <td style={tableCell}>
                    {order.customer_email || "-"}
                  </td>

                  <td style={tableCell}>
                    {order.delivery_address}
                  </td>

                  <td style={tableCell}>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {formatItems(order.items)}
                    </pre>
                  </td>

                  <td style={tableCell}>
                    ₹{Number(order.total_amount || 0)}
                  </td>

                  <td style={tableCell}>
                    {order.status || "Pending"}
                  </td>

                  <td style={tableCell}>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatItems(items) {
  try {
    const parsed =
      typeof items === "string"
        ? JSON.parse(items)
        : items;

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          const name =
            item.name ||
            item.product_name ||
            "Product";

          const quantity =
            item.quantity ||
            item.qty ||
            1;

          return `${name} × ${quantity}`;
        })
        .join("\n");
    }

    return JSON.stringify(parsed, null, 2);
  } catch {
    return String(items || "-");
  }
}

const tableCell = {
  padding: "14px",
  borderBottom: "1px solid #eeeeee",
  textAlign: "left",
  verticalAlign: "top",
};

export default AdminOrders;