import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { useLanguage } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import OrdersManagement from "./pages/OrdersManagement";
import TrackOrder from "./pages/TrackOrder";
import TrackOrderDetails from "./pages/TrackOrderDetails";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import Inventory from "./pages/Inventory";
import Employees from "./pages/Employees";
import Notifications from "./pages/Notifications";
import FinancialDashboard from "./pages/FinancialDashboard";
import Suppliers from "./pages/Suppliers";
import Settings from "./pages/Settings";
import MobileTest from "./pages/MobileTest";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

// Component for Toast Container with i18n support
function AppToastContainer() {
  const { language } = useLanguage();
  
  return (
    <ToastContainer
      position="top-center"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={language === "ar"}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      limit={3}
      className="!font-sans"
      toastClassName="!bg-white !text-gray-800 !rounded-xl !shadow-lg !border !border-gray-200 !text-sm !font-medium"
      bodyClassName="!p-4 !text-sm !leading-relaxed"
      progressClassName="!bg-green-500"
      closeButton={false}
      icon={false}
    />
  );
}

function AppContent() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/mobile-test" element={<MobileTest />} />
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute permission="orders">
                              <OrdersManagement />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/track-order"
                          element={
                            <ProtectedRoute permission="track-order">
                              <TrackOrder />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/track-order/:orderId/details"
                          element={
                            <ProtectedRoute permission="track-order">
                              <TrackOrderDetails />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/customers"
                          element={
                            <ProtectedRoute permission="customers">
                              <Customers />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/invoices"
                          element={
                            <ProtectedRoute permission="invoices">
                              <Invoices />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/inventory"
                          element={
                            <ProtectedRoute permission="inventory">
                              <Inventory />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/employees"
                          element={
                            <ProtectedRoute permission="employees">
                              <Employees />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/notifications"
                          element={
                            <ProtectedRoute permission="notifications">
                              <Notifications />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/financial"
                          element={
                            <ProtectedRoute permission="financial">
                              <FinancialDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/suppliers"
                          element={
                            <ProtectedRoute permission="suppliers">
                              <Suppliers />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute permission="admin">
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
            <AppToastContainer />
          </NotificationProvider>
        );
}
