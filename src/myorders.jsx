import { useEffect, useState } from "react";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      let localOrders = [];

      try {
        const saved = JSON.parse(
          localStorage.getItem("mitansh_orders") || "[]"
        );
        if (Array.isArray(saved)) {
          localOrders = saved;
        }
      } catch (localError) {
        console.error("Local orders error:", localError);
      }

      try {
        const response = await fetch("https://reliable-light-production-157c.up.railway.app/api/orders");

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data = await response.json();

        const databaseOrders = Array.isArray(data)
          ? data
          : Array.isArray(data.orders)
          ? data.orders
          : [];

        /*
         * Combine MySQL orders with locally saved orders.
         * If an order already exists in MySQL, the MySQL copy wins.
         */
        const databaseIds = new Set(
          databaseOrders.map((order) => String(order.id))
        );

        const uniqueLocalOrders = localOrders.filter(
          (order) => !databaseIds.has(String(order.id))
        );

        setOrders([
          ...databaseOrders,
          ...uniqueLocalOrders,
        ]);

        setError("");
      } catch (err) {
        console.error("My Orders backend error:", err);

        /*
         * If backend is unavailable, still show the orders
         * saved by the customer's successful checkout.
         */
        if (localOrders.length > 0) {
          setOrders(localOrders);
          setError("");
        } else {
          setOrders([]);
          setError(
            "Unable to load orders. Please make sure the backend and MySQL are running."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);


  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "delivered") {
      return { background: "#e8f8ee", color: "#198754" };
    }

    if (value === "cancelled") {
      return { background: "#fdecec", color: "#dc3545" };
    }

    if (value === "confirmed" || value === "paid") {
      return { background: "#eaf2ff", color: "#0d6efd" };
    }

    return { background: "#fff4df", color: "#c77a00" };
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "100px 20px",
        background: "#fff8fa",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🧾</div>
          <h1 style={{ margin: "0 0 10px", fontSize: "38px", color: "#3b2028" }}>
            My Orders
          </h1>
          <p style={{ margin: 0, color: "#777", fontSize: "16px" }}>
            View your recent MitanshCakes orders
          </p>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              background: "#fff",
              borderRadius: "20px",
            }}
          >
            <div style={{ fontSize: "35px" }}>🍰</div>
            <p>Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              textAlign: "center",
              padding: "35px",
              background: "#fff",
              borderRadius: "20px",
              color: "#c62828",
            }}
          >
            <div style={{ fontSize: "35px" }}>⚠️</div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 30px",
              background: "#fff",
              borderRadius: "24px",
              boxShadow: "0 10px 35px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ fontSize: "60px", marginBottom: "15px" }}>🍰</div>
            <h2 style={{ margin: "0 0 10px", color: "#3b2028" }}>
              No Orders Yet
            </h2>
            <p style={{ color: "#777" }}>
              Your orders will appear here after you place an order.
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: "grid", gap: "22px" }}>
            {orders.map((order) => {
              let items = [];

              try {
                items =
                  typeof order.items === "string"
                    ? JSON.parse(order.items)
                    : order.items || [];
              } catch {
                items = [];
              }

              if (!Array.isArray(items)) {
                items = Array.isArray(items.products) ? items.products : [];
              }

              const statusStyle = getStatusStyle(order.status);

              return (
                <div
                  key={order.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    padding: "28px",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.07)",
                    border: "1px solid #f1e4e7",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: "0 0 6px", color: "#3b2028", fontSize: "22px" }}>
                        Order #{order.id}
                      </h2>
                      <p style={{ margin: 0, color: "#777" }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: "8px 16px",
                        borderRadius: "30px",
                        fontWeight: "700",
                        fontSize: "14px",
                        ...statusStyle,
                      }}
                    >
                      {order.status || "Pending"}
                    </span>
                  </div>

                  <div
                    style={{
                      background: "#fff8fa",
                      borderRadius: "16px",
                      padding: "18px",
                      marginBottom: "18px",
                    }}
                  >
                    <h3 style={{ margin: "0 0 12px", color: "#3b2028", fontSize: "17px" }}>
                      Ordered Items
                    </h3>

                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "15px",
                            padding: "8px 0",
                            borderBottom:
                              index !== items.length - 1
                                ? "1px solid #f0e2e6"
                                : "none",
                          }}
                        >
                          <span style={{ color: "#555" }}>
                            {item.name || "Product"} × {item.quantity || 1}
                          </span>
                          <strong style={{ color: "#3b2028" }}>
                            ₹
                            {(
                              Number(item.price || 0) * Number(item.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </strong>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "#777", margin: 0 }}>
                        Order item details unavailable.
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "15px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <small style={{ color: "#999" }}>Customer</small>
                      <div style={{ fontWeight: "600", color: "#444", marginTop: "4px" }}>
                        {order.customer_name || "N/A"}
                      </div>
                    </div>

                    <div>
                      <small style={{ color: "#999" }}>Phone</small>
                      <div style={{ fontWeight: "600", color: "#444", marginTop: "4px" }}>
                        {order.customer_phone || "N/A"}
                      </div>
                    </div>

                    <div>
                      <small style={{ color: "#999" }}>Delivery Address</small>
                      <div style={{ fontWeight: "600", color: "#444", marginTop: "4px" }}>
                        {order.delivery_address || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #eee",
                      paddingTop: "18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ color: "#777", fontSize: "14px" }}>
                      Total Amount
                    </span>
                    <strong style={{ fontSize: "25px", color: "#d6336c" }}>
                      ₹{Number(order.total_amount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyOrders;
