import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Image } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Composant Confettis (Version Minimaliste Noir & Blanc)
const FastConfetti = () => {
  const colors = ['#FFD700', '#F1C40F', '#FFF', '#888', '#444'];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(50)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: Math.random() * SH * 0.6,
            left: Math.random() * SW,
            width: 6,
            height: 6,
            backgroundColor: colors[i % colors.length],
            opacity: 0.6,
            transform: [{ rotate: `${Math.random() * 360}deg` }],
          }}
        />
      ))}
    </View>
  );
};

export default function PodiumScreen({ route, navigation }) {
  const { ranking, isGameOver } = route.params || { ranking: [], isGameOver: false };

  const handleBackHome = () => {
    navigation.popToTop();
  };

  const handleResumeGame = () => {
    navigation.goBack();
  };

  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isGameOver && <FastConfetti />}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.podiumTitle, { color: '#FFD700' }]}>
          {isGameOver ? "RÉSULTATS FINAUX" : "CLASSEMENT ACTUEL"}
        </Text>

        {/* PODIUM */}
        {topThree.length > 0 && (
          <View style={styles.podiumStage}>
            {/* 2ème place */}
            {topThree.length >= 2 && (
              <View style={[styles.podiumPlace, styles.podiumSecond]}>
                <View style={styles.podiumAvatar}>
                  {topThree[1].photo ? (
                    <Image source={{ uri: topThree[1].photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarNumber}>2</Text>
                  )}
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].name}</Text>
                <Text style={styles.podiumPlaceText}>2ND</Text>
              </View>
            )}

            {/* 1ère place */}
            {topThree.length >= 1 && (
              <View style={[styles.podiumPlace, styles.podiumFirst]}>
                <View style={styles.podiumAvatar}>
                  {topThree[0].photo ? (
                    <Image source={{ uri: topThree[0].photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarNumber}>1</Text>
                  )}
                </View>
                <Text style={[styles.podiumName, { color: '#000' }]} numberOfLines={1}>{topThree[0].name}</Text>
                <Text style={[styles.podiumPlaceText, { color: '#000' }]}>1ER</Text>
              </View>
            )}

            {/* 3ème place */}
            {topThree.length >= 3 && (
              <View style={[styles.podiumPlace, styles.podiumThird]}>
                <View style={styles.podiumAvatar}>
                  {topThree[2].photo ? (
                    <Image source={{ uri: topThree[2].photo }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarNumber}>3</Text>
                  )}
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].name}</Text>
                <Text style={styles.podiumPlaceText}>3ÈME</Text>
              </View>
            )}
          </View>
        )}

        {/* Liste des autres joueurs */}
        {others.length > 0 && (
          <View style={styles.othersContainer}>
            <Text style={styles.othersTitle}>RESTE DU PELOTON</Text>
            {others.map((player, idx) => (
              <View key={player.id} style={styles.otherCard}>
                <Text style={styles.otherPosition}>{idx + 4}</Text>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.otherAvatar} />
                ) : (
                  <View style={styles.otherAvatarPlaceholder}>
                    <Text style={styles.otherAvatarText}>{player.name.charAt(0)}</Text>
                  </View>
                )}
                <Text style={styles.otherName}>{player.name}</Text>
              </View>
            ))}
          </View>
        )}

        {ranking.length === 0 && (
          <Text style={styles.emptyText}>Aucun coureur classé</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {!isGameOver && (
          <TouchableOpacity style={styles.resumeButton} onPress={handleResumeGame}>
            <Text style={styles.resumeButtonText}>RETOURNER À LA COURSE</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.homeButton, !isGameOver && styles.homeButtonSecondary]}
          onPress={handleBackHome}
        >
          <Text style={styles.homeButtonText}>
            {isGameOver ? "MENU PRINCIPAL" : "QUITTER LA PARTIE"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  podiumTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  podiumStage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 50,
    height: 240,
  },
  podiumPlace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 5,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  podiumFirst: {
    height: 240,
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    elevation: 10,
    zIndex: 2,
  },
  podiumSecond: {
    height: 190,
    backgroundColor: '#111',
  },
  podiumThird: {
    height: 160,
    backgroundColor: '#080808',
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#444',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  podiumName: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  podiumPlaceText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#666',
    fontStyle: 'italic',
  },
  othersContainer: {
    marginTop: 20,
  },
  othersTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 20,
    opacity: 0.6,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111',
  },
  otherPosition: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    width: 40,
  },
  otherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 15,
  },
  otherAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  otherAvatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  otherName: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyText: {
    color: '#444',
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 100,
  },
  buttonContainer: {
    padding: 25,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  resumeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  resumeButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
  },
  homeButton: {
    backgroundColor: '#111',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  homeButtonSecondary: {
    backgroundColor: '#000',
  },
  homeButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
    textAlign: 'center',
    letterSpacing: 2,
    opacity: 0.7,
  },
});