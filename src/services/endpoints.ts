import { BASE_URL } from '@env';

export const ENDPOINTS = {
  BASE_URL: 'https://9035cdb943d2.ngrok-free.app',
  AUTH: {
    LOGIN: '/auth/login/',
    REFRESH: '/auth/refresh/',
    REGISTER: '/register',
  },
  REPORTS: {
    DASHBOARD_STATS: '/reports/dashboard-stats/',
    ADVANCED_REPORTS: '/reports/advanced-reports/',
  },
  LEADS: '/bdm/leads/',
  OPPORTUNITIES: '/bdm/opportunities/',
  RECONCILIATION: {
    ITEMS: '/accounting/reconciliation-items/',
  },
  UNDERWRITING: {
    SUBMISSIONS: '/underwriting/submissions/',
  },
  POLICIES: {
    BASE: '/operations/policies/',
    DETAILS: 'details',
    GENERATE_SCHEDULE: 'generate-schedule',
  },
  CLAIMS: {
    BASE: '/claims/',
    SET_STATUS: 'set-status',
  },
  PAYMENTS: {
    BASE: '/operations/payments/',
    MARK_PAID: 'mark-paid',
    MARK_FAILED: 'mark-failed',
  },
  LATE_CHARGES: {
    BASE: '/operations/late-charges/',
    WAIVE: 'waive',
    ADJUST: 'adjust',
    MARK_PAID: 'mark_paid',
  },
};
