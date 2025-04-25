import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { useTheme } from 'react-native-paper';

// Configuração de localização para português
LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan.', 'Fev.', 'Mar.', 'Abr.', 'Mai.', 'Jun.', 
    'Jul.', 'Ago.', 'Set.', 'Out.', 'Nov.', 'Dez.'
  ],
  dayNames: [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ],
  dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

type CalendarProps = {
  markedDates: {
    [date: string]: {
      marked: boolean;
      dotColor?: string;
      selected?: boolean;
      selectedColor?: string;
    };
  };
  onDayPress: (day: any) => void;
  selectedDate: string;
};

const CalendarComponent = ({ markedDates, onDayPress, selectedDate }: CalendarProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <RNCalendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        monthFormat={'MMMM yyyy'}
        hideExtraDays={true}
        firstDay={0}
        enableSwipeMonths={true}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: theme.colors.primary,
          selectedDotColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.primary,
          indicatorColor: theme.colors.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 14
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
});

export default CalendarComponent;
