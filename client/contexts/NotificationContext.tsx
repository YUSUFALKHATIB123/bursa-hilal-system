import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import notificationService, { NotificationData } from "../services/notificationService";
import { useAuth } from "./AuthContext";

export interface Notification {
  id: string;
  title: { en: string; ar: string };
  message: { en: string; ar: string };
  type: 'invoice_created' | 'invoice_due' | 'order_created' | 'order_update' | 'payment_received' | 'customer_added' | 'employee_added' | 'low_stock';
  category: 'financial' | 'inventory' | 'production' | 'hr' | 'sales';
  priority: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
  actionUrl: string;
  relatedEntityId: string;
  icon: string;
  userId: string;
  userName: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<NotificationData, "id" | "timestamp" | "read">) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Helper methods for automatic notifications
  notifyInvoiceCreated: (invoiceId: string, customerName: string, amount: number) => Promise<void>;
  notifyOrderCreated: (orderId: string, customerName: string) => Promise<void>;
  notifyPaymentReceived: (invoiceId: string, amount: number) => Promise<void>;
  notifyCustomerAdded: (customerName: string) => Promise<void>;
  notifyEmployeeAdded: (employeeName: string) => Promise<void>;
  notifyOrderUpdate: (orderId: string, newStatus: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from database
  const refreshNotifications = async () => {
    try {
      setLoading(true);
      const fetchedNotifications = await notificationService.getNotifications();
      // Ensure all notifications have required fields and sort by timestamp (newest first)
      const validNotifications = fetchedNotifications.filter(n => n.id).map(n => ({
        ...n,
        id: n.id!,
        timestamp: n.timestamp || new Date().toISOString(),
        read: n.read ?? false
      })) as Notification[];
      
      // Sort notifications by timestamp (newest first)
      validNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setNotifications(validNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and set up polling
  useEffect(() => {
    refreshNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(refreshNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const addNotification = async (notificationData: Omit<NotificationData, "id" | "timestamp" | "read">) => {
    try {
      const newNotification = await notificationService.createNotification({
        ...notificationData,
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown User'
      });
      
      // Add the new notification to the top of the list immediately
      if (newNotification && newNotification.id) {
        const notificationWithDefaults = {
          ...newNotification,
          id: newNotification.id,
          timestamp: newNotification.timestamp || new Date().toISOString(),
          read: newNotification.read ?? false
        } as Notification;
        
        setNotifications((prev) => [notificationWithDefaults, ...prev]);
      } else {
        // Fallback: refresh if we don't get the new notification back
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      // Refresh on error to ensure consistency
      await refreshNotifications();
    }
  };

  // Helper methods for automatic notifications
  const notifyInvoiceCreated = async (invoiceId: string, customerName: string, amount: number) => {
    await notificationService.notifyInvoiceCreated(
      invoiceId,
      customerName,
      amount,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const notifyOrderCreated = async (orderId: string, customerName: string) => {
    await notificationService.notifyOrderCreated(
      orderId,
      customerName,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const notifyPaymentReceived = async (invoiceId: string, amount: number) => {
    await notificationService.notifyPaymentReceived(
      invoiceId,
      amount,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const notifyCustomerAdded = async (customerName: string) => {
    await notificationService.notifyCustomerAdded(
      customerName,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const notifyEmployeeAdded = async (employeeName: string) => {
    await notificationService.notifyEmployeeAdded(
      employeeName,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const notifyOrderUpdate = async (orderId: string, newStatus: string) => {
    await notificationService.notifyOrderUpdate(
      orderId,
      newStatus,
      user?.id || 'unknown',
      user?.name || 'Unknown User'
    );
    await refreshNotifications();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    addNotification,
    refreshNotifications,
    notifyInvoiceCreated,
    notifyOrderCreated,
    notifyPaymentReceived,
    notifyCustomerAdded,
    notifyEmployeeAdded,
    notifyOrderUpdate,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
