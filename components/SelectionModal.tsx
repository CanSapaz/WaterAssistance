import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Options for different selection types
const GENDER_OPTIONS = [
  {
    id: 'male',
    label: 'Erkek',
    icon: 'gender-male',
    multiplier: 1.1,
  },
  {
    id: 'female',
    label: 'Kadın',
    icon: 'gender-female',
    multiplier: 1.0,
  },
  {
    id: 'pregnant',
    label: 'Kadın: Hamile',
    icon: 'gender-female',
    multiplier: 1.1,
  },
  {
    id: 'nursing',
    label: 'Kadın: Emziren',
    icon: 'gender-female',
    multiplier: 1.2,
  },
  {
    id: 'other',
    label: 'Diğer',
    icon: 'gender-male-female',
    multiplier: 1.0,
  },
];

const ACTIVITY_OPTIONS = [
  {
    id: 'sedentary',
    label: 'Hareketsiz',
    description: 'Masa başı iş, az hareket',
    multiplier: 1.0,
    icon: 'seat-recline-normal'
  },
  {
    id: 'light',
    label: 'Hafif Aktivite',
    description: 'Günlük yürüyüş, hafif egzersiz',
    multiplier: 1.2,
    icon: 'walk'
  },
  {
    id: 'moderate',
    label: 'Kısmen Aktif',
    description: 'Düzenli egzersiz, aktif yaşam',
    multiplier: 1.4,
    icon: 'run'
  },
  {
    id: 'very_active',
    label: 'Çok Aktif',
    description: 'Yoğun egzersiz, spor',
    multiplier: 1.6,
    icon: 'weight-lifter'
  },
];

const CLIMATE_OPTIONS = [
  {
    id: 'hot',
    label: 'Sıcak',
    description: '25°C ve üzeri sıcaklıklar',
    multiplier: 1.3,
    icon: 'weather-sunny-alert'
  },
  {
    id: 'moderate',
    label: 'Ilıman',
    description: '15-25°C arası sıcaklıklar',
    multiplier: 1.0,
    icon: 'weather-sunny'
  },
  {
    id: 'cold',
    label: 'Soğuk',
    description: '15°C altı sıcaklıklar',
    multiplier: 0.9,
    icon: 'snowflake'
  }
];

interface SelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  title: string;
  options: any[];
  currentValue: string;
  type: 'gender' | 'activity' | 'climate';
}

export default function SelectionModal({
  isVisible,
  onClose,
  onSelect,
  title,
  currentValue,
  type,
}: SelectionModalProps) {
  const { colors } = useTheme();
  const [selectedValue, setSelectedValue] = useState(currentValue);
  
  const handleSave = () => {
    onSelect(selectedValue);
    onClose();
  };

  const getOptions = () => {
    switch (type) {
      case 'gender':
        return GENDER_OPTIONS;
      case 'activity':
        return ACTIVITY_OPTIONS;
      case 'climate':
        return CLIMATE_OPTIONS;
      default:
        return [];
    }
  };

  const getModalHeight = () => {
    switch (type) {
      case 'name':
        return '30%';
      case 'gender':
        return '55%';
      case 'weight':
        return '30%';
      case 'activity':
        return '55%';
      case 'climate':
        return '45%';
      default:
        return '50%';
    }
  };

  const options = getOptions();

  const renderOption = (option: any) => {
    const isSelected = option.id === selectedValue;

    if (type === 'activity' || type === 'climate') {
      return (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.activityOption,
            isSelected && [styles.optionSelected, { borderColor: colors.primary }],
            { backgroundColor: colors.card }
          ]}
          onPress={() => setSelectedValue(option.id)}
        >
          <View style={styles.optionContent}>
            <MaterialCommunityIcons
              name={option.icon}
              size={24}
              color={isSelected ? colors.primary : colors.text}
            />
            <View style={styles.optionTextContainer}>
              <Text style={[
                styles.activityLabel,
                isSelected && [styles.optionLabelSelected, { color: colors.primary }],
                { color: colors.text }
              ]}>
                {option.label}
              </Text>
              <Text style={[
                styles.activityDescription,
                isSelected && [styles.optionDescriptionSelected, { color: colors.primary }],
                { color: colors.text }
              ]}>
                {option.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.option,
          isSelected && [styles.optionSelected, { borderColor: colors.primary }],
          { backgroundColor: colors.card }
        ]}
        onPress={() => setSelectedValue(option.id)}
      >
        <MaterialCommunityIcons
          name={option.icon}
          size={24}
          color={isSelected ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.optionText,
            isSelected && [styles.optionTextSelected, { color: colors.primary }],
            { color: colors.text }
          ]}
        >
          {option.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[
          styles.modalContent,
          { backgroundColor: colors.background, height: getModalHeight() }
        ]}>
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
          
          <ScrollView style={styles.optionsContainer}>
            {options.map(renderOption)}
          </ScrollView>
        </View>
      </View>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
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
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: 'bold',
  },
  // Activity specific styles
  activityOption: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
  },
  optionLabelSelected: {
    fontWeight: 'bold',
  },
  optionDescriptionSelected: {
    fontWeight: '500',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
});
