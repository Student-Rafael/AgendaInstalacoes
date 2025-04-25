import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Switch, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { createUser, checkIfEmailExists } from '../../services/users';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { StackParamList } from '../../routes/StackParamList'; // <- Ajuste o caminho conforme sua definição

type LoginScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const UserSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  password: Yup.string().min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
});

const AddUserScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { email: string; password: string; name: string }) => {
    if (!user?.isAdmin) {
      Alert.alert('Erro', 'Você não tem permissão para adicionar usuários.');
      return;
    }

    try {
      setLoading(true);
      
      // Verificar se o email já existe
      const emailExists = await checkIfEmailExists(values.email);
      if (emailExists) {
        Alert.alert('Erro', 'Este email já está em uso.');
        return;
      }
      
      await createUser(values.email, values.password, values.name, isAdmin);
      
      Alert.alert(
        'Sucesso',
        'Usuário criado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', 'Não foi possível criar o usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Você não tem permissão para acessar esta área.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Adicionar Novo Usuário</Text>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
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
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && !!errors.email}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <TextInput
                label="Senha"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && !!errors.password}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />
              {touched.password && errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TextInput
                label="Confirmar Senha"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && !!errors.confirmPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

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
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  mode="contained" 
                  onPress={()=>{handleSubmit()}}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Adicionar
                </Button>
              </View>
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
});

export default AddUserScreen;
