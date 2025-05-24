import { MD3Theme, DefaultTheme } from 'react-native-paper';
import { Theme as NavigationTheme } from '@react-navigation/native';

export const getNavigationTheme = (paperTheme: MD3Theme): NavigationTheme => ({
  dark: paperTheme.dark,
  colors: {
    primary: paperTheme.colors.primary,
    background: paperTheme.colors.background,
    card: paperTheme.colors.surface,
    text: paperTheme.colors.onSurface,
    border: paperTheme.colors.outline ?? paperTheme.colors.onSurface,
    notification: paperTheme.colors.error,
  },
  // Evita erro de tipagem
  fonts: {} as any,
});
