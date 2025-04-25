import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, useTheme } from 'react-native-paper';
import { Installation } from '../services/instalation';

type InstallationItemProps = {
  installation: Installation;
  onPress: (installation: Installation) => void;
};

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

const InstallationItem = ({ installation, onPress }: InstallationItemProps) => {
  const theme = useTheme();
  const statusColor = getStatusColor(installation.status, theme);
  const statusLabel = getStatusLabel(installation.status);
  
  const formattedDate = new Date(installation.date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <TouchableOpacity onPress={() => onPress(installation)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{installation.title}</Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor }}
            >
              {statusLabel}
            </Chip>
          </View>
          
          <View style={styles.details}>
            <Text style={styles.time}>{formattedDate}</Text>
            <Text style={styles.client} numberOfLines={1}>
              Cliente: {installation.client}
            </Text>
          </View>
          
          <Text style={styles.address} numberOfLines={2}>
            {installation.address}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 28,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    marginRight: 10,
    color: '#555',
  },
  client: {
    fontSize: 14,
    flex: 1,
    color: '#555',
  },
  address: {
    fontSize: 14,
    color: '#777',
  },
});

export default InstallationItem;
