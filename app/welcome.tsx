import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: '今日のお手伝いを\n声で報告しよう！',
    description: '面倒なテキスト入力は一切不要！\n「お片付け終わったよ！」と\nマイクに向かって声に出すだけでOK🎤',
    icon: 'mic-circle',
    color: '#00D4FF',
  },
  {
    id: 2,
    title: 'AI鑑定士が褒めてくれる！\n経験値を貯めよう',
    description: 'ギルドのAIがキミの頑張りをしっかり評価。\nRPGのように経験値が貯まって\nどんどんレベルアップしていくぞ！⚔️',
    icon: 'star',
    color: '#FFD700',
  },
  {
    id: 3,
    title: 'パパ・ママと連携して\nご褒美をゲット！',
    description: 'レベルが上がったら、家族が設定した\n「特別なご褒美」を解放しよう！\nさあ、冒険の準備はいいかな？🎁',
    icon: 'gift',
    color: '#FF74B1',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (currentIndex + 1), animated: true });
    } else {
      router.replace('/auth/login');
    }
  };

  const skipToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skipToLogin}>
        <Text style={styles.skipText}>スキップ</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={[styles.iconContainer, { shadowColor: slide.color }]}>
              <Ionicons name={slide.icon as any} size={120} color={slide.color} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
                { backgroundColor: currentIndex === index ? SLIDES[currentIndex].color : '#333' }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: SLIDES[currentIndex].color }]}
          onPress={nextSlide}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? '冒険を始める！' : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  skipButton: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 10 },
  skipText: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconContainer: { marginBottom: 40, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30, elevation: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20, lineHeight: 34 },
  description: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 24 },
  footer: { padding: 40, alignItems: 'center' },
  pagination: { flexDirection: 'row', marginBottom: 30 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 5 },
  activeDot: { width: 20 },
  button: { width: '100%', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
});