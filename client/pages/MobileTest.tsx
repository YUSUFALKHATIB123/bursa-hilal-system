import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Wifi, 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Monitor
} from 'lucide-react';
import { logMobileConnectionInfo, isMobileDevice, checkMobileApiConnectivity } from '../utils/mobileConnection';
import apiService from '../services/api';

export default function MobileTest() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<any>({});

  useEffect(() => {
    detectDevice();
    runTests();
  }, []);

  const detectDevice = () => {
    const info = {
      isMobile: isMobileDevice(),
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      currentUrl: window.location.href,
      networkHost: window.location.host,
    };
    setDeviceInfo(info);
    
    if (info.isMobile) {
      logMobileConnectionInfo();
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults = [];

    // Test 1: API Health Check
    try {
      const startTime = Date.now();
      const healthResponse = await fetch(`${window.location.protocol}//${window.location.host}/api/health`);
      const healthData = await healthResponse.json();
      const latency = Date.now() - startTime;
      
      testResults.push({
        name: 'API Health Check',
        status: healthResponse.ok ? 'success' : 'error',
        message: healthResponse.ok ? `Server healthy (${latency}ms)` : 'Server not responding',
        data: healthData,
        latency
      });
    } catch (error) {
      testResults.push({
        name: 'API Health Check',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    // Test 2: Employees API
    try {
      const startTime = Date.now();
      const employees = await apiService.getEmployees();
      const latency = Date.now() - startTime;
      
      testResults.push({
        name: 'Employees API',
        status: 'success',
        message: `Loaded ${employees?.length || 0} employees (${latency}ms)`,
        data: employees?.slice(0, 2), // Show first 2 employees
        latency
      });
    } catch (error) {
      testResults.push({
        name: 'Employees API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    // Test 3: Orders API
    try {
      const startTime = Date.now();
      const orders = await apiService.getOrders();
      const latency = Date.now() - startTime;
      
      testResults.push({
        name: 'Orders API',
        status: 'success',
        message: `Loaded ${orders?.length || 0} orders (${latency}ms)`,
        data: orders?.slice(0, 2), // Show first 2 orders
        latency
      });
    } catch (error) {
      testResults.push({
        name: 'Orders API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    // Test 4: Inventory API
    try {
      const startTime = Date.now();
      const inventory = await apiService.getInventory();
      const latency = Date.now() - startTime;
      
      testResults.push({
        name: 'Inventory API',
        status: 'success',
        message: `Loaded ${inventory?.length || 0} items (${latency}ms)`,
        data: inventory?.slice(0, 2), // Show first 2 items
        latency
      });
    } catch (error) {
      testResults.push({
        name: 'Inventory API',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      });
    }

    setTests(testResults);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getLatencyColor = (latency?: number) => {
    if (!latency) return 'text-gray-500';
    if (latency < 200) return 'text-green-500';
    if (latency < 1000) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-3 mb-4">
            {deviceInfo.isMobile ? (
              <Smartphone className="w-6 h-6 text-blue-500" />
            ) : (
              <Monitor className="w-6 h-6 text-gray-500" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              اختبار الاتصال للأجهزة المحمولة
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">معلومات الجهاز</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">النوع:</span> {deviceInfo.isMobile ? 'جهاز محمول' : 'كمبيوتر'}</p>
                <p><span className="font-medium">الاتصال:</span> {deviceInfo.online ? 'متصل' : 'غير متصل'}</p>
                <p><span className="font-medium">الحجم:</span> {deviceInfo.width}×{deviceInfo.height}</p>
                <p><span className="font-medium">DPR:</span> {deviceInfo.devicePixelRatio}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">معلومات الشبكة</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">المضيف:</span> {deviceInfo.networkHost}</p>
                <p><span className="font-medium">URL:</span> {deviceInfo.currentUrl}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">نتائج الاختبار</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>إعادة الاختبار</span>
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold text-gray-900">{test.name}</h3>
                </div>
                {test.latency && (
                  <span className={`text-sm font-medium ${getLatencyColor(test.latency)}`}>
                    {test.latency}ms
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">{test.message}</p>
              
              {test.data && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">عينة من البيانات:</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(test.data, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">جاري تشغيل الاختبارات...</span>
          </div>
        )}
      </div>
    </div>
  );
}
