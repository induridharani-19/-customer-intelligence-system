export interface Campaign {
  id: string;
  name: string;
  objective: string;
  targetSegment: string;
  audienceSize: number;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Completed' | 'Paused';
  budget: number;
  spent: number;
  openRate?: number;
  clickRate?: number;
  conversions?: number;
  revenue?: number;
  createdAt: string;
  description: string;
  channel: string;
}

export const mockCampaigns: Campaign[] = [
  { id: 'CAM001', name: 'Q4 High-Value Rewards', objective: 'Increase LTV for top customers', targetSegment: 'High-Value', audienceSize: 847, startDate: '2024-11-01', endDate: '2024-11-30', status: 'Active', budget: 25000, spent: 18400, openRate: 42.3, clickRate: 18.7, conversions: 312, revenue: 89400, createdAt: '2024-10-28', description: 'Exclusive rewards campaign targeting high-value customers with early access to Q4 deals and bonus loyalty points.', channel: 'Email' },
  { id: 'CAM002', name: 'At-Risk Win-Back Campaign', objective: 'Re-engage churning customers', targetSegment: 'At-Risk', audienceSize: 892, startDate: '2024-11-15', endDate: '2024-12-15', status: 'Active', budget: 15000, spent: 6200, openRate: 28.1, clickRate: 9.4, conversions: 67, revenue: 12300, createdAt: '2024-11-12', description: 'Personalized win-back offers for at-risk customers with 20% discount codes and free shipping incentives.', channel: 'Email + SMS' },
  { id: 'CAM003', name: 'New Customer Onboarding', objective: 'Improve first 30-day retention', targetSegment: 'New Customer', audienceSize: 1678, startDate: '2024-10-01', endDate: '2024-11-30', status: 'Active', budget: 8000, spent: 5890, openRate: 55.2, clickRate: 23.1, conversions: 534, revenue: 62400, createdAt: '2024-09-25', description: 'Automated 30-day onboarding email sequence to guide new customers and drive their second purchase.', channel: 'Email' },
  { id: 'CAM004', name: 'Black Friday Mega Sale', objective: 'Maximize Q4 revenue', targetSegment: 'All Segments', audienceSize: 11684, startDate: '2024-11-29', endDate: '2024-12-02', status: 'Active', budget: 80000, spent: 31200, openRate: 67.4, clickRate: 34.8, conversions: 2847, revenue: 456800, createdAt: '2024-11-01', description: 'Site-wide Black Friday event with tiered discounts (10-40%) based on customer segment and order value.', channel: 'Email + Social + Push' },
  { id: 'CAM005', name: 'Loyal Customer Appreciation', objective: 'Strengthen loyalty and reduce churn', targetSegment: 'Loyal', audienceSize: 1234, startDate: '2024-10-15', endDate: '2024-10-31', status: 'Completed', budget: 12000, spent: 11800, openRate: 61.2, clickRate: 28.9, conversions: 478, revenue: 98700, createdAt: '2024-10-10', description: 'Appreciation campaign with double points weekend and exclusive product preview for loyal segment.', channel: 'Email' },
  { id: 'CAM006', name: 'Electronics Bundle Promotion', objective: 'Increase cross-category revenue', targetSegment: 'High-Value', audienceSize: 847, startDate: '2024-11-10', endDate: '2024-11-20', status: 'Completed', budget: 6000, spent: 5800, openRate: 44.7, clickRate: 21.3, conversions: 234, revenue: 67800, createdAt: '2024-11-05', description: 'Bundle deals on electronics + accessories with 10% bundle discount for high-value customers.', channel: 'Email' },
  { id: 'CAM007', name: 'Occasional Buyer Activation', objective: 'Increase purchase frequency', targetSegment: 'Occasional', audienceSize: 3421, startDate: '2024-12-01', endDate: '2024-12-31', status: 'Draft', budget: 20000, spent: 0, createdAt: '2024-11-28', description: 'Monthly personalized product recommendations with time-limited offers to convert occasional buyers into loyal customers.', channel: 'Email + Social' },
  { id: 'CAM008', name: 'Holiday Gift Guide', objective: 'Drive seasonal revenue', targetSegment: 'All Segments', audienceSize: 11684, startDate: '2024-12-05', endDate: '2024-12-24', status: 'Draft', budget: 45000, spent: 0, createdAt: '2024-11-26', description: 'Curated holiday gift guides segmented by purchase history and spending tier, with gift wrapping promotions.', channel: 'Email + Social + Push' },
  { id: 'CAM009', name: 'Summer Loyalty Rewards', objective: 'Reduce summer churn', targetSegment: 'Loyal', audienceSize: 1234, startDate: '2024-07-01', endDate: '2024-08-31', status: 'Completed', budget: 18000, spent: 17200, openRate: 58.3, clickRate: 26.7, conversions: 567, revenue: 112400, createdAt: '2024-06-20', description: 'Summer exclusives and bonus points for loyal customers during historically slower summer months.', channel: 'Email' },
  { id: 'CAM010', name: 'Potential Loyalist Upgrade', objective: 'Move customers to Loyal segment', targetSegment: 'Potential Loyalist', audienceSize: 2156, startDate: '2024-11-20', endDate: '2024-12-20', status: 'Paused', budget: 16000, spent: 3400, openRate: 32.1, clickRate: 12.8, conversions: 89, revenue: 18900, createdAt: '2024-11-15', description: 'Targeted campaign to convert potential loyalists with milestone rewards at 10th purchase.', channel: 'Email + Push' },
];

export const campaignSummary = {
  totalCampaigns: 10,
  activeCampaigns: 4,
  completedCampaigns: 3,
  draftCampaigns: 2,
  pausedCampaigns: 1,
  totalBudget: 245000,
  totalSpent: 99890,
  totalRevenue: 918700,
  totalConversions: 5128,
};
