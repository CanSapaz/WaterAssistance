import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (reminderSettings: ReminderSettings) => void;
}

interface ReminderSettings {
  enabled: boolean;
  startTime: Date;
  endTime: Date;
  interval: number; // dakika cinsinden
  daysOfWeek: boolean[];
}

const INTERVALS = [
  { label: '30 dakika', value: 30 },
  { label: '1 saat', value: 60 },
  { label: '2 saat', value: 120 },
  { label: '3 saat', value: 180 },
  { label: '4 saat', value: 240 },
];

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const ReminderModal: React.FC<ReminderModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(21, 0, 0, 0)),
    interval: 60,
    daysOfWeek: [true, true, true, true, true, true, true],
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const toggleDay = (index: number) => {
    const newDays = [...settings.daysOfWeek];
    newDays[index] = !newDays[index];
    setSettings({ ...settings, daysOfWeek: newDays });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Hatırlatıcı Ayarla</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Ana switch */}
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>Hatırlatıcılar</Text>
              <Switch
                value={settings.enabled}
                onValueChange={(value) => setSettings({ ...settings, enabled: value })}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
              />
            </View>

            {/* Zaman aralığı */}
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>ZAMAN ARALIĞI</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={[styles.timeButtonText, { color: colors.text }]}>
                Başlangıç: {formatTime(settings.startTime)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={[styles.timeButtonText, { color: colors.text }]}>
                Bitiş: {formatTime(settings.endTime)}
              </Text>
            </TouchableOpacity>

            {/* Hatırlatma sıklığı */}
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>HATIRLATMA SIKLIĞI</Text>
            <View style={styles.intervalContainer}>
              {INTERVALS.map((interval) => (
                <TouchableOpacity
                  key={interval.value}
                  style={[
                    styles.intervalButton,
                    {
                      backgroundColor:
                        settings.interval === interval.value
                          ? colors.primary
                          : colors.border + '20',
                    },
                  ]}
                  onPress={() => setSettings({ ...settings, interval: interval.value })}
                >
                  <Text
                    style={[
                      styles.intervalText,
                      {
                        color:
                          settings.interval === interval.value
                            ? 'white'
                            : colors.text,
                      },
                    ]}
                  >
                    {interval.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Günler */}
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>GÜNLER</Text>
            <View style={styles.daysContainer}>
              {DAYS.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: settings.daysOfWeek[index]
                        ? colors.primary
                        : colors.border + '20',
                    },
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: settings.daysOfWeek[index] ? 'white' : colors.text,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>

          {/* Time Pickers */}
          {showStartPicker && (
            <DateTimePicker
              value={settings.startTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowStartPicker(false);
                if (selectedDate) {
                  setSettings({ ...settings, startTime: selectedDate });
                }
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={settings.endTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowEndPicker(false);
                if (selectedDate) {
                  setSettings({ ...settings, endTime: selectedDate });
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  timeButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  timeButtonText: {
    fontSize: 16,
  },
  intervalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  intervalButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 5,
  },
  intervalText: {
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReminderModal;
