// Setup mock functions before any imports
jest.mock('firebase/analytics');
jest.mock('firebase/firestore');
jest.mock('../config/firebase');

// Import dependencies after mocks are defined
import { mockApp } from '../__mocks__/firebase/app';
import { Logger, LogEntry } from '../services/logging';
import { createAuthMocks } from '../__mocks__/auth/mockFactory';

const { mockAnalytics } = createAuthMocks();
const mockLogEvent = jest.fn();
const mockGetAnalytics = jest.fn().mockReturnValue(mockAnalytics);

jest.mock('firebase/analytics', () => ({
  getAnalytics: mockGetAnalytics,
  logEvent: mockLogEvent
}));

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

    expect(mockGetAnalytics).toHaveBeenCalledWith(mockApp);
    expect(mockLogEvent).toHaveBeenCalledWith(
      mockAnalytics,
      'log_event',
      expect.objectContaining({
        log_level: 'info',
        message: 'Test message',
        has_context: true
      })
    );
  });

  it('does not log in non-production', async () => {
    process.env.PUBLIC_ENVIRONMENT = 'test';
    const entry: LogEntry = {
      level: 'info',
      message: 'Test message'
    };

    await logger.logToAnalytics(entry);
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  // Add more tests for buffering, Firestore, etc.
});
