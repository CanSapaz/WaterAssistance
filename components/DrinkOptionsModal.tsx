import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
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

const KEYPAD_NUMBERS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

interface DrinkOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, drinkType: string) => void;
}

const DrinkOptionsModal: React.FC<DrinkOptionsModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('0');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDrink, setSelectedDrink] = useState<typeof DRINK_OPTIONS[0] | null>(DRINK_OPTIONS[2]); // Default to water

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const translateY = panY;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          closeAnim.start(() => onClose());
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (visible) {
      resetPositionAnim.start();
    }
  }, [visible]);

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setAmount('0');
    } else if (key === '⌫') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setAmount(prev => (prev === '0' ? key : prev + key));
    }
  };

  const handleDrinkSelect = (drink: typeof DRINK_OPTIONS[0]) => {
    setSelectedDrink(drink);
  };

  const handleAddDrink = () => {
    if (selectedDrink) {
      onSave(parseInt(amount), selectedDrink.name);
      setSelectedDrink(null);
      setAmount('0');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: colors.background, transform: [{ translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragIndicator} />
          
          <View style={[styles.amountContainer, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.amountLabel, { color: colors.text }]}>Miktar (ml)</Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>{amount}</Text>
            {selectedDrink && (
              <Text style={[styles.selectedDrinkText, { color: colors.text }]}>
                {selectedDrink.name}
              </Text>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>İçecek Seç</Text>
          
          <ScrollView 
            style={styles.scrollContainer}
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            <View style={styles.optionsGrid}>
              <View style={styles.optionsRow}>
                {DRINK_OPTIONS.slice(0, Math.ceil(DRINK_OPTIONS.length / 2)).map((drink) => (
                  <TouchableOpacity
                    key={drink.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: colors.card },
                      selectedDrink?.id === drink.id && styles.selectedOptionButton,
                    ]}
                    onPress={() => handleDrinkSelect(drink)}
                  >
                    <MaterialCommunityIcons
                      name={drink.icon as any}
                      size={24}
                      color={selectedDrink?.id === drink.id ? colors.buttonText : colors.primary}
                      style={styles.optionIcon}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: selectedDrink?.id === drink.id ? colors.buttonText : colors.text },
                      ]}
                    >
                      {drink.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.optionsRow}>
                {DRINK_OPTIONS.slice(Math.ceil(DRINK_OPTIONS.length / 2)).map((drink) => (
                  <TouchableOpacity
                    key={drink.id}
                    style={[
                      styles.optionButton,
                      { backgroundColor: colors.card },
                      selectedDrink?.id === drink.id && styles.selectedOptionButton,
                    ]}
                    onPress={() => handleDrinkSelect(drink)}
                  >
                    <MaterialCommunityIcons
                      name={drink.icon as any}
                      size={24}
                      color={selectedDrink?.id === drink.id ? colors.buttonText : colors.primary}
                      style={styles.optionIcon}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        { color: selectedDrink?.id === drink.id ? colors.buttonText : colors.text },
                      ]}
                    >
                      {drink.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {currentDateTime.toLocaleDateString('tr-TR', { 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {currentDateTime.toLocaleTimeString('tr-TR', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.keypadContainer}>
            {KEYPAD_NUMBERS.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.keypadButton, { backgroundColor: colors.card }]}
                    onPress={() => handleKeyPress(num)}
                  >
                    <Text style={[styles.keypadButtonText, { color: colors.text }]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              { 
                backgroundColor: selectedDrink ? colors.primary : colors.card,
                opacity: selectedDrink ? 1 : 0.5,
              }
            ]}
            onPress={handleAddDrink}
            disabled={!selectedDrink}
          >
            <Text style={[styles.addButtonText, { color: colors.buttonText }]}>
              Ekle
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 10,
    maxHeight: '95%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  amountContainer: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  selectedDrinkText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  scrollContainer: {
    height: 120,
    marginBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  optionsGrid: {
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    height: 44,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  selectedOptionButton: {
    backgroundColor: '#007AFF',
  },
  optionIcon: {
    width: 24,
    height: 24,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTimeContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: '500',
  },
  keypadContainer: {
    padding: 8,
    gap: 12,
    paddingHorizontal: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  keypadButton: {
    width: 90,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  keypadButtonText: {
    fontSize: 20,
    fontWeight: '500',
  },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DrinkOptionsModal;
