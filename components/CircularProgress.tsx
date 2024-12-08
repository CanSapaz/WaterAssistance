import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  percentage: number;
  waterAmount: number;
  dailyGoal: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  waterAmount, 
  dailyGoal 
}) => {
  const { colors } = useTheme();
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeWidth = 15;
  const size = 200;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: normalizedPercentage,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [normalizedPercentage]);

  const animatedStrokeDashoffset = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const getMessage = () => {
    if (percentage >= 100) {
      return "Günlük Hedefe Ulaştın! 🎉";
    } else if (percentage >= 75) {
      return "Neredeyse Tamam! 💪";
    } else if (percentage >= 50) {
      return "Yarıyı Geçtin! 👍";
    } else if (percentage >= 25) {
      return "İyi Gidiyorsun! 💧";
    }
    return "Hadi Başlayalım! 🚰";
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Svg width={size} height={size}>
          {/* Background Circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.cardBorder}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedStrokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.textContainer}>
          <Text style={[styles.percentage, { color: colors.text }]}>
            {Math.round(normalizedPercentage)}%
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {waterAmount} / {dailyGoal}ml
          </Text>
          <Text style={[styles.message, { color: colors.primary }]}>
            {getMessage()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 16,
    marginTop: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CircularProgress;
