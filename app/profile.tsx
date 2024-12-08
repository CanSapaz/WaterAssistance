import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import WaterGoalModal from '../components/WaterGoalModal';
import ProfileEditModal from '../components/ProfileEditModal';
import SelectionModal from '../components/SelectionModal';

const GENDER_OPTIONS = ['male', 'female', 'pregnant', 'nursing', 'other'];
const ACTIVITY_OPTIONS = ['sedentary', 'light', 'moderate', 'very_active'];
const CLIMATE_OPTIONS = ['hot', 'moderate', 'cold'];

const GENDER_LABELS: { [key: string]: string } = {
  'male': 'Erkek',
  'female': 'Kadın',
  'pregnant': 'Kadın: Hamile',
  'nursing': 'Kadın: Emziren',
  'other': 'Diğer'
};

const ACTIVITY_LABELS: { [key: string]: string } = {
  'sedentary': 'Hareketsiz',
  'light': 'Hafif Aktivite',
  'moderate': 'Kısmen Aktif',
  'very_active': 'Çok Aktif'
};

const CLIMATE_LABELS: { [key: string]: string } = {
  'hot': 'Sıcak',
  'moderate': 'Ilıman',
  'cold': 'Soğuk'
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [isWaterGoalModalVisible, setIsWaterGoalModalVisible] = useState(false);
  const [editField, setEditField] = useState<{
    field: string;
    value: string;
    title: string;
    type?: 'text' | 'numeric';
    unit?: string;
  } | null>(null);
  const [selectionField, setSelectionField] = useState<{
    field: string;
    value: string;
    title: string;
    options: string[];
  } | null>(null);

  const [userData, setUserData] = useState({
    name: '',
    gender: '',
    weight: '',
    activity: '',
    climate: '',
    dailyGoal: '2000'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('user_name') || '';
      const gender = await AsyncStorage.getItem('user_gender') || '';
      const weight = await AsyncStorage.getItem('user_weight') || '';
      const activity = await AsyncStorage.getItem('user_activity') || '';
      const climate = await AsyncStorage.getItem('user_climate') || '';
      const goal = await AsyncStorage.getItem('daily_water_goal') || '2000';

      setUserData({
        name,
        gender,
        weight,
        activity,
        climate,
        dailyGoal: goal
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleFieldSave = async (value: string) => {
    if (!editField) return;
    
    try {
      await AsyncStorage.setItem(`user_${editField.field}`, value);
      setUserData(prev => ({ ...prev, [editField.field]: value }));
    } catch (error) {
      console.error(`Error saving ${editField.field}:`, error);
    }
  };

  const handleFieldEdit = (field: string, value: string, title: string, type?: 'text' | 'numeric', unit?: string) => {
    setEditField({ field, value, title, type, unit });
  };

  const handleSelectionEdit = (field: string, value: string, title: string, options: string[]) => {
    setSelectionField({ field, value, title, options });
  };

  const handleSelectionSave = async (value: string) => {
    if (!selectionField) return;
    
    try {
      await AsyncStorage.setItem(`user_${selectionField.field}`, value);
      setUserData(prev => ({ ...prev, [selectionField.field]: value }));
    } catch (error) {
      console.error(`Error saving ${selectionField.field}:`, error);
    }
  };

  const handleWaterGoalSave = async (newGoal: string) => {
    try {
      await AsyncStorage.setItem('daily_water_goal', newGoal);
      setUserData(prev => ({ ...prev, dailyGoal: newGoal }));
    } catch (error) {
      console.error('Error saving water goal:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={[{ flex: 1 }, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={[styles.backText, { color: colors.primary }]}>Geri</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hesap Bilgileri Bölümü */}
        <View style={[styles.sectionHeader, { marginHorizontal: 16, marginVertical: 16 }]}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Hesap Bilgileri</Text>
          <Text style={[styles.sectionHeaderDescription, { color: colors.secondary }]}>Düzenlemek için dokunun</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => handleFieldEdit('name', userData.name, 'İsim')}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.label, { color: colors.text }]}>İsim:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{userData.name}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelectionEdit('gender', userData.gender, 'Cinsiyet', GENDER_OPTIONS)}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.label, { color: colors.text }]}>Cinsiyet:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{GENDER_LABELS[userData.gender] || userData.gender}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleFieldEdit('weight', userData.weight, 'Ağırlık', 'numeric', 'kg')}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.label, { color: colors.text }]}>Ağırlık:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{userData.weight} kg</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelectionEdit('activity', userData.activity, 'Aktivite Seviyesi', ACTIVITY_OPTIONS)}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.label, { color: colors.text }]}>Aktivite Seviyesi:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{ACTIVITY_LABELS[userData.activity] || userData.activity}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
            </View>
            <View style={styles.divider} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelectionEdit('climate', userData.climate, 'Hava', CLIMATE_OPTIONS)}>
            <View style={styles.infoRow}>
              <View style={styles.infoContent}>
                <Text style={[styles.label, { color: colors.text }]}>Hava:</Text>
                <Text style={[styles.value, { color: colors.text }]}>{CLIMATE_LABELS[userData.climate] || userData.climate}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.secondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Water Goal Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Su İçme Hedefi</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.secondary }]}>
          Manuel hedefi kullanmak için dokunun
        </Text>
        <TouchableOpacity 
          style={[styles.section, { backgroundColor: colors.card }]}
          onPress={() => setIsWaterGoalModalVisible(true)}
        >
          <View style={styles.goalRow}>
            <MaterialCommunityIcons 
              name="water" 
              size={32} 
              color={colors.primary} 
            />
            <Text style={[styles.goalText, { color: colors.text }]}>
              {userData.dailyGoal} ml
            </Text>
          </View>
        </TouchableOpacity>

        {/* Uygulama Bağlantısı Bölümü */}
        <View style={[styles.sectionHeader, { marginHorizontal: 16, marginVertical: 16 }]}>
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Uygulama Bağla</Text>
          <Text style={[styles.sectionHeaderDescription, { color: colors.secondary }]}>Telefonunuzdaki uygulamalara bağlamak için dokunun</Text>
        </View>

        <TouchableOpacity style={[styles.section, { backgroundColor: colors.card }]} onPress={() => {}}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Sağlık uygulaması ile kullan
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.text}
            />
          </View>
        </TouchableOpacity>

        {/* Tıbbi Uyarı Notu */}
        <Text style={[styles.medicalDisclaimer, { color: colors.secondary, marginTop: 16 }]}>
          NOT: Tavsiye edilen su içme hedefi sadece ağırlık, aktivite ve iklime dayanan bir tahmindir. Tıbbi amaçlı kullanmak veya belirli su içme ihtiyacınızı karşılamak için kullanmak istiyorsanız lütfen doktorunuza danışın.
        </Text>
      </ScrollView>

      {editField && (
        <ProfileEditModal
          isVisible={!!editField}
          onClose={() => setEditField(null)}
          onSave={handleFieldSave}
          currentValue={editField.value}
          title={editField.title}
          type={editField.type}
          unit={editField.unit}
        />
      )}

      {selectionField && (
        <SelectionModal
          isVisible={!!selectionField}
          onClose={() => setSelectionField(null)}
          onSelect={handleSelectionSave}
          title={selectionField.title}
          options={selectionField.options}
          currentValue={selectionField.value}
          type={selectionField.field as 'gender' | 'activity' | 'climate'}
        />
      )}
      
      <WaterGoalModal 
        isVisible={isWaterGoalModalVisible}
        onClose={() => setIsWaterGoalModalVisible(false)}
        onSave={handleWaterGoalSave}
        currentGoal={userData.dailyGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
  },
  backText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  section: {
    margin: 16,
    padding: 16,
    paddingBottom: 5,
    paddingTop: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionHeaderDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginLeft: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  goalText: {
    fontSize: 28,
    fontWeight: '600',
  },
  calorieText: {
    fontSize: 16,
    textAlign: 'center',
  },
  medicalDisclaimer: {
    fontSize: 12,
    textAlign: 'left',
    marginHorizontal: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  infoText: {
    fontSize: 16,
  },
});
