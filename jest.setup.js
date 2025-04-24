
import '@testing-library/jest-dom';
import 'leaflet/dist/leaflet.css';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

global.navigator.geolocation = mockGeolocation;
