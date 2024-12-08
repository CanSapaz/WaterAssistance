import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const DRINK_OPTIONS = [
  { id: 'coffee', name: 'Kahve', icon: 'coffee' },
  { id: 'tea', name: 'Çay', icon: 'tea' },
  { id: 'water', name: 'Su', icon: 'water' },
  { id: 'mineral_water', name: 'Maden Suyu', icon: 'bottle-tonic-plus' },
  { id: 'juice', name: 'Meyve Suyu', icon: 'fruit-citrus' },
  { id: 'energy_drink', name: 'Enerji İçeceği', icon: 'lightning-bolt' },
  { id: 'sports_drink', name: 'Spor İçeceği', icon: 'dumbbell' },
  { id: 'protein_drink', name: 'Protein İçeceği', icon: 'shaker' },
  { id: 'smoothie', name: 'Smoothie', icon: 'blender' },
  { id: 'milk', name: 'Süt', icon: 'cup' },
  { id: 'skimmed_milk', name: 'Yağsız Süt', icon: 'cup-outline' },
  { id: 'hot_chocolate', name: 'Sıcak Çikolata', icon: 'coffee' },
  { id: 'soup', name: 'Çorba', icon: 'bowl-mix' },
  { id: 'soda', name: 'Soda', icon: 'bottle-soda' },
  { id: 'beer', name: 'Bira', icon: 'beer' },
  { id: 'wine', name: 'Şarap', icon: 'glass-wine' },
  { id: 'liquor', name: 'Likör', icon: 'glass-cocktail' },
];

interface LastDrinkModalProps {
  visible: boolean;
  onClose: () => void;
  drinkData: {
    amount: number;
    time: string;
    date: string;
    drinkType: string;
    drinks: Array<{
      amount: number;
      drinkType: string;
      time: string;
    }>;
  };
}

const LastDrinkModal: React.FC<LastDrinkModalProps> = ({
  visible,
  onClose,
  drinkData,
}) => {
  const { colors } = useTheme();

  const getDrinkIcon = (drinkType: string) => {
    const drink = DRINK_OPTIONS.find(d => d.name === drinkType);
    return drink?.icon || 'water';
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
            <Text style={[styles.title, { color: colors.text }]}>Bugünün İçecek Geçmişi</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Toplam Miktar */}
            <View style={[styles.totalSection, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Toplam</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>{drinkData.amount} ml</Text>
            </View>

            {/* İçecek Geçmişi */}
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>GÜNLÜK GEÇMİŞ</Text>
            {drinkData.drinks.map((drink, index) => (
              <View 
                key={index} 
                style={[
                  styles.drinkHistoryItem, 
                  { backgroundColor: colors.border + '20' }
                ]}
              >
                <View style={styles.drinkInfo}>
                  <MaterialCommunityIcons 
                    name={getDrinkIcon(drink.drinkType)} 
                    size={24} 
                    color={colors.primary} 
                  />
                  <View style={styles.drinkDetails}>
                    <Text style={[styles.drinkType, { color: colors.text }]}>
                      {drink.drinkType}
                    </Text>
                    <Text style={[styles.drinkAmount, { color: colors.secondary }]}>
                      {drink.amount} ml
                    </Text>
                  </View>
                </View>
                <Text style={[styles.drinkTime, { color: colors.secondary }]}>
                  {drink.time}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Kapat</Text>
          </TouchableOpacity>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    marginBottom: 20,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  drinkHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  drinkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drinkDetails: {
    marginLeft: 15,
  },
  drinkType: {
    fontSize: 16,
    fontWeight: '500',
  },
  drinkAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  drinkTime: {
    fontSize: 14,
  },
  closeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LastDrinkModal;
