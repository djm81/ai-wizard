export const getEnvConfig = () => {
  if (typeof import.meta !== 'undefined') {
    return {
      API_URL: import.meta.env.PUBLIC_API_URL || 'http://localhost:8000/api'
    };
  }
  // Default values for tests
  return {
    API_URL: 'http://localhost:8000/api'
  };
}; 