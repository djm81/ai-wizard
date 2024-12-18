import type { JestMock } from '@jest/types';

declare global {
  namespace jest {
    // Define proper mock types for our use cases
    interface Mock<TReturn = any, TArgs extends any[] = any[]> {
      new (...args: TArgs): TReturn;
      (...args: TArgs): TReturn;
      mockImplementation(fn: (...args: TArgs) => TReturn): this;
      mockReturnValue(value: TReturn): this;
      mockResolvedValue(value: TReturn): this;
      mockRejectedValue(value: any): this;
    }
  }
}

export {};
