import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Easing
} from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import logoImg from '../../assets/Logo étape.jpeg';

const { width, height } = Dimensions.get('window');

// Un vélo SVG ultra-fidèle au logo original pour l'animation
const GhostBike = ({ opacity }) => (
  <Animated.View style={[styles.ghostBike, { opacity }]}>
    <Svg width="100" height="60" viewBox="0 0 100 60">
      <G stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M25 45 L45 22 H78 L65 45 Z" />
        <Path d="M45 22 L41 12 H49" />
        <Path d="M78 22 L83 10 Q93 10 93 20" />
        <Circle cx="22" cy="45" r="14" />
        <Circle cx="78" cy="45" r="14" />
      </G>
    </Svg>
  </Animated.View>
);

export default function HomeScreen({ navigation }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ghostBikeOpacity = useRef(new Animated.Value(0)).current;
  const bikeMoveX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrée en fondu du logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse sur le bouton JOUER
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePressPlay = () => {
    setIsPlaying(true);

    // SÉQUENCE D'ILLUSION :
    // 1. On affiche le vélo "fantôme" (SVG)
    // 2. On le fait partir
    // 3. On fait disparaître le logo original
    Animated.parallel([
      Animated.timing(ghostBikeOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bikeMoveX, {
        toValue: width,
        duration: 1100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Players');
      // Reset discret
      setTimeout(() => {
        setIsPlaying(false);
        bikeMoveX.setValue(0);
        ghostBikeOpacity.setValue(0);
        logoOpacity.setValue(1);
      }, 500);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* CONTENEUR PRINCIPAL */}
      <View style={styles.main}>

        {/* 1. LOGO ORIGINAL (FIXE) */}
        <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity }]}>
          <Image source={logoImg} style={styles.fullLogo} resizeMode="contain" />

          {/* Texte de fabrication intégré discrètement dans le logo */}
          <View style={styles.michiLabel}>
            <Text style={styles.michiText}>FABRIQUÉ PAR LE MICHI</Text>
          </View>
        </Animated.View>

        {/* 2. LE VÉLO FANTÔME (CELUI QUI S'EN VA) */}
        <Animated.View
          style={[
            styles.animatedContainer,
            { transform: [{ translateX: bikeMoveX }] }
          ]}
        >
          <GhostBike opacity={ghostBikeOpacity} />
        </Animated.View>

        {/* 3. BOUTON JOUER - Invisible au repos, devient le déclencheur sur la roue */}
        {!isPlaying && (
          <View style={styles.playTriggerZone}>
            <TouchableOpacity onPress={handlePressPlay} activeOpacity={0.9}>
              <Animated.View style={[styles.playButton, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.playText}>JOUER</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerVersion}>v2.6 • PREMIUM EDITION</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  main: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: width * 0.95,
    height: 300,
    position: 'relative',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullLogo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  ghostBike: {
    width: 100,
    height: 60,
  },
  animatedContainer: {
    position: 'absolute',
    bottom: '41%', // Positionné sur le vélo du logo original
    left: '15%',
    zIndex: 10,
  },
  playTriggerZone: {
    position: 'absolute',
    bottom: '41%', // Calé sur la roue arrière du logo
    left: '15%',
    zIndex: 20,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
  },
  playText: {
    color: '#000',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  michiLabel: {
    position: 'absolute',
    bottom: 25,
    width: '100%',
    alignItems: 'center',
    paddingRight: '10%',
  },
  michiText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '200',
    letterSpacing: 5,
    opacity: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerVersion: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    opacity: 0.15,
    letterSpacing: 2,
  },
});