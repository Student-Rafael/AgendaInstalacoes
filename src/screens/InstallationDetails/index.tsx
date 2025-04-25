import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { 
  Installation, 
  getInstallationById, 
  updateInstallation, 
  deleteInstallation 
} from '../../services/instalation';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../../routes/StackParamList'; // <- Ajuste o caminho conforme sua definição

type InstallationDetailsNavigationProp = NativeStackNavigationProp<StackParamList, 'InstallationDetails'>;
type InstallationDetailsRouteProp = RouteProp<StackParamList, 'InstallationDetails'>;

interface Props {
  navigation: InstallationDetailsNavigationProp;
  route: InstallationDetailsRouteProp;
}

const getStatusColor = (status: string, theme: any) => {
  switch (status) {
    case 'completed':
      return theme.colors.success || '#4CAF50';
    case 'cancelled':
      return theme.colors.error || '#F44336';
    default:
      return theme.colors.warning || '#FF9800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Concluída';
    case 'cancelled':
      return 'Cancelada';
    default:
      return 'Pendente';
  }
};

const InstallationDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { installationId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadInstallation = async () => {
      try {
        const data = await getInstallationById(installationId);
        setInstallation(data);
      } catch (error) {
        console.error('Erro ao carregar detalhes da instalação:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os detalhes da instalação.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadInstallation();
  }, [installationId]);

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'cancelled') => {
    try {
      setUpdating(true);
      await updateInstallation(installationId, { status: newStatus });
      
      // Atualizar estado local
      setInstallation(prev => {
        if (prev) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
      
      Alert.alert('Sucesso', 'Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status da instalação.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditInstallation', { installationId });
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta instalação? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteInstallation(installationId);
              Alert.alert(
                'Sucesso',
                'Instalação excluída com sucesso!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Erro ao excluir instalação:', error);
              Alert.alert('Erro', 'Não foi possível excluir a instalação.');
              setDeleting(false);
            }
          }
        },
      ]
    );
  };

  const canEdit = user?.isAdmin || (installation && installation.createdBy === user?.uid);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!installation) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Instalação não encontrada.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Voltar
        </Button>
      </View>
    );
  }

  const formattedDate = new Date(installation.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const formattedTime = new Date(installation.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const statusColor = getStatusColor(installation.status, theme);
  const statusLabel = getStatusLabel(installation.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>{installation.title}</Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor }}
            >
              {statusLabel}
            </Chip>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data e Hora</Text>
            <Text style={styles.sectionContent}>
              {formattedDate} às {formattedTime}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.sectionContent}>{installation.client}</Text>
            <Text style={styles.sectionContent}>{installation.phone}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <Text style={styles.sectionContent}>{installation.address}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.sectionContent}>{installation.description}</Text>
          </View>
        </Card.Content>
      </Card>

      {canEdit && (
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Alterar Status</Text>
            <View style={styles.statusButtons}>
              <Button 
                mode={installation.status === 'pending' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('pending')}
                style={styles.statusButton}
                disabled={updating || deleting}
                loading={updating && installation.status !== 'pending'}
              >
                Pendente
              </Button>
              <Button 
                mode={installation.status === 'completed' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('completed')}
                style={styles.statusButton}
                disabled={updating || deleting}
                loading={updating && installation.status !== 'completed'}
              >
                Concluída
              </Button>
              <Button 
                mode={installation.status === 'cancelled' ? 'contained' : 'outlined'}
                onPress={() => handleStatusChange('cancelled')}
                style={styles.statusButton}
                disabled={updating || deleting}
                loading={updating && installation.status !== 'cancelled'}
              >
                Cancelada
              </Button>
            </View>

            <View style={styles.actionButtons}>
              <Button 
                mode="outlined" 
                icon="pencil"
                onPress={handleEdit}
                style={styles.actionButton}
                disabled={updating || deleting}
              >
                Editar
              </Button>
              <Button 
                mode="outlined" 
                icon="delete"
                onPress={handleDelete}
                style={[styles.actionButton, styles.deleteButton]}
                color="red"
                disabled={updating || deleting}
                loading={deleting}
              >
                Excluir
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
  },
  actionsCard: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusChip: {
    height: 30,
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  sectionContent: {
    fontSize: 16,
    marginBottom: 3,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statusButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    borderColor: 'red',
  },
  backButton: {
    marginTop: 20,
  },
});

export default InstallationDetailsScreen;
