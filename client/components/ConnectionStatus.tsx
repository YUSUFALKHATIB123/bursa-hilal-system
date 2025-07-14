import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  apiBaseUrl?: string;
}

export default function ConnectionStatus({ apiBaseUrl }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkApiConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setApiStatus('disconnected');
      setShowStatus(true);
    };

    // Check API connection
    const checkApiConnection = async () => {
      try {
        const url = apiBaseUrl || (typeof window !== 'undefined' 
          ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api/health`
          : '/api/health');
        
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-cache',
          timeout: 5000,
        } as RequestInit);
        
        if (response.ok) {
          setApiStatus('connected');
          setShowStatus(false);
        } else {
          setApiStatus('disconnected');
          setShowStatus(true);
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiStatus('disconnected');
        setShowStatus(true);
      }
    };

    // Initial check
    checkApiConnection();

    // Check every 10 seconds
    const interval = setInterval(checkApiConnection, 10000);

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [apiBaseUrl]);

  const getStatusMessage = () => {
    if (!isOnline) {
      return {
        text: 'لا يوجد اتصال بالإنترنت',
        textEn: 'No internet connection',
        icon: <WifiOff className="w-4 h-4" />,
        color: 'bg-red-500'
      };
    }

    if (apiStatus === 'disconnected') {
      return {
        text: 'لا يوجد اتصال بالخادم',
        textEn: 'Cannot connect to server',
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'bg-orange-500'
      };
    }

    return {
      text: 'متصل',
      textEn: 'Connected',
      icon: <Wifi className="w-4 h-4" />,
      color: 'bg-green-500'
    };
  };

  const status = getStatusMessage();

  return (
    <AnimatePresence>
      {showStatus && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`${status.color} text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2`}>
            {status.icon}
            <span className="text-sm font-medium">
              {status.text}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
