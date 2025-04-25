import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { updatePassword } from '../../services/profile';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StackParamList } from '../../routes/StackParamList';

type ChangePasswordScreenNavigationProp = NativeStackNavigationProp<StackParamList, 'ChangePassword'>;

interface Props {
  navigation: ChangePasswordScreenNavigationProp;
}

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Senha atual é obrigatória'),
  newPassword: Yup.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .required('Nova senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
});

const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState({
    current: true,
    new: true,
    confirm: true,
  });

  const handleChangePassword = async (values: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string 
  }) => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para alterar a senha.');
      return;
    }

    try {
      setLoading(true);
      
      await updatePassword(
        user.email || '',
        values.currentPassword,
        values.newPassword
      );
      
      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert(
        'Erro',
        'Não foi possível alterar a senha. Verifique se a senha atual está correta.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = (field: 'current' | 'new' | 'confirm') => {
    setSecureTextEntry({
      ...secureTextEntry,
      [field]: !secureTextEntry[field],
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Alterar Senha</Text>
        
        <Formik
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={PasswordSchema}
          onSubmit={handleChangePassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Senha Atual"
                value={values.currentPassword}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                error={touched.currentPassword && !!errors.currentPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry={secureTextEntry.current}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry.current ? "eye" : "eye-off"}
                    onPress={() => toggleSecureEntry('current')}
                  />
                }
              />
              {touched.currentPassword && errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}

              <TextInput
                label="Nova Senha"
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                error={touched.newPassword && !!errors.newPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry={secureTextEntry.new}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry.new ? "eye" : "eye-off"}
                    onPress={() => toggleSecureEntry('new')}
                  />
                }
              />
              {touched.newPassword && errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}

              <TextInput
                label="Confirmar Nova Senha"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={touched.confirmPassword && !!errors.confirmPassword}
                style={styles.input}
                mode="outlined"
                secureTextEntry={secureTextEntry.confirm}
                right={
                  <TextInput.Icon
                    icon={secureTextEntry.confirm ? "eye" : "eye-off"}
                    onPress={() => toggleSecureEntry('confirm')}
                  />
                }
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

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
                  Alterar Senha
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
  },
  scrollContainer: {
    padding: 16,
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

export default ChangePasswordScreen;
