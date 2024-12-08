import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Share, 
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FriendsScreen() {
  const { colors } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: 400,
    duration: 200,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeAnim.start(() => setIsModalVisible(false));
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  const handleShare = async () => {
    try {
      const userName = await AsyncStorage.getItem('user_name');
      const waterAmount = await AsyncStorage.getItem('water_amount');
      const dailyGoal = await AsyncStorage.getItem('daily_water_goal');

      const message = `Hey! Ben ${userName || 'Su Asistanı kullanıcısı'} 💧\n\n` +
        `Bugün ${waterAmount || '0'}ml su içtim!\n` +
        `Günlük hedefim: ${dailyGoal || '2000'}ml\n\n` +
        `Su Asistanı uygulamasıyla su içme hedeflerime ulaşıyorum! 🎯`;

      await Share.share({
        message,
        title: 'Su İçme İlerlememi Paylaş',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>Paylaş</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setIsModalVisible(true)}
        >
          <MaterialCommunityIcons 
            name="account-circle-outline" 
            size={32} 
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
        >
          <Text style={[styles.shareButtonText, { color: colors.buttonText }]}>
            İlerlemenizi Paylaşın
          </Text>
        </TouchableOpacity>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Şu anda su içme bilgilerinizi diğer kullanıcılarla paylaşmıyorsunuz.{'\n'}
          Arkadaşlarınıza hemen davet gönderin!
        </Text>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.background,
                transform: [{ translateY: panY }]
              }
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.dragIndicator} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Paylaşımı Yönet
              </Text>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Şununla Paylaşıyorsun:
              </Text>
              
              <TouchableOpacity 
                style={[styles.shareToggleButton, { borderColor: colors.cardBorder }]}
                onPress={handleShare}
              >
                <Text style={styles.shareToggleText}>
                  Bilgilerimi paylaş
                </Text>
              </TouchableOpacity>

              <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 25 }]}>
                Seninle Paylaşıyor
              </Text>

              <View style={[styles.textAreaContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
                <Text style={[styles.placeholderText, { color: colors.text }]}>
                  Hiçbir kullanıcı/arkadaş bilgilerini sizinle paylaşmıyor.
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  shareButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoText: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    paddingHorizontal: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '70%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  shareToggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  shareToggleText: {
    fontSize: 16,
    color: '#007AFF',
  },
  textAreaContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
