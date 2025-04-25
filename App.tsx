import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { LogBox } from 'react-native';
import { theme } from './src/theme';
import { AuthProvider } from './src/contexts/authContext';
import AppNavigation from './src/navegation';

// Ignorar avisos específicos
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigation />
          <StatusBar style="auto" />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
