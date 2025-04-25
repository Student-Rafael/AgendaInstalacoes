import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Switch, ActivityIndicator, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { getUserById, updateUser, deleteUser } from '../../services/users';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../../routes/StackParamList'; // <- Ajuste o caminho conforme sua definição

type LoginScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'Login'>;
type EditUserScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'EditUser'>;
type EditUserScreenRouteProp = RouteProp<StackParamList, 'EditUser'>;

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
};

type FormValues = {
  name: string;
  email: string;
  password?: string;
};


interface Props {
  navigation: LoginScreenNavigationProp;
  route: EditUserScreenRouteProp;
}

const UserSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
});

const EditUserScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!user?.isAdmin) {
          Alert.alert(
            'Acesso Restrito',
            'Você não tem permissão para acessar esta área.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        const userData = await getUserById(userId);
        setUserData(userData);
        setIsAdmin(userData.isAdmin);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os dados do usuário.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    loadUser();
  }, [userId, user]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setSaving(true);
      
      await updateUser(userId, {
        name: values.name,
        isAdmin,
      });
      
      Alert.alert(
        'Sucesso',
        'Usuário atualizado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o usuário. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteUser(userId);
              Alert.alert(
                'Sucesso',
                'Usuário excluído com sucesso!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Erro ao excluir usuário:', error);
              Alert.alert('Erro', 'Não foi possível excluir o usuário. Tente novamente.');
              setDeleting(false);
            }
          }
        },
      ]
    );
  };

  if (!user?.isAdmin) {
    return null; // Não renderizar nada se não for admin
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Editar Usuário</Text>
        
        <Formik
          initialValues={{
            name: userData?.name || '',
            email: userData?.email || '',
          }}
          validationSchema={UserSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Nome"
                value={values.name}
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                error={touched.name && !!errors.name}
                style={styles.input}
                mode="outlined"
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <TextInput
                label="Email"
                value={values.email}
                disabled
                style={[styles.input, styles.disabledInput]}
                mode="outlined"
              />

              <View style={styles.switchContainer}>
                <Text>Administrador</Text>
                <Switch
                  value={isAdmin}
                  onValueChange={setIsAdmin}
                  color={theme.colors.primary}
                />
              </View>

              <View style={styles.buttonsContainer}>
                <Button 
                  mode="outlined" 
                  onPress={() => navigation.goBack()}
                  style={[styles.button, styles.cancelButton]}
                  disabled={saving || deleting}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={()=>{handleSubmit}}
                  style={styles.button}
                  loading={saving}
                  disabled={saving || deleting}
                >
                  Salvar
                </Button>
              </View>

              <Button 
                mode="outlined" 
                color="red"
                onPress={handleDeleteUser}
                style={styles.deleteButton}
                loading={deleting}
                disabled={saving || deleting || userId === user?.uid}
              >
                Excluir Usuário
              </Button>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderColor: '#999',
  },
  deleteButton: {
    marginTop: 30,
    borderColor: 'red',
  },
});

export default EditUserScreen;
