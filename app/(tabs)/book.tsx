import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface Mission {
  id: number;
  title: string;
  description: string;
  progress: number;
  reward: string;
  icon: IconName;
  completed?: boolean;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  locked: boolean;
}

interface MissionCategory {
  id: number;
  title: string;
  description: string;
  icon: IconName;
  color: string;
  missions: Mission[];
}

const missionCategories: MissionCategory[] = [
  {
    id: 1,
    title: 'Günlük Görevler',
    description: 'Her gün tamamlanması gereken görevler',
    icon: 'calendar-today',
    color: '#4facfe',
    missions: [
      {
        id: 1,
        title: 'Günlük Su Hedefi',
        description: 'Günlük su hedefini tamamla',
        progress: 75,
        reward: '50 XP',
        icon: 'cup-water',
      },
      {
        id: 2,
        title: 'Sabah Rutini',
        description: 'Sabah 8:00\'den önce su iç',
        progress: 100,
        reward: '30 XP',
        icon: 'weather-sunset-up',
      },
      {
        id: 3,
        title: 'Akşam Rutini',
        description: 'Yatmadan önce su içmeyi unutma',
        progress: 0,
        reward: '25 XP',
        icon: 'weather-night',
      },
      {
        id: 4,
        title: 'Öğle Molası',
        description: 'Öğle yemeğinde en az 1 bardak su iç',
        progress: 50,
        reward: '20 XP',
        icon: 'food',
      },
      {
        id: 5,
        title: 'Kahvaltı Suyu',
        description: 'Kahvaltıda 1 bardak su iç',
        progress: 30,
        reward: '20 XP',
        icon: 'food-croissant',
      },
      {
        id: 6,
        title: 'Egzersiz Öncesi',
        description: 'Egzersiz öncesi 1 bardak su iç',
        progress: 0,
        reward: '25 XP',
        icon: 'dumbbell',
      },
      {
        id: 7,
        title: 'Egzersiz Sonrası',
        description: 'Egzersiz sonrası 2 bardak su iç',
        progress: 0,
        reward: '30 XP',
        icon: 'run',
      },
      {
        id: 8,
        title: 'İş Molası',
        description: 'İş/Ders molalarında su içmeyi unutma',
        progress: 60,
        reward: '20 XP',
        icon: 'briefcase',
      },
      {
        id: 9,
        title: 'Akşam Yemeği',
        description: 'Akşam yemeğinde su iç',
        progress: 0,
        reward: '20 XP',
        icon: 'food-turkey',
      },
      {
        id: 10,
        title: 'Vitamin Zamanı',
        description: 'Vitamin/İlaç alırken su iç',
        progress: 100,
        reward: '15 XP',
        icon: 'pill',
      },
      {
        id: 11,
        title: 'Sağlıklı Başlangıç',
        description: 'Güne bir bardak su ile başla',
        progress: 0,
        reward: '25 XP',
        icon: 'weather-sunny',
      },
      {
        id: 12,
        title: 'Ara Öğün',
        description: 'Atıştırmalıklarla su içmeyi unutma',
        progress: 40,
        reward: '20 XP',
        icon: 'food-apple',
      }
    ]
  },
  {
    id: 2,
    title: 'Haftalık Zorluklar',
    description: 'Haftalık tamamlanması gereken görevler',
    icon: 'calendar-week',
    color: '#9C27B0',
    missions: [
      {
        id: 13,
        title: 'Su Savaşçısı',
        description: '7 gün boyunca günlük hedefini tamamla',
        progress: 40,
        reward: '100 XP',
        icon: 'sword-cross',
      },
      {
        id: 14,
        title: 'Tutarlı İçici',
        description: 'Bu hafta her gün en az 6 kez su iç',
        progress: 65,
        reward: '75 XP',
        icon: 'chart-line',
      },
      {
        id: 15,
        title: 'Sabah Kahramanı',
        description: 'Bu hafta her sabah 7:00\'den önce su iç',
        progress: 30,
        reward: '80 XP',
        icon: 'sunrise',
      },
      {
        id: 16,
        title: 'Haftalık Hedef',
        description: 'Bu hafta toplam 14L su iç',
        progress: 45,
        reward: '90 XP',
        icon: 'target',
      },
      {
        id: 17,
        title: 'Spor Haftası',
        description: 'Bu hafta her egzersizde su hedefini tamamla',
        progress: 20,
        reward: '85 XP',
        icon: 'weight-lifter',
      },
      {
        id: 18,
        title: 'Düzenli Takip',
        description: '7 gün boyunca su tüketimini kaydet',
        progress: 85,
        reward: '70 XP',
        icon: 'notebook',
      },
      {
        id: 19,
        title: 'Erken Kuş',
        description: 'Bu hafta her sabah 8:00\'den önce 2 bardak su iç',
        progress: 50,
        reward: '95 XP',
        icon: 'bird',
      },
      {
        id: 20,
        title: 'Akşam Rutini Ustası',
        description: 'Her akşam yatmadan önce su içme hedefini tamamla',
        progress: 60,
        reward: '80 XP',
        icon: 'moon-waning-crescent',
      },
      {
        id: 21,
        title: 'Öğle Molası Şampiyonu',
        description: 'Bu hafta her öğle yemeğinde su hedefini tamamla',
        progress: 70,
        reward: '75 XP',
        icon: 'food-fork-drink',
      },
      {
        id: 22,
        title: 'Haftalık Bonus',
        description: 'Her gün ekstra 1 bardak su iç',
        progress: 40,
        reward: '100 XP',
        icon: 'plus-circle',
      }
    ]
  },
  {
    id: 3,
    title: 'Aylık Hedefler',
    description: 'Bu ay tamamlanması gereken görevler',
    icon: 'calendar-month',
    color: '#FF9800',
    missions: [
      {
        id: 23,
        title: 'Su Uzmanı',
        description: '30 gün boyunca günlük hedefini tamamla',
        progress: 20,
        reward: '200 XP',
        icon: 'medal',
      },
      {
        id: 24,
        title: 'Sağlık Dostu',
        description: 'Bu ay toplam 60L su iç',
        progress: 45,
        reward: '150 XP',
        icon: 'heart-pulse',
      },
      {
        id: 25,
        title: 'Aylık Meydan Okuma',
        description: 'Her gün minimum 2L su iç',
        progress: 35,
        reward: '180 XP',
        icon: 'trophy',
      },
      {
        id: 26,
        title: 'Süper Tutarlılık',
        description: 'Bu ay her gün en az 8 kez su iç',
        progress: 55,
        reward: '170 XP',
        icon: 'star',
      },
      {
        id: 27,
        title: 'Sabah Rutini Uzmanı',
        description: '30 gün boyunca sabah rutinini aksatma',
        progress: 40,
        reward: '160 XP',
        icon: 'weather-sunny',
      },
      {
        id: 28,
        title: 'Akşam Rutini Uzmanı',
        description: '30 gün boyunca akşam rutinini aksatma',
        progress: 60,
        reward: '160 XP',
        icon: 'weather-night',
      },
      {
        id: 29,
        title: 'Spor ve Su Ustası',
        description: 'Bu ay tüm egzersizlerde su hedefini tamamla',
        progress: 25,
        reward: '190 XP',
        icon: 'run-fast',
      },
      {
        id: 30,
        title: 'Premium Başarı',
        description: 'Bu ay 3 haftalık zorluğu tamamla',
        progress: 70,
        reward: '220 XP',
        icon: 'crown',
      },
      {
        id: 31,
        title: 'Su Alışkanlığı',
        description: '30 gün boyunca düzenli su içme alışkanlığı kazan',
        progress: 50,
        reward: '200 XP',
        icon: 'check-circle',
      },
      {
        id: 32,
        title: 'Aylık Bonus',
        description: 'Her hafta en az bir haftalık görevi tamamla',
        progress: 30,
        reward: '175 XP',
        icon: 'gift',
      }
    ]
  },
  {
    id: 4,
    title: 'Özel Görevler',
    description: 'Özel zamanlarda aktif olan görevler',
    icon: 'star-circle',
    color: '#FFD700',
    missions: [
      {
        id: 33,
        title: 'Düzenli İçici',
        description: 'Gün içinde en az 8 kez su iç',
        progress: 60,
        reward: '40 XP',
        icon: 'clock-time-eight-outline',
      },
      {
        id: 34,
        title: 'Spor Dostu',
        description: 'Egzersiz sırasında en az 500ml su iç',
        progress: 0,
        reward: '45 XP',
        icon: 'dumbbell',
      },
      {
        id: 35,
        title: 'Sıcak Gün Kahramanı',
        description: '30°C üstü günlerde ekstra 500ml su iç',
        progress: 80,
        reward: '60 XP',
        icon: 'weather-sunny',
      },
      {
        id: 36,
        title: 'Yolculuk Uzmanı',
        description: 'Seyahat ederken su içmeyi unutma',
        progress: 20,
        reward: '50 XP',
        icon: 'airplane',
      },
      {
        id: 37,
        title: 'Ofis Şampiyonu',
        description: 'İş/Okul günlerinde su hedefini tamamla',
        progress: 90,
        reward: '55 XP',
        icon: 'office-building',
      },
      {
        id: 38,
        title: 'Hafta Sonu Savaşçısı',
        description: 'Hafta sonları su hedefini aşarak tamamla',
        progress: 40,
        reward: '65 XP',
        icon: 'calendar-weekend',
      },
      {
        id: 39,
        title: 'Tatil Modu',
        description: 'Tatilde günlük su hedefini tamamla',
        progress: 0,
        reward: '70 XP',
        icon: 'beach',
      },
      {
        id: 40,
        title: 'Yemek Uzmanı',
        description: 'Her ana öğünde su içmeyi unutma',
        progress: 70,
        reward: '45 XP',
        icon: 'silverware-fork-knife',
      },
      {
        id: 41,
        title: 'Gece Nöbeti',
        description: 'Gece çalışırken düzenli su iç',
        progress: 30,
        reward: '75 XP',
        icon: 'weather-night',
      },
      {
        id: 42,
        title: 'Festival Savaşçısı',
        description: 'Özel etkinliklerde su içmeyi unutma',
        progress: 50,
        reward: '80 XP',
        icon: 'party-popper',
      }
    ]
  },
  {
    id: 5,
    title: 'Sosyal Görevler',
    description: 'Arkadaşlarınla birlikte tamamla',
    icon: 'account-group',
    color: '#2196F3',
    missions: [
      {
        id: 43,
        title: 'Su Arkadaşı',
        description: 'Bir arkadaşını uygulamaya davet et',
        progress: 0,
        reward: '100 XP',
        icon: 'account-plus',
      },
      {
        id: 44,
        title: 'Takım Oyuncusu',
        description: '3 arkadaşınla birlikte günlük hedefi tamamla',
        progress: 30,
        reward: '120 XP',
        icon: 'account-group',
      },
      {
        id: 45,
        title: 'Su Koçu',
        description: 'Bir arkadaşına haftalık hedefinde yardım et',
        progress: 50,
        reward: '110 XP',
        icon: 'account-heart',
      },
      {
        id: 46,
        title: 'Sosyal Yarışmacı',
        description: 'Haftalık su içme yarışmasına katıl',
        progress: 75,
        reward: '130 XP',
        icon: 'trophy-outline',
      },
      {
        id: 47,
        title: 'Topluluk Lideri',
        description: '5 arkadaşını uygulamaya davet et',
        progress: 20,
        reward: '150 XP',
        icon: 'account-supervisor',
      },
      {
        id: 48,
        title: 'Takım Ruhu',
        description: 'Bir takım oluştur ve haftalık hedefe ulaş',
        progress: 40,
        reward: '140 XP',
        icon: 'account-multiple-check',
      },
      {
        id: 49,
        title: 'İlham Kaynağı',
        description: 'Sosyal medyada su içme alışkanlığını paylaş',
        progress: 60,
        reward: '90 XP',
        icon: 'share-variant',
      },
      {
        id: 50,
        title: 'Grup Motivasyonu',
        description: 'Grup sohbetinde günlük hatırlatma yap',
        progress: 80,
        reward: '100 XP',
        icon: 'message-text',
      },
      {
        id: 51,
        title: 'Su Mentoru',
        description: 'Yeni başlayan bir kullanıcıya yardım et',
        progress: 10,
        reward: '160 XP',
        icon: 'school',
      },
      {
        id: 52,
        title: 'Sosyal Etkinlik',
        description: 'Su içme etkinliği düzenle',
        progress: 0,
        reward: '170 XP',
        icon: 'calendar-star',
      }
    ]
  }
];

