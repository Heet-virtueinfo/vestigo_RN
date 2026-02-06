import api from './api';
import { ENDPOINTS } from './endpoints';

// --- Auth ---
export const login = async (username: string, password: string) => {
  const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
    username,
    password,
  });
  console.log(response.data);
  return response.data;
};

export const register = async (data: any) => {
  const response = await api.post(ENDPOINTS.AUTH.REGISTER, data);
  return response.data;
};

// --- Dashboard ---
export const getDashboardStats = async () => {
  try {
    const response = await api.get(ENDPOINTS.REPORTS.DASHBOARD_STATS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats', error);
    throw error;
  }
};

// --- Leads ---
export const getLeads = async () => {
  const response = await api.get(ENDPOINTS.LEADS);
  return response.data;
};

export const createLead = async (data: any) => {
  const response = await api.post(ENDPOINTS.LEADS, data);
  return response.data;
};

export const updateLead = async (id: number, data: any) => {
  const response = await api.put(`${ENDPOINTS.LEADS}${id}/`, data);
  return response.data;
};

export const deleteLead = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.LEADS}${id}/`);
  return response.data;
};

export const convertLeadToOpportunity = async (
  lead: any,
  opportunityName: string,
) => {
  // 1. Create Opportunity
  const payload = {
    name: opportunityName,
    lead: lead.id,
    stage: 'DISCOVERY',
    expected_premium: 0,
    probability: 25,
    notes: `Converted from lead: ${lead.first_name} ${lead.last_name}`,
  };
  await api.post(ENDPOINTS.OPPORTUNITIES, payload);

  // 2. Mark lead as CONVERTED
  await api.put(`${ENDPOINTS.LEADS}${lead.id}/`, {
    ...lead,
    status: 'CONVERTED',
  });

  return true;
};

// --- Opportunities ---
export const getOpportunities = async () => {
  const response = await api.get(ENDPOINTS.OPPORTUNITIES);
  return response.data;
};

export const createOpportunity = async (data: any) => {
  const response = await api.post(ENDPOINTS.OPPORTUNITIES, data);
  return response.data;
};

export const updateOpportunity = async (id: number, data: any) => {
  const response = await api.put(`${ENDPOINTS.OPPORTUNITIES}${id}/`, data);
  return response.data;
};

export const deleteOpportunity = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.OPPORTUNITIES}${id}/`);
  return response.data;
};

export const moveOpportunityStage = async (id: number, stage: string) => {
  const response = await api.post(
    `${ENDPOINTS.OPPORTUNITIES}${id}/move_stage/`,
    {
      stage,
    },
  );
  return response.data;
};

export const submitForUnderwriting = async (opportunityId: number) => {
  const response = await api.post(ENDPOINTS.UNDERWRITING.SUBMISSIONS, {
    opportunity: opportunityId,
    status: 'PENDING',
  });
  return response.data;
};

// --- Underwriting ---
export const getSubmissions = async () => {
  const response = await api.get(ENDPOINTS.UNDERWRITING.SUBMISSIONS);
  return response.data;
};

export const getSubmissionDetail = async (id: number) => {
  const response = await api.get(`${ENDPOINTS.UNDERWRITING.SUBMISSIONS}${id}/`);
  return response.data;
};

export const approveSubmission = async (id: number, notes?: string) => {
  const response = await api.post(
    `${ENDPOINTS.UNDERWRITING.SUBMISSIONS}${id}/approve/`,
    {
      notes,
    },
  );
  return response.data;
};

export const rejectSubmission = async (id: number, notes?: string) => {
  const response = await api.post(
    `${ENDPOINTS.UNDERWRITING.SUBMISSIONS}${id}/reject/`,
    {
      notes,
    },
  );
  return response.data;
};

export const requestInfoSubmission = async (id: number, notes: string) => {
  const response = await api.post(
    `${ENDPOINTS.UNDERWRITING.SUBMISSIONS}${id}/request-info/`,
    {
      notes,
    },
  );
  return response.data;
};

// --- Policies ---
export const getPolicies = async () => {
  const response = await api.get(ENDPOINTS.POLICIES.BASE);
  // DRF return check similar to web
  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};

export const getPolicyDetail = async (id: number) => {
  const response = await api.get(
    `${ENDPOINTS.POLICIES.BASE}${id}/${ENDPOINTS.POLICIES.DETAILS}/`,
  );
  return response.data;
};

