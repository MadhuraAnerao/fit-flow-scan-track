
// This file provides shims for React Native APIs in web environment
window.addEventListener = window.addEventListener || function() {};
window.removeEventListener = window.removeEventListener || function() {};

// Define global for React Native modules that expect it
if (typeof global === 'undefined') {
  (window as any).global = window;
}
