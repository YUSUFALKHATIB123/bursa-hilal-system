import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
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
const generateDefaultTimeline = (orderId: string, status: string, timelineNotes: any = {}, completedStages: number[] = [1], language: string = "en"): TimelineStep[] => {
  const stages = [
    {
      id: "1",
      title: language === "ar" ? "تم استلام الطلب" : "Order Received",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      id: "2", 
      title: language === "ar" ? "تم الإرسال للصباغة" : "Sent to Dyeing",
      icon: Palette,
      color: "bg-purple-500",
    },
    {
      id: "3",
      title: language === "ar" ? "العودة من الصباغة" : "Back from Dyeing", 
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      id: "4",
      title: language === "ar" ? "تم الإرسال للخياطة" : "Sent to Stitching",
      icon: Scissors,
      color: "bg-orange-500",
    },
    {
      id: "5",
      title: language === "ar" ? "فحص الجودة" : "Quality Check",
      icon: Shield,
      color: "bg-yellow-500",
    },
    {
      id: "6",
      title: language === "ar" ? "جاهز للتسليم" : "Ready for Delivery",
      icon: PlayCircle,
      color: "bg-indigo-500",
    },
    {
      id: "7",
      title: language === "ar" ? "تم التسليم" : "Delivered",
      icon: Truck,
      color: "bg-gray-500",
    },
  ];

  const steps = stages.map((stage, index) => {
    const stageNumber = index + 1;
    // Handle both string and number completedStages
    const completedStageNumbers = completedStages.map(s => typeof s === 'string' ? parseInt(s) : s);
    const isCompleted = completedStageNumbers.includes(stageNumber);
    const isCurrent = !isCompleted && stageNumber === (Math.max(...completedStageNumbers) + 1) && status !== "completed";
    
    return {
      ...stage,
      date: isCompleted 
        ? `${language === "ar" ? "مكتمل" : "Completed"} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : isCurrent 
        ? (language === "ar" ? "قيد التنفيذ..." : "In Progress...") 
        : (language === "ar" ? "في الانتظار..." : "Pending..."),
      completed: isCompleted,
      current: isCurrent,
      notes: timelineNotes[stage.id],
    };
  });

  // If status is completed, mark all stages as completed
  if (status === "completed") {
    return steps.map(step => ({ ...step, completed: true, current: false }));
  }

  return steps;
};

// Get timeline steps based on order status and data
const getTimelineSteps = (order: OrderDetails, timelineNotes: any = {}, completedStages: any[] = [1], language: string = "en"): TimelineStep[] => {
  // Ensure completedStages are numbers for consistent processing
  const normalizedCompletedStages = completedStages.map(s => typeof s === 'string' ? parseInt(s) : s);
  return generateDefaultTimeline(order.id, order.status, timelineNotes, normalizedCompletedStages, language);
};

export default function TrackOrderDetails() {
  const { language } = useLanguage();
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
        const completedStages = order.completedStages || [1];
        setTimelineSteps(getTimelineSteps(transformedOrder, order.timelineNotes, completedStages, language));
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

  const addNote = async (stepId: string, note: string) => {
    try {
      await apiService.addTimelineNote(orderDetails!.id, stepId, note);
      setNewNote("");
      setEditingStep(null);
      
      // Refresh data from server to ensure consistency
      await fetchOrderDetails();
    } catch (error) {
      console.error("Error adding note:", error);
      // You could add a toast notification here
    }
  };

  const completeCurrentStage = async () => {
    if (!orderDetails) return;
    
    try {
      const currentStageIndex = timelineSteps.findIndex(step => step.current);
      if (currentStageIndex === -1) return;
      
      const currentStageNumber = currentStageIndex + 1;
      const completedStages = timelineSteps
        .filter(step => step.completed)
        .map(step => parseInt(step.id));
      
      // Add current stage to completed stages
      const newCompletedStages = [...completedStages, currentStageNumber];
      
      const isLastStage = currentStageIndex === timelineSteps.length - 1;
      const newStatus = isLastStage ? "completed" : "processing";
      
      // Convert stage numbers to stage IDs (strings) - no need to add +1 again
      const completedStageIds = newCompletedStages.map(num => num.toString());
      
      await apiService.updateOrderProgress(
        orderDetails.id, 
        completedStageIds
      );
      
      // Update local state immediately
      const updatedOrder = { ...orderDetails, status: newStatus };
      setOrderDetails(updatedOrder);
      
      // Refresh data from server to ensure consistency
      await fetchOrderDetails();
      
    } catch (error) {
      console.error("Error completing stage:", error);
    }
  };

  const goBackOneStage = async () => {
    if (!orderDetails) return;
    
    try {
      const completedStages = timelineSteps
        .filter(step => step.completed)
        .map(step => parseInt(step.id));
      
      // Remove the last completed stage
      if (completedStages.length > 1) {
        const newCompletedStages = completedStages.slice(0, -1);
        const completedStageIds = newCompletedStages.map(num => num.toString());
        
        await apiService.updateOrderProgress(
          orderDetails.id, 
          completedStageIds
        );
        
        // Refresh data from server
        await fetchOrderDetails();
      }
      
    } catch (error) {
      console.error("Error going back one stage:", error);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-700">
          {language === "ar" ? "لوحة التحكم" : "Dashboard"}
        </Link>
        <span className="mx-2">/</span>
        <Link to="/track-order" className="hover:text-gray-700">
          {language === "ar" ? "تتبع الطلبات" : "Track Orders"}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{language === "ar" ? "تفاصيل الطلب" : "Order Details"}</span>
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
            <h1 className="text-3xl font-bold text-gray-900">{language === "ar" ? "تفاصيل الطلب" : "Order Details"}</h1>
            <p className="text-gray-600">{language === "ar" ? `معرّف الطلب: ${orderDetails.id}` : `Order ID: ${orderDetails.id}`}</p>
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
            <p className="text-green-100 text-sm">{language === "ar" ? "الكمية" : "Quantity"}</p>
            <p className="text-white font-semibold text-lg">{orderDetails.quantity}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">{language === "ar" ? "الألوان" : "Colors"}</p>
            <p className="text-white font-semibold">{orderDetails.colors}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">{language === "ar" ? "تاريخ الطلب" : "Order Date"}</p>
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
              <strong>{language === "ar" ? "ملاحظات الطلب:" : "Order Notes:"}</strong> {orderDetails.notes}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          {language === "ar" ? "نظرة عامة على التقدم" : "Progress Overview"}
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{language === "ar" ? "التقدم الكلي" : "Overall Progress"}</span>
            <span className="text-sm text-gray-500">
              {language === "ar" ? `${timelineSteps.filter(s => s.completed).length} من ${timelineSteps.length} مرحلة مكتملة` : `${timelineSteps.filter(s => s.completed).length} of ${timelineSteps.length} steps completed`}
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
            {Math.round((timelineSteps.filter(s => s.completed).length / timelineSteps.length) * 100)}% {language === "ar" ? "مكتمل" : "complete"}
          </p>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {language === "ar" ? "جدول زمني للطلب" : "Order Timeline"}
        </h3>
        
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
                  
                  {/* Complete Stage Button - Only for current stage */}
                  {step.current && orderDetails?.status !== "completed" && (
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={completeCurrentStage}
                        className="bg-green-primary text-white px-4 py-2 rounded-lg hover:bg-green-secondary transition-colors font-medium"
                      >
                        {language === "ar" ? "✓ تم الانتهاء" : "✓ Mark Complete"}
                      </button>
                      {/* Go Back Button - Only show if there are completed stages */}
                      {timelineSteps.filter(s => s.completed).length > 1 && (
                        <button
                          onClick={goBackOneStage}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          {language === "ar" ? "↶ الرجوع خطوة" : "↶ Go Back"}
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Add Note Section - Only for current or completed stages */}
                  {(step.current || step.completed) && (
                    <div className="mt-3">
                      {editingStep === step.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder={language === "ar" ? "أضف ملاحظة..." : "Add a note..."}
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
                          <span>
                            {step.notes 
                              ? (language === "ar" ? "تعديل الملاحظة" : "Edit Note")
                              : (language === "ar" ? "إضافة ملاحظة" : "Add Note")
                            }
                          </span>
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