export const createPolicy = async (data: any) => {
  const response = await api.post(ENDPOINTS.POLICIES.BASE, data);
  return response.data;
};

export const generatePaymentSchedule = async (id: number, count: number) => {
  const response = await api.post(
    `${ENDPOINTS.POLICIES.BASE}${id}/${ENDPOINTS.POLICIES.GENERATE_SCHEDULE}/`,
    { count },
  );
  return response.data;
};

export const updatePolicyStatus = async (
  id: number,
  action: 'cancel' | 'expire',
) => {
  const response = await api.post(`${ENDPOINTS.POLICIES.BASE}${id}/${action}/`);
  return response.data;
};

export const createClaim = async (data: any) => {
  const response = await api.post(ENDPOINTS.CLAIMS.BASE, data);
  return response.data;
};

export const getClaims = async () => {
  const response = await api.get(ENDPOINTS.CLAIMS.BASE);
  // DRF may return array or { results: ... }
  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};

export const getClaimDetail = async (id: number) => {
  const response = await api.get(`${ENDPOINTS.CLAIMS.BASE}${id}/`);
  return response.data;
};

export const updateClaimStatus = async (id: number, payload: any) => {
  // payload: { status, note, approved_amount?, paid_amount?, payout_date? }
  const response = await api.post(
    `${ENDPOINTS.CLAIMS.BASE}${id}/${ENDPOINTS.CLAIMS.SET_STATUS}/`,
    payload,
  );
  return response.data;
};

// --- Payments ---
export const markPaymentPaid = async (id: number, amount: string) => {
  const response = await api.post(
    `${ENDPOINTS.PAYMENTS.BASE}${id}/${ENDPOINTS.PAYMENTS.MARK_PAID}/`,
    {
      amount,
    },
  );
  return response.data;
};

export const markPaymentFailed = async (id: number, reason: string) => {
  const response = await api.post(
    `${ENDPOINTS.PAYMENTS.BASE}${id}/${ENDPOINTS.PAYMENTS.MARK_FAILED}/`,
    {
      reason,
    },
  );
  return response.data;
};

// --- Late Charges ---
export const getLateCharges = async () => {
  const response = await api.get(ENDPOINTS.LATE_CHARGES.BASE);
  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};

export const getLateChargeDetail = async (id: number) => {
  const response = await api.get(`${ENDPOINTS.LATE_CHARGES.BASE}${id}/`);
  return response.data;
};

export const waiveLateCharge = async (id: number, reason: string) => {
  const response = await api.post(
    `${ENDPOINTS.LATE_CHARGES.BASE}${id}/${ENDPOINTS.LATE_CHARGES.WAIVE}/`,
    {
      reason,
    },
  );
  return response.data;
};

export const adjustLateCharge = async (
  id: number,
  amount: number,
  notes?: string,
) => {
  const response = await api.post(
    `${ENDPOINTS.LATE_CHARGES.BASE}${id}/${ENDPOINTS.LATE_CHARGES.ADJUST}/`,
    {
      amount,
      notes,
    },
  );
  return response.data;
};

export const markLateChargePaid = async (id: number) => {
  const response = await api.post(
    `${ENDPOINTS.LATE_CHARGES.BASE}${id}/${ENDPOINTS.LATE_CHARGES.MARK_PAID}/`,
  );
  return response.data;
};

export const deleteLateCharge = async (id: number) => {
  const response = await api.delete(`${ENDPOINTS.LATE_CHARGES.BASE}${id}/`);
  return response.data;
};

// --- Reports ---
export const getAdvancedReports = async (range: string = 'month') => {
  const response = await api.get(
    `${ENDPOINTS.REPORTS.ADVANCED_REPORTS}?range=${range}`,
  );
  return response.data;
};

// --- Reconciliation ---
export const getReconciliationItems = async () => {
  const response = await api.get(ENDPOINTS.RECONCILIATION.ITEMS);
  return Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
};

export const matchReconciliationItem = async (id: number, data: any) => {
  const response = await api.post(
    `${ENDPOINTS.RECONCILIATION.ITEMS}${id}/match/`,
    data,
  );
  return response.data;
};

export const flagReconciliationItem = async (id: number, reason: string) => {
  const response = await api.post(
    `${ENDPOINTS.RECONCILIATION.ITEMS}${id}/flag/`,
    { reason },
  );
  return response.data;
};
