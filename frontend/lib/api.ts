import { User, UserCategoryProfile, Transaction, Recommendation, Merchant, Coupon, PaymentResponse, AdminAnalytics, RecommendationLog } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Auth
  getUsers: () => fetchAPI<User[]>('/api/auth/users'),
  login: (email: string, role: string) => fetchAPI<User>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, role }) }),
  
  // Users
  getUser: (id: string) => fetchAPI<User>(`/api/users/${id}`),
  getUserSpending: (id: string) => fetchAPI<UserCategoryProfile[]>(`/api/users/${id}/spending`),
  getUserSpendingChart: (id: string) => fetchAPI<any[]>(`/api/users/${id}/spending-chart`),
  getUserTransactions: (id: string) => fetchAPI<Transaction[]>(`/api/users/${id}/transactions`),
  getUserRecommendations: (id: string) => fetchAPI<Recommendation[]>(`/api/users/${id}/recommendations`),
  
  // Merchants
  getMerchants: (params?: string) => fetchAPI<Merchant[]>(`/api/merchants${params ? '?' + params : ''}`),
  getMerchantByOwner: (ownerId: string) => fetchAPI<Merchant[]>(`/api/merchants?owner_id=${ownerId}`),
  getMerchant: (id: string) => fetchAPI<Merchant>(`/api/merchants/${id}`),
  getMerchantAnalytics: (id: string) => fetchAPI<any>(`/api/merchants/${id}/analytics`),
  getMerchantRevenueChart: (id: string) => fetchAPI<any[]>(`/api/merchants/${id}/revenue-chart`),
  getMerchantCoupons: (id: string) => fetchAPI<Coupon[]>(`/api/merchants/${id}/coupons`),
  
  // Payments
  makePayment: (data: { user_id: string; merchant_id: string; amount: number }) => fetchAPI<PaymentResponse>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
  
  
  // Admin
  getAdminAnalytics: () => fetchAPI<AdminAnalytics>('/api/admin/analytics'),
  getRecommendationLogs: (params?: string) => fetchAPI<RecommendationLog[]>(`/api/admin/recommendation-logs${params ? '?' + params : ''}`),

  getAdminUsers: () => fetchAPI<User[]>('/api/admin/users'),
  
  // Coupons
  getCoupons: (params?: string) => fetchAPI<Coupon[]>(`/api/coupons${params ? '?' + params : ''}`),
  createCoupon: (data: any) => fetchAPI<Coupon>('/api/coupons', { method: 'POST', body: JSON.stringify(data) }),
  updateCoupon: (id: string, data: any) => fetchAPI<Coupon>(`/api/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCoupon: (id: string) => fetchAPI<any>(`/api/coupons/${id}`, { method: 'DELETE' }),
  
  // Campaigns
  getMerchantCampaigns: (id: string) => fetchAPI<any[]>(`/api/merchants/${id}/campaigns`),
  createCampaign: (merchantId: string, data: any) => fetchAPI<any>(`/api/merchants/${merchantId}/campaigns`, { method: 'POST', body: JSON.stringify(data) }),
};
