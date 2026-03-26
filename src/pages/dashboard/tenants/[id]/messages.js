import { useRouter } from "next/router";
import { useTenantBySlug } from "@/lib/useTenantBySlug";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { useState, useEffect } from "react";
import { messageService } from "@/lib/messageService";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TenantMessagesPage() {
  const router = useRouter();
  const { id: tenantId } = router.query;
  const { tenantId: resolvedTenantId } = useTenantBySlug();
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

  useEffect(() => {
    if (resolvedTenantId) {
      fetchMessages();
    }
  }, [resolvedTenantId, filters]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(
        filters,
        resolvedTenantId,
      );

      setMessages(response.messages);
      setPagination(response.pagination);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await messageService.updateMessage(
        messageId,
        { status: newStatus },
        resolvedTenantId,
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
        resolvedTenantId,
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
      await messageService.deleteMessage(messageId, resolvedTenantId);
      await fetchMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
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
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--surface)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                <ArrowLeft size={16} />
                Back to Tenant Dashboard
              </button>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <Mail size={24} />
              </div>
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
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Refresh
              </button>
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
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          padding: "0.5rem 1rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fecaca",
                          borderRadius: "0.5rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
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
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
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
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: 500,
                  cursor: filters.page === 1 ? "not-allowed" : "pointer",
                  opacity: filters.page === 1 ? 0.5 : 1,
                }}
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
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  fontWeight: 500,
                  cursor:
                    filters.page >= pagination.pages
                      ? "not-allowed"
                      : "pointer",
                  opacity: filters.page >= pagination.pages ? 0.5 : 1,
                }}
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
