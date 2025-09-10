/**
 * Comprehensive Type Guards
 * Cải thiện type safety và type coverage
 */

import React from 'react';

// Browser API type guards với detailed interfaces
export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function hasMemoryAPI(): boolean {
  return typeof performance !== 'undefined' &&
         'memory' in performance &&
         typeof (performance as Performance & { memory?: PerformanceMemory }).memory === 'object' &&
         typeof (performance as Performance & { memory: PerformanceMemory }).memory.usedJSHeapSize === 'number';
}

export function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && 
           typeof window.localStorage !== 'undefined' &&
           window.localStorage !== null;
  } catch (_error) {
    // Some browsers throw khi localStorage is disabled
    return false;
  }
}

export function hasSessionStorage(): boolean {
  try {
    return typeof window !== 'undefined' && 
           typeof window.sessionStorage !== 'undefined' &&
           window.sessionStorage !== null;
  } catch (_error) {
    return false;
  }
}

export function hasGeolocation(): boolean {
  return typeof navigator !== 'undefined' && 
         'geolocation' in navigator &&
         typeof navigator.geolocation === 'object';
}

export function hasWebGL(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl') || 
      canvas.getContext('experimental-webgl')
    );
  } catch (_error) {
    return false;
  }
}

// React component type guards
export function isValidReactComponent<T = unknown>(
  module: unknown
): module is { default: React.ComponentType<T> } {
  return module !== null &&
         typeof module === 'object' && 
         'default' in module &&
         typeof (module as { default: unknown }).default === 'function';
}

export function isReactElement(value: unknown): value is React.ReactElement {
  return React.isValidElement(value);
}

export function isReactNode(value: unknown): value is React.ReactNode {
  return value === null ||
         value === undefined ||
         typeof value === 'string' ||
         typeof value === 'number' ||
         typeof value === 'boolean' ||
         isReactElement(value) ||
         (Array.isArray(value) && value.every(isReactNode));
}

// API response type guards
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' &&
         error !== null &&
         'message' in error &&
         typeof (error as { message: unknown }).message === 'string';
}

export function isHttpError(error: unknown): error is ApiError & { status: number } {
  return isApiError(error) && 
         'status' in error &&
         typeof (error as ApiError & { status: unknown }).status === 'number';
}

export function isNetworkError(error: unknown): boolean {
  return isHttpError(error) && 
         error.status >= 500 && 
         error.status < 600;
}

export function isClientError(error: unknown): boolean {
  return isHttpError(error) && 
         error.status >= 400 && 
         error.status < 500;
}

// Event type guards với proper typing
export function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return event instanceof KeyboardEvent;
}

export function isMouseEvent(event: Event): event is MouseEvent {
  return event instanceof MouseEvent;
}

export function isTouchEvent(event: Event): event is TouchEvent {
  return typeof TouchEvent !== 'undefined' && event instanceof TouchEvent;
}

export function isFocusEvent(event: Event): event is FocusEvent {
  return event instanceof FocusEvent;
}

export function isInputEvent(event: Event): event is InputEvent {
  return typeof InputEvent !== 'undefined' && event instanceof InputEvent;
}

// DOM element type guards
export function isInputElement(element: Element | EventTarget | null): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

export function isFormElement(element: Element | EventTarget | null): element is HTMLFormElement {
  return element instanceof HTMLFormElement;
}

export function isButtonElement(element: Element | EventTarget | null): element is HTMLButtonElement {
  return element instanceof HTMLButtonElement;
}

export function isSelectElement(element: Element | EventTarget | null): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

export function isTextAreaElement(element: Element | EventTarget | null): element is HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement;
}

export function isAnchorElement(element: Element | EventTarget | null): element is HTMLAnchorElement {
  return element instanceof HTMLAnchorElement;
}

export function isDOMElement(value: unknown): value is Element {
  return value instanceof Element;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

// Data type guards
export function isNonNullish<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isEmptyArray(value: unknown): value is [] {
  return isArray(value) && value.length === 0;
}

export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
  return isArray(value) && value.length > 0;
}

export function isArrayOfStrings(value: unknown): value is string[] {
  return isArray(value) && value.every(isString);
}

export function isArrayOfNumbers(value: unknown): value is number[] {
  return isArray(value) && value.every(isNumber);
}

// Function type guards
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isAsyncFunction(value: unknown): value is (...args: unknown[]) => Promise<unknown> {
  return isFunction(value) && 
         value.constructor.name === 'AsyncFunction';
}

export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise || 
         (isObject(value) && 
          'then' in value && 
          isFunction(value.then));
}

// Error type guards
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function hasErrorMessage(error: unknown): error is { message: string } {
  return isObject(error) && 
         'message' in error && 
         isString(error.message);
}

export function hasErrorStack(error: unknown): error is { stack: string } {
  return isObject(error) && 
         'stack' in error && 
         isString(error.stack);
}

export function isTypeError(error: unknown): error is TypeError {
  return error instanceof TypeError;
}

export function isReferenceError(error: unknown): error is ReferenceError {
  return error instanceof ReferenceError;
}

export function isSyntaxError(error: unknown): error is SyntaxError {
  return error instanceof SyntaxError;
}

// Date type guards
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isValidDate(value: unknown): value is Date {
  return isDate(value) && !isNaN(value.getTime());
}

export function isISODateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return isValidDate(date) && date.toISOString() === value;
}

// JSON type guards
export function isValidJSON(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function isJSONObject(value: unknown): value is Record<string, unknown> {
  if (!isString(value)) return false;
  try {
    const parsed = JSON.parse(value);
    return isObject(parsed);
  } catch {
    return false;
  }
}

// File type guards
export function isFile(value: unknown): value is File {
  return value instanceof File;
}

export function isImageFile(file: unknown): file is File {
  return isFile(file) && file.type.startsWith('image/');
}

export function isVideoFile(file: unknown): file is File {
  return isFile(file) && file.type.startsWith('video/');
}

export function isAudioFile(file: unknown): file is File {
  return isFile(file) && file.type.startsWith('audio/');
}

export function isPDFFile(file: unknown): file is File {
  return isFile(file) && file.type === 'application/pdf';
}

// URL type guards
export function isValidURL(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isHTTPURL(value: unknown): value is string {
  if (!isValidURL(value)) return false;
  return value.startsWith('http://') || value.startsWith('https://');
}

export function isDataURL(value: unknown): value is string {
  return isString(value) && value.startsWith('data:');
}

// Email type guard
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// User-defined type guards cho project-specific types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  avatar?: string;
  lastLoginAt?: Date;
}

export function isUser(value: unknown): value is User {
  return isObject(value) &&
         'id' in value && isString(value.id) &&
         'email' in value && isValidEmail(value.email) &&
         'firstName' in value && isString(value.firstName) &&
         'lastName' in value && isString(value.lastName) &&
         'role' in value && isString(value.role) &&
         ['admin', 'teacher', 'student'].includes(value.role as string) &&
         'isActive' in value && isBoolean(value.isActive);
}

// Utility function để assert types
export function assertIsType<T>(
  value: unknown, 
  guard: (value: unknown) => value is T,
  message = 'Type assertion failed'
): asserts value is T {
  if (!guard(value)) {
    throw new TypeError(message);
  }
}
