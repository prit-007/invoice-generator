import React from 'react';

const DebugInfo = () => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg border border-gray-700 z-50 max-w-xs">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-gray-400 hover:text-white"
      >
        ×
      </button>
      <div className="space-y-1">
        <div className="font-semibold text-blue-300">🚀 Invoice Generator</div>
        <div>🌐 API: {process.env.REACT_APP_API_URL || 'http://localhost:1969'}</div>
        <div>🏗️ Mode: {process.env.NODE_ENV}</div>
        <div>⏰ Build: {new Date().toLocaleString()}</div>
        <div>🔍 Debug: Enabled</div>
      </div>
    </div>
  );
};

export default DebugInfo;
