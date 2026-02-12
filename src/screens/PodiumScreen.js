import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, ScrollView, Image, FlatList } from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// Composant Confettis
const FastConfetti = () => {
  const colors = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {[...Array(50)].map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: Math.random() * SH * 0.6,
            left: Math.random() * SW,
            width: 8,
            height: 8,
            backgroundColor: colors[i % colors.length],
            transform: [{ rotate: `${Math.random() * 360}deg` }],
          }}
        />
      ))}
    </View>
  );
};

export default function PodiumScreen({ route, navigation }) {
  // On récupère le classement ET un indicateur si le jeu est fini
  const { ranking, isGameOver } = route.params || { ranking: [], isGameOver: false };

  // Retour Menu Principal (Fin définitive)
  const handleBackHome = () => {
    navigation.popToTop();
  };

  // Retour au jeu (Juste fermer le podium temporairement)
  const handleResumeGame = () => {
    navigation.goBack();
  };

  // Les 3 premiers pour le podium
  const topThree = ranking.slice(0, 3);
  const others = ranking.slice(3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isGameOver && <FastConfetti />}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.podiumTitle}>
          {isGameOver ? "🏆 PODIUM FINAL 🏆" : "🥇 CLASSEMENT PROVISOIRE"}
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
                <Text style={styles.podiumName} numberOfLines={2}>{topThree[1].name}</Text>
                <Text style={styles.podiumMedal}>🥈</Text>
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
                <Text style={styles.podiumName} numberOfLines={2}>{topThree[0].name}</Text>
                <Text style={styles.podiumMedal}>🥇</Text>
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
                <Text style={styles.podiumName} numberOfLines={2}>{topThree[2].name}</Text>
                <Text style={styles.podiumMedal}>🥉</Text>
              </View>
            )}
          </View>
        )}

        {/* Liste des autres joueurs */}
        {others.length > 0 && (
          <View style={styles.othersContainer}>
            <Text style={styles.othersTitle}>Autres coureurs</Text>
            {others.map((player, idx) => (
              <View key={player.id} style={styles.otherCard}>
                <Text style={styles.otherPosition}>{idx + 4}</Text>
                {player.photo ? (
                  <Image source={{ uri: player.photo }} style={styles.otherAvatar} />
                ) : (
                  <View style={styles.otherAvatarPlaceholder}>
                    <Text style={styles.otherAvatarText}>{idx + 4}</Text>
                  </View>
                )}
                <Text style={styles.otherName}>{player.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Si aucun classement */}
        {ranking.length === 0 && (
          <Text style={styles.emptyText}>Aucun coureur classé</Text>
        )}
      </ScrollView>

      {/* --- ZONE DES BOUTONS --- */}
      <View style={styles.buttonContainer}>
        {/* Si le jeu n'est PAS fini, on affiche le bouton retour au jeu */}
        {!isGameOver && (
          <TouchableOpacity style={styles.resumeButton} onPress={handleResumeGame}>
            <Text style={styles.resumeButtonText}>🔙 RETOURNER À LA COURSE</Text>
          </TouchableOpacity>
        )}

        {/* Bouton Quitter */}
        <TouchableOpacity
          style={[styles.homeButton, !isGameOver && styles.homeButtonSecondary]}
          onPress={handleBackHome}
        >
          <Text style={styles.homeButtonText}>
            {isGameOver ? "MENU PRINCIPAL" : "ABANDONNER & QUITTER"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  podiumTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },

  podiumStage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
    height: 200,
  },
  podiumPlace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 5,
  },
  podiumFirst: {
    height: 220, // Increased height
    backgroundColor: '#FFD700',
    borderRadius: 15,
    padding: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  podiumSecond: {
    height: 180, // Increased height
    backgroundColor: '#C0C0C0',
    borderRadius: 15,
    padding: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  podiumThird: {
    height: 160, // Increased height
    backgroundColor: '#CD7F32',
    borderRadius: 15,
    padding: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  podiumAvatar: {
    width: 50, // Slightly smaller to give space to name
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  podiumName: {
    color: '#fff', // White text for better contrast on colored backgrounds
    fontWeight: '900',
    fontSize: 20, // Slightly larger
    textAlign: 'center',
    marginBottom: 0,
    // Add strong black shadow
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  podiumMedal: {
    fontSize: 42, // Larger medals
    marginTop: -5,
  },
  othersContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  othersTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  otherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  otherPosition: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '900',
    width: 30,
    textAlign: 'center',
  },
  otherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  otherAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  otherAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  otherName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic',
    marginTop: 50,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  resumeButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
    marginBottom: 15,
  },
  resumeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  homeButton: {
    backgroundColor: '#E30513',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  homeButtonSecondary: {
    backgroundColor: '#333',
  },
  homeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});