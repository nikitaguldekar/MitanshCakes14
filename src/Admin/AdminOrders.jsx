import { useEffect, useRef, useState } from "react";

const BACKEND_URL =
  "https://reliable-light-production-157c.up.railway.app";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const knownOrderIds = useRef(new Set());
  const firstLoad = useRef(true);

  /* =========================================================
     FETCH ORDERS
  ========================================================= */

  const fetchOrders = async () => {
    try {
      setError("");

      const response = await fetch(`${BACKEND_URL}/api/orders`);

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Could not load orders");
      }

      const latestOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      /* Detect new orders */
      if (!firstLoad.current) {
        const hasNewOrder = latestOrders.some(
          (order) => !knownOrderIds.current.has(order.id)
        );

        if (hasNewOrder) {
          setNewOrderAlert(true);
          playAlertSound();

          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("🍰 New MitanshCakes Order!", {
              body: "A new customer order has been received.",
            });
          }

          setTimeout(() => {
            setNewOrderAlert(false);
          }, 5000);
        }
      }

      knownOrderIds.current = new Set(
        latestOrders.map((order) => order.id)
      );

      firstLoad.current = false;

      setOrders(latestOrders);
    } catch (err) {
      console.error("Admin Orders Error:", err);
      setError(
        "Could not load orders. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     AUTO REFRESH + NOTIFICATION PERMISSION
  ========================================================= */

  useEffect(() => {
    fetchOrders();

    if (
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =========================================================
     UPDATE ORDER STATUS
  ========================================================= */

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `${BACKEND_URL}/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update order status"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );
    } catch (err) {
      console.error("Status Update Error:", err);
      alert(
        err.message ||
          "Could not update the order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /* =========================================================
     STATUS COLORS
  ========================================================= */

  const getStatusStyle = (status) => {
    const styles = {
      Pending: {
        background: "#fff3cd",
        color: "#856404",
      },
      Confirmed: {
        background: "#d1ecf1",
        color: "#0c5460",
      },
      Preparing: {
        background: "#e8d9ff",
        color: "#5b2c83",
      },
      "Out for Delivery": {
        background: "#cfe2ff",
        color: "#084298",
      },
      Delivered: {
        background: "#d1e7dd",
        color: "#0f5132",
      },
      Cancelled: {
        background: "#f8d7da",
        color: "#842029",
      },
    };

    return (
      styles[status] || {
        background: "#eeeeee",
        color: "#333333",
      }
    );
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff8f5",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                color: "#963b3b",
                margin: 0,
                fontSize: "32px",
              }}
            >
              🍰 MitanshCakes Admin Orders
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "#666",
                marginTop: "8px",
              }}
            >
              Manage customer orders and delivery status
            </p>
          </div>

          <button
            onClick={fetchOrders}
            style={{
              background: "#963b3b",
              color: "white",
              border: "none",
              padding: "13px 22px",
              borderRadius: "8px",
              fontSize: "15px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔄 Refresh Orders
          </button>
        </div>

        {/* NEW ORDER ALERT */}

        {newOrderAlert && (
          <div
            style={{
              background: "#198754",
              color: "white",
              padding: "18px 22px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "18px",
              fontWeight: "bold",
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            }}
          >
            🔔 NEW ORDER RECEIVED! Check the latest order below.
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#842029",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontWeight: "bold",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <h3>Loading orders...</h3>
          </div>
        )}

        {/* NO ORDERS */}

        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              background: "white",
              padding: "35px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2>No orders found</h2>
            <p>
              There are currently no orders in the database.
            </p>
          </div>
        )}

        {/* ORDERS TABLE */}

        {!loading && !error && orders.length > 0 && (
          <div
            style={{
              overflowX: "auto",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1250px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#963b3b",
                    color: "white",
                  }}
                >
                  {[
                    "Order ID",
                    "Customer",
                    "Phone",
                    "Email",
                    "Address",
                    "Items",
                    "Total",
                    "Status",
                    "Date",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={tableHeader}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const status =
                    order.status || "Pending";

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom:
                          "1px solid #eeeeee",
                      }}
                    >
                      <td style={tableCell}>
                        <strong>#{order.id}</strong>
                      </td>

                      <td style={tableCell}>
                        <strong>
                          {order.customer_name}
                        </strong>
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
                        <div
                          style={{
                            whiteSpace: "pre-line",
                            lineHeight: "1.6",
                            fontSize: "14px",
                          }}
                        >
                          {formatItems(order.items)}
                        </div>
                      </td>

                      <td style={tableCell}>
                        <strong>
                          ₹
                          {Number(
                            order.total_amount || 0
                          ).toLocaleString("en-IN")}
                        </strong>
                      </td>

                      {/* STATUS DROPDOWN */}

                      <td style={tableCell}>
                        <select
                          value={status}
                          disabled={
                            updatingId === order.id
                          }
                          onChange={(event) =>
                            updateStatus(
                              order.id,
                              event.target.value
                            )
                          }
                          style={{
                            ...getStatusStyle(status),
                            border: "none",
                            borderRadius: "7px",
                            padding: "9px 12px",
                            fontWeight: "bold",
                            fontSize: "14px",
                            cursor:
                              updatingId ===
                              order.id
                                ? "wait"
                                : "pointer",
                            outline: "none",
                          }}
                        >
                          {STATUS_OPTIONS.map(
                            (option) => (
                              <option
                                key={option}
                                value={option}
                              >
                                {option}
                              </option>
                            )
                          )}
                        </select>

                        {updatingId === order.id && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "5px",
                            }}
                          >
                            Updating...
                          </div>
                        )}
                      </td>

                      <td style={tableCell}>
                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleString("en-IN")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AUTO REFRESH MESSAGE */}

        <div
          style={{
            marginTop: "18px",
            color: "#777",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          🟢 Orders automatically refresh every 5 seconds
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FORMAT ITEMS
========================================================= */

function formatItems(items) {
  try {
    const parsed =
      typeof items === "string"
        ? JSON.parse(items)
        : items;

    const products = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.products)
      ? parsed.products
      : [];

    if (!products.length) {
      return "-";
    }

    return products
      .map((item) => {
        const name =
          item?.name ||
          item?.product_name ||
          "Product";

        const quantity = Number(
          item?.quantity ?? item?.qty ?? 1
        );

        return `${name} × ${quantity}`;
      })
      .join("\n");
  } catch (error) {
    console.error(
      "Items formatting error:",
      error
    );

    return "-";
  }
}

/* =========================================================
   ALERT SOUND
========================================================= */

function playAlertSound() {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator =
      context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      880,
      context.currentTime
    );

    gain.gain.setValueAtTime(
      0.001,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.25,
      context.currentTime + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.5
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(
      context.currentTime + 0.5
    );
  } catch (error) {
    console.log("Alert sound unavailable.");
  }
}

/* =========================================================
   TABLE STYLES
========================================================= */

const tableHeader = {
  padding: "15px",
  textAlign: "left",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

const tableCell = {
  padding: "14px",
  textAlign: "left",
  verticalAlign: "top",
  fontSize: "14px",
};

export default AdminOrders;