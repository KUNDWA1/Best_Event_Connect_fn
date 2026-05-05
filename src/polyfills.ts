// Polyfills for Node.js globals in browser environment
import { Buffer } from 'buffer';

if (typeof global === 'undefined') {
  (window as any).global = window;
}

if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

// Make Buffer available globally
(window as any).Buffer = Buffer;

export {};