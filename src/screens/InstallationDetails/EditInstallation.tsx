import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../hooks/useAuth';
import { getInstallationById, updateInstallation } from '../../services/instalation';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Timestamp } from 'firebase/firestore';

// Defina o tipo da sua stack
type RootStackParamList = {
  EditInstallation: { installationId: string };
  // ... outras rotas
};

type Props = NativeStackScreenProps<RootStackParamList, 'EditInstallation'>;

interface FormValues {
  title: string;
  description: string;
  client: string;
  phone: string;
  address: string;
}

interface Installation {
  title: string;
  description: string;
  client: string;
  phone: string;
  address: string;
  date: string | Date;
  createdBy: string;
}


const InstallationSchema = Yup.object().shape({
  title: Yup.string().required('Título é obrigatório'),
  description: Yup.string().required('Descrição é obrigatória'),
  client: Yup.string().required('Nome do cliente é obrigatório'),
  phone: Yup.string().required('Telefone é obrigatório'),
  address: Yup.string().required('Endereço é obrigatório'),
});

const EditInstallationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { installationId } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadInstallation = async () => {
      try {
        const data = await getInstallationById(installationId);

        // Verificar permissão
        if (!user?.isAdmin && data.createdBy !== user?.uid) {
          Alert.alert(
            'Acesso Restrito',
            'Você não tem permissão para editar esta instalação.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }

        setInstallation(data);
        setSelectedDate(new Date(data.date));
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar instalação:', error);
        Alert.alert(
          'Erro',
          'Não foi possível carregar os dados da instalação.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };

    loadInstallation();
  }, [installationId, user]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      const newDate = new Date(selectedDate);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(selectedDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setSaving(true);

      await updateInstallation(installationId, {
        ...values,
        date: Timestamp.fromDate(selectedDate),
      });

      Alert.alert(
        'Sucesso',
        'Instalação atualizada com sucesso!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao atualizar instalação:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a instalação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

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
        <Text>Instalação não encontrada ou sem permissão para editar.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
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
        <Text style={styles.title}>Editar Instalação</Text>

        <Formik
          initialValues={{
            title: installation.title,
            description: installation.description,
            client: installation.client,
            phone: installation.phone,
            address: installation.address,
          }}
          validationSchema={InstallationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <TextInput
                label="Título"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
                error={touched.title && !!errors.title}
                style={styles.input}
                mode="outlined"
              />
              {touched.title && errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              <TextInput
                label="Descrição"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                error={touched.description && !!errors.description}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />
              {touched.description && errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

              <TextInput
                label="Nome do Cliente"
                value={values.client}
                onChangeText={handleChange('client')}
                onBlur={handleBlur('client')}
                error={touched.client && !!errors.client}
                style={styles.input}
                mode="outlined"
              />
              {touched.client && errors.client && (
                <Text style={styles.errorText}>{errors.client}</Text>
              )}

              <TextInput
                label="Telefone"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone && !!errors.phone}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              {touched.phone && errors.phone && (
                <Text style={styles.errorText}>{errors.phone}</Text>
              )}

              <TextInput
                label="Endereço"
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                error={touched.address && !!errors.address}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={2}
              />
              {touched.address && errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}

              <View style={styles.dateTimeContainer}>
                <View style={styles.dateContainer}>
                  <Text style={styles.label}>Data:</Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateButton}
                  >
                    {formatDate(selectedDate)}
                  </Button>
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.label}>Hora:</Text>
                  <Button
                    mode="outlined"
                    onPress={() => setShowTimePicker(true)}
                    style={styles.dateButton}
                  >
                    {formatTime(selectedDate)}
                  </Button>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}

              <View style={styles.buttonsContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={[styles.button, styles.cancelButton]}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  style={styles.button}
                  loading={saving}
                  disabled={saving}
                >
                  Salvar
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
    backgroundColor: 'theme.colors.background',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollContainer: {
    padding: 16,
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
    backgroundColor: 'theme.colors.background',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  dateContainer: {
    flex: 1,
    marginRight: 10,
  },
  timeContainer: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dateButton: {
    justifyContent: 'center',
    height: 50,
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
  backButton: {
    marginTop: 20,
  },
});

export default EditInstallationScreen;
