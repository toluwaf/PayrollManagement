// backend/services/notificationService.js
class NotificationService {
  constructor() {
    this.notifications = new Map();
  }

  async sendPayrollNotification(payrollRun, type) {
    const notification = {
      id: Date.now().toString(),
      type,
      payrollId: payrollRun._key,
      period: payrollRun.period,
      message: this.getMessage(type, payrollRun),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store notification (in production, use Redis or database)
    this.notifications.set(notification.id, notification);
    
    // In real implementation, integrate with:
    // - Email service (SendGrid, Mailgun)
    // - SMS service (Twilio)
    // - WebSocket for real-time frontend updates
  }

  getMessage(type, payrollRun) {
    const messages = {
      PROCESSED: `Payroll for ${payrollRun.period} has been processed`,
      APPROVED: `Payroll for ${payrollRun.period} has been approved`,
      REMITTANCE_DUE: `Statutory remittance due for ${payrollRun.period}`
    };
    return messages[type] || 'Notification';
  }
}

module.exports = new NotificationService();