const achievements: Achievement[] = [
  {
    id: 1,
    title: 'Su Ustası',
    description: '30 gün boyunca hedefi tamamla',
    icon: 'medal',
    color: '#FFD700',
    locked: false,
  },
  {
    id: 2,
    title: 'Erken Kuş',
    description: '10 kez sabah 7:00\'den önce su iç',
    icon: 'bird',
    color: '#4facfe',
    locked: false,
  },
  {
    id: 3,
    title: 'Sağlık Fanatigi',
    description: '100L su iç',
    icon: 'heart-flash',
    color: '#ff4444',
    locked: true,
  },
  {
    id: 4,
    title: 'Tutarlı İçici',
    description: '50 gün aralıksız su takibi',
    icon: 'trophy',
    color: '#9C27B0',
    locked: true,
  },
  {
    id: 5,
    title: 'Gece Bekçisi',
    description: '7 gün boyunca yatmadan önce su içmeyi unutma',
    icon: 'weather-night',
    color: '#1A237E',
    locked: true,
  },
  {
    id: 6,
    title: 'Dünya Gezgini',
    description: '5 farklı lokasyonda su içme hedefini tamamla',
    icon: 'earth',
    color: '#2E7D32',
    locked: true,
  },
  {
    id: 7,
    title: 'Sosyal İçici',
    description: 'Arkadaşlarından 10 kişiyi uygulamaya davet et',
    icon: 'account-group',
    color: '#FF6F00',
    locked: true,
  },
  {
    id: 8,
    title: 'Hidrasyon Gurusu',
    description: 'Tüm içecek türlerinden en az bir kez tüket',
    icon: 'glass-cocktail',
    color: '#00BCD4',
    locked: true,
  },
  {
    id: 9,
    title: 'Sabah Yıldızı',
    description: '30 gün boyunca güneş doğmadan su iç',
    icon: 'weather-sunny',
    color: '#FFC107',
    locked: true,
  },
  {
    id: 10,
    title: 'Maraton Koşucusu',
    description: '1 gün içinde 10 farklı zamanda su iç',
    icon: 'run',
    color: '#F44336',
    locked: true,
  },
  {
    id: 11,
    title: 'Doğa Dostu',
    description: 'Yeniden kullanılabilir şişe kullan ve 100 plastik şişe tasarrufu yap',
    icon: 'leaf',
    color: '#4CAF50',
    locked: true,
  },
  {
    id: 12,
    title: 'Trend Belirleyici',
    description: '50 fotoğraf paylaş ve 1000 beğeni al',
    icon: 'trending-up',
    color: '#E91E63',
    locked: true,
  }
];

export default function BookScreen() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('missions');
  const [selectedCategory, setSelectedCategory] = useState<MissionCategory | null>(null);

  const renderMissionCard = (mission: Mission) => (
    <View key={mission.id} style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name={mission.icon} size={24} color={colors.primary} />
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{mission.title}</Text>
          <Text style={[styles.cardDescription, { color: colors.text + '80' }]}>
            {mission.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${mission.progress}%`,
                backgroundColor: mission.completed ? '#4CAF50' : colors.primary
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {mission.progress}%
        </Text>
      </View>

      <View style={styles.rewardContainer}>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
        <Text style={[styles.rewardText, { color: colors.text }]}>{mission.reward}</Text>
      </View>
    </View>
  );

  const renderCategoryCard = (category: MissionCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[styles.categoryCard, { backgroundColor: colors.card }]}
      onPress={() => setSelectedCategory(category)}
    >
      <LinearGradient
        colors={[category.color, category.color + '80']}
        style={styles.categoryIcon}
      >
        <MaterialCommunityIcons 
          name={category.icon} 
          size={32} 
          color="white" 
        />
      </LinearGradient>
      <View style={styles.categoryContent}>
        <Text style={[styles.categoryTitle, { color: colors.text }]}>
          {category.title}
        </Text>
        <Text style={[styles.categoryDescription, { color: colors.text + '80' }]}>
          {category.description}
        </Text>
        <Text style={[styles.missionCount, { color: colors.text + '60' }]}>
          {category.missions.length} görev
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderAchievementCard = (achievement: Achievement) => (
    <View 
      key={achievement.id} 
      style={[
        styles.achievementCard, 
        { 
          backgroundColor: achievement.locked ? colors.card + '80' : colors.card,
          opacity: achievement.locked ? 0.7 : 1,
        }
      ]}
    >
      <LinearGradient
        colors={achievement.locked ? ['#666', '#444'] : [achievement.color, achievement.color + '80']}
        style={styles.achievementIcon}
      >
        <MaterialCommunityIcons 
          name={achievement.icon} 
          size={32} 
          color="white" 
        />
      </LinearGradient>
      <Text style={[styles.achievementTitle, { color: colors.text }]}>
        {achievement.title}
      </Text>
      <Text style={[styles.achievementDescription, { color: colors.text + '80' }]}>
        {achievement.description}
      </Text>
      {achievement.locked && (
        <MaterialCommunityIcons 
          name="lock" 
          size={20} 
          color={colors.text + '80'} 
          style={styles.lockIcon}
        />
      )}
    </View>
  );

  if (selectedCategory) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 60 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {selectedCategory.title}
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {selectedCategory.missions.map(renderMissionCard)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: 60 }}>
        <Text style={[styles.title, { color: colors.text }]}>Görevler & Başarımlar</Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'missions' && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => setActiveTab('missions')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'missions' ? colors.primary : colors.text }
            ]}>
              Görevler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'achievements' && { backgroundColor: colors.primary + '20' }
            ]}
            onPress={() => setActiveTab('achievements')}
          >
            <Text style={[
              styles.tabText, 
              { color: activeTab === 'achievements' ? colors.primary : colors.text }
            ]}>
              Başarımlar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        {activeTab === 'missions' ? (
          <View style={styles.categoryContainer}>
            {missionCategories.map(renderCategoryCard)}
          </View>
        ) : (
          <View style={styles.achievementsContainer}>
            {achievements.map(renderAchievementCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoryContainer: {
    gap: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  missionCount: {
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  missionsContainer: {
    gap: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  achievementCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
