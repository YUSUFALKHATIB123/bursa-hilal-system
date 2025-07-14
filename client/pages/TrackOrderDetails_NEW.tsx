import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import apiService from "../services/api";
import {
  ArrowLeft,
  Package,
  Palette,
  Scissors,
  Shield,
  PlayCircle,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  User,
  DollarSign,
  Edit,
  Save,
  X,
} from "lucide-react";

interface TimelineStep {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  notes?: string;
  icon: any;
  color: string;
}

interface OrderDetails {
  id: string;
  customer: string;
  product: string;
  quantity: string;
  colors: string;
  date: string;
  total: number;
  depositPaid: number;
  remaining: number;
  paymentMethod: string;
  notes: string;
  status: string;
}

// Helper function to generate default timeline for any order
const generateDefaultTimeline = (orderId: string, status: string): TimelineStep[] => {
  const steps = [
    {
      id: "1",
      title: "Order Received",
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      completed: true,
      icon: Package,
      color: "bg-blue-500",
      notes: "Order confirmed and received in system.",
    },
    {
      id: "2", 
      title: "Sent to Dyeing",
      date: status === "pending" ? "Pending..." : "Processing...",
      completed: status !== "pending",
      current: status === "processing",
      icon: Palette,
      color: "bg-purple-500",
      notes: status !== "pending" ? "Materials sent to dyeing department." : undefined,
    },
    {
      id: "3",
      title: "Back from Dyeing", 
      date: status === "completed" ? "Completed" : "Expected in 2-3 days",
      completed: status === "completed",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      id: "4",
      title: "Sent to Stitching",
      date: status === "completed" ? "Completed" : "Pending dyeing completion",
      completed: status === "completed",
      icon: Scissors,
      color: "bg-orange-500",
    },
    {
      id: "5",
      title: "Quality Check",
      date: status === "completed" ? "Completed" : "Pending stitching completion",
      completed: status === "completed",
      icon: Shield,
      color: "bg-yellow-500",
    },
    {
      id: "6",
      title: "Ready for Delivery",
      date: status === "completed" ? "Completed" : "Pending quality check",
      completed: status === "completed",
      icon: PlayCircle,
      color: "bg-indigo-500",
    },
    {
      id: "7",
      title: "Delivered",
      date: status === "completed" ? "Delivered" : "Pending dispatch",
      completed: status === "completed",
      icon: Truck,
      color: "bg-gray-500",
    },
  ];

  return steps;
};

// Get timeline steps based on order status and data
const getTimelineSteps = (order: OrderDetails): TimelineStep[] => {
  return generateDefaultTimeline(order.id, order.status);
};

export default function TrackOrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [timelineSteps, setTimelineSteps] = useState<TimelineStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [editingStep, setEditingStep] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const orders = await apiService.getOrders();
      const order = orders.find((o: any) => o.id === orderId);
      
      if (order) {
        // Transform API data to match OrderDetails interface
        const transformedOrder: OrderDetails = {
          id: order.id,
          customer: order.customer,
          product: order.product || "Product Name",
          quantity: order.quantity || "N/A",
          colors: order.colors || "N/A",
          date: order.date,
          total: order.total,
          depositPaid: order.depositPaid || order.deposit || 0,
          remaining: order.remaining || (order.total - (order.depositPaid || order.deposit || 0)),
          paymentMethod: order.paymentMethod || "Not specified",
          notes: order.notes || "No additional notes",
          status: order.status || "pending",
        };
        
        setOrderDetails(transformedOrder);
        setTimelineSteps(getTimelineSteps(transformedOrder));
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-primary"></div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Order Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            {error ? "Failed to load order details." : `The order ID "${orderId}" could not be found.`}
          </p>
          <Link
            to="/track-order"
            className="text-green-primary hover:text-green-secondary"
          >
            Return to Track Orders
          </Link>
        </div>
      </div>
    );
  }

  const addNote = (stepId: string, note: string) => {
    setTimelineSteps((steps) =>
      steps.map((step) =>
        step.id === stepId ? { ...step, notes: note } : step
      )
    );
    setNewNote("");
    setEditingStep(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <Link to="/track-order" className="hover:text-gray-700">
          Track Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Order Details</span>
      </nav>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Link
            to="/track-order"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order ID: {orderDetails.id}</p>
          </div>
        </div>
      </motion.div>

      {/* Order Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-primary to-green-secondary rounded-lg p-6 text-white"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{orderDetails.customer}</h2>
            <p className="text-green-100 text-lg">{orderDetails.product}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <p className="text-green-100 text-sm">Quantity</p>
            <p className="text-white font-semibold text-lg">{orderDetails.quantity}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Colors</p>
            <p className="text-white font-semibold">{orderDetails.colors}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Order Date</p>
            <p className="text-white font-semibold">{orderDetails.date}</p>
          </div>
        </div>

        {orderDetails.notes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-blue-500 bg-opacity-20 rounded-lg"
          >
            <p className="text-sm text-blue-100">
              <strong>Order Notes:</strong> {orderDetails.notes}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Financial Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">${orderDetails.total}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Deposit Paid</p>
            <p className="text-2xl font-bold text-green-600">${orderDetails.depositPaid}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-orange-600">${orderDetails.remaining}</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Payment Method: <span className="font-semibold">{orderDetails.paymentMethod}</span>
          </p>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Progress Overview
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">
              {timelineSteps.filter(s => s.completed).length} of {timelineSteps.length} steps completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(timelineSteps.filter(s => s.completed).length / timelineSteps.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-green-primary to-green-secondary h-3 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {Math.round((timelineSteps.filter(s => s.completed).length / timelineSteps.length) * 100)}% complete
          </p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
        
        <div className="space-y-6">
          {timelineSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-start space-x-4"
              >
                {/* Timeline Line */}
                {index < timelineSteps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                )}
                
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    step.completed
                      ? step.color
                      : step.current
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      step.completed
                        ? "text-white"
                        : step.current
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-lg font-semibold ${
                        step.completed
                          ? "text-gray-900"
                          : step.current
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{step.date}</span>
                    </div>
                  </div>
                  
                  {step.notes && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{step.notes}</p>
                    </div>
                  )}
                  
                  {/* Add Note Section */}
                  {step.completed && (
                    <div className="mt-3">
                      {editingStep === step.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-primary focus:border-transparent"
                          />
                          <button
                            onClick={() => addNote(step.id, newNote)}
                            className="p-2 bg-green-primary text-white rounded-lg hover:bg-green-secondary"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStep(null);
                              setNewNote("");
                            }}
                            className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingStep(step.id)}
                          className="flex items-center space-x-2 text-sm text-green-primary hover:text-green-secondary"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Add Note</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
