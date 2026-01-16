import React, { useState, useEffect } from "react";
import { messageService } from "../lib/messageService";
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages & Contacts</h1>
        <p className="text-gray-600">
          {unreadCount > 0 && (
            <span className="font-semibold text-red-600">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex gap-4">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold">Inbox</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : messages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
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
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm truncate">
                        {message.sender_email}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          message.status
                        )}`}
                      >
                        {message.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 truncate">
                      {message.subject}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={filters.page >= pagination.pages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-sm text-gray-600">
                      From:{" "}
                      <span className="font-medium">
                        {selectedMessage.sender_email}
                      </span>
                      {selectedMessage.name && ` (${selectedMessage.name})`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-sm px-3 py-1 rounded ${getStatusColor(
                      selectedMessage.status
                    )}`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) =>
                      handleStatusChange(selectedMessage.id, e.target.value)
                    }
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                    <option value="spam">Spam</option>
                  </select>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-2">Message:</h3>
                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>

                {selectedMessage.reply_text && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">Reply:</h3>
                    <div className="bg-green-50 p-4 rounded whitespace-pre-wrap border-l-4 border-green-500">
                      {selectedMessage.reply_text}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Send Reply:</h3>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleReply(selectedMessage.id)}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send Reply
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Note: This updates the message status to "replied" and
                    stores your reply. Actual email sending may require
                    additional configuration.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-12 text-center text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
