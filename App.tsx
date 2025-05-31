import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/contexts/authContext';
import AppNavigation from './src/navegation';
import { ThemeProvider } from './src/contexts/themeContext';


// Ignorar avisos específicos
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time',
]);

export default function App() {
  return (
    <ThemeProvider>
    <SafeAreaProvider>
        <AuthProvider>
          <AppNavigation />
          <StatusBar style="auto" />
        </AuthProvider>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}
