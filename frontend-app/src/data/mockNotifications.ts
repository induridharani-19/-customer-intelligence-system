export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'Dataset' | 'Processing' | 'Prediction' | 'Model' | 'Report' | 'System';
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export const defaultNotifications: AppNotification[] = [
  { id: 'N001', title: 'Dataset Import Complete', message: 'retail_transactions_nov2024.csv (45,231 rows) has been imported and processed successfully.', category: 'Dataset', type: 'success', isRead: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(), link: '/data' },
  { id: 'N002', title: 'Segmentation Model Ready', message: 'K-Means segmentation (k=7) completed training. Silhouette score: 0.68. 11,684 customers assigned to segments.', category: 'Model', type: 'success', isRead: false, createdAt: new Date(Date.now() - 18 * 60000).toISOString(), link: '/models' },
  { id: 'N003', title: 'High Churn Risk Alert', message: '892 customers now classified as High Risk (up from 834 last week). Immediate action recommended.', category: 'Processing', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 45 * 60000).toISOString(), link: '/churn' },
  { id: 'N004', title: 'Monthly Report Generated', message: 'November 2024 Customer Intelligence Report is ready for download.', category: 'Report', type: 'info', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), link: '/reports' },
  { id: 'N005', title: 'Prediction API Connected', message: 'Successfully connected to FastAPI backend at http://127.0.0.1:8000. Prediction service is online.', category: 'System', type: 'success', isRead: true, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'N006', title: 'Batch Prediction Complete', message: 'Batch prediction for 2,341 customers completed. Results are available for download.', category: 'Prediction', type: 'success', isRead: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), link: '/prediction' },
  { id: 'N007', title: 'Data Quality Warning', message: 'Dataset Q3_2024 has 1,234 rows with missing CustomerID values (2.7% of total). Review recommended.', category: 'Dataset', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), link: '/data' },
  { id: 'N008', title: 'Neural Model Training Started', message: 'Customer embedding neural network training initiated. Estimated completion: 45 minutes.', category: 'Model', type: 'info', isRead: true, createdAt: new Date(Date.now() - 8 * 3600000).toISOString(), link: '/models' },
  { id: 'N009', title: 'Campaign Performance Alert', message: '"At-Risk Win-Back" campaign open rate (28.1%) below target (35%). Consider subject line optimization.', category: 'Processing', type: 'warning', isRead: true, createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), link: '/campaigns' },
  { id: 'N010', title: 'New Dataset Uploaded', message: 'customer_feedback_nov2024.csv uploaded by admin@ais.demo. Processing started.', category: 'Dataset', type: 'info', isRead: true, createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), link: '/data' },
  { id: 'N011', title: 'Churn Model Updated', message: 'Churn prediction model retrained on latest data. AUC-ROC improved from 0.81 to 0.86 (sample metric).', category: 'Model', type: 'success', isRead: true, createdAt: new Date(Date.now() - 1.5 * 86400000).toISOString(), link: '/models' },
  { id: 'N012', title: 'Segmentation Report Ready', message: 'Customer Segmentation Analysis Report (November 2024) has been generated.', category: 'Report', type: 'info', isRead: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), link: '/reports' },
  { id: 'N013', title: 'System Maintenance Scheduled', message: 'Planned maintenance on Dec 15, 2024 from 2:00-4:00 AM UTC. Services may be temporarily unavailable.', category: 'System', type: 'warning', isRead: false, createdAt: new Date(Date.now() - 2.5 * 86400000).toISOString() },
  { id: 'N014', title: 'CLV Predictions Updated', message: 'Customer Lifetime Value predictions refreshed for all 11,684 customers based on Q4 behavior.', category: 'Prediction', type: 'success', isRead: true, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), link: '/lifetime-value' },
  { id: 'N015', title: 'Sentiment Analysis Complete', message: '1,247 customer feedback entries analyzed. Positive: 68%, Neutral: 14%, Negative: 18%.', category: 'Processing', type: 'info', isRead: true, createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), link: '/sentiment' },
];
