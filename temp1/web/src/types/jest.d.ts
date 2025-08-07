/**
 * Jest type definitions to override Cypress types in test files
 * This ensures Jest assertion methods are available in test files
 */

/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBe(expected: unknown): R;
      toEqual(expected: unknown): R;
      toBeUndefined(): R;
      toBeDefined(): R;
      toBeNull(): R;
      toBeTruthy(): R;
      toBeFalsy(): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThan(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toContain(expected: unknown): R;
      toHaveLength(expected: number): R;
      toThrow(expected?: string | RegExp | Error): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: unknown[]): R;
      toHaveBeenCalledTimes(expected: number): R;
      toMatchObject(expected: object): R;
      toStrictEqual(expected: unknown): R;
    }
  }

  // Override expect function to use Jest types
  function expect<T = any>(actual: T): jest.Matchers<void>;
  function expect(actual: unknown): jest.Matchers<void>;
}

export {};
