import React, { useEffect, useState } from 'react';

const PerformanceMonitor = ({ children }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0
  });

  useEffect(() => {
    // Measure initial load time
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      setMetrics(prev => ({
        ...prev,
        loadTime: Math.round(navigationEntry.loadEventEnd - navigationEntry.fetchStart)
      }));
    }

    // Track API calls via performance observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const apiEntries = entries.filter(entry => 
        entry.name.includes('vercel.app') || entry.name.includes('localhost')
      );
      
      if (apiEntries.length > 0) {
        setMetrics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + apiEntries.length
        }));
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  // Only show metrics in development
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
        <div>Load: {metrics.loadTime}ms</div>
        <div>API Calls: {metrics.apiCalls}</div>
      </div>
    </>
  );
};

export default PerformanceMonitor;
