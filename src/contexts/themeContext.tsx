import React, { createContext, useContext, useEffect, useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { LightTheme, DarkCustomTheme } from '../theme/index';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextData = {
  isDarkTheme: boolean;
  toggleTheme: () => void;
};

const STORAGE_KEY = '@APP_THEME';

const ThemeContext = createContext<ThemeContextData>({
  isDarkTheme: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Carregar o tema salvo
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedTheme === 'dark') {
          setIsDarkTheme(true);
        } else {
          setIsDarkTheme(false);
        }
      } catch (error) {
        console.error('Erro ao carregar o tema do AsyncStorage', error);
      }
    };

    loadStoredTheme();
  }, []);

  // Alternar e salvar o tema
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkTheme;
      setIsDarkTheme(newTheme);
      await AsyncStorage.setItem(STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar o tema no AsyncStorage', error);
    }
  };

  const theme = isDarkTheme ? DarkCustomTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
