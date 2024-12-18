export const logEvent = jest.fn();
export const getAnalytics = jest.fn().mockReturnValue({
  app: {
    name: 'test-app',
    options: {}
  }
});
