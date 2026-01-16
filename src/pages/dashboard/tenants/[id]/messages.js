import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { useState, useEffect } from "react";
import { messageService } from "@/lib/messageService";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TenantMessagesPage() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [debugMeta, setDebugMeta] = useState(null);
  const [debugBody, setDebugBody] = useState(null);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    if (tenantId) {
      console.log("🔍 Tenant ID detected:", tenantId);
      fetchMessages();
    }
  }, [tenantId, filters]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      console.log("📤 Fetching messages with params:", {
        filters,
        tenantId,
      });
      const response = await messageService.getMessages(filters, tenantId);
      console.log("📥 Full API Response:", response);
      console.log("📧 Messages received:", response.messages);
      console.log("📊 Pagination info:", response.pagination);
      console.log("🔔 Unread count:", response.unread_count);

      // Debug meta attached by service
      setDebugMeta(response._meta || null);
      setDebugBody(response || null);

      setMessages(response.messages);
      setPagination(response.pagination);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error("❌ Failed to fetch messages:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      setDebugError({
        status: error.response?.status,
        data: error.response?.data,
        sent_headers: error.response?.config?.headers || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await messageService.updateMessage(
        messageId,
        { status: newStatus },
        tenantId
      );
      await fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
    } catch (error) {
      console.error("Failed to update message status:", error);
      alert("Failed to update message status");
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      await messageService.updateMessage(
        messageId,
        { status: "replied", reply_text: replyText },
        tenantId
      );
      setReplyText("");
      await fetchMessages();
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Failed to send reply:", error);
      alert("Failed to send reply");
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      await messageService.deleteMessage(messageId, tenantId);
      await fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      read: "bg-blue-100 text-blue-800",
      replied: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-800",
      spam: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <Link href={`/dashboard/tenants/${tenantId}/dashboard`}>
              <button
                className="btn btn-secondary"
                style={{ marginBottom: "1rem" }}
              >
                <ArrowLeft size={20} />
                Back to Tenant Dashboard
              </button>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Mail size={32} style={{ color: "var(--primary-color)" }} />
              <div>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    marginBottom: "0.25rem",
                  }}
                >
                  Messages & Contacts
                </h1>
                <p style={{ color: "var(--text-secondary)" }}>
                  {unreadCount > 0 && (
                    <span
                      style={{ fontWeight: 600, color: "var(--danger-color)" }}
                    >
                      {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {unreadCount === 0 && "All caught up!"}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem" }}>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value, page: 1 })
                }
                className="select"
              >
                <option value="">All Messages</option>
                <option value="pending">Pending</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
                <option value="spam">Spam</option>
              </select>

              <button
                onClick={() => fetchMessages()}
                className="btn btn-primary"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Debug Panel (shows request headers and response for troubleshooting) */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Debug: Request / Response
            </h3>
            <div
              style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
            >
              {debugMeta && (
                <div style={{ fontSize: "0.875rem" }}>
                  <strong>Sent Headers:</strong>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      background: "#f7fafc",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      marginTop: "0.5rem",
                    }}
                  >
                    {JSON.stringify(debugMeta.sent_headers, null, 2)}
                  </pre>
                </div>
              )}
              {debugMeta?.sent_config && (
                <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                  <strong>Sent Request Config:</strong>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      background: "#f7fafc",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      marginTop: "0.5rem",
                    }}
                  >
                    {JSON.stringify(debugMeta.sent_config, null, 2)}
                  </pre>
                </div>
              )}
              {debugBody && (
                <div style={{ fontSize: "0.875rem" }}>
                  <strong>Response (status {debugMeta?.status || "-"}):</strong>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      background: "#f7fafc",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      marginTop: "0.5rem",
                    }}
                  >
                    {JSON.stringify(debugBody, null, 2)}
                  </pre>
                </div>
              )}
              {debugError && (
                <div style={{ fontSize: "0.875rem" }}>
                  <strong>Error:</strong>
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      background: "#fff7f7",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      marginTop: "0.5rem",
                    }}
                  >
                    {JSON.stringify(debugError, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: "1.5rem",
            }}
          >
            {/* Messages List */}
            <div
              className="card"
              style={{ padding: 0, maxHeight: "600px", overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "1rem",
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h2 style={{ fontWeight: 600 }}>Inbox</h2>
              </div>
              <div style={{ overflowY: "auto", maxHeight: "540px" }}>
                {loading ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Loading...
                  </div>
                ) : messages.length === 0 ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No messages found
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === "pending") {
                          handleStatusChange(message.id, "read");
                        }
                      }}
                      style={{
                        padding: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                        cursor: "pointer",
                        background:
                          selectedMessage?.id === message.id
                            ? "var(--surface)"
                            : "white",
                      }}
                      className="hover-bg"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                          {message.sender_email}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            background:
                              message.status === "pending"
                                ? "var(--warning-color)"
                                : message.status === "read"
                                ? "var(--info-color)"
                                : message.status === "replied"
                                ? "var(--success-color)"
                                : "var(--text-secondary)",
                            color: "white",
                          }}
                        >
                          {message.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {message.subject}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Details */}
            <div>
              {selectedMessage ? (
                <div className="card">
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {selectedMessage.subject}
                        </h2>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          From:{" "}
                          <span style={{ fontWeight: 500 }}>
                            {selectedMessage.sender_email}
                          </span>
                          {selectedMessage.name && ` (${selectedMessage.name})`}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {formatDate(selectedMessage.created_at)}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          background:
                            selectedMessage.status === "pending"
                              ? "var(--warning-color)"
                              : selectedMessage.status === "read"
                              ? "var(--info-color)"
                              : selectedMessage.status === "replied"
                              ? "var(--success-color)"
                              : "var(--text-secondary)",
                          color: "white",
                        }}
                      >
                        {selectedMessage.status}
                      </span>
                    </div>

                    {/* Status Actions */}
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <select
                        value={selectedMessage.status}
                        onChange={(e) =>
                          handleStatusChange(selectedMessage.id, e.target.value)
                        }
                        className="select"
                        style={{ fontSize: "0.875rem" }}
                      >
                        <option value="pending">Pending</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                        <option value="spam">Spam</option>
                      </select>
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="btn btn-danger"
                        style={{ fontSize: "0.875rem" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                      Message:
                    </h3>
                    <div
                      style={{
                        background: "var(--surface)",
                        padding: "1rem",
                        borderRadius: "0.375rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selectedMessage.message}
                    </div>
                  </div>

                  {selectedMessage.reply_text && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                        Reply:
                      </h3>
                      <div
                        style={{
                          background: "#f0fdf4",
                          padding: "1rem",
                          borderRadius: "0.375rem",
                          borderLeft: "4px solid var(--success-color)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedMessage.reply_text}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <h3 style={{ fontWeight: 600, marginBottom: "0.75rem" }}>
                      Send Reply:
                    </h3>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={6}
                      className="input"
                      style={{ width: "100%", marginBottom: "0.75rem" }}
                    />
                    <button
                      onClick={() => handleReply(selectedMessage.id)}
                      className="btn btn-primary"
                    >
                      Send Reply
                    </button>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.5rem",
                      }}
                    >
                      Note: This updates the message status to "replied" and
                      stores your reply.
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="card"
                  style={{ padding: "3rem", textAlign: "center" }}
                >
                  <Mail
                    size={64}
                    style={{
                      color: "var(--text-secondary)",
                      opacity: 0.3,
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ color: "var(--text-secondary)" }}>
                    Select a message to view details
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={filters.page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={filters.page >= pagination.pages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
