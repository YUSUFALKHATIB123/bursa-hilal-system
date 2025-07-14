// Detect current environment and port
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client side - use current host and port
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}:${port}/api`;
  }
  // Server side or fallback
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request URL:', url); // Debug log
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText} for ${url}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('API Response:', { endpoint, data: Array.isArray(data) ? `Array(${data.length})` : typeof data });
      return data;
    } catch (error) {
      console.error('API request failed:', { url, error });
      throw error;
    }
  }

  // Orders API
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: string, order: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: string) {
    const url = `${API_BASE_URL}/orders/${id}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // For DELETE requests, don't try to parse JSON from empty response
      return { success: true };
    } catch (error) {
      console.error('Delete request failed:', error);
      throw error;
    }
  }

  async addTimelineNote(orderId: string, stepId: string, note: string) {
    return this.request(`/orders/${orderId}/timeline-note`, {
      method: 'POST',
      body: JSON.stringify({ stepId, note }),
    });
  }

  async updateOrderProgress(orderId: string, completedStages: string[]) {
    return this.request(`/orders/${orderId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ completedStages }),
    });
  }

  // Invoices API
  async getInvoices() {
    return this.request('/invoices');
  }

  async getInvoice(id: string) {
    return this.request(`/invoices/${id}`);
  }

  async createInvoice(invoice: any) {
    return this.request('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  async updateInvoice(id: string, invoice: any) {
    return this.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoice),
    });
  }

  async deleteInvoice(id: string) {
    return this.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadInvoiceFile(formData: FormData) {
    const url = `${API_BASE_URL}/invoices/upload`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // Don't set Content-Type, let browser set it
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async downloadInvoiceFile(filename: string) {
    const url = `${API_BASE_URL}/invoices/download/${filename}`;
    window.open(url, '_blank');
  }

  // Customers API
  async getCustomers() {
    return this.request('/customers');
  }

  async getCustomer(id: string) {
    return this.request(`/customers/${id}`);
  }

  async createCustomer(customer: any) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async updateCustomer(id: string, customer: any) {
    return this.request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customer),
    });
  }

  async deleteCustomer(id: string) {
    return this.request(`/customers/${id}`, {
      method: 'DELETE',
    });
  }

  // Inventory API
  async getInventory() {
    return this.request('/inventory');
  }

  async getInventoryItem(id: string) {
    return this.request(`/inventory/${id}`);
  }

  async createInventoryItem(item: any) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateInventoryItem(id: string, item: any) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Employees API
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployee(id: string) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employee: any) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id: string, employee: any) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  }

  async deleteEmployee(id: string) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications API
  async getNotifications() {
    return this.request('/notifications');
  }

  async getNotification(id: string) {
    return this.request(`/notifications/${id}`);
  }

  async createNotification(notification: any) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  async updateNotification(id: string, updates: any) {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Mark notification as read
  async markNotificationAsRead(id: string) {
    return this.updateNotification(id, { read: true });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    const notifications = await this.getNotifications();
    const unreadNotifications = notifications.filter((n: any) => !n.read);
    
    for (const notification of unreadNotifications) {
      await this.markNotificationAsRead(notification.id);
    }
  }

  // Financials API
  async getFinancials() {
    return this.request('/financials');
  }

  async updateFinancials(financials: any) {
    return this.request('/financials', {
      method: 'PUT',
      body: JSON.stringify(financials),
    });
  }

  // Suppliers API
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async getSupplier(id: string) {
    return this.request(`/suppliers/${id}`);
  }

  async createSupplier(supplier: any) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
  }

  async updateSupplier(id: string, supplier: any) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplier),
    });
  }

  async deleteSupplier(id: string) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;

