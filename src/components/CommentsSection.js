import { useState, useEffect, useCallback } from "react";
import { commentService } from "@/lib/commentService";
import {
  MessageCircle,
  Send,
  Edit2,
  Trash2,
  Reply,
  Check,
  X,
} from "lucide-react";
import Cookies from "js-cookie";

// CommentItem component moved outside to prevent re-creation on each render
function CommentItem({
  comment,
  isReply = false,
  currentUser,
  editingComment,
  editContent,
  setEditContent,
  submitting,
  replyingTo,
  replyContent,
  setReplyContent,
  onEdit,
  onCancelEdit,
  onDelete,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onSubmitEdit,
}) {
  const isAuthor = currentUser && currentUser.id === comment.user.id;
  const isEditing = editingComment === comment.id;

  return (
    <div
      style={{
        marginLeft: isReply ? "2.5rem" : "0",
        marginBottom: "1rem",
        padding: "1rem",
        background: isReply ? "#f9fafb" : "white",
        border: "1px solid var(--border-color)",
        borderRadius: "0.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <strong style={{ color: "var(--primary-color)" }}>
            {comment.user.full_name || comment.user.username}
          </strong>
          {comment.is_edited && (
            <span
              style={{
                marginLeft: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontStyle: "italic",
              }}
            >
              (edited)
            </span>
          )}
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>

      {isEditing ? (
        <div>
          <textarea
            className="textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            style={{ marginBottom: "0.5rem" }}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
              onClick={() => onSubmitEdit(comment.id)}
              disabled={submitting}
            >
              <Check size={14} />
              Save
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
              onClick={onCancelEdit}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: "0.75rem", lineHeight: "1.6" }}>
            {comment.content}
          </p>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem" }}>
            {!isReply && currentUser && (
              <button
                onClick={() => onStartReply(comment.id)}
                style={{
                  color: "var(--primary-color)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Reply size={14} />
                Reply
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  style={{
                    color: "var(--secondary-color)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  style={{
                    color: "var(--danger-color)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}

      {replyingTo === comment.id && (
        <div style={{ marginTop: "1rem" }}>
          <textarea
            className="textarea"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            style={{ marginBottom: "0.5rem" }}
            autoFocus
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-primary"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
              onClick={() => onSubmitReply(comment.id)}
              disabled={submitting || !replyContent.trim()}
            >
              <Send size={14} />
              Post Reply
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
              onClick={onCancelReply}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply={true}
              currentUser={currentUser}
              editingComment={editingComment}
              editContent={editContent}
              setEditContent={setEditContent}
              submitting={submitting}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onEdit={onEdit}
              onCancelEdit={onCancelEdit}
              onDelete={onDelete}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onSubmitReply={onSubmitReply}
              onSubmitEdit={onSubmitEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (articleId) {
      loadComments();
    }
    loadCurrentUser();
  }, [articleId]);

  const loadCurrentUser = () => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setCurrentUser(JSON.parse(userCookie));
      } catch (e) {
        console.error("Failed to parse user cookie:", e);
      }
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Loading comments for article:", articleId);
      const data = await commentService.getArticleComments(articleId);
      console.log("Comments loaded:", data);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Don't show error if it's a 404 or 501 (not implemented)
      if (err.response?.status === 404 || err.response?.status === 501) {
        setComments([]);
      } else {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load comments. The comment system may not be available yet."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        article_id: parseInt(articleId),
        content: newComment,
        parent_id: null,
      };
      console.log("Submitting comment:", payload);
      const result = await commentService.createComment(payload);
      console.log("Comment created:", result);
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error("Failed to post comment:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to post comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        article_id: parseInt(articleId),
        content: replyContent,
        parent_id: parentId,
      };
      console.log("Submitting reply:", payload);
      await commentService.createComment(payload);
      setReplyContent("");
      setReplyingTo(null);
      await loadComments();
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to post reply. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await commentService.updateComment(commentId, {
        content: editContent,
      });
      setEditContent("");
      setEditingComment(null);
      await loadComments();
    } catch (err) {
      console.error("Failed to update comment:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to update comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await commentService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete comment. Please try again."
      );
    }
  };

  const startEdit = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent("");
  };

  const handleStartReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyContent("");
  };

  return (
    <div className="card" style={{ marginTop: "2rem" }}>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <MessageCircle size={24} />
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {error && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div>{error}</div>
          <button
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "0 0.5rem",
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* New Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmitComment} style={{ marginBottom: "2rem" }}>
          <textarea
            className="textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            style={{ marginBottom: "0.75rem" }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !newComment.trim()}
          >
            <Send size={18} />
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div
          style={{
            padding: "1rem",
            background: "var(--surface)",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Please log in to post a comment
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : comments.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--text-secondary)",
          }}
        >
          <MessageCircle
            size={48}
            style={{ opacity: 0.3, marginBottom: "1rem" }}
          />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              editingComment={editingComment}
              editContent={editContent}
              setEditContent={setEditContent}
              submitting={submitting}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onEdit={startEdit}
              onCancelEdit={cancelEdit}
              onDelete={handleDeleteComment}
              onStartReply={handleStartReply}
              onCancelReply={handleCancelReply}
              onSubmitReply={handleSubmitReply}
              onSubmitEdit={handleEditComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
