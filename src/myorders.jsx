import { useEffect, useState } from "react";

const BACKEND_URL =
  "https://reliable-light-production-157c.up.railway.app";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/orders/customer?phone=${encodeURIComponent(
          cleanPhone
        )}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message || "Could not load orders."
        );
      }

      setOrders(data.orders || []);
    } catch (err) {
      console.error("My Orders Error:", err);
      setOrders([]);
      setError(
        "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    const value = String(
      status || "Pending"
    ).toLowerCase();

    if (value === "delivered") {
      return {
        background: "#e8f8ee",
        color: "#198754",
      };
    }

    if (value === "cancelled") {
      return {
        background: "#fdecec",
        color: "#dc3545",
      };
    }

    if (
      value === "confirmed" ||
      value === "paid"
    ) {
      return {
        background: "#eaf2ff",
        color: "#0d6efd",
      };
    }

    return {
      background: "#fff4df",
      color: "#c77a00",
    };
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "100px 20px",
        background: "#fff8fa",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "35px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "10px",
            }}
          >
            🧾
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "38px",
              color: "#3b2028",
            }}
          >
            My Orders
          </h1>

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "16px",
            }}
          >
            Enter your phone number to view your MitanshCakes orders
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "25px",
            borderRadius: "20px",
            boxShadow:
              "0 10px 35px rgba(0,0,0,0.07)",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  loadOrders();
                }
              }}
              placeholder="Enter your phone number"
              style={{
                flex: 1,
                minWidth: "220px",
                padding: "14px 16px",
                borderRadius: "10px",
                border:
                  "1px solid #ddd",
                fontSize: "16px",
                outline: "none",
              }}
            />

            <button
              onClick={loadOrders}
              disabled={loading}
              style={{
                background: loading
                  ? "#aaa"
                  : "#963b3b",
                color: "white",
                border: "none",
                padding:
                  "14px 25px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Loading..."
                : "🔍 View My Orders"}
            </button>
          </div>

          {error && (
            <p
              style={{
                color: "#c62828",
                margin:
                  "15px 0 0",
                fontWeight: "600",
              }}
            >
              {error}
            </p>
          )}
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
            <div
              style={{
                fontSize: "35px",
              }}
            >
              🍰
            </div>

            <p>
              Loading your orders...
            </p>
          </div>
        )}

        {!loading &&
          searched &&
          !error &&
          orders.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding:
                  "60px 30px",
                background: "#fff",
                borderRadius: "24px",
                boxShadow:
                  "0 10px 35px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                  marginBottom: "15px",
                }}
              >
                🍰
              </div>

              <h2
                style={{
                  margin:
                    "0 0 10px",
                  color: "#3b2028",
                }}
              >
                No Orders Found
              </h2>

              <p
                style={{
                  color: "#777",
                }}
              >
                We couldn't find any orders
                for this phone number.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <div
              style={{
                display: "grid",
                gap: "22px",
              }}
            >
              {orders.map((order) => {
                let items = [];

                try {
                  const parsed =
                    typeof order.items ===
                    "string"
                      ? JSON.parse(
                          order.items
                        )
                      : order.items;

                  if (
                    Array.isArray(parsed)
                  ) {
                    items = parsed;
                  } else if (
                    Array.isArray(
                      parsed?.products
                    )
                  ) {
                    items =
                      parsed.products;
                  }
                } catch {
                  items = [];
                }

                const statusStyle =
                  getStatusStyle(
                    order.status
                  );

                return (
                  <div
                    key={order.id}
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "24px",
                      padding: "28px",
                      boxShadow:
                        "0 10px 35px rgba(0,0,0,0.07)",
                      border:
                        "1px solid #f1e4e7",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "15px",
                        flexWrap:
                          "wrap",
                        marginBottom:
                          "20px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin:
                              "0 0 6px",
                            color:
                              "#3b2028",
                            fontSize:
                              "22px",
                          }}
                        >
                          Order #
                          {order.id}
                        </h2>

                        <p
                          style={{
                            margin: 0,
                            color:
                              "#777",
                          }}
                        >
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <span
                        style={{
                          padding:
                            "8px 16px",
                          borderRadius:
                            "30px",
                          fontWeight:
                            "700",
                          fontSize:
                            "14px",
                          ...statusStyle,
                        }}
                      >
                        {order.status ||
                          "Pending"}
                      </span>
                    </div>

                    <div
                      style={{
                        background:
                          "#fff8fa",
                        borderRadius:
                          "16px",
                        padding:
                          "18px",
                        marginBottom:
                          "18px",
                      }}
                    >
                      <h3
                        style={{
                          margin:
                            "0 0 12px",
                          color:
                            "#3b2028",
                          fontSize:
                            "17px",
                        }}
                      >
                        Ordered Items
                      </h3>

                      {items.length >
                      0 ? (
                        items.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                gap:
                                  "15px",
                                padding:
                                  "8px 0",
                                borderBottom:
                                  index !==
                                  items.length -
                                    1
                                    ? "1px solid #f0e2e6"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "#555",
                                }}
                              >
                                {item.name ||
                                  "Product"}{" "}
                                ×{" "}
                                {item.quantity ||
                                  1}
                              </span>

                              <strong
                                style={{
                                  color:
                                    "#3b2028",
                                }}
                              >
                                ₹
                                {(
                                  Number(
                                    String(
                                      item.price ||
                                        0
                                    ).replace(
                                      /[^0-9.]/g,
                                      ""
                                    )
                                  ) *
                                  Number(
                                    item.quantity ||
                                      1
                                  )
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>
                            </div>
                          )
                        )
                      ) : (
                        <p
                          style={{
                            color:
                              "#777",
                            margin: 0,
                          }}
                        >
                          Order item details
                          unavailable.
                        </p>
                      )}
                    </div>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px",
                        marginBottom:
                          "20px",
                      }}
                    >
                      <div>
                        <small
                          style={{
                            color:
                              "#999",
                          }}
                        >
                          Customer
                        </small>

                        <div
                          style={{
                            fontWeight:
                              "600",
                            color:
                              "#444",
                            marginTop:
                              "4px",
                          }}
                        >
                          {order.customer_name ||
                            "N/A"}
                        </div>
                      </div>

                      <div>
                        <small
                          style={{
                            color:
                              "#999",
                          }}
                        >
                          Phone
                        </small>

                        <div
                          style={{
                            fontWeight:
                              "600",
                            color:
                              "#444",
                            marginTop:
                              "4px",
                          }}
                        >
                          {order.customer_phone ||
                            "N/A"}
                        </div>
                      </div>

                      <div>
                        <small
                          style={{
                            color:
                              "#999",
                          }}
                        >
                          Delivery Address
                        </small>

                        <div
                          style={{
                            fontWeight:
                              "600",
                            color:
                              "#444",
                            marginTop:
                              "4px",
                          }}
                        >
                          {order.delivery_address ||
                            "N/A"}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop:
                          "1px solid #eee",
                        paddingTop:
                          "18px",
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "15px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#777",
                          fontSize:
                            "14px",
                        }}
                      >
                        Total Amount
                      </span>

                      <strong
                        style={{
                          fontSize:
                            "25px",
                          color:
                            "#d6336c",
                        }}
                      >
                        ₹
                        {Number(
                          order.total_amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
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