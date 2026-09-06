import { useEffect, useRef, useState } from "react";

const API_URL =
  "https://reliable-light-production-157c.up.railway.app/api/orders";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const knownOrderIds = useRef(new Set());
  const firstLoad = useRef(true);
  const audioContextRef = useRef(null);

  const playAlertSound = () => {
    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContext) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(
        1100,
        audioContext.currentTime + 0.15
      );

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.25,
        audioContext.currentTime + 0.02
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (soundError) {
      console.warn("Alert sound unavailable:", soundError);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        await Notification.requestPermission();
      }
    } catch (notificationError) {
      console.warn(
        "Notification permission unavailable:",
        notificationError
      );
    }
  };

  const showNewOrderNotification = (order) => {
    try {
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("🍰 New MitanshCakes Order!", {
          body: `Order #${order.id} from ${order.customer_name} — ₹${Number(
            order.total_amount
          ).toFixed(2)}`,
        });
      }
    } catch (notificationError) {
      console.warn(
        "Browser notification unavailable:",
        notificationError
      );
    }
  };

  const fetchOrders = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setLoading(true);
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to load orders.");
      }

      const fetchedOrders = Array.isArray(data.orders)
        ? data.orders
        : [];

      const sortedOrders = [...fetchedOrders].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );

      if (!firstLoad.current) {
        const newlyCreatedOrders = sortedOrders.filter(
          (order) => !knownOrderIds.current.has(String(order.id))
        );

        if (newlyCreatedOrders.length > 0) {
          const newestOrder = newlyCreatedOrders[0];

          setNewOrderAlert(true);
          playAlertSound();
          showNewOrderNotification(newestOrder);

          setTimeout(() => {
            setNewOrderAlert(false);
          }, 7000);
        }
      }

      knownOrderIds.current = new Set(
        sortedOrders.map((order) => String(order.id))
      );

      setOrders(sortedOrders);
      setLastUpdated(new Date());
      setError("");
      firstLoad.current = false;
    } catch (fetchError) {
      console.error("Orders loading error:", fetchError);
      setError(
        fetchError.message ||
          "Unable to connect to the MitanshCakes backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    requestNotificationPermission();
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "Pending").toLowerCase();

    if (normalized === "paid") {
      return "status-paid";
    }

    if (normalized === "completed") {
      return "status-completed";
    }

    if (normalized === "cancelled") {
      return "status-cancelled";
    }

    if (normalized === "processing") {
      return "status-processing";
    }

    return "status-pending";
  };

  const parseItems = (items) => {
    if (!items) return [];

    try {
      const parsed =
        typeof items === "string" ? JSON.parse(items) : items;

      if (Array.isArray(parsed)) {
        return parsed;
      }

      if (Array.isArray(parsed.products)) {
        return parsed.products;
      }

      return [];
    } catch {
      return [];
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fff7f2 0%, #fff0f6 100%)",
        padding: "30px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#3a2028",
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .admin-container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .admin-header {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            margin-bottom: 20px;
          }

          .admin-title {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            color: #7b2145;
          }

          .admin-subtitle {
            margin: 8px 0 0;
            color: #777;
            font-size: 15px;
          }

          .admin-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 20px;
            flex-wrap: wrap;
          }

          .refresh-button {
            border: none;
            background: #7b2145;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 700;
            font-size: 14px;
          }

          .refresh-button:hover {
            opacity: 0.9;
          }

          .updated-text {
            color: #777;
            font-size: 13px;
          }

          .new-order-alert {
            background: #e8f8ee;
            border: 2px solid #36a269;
            color: #176b40;
            padding: 16px 20px;
            border-radius: 14px;
            margin-bottom: 20px;
            font-weight: 800;
            text-align: center;
            animation: alertPulse 1s ease-in-out infinite alternate;
          }

          @keyframes alertPulse {
            from {
              transform: scale(1);
            }
            to {
              transform: scale(1.01);
            }
          }

          .error-box {
            background: #fff0f0;
            border: 1px solid #e3a0a0;
            color: #a12626;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 20px;
          }

          .orders-card {
            background: white;
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.08);
            overflow-x: auto;
          }

          .orders-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1050px;
          }

          .orders-table th {
            text-align: left;
            padding: 15px 12px;
            background: #fff5f8;
            color: #7b2145;
            font-size: 13px;
            border-bottom: 2px solid #f0dce3;
            white-space: nowrap;
          }

          .orders-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
            font-size: 14px;
          }

          .orders-table tr:hover {
            background: #fffafc;
          }

          .order-number {
            font-weight: 800;
            color: #7b2145;
          }

          .customer-name {
            font-weight: 700;
            margin-bottom: 5px;
          }

          .customer-phone {
            color: #666;
            font-size: 13px;
          }

          .customer-email {
            color: #888;
            font-size: 12px;
            margin-top: 3px;
            word-break: break-word;
          }

          .address {
            max-width: 220px;
            line-height: 1.5;
            color: #555;
          }

          .items-list {
            margin: 0;
            padding-left: 18px;
            min-width: 200px;
          }

          .items-list li {
            margin-bottom: 6px;
            line-height: 1.35;
          }

          .item-price {
            color: #777;
            font-size: 12px;
          }

          .total {
            font-size: 16px;
            font-weight: 800;
            color: #7b2145;
            white-space: nowrap;
          }

          .payment {
            font-weight: 700;
            text-transform: uppercase;
            font-size: 12px;
          }

          .status-badge {
            display: inline-block;
            padding: 7px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            white-space: nowrap;
          }

          .status-paid {
            background: #e6f7ed;
            color: #21854d;
          }

          .status-pending {
            background: #fff3d9;
            color: #a46a00;
          }

          .status-processing {
            background: #e8efff;
            color: #355bb5;
          }

          .status-completed {
            background: #e4f7ff;
            color: #14708d;
          }

          .status-cancelled {
            background: #ffe7e7;
            color: #b32d2d;
          }

          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #777;
          }

          .empty-state-icon {
            font-size: 50px;
            margin-bottom: 15px;
          }

          .loading {
            text-align: center;
            padding: 50px;
            color: #777;
          }

          @media (max-width: 700px) {
            .admin-page {
              padding: 15px !important;
            }

            .admin-title {
              font-size: 25px;
            }

            .admin-header {
              padding: 20px;
            }
          }
        `}
      </style>

      <div className="admin-container admin-page">
        <div className="admin-header">
          <h1 className="admin-title">
            🍰 MitanshCakes — Admin Orders
          </h1>

          <p className="admin-subtitle">
            Live customer orders from the MitanshCakes website
          </p>

          <div className="admin-actions">
            <button
              className="refresh-button"
              onClick={() => fetchOrders(true)}
            >
              🔄 Refresh Orders
            </button>

            <span className="updated-text">
              Auto-refresh: every 5 seconds
              {lastUpdated
                ? ` • Last updated: ${lastUpdated.toLocaleTimeString(
                    "en-IN"
                  )}`
                : ""}
            </span>
          </div>
        </div>

        {newOrderAlert && (
          <div className="new-order-alert">
            🔔 🎉 NEW ORDER RECEIVED! Check the latest order below.
          </div>
        )}

        {error && (
          <div className="error-box">
            ❌ {error}
            <br />
            <small>
              Make sure the Railway backend is running.
            </small>
          </div>
        )}

        <div className="orders-card">
          {loading ? (
            <div className="loading">
              Loading MitanshCakes orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h2>No orders yet</h2>
              <p>
                New customer orders will automatically appear here.
              </p>
            </div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const items = parseItems(order.items);

                  let paymentMethod = "";

                  try {
                    const parsed =
                      typeof order.items === "string"
                        ? JSON.parse(order.items)
                        : order.items;

                    paymentMethod =
                      parsed?.payment_method || "";
                  } catch {
                    paymentMethod = "";
                  }

                  return (
                    <tr key={order.id}>
                      <td>
                        <span className="order-number">
                          #{order.id}
                        </span>
                      </td>

                      <td>
                        <div className="customer-name">
                          {order.customer_name}
                        </div>

                        <div className="customer-phone">
                          📞 {order.customer_phone}
                        </div>

                        {order.customer_email && (
                          <div className="customer-email">
                            ✉️ {order.customer_email}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="address">
                          {order.delivery_address}
                        </div>
                      </td>

                      <td>
                        {items.length > 0 ? (
                          <ul className="items-list">
                            {items.map((item, index) => (
                              <li key={index}>
                                <strong>
                                  {item.name}
                                </strong>

                                {item.size && (
                                  <>
                                    {" "}
                                    ({item.size})
                                  </>
                                )}

                                {" × "}
                                {item.quantity || 1}

                                {item.price && (
                                  <div className="item-price">
                                    {item.price}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          "Order details unavailable"
                        )}
                      </td>

                      <td>
                        <span className="total">
                          ₹
                          {Number(
                            order.total_amount
                          ).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <span className="payment">
                          {paymentMethod || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;