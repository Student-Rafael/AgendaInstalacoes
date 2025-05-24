import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Text, Button, FAB, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { User, getAllUsers } from '../../services/users';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../../routes/StackParamList'; // <- Ajuste o caminho conforme sua definição

type LoginScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const UserManagementScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar usuários quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      if (user?.isAdmin) {
        loadUsers();
      } else {
        Alert.alert(
          'Acesso Restrito',
          'Você não tem permissão para acessar esta área.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, [user])
  );

  const handleAddUser = () => {
    navigation.navigate('AddUser');
  };

  const handleEditUser = (userId: string) => {
    navigation.navigate('EditUser', { userId });
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.isAdmin && (
            <Chip 
              style={styles.adminChip}
              textStyle={{ color: theme.colors.primary }}
            >
              Admin
            </Chip>
          )}
        </View>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userDate}>
          Criado em: {item.createdAt.toLocaleDateString('pt-BR')}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="text" 
          onPress={() => handleEditUser(item.id)}
          disabled={item.id === user?.uid} // Não permitir editar o próprio usuário
        >
          Editar
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Nenhum usuário cadastrado.
      </Text>
    </View>
  );

  if (!user?.isAdmin) {
    return null; // Não renderizar nada se não for admin
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={styles.title}>Gerenciamento de Usuários</Text>
      
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddUser}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminChip: {
    backgroundColor: '#e8f0fe',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 5,
  },
  userDate: {
    fontSize: 14,
    color: '#666',
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
    flex: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserManagementScreen;
