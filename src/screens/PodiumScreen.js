import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
  Animated,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Confettis avec animation de chute
const AnimatedConfetti = () => {
  const pieces = [...Array(40)].map((_, i) => {
    const x = useRef(new Animated.Value(Math.random() * SW)).current;
    const y = useRef(new Animated.Value(-30 - Math.random() * 200)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const colors = ['#FFD700', '#F1C40F', '#fff', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6'];
    const color = colors[i % colors.length];
    const size = 5 + Math.random() * 7;
    const duration = 2000 + Math.random() * 2000;
    const delay = Math.random() * 1500;

    useEffect(() => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(y, { toValue: SH + 40, duration, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(rotate, { toValue: 1, duration, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }, []);

    const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

    return (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          opacity: 0.85,
          left: x._value,
          transform: [{ translateY: y }, { rotate: spin }],
          borderRadius: i % 3 === 0 ? size / 2 : 1,
        }}
      />
    );
  });

  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{pieces}</View>;
};

// Podium place avec animation d'entrée
const PodiumPlace = ({ player, rank, delay }) => {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const heights = { 1: 220, 2: 175, 3: 145 };
  const colors = { 1: '#FFD700', 2: '#A8A9AD', 3: '#CD7F32' };
  const labels = { 1: '🥇 1ER', 2: '🥈 2ND', 3: '🥉 3ÈME' };

  if (!player) return <View style={{ flex: 1 }} />;

  return (
    <Animated.View
      style={[
        styles.podiumPlace,
        {
          height: heights[rank],
          backgroundColor: rank === 1 ? '#1a1400' : '#0d0d0d',
          borderColor: colors[rank],
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={[styles.podiumAvatar, { borderColor: colors[rank] }]}>
        {player.photo ? (
          <Image source={{ uri: player.photo }} style={styles.avatarImage} />
        ) : (
          <Text style={[styles.avatarNumber, { color: colors[rank] }]}>{rank}</Text>
        )}
      </View>
      <Text style={[styles.podiumName, { color: rank === 1 ? '#FFD700' : '#FFF' }]} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={[styles.podiumPlaceText, { color: colors[rank] }]}>{labels[rank]}</Text>
    </Animated.View>
  );
};

export default function PodiumScreen({ route, navigation }) {
  const { ranking, isGameOver } = route.params || { ranking: [], isGameOver: false };

  const titleAnim = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isGameOver && <AnimatedConfetti />}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* TITRE */}
        <Animated.View style={{ opacity: titleAnim, transform: [{ scale: titleScale }], alignItems: 'center', marginBottom: 30 }}>
          {isGameOver ? (
            <>
              <Text style={{ fontSize: 52, marginBottom: 4 }}>🏆</Text>
              <Text style={styles.podiumTitle}>RÉSULTATS</Text>
              <Text style={[styles.podiumTitle, { color: '#FFD700' }]}>FINAUX</Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 36, marginBottom: 4 }}>📊</Text>
              <Text style={[styles.podiumTitle, { color: '#aaa' }]}>CLASSEMENT</Text>
              <Text style={[styles.podiumTitle, { color: '#fff' }]}>EN COURS</Text>
            </>
          )}
        </Animated.View>

        {/* PODIUM */}
        {topThree.length > 0 && (
          <View style={styles.podiumStage}>
            <PodiumPlace player={topThree[1]} rank={2} delay={200} />
            <PodiumPlace player={topThree[0]} rank={1} delay={0} />
            <PodiumPlace player={topThree[2]} rank={3} delay={400} />
          </View>
        )}

        {/* RESTE DU PELOTON */}
        {others.length > 0 && (
          <View style={styles.othersContainer}>
            <Text style={styles.othersTitle}>RESTE DU PELOTON</Text>
            {others.map((player, idx) => (
              <View key={player.id} style={styles.otherCard}>
                <Text style={styles.otherPosition}>#{idx + 4}</Text>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.otherAvatar} />
                ) : (
                  <View style={styles.otherAvatarPlaceholder}>
                    <Text style={styles.otherAvatarText}>{player.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <Text style={styles.otherName}>{player.name}</Text>
              </View>
            ))}
          </View>
        )}

        {ranking.length === 0 && (
          <Text style={styles.emptyText}>Aucun coureur classé pour l'instant</Text>
        )}
      </ScrollView>

      {/* BOUTONS */}
      <View style={styles.buttonContainer}>
        {!isGameOver && (
          <TouchableOpacity style={styles.resumeButton} onPress={() => navigation.goBack()}>
            <Text style={styles.resumeButtonText}>⬅ RETOURNER À LA COURSE</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.homeButton, !isGameOver && styles.homeButtonSecondary]}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.homeButtonText}>
            {isGameOver ? '🏠 MENU PRINCIPAL' : '✖ QUITTER LA PARTIE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  scrollContent: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  podiumTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 3,
    lineHeight: 34,
  },
  podiumStage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
    gap: 6,
  },
  podiumPlace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
  },
  podiumAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarNumber: { fontSize: 22, fontWeight: '900' },
  podiumName: {
    fontWeight: '900',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  podiumPlaceText: { fontSize: 14, fontWeight: '900', fontStyle: 'italic' },

  othersContainer: { marginTop: 10 },
  othersTitle: {
    color: '#444',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  otherPosition: { color: '#555', fontSize: 15, fontWeight: '900', width: 38 },
  otherAvatar: { width: 34, height: 34, borderRadius: 17, marginRight: 12 },
  otherAvatarPlaceholder: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  otherAvatarText: { color: '#FFD700', fontWeight: 'bold', fontSize: 13 },
  otherName: { flex: 1, color: '#ccc', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },

  emptyText: { color: '#333', textAlign: 'center', fontSize: 15, fontStyle: 'italic', marginTop: 80 },

  buttonContainer: {
    padding: 20,
    backgroundColor: '#080808',
    borderTopWidth: 1,
    borderTopColor: '#111',
    gap: 10,
  },
  resumeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  resumeButtonText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  homeButton: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  homeButtonSecondary: { backgroundColor: '#0a0a0a', borderColor: '#1a1a1a' },
  homeButtonText: { color: '#666', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
});