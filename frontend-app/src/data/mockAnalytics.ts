export const revenueData = [
  { month: 'Jan', revenue: 245000, prev: 198000 },
  { month: 'Feb', revenue: 268000, prev: 212000 },
  { month: 'Mar', revenue: 312000, prev: 245000 },
  { month: 'Apr', revenue: 289000, prev: 267000 },
  { month: 'May', revenue: 334000, prev: 289000 },
  { month: 'Jun', revenue: 378000, prev: 312000 },
  { month: 'Jul', revenue: 356000, prev: 334000 },
  { month: 'Aug', revenue: 412000, prev: 356000 },
  { month: 'Sep', revenue: 445000, prev: 378000 },
  { month: 'Oct', revenue: 398000, prev: 412000 },
  { month: 'Nov', revenue: 467000, prev: 398000 },
  { month: 'Dec', revenue: 512000, prev: 445000 },
];

export const acquisitionData = [
  { month: 'Jan', new: 450, churned: 89 },
  { month: 'Feb', new: 523, churned: 102 },
  { month: 'Mar', new: 612, churned: 78 },
  { month: 'Apr', new: 489, churned: 95 },
  { month: 'May', new: 674, churned: 84 },
  { month: 'Jun', new: 723, churned: 71 },
  { month: 'Jul', new: 598, churned: 88 },
  { month: 'Aug', new: 812, churned: 65 },
  { month: 'Sep', new: 756, churned: 93 },
  { month: 'Oct', new: 689, churned: 110 },
  { month: 'Nov', new: 834, churned: 79 },
  { month: 'Dec', new: 901, churned: 62 },
];

export const segmentDistribution = [
  { name: 'High-Value', value: 847, color: '#6366f1' },
  { name: 'Loyal', value: 1234, color: '#8b5cf6' },
  { name: 'Potential', value: 2156, color: '#06b6d4' },
  { name: 'New Customer', value: 1678, color: '#10b981' },
  { name: 'Occasional', value: 3421, color: '#f59e0b' },
  { name: 'At-Risk', value: 892, color: '#ef4444' },
  { name: 'Inactive', value: 1456, color: '#6b7280' },
];

export const spendingDistribution = [
  { range: '$0–100', count: 2341 },
  { range: '$100–500', count: 4512 },
  { range: '$500–1K', count: 3234 },
  { range: '$1K–5K', count: 1876 },
  { range: '$5K+', count: 721 },
];

export const churnRiskDistribution = [
  { risk: 'Low Risk', count: 8201, percentage: 70.2, color: '#10b981' },
  { risk: 'Medium Risk', count: 2591, percentage: 22.2, color: '#f59e0b' },
  { risk: 'High Risk', count: 892, percentage: 7.6, color: '#ef4444' },
];

export const retentionData = [
  { month: 'Jan', rate: 78.2 },
  { month: 'Feb', rate: 79.1 },
  { month: 'Mar', rate: 80.4 },
  { month: 'Apr', rate: 79.8 },
  { month: 'May', rate: 81.2 },
  { month: 'Jun', rate: 82.0 },
  { month: 'Jul', rate: 81.5 },
  { month: 'Aug', rate: 82.8 },
  { month: 'Sep', rate: 83.1 },
  { month: 'Oct', rate: 82.4 },
  { month: 'Nov', rate: 83.6 },
  { month: 'Dec', rate: 84.2 },
];

export const categoryPerformance = [
  { category: 'Electronics', revenue: 892340, orders: 4521 },
  { category: 'Clothing', revenue: 678920, orders: 7834 },
  { category: 'Home & Garden', revenue: 534100, orders: 3210 },
  { category: 'Sports', revenue: 412780, orders: 2987 },
  { category: 'Books', revenue: 289340, orders: 5621 },
  { category: 'Beauty', revenue: 367890, orders: 4102 },
  { category: 'Food & Drink', revenue: 198760, orders: 6543 },
  { category: 'Toys', revenue: 234510, orders: 2109 },
];

export const frequencyDistribution = [
  { label: '1x/month', count: 3421 },
  { label: '2x/month', count: 2567 },
  { label: '3x/month', count: 1890 },
  { label: '4x/month', count: 1234 },
  { label: '5x+/month', count: 572 },
];

export const segmentRevenue = [
  { month: 'Jul', 'High-Value': 89400, Loyal: 67200, Potential: 54100, Occasional: 34200, 'At-Risk': 12400 },
  { month: 'Aug', 'High-Value': 94100, Loyal: 71300, Potential: 58900, Occasional: 37800, 'At-Risk': 10200 },
  { month: 'Sep', 'High-Value': 102300, Loyal: 74500, Potential: 61200, Occasional: 39100, 'At-Risk': 9800 },
  { month: 'Oct', 'High-Value': 98700, Loyal: 69800, Potential: 55400, Occasional: 35600, 'At-Risk': 11300 },
  { month: 'Nov', 'High-Value': 109200, Loyal: 78900, Potential: 64300, Occasional: 42100, 'At-Risk': 8900 },
  { month: 'Dec', 'High-Value': 121400, Loyal: 89300, Potential: 71200, Occasional: 47800, 'At-Risk': 7400 },
];

export const scatterData = Array.from({ length: 40 }, (_, i) => ({
  recency: Math.floor(Math.random() * 180) + 5,
  monetary: Math.round((Math.random() * 12 + 1) * 10) / 10,
  frequency: Math.round((Math.random() * 5 + 0.5) * 10) / 10,
  segment: ['High-Value', 'Loyal', 'Potential', 'Occasional', 'At-Risk'][Math.floor(Math.random() * 5)],
}));

export const clvData = [
  { month: 'Jul', historical: 312400, predicted: 0 },
  { month: 'Aug', historical: 345600, predicted: 0 },
  { month: 'Sep', historical: 378900, predicted: 0 },
  { month: 'Oct', historical: 356200, predicted: 0 },
  { month: 'Nov', historical: 401300, predicted: 0 },
  { month: 'Dec', historical: 423800, predicted: 0 },
  { month: 'Jan', historical: 0, predicted: 445000 },
  { month: 'Feb', historical: 0, predicted: 467000 },
  { month: 'Mar', historical: 0, predicted: 489000 },
  { month: 'Apr', historical: 0, predicted: 512000 },
  { month: 'May', historical: 0, predicted: 534000 },
  { month: 'Jun', historical: 0, predicted: 558000 },
];
