import React, { useState, useEffect } from "react";
import { messageService } from "../lib/messageService";
import {
  Mail,
  RefreshCw,
  Trash2,
  Send,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import Cookies from "js-cookie";

export default function MessagesInbox() {
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

  const user = JSON.parse(Cookies.get("user") || "{}");
  const tenantId = user?.tenant_id;

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageService.getMessages(filters, tenantId);
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
        tenantId,
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
        tenantId,
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

  const getStatusStyle = (status) => {
    const styles = {
      pending: { background: "#fef3c7", color: "#92400e" },
      read: { background: "#dbeafe", color: "#1e40af" },
      replied: { background: "#d1fae5", color: "#065f46" },
      archived: { background: "#f3f4f6", color: "#374151" },
      spam: { background: "#fee2e2", color: "#991b1b" },
    };
    return styles[status] || { background: "#f3f4f6", color: "#374151" };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "0.25rem",
          }}
        >
          Messages & Contacts
        </h1>
        {unreadCount > 0 && (
          <p
            style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.9375rem" }}
          >
            {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "var(--surface, #fff)",
          border: "1px solid var(--border-color, #e5e7eb)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid var(--border-color, #d1d5db)",
            borderRadius: "0.5rem",
            background: "var(--background, #fff)",
            color: "var(--text-primary, #111827)",
            fontSize: "0.875rem",
            outline: "none",
          }}
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
            gap: "0.375rem",
            padding: "0.5rem 1rem",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
      >
        {/* Inbox Sidebar */}
        <div>
          <div
            style={{
              background: "var(--surface, #fff)",
              border: "1px solid var(--border-color, #e5e7eb)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "0.875rem 1.25rem",
                borderBottom: "1px solid var(--border-color, #e5e7eb)",
                background: "var(--background, #f9fafb)",
              }}
            >
              <h2 style={{ fontWeight: 600, fontSize: "0.9375rem" }}>Inbox</h2>
            </div>
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {loading ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary, #6b7280)",
                  }}
                >
                  Loading...
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-secondary, #6b7280)",
                  }}
                >
                  No messages found
                </div>
              ) : (
                messages.map((message, index) => {
                  const isSelected = selectedMessage?.id === message.id;
                  return (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === "pending") {
                          handleStatusChange(message.id, "read");
                        }
                      }}
                      style={{
                        padding: "0.875rem 1.25rem",
                        cursor: "pointer",
                        borderBottom:
                          index < messages.length - 1
                            ? "1px solid var(--border-color, #e5e7eb)"
                            : "none",
                        background: isSelected
                          ? "rgba(99, 102, 241, 0.08)"
                          : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background =
                            "var(--background, #f9fafb)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight:
                              message.status === "pending" ? 700 : 500,
                            fontSize: "0.8125rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "160px",
                          }}
                        >
                          {message.sender_email}
                        </span>
                        <span
                          style={{
                            ...getStatusStyle(message.status),
                            fontSize: "0.6875rem",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "999px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            flexShrink: 0,
                          }}
                        >
                          {message.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--text-primary, #111827)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {message.subject}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary, #6b7280)",
                          marginTop: "0.25rem",
                        }}
                      >
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                  gap: "0.25rem",
                  padding: "0.375rem 0.75rem",
                  background: "var(--surface, #f3f4f6)",
                  color: "var(--text-primary, #374151)",
                  border: "1px solid var(--border-color, #d1d5db)",
                  borderRadius: "0.5rem",
                  cursor: filters.page === 1 ? "not-allowed" : "pointer",
                  opacity: filters.page === 1 ? 0.5 : 1,
                  fontSize: "0.8125rem",
                }}
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary, #6b7280)",
                }}
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
                  gap: "0.25rem",
                  padding: "0.375rem 0.75rem",
                  background: "var(--surface, #f3f4f6)",
                  color: "var(--text-primary, #374151)",
                  border: "1px solid var(--border-color, #d1d5db)",
                  borderRadius: "0.5rem",
                  cursor:
                    filters.page >= pagination.pages
                      ? "not-allowed"
                      : "pointer",
                  opacity: filters.page >= pagination.pages ? 0.5 : 1,
                  fontSize: "0.8125rem",
                }}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div>
          {selectedMessage ? (
            <div
              style={{
                background: "var(--surface, #fff)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "1rem",
                overflow: "hidden",
              }}
            >
              {/* Detail Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid var(--border-color, #e5e7eb)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: "bold",
                        marginBottom: "0.375rem",
                      }}
                    >
                      {selectedMessage.subject}
                    </h2>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary, #6b7280)",
                      }}
                    >
                      From:{" "}
                      <span
                        style={{
                          fontWeight: 500,
                          color: "var(--text-primary, #111827)",
                        }}
                      >
                        {selectedMessage.sender_email}
                      </span>
                      {selectedMessage.name && (
                        <span> ({selectedMessage.name})</span>
                      )}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary, #9ca3af)",
                        marginTop: "0.25rem",
                      }}
                    >
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <span
                    style={{
                      ...getStatusStyle(selectedMessage.status),
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "999px",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedMessage.status}
                  </span>
                </div>

                {/* Actions Row */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <select
                    value={selectedMessage.status}
                    onChange={(e) =>
                      handleStatusChange(selectedMessage.id, e.target.value)
                    }
                    style={{
                      padding: "0.375rem 0.625rem",
                      fontSize: "0.8125rem",
                      border: "1px solid var(--border-color, #d1d5db)",
                      borderRadius: "0.375rem",
                      background: "var(--background, #fff)",
                      color: "var(--text-primary, #111827)",
                      outline: "none",
                    }}
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
                      gap: "0.25rem",
                      padding: "0.375rem 0.75rem",
                      background: "#dc2626",
                      color: "#fff",
                      border: "none",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    fontSize: "0.9375rem",
                  }}
                >
                  Message:
                </h3>
                <div
                  style={{
                    background: "var(--background, #f9fafb)",
                    padding: "1rem 1.25rem",
                    borderRadius: "0.75rem",
                    whiteSpace: "pre-wrap",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    color: "var(--text-primary, #1f2937)",
                  }}
                >
                  {selectedMessage.message}
                </div>

                {/* Existing Reply */}
                {selectedMessage.reply_text && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h3
                      style={{
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        fontSize: "0.9375rem",
                      }}
                    >
                      Reply:
                    </h3>
                    <div
                      style={{
                        background: "#ecfdf5",
                        padding: "1rem 1.25rem",
                        borderRadius: "0.75rem",
                        borderLeft: "4px solid #10b981",
                        whiteSpace: "pre-wrap",
                        fontSize: "0.9375rem",
                        lineHeight: 1.6,
                        color: "#065f46",
                      }}
                    >
                      {selectedMessage.reply_text}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div style={{ marginTop: "1.5rem" }}>
                  <h3
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      fontSize: "0.9375rem",
                    }}
                  >
                    Send Reply:
                  </h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "1px solid var(--border-color, #d1d5db)",
                      borderRadius: "0.75rem",
                      fontSize: "0.9375rem",
                      lineHeight: 1.5,
                      resize: "vertical",
                      outline: "none",
                      background: "var(--background, #fff)",
                      color: "var(--text-primary, #111827)",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) =>
                      (e.target.style.borderColor =
                        "var(--border-color, #d1d5db)")
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.75rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary, #9ca3af)",
                      }}
                    >
                      Note: This updates the message status to
                      &quot;replied&quot; and stores your reply.
                    </p>
                    <button
                      onClick={() => handleReply(selectedMessage.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 1.25rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      <Send size={16} />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "var(--surface, #fff)",
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: "1rem",
                padding: "4rem 2rem",
                textAlign: "center",
                color: "var(--text-secondary, #9ca3af)",
              }}
            >
              <Inbox
                size={56}
                style={{ margin: "0 auto 1rem", opacity: 0.4 }}
              />
              <p style={{ fontSize: "1rem" }}>
                Select a message to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
