import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { tenantService } from "@/lib/tenantService";
import { getInvitations, cancelInvitation } from "@/lib/invitationService";
import InviteMemberModal from "@/components/InviteMemberModal";
import {
  Users,
  Mail,
  UserPlus,
  Trash2,
  ArrowLeft,
  Shield,
  X,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function TenantMembers() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({ email: "", role: "member" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tenantData, membersData, invitationsData] = await Promise.all([
        tenantService.getTenant(id),
        tenantService.getTenantMembers(id),
        getInvitations(id).catch(() => ({ invitations: [] })),
      ]);
      setTenant(tenantData.tenant || tenantData);
      setMembers(membersData.members || membersData || []);
      setInvitations(invitationsData.invitations || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.message || "Failed to load tenant members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await tenantService.addTenantMember(id, newMember);
      setNewMember({ email: "", role: "member" });
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await tenantService.removeTenantMember(id, userId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;

    try {
      await cancelInvitation(invitationId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel invitation");
    }
  };

  const handleInviteSuccess = (result) => {
    loadData();
    alert(result.message || "Invitation sent successfully");
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#FEF3C7", color: "#92400E", icon: Clock },
      accepted: { bg: "#D1FAE5", color: "#065F46", icon: CheckCircle },
      expired: { bg: "#FEE2E2", color: "#991B1B", icon: XCircle },
      cancelled: { bg: "#E5E7EB", color: "#374151", icon: XCircle },
    };

    const config = styles[status] || styles.pending;
    const Icon = config.icon;

    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.25rem 0.75rem",
          borderRadius: "1rem",
          background: config.bg,
          color: config.color,
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        <Icon size={14} />
        {status}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div
            className="card"
            style={{ textAlign: "center", padding: "3rem" }}
          >
            <Users
              size={48}
              style={{
                color: "var(--danger-color)",
                margin: "0 auto 1rem",
              }}
            />
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              {error}
            </h3>
            <button
              className="btn btn-primary"
              onClick={() => router.push("/dashboard/tenants")}
            >
              <ArrowLeft size={20} />
              Back to Tenants
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>
          <div style={{ marginBottom: "2rem" }}>
            <button
              className="btn btn-secondary"
              onClick={() => router.push(`/dashboard/tenants/${id}`)}
              style={{ marginBottom: "1rem" }}
            >
              <ArrowLeft size={20} />
              Back to Tenant
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                {tenant?.name} - Team
              </h1>
              <p style={{ color: "var(--text-secondary)" }}>
                Manage team members and invitations
              </p>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              {activeTab === "members" && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <UserPlus size={20} />
                  Add Member
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={() => setShowInviteModal(true)}
              >
                <Mail size={20} />
                Invite Member
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div
            style={{
              marginBottom: "2rem",
              borderBottom: "2px solid var(--border-color)",
            }}
          >
            <div style={{ display: "flex", gap: "2rem" }}>
              <button
                onClick={() => setActiveTab("members")}
                style={{
                  padding: "1rem 0",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "members"
                      ? "2px solid var(--primary-color)"
                      : "2px solid transparent",
                  color:
                    activeTab === "members"
                      ? "var(--primary-color)"
                      : "var(--text-secondary)",
                  fontWeight: activeTab === "members" ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: "-2px",
                }}
              >
                Members ({members.length})
              </button>
              <button
                onClick={() => setActiveTab("invitations")}
                style={{
                  padding: "1rem 0",
                  background: "transparent",
                  border: "none",
                  borderBottom:
                    activeTab === "invitations"
                      ? "2px solid var(--primary-color)"
                      : "2px solid transparent",
                  color:
                    activeTab === "invitations"
                      ? "var(--primary-color)"
                      : "var(--text-secondary)",
                  fontWeight: activeTab === "invitations" ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: "-2px",
                }}
              >
                Invitations ({invitations.length})
              </button>
            </div>
          </div>

          <InviteMemberModal
            tenantId={id}
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            onSuccess={handleInviteSuccess}
          />

          {showAddForm && (
            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                }}
              >
                Add New Member
              </h3>
              <form onSubmit={handleAddMember}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 200px auto",
                    gap: "1rem",
                    alignItems: "end",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={newMember.email}
                      onChange={(e) =>
                        setNewMember({ ...newMember, email: e.target.value })
                      }
                      required
                      placeholder="member@example.com"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="label">Role</label>
                    <select
                      className="select"
                      value={newMember.role}
                      onChange={(e) =>
                        setNewMember({ ...newMember, role: e.target.value })
                      }
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button type="submit" className="btn btn-primary">
                      Add
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <>
              {members.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <Users
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No Members Yet
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Add team members to collaborate on this tenant
                  </p>
                </div>
              ) : (
                <div className="card">
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            User
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Email
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Role
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.id || member.user_id}
                            style={{
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                }}
                              >
                                <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--primary-color)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {(member.full_name || member.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 500 }}>
                                  {member.full_name || "No name"}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                <Mail size={16} />
                                {member.email}
                              </div>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "1rem",
                                  background:
                                    member.role === "owner"
                                      ? "var(--primary-color)"
                                      : member.role === "admin"
                                      ? "var(--success-color)"
                                      : "var(--surface)",
                                  color:
                                    member.role === "owner" ||
                                    member.role === "admin"
                                      ? "white"
                                      : "var(--text-primary)",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                }}
                              >
                                <Shield size={14} />
                                {member.role || "member"}
                              </div>
                            </td>
                            <td style={{ padding: "1rem", textAlign: "right" }}>
                              {member.role !== "owner" && (
                                <button
                                  className="btn"
                                  onClick={() =>
                                    handleRemoveMember(
                                      member.id || member.user_id
                                    )
                                  }
                                  style={{
                                    padding: "0.5rem",
                                    background: "transparent",
                                    color: "var(--danger-color)",
                                    border: "none",
                                  }}
                                  title="Remove member"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Invitations Tab */}
          {activeTab === "invitations" && (
            <>
              {invitations.length === 0 ? (
                <div
                  className="card"
                  style={{ textAlign: "center", padding: "3rem" }}
                >
                  <Mail
                    size={48}
                    style={{
                      color: "var(--text-secondary)",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                    }}
                  >
                    No Pending Invitations
                  </h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1.5rem",
                    }}
                  >
                    Invite people to join your team
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <Mail size={20} />
                    Send Invitation
                  </button>
                </div>
              ) : (
                <div className="card">
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Email
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Role
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Status
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Invited By
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Expires
                          </th>
                          <th
                            style={{
                              textAlign: "right",
                              padding: "1rem",
                              fontWeight: 600,
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((invitation) => (
                          <tr
                            key={invitation.id}
                            style={{
                              borderBottom: "1px solid var(--border-color)",
                            }}
                          >
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <Mail size={16} />
                                {invitation.email}
                              </div>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "1rem",
                                  background: "var(--surface)",
                                  fontSize: "0.875rem",
                                  fontWeight: 500,
                                }}
                              >
                                <Shield size={14} />
                                {invitation.role}
                              </div>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              {getStatusBadge(invitation.status)}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                color: "var(--text-secondary)",
                              }}
                            >
                              {invitation.invited_by?.full_name ||
                                invitation.invited_by?.email ||
                                "Unknown"}
                            </td>
                            <td
                              style={{
                                padding: "1rem",
                                color: "var(--text-secondary)",
                                fontSize: "0.875rem",
                              }}
                            >
                              {new Date(
                                invitation.expires_at
                              ).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "1rem", textAlign: "right" }}>
                              {invitation.status === "pending" && (
                                <button
                                  className="btn"
                                  onClick={() =>
                                    handleCancelInvitation(invitation.id)
                                  }
                                  style={{
                                    padding: "0.5rem",
                                    background: "transparent",
                                    color: "var(--danger-color)",
                                    border: "none",
                                  }}
                                  title="Cancel invitation"
                                >
                                  <X size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
