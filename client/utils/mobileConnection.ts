// Mobile connection utilities
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getMobileNetworkInfo = (): string => {
  // @ts-ignore - navigator.connection is experimental but widely supported
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    return `Type: ${connection.effectiveType || 'unknown'}, Speed: ${connection.downlink || 'unknown'}Mbps`;
  }
  
  return 'Network info not available';
};

export const checkMobileApiConnectivity = async (baseUrl: string): Promise<{
  isReachable: boolean;
  latency?: number;
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    // Try to reach the health endpoint
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
      // Add timeout for mobile
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    });
    
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return { isReachable: true, latency };
    } else {
      return { 
        isReachable: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        return { 
          isReachable: false, 
          latency,
          error: 'Request timeout - slow network connection' 
        };
      } else if (error.message.includes('Failed to fetch')) {
        return { 
          isReachable: false, 
          error: 'Network connection failed - check wifi/mobile data' 
        };
      }
      
      return { 
        isReachable: false, 
        error: error.message 
      };
    }
    
    return { 
      isReachable: false, 
      error: 'Unknown connection error' 
    };
  }
};

export const logMobileConnectionInfo = () => {
  console.log('=== Mobile Connection Debug Info ===');
  console.log('User Agent:', navigator.userAgent);
  console.log('Is Mobile:', isMobileDevice());
  console.log('Online Status:', navigator.onLine);
  console.log('Network Info:', getMobileNetworkInfo());
  console.log('Current URL:', window.location.href);
  console.log('Current Host:', window.location.host);
  console.log('Current Protocol:', window.location.protocol);
  console.log('====================================');
};
