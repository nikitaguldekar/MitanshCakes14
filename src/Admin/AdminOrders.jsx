import { useEffect, useState } from "react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const BACKEND_URL =
    "https://mitanshcakes14-production.up.railway.app";

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BACKEND_URL}/api/orders`
      );

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Could not load orders");
      }

      setOrders(data.orders || []);
    } catch (error) {
      console.error("Admin Orders error:", error);

      setError(
        "Could not load orders. Please make sure the backend is running."
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
        padding: "40px",
        backgroundColor: "#fff7f2",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{
          color: "#8b3a3a",
          marginBottom: "10px",
        }}
      >
        MitanshCakes Admin Orders
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "25px",
        }}
      >
        View all customer orders
      </p>

      <button
        onClick={fetchOrders}
        style={{
          padding: "12px 20px",
          backgroundColor: "#8b3a3a",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "25px",
        }}
      >
        Refresh Orders
      </button>

      {loading && (
        <p style={{ fontSize: "18px" }}>
          Loading orders...
        </p>
      )}

      {error && (
        <p
          style={{
            color: "red",
            fontWeight: "bold",
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
          }}
        >
          <h2>No orders yet</h2>
          <p>Customer orders will appear here.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#8b3a3a",
                  color: "white",
                }}
              >
                <th style={tableCell}>Order ID</th>
                <th style={tableCell}>Customer</th>
                <th style={tableCell}>Phone</th>
                <th style={tableCell}>Address</th>
                <th style={tableCell}>Total</th>
                <th style={tableCell}>Status</th>
                <th style={tableCell}>Date</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={tableCell}>
                    #{order.id}
                  </td>

                  <td style={tableCell}>
                    {order.customer_name}

                    {order.customer_email && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#777",
                          marginTop: "4px",
                        }}
                      >
                        {order.customer_email}
                      </div>
                    )}
                  </td>

                  <td style={tableCell}>
                    {order.customer_phone}
                  </td>

                  <td style={tableCell}>
                    {order.delivery_address}
                  </td>

                  <td style={tableCell}>
                    ₹
                    {Number(
                      order.total_amount
                    ).toLocaleString("en-IN")}
                  </td>

                  <td style={tableCell}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        backgroundColor: "#fff3cd",
                        color: "#856404",
                        fontWeight: "bold",
                      }}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>

                  <td style={tableCell}>
                    {order.created_at
                      ? new Date(
                          order.created_at
                        ).toLocaleString("en-IN")
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

const tableCell = {
  padding: "14px",
  borderBottom: "1px solid #eeeeee",
  textAlign: "left",
  verticalAlign: "top",
};

export default AdminOrders;