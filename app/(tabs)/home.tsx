import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import CircularProgress from 'react-native-circular-progress-indicator';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { BlurView } from 'expo-blur';
import DrinkOptionsModal from '../../components/DrinkOptionsModal';
import ReminderModal from '../../components/ReminderModal';
import AchievementToast from '../../components/AchievementToast';
import LastDrinkModal from '../../components/LastDrinkModal';
import { auth, database } from '../../firebaseConfig';
import { ref, onValue, set, get } from 'firebase/database';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData {
  activity: string;
  climate: string;
  gender: string;
  name: string;
  weight: number;
  dailyWaterGoal: number;
}

interface Achievement {
  title: string;
  thresholdPercentage: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { title: 'İlk Adım', thresholdPercentage: 0.2 }, // %20
  { title: 'Yarı Yolda', thresholdPercentage: 0.5 }, // %50
  { title: 'Günlük Hedef Tamamlandı!', thresholdPercentage: 1 }, // %100
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [waterAmount, setWaterAmount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastDrink, setLastDrink] = useState('14:30');
  const [nextReminder, setNextReminder] = useState('16:00');
  const [quickAmounts] = useState([100, 200, 300, 500]);
  const [isDrinkModalVisible, setIsDrinkModalVisible] = useState<boolean>(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState<boolean>(false);
  const [isLastDrinkModalVisible, setIsLastDrinkModalVisible] = useState(false);
  const [lastDrinkData, setLastDrinkData] = useState({
    amount: 0,
    time: '',
    date: '',
    drinkType: 'water',
    drinks: []
  });
  const [achievementToast, setAchievementToast] = useState<{ visible: boolean; title: string }>({
    visible: false,
    title: '',
  });

  useEffect(() => {
    loadInitialData();
    const fetchLastDrink = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const currentDate = getCurrentDate();
        const waterLogRef = ref(database, `waterLog/${user.uid}/${currentDate}`);
        const snapshot = await get(waterLogRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setLastDrinkData({
            amount: data.amount || 0,
            time: data.lastDrink || '',
            date: new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            drinkType: data.drinkType || 'water',
            drinks: data.drinks || []
          });
          setLastDrink(data.lastDrink || '');
          setWaterAmount(data.amount || 0);
        }
      } catch (error) {
        console.error('Error fetching last drink:', error);
      }
    };

    fetchLastDrink();
  }, []);

  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const loadInitialData = async () => {
    try {
      const storedGoal = await AsyncStorage.getItem('daily_water_goal');
      if (storedGoal) {
        const goalValue = parseInt(storedGoal);
        setDailyGoal(goalValue);
        console.log('Initial daily goal from AsyncStorage:', goalValue);
      }

      loadUserData();
      loadTodayWaterAmount();
      checkAndUpdateStreak();
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const checkAndUpdateStreak = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const streakRef = ref(database, `users/${user.uid}/streak`);
      const snapshot = await get(streakRef);
      const streakData = snapshot.val();

      const today = getCurrentDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      if (!streakData) {
        // İlk kez kullanıyor
        await set(streakRef, {
          count: 1,
          lastActiveDate: today
        });
        setStreak(1);
        return;
      }

      const { count, lastActiveDate } = streakData;

      if (lastActiveDate === today) {
        // Bugün zaten aktif
        setStreak(count);
      } else if (lastActiveDate === yesterdayStr) {
        // Dün aktifti, streak'i devam ettir
        const newCount = count + 1;
        await set(streakRef, {
          count: newCount,
          lastActiveDate: today
        });
        setStreak(newCount);
      } else {
        // Streak kırıldı
        await set(streakRef, {
          count: 1,
          lastActiveDate: today
        });
        setStreak(1);
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const loadTodayWaterAmount = () => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user found in loadTodayWaterAmount');
      return;
    }

    const currentDate = getCurrentDate();
    const waterLogRef = ref(database, `waterLog/${user.uid}/${currentDate}`);
    console.log('Loading water amount for date:', currentDate, 'User:', user.uid);
    
    try {
      const unsubscribe = onValue(waterLogRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Water log data from Firebase:', data);
        if (data && typeof data.amount === 'number') {
          console.log('Setting water amount to:', data.amount);
          setWaterAmount(data.amount);
          if (data.lastDrink) {
            setLastDrink(data.lastDrink);
          }
        } else {
          console.log('No valid water data found, setting to 0');
          setWaterAmount(0);
        }
      }, (error) => {
        console.error('Error loading water log:', error);
      });

      // Cleanup subscription
      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up water log listener:', error);
    }
  };

  const loadUserData = () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      console.log('Firebase user data:', data);
      if (data) {
        setUserData(data);
        if (data.dailyGoal) {
          setDailyGoal(data.dailyGoal);
          console.log('Updated daily goal from Firebase:', data.dailyGoal);

          AsyncStorage.setItem('daily_water_goal', data.dailyGoal.toString())
            .then(() => console.log('Daily goal synced to AsyncStorage'))
            .catch(error => console.error('Error syncing daily goal:', error));
        }
      }
    }, (error) => {
      console.error('Error loading user data:', error);
    });
  };

  const handleAddWater = async (amount: number, drinkType: string = 'Su') => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentDate = getCurrentDate();
      const waterLogRef = ref(database, `waterLog/${user.uid}/${currentDate}`);
      const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      // Mevcut günün verilerini al
      const snapshot = await get(waterLogRef);
      const currentData = snapshot.exists() ? snapshot.val() : { amount: 0, drinks: [] };
      
      // Yeni içme aktivitesini ekle
      const newDrink = {
        amount,
        drinkType,
        time: currentTime
      };
      
      // Toplam miktarı ve içme geçmişini güncelle
      const updatedData = {
        amount: currentData.amount + amount,
        lastDrink: currentTime,
        updatedAt: new Date().toISOString(),
        drinkType: drinkType,
        drinks: [...(currentData.drinks || []), newDrink]
      };
      
      await set(waterLogRef, updatedData);
      setWaterAmount(updatedData.amount);
      await checkAndUpdateStreak();
      
      // Last drink verilerini güncelle
      const newLastDrinkData = {
        amount: updatedData.amount,
        time: currentTime,
        date: new Date().toLocaleDateString('tr-TR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        drinkType: drinkType,
        drinks: updatedData.drinks
      };
      
      setLastDrinkData(newLastDrinkData);
      setLastDrink(currentTime);
      setIsDrinkModalVisible(false);
    } catch (error) {
      console.error('Error adding water:', error);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    handleAddWater(amount, 'Su');
  };

  const updateWaterLog = async (newAmount: number) => {
    const user = auth.currentUser;
    if (!user) {
      console.log('No user found in updateWaterLog');
      return;
    }

    try {
      const currentDate = getCurrentDate();
      const currentTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      
      console.log('Updating water log:', {
        userId: user.uid,
        date: currentDate,
        amount: newAmount,
        time: currentTime
      });
      
      const waterLogRef = ref(database, `waterLog/${user.uid}/${currentDate}`);
      const data = {
        amount: newAmount,
        lastDrink: currentTime,
        updatedAt: new Date().toISOString()
      };

      await set(waterLogRef, data);
      console.log('Water log updated successfully:', data);
      
      // Su içildiğinde streak'i güncelle
      await checkAndUpdateStreak();
      
      setWaterAmount(newAmount);
      setLastDrink(currentTime);
    } catch (error) {
      console.error('Error updating water log:', error);
      Alert.alert(
        'Hata',
        'Su miktarı kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    }
  };

  const addWater = async (amount: number) => {
    console.log('Adding water amount:', amount);
    console.log('Current water amount:', waterAmount);
    const newAmount = Math.min(waterAmount + amount, dailyGoal);
    console.log('New water amount will be:', newAmount);
    
    try {
      await updateWaterLog(newAmount);
      checkAchievements(newAmount);
    } catch (error) {
      console.error('Error in addWater:', error);
    }
  };

  const resetWaterAmount = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const currentDate = getCurrentDate();
      const waterLogRef = ref(database, `waterLog/${user.uid}/${currentDate}`);
      
      // Kullanıcıya onay sor
      Alert.alert(
        'Su Miktarını Sıfırla',
        'Bugün içtiğiniz tüm içecekler sıfırlanacak. Emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sıfırla',
            style: 'destructive',
            onPress: async () => {
              // Firebase'de su miktarını ve içme geçmişini sıfırla
              await set(waterLogRef, {
                amount: 0,
                lastDrink: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                updatedAt: new Date().toISOString(),
                drinkType: 'Su',
                drinks: [] // İçme geçmişini boş dizi olarak sıfırla
              });

              // Yerel state'leri güncelle
              setWaterAmount(0);
              setLastDrinkData({
                amount: 0,
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }),
                drinkType: 'Su',
                drinks: [] // İçme geçmişini boş dizi olarak sıfırla
              });
              
              // Başarılı mesajı göster
              Alert.alert('Başarılı', 'Tüm içecekler sıfırlandı.');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error resetting water amount:', error);
      Alert.alert('Hata', 'Su miktarı sıfırlanırken bir hata oluştu.');
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const progress = (waterAmount / dailyGoal) * 100;

  const checkAchievements = (newAmount: number) => {
    const previousAmount = waterAmount;
    const previousPercentage = previousAmount / dailyGoal;
    const newPercentage = newAmount / dailyGoal;

    ACHIEVEMENTS.forEach(achievement => {
      if (newPercentage >= achievement.thresholdPercentage && 
          previousPercentage < achievement.thresholdPercentage) {
        setAchievementToast({
          visible: true,
          title: achievement.title,
        });
      }
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Merhaba 👋</Text>
          <Text style={[styles.date, { color: colors.secondary }]}>
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.card }]}
          onPress={() => router.push('/onboarding/name')}
        >
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>Günlük İlerleme</Text>
          <TouchableOpacity onPress={resetWaterAmount}>
            <Text style={[styles.resetButton, { color: colors.error }]}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressContent}>
          <CircularProgress
            value={progress}
            radius={80}
            duration={1000}
            progressValueColor={colors.text}
            maxValue={100}
            valueSuffix="%"
            title={`${waterAmount}ml`}
            titleColor={colors.text}
            titleStyle={{ fontWeight: 'bold' }}
            activeStrokeColor={colors.primary}
            inActiveStrokeColor={colors.border}
            inActiveStrokeOpacity={0.2}
            activeStrokeWidth={12}
            inActiveStrokeWidth={12}
          />
          <View style={styles.goalInfo}>
            <View style={styles.goalItem}>
              <MaterialCommunityIcons name="flag-outline" size={20} color={colors.primary} />
              <Text style={[styles.goalText, { color: colors.text }]}>Hedef: {dailyGoal}ml</Text>
            </View>
            <View style={styles.goalItem}>
              <MaterialCommunityIcons name="fire" size={20} color={colors.primary} />
              <Text style={[styles.goalText, { color: colors.text }]}>{streak} günlük seri</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Add Section */}
      <View style={styles.quickAddSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı Ekle</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAddScroll}>
          {quickAmounts.map((amount, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickAddButton, { backgroundColor: colors.card }]}
              onPress={() => handleQuickAdd(amount)}
            >
              <MaterialCommunityIcons name="water" size={24} color={colors.primary} />
              <Text style={[styles.quickAddAmount, { color: colors.text }]}>{amount}ml</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickAddButton, { backgroundColor: colors.card }]}
            onPress={() => setIsDrinkModalVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
            <Text style={[styles.quickAddAmount, { color: colors.text }]}>Özel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <TouchableOpacity 
          style={[styles.statsCard, { backgroundColor: colors.card }]}
          onPress={() => setIsLastDrinkModalVisible(true)}
        >
          <View style={styles.statsIconContainer}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.statsLabel, { color: colors.secondary }]}>Son İçilen</Text>
            <Text style={[styles.statsValue, { color: colors.text }]}>{lastDrink}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statsCard, { backgroundColor: colors.card }]}
          onPress={() => setIsReminderModalVisible(true)}
        >
          <View style={styles.statsIconContainer}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.statsLabel, { color: colors.secondary }]}>Hatırlatıcı</Text>
            <Text style={[styles.statsValue, { color: colors.text }]}>{nextReminder}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Sağlık İpuçları Kartı */}
      <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
        <View style={styles.tipsHeader}>
          <MaterialCommunityIcons name="lightbulb-outline" size={24} color={colors.primary} />
          <Text style={[styles.tipsTitle, { color: colors.text }]}>Günün İpucu</Text>
        </View>
        <Text style={[styles.tipsContent, { color: colors.secondary }]}>
          Sabah kalkar kalkmaz bir bardak su içmek metabolizmanızı hızlandırır ve gün boyu daha enerjik hissetmenizi sağlar.
        </Text>
        <View style={styles.tipsTags}>
          <View style={[styles.tipsTag, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.tipsTagText, { color: colors.primary }]}>#Sağlık</Text>
          </View>
          <View style={[styles.tipsTag, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.tipsTagText, { color: colors.primary }]}>#Metabolizma</Text>
          </View>
        </View>
      </View>

      {/* Last Drink Modal */}
      <LastDrinkModal
        visible={isLastDrinkModalVisible}
        onClose={() => setIsLastDrinkModalVisible(false)}
        drinkData={lastDrinkData}
      />

      {/* DrinkOptionsModal */}
      <DrinkOptionsModal
        visible={isDrinkModalVisible}
        onClose={() => setIsDrinkModalVisible(false)}
        onSave={(amount, drinkType) => {
          handleAddWater(amount, drinkType);
          setIsDrinkModalVisible(false);
        }}
      />

      {/* ReminderModal */}
      <ReminderModal
        visible={isReminderModalVisible}
        onClose={() => setIsReminderModalVisible(false)}
        onSave={(reminderSettings) => {
          const nextTime = reminderSettings.startTime.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          setNextReminder(nextTime);
          setIsReminderModalVisible(false);
        }}
      />

      {/* AchievementToast */}
      <AchievementToast
        visible={achievementToast.visible}
        title={achievementToast.title}
        onHide={() => setAchievementToast({ visible: false, title: '' })}
      />
    </ScrollView>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editGoal: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContent: {
    alignItems: 'center',
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickAddSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickAddScroll: {
    flexDirection: 'row',
  },
  quickAddButton: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickAddAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsInfo: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  tipsContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  tipsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tipsTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tipsTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
