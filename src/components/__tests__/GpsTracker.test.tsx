
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeafletMap } from 'leaflet';
import GpsTracker from '../GpsTracker';

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({
    setView: jest.fn()
  })
}));

describe('GpsTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial state correctly', () => {
    render(<GpsTracker />);
    
    expect(screen.getByText('Start Tracking')).toBeInTheDocument();
    expect(screen.getByText('Start tracking to see your route on the map')).toBeInTheDocument();
  });

  test('starts tracking when button is clicked', async () => {
    const mockWatchPosition = jest.fn((success) => {
      const position = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };
      success(position);
      return 1; // watch ID
    });

    navigator.geolocation.watchPosition = mockWatchPosition;

    render(<GpsTracker />);
    
    const startButton = screen.getByText('Start Tracking');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Stop Tracking')).toBeInTheDocument();
    });
  });

  test('handles location error', async () => {
    const mockWatchPosition = jest.fn((_, error) => {
      error({
        code: error.PERMISSION_DENIED,
        message: 'Location permission denied'
      });
      return 1; // watch ID
    });

    navigator.geolocation.watchPosition = mockWatchPosition;

    render(<GpsTracker />);
    
    const startButton = screen.getByText('Start Tracking');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText(/Location permission denied/i)).toBeInTheDocument();
    });
  });
});
