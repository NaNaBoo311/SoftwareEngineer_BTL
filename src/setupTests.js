import '@testing-library/jest-dom';

// Stub alert and confirm globally for jsdom
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Suppress React Router v6 deprecation warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('React Router Future Flag Warning')) {
    return; // Suppress
  }
  originalConsoleWarn(...args);
};
