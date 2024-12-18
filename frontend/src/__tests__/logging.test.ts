// First define mock functions and analytics instance
const mockLogEvent = jest.fn();
const mockGetAnalytics = jest.fn();

// Define mock app structure that matches Firebase's expectations
const mockAnalyticsInstance = {
  app: {
    name: '[DEFAULT]',
    options: {
      apiKey: 'mock-api-key',
      appId: 'mock-app-id',
      authDomain: 'mock-auth-domain',
      messagingSenderId: 'mock-messaging-sender-id',
      projectId: 'mock-project-id',
      storageBucket: 'mock-storage-bucket'
    }
  }
};

// Setup mocks before imports
jest.mock('firebase/analytics', () => {
  mockGetAnalytics.mockReturnValue(mockAnalyticsInstance);
  return {
    getAnalytics: mockGetAnalytics,
    logEvent: mockLogEvent
  };
});

jest.mock('firebase/firestore');
jest.mock('../config/firebase', () => ({
  app: mockAnalyticsInstance.app
}));

// Import after mocks
import { Logger, LogEntry } from '../services/logging';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PUBLIC_ENVIRONMENT = 'production';
    logger = Logger.getInstance();
    logger.initializeServices();
  });

  afterEach(() => {
    process.env.PUBLIC_ENVIRONMENT = 'test';
    logger.destroy();
  });

  it('logs to analytics in production', async () => {
    const entry: LogEntry = {
      level: 'info',
      message: 'Test message',
      context: { test: true }
    };

    await logger.logToAnalytics(entry);

    expect(mockLogEvent).toHaveBeenCalledWith(
      mockAnalyticsInstance,
      'log_event',
      expect.objectContaining({
        log_level: 'info',
        message: 'Test message',
        has_context: true
      })
    );
  });
});
