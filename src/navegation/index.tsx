import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import ProfileScreen from '../screens/Profile';
import ChangePasswordScreen from '../screens/Profile/ChangePasswordScreen';

import { StackParamList } from '../routes/StackParamList'

// Telas de autenticação
import LoginScreen from '../screens/Login';

// Telas de calendário e instalações
import CalendarScreen from '../screens/Calendar';
import AddInstallationScreen from '../screens/Calendar/AddInstallation';
import InstallationDetailsScreen from '../screens/InstallationDetails';
import EditInstallationScreen from '../screens/InstallationDetails/EditInstallation';

// Telas de gerenciamento de usuários
import UserManagementScreen from '../screens/UserManagement';
import AddUserScreen from '../screens/UserManagement/AddUser';
import EditUserScreen from '../screens/UserManagement/EditUser';

// Contexto de autenticação
import { useAuth } from '../hooks/useAuth';

const Stack = createStackNavigator<StackParamList>();
const Tab = createBottomTabNavigator();

// Tipos para props de navegação
type CalendarScreenProps = StackScreenProps<StackParamList, 'Home'>;
type InstallationDetailsProps = StackScreenProps<StackParamList, 'InstallationDetails'>;
type AddInstallationProps = StackScreenProps<StackParamList, 'AddInstallation'>;
type EditInstallationProps = StackScreenProps<StackParamList, 'EditInstallation'>;
type EditUserProps = StackScreenProps<StackParamList, 'EditUser'>;

// Navegação de Calendário
const CalendarStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#6200ee',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Home" 
      component={CalendarScreen} 
      options={{ title: 'Agenda de Instalações' }}
    />
    <Stack.Screen 
      name="AddInstallation" 
      component={AddInstallationScreen} 
      options={{ title: 'Nova Instalação' }}
    />
    <Stack.Screen 
      name="InstallationDetails" 
      component={InstallationDetailsScreen} 
      options={{ title: 'Detalhes da Instalação' }}
    />
    <Stack.Screen 
      name="EditInstallation" 
      component={EditInstallationScreen} 
      options={{ title: 'Editar Instalação' }}
    />
    <Stack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Meu Perfil' }}
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen} 
      options={{ title: 'Alterar Senha' }}
    />
  </Stack.Navigator>
);

// Navegação de Usuários
const UserStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#6200ee',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="UserManagement" 
      component={UserManagementScreen} 
      options={{ title: 'Gerenciar Usuários' }}
    />
    <Stack.Screen 
      name="AddUser" 
      component={AddUserScreen} 
      options={{ title: 'Adicionar Usuário' }}
    />
    <Stack.Screen 
      name="EditUser" 
      component={EditUserScreen} 
      options={{ title: 'Editar Usuário' }}
    />
  </Stack.Navigator>
);


// Navegação com Tabs para usuários autenticados
const AppTabs = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'CalendarTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'UsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="CalendarTab" 
        component={CalendarStack} 
        options={{ title: 'Agenda' }}
      />
      {user?.isAdmin && (
        <Tab.Screen 
          name="UsersTab" 
          component={UserStack} 
          options={{ title: 'Usuários' }}
        />
      )}
    </Tab.Navigator>
  );
};

// Navegação principal
const AppNavigation = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Ou um componente de loading
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Home" component={AppTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;
