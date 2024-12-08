import { StyleSheet, View, Text, TouchableOpacity, Animated, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import { format, subDays, startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek, 
  subMonths, startOfMonth, endOfMonth, subYears, startOfYear, endOfYear, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ref, onValue, get } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useAuth } from '../../context/auth';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

interface Period {
  id: TimePeriod;
  label: string;
}

interface ChartDataset {
  data: number[];
  color: (opacity?: number) => string;
  strokeWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface WaterData {
  day: ChartData;
  week: ChartData;
  month: ChartData;
  year: ChartData;
}

const initialChartState = {
  data: new Array(6).fill(0),
  labels: [
    '00:00-04:00',
    '04:00-08:00',
    '08:00-12:00',
    '12:00-16:00',
    '16:00-20:00',
    '20:00-24:00'
  ]
};

const initialWaterData: WaterData = {
  day: {
    labels: ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'],
    datasets: [{
      data: new Array(6).fill(0),
      color: (opacity = 1) => '#4facfe',
      strokeWidth: 3
    }]
  },
  week: {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [{
      data: new Array(7).fill(0),
      color: (opacity = 1) => '#4facfe',
      strokeWidth: 3
    }]
  },
  month: {
    labels: Array.from({length: 30}, (_, i) => `${i + 1}`),
    datasets: [{
      data: new Array(30).fill(0),
      color: (opacity = 1) => '#4facfe',
      strokeWidth: 3
    }]
  },
  year: {
    labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    datasets: [{
      data: new Array(12).fill(0),
      color: (opacity = 1) => '#4facfe',
      strokeWidth: 3
    }]
  }
};

const periods: Period[] = [
  { id: 'day', label: 'Gün' },
  { id: 'week', label: 'Hafta' },
  { id: 'month', label: 'Ay' },
  { id: 'year', label: 'Yıl' },
];

const { width: screenWidth } = Dimensions.get('window');
const CONTAINER_PADDING = 16;
const SELECTOR_WIDTH = screenWidth - (CONTAINER_PADDING * 2);
const BUTTON_WIDTH = SELECTOR_WIDTH / 4;
const DATE_CONTAINER_SIZE = 120;
const CHART_CONTAINER_SIZE = screenWidth - (CONTAINER_PADDING * 2);

export default function AnalysisScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterData, setWaterData] = useState<WaterData>(initialWaterData);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [dailyChange, setDailyChange] = useState({ percentage: 0, isIncrease: false });
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [weeklyChange, setWeeklyChange] = useState({ percentage: 0, isIncrease: false });
  const [monthlyGoal, setMonthlyGoal] = useState({ 
    current: 0,
    percentage: 0,
    change: { percentage: 0, isIncrease: false }
  });
  const [consistency, setConsistency] = useState({
    percentage: 0,
    change: { percentage: 0, isIncrease: false }
  });
  const [insights, setInsights] = useState({
    dailyAverage: 0,
    monthlyChange: { percentage: 0, isIncrease: true },
    bestTime: '',
    worstTime: ''
  });
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Test log
  useEffect(() => {
    console.log('TEST LOG - Analysis Screen Loaded');
    console.log('Current user:', user?.uid);
  }, []);

  // Veri yükleme fonksiyonları
  const loadDayData = async (date: Date) => {
    if (!user?.uid) return;

    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const waterRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
      
      console.log('Loading data for date:', {
        date: dateStr,
        userId: user.uid
      });
      
      const snapshot = await get(waterRef);
      console.log('Found data:', snapshot.val());

      // 4 saatlik dilimlere böl (6 dilim)
      const timeSlots = new Array(6).fill(0);
      const labels = [
        '00:00-04:00',
        '04:00-08:00',
        '08:00-12:00',
        '12:00-16:00',
        '16:00-20:00',
        '20:00-24:00'
      ];

      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.amount && data.updatedAt) {
          const drinkTime = new Date(data.updatedAt);
          const hour = drinkTime.getHours();
          const slotIndex = Math.floor(hour / 4);
          console.log('Processing drink:', {
            time: drinkTime,
            hour,
            slotIndex,
            amount: data.amount
          });
          if (slotIndex >= 0 && slotIndex < 6) {
            timeSlots[slotIndex] += Number(data.amount) || 0;
          }
        }
      }

      console.log('Time slots data:', timeSlots);

      setWaterData(prev => ({
        ...prev,
        day: {
          labels: labels,
          datasets: [{
            data: timeSlots.map(val => val / 1000), // ml'yi L'ye çevir
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));

    } catch (error) {
      console.error('Error loading day data:', error);
      setWaterData(prev => ({
        ...prev,
        day: {
          labels: [
            '00:00-04:00',
            '04:00-08:00',
            '08:00-12:00',
            '12:00-16:00',
            '16:00-20:00',
            '20:00-24:00'
          ],
          datasets: [{
            data: new Array(6).fill(0),
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    }
  };

  const loadWeekData = async (date: Date) => {
    try {
      const start = startOfWeek(date, { locale: tr });
      const end = endOfWeek(date, { locale: tr });
      const waterRef = ref(database, `waterLog/${user.uid}`);
      const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
      const dailyData = new Array(7).fill(0);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        console.log('Checking date:', dateStr);
        const snapshot = await get(waterLogRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data.amount === 'number') {
            const dayIndex = d.getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            dailyData[adjustedIndex] += data.amount;
            console.log(`Added ${data.amount}ml from ${dateStr}. New total: ${dailyData[adjustedIndex]}ml`);
          }
        }
      }

      setWaterData(prev => ({
        ...prev,
        week: {
          labels,
          datasets: [{
            data: dailyData,
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    } catch (error) {
      console.error('Error loading week data:', error);
      setWaterData(prev => ({
        ...prev,
        week: {
          labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
          datasets: [{
            data: new Array(7).fill(0),
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    }
  };

  const loadMonthData = async (date: Date) => {
    try {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const waterRef = ref(database, `waterLog/${user.uid}`);
      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      const dailyData = new Array(daysInMonth).fill(0);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        console.log('Checking date:', dateStr);
        const snapshot = await get(waterLogRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data.amount === 'number') {
            const day = d.getDate();
            dailyData[day - 1] += data.amount;
            console.log(`Added ${data.amount}ml from ${dateStr}. New total: ${dailyData[day - 1]}ml`);
          }
        }
      }

      // Veriyi 5'er günlük dilimlere böl
      const chartData: number[] = [];
      const labels: string[] = [];
      for (let i = 0; i < daysInMonth; i += 5) {
        const sum = dailyData.slice(i, Math.min(i + 5, daysInMonth)).reduce((a, b) => a + b, 0);
        chartData.push(sum || 0); // 0 ekleyerek NaN olmasını engelle
        labels.push((i + 1).toString());
      }

      // Veri yoksa 0 değerleri göster
      if (chartData.every(val => val === 0)) {
        setWaterData(prev => ({
          ...prev,
          month: {
            labels,
            datasets: [{
              data: new Array(chartData.length).fill(0),
              color: (opacity = 1) => colors.primary,
              strokeWidth: 3
            }]
          }
        }));
      } else {
        setWaterData(prev => ({
          ...prev,
          month: {
            labels,
            datasets: [{
              data: chartData,
              color: (opacity = 1) => colors.primary,
              strokeWidth: 3
            }]
          }
        }));
      }
    } catch (error) {
      console.error('Error loading month data:', error);
      // Hata durumunda boş veri göster
      setWaterData(prev => ({
        ...prev,
        month: {
          labels: [],
          datasets: [{
            data: [],
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    }
  };

  const loadYearData = async (date: Date) => {
    try {
      const start = startOfYear(date);
      const end = endOfYear(date);
      const waterRef = ref(database, `waterLog/${user.uid}`);
      const monthlyData = new Array(12).fill(0);
      const labels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

      for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        console.log('Checking date:', dateStr);
        const snapshot = await get(waterLogRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data.amount === 'number') {
            const month = d.getMonth();
            monthlyData[month] += data.amount;
            console.log(`Added ${data.amount}ml from ${dateStr}. New total: ${monthlyData[month]}ml`);
          }
        }
      }

      setWaterData(prev => ({
        ...prev,
        year: {
          labels,
          datasets: [{
            data: monthlyData,
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    } catch (error) {
      console.error('Error loading year data:', error);
      setWaterData(prev => ({
        ...prev,
        year: {
          labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
          datasets: [{
            data: new Array(12).fill(0),
            color: (opacity = 1) => colors.primary,
            strokeWidth: 3
          }]
        }
      }));
    }
  };

  // Günlük ortalama su tüketimini hesaplama
  const calculateDailyAverage = async () => {
    if (!user?.uid) return;

    try {
      const waterRef = ref(database, `waterLog/${user.uid}`);
      let totalAmount = 0;
      let previousTotal = 0;
      const daysMap = new Map();
      const previousDaysMap = new Map();
      const now = new Date();
      const thirtyDaysAgo = subDays(now, 30);
      const sixtyDaysAgo = subDays(now, 60);

      const snapshot = await get(waterRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const date in data) {
          const entryDate = new Date(date);
          const amount = Number(data[date].amount);
          
          if (!isNaN(amount) && amount > 0) {
            // Son 30 gün için
            if (entryDate >= thirtyDaysAgo && entryDate <= now) {
              if (!daysMap.has(date)) {
                daysMap.set(date, amount);
              } else {
                daysMap.set(date, daysMap.get(date) + amount);
              }
              totalAmount += amount;
            }
            // Önceki 30 gün için
            else if (entryDate >= sixtyDaysAgo && entryDate < thirtyDaysAgo) {
              if (!previousDaysMap.has(date)) {
                previousDaysMap.set(date, amount);
              } else {
                previousDaysMap.set(date, previousDaysMap.get(date) + amount);
              }
              previousTotal += amount;
            }
          }
        }
      }

      const currentDays = daysMap.size || 1;
      const previousDays = previousDaysMap.size || 1;
      
      const currentAverage = totalAmount / currentDays;
      const previousAverage = previousTotal / previousDays;

      // Değişim yüzdesini hesapla
      let changePercentage = 0;
      let isIncrease = false;

      if (previousAverage > 0) {
        changePercentage = ((currentAverage - previousAverage) / previousAverage) * 100;
        isIncrease = changePercentage > 0;
      } else if (currentAverage > 0) {
        changePercentage = 100;
        isIncrease = true;
      }

      console.log('Daily averages:', {
        current: currentAverage,
        previous: previousAverage,
        changePercentage,
        isIncrease
      });

      setDailyAverage(currentAverage);
      setDailyChange({
        percentage: Math.abs(Math.round(changePercentage)),
        isIncrease
      });

    } catch (error) {
      console.error('Error calculating daily average:', error);
      setDailyAverage(0);
      setDailyChange({ percentage: 0, isIncrease: false });
    }
  };

  // Haftalık toplam su tüketimini hesaplama
  const calculateWeeklyTotal = async () => {
    if (!user?.uid) return;

    try {
      const now = new Date();
      console.log('Current date:', now.toISOString());
      
      // Bu haftanın başlangıcı (Pazartesi) ve sonu (Pazar)
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 1 = Pazartesi
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      // Önceki haftanın başlangıcı ve sonu
      const prevWeekStart = subWeeks(weekStart, 1);
      const prevWeekEnd = subWeeks(weekEnd, 1);

      console.log('Week ranges:', {
        currentWeek: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
        previousWeek: {
          start: prevWeekStart.toISOString(),
          end: prevWeekEnd.toISOString(),
        }
      });

      // Bu haftanın toplamını hesapla
      let currentWeekTotal = 0;
      for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        const snapshot = await get(waterLogRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data.amount === 'number') {
            currentWeekTotal += data.amount;
          }
        }
      }

      // Önceki haftanın toplamını hesapla
      let previousWeekTotal = 0;
      for (let d = new Date(prevWeekStart); d <= prevWeekEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        const snapshot = await get(waterLogRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data && typeof data.amount === 'number') {
            previousWeekTotal += data.amount;
          }
        }
      }

      // Değişim yüzdesini hesapla
      let changePercentage = 0;
      let isIncrease = false;

      if (previousWeekTotal > 0) {
        changePercentage = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
        isIncrease = changePercentage > 0;
      } else if (currentWeekTotal > 0) {
        // Eğer önceki hafta 0 ise ve bu hafta bir değer varsa, %100 artış
        changePercentage = 100;
        isIncrease = true;
      }

      console.log('Weekly totals:', {
        currentWeek: currentWeekTotal,
        previousWeek: previousWeekTotal,
        changePercentage,
        isIncrease
      });

      setWeeklyTotal(currentWeekTotal);
      setWeeklyChange({
        percentage: Math.abs(Math.round(changePercentage)),
        isIncrease
      });
    } catch (error) {
      console.error('Error calculating weekly total:', error);
      setWeeklyTotal(0);
      setWeeklyChange({ percentage: 0, isIncrease: false });
    }
  };

  // Aylık hedefi hesapla
  const calculateMonthlyGoal = async () => {
    if (!user?.uid) return;

    try {
      // Kullanıcının günlük su ihtiyacını al
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) return;

      const userData = userSnapshot.val();
      const dailyWaterGoal = userData.dailyWaterGoal || 2500; // ml cinsinden, varsayılan 2.5L

      // Şu anki ay için hesaplama
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      // Ay sonuna kadar kalan günler (bugün dahil)
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const remainingDays = lastDayOfMonth - currentDay + 1;
      
      // Bu ay için toplam hedef
      const monthlyTarget = dailyWaterGoal * lastDayOfMonth;
      
      // Bu ayki toplam su tüketimi
      let currentMonthTotal = 0;
      const currentMonthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const currentMonthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
      
      // Önceki ay için hesaplama
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastDayOfPrevMonth = new Date(previousYear, previousMonth + 1, 0).getDate();
      const previousMonthTarget = dailyWaterGoal * lastDayOfPrevMonth;
      
      let previousMonthTotal = 0;
      const previousMonthStart = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-01`;
      const previousMonthEnd = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-${String(lastDayOfPrevMonth).padStart(2, '0')}`;

      // Su tüketim verilerini al
      const waterRef = ref(database, `waterLog/${user.uid}`);
      const snapshot = await get(waterRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const date in data) {
          const amount = Number(data[date].amount);
          if (!isNaN(amount) && amount > 0) {
            // Bu ayki tüketim
            if (date >= currentMonthStart && date <= currentMonthEnd) {
              currentMonthTotal += amount;
            }
            // Önceki ayki tüketim
            else if (date >= previousMonthStart && date <= previousMonthEnd) {
              previousMonthTotal += amount;
            }
          }
        }
      }

      // Hedef tamamlanma yüzdesi
      const currentPercentage = Math.round((currentMonthTotal / monthlyTarget) * 100);
      const previousPercentage = Math.round((previousMonthTotal / previousMonthTarget) * 100);
      
      // Değişim yüzdesi
      let changePercentage = 0;
      let isIncrease = false;

      if (previousPercentage > 0) {
        changePercentage = currentPercentage - previousPercentage;
        isIncrease = changePercentage > 0;
      } else if (currentPercentage > 0) {
        changePercentage = currentPercentage;
        isIncrease = true;
      }

      console.log('Monthly goal calculation:', {
        monthlyTarget,
        currentMonthTotal,
        currentPercentage,
        previousPercentage,
        changePercentage,
        isIncrease
      });

      setMonthlyGoal({
        current: monthlyTarget,
        percentage: currentPercentage,
        change: {
          percentage: Math.abs(changePercentage),
          isIncrease
        }
      });

    } catch (error) {
      console.error('Error calculating monthly goal:', error);
      setMonthlyGoal({
        current: 0,
        percentage: 0,
        change: { percentage: 0, isIncrease: false }
      });
    }
  };

  // Aylık hedefi hesapla
  useEffect(() => {
    if (user?.uid) {
      calculateMonthlyGoal();
    }
  }, [user?.uid]);

  // Real-time updates için listener'ı güncelle
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up real-time listener for user:', user.uid);

    const currentDate = new Date();
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
    
    // Gerçek zamanlı güncellemeler için listener
    const unsubscribe = onValue(waterLogRef, (snapshot) => {
      console.log('Received update:', snapshot.val());
      calculateWeeklyTotal();
    });

    // İlk yükleme
    calculateWeeklyTotal();

    return () => {
      console.log('Cleaning up listener');
      unsubscribe();
    };
  }, [user?.uid]);

  // Günlük ortalamayı hesapla
  useEffect(() => {
    if (user?.uid) {
      calculateDailyAverage();
    }
  }, [user?.uid]);

  // Haftalık toplamı hesapla
  useEffect(() => {
    if (user?.uid) {
      calculateWeeklyTotal();
    }
  }, [user?.uid]);

  // Initial data load
  useEffect(() => {
    if (user?.uid) {
      loadDayData(selectedDate);
    }
  }, [selectedPeriod, selectedDate, user?.uid]);

  // Veri yükleme tetikleyicileri
  useEffect(() => {
    if (!user?.uid) return;

    const loadData = async () => {
      switch (selectedPeriod) {
        case 'day':
          await loadDayData(selectedDate);
          break;
        case 'week':
          await loadWeekData(selectedDate);
          break;
        case 'month':
          await loadMonthData(selectedDate);
          break;
        case 'year':
          await loadYearData(selectedDate);
          break;
      }
    };

    loadData();
  }, [selectedPeriod, selectedDate, user?.uid]);

  // Tutarlılık hesaplama
  const calculateConsistency = async () => {
    if (!user?.uid) return;

    try {
      // Kullanıcının günlük su ihtiyacını al
      const userRef = ref(database, `users/${user.uid}`);
      const userSnapshot = await get(userRef);
      if (!userSnapshot.exists()) return;

      const userData = userSnapshot.val();
      const dailyWaterGoal = userData.dailyWaterGoal || 2500; // ml cinsinden, varsayılan 2.5L

      // Bu ay ve önceki ay için tarih hesaplamaları
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      // Ay sonuna kadar kalan günler (bugün dahil)
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const remainingDays = lastDayOfMonth - currentDay + 1;
      
      // Bu ay için toplam hedef
      const monthlyTarget = dailyWaterGoal * lastDayOfMonth;
      
      // Bu ayki toplam su tüketimi
      let currentMonthTotal = 0;
      const currentMonthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
      const currentMonthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
      
      // Önceki ay için hesaplama
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastDayOfPrevMonth = new Date(previousYear, previousMonth + 1, 0).getDate();
      const previousMonthTarget = dailyWaterGoal * lastDayOfPrevMonth;
      
      let previousMonthTotal = 0;
      const previousMonthStart = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-01`;
      const previousMonthEnd = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-${String(lastDayOfPrevMonth).padStart(2, '0')}`;

      // Su tüketim verilerini al
      const waterRef = ref(database, `waterLog/${user.uid}`);
      const snapshot = await get(waterRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        for (const date in data) {
          const amount = Number(data[date].amount);
          if (!isNaN(amount) && amount > 0) {
            // Bu ayki tüketim
            if (date >= currentMonthStart && date <= currentMonthEnd) {
              currentMonthTotal += amount;
            }
            // Önceki ayki tüketim
            else if (date >= previousMonthStart && date <= previousMonthEnd) {
              previousMonthTotal += amount;
            }
          }
        }
      }

      // Hedef tamamlanma yüzdesi
      const currentPercentage = Math.round((currentMonthTotal / monthlyTarget) * 100);
      const previousPercentage = Math.round((previousMonthTotal / previousMonthTarget) * 100);
      
      // Değişim yüzdesi
      let changePercentage = 0;
      let isIncrease = false;

      if (previousPercentage > 0) {
        changePercentage = currentPercentage - previousPercentage;
        isIncrease = changePercentage > 0;
      } else if (currentPercentage > 0) {
        changePercentage = currentPercentage;
        isIncrease = true;
      }

      console.log('Monthly goal calculation:', {
        monthlyTarget,
        currentMonthTotal,
        currentPercentage,
        previousPercentage,
        changePercentage,
        isIncrease
      });

      setMonthlyGoal({
        current: monthlyTarget,
        percentage: currentPercentage,
        change: {
          percentage: Math.abs(changePercentage),
          isIncrease
        }
      });

    } catch (error) {
      console.error('Error calculating monthly goal:', error);
      setMonthlyGoal({
        current: 0,
        percentage: 0,
        change: { percentage: 0, isIncrease: false }
      });
    }
  };

  // En iyi ve en kötü zamanı hesapla
  const calculateBestWorstTimes = (timeSlots: number[], labels: string[]) => {
    let maxIndex = 0;
    let minIndex = 0;
    let maxValue = timeSlots[0];
    let minValue = timeSlots[0];

    timeSlots.forEach((value, index) => {
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
      }
      if (value < minValue || (minValue === 0 && value > 0)) {
        minValue = value;
        minIndex = index;
      }
    });

    return {
      bestTime: labels[maxIndex],
      worstTime: labels[minIndex]
    };
  };

  // İçgörüleri güncelle
  const updateInsights = async () => {
    try {
      if (!user?.uid) return;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Aylık toplam su tüketimi
      let monthlyTotal = 0;
      let daysWithData = 0;
      
      // Ay başından bugüne kadar olan günler
      const currentDay = now.getDate();
      
      for (let day = 1; day <= currentDay; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        const snapshot = await get(dayRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.amount) {
            monthlyTotal += data.amount;
            daysWithData++;
          }
        }
      }

      // Günlük ortalama
      const dailyAverage = daysWithData > 0 ? monthlyTotal / daysWithData : 0;

      // Önceki ay ile karşılaştırma
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const previousMonthDays = new Date(previousYear, previousMonth + 1, 0).getDate();
      
      let previousMonthTotal = 0;
      let previousDaysWithData = 0;
      
      for (let day = 1; day <= previousMonthDays; day++) {
        const dateStr = `${previousYear}-${String(previousMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
        
        const snapshot = await get(dayRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.amount) {
            previousMonthTotal += data.amount;
            previousDaysWithData++;
          }
        }
      }

      const previousDailyAverage = previousDaysWithData > 0 ? previousMonthTotal / previousDaysWithData : 0;
      const monthlyChangePercentage = previousDailyAverage > 0 
        ? ((dailyAverage - previousDailyAverage) / previousDailyAverage) * 100 
        : 100;

      // En iyi ve en kötü zamanlar
      const { bestTime, worstTime } = calculateBestWorstTimes(
        waterData.day.datasets[0].data,
        waterData.day.labels
      );

      setInsights({
        dailyAverage: dailyAverage / 1000, // L'ye çevir
        monthlyChange: {
          percentage: Math.abs(monthlyChangePercentage),
          isIncrease: monthlyChangePercentage >= 0
        },
        bestTime,
        worstTime
      });

    } catch (error) {
      console.error('Error updating insights:', error);
    }
  };

  // Veriler değiştiğinde içgörüleri güncelle
  useEffect(() => {
    updateInsights();
  }, [waterData]);

  // Tutarlılığı hesapla
  useEffect(() => {
    if (user?.uid) {
      calculateConsistency();
    }
  }, [user?.uid]);

  // Real-time updates için listener'ı güncelle
  useEffect(() => {
    if (!user?.uid) return;

    console.log('Setting up real-time listener for user:', user.uid);

    const currentDate = new Date();
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const waterLogRef = ref(database, `waterLog/${user.uid}/${dateStr}`);
    
    // Gerçek zamanlı güncellemeler için listener
    const unsubscribe = onValue(waterLogRef, (snapshot) => {
      console.log('Received update:', snapshot.val());
      calculateWeeklyTotal();
      calculateDailyAverage();
      calculateMonthlyGoal();
      calculateConsistency();
    });

    // İlk yükleme
    calculateWeeklyTotal();
    calculateDailyAverage();
    calculateMonthlyGoal();
    calculateConsistency();

    return () => {
      console.log('Cleaning up listener');
      unsubscribe();
    };
  }, [user?.uid]);

  const formatDate = (date: Date) => {
    const today = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        if (date.toDateString() === today.toDateString()) {
          return 'Bugün';
        } else if (date.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString()) {
          return 'Dün';
        } else if (date.toDateString() === new Date(today.setDate(today.getDate() + 2)).toDateString()) {
          return 'Yarın';
        } else {
          return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }

      case 'week': {
        const currentWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const dateWeekStart = new Date(date);
        dateWeekStart.setDate(date.getDate() - date.getDay());
        const dateWeekEnd = new Date(dateWeekStart);
        dateWeekEnd.setDate(dateWeekStart.getDate() + 6);
        
        if (dateWeekStart.toDateString() === currentWeekStart.toDateString()) {
          return 'Bu Hafta';
        } else if (
          dateWeekStart.toDateString() === new Date(currentWeekStart.setDate(currentWeekStart.getDate() - 7)).toDateString()
        ) {
          return 'Geçen Hafta';
        } else if (
          dateWeekStart.toDateString() === new Date(currentWeekStart.setDate(currentWeekStart.getDate() + 14)).toDateString()
        ) {
          return 'Gelecek Hafta';
        } else {
          return `${dateWeekStart.getDate()} - ${dateWeekEnd.getDate()} ${dateWeekStart.toLocaleDateString('tr-TR', { month: 'long' })}`;
        }
      }

      case 'month': {
        const currentMonth = today.getMonth();
        const selectedMonth = date.getMonth();
        const currentYear = today.getFullYear();
        const selectedYear = date.getFullYear();
        
        if (currentMonth === selectedMonth && currentYear === selectedYear) {
          return 'Bu Ay';
        } else if (
          selectedYear === currentYear && selectedMonth === currentMonth - 1
        ) {
          return 'Geçen Ay';
        } else if (
          selectedYear === currentYear && selectedMonth === currentMonth + 1
        ) {
          return 'Gelecek Ay';
        } else {
          const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
          return `1 - ${lastDay} ${date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`;
        }
      }

      case 'year': {
        const currentYear = today.getFullYear();
        const selectedYear = date.getFullYear();
        
        if (currentYear === selectedYear) {
          return 'Bu Yıl';
        } else if (selectedYear === currentYear - 1) {
          return 'Geçen Yıl';
        } else if (selectedYear === currentYear + 1) {
          return 'Gelecek Yıl';
        } else {
          return `Ocak - Aralık ${selectedYear}`;
        }
      }
    }
  };

  const navigateDate = (direction: 'forward' | 'backward') => {
    const newDate = new Date(selectedDate);
    
    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'forward' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'forward' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'forward' ? 1 : -1));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'forward' ? 1 : -1));
        break;
    }
    
    setSelectedDate(newDate);
  };

  const handlePeriodChange = (periodId: TimePeriod) => {
    setSelectedPeriod(periodId);
    setSelectedDate(new Date());
    const toValue = periods.findIndex(p => p.id === periodId) * BUTTON_WIDTH;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    handlePeriodChange('day');
  }, []);

  const handleAddRecord = () => {
    setAddModalVisible(true);
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    strokeWidth: 3,
    propsForBackgroundLines: {
      strokeDasharray: [], // Düz çizgiler için boş array
      stroke: colors.cardBorder,
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fill: colors.text,
    },
    decimalPlaces: 0,
    count: 4, // Y ekseni değer sayısı azaltıldı
  };

  const dummyData = [
    { id: 1, time: '14:30', amount: 250, type: 'water', note: 'After workout' },
    { id: 2, time: '12:15', amount: 330, type: 'water', note: 'With lunch' },
    { id: 3, time: '09:45', amount: 200, type: 'water', note: 'Morning routine' },
  ];

  const renderTimelineItem = (item) => (
    <View key={item.id} style={styles.timelineItem}>
      <View style={styles.timelineLine} />
      <View style={styles.timelineDot} />
      <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
        <View style={styles.timelineHeader}>
          <Text style={[styles.timelineTime, { color: colors.text }]}>{item.time}</Text>
          <Text style={[styles.timelineAmount, { color: colors.primary }]}>
            {item.amount}ml
          </Text>
        </View>
        <Text style={[styles.timelineNote, { color: colors.text + '80' }]}>{item.note}</Text>
        <View style={styles.timelineActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="delete" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const weeklyData = {
    labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    datasets: [
      {
        data: [2.1, 2.5, 1.8, 2.3, 2.7, 2.2, 2.4],
      },
    ],
  };

  const monthlyData = {
    labels: ['1H', '2H', '3H', '4H'],
    datasets: [
      {
        data: [2.3, 2.1, 2.6, 2.4],
      },
    ],
  };

  const hourlyData = {
    labels: ['6', '9', '12', '15', '18', '21'],
    datasets: [
      {
        data: [0.3, 0.5, 0.7, 0.6, 0.4, 0.2],
      },
    ],
  };

  const renderStatCard = (title: string, value: string, icon: string, trend: number) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <View style={styles.trendContainer}>
        <MaterialCommunityIcons 
          name={trend > 0 ? 'trending-up' : 'trending-down'} 
          size={20} 
          color={trend > 0 ? '#4CAF50' : '#f44336'} 
        />
        <Text style={[
          styles.trendText, 
          { color: trend > 0 ? '#4CAF50' : '#f44336' }
        ]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    </View>
  );

  const renderInsightCard = (title: string, description: string, icon: string) => (
    <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={['#4facfe', '#00f2fe']}
        style={styles.insightIcon}
      >
        <MaterialCommunityIcons name={icon} size={24} color="white" />
      </LinearGradient>
      <View style={styles.insightContent}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.insightDescription, { color: colors.text + '80' }]}>
          {description}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background, paddingTop: 60 }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Geçmiş</Text>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: colors.card }]} 
          onPress={handleAddRecord}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {renderStatCard('Günlük Ortalama', `${(dailyAverage / 1000).toFixed(1)}L`, 'cup-water', dailyChange.percentage * (dailyChange.isIncrease ? 1 : -1))}
        {renderStatCard('Haftalık Toplam', `${(weeklyTotal / 1000).toFixed(1)}L`, 'calendar-week', weeklyChange.percentage * (weeklyChange.isIncrease ? 1 : -1))}
        {renderStatCard('Aylık Hedef', `%${monthlyGoal.percentage}`, 'target', monthlyGoal.change.percentage * (monthlyGoal.change.isIncrease ? 1 : -1))}
        {renderStatCard('Tutarlılık', `%${consistency.percentage}`, 'chart-line-variant', consistency.change.percentage * (consistency.change.isIncrease ? 1 : -1))}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedPeriod === 'day' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => handlePeriodChange('day')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedPeriod === 'day' ? colors.primary : colors.text + '80' }
          ]}>
            Günlük
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedPeriod === 'week' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => handlePeriodChange('week')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedPeriod === 'week' ? colors.primary : colors.text + '80' }
          ]}>
            Haftalık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedPeriod === 'month' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedPeriod === 'month' ? colors.primary : colors.text + '80' }
          ]}>
            Aylık
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.tab, 
            selectedPeriod === 'year' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => handlePeriodChange('year')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedPeriod === 'year' ? colors.primary : colors.text + '80' }
          ]}>
            Yıllık
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={{
            labels: waterData[selectedPeriod].labels,
            datasets: waterData[selectedPeriod].datasets
          }}
          width={Dimensions.get('window').width - 32}
          height={220}
          yAxisLabel=""
          yAxisSuffix="L"
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            fillShadowGradientOpacity: 1,
            fillShadowGradient: colors.primary,
            decimalPlaces: 1,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.text,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.border,
              strokeWidth: 1
            },
            propsForLabels: {
              fontSize: 10
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          showBarTops={false}
          showValuesOnTopOfBars={true}
          withInnerLines={true}
          fromZero={true}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>İçgörüler</Text>
      <View style={styles.insightsContainer}>
        {renderInsightCard(
          'En Verimli Zaman',
          `${insights.bestTime} saatleri arasında en çok su içiyorsunuz. En az tüketim ${insights.worstTime} saatleri arasında.`,
          'clock-time-four'
        )}
        {renderInsightCard(
          'Aylık Trend',
          `Bu ayki günlük su tüketiminiz geçen aya göre %${insights.monthlyChange.percentage.toFixed(0)} ${insights.monthlyChange.isIncrease ? 'artış' : 'azalış'} gösterdi.`,
          insights.monthlyChange.isIncrease ? 'trending-up' : 'trending-down'
        )}
        {renderInsightCard(
          'İyileştirme Önerisi',
          `${insights.worstTime} saatleri arasında su tüketiminizi artırmanızı öneririz.`,
          'lightbulb-on'
        )}
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Alt kısımda ekstra padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightSubtext: {
    fontSize: 14,
  },
  timelineContainer: {
    paddingTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 0,
    bottom: -24,
    width: 2,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4facfe',
    marginTop: 6,
    marginRight: 12,
    zIndex: 1,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineNote: {
    fontSize: 14,
    marginBottom: 12,
  },
  timelineActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  card: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
