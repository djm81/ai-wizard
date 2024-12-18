import { getAnalytics, logEvent, Analytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { app } from '../config/firebase';
import { ENV } from 'config';
import { getConfig } from 'config';

const { ENVIRONMENT } = getConfig();

// Environment helpers
const getEnvironmentState = () => {
  const isTest = process.env.NODE_ENV === 'test';
  return {
    isProduction: !isTest && ENVIRONMENT === 'production',
    isDevelopment: !isTest && ENVIRONMENT === 'development',
    isTest
  };
};

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
  timestamp?: Date;
  userId?: string;
  eventName?: string;
  analyticsParams?: Record<string, string | number | boolean>;
}

export class Logger {
  private static instance: Logger;
  private analytics: Analytics | null = null;
  private db: Firestore | null = null;
  private buffer: LogEntry[] = [];
  private readonly BATCH_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly GA_EVENT_NAME = 'log_event';

  constructor() {
    this.initializeServices();
    this.setupPeriodicFlush();
  }

  // Make this public for testing
  public initializeServices() {
    try {
      const { isProduction } = getEnvironmentState();
      if (isProduction) {
        this.analytics = getAnalytics(app);
        this.db = getFirestore(app);
      }
    } catch (error) {
      console.error('Failed to initialize Firebase services:', error);
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private setupPeriodicFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushInterval = setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  // Make this public for testing
  public async logToAnalytics(entry: LogEntry) {
    const { isProduction } = getEnvironmentState();
    if (!this.analytics || !isProduction) return;

    try {
      const analyticsParams = {
        log_level: entry.level,
        message: entry.message.substring(0, 100),
        ...entry.analyticsParams,
        has_context: !!entry.context,
        timestamp: Date.now()
      };

      logEvent(this.analytics, entry.eventName || this.GA_EVENT_NAME, analyticsParams);
    } catch (error) {
      console.error('Failed to log to Analytics:', error);
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const { isProduction } = getEnvironmentState();
    if (!isProduction) {
      this.buffer = [];
      return;
    }

    try {
      const batchToProcess = this.buffer.splice(0, this.BATCH_SIZE);

      // Process analytics logs
      if (this.analytics) {
        await Promise.all(
          batchToProcess.map(entry => this.logToAnalytics(entry))
        );
      }

      // Process Firestore logs
      if (this.db) {
        const logsCollection = collection(this.db, 'logs');
        await Promise.all(
          batchToProcess.map(entry => addDoc(logsCollection, {
            ...entry,
            timestamp: serverTimestamp()
          }))
        );
      }
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Put failed logs back in buffer
      this.buffer.unshift(...this.buffer.splice(0, this.BATCH_SIZE));
    }
  }

  // Public methods for logging
  async info(message: string, context?: Record<string, unknown>) {
    this.buffer.push({
      level: 'info',
      message,
      context,
      timestamp: new Date()
    });

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  async warn(message: string, context?: Record<string, unknown>) {
    this.buffer.push({
      level: 'warn',
      message,
      context,
      timestamp: new Date()
    });

    if (this.buffer.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  async error(message: string, context?: Record<string, unknown>) {
    this.buffer.push({
      level: 'error',
      message,
      context,
      timestamp: new Date()
    });

    // Always flush errors immediately
    await this.flush();
  }

  // Cleanup method for testing
  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.buffer = [];
    this.analytics = null;
    this.db = null;
    Logger.instance = undefined as any;
  }
}

export const logger = Logger.getInstance();
