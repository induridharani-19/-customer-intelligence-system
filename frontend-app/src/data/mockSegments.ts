export interface Segment {
  id: string;
  name: string;
  description: string;
  color: string;
  customerCount: number;
  avgSpending: number;
  avgFrequency: number;
  avgRecency: number;
  avgLifetimeValue: number;
  totalRevenue: number;
  growthRate: number;
  retentionRate: number;
  churnRate: number;
  characteristics: string[];
  recommendations: string[];
}

export const mockSegments: Segment[] = [
  {
    id: 'seg-001',
    name: 'High-Value',
    description:
      'Top-tier customers generating the highest revenue with consistent, frequent purchases and very low churn risk. They are the backbone of business revenue and should receive premium treatment.',
    color: '#6366f1',
    customerCount: 8,
    avgSpending: 45416.55,
    avgFrequency: 79,
    avgRecency: 5.5,
    avgLifetimeValue: 59175.00,
    totalRevenue: 363332.40,
    growthRate: 12.4,
    retentionRate: 96.8,
    churnRate: 3.2,
    characteristics: [
      'Average order value above $500',
      'Purchase frequency of 60+ orders per lifetime',
      'Recency within 10 days',
      'Predominantly B2B enterprise accounts',
      'Multi-year customer relationships (3+ years)',
      'Engage with premium product lines',
    ],
    recommendations: [
      'Assign dedicated account managers for white-glove service',
      'Offer early access to new products and features',
      'Provide exclusive loyalty rewards and annual rebates',
      'Schedule quarterly business reviews to align on needs',
      'Invite to executive-level networking events',
      'Offer custom pricing tiers and volume discounts',
    ],
  },
  {
    id: 'seg-002',
    name: 'Loyal',
    description:
      'Dependable customers who purchase regularly and maintain a long-standing relationship with the brand. They have moderate-to-high lifetime value and very low churn risk, making them ideal brand advocates.',
    color: '#22c55e',
    customerCount: 7,
    avgSpending: 19609.60,
    avgFrequency: 54,
    avgRecency: 5.0,
    avgLifetimeValue: 25414.29,
    totalRevenue: 137267.20,
    growthRate: 8.7,
    retentionRate: 92.5,
    churnRate: 7.5,
    characteristics: [
      'Purchase frequency of 40–65 orders per lifetime',
      'Recency within 10 days',
      'Strong brand affinity and product satisfaction',
      'Mix of B2B and B2C customers',
      'Active in referral and word-of-mouth channels',
      'Moderate-to-high engagement with communications',
    ],
    recommendations: [
      'Enroll in a tiered loyalty rewards program',
      'Send personalized milestone messages (anniversary, birthday)',
      'Offer referral bonuses to leverage advocacy',
      'Provide early access to seasonal promotions',
      'Survey for product feedback and show changes made',
      'Upsell complementary products aligned with purchase history',
    ],
  },
  {
    id: 'seg-003',
    name: 'Potential Loyalist',
    description:
      'Emerging customers showing strong engagement and increasing purchase frequency. They have recently discovered the brand and show potential to become loyal or high-value customers with the right nurturing.',
    color: '#3b82f6',
    customerCount: 8,
    avgSpending: 7921.56,
    avgFrequency: 17,
    avgRecency: 11.0,
    avgLifetimeValue: 10262.50,
    totalRevenue: 63372.45,
    growthRate: 24.3,
    retentionRate: 78.4,
    churnRate: 21.6,
    characteristics: [
      'Customer tenure of 1–2 years',
      'Increasing order frequency over time',
      'Above-average order values for their tenure',
      'High engagement with onboarding communications',
      'Exploring multiple product categories',
      'Recency within 15 days',
    ],
    recommendations: [
      'Launch a guided product discovery email series',
      'Offer a loyalty program early enrollment bonus',
      'Provide personalized product recommendations based on browsing',
      'Send milestone rewards after the 5th and 10th purchase',
      'Trigger abandoned cart reminders with incentives',
      'Invite to community forums or user groups',
    ],
  },
  {
    id: 'seg-004',
    name: 'New Customer',
    description:
      'Recently acquired customers within the last 90 days making their first few purchases. Their long-term value is undetermined and depends heavily on onboarding experience and early engagement.',
    color: '#f59e0b',
    customerCount: 7,
    avgSpending: 1152.21,
    avgFrequency: 3,
    avgRecency: 5.1,
    avgLifetimeValue: 1152.21,
    totalRevenue: 8065.50,
    growthRate: 31.2,
    retentionRate: 64.5,
    churnRate: 35.5,
    characteristics: [
      'Customer tenure under 90 days',
      '1–5 total orders',
      'Currently exploring product catalog',
      'High variability in order values',
      'Responsive to onboarding communications',
      'May be first-time buyers in the category',
    ],
    recommendations: [
      'Execute a structured 30-60-90 day onboarding sequence',
      'Offer a second-purchase incentive (10–15% off)',
      'Provide a welcome kit or product guide',
      'Send educational content about full product range',
      'Assign a customer success touchpoint for high-AOV new customers',
      'Gather feedback via a post-purchase survey',
    ],
  },
  {
    id: 'seg-005',
    name: 'Occasional',
    description:
      'Customers who purchase infrequently, often seasonally or opportunistically. They may be satisfied but lack strong brand commitment. Revenue from this segment is inconsistent and hard to forecast.',
    color: '#8b5cf6',
    customerCount: 7,
    avgSpending: 4864.36,
    avgFrequency: 10,
    avgRecency: 73.1,
    avgLifetimeValue: 6285.71,
    totalRevenue: 34050.50,
    growthRate: 2.1,
    retentionRate: 55.3,
    churnRate: 44.7,
    characteristics: [
      'Purchase frequency of 7–14 orders per lifetime',
      'Recency of 30–100 days between purchases',
      'Often seasonal or event-driven buying behavior',
      'Lower average order values than core segments',
      'Low email engagement and open rates',
      'May be comparing against competitor offerings',
    ],
    recommendations: [
      'Run win-back campaigns with time-limited offers',
      'Identify seasonal triggers and time campaigns accordingly',
      'Send curated product round-ups relevant to past purchases',
      'Offer a subscription option for regularly purchased items',
      'Test SMS/push notification channel as email alternative',
      'Conduct surveys to understand barriers to more frequent purchase',
    ],
  },
  {
    id: 'seg-006',
    name: 'At-Risk',
    description:
      'Previously active customers showing declining engagement and longer purchase intervals. High likelihood of churning without intervention. Recovering these customers is cost-effective compared to acquiring new ones.',
    color: '#ef4444',
    customerCount: 8,
    avgSpending: 11362.50,
    avgFrequency: 24,
    avgRecency: 153.4,
    avgLifetimeValue: 14562.50,
    totalRevenue: 90900.00,
    growthRate: -15.8,
    retentionRate: 32.4,
    churnRate: 67.6,
    characteristics: [
      'No purchase in 90–200 days',
      'Declining email open and click rates',
      'Previously moderate-to-high purchase frequency',
      'May have experienced a negative service event',
      'Churn score between 70 and 90',
      'Comparable spending to Loyal segment before disengagement',
    ],
    recommendations: [
      'Launch personalized win-back email campaign with urgent incentive',
      'Proactively reach out via phone for high-value at-risk accounts',
      'Offer a reactivation discount of 15–25%',
      'Identify root cause of disengagement via short survey',
      'Provide a free value-add (shipping, consultation, trial)',
      'Set automated churn-risk alerts for the sales team',
    ],
  },
  {
    id: 'seg-007',
    name: 'Inactive',
    description:
      'Customers who have not made a purchase in over 300 days and show minimal engagement. They are considered churned for forecasting purposes. Some may be recoverable through highly targeted re-engagement campaigns.',
    color: '#6b7280',
    customerCount: 5,
    avgSpending: 4850.00,
    avgFrequency: 11,
    avgRecency: 369.2,
    avgLifetimeValue: 6160.00,
    totalRevenue: 24250.00,
    growthRate: -28.4,
    retentionRate: 8.2,
    churnRate: 91.8,
    characteristics: [
      'No purchase in 300+ days',
      'Very low or zero email engagement',
      'Previously low-to-moderate spending levels',
      'Account may be abandoned or contact details outdated',
      'Churn score above 90',
      'Unlikely to respond to standard campaigns',
    ],
    recommendations: [
      'Send a "We miss you" reactivation campaign with compelling offer',
      'Attempt a phone or direct mail outreach for high-LTV accounts',
      'Remove from active marketing lists to protect sender reputation',
      'Archive accounts after 18 months of inactivity',
      'Analyze common disengagement patterns for prevention strategies',
      'Test a small re-engagement cohort with aggressive discounting',
    ],
  },
];
