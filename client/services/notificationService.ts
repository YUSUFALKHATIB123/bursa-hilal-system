import apiService from './api';

export interface NotificationData {
  id?: string;
  title: { en: string; ar: string };
  message: { en: string; ar: string };
  type: 'invoice_created' | 'invoice_due' | 'order_created' | 'order_update' | 'payment_received' | 'customer_added' | 'employee_added' | 'low_stock';
  category: 'financial' | 'inventory' | 'production' | 'hr' | 'sales';
  priority: 'low' | 'medium' | 'high';
  timestamp?: string;
  read?: boolean;
  actionUrl: string;
  relatedEntityId: string;
  icon: string;
  userId: string;
  userName: string;
}

class NotificationService {
  // Create a new notification
  async createNotification(data: NotificationData): Promise<NotificationData | null> {
    try {
      const notification = {
        ...data,
        id: `NOTIF-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      await apiService.createNotification(notification);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Auto-generate notification for invoice creation
  async notifyInvoiceCreated(invoiceId: string, customerName: string, amount: number, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'New Invoice Created',
        ar: 'تم إنشاء فاتورة جديدة'
      },
      message: {
        en: `Invoice ${invoiceId} for ${customerName} (${amount.toLocaleString()}) created by ${userName}`,
        ar: `تم إنشاء فاتورة ${invoiceId} للعميل ${customerName} (${amount.toLocaleString()}) بواسطة ${userName}`
      },
      type: 'invoice_created',
      category: 'financial',
      priority: 'medium',
      actionUrl: `/invoices`,
      relatedEntityId: invoiceId,
      icon: 'FileText',
      userId,
      userName
    });
  }

  // Auto-generate notification for order creation
  async notifyOrderCreated(orderId: string, customerName: string, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'New Order Created',
        ar: 'تم إنشاء طلب جديد'
      },
      message: {
        en: `Order ${orderId} for ${customerName} created by ${userName}`,
        ar: `تم إنشاء طلب ${orderId} للعميل ${customerName} بواسطة ${userName}`
      },
      type: 'order_created',
      category: 'production',
      priority: 'medium',
      actionUrl: `/track-order/${orderId}/details`,
      relatedEntityId: orderId,
      icon: 'ShoppingCart',
      userId,
      userName
    });
  }

  // Auto-generate notification for payment received
  async notifyPaymentReceived(invoiceId: string, amount: number, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'Payment Received',
        ar: 'تم استلام دفعة'
      },
      message: {
        en: `Payment of $${amount.toLocaleString()} received for invoice ${invoiceId} by ${userName}`,
        ar: `تم استلام دفعة ${amount.toLocaleString()}$ للفاتورة ${invoiceId} بواسطة ${userName}`
      },
      type: 'payment_received',
      category: 'financial',
      priority: 'medium',
      actionUrl: `/invoices`,
      relatedEntityId: invoiceId,
      icon: 'DollarSign',
      userId,
      userName
    });
  }

  // Auto-generate notification for customer addition
  async notifyCustomerAdded(customerName: string, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'New Customer Added',
        ar: 'تم إضافة عميل جديد'
      },
      message: {
        en: `Customer ${customerName} has been added by ${userName}`,
        ar: `تمت إضافة العميل ${customerName} بواسطة ${userName}`
      },
      type: 'customer_added',
      category: 'sales',
      priority: 'low',
      actionUrl: `/customers`,
      relatedEntityId: `CUST-${Date.now()}`,
      icon: 'Users',
      userId,
      userName
    });
  }

  // Auto-generate notification for employee addition
  async notifyEmployeeAdded(employeeName: string, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'New Employee Added',
        ar: 'تم إضافة موظف جديد'
      },
      message: {
        en: `Employee ${employeeName} has been added by ${userName}`,
        ar: `تمت إضافة الموظف ${employeeName} بواسطة ${userName}`
      },
      type: 'employee_added',
      category: 'hr',
      priority: 'low',
      actionUrl: `/employees`,
      relatedEntityId: `EMP-${Date.now()}`,
      icon: 'UserCheck',
      userId,
      userName
    });
  }

  // Auto-generate notification for order status update
  async notifyOrderUpdate(orderId: string, newStatus: string, userId: string, userName: string): Promise<void> {
    await this.createNotification({
      title: {
        en: 'Order Status Updated',
        ar: 'تم تحديث حالة الطلب'
      },
      message: {
        en: `Order ${orderId} status updated to ${newStatus} by ${userName}`,
        ar: `تم تحديث حالة الطلب ${orderId} إلى ${newStatus} بواسطة ${userName}`
      },
      type: 'order_update',
      category: 'production',
      priority: 'medium',
      actionUrl: `/track-order/${orderId}/details`,
      relatedEntityId: orderId,
      icon: 'Clock',
      userId,
      userName
    });
  }

  // Auto-generate notification for low stock
  async notifyLowStock(itemName: string, currentStock: number, minThreshold: number): Promise<void> {
    await this.createNotification({
      title: {
        en: 'Low Stock Alert',
        ar: 'تنبيه انخفاض المخزون'
      },
      message: {
        en: `${itemName} is below minimum threshold (${currentStock} remaining, minimum: ${minThreshold})`,
        ar: `${itemName} أقل من الحد الأدنى (${currentStock} متبقي، الحد الأدنى: ${minThreshold})`
      },
      type: 'low_stock',
      category: 'inventory',
      priority: 'high',
      actionUrl: `/inventory`,
      relatedEntityId: `STOCK-${Date.now()}`,
      icon: 'AlertTriangle',
      userId: 'system',
      userName: 'System'
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.updateNotification(notificationId, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await apiService.getNotifications();
      const unreadNotifications = notifications.filter((n: any) => !n.read);
      
      for (const notification of unreadNotifications) {
        await this.markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get all notifications
  async getNotifications(): Promise<NotificationData[]> {
    try {
      return await apiService.getNotifications();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export default new NotificationService();
