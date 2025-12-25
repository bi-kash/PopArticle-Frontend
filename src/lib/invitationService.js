import api from "./api";

/**
 * Invitation Service
 * Handles all invitation-related API calls
 */

/**
 * Invite a member to a tenant
 * @param {string} tenantId - The tenant ID
 * @param {Object} data - Invitation data
 * @param {string} data.email - Email of the person to invite
 * @param {string} data.role - Role to assign (owner, admin, editor)
 * @returns {Promise} API response
 */
export const inviteMember = async (tenantId, data) => {
  const response = await api.post(
    `/api/v1/tenants/${tenantId}/invitations`,
    data
  );
  return response.data;
};

/**
 * Get list of invitations for a tenant
 * @param {string} tenantId - The tenant ID
 * @param {Object} params - Query parameters
 * @param {string} params.status - Filter by status (pending, accepted, expired, cancelled)
 * @returns {Promise} API response
 */
export const getInvitations = async (tenantId, params = {}) => {
  const response = await api.get(`/api/v1/tenants/${tenantId}/invitations`, {
    params,
  });
  return response.data;
};

/**
 * Cancel an invitation
 * @param {number} invitationId - The invitation ID
 * @returns {Promise} API response
 */
export const cancelInvitation = async (invitationId) => {
  const response = await api.post(
    `/api/v1/tenants/invitations/${invitationId}/cancel`
  );
  return response.data;
};

/**
 * Accept an invitation
 * @param {string} token - Invitation token
 * @returns {Promise} API response
 */
export const acceptInvitation = async (token) => {
  const response = await api.post("/api/v1/tenants/invitations/accept", {
    token,
  });
  return response.data;
};

/**
 * Verify an invitation token (public endpoint)
 * @param {string} token - Invitation token
 * @returns {Promise} API response
 */
export const verifyInvitation = async (token) => {
  const response = await api.get(`/api/v1/tenants/invitations/verify/${token}`);
  return response.data;
};
