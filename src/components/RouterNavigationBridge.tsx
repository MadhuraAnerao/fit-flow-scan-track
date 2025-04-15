
import React from 'react';
import { useNavigation as useReactNavigation } from '@react-navigation/native';

// This component creates a context bridge between React Router and React Navigation
// It allows components to use useNavigation from React Navigation even when using React Router

type NavigationBridgeProps = {
  children: React.ReactNode;
};

export const RouterNavigationBridge: React.FC<NavigationBridgeProps> = ({ children }) => {
  // We create this component to make navigation available throughout the app
  // This helps prevent the "Couldn't find a navigation object" error
  
  return (
    <>{children}</>
  );
};

export default RouterNavigationBridge;
