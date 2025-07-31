// Request Logger - TurboPack-like functionality
const originalFetch = window.fetch;

const logRequest = (method, url, status, time, error = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const logStyle = error 
    ? 'color: #ef4444; font-weight: bold;'
    : status >= 200 && status < 300 
      ? 'color: #22c55e; font-weight: bold;'
      : 'color: #f59e0b; font-weight: bold;';
  
  console.log(
    `%c[${timestamp}] ${method} ${url} - ${status || 'ERROR'} (${time}ms)`,
    logStyle
  );
  
  if (error) {
    console.error('Request Error:', error);
  }
};

window.fetch = async (...args) => {
  const [url, options] = args;
  const method = options?.method || 'GET';
  const start = Date.now();
  
  try {
    const response = await originalFetch(...args);
    const end = Date.now();
    logRequest(method, url, response.status, end - start);
    return response;
  } catch (error) {
    const end = Date.now();
    logRequest(method, url, null, end - start, error);
    throw error;
  }
};

export { logRequest };
export default logRequest;
