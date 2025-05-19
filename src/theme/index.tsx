import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

export const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#B00020',
    text: '#000000',
    onSurface: '#000000',
    disabled: '#C9C9C9',
    placeholder: '#888888',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#f50057',
    success: '#4CAF50',
    warning: '#FF9800',
  },
};

export const DarkCustomTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    accent: '#03dac6',
    background: '#121212',
    surface: '#1f1f1f',
    text: '#ffffff',
    onSurface: '#ffffff',
    disabled: '#555555',
    placeholder: '#aaaaaa',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#ff80ab',
    success: '#81c784',
    warning: '#ffb74d',
  },
};