import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Text, ActivityIndicator, useTheme, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import CalendarComponent from '../../components/Calendar';
import InstallationItem from '../../components/InstallationItem';
import { useAuth } from '../../hooks/useAuth';
import {
  Installation,
  getInstallationsByDate,
  getAllInstallations
} from '../../services/instalation';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../../routes/StackParamList'; // <- Ajuste o caminho conforme sua definição

type LoginScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

type MarkedDate = {
  dots?: { key: string; color: string }[];  // Se houver pontos coloridos, define-se aqui
  marked: boolean;  // Agora 'marked' é sempre boolean
  selected?: boolean;
  selectedColor?: string;
};

type MarkedDates = {
  [date: string]: MarkedDate;
};

const CalendarScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, setScreenLoading, signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepareScreen = async () => {
      try {
        await loadAllInstallations();
        await loadInstallationsByDate(selectedDate);
      } finally {
        // Finalize o carregamento quando tudo estiver pronto
        setScreenLoading(false);
      }
    };
    
    prepareScreen();
    
    // Cleanup function
    return () => {
      // Se necessário, cancele operações pendentes aqui
    };
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Confirmar Logout",
      "Tem certeza que deseja sair do aplicativo?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: async () => {
            try {
              await signOut();
              // A navegação para a tela de login será tratada automaticamente pelo
              // sistema de navegação baseado no estado de autenticação
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
            }
          }
        }
      ]
    );
  };

  // Carregar todas as instalações para marcar no calendário
  const loadAllInstallations = async () => {
    try {
      const allInstallations = await getAllInstallations();

      // Criar objeto de datas marcadas para o calendário
      const marked: MarkedDates = {};
      allInstallations.forEach(installation => {
        const dateStr = installation.date.toISOString().split('T')[0];

        if (marked[dateStr]) {
          marked[dateStr].dots = marked[dateStr].dots || [];
          marked[dateStr].dots.push({
            key: installation.id || '',
            color: getStatusColor(installation.status),
          });
        } else {
          marked[dateStr] = {
            marked: true,
            dots: [{
              key: installation.id || '',
              color: getStatusColor(installation.status),
            }],
          };
        }
      });

      // Adicionar seleção para a data atual
      marked[selectedDate] = {
        ...marked[selectedDate],
        marked: true,
        selected: true,
        selectedColor: theme.colors.primary,
      };

      setMarkedDates(marked);
    } catch (error) {
      console.error('Erro ao carregar todas as instalações:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do calendário.');
    }
  };

  // Carregar instalações para a data selecionada
  const loadInstallationsByDate = async (date: string) => {
    try {
      setLoading(true);
      // Criar data corretamente definindo o horário para meia-noite no fuso horário local
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day, 0, 0, 0, 0);
      const installations = await getInstallationsByDate(dateObj);
      setInstallations(installations);
    } catch (error) {
      console.error('Erro ao carregar instalações por data:', error);
      Alert.alert('Erro', 'Não foi possível carregar as instalações para esta data.');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter cor com base no status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.primary || '#4CAF50';
      case 'cancelled':
        return theme.colors.error || '#F44336';
      default:
        return theme.colors.secondary || '#FF9800';
    }
  };

  // Configurar o botão de logout no cabeçalho
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="account"
            iconColor="#fff"
            size={24}
            onPress={() => navigation.navigate('Profile')}
            style={{ marginRight: 10 }}
          />
          <IconButton
            icon="logout"
            iconColor="#fff"
            size={24}
            onPress={handleLogout}
            style={{ marginRight: 10 }}
          />
        </View>
      )
    });
  }, [navigation]);

  // Atualizar dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadAllInstallations();
      loadInstallationsByDate(selectedDate);
    }, [])
  );

  // Atualizar quando a data selecionada mudar
  useEffect(() => {
    loadInstallationsByDate(selectedDate);

    // Atualizar marcação no calendário
    setMarkedDates(prev => {
      const newMarkedDates = { ...prev };

      // Remover seleção da data anterior
      Object.keys(newMarkedDates).forEach(date => {
        if (newMarkedDates[date].selected) {
          const { selected, selectedColor, ...rest } = newMarkedDates[date];
          newMarkedDates[date] = rest;
        }
      });

      // Adicionar seleção à nova data
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };

      return newMarkedDates;
    });
  }, [selectedDate]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleInstallationPress = (installation: Installation) => {
    navigation.navigate('InstallationDetails', { installationId: installation.id || '' });
  };

  const handleAddInstallation = () => {
    navigation.navigate('AddInstallation', { date: selectedDate });
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhuma instalação agendada para esta data.
      </Text>
    </View>
  );

  const formatSelectedDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      <CalendarComponent
        markedDates={markedDates}
        onDayPress={handleDayPress}
        selectedDate={selectedDate}
      />

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Instalações - {formatSelectedDate(selectedDate)}
        </Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={installations}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={({ item }) => (
              <InstallationItem
                installation={item}
                onPress={handleInstallationPress}
              />
            )}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddInstallation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  listContainer: {
    flex: 1,
    marginTop: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default CalendarScreen;
