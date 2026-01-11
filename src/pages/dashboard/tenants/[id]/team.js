import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayoutWrapper";
import { teamService } from "@/lib/teamService";
import { tenantService } from "@/lib/tenantService";
import AddTeamMemberModal from "@/components/AddTeamMemberModal";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ArrowLeft,
  Mail,
  Phone,
  Link as LinkIcon,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

export default function TenantTeam() {
  const router = useRouter();
  const { id } = router.query;
  const [tenant, setTenant] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, includeInactive]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [tenantData, teamData] = await Promise.all([
        tenantService.getTenant(id),
        teamService.getTeamMembers(id, includeInactive),
      ]);
      setTenant(tenantData.tenant || tenantData);
      setTeamMembers(teamData.team_members || []);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.message || "Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      await teamService.deleteTeamMember(id, memberId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete team member");
    }
  };

  const handleSyncUsers = async () => {
    try {
      const result = await teamService.syncTenantUsers(id);
      alert(result.message || "Users synced successfully");
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sync users");
    }
  };

  const handleModalSuccess = async (result) => {
    alert(result.message || "Team member saved successfully");
    setShowAddModal(false);
    setEditingMember(null);
    await loadData();
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingMember(null);
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
            <Users size={64} style={{ margin: "0 auto", color: "#ef4444" }} />
            <h2 style={{ marginTop: "1rem", color: "#1f2937" }}>Error</h2>
            <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>{error}</p>
            <button
              onClick={() => router.back()}
              className="btn-secondary"
              style={{ marginTop: "1.5rem" }}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="dashboard-container">
          {/* Header */}
          <div className="page-header">
            <button onClick={() => router.back()} className="back-button">
              <ArrowLeft size={20} />
            </button>
            <div className="header-content">
              <div className="header-icon">
                <Users size={28} />
              </div>
              <div>
                <h1 className="page-title">Team Management</h1>
                <p className="page-subtitle">
                  {tenant?.name} - Manage your team members
                </p>
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={handleSyncUsers}
                className="btn-secondary"
                title="Sync platform users to team"
              >
                <RefreshCw size={20} />
                Sync Users
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
              >
                <UserPlus size={20} />
                Add Team Member
              </button>
            </div>
          </div>

          {/* Filter */}
          <div
            className="card"
            style={{ marginBottom: "1.5rem", padding: "1rem" }}
          >
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-semibold">Show inactive members</span>
            </label>
          </div>

          {/* Team Members List */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                <Users size={24} />
                Team Members ({teamMembers.length})
              </h2>
            </div>

            {teamMembers.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                <Users
                  size={64}
                  style={{ margin: "0 auto", color: "#9ca3af" }}
                />
                <h3 style={{ marginTop: "1rem", color: "#1f2937" }}>
                  No Team Members
                </h3>
                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                  {includeInactive
                    ? "No team members found"
                    : "Start by adding your first team member"}
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary"
                  style={{ marginTop: "1.5rem" }}
                >
                  <UserPlus size={20} />
                  Add Team Member
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role & Position</th>
                      <th>Contact</th>
                      <th>Social Links</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {member.profile_photo ? (
                              <img
                                src={member.profile_photo}
                                alt={member.full_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{
                                  background: "#f3f4f6",
                                  color: "#6b7280",
                                }}
                              >
                                <Users size={20} />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold">
                                {member.full_name}
                              </div>
                              {member.is_platform_user && (
                                <div
                                  className="text-xs flex items-center gap-1"
                                  style={{ color: "#10b981" }}
                                >
                                  <CheckCircle size={12} />
                                  Platform User
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold">{member.role}</div>
                          {member.position && (
                            <div
                              className="text-sm"
                              style={{ color: "#6b7280" }}
                            >
                              {member.position}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="space-y-1">
                            {member.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail size={14} style={{ color: "#6b7280" }} />
                                <a
                                  href={`mailto:${member.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {member.email}
                                </a>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} style={{ color: "#6b7280" }} />
                                <a
                                  href={`tel:${member.phone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {member.phone}
                                </a>
                              </div>
                            )}
                            {!member.email && !member.phone && (
                              <span style={{ color: "#9ca3af" }}>-</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {member.social_links &&
                          member.social_links.length > 0 ? (
                            <div className="flex gap-2">
                              {member.social_links
                                .slice(0, 3)
                                .map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                    title={`${link.platform}${
                                      link.handle ? `: @${link.handle}` : ""
                                    }`}
                                  >
                                    <LinkIcon size={16} />
                                  </a>
                                ))}
                              {member.social_links.length > 3 && (
                                <span
                                  className="text-sm"
                                  style={{ color: "#6b7280" }}
                                >
                                  +{member.social_links.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#9ca3af" }}>-</span>
                          )}
                        </td>
                        <td>
                          <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                              background: member.is_active
                                ? "#d1fae5"
                                : "#fee2e2",
                              color: member.is_active ? "#065f46" : "#991b1b",
                            }}
                          >
                            {member.is_active ? (
                              <>
                                <Eye size={14} />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff size={14} />
                                Inactive
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className="px-3 py-1 rounded-full text-sm font-semibold"
                            style={{
                              background: "#f3f4f6",
                              color: "#374151",
                            }}
                          >
                            {member.display_order}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(member)}
                              className="icon-button"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="icon-button-danger"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div
            className="card"
            style={{
              marginTop: "1.5rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <div className="p-4">
              <h3 className="font-semibold mb-2" style={{ color: "#1e40af" }}>
                About Team Management
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "#1e3a8a" }}>
                <li>
                  • Add team members who don't need platform accounts (e.g.,
                  secretaries, social media managers)
                </li>
                <li>
                  • Team members can be displayed publicly on your website
                </li>
                <li>
                  • Use "Sync Users" to automatically add platform users to your
                  team
                </li>
                <li>
                  • Display order controls how members appear on your public
                  page
                </li>
                <li>
                  • Inactive members are hidden from public display but remain
                  in your records
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AddTeamMemberModal
          tenantId={id}
          isOpen={showAddModal}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
          editMember={editingMember}
        />
      </DashboardLayout>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .page-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .back-button {
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #f9fafb;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .header-icon {
          padding: 1rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .page-subtitle {
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f9fafb;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:hover {
          background: #f9fafb;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          background: white;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f9fafb;
        }

        .icon-button {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          color: #3b82f6;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-button:hover {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .icon-button-danger {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-button-danger:hover {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </ProtectedRoute>
  );
}
