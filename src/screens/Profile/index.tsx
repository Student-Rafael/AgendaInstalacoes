import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Linking, Platform } from 'react-native';
import { Text, Button, Avatar, Card, Divider, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { getUserById } from '../../services/users';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppTheme } from '../../contexts/themeContext';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StackParamList } from '../../routes/StackParamList';

type ProfileScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { isDarkTheme, toggleTheme } = useAppTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    createdAt: Date;
    isAdmin: boolean;
  } | null>(null);

  // Número de WhatsApp para suporte - substitua pelo número desejado
  const supportPhoneNumber = "5521964732836"; // Formato: código do país + DDD + número

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userDoc = await getUserById(user.uid);
        setUserData(userDoc);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleContactSupport = () => {
    // Mensagem predefinida para o WhatsApp
    const message = `Olá, sou ${userData?.name || 'usuário'} do aplicativo Agenda de Instalações e preciso de suporte.`;
    const encodedMessage = encodeURIComponent(message);
    
    // URL do WhatsApp
    const whatsappUrl = `https://wa.me/${supportPhoneNumber}?text=${encodedMessage}`;
    
    // Verificar se o WhatsApp pode ser aberto
    Linking.canOpenURL(whatsappUrl) 
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'Erro',
            'WhatsApp não está instalado ou não pode ser aberto.',
            [{ text: 'OK' }]
          );
        }
      })
      .catch(err => {
        console.error('Erro ao abrir WhatsApp:', err);
        Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
      });
  };

  const formatCreatedAt = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Gerar iniciais para o avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || !userData) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={80} 
            label={getInitials(userData.name)} 
            style={{ backgroundColor: theme.colors.primary }}
          />
        </View>
        
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.nameText, { color: theme.colors.onSurface }]}>{userData.name}</Text>
          <Text style={[styles.emailText, { color: theme.colors.onSurface }]}>{userData.email}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Conta:</Text>
            <Text style={styles.infoValue}>
              {userData.isAdmin ? 'Administrador' : 'Usuário'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Membro desde:</Text>
            <Text style={styles.infoValue}>
              {formatCreatedAt(userData.createdAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionsContainer}>
        <Button 
          mode="contained" 
          icon="lock-reset" 
          onPress={handleChangePassword}
          style={styles.actionButton}
        >
          Alterar Senha
        </Button>

        <Button 
          mode="contained" 
          icon="theme-light-dark" 
          onPress={toggleTheme}
          style={styles.actionButton}
        >
          Alternar Tema
        </Button>
        
        <Button 
          mode="contained" 
          icon="whatsapp" 
          onPress={handleContactSupport}
          style={[styles.actionButton, { backgroundColor: '#25D366' }]}
        >
          Contatar Suporte
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    marginBottom: 20,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  cardContent: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  divider: {
    width: '100%',
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 10,
  },
  actionButton: {
    marginVertical: 8,
    paddingVertical: 8,
  },
});

export default ProfileScreen;
