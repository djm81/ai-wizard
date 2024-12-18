declare module '../jest.setup' {
  export const TestEnvironment: {
    isTest: boolean;
    loggingEnabled: boolean;
    mockUUID: string;
    mockTimestamp: string;
    mockResponses: Map<string, any>;
    reset(): void;
  };
}
