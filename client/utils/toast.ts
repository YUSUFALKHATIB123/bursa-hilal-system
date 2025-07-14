import { toast } from 'react-toastify';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import React from 'react';

interface ToastOptions {
  position?: 'top-center' | 'top-right' | 'bottom-center';
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
}

// Custom Toast Components
const SuccessToast = ({ message, details }: { message: string; details?: string }) =>
  React.createElement('div', {
    className: 'flex items-start space-x-3 rtl:space-x-reverse'
  }, [
    React.createElement(CheckCircle, {
      key: 'icon',
      className: 'w-5 h-5 text-green-500 mt-0.5 flex-shrink-0'
    }),
    React.createElement('div', {
      key: 'content',
      className: 'flex-1'
    }, [
      React.createElement('p', {
        key: 'message',
        className: 'font-semibold text-gray-900 text-sm'
      }, message),
      details && React.createElement('p', {
        key: 'details',
        className: 'text-xs text-gray-600 mt-1 leading-relaxed'
      }, details)
    ])
  ]);

const ErrorToast = ({ message, details }: { message: string; details?: string }) =>
  React.createElement('div', {
    className: 'flex items-start space-x-3 rtl:space-x-reverse'
  }, [
    React.createElement(XCircle, {
      key: 'icon',
      className: 'w-5 h-5 text-red-500 mt-0.5 flex-shrink-0'
    }),
    React.createElement('div', {
      key: 'content',
      className: 'flex-1'
    }, [
      React.createElement('p', {
        key: 'message',
        className: 'font-semibold text-gray-900 text-sm'
      }, message),
      details && React.createElement('p', {
        key: 'details',
        className: 'text-xs text-gray-600 mt-1 leading-relaxed'
      }, details)
    ])
  ]);

const defaultOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Utility functions for different toast types
export const showSuccessToast = (message: string, details?: string, options?: ToastOptions) => {
  toast.success(SuccessToast({ message, details }), {
    ...defaultOptions,
    ...options,
    className: '!bg-green-50 !border-green-200',
  });
};

export const showErrorToast = (message: string, details?: string, options?: ToastOptions) => {
  toast.error(ErrorToast({ message, details }), {
    ...defaultOptions,
    ...options,
    className: '!bg-red-50 !border-red-200',
  });
};

export const showInfoToast = (message: string, details?: string, options?: ToastOptions) => {
  toast.info(
    React.createElement('div', {
      className: 'flex items-start space-x-3 rtl:space-x-reverse'
    }, [
      React.createElement(Info, {
        key: 'icon',
        className: 'w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0'
      }),
      React.createElement('div', {
        key: 'content',
        className: 'flex-1'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'font-semibold text-gray-900 text-sm'
        }, message),
        details && React.createElement('p', {
          key: 'details',
          className: 'text-xs text-gray-600 mt-1 leading-relaxed'
        }, details)
      ])
    ]),
    {
      ...defaultOptions,
      ...options,
      className: '!bg-blue-50 !border-blue-200',
    }
  );
};

export const showWarningToast = (message: string, details?: string, options?: ToastOptions) => {
  toast.warning(
    React.createElement('div', {
      className: 'flex items-start space-x-3 rtl:space-x-reverse'
    }, [
      React.createElement(AlertCircle, {
        key: 'icon',
        className: 'w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0'
      }),
      React.createElement('div', {
        key: 'content',
        className: 'flex-1'
      }, [
        React.createElement('p', {
          key: 'message',
          className: 'font-semibold text-gray-900 text-sm'
        }, message),
        details && React.createElement('p', {
          key: 'details',
          className: 'text-xs text-gray-600 mt-1 leading-relaxed'
        }, details)
      ])
    ]),
    {
      ...defaultOptions,
      ...options,
      className: '!bg-amber-50 !border-amber-200',
    }
  );
};

// Order-specific toast messages with i18n
export const orderToastMessages = {
  created: {
    ar: {
      title: "تم إنشاء الطلب بنجاح",
      getDetails: (orderId: string, customer: string, total?: number) => 
        `رقم الطلب: ${orderId}\nالعميل: ${customer}${total ? `\nالمبلغ: $${total.toLocaleString()}` : ''}`
    },
    en: {
      title: "Order Created Successfully",
      getDetails: (orderId: string, customer: string, total?: number) => 
        `Order ID: ${orderId}\nCustomer: ${customer}${total ? `\nTotal: $${total.toLocaleString()}` : ''}`
    }
  },
  updated: {
    ar: {
      title: "تم تحديث الطلب بنجاح",
      getDetails: (orderId: string, customer: string) => 
        `رقم الطلب: ${orderId}\nالعميل: ${customer}`
    },
    en: {
      title: "Order Updated Successfully",
      getDetails: (orderId: string, customer: string) => 
        `Order ID: ${orderId}\nCustomer: ${customer}`
    }
  },
  deleted: {
    ar: {
      title: "تم حذف الطلب بنجاح",
      getDetails: (orderId: string) => `رقم الطلب المحذوف: ${orderId}`
    },
    en: {
      title: "Order Deleted Successfully",
      getDetails: (orderId: string) => `Deleted Order ID: ${orderId}`
    }
  },
  error: {
    ar: {
      title: "حدث خطأ",
      create: "حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى",
      update: "حدث خطأ أثناء تحديث الطلب. يرجى المحاولة مرة أخرى",
      delete: "حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى"
    },
    en: {
      title: "Error Occurred",
      create: "An error occurred while creating the order. Please try again",
      update: "An error occurred while updating the order. Please try again",
      delete: "An error occurred while deleting the order. Please try again"
    }
  }
};

// Customer-specific toast messages
export const customerToastMessages = {
  added: {
    ar: {
      title: "تم إضافة العميل بنجاح",
      getDetails: (name: string, phone: string) => `الاسم: ${name}\nالهاتف: ${phone}`
    },
    en: {
      title: "Customer Added Successfully",
      getDetails: (name: string, phone: string) => `Name: ${name}\nPhone: ${phone}`
    }
  },
  updated: {
    ar: {
      title: "تم تحديث بيانات العميل بنجاح"
    },
    en: {
      title: "Customer Information Updated Successfully"
    }
  },
  error: {
    ar: {
      add: "حدث خطأ أثناء إضافة العميل",
      update: "حدث خطأ أثناء تحديث بيانات العميل"
    },
    en: {
      add: "An error occurred while adding the customer",
      update: "An error occurred while updating customer information"
    }
  }
};

// Simplified functions for common use cases
export const showOrderCreatedToast = (language: 'ar' | 'en', orderId: string, customer: string, total?: number) => {
  const messages = orderToastMessages.created[language];
  showSuccessToast(
    messages.title,
    messages.getDetails(orderId, customer, total)
  );
};

export const showOrderUpdatedToast = (language: 'ar' | 'en', orderId: string, customer: string) => {
  const messages = orderToastMessages.updated[language];
  showSuccessToast(
    messages.title,
    messages.getDetails(orderId, customer)
  );
};

export const showOrderDeletedToast = (language: 'ar' | 'en', orderId: string) => {
  const messages = orderToastMessages.deleted[language];
  showSuccessToast(
    messages.title,
    messages.getDetails(orderId)
  );
};

export const showCustomerAddedToast = (language: 'ar' | 'en', name: string, phone: string) => {
  const messages = customerToastMessages.added[language];
  showSuccessToast(
    messages.title,
    messages.getDetails(name, phone)
  );
};
