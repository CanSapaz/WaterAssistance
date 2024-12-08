import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface ProfileEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  currentValue: string;
  title: string;
  type?: 'text' | 'numeric';
  unit?: string;
}

export default function ProfileEditModal({
  isVisible,
  onClose,
  onSave,
  currentValue,
  title,
  type = 'text',
  unit,
}: ProfileEditModalProps) {
  const { colors } = useTheme();
  const [value, setValue] = useState(currentValue);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.secondary }]}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <MaterialCommunityIcons name="check" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={value}
              onChangeText={setValue}
              keyboardType={type === 'numeric' ? 'numeric' : 'default'}
              autoFocus={true}
              selectTextOnFocus={true}
            />
            {unit && <Text style={[styles.unit, { color: colors.secondary }]}>{unit}</Text>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '30%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    fontSize: 42,
    fontWeight: '600',
    textAlign: 'center',
    width: '35%',
  },
  unit: {
    fontSize: 24,
    marginLeft: 0,
    opacity: 0.6,
  },
});
