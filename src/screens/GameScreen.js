// src/screens/GameScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StatusBar,
  Alert,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window'); // Pour calculer la largeur des cases

export default function GameScreen({ route, navigation }) {
  // 1. Récupération des données (Joueurs + Etape choisie)
  const { players: initialPlayers, stage } = route.params || { 
    players: [{id: '1', name: 'Test'}], 
    stage: { name: 'Étape Test', color: 'red' } 
  };

  // 2. État du Jeu
  const [players, setPlayers] = useState(
    initialPlayers.map(p => ({
      ...p,
      currentLevel: 1,      // Tout le monde commence au niveau 1
      status: 'active',     // active, finished
      finishedTime: null,   // Temps final quand ils ont fini
    }))
  );
  
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRaceFinished, setIsRaceFinished] = useState(false);

  const TOTAL_LEVELS = 5; // Nombre d'intervalles à boire pour finir (modifiable)

  // 3. Le Chronomètre Global (Le temps qui tourne)
  useEffect(() => {
    let interval = null;
    if (!isRaceFinished) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRaceFinished]);

  // Fonction pour convertir les secondes en format "MM:SS"
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 4. Action : Quand un joueur appuie sur sa case (Il a fini son verre)
  const handlePlayerAdvance = (playerId) => {
    setPlayers(currentPlayers => 
      currentPlayers.map(p => {
        if (p.id !== playerId || p.status === 'finished') return p;

        const nextLevel = p.currentLevel + 1;
        
        // Est-ce qu'il a fini la course ?
        if (nextLevel > TOTAL_LEVELS) {
          return { 
            ...p, 
            currentLevel: 'FINISH', 
            status: 'finished',
            finishedTime: secondsElapsed // On fige son temps
          };
        }
        return { ...p, currentLevel: nextLevel };
      })
    );
  };

  // Vérifier si tout le monde a fini
  useEffect(() => {
    if (players.every(p => p.status === 'finished')) {
      setIsRaceFinished(true);
      Alert.alert("COURSE TERMINÉE !", "Tout le monde est arrivé au bar !");
    }
  }, [players]);

  // --- RENDU DE CHAQUE CARTE JOUEUR (ITEM) ---
  const renderPlayerCard = ({ item }) => {
    const isFinished = item.status === 'finished';
    
    // Couleur dynamique : Gris si en cours, Or si fini, Rouge si Bus Balais (à venir)
    const cardColor = isFinished ? '#FFD700' : '#444'; 
    const textColor = isFinished ? '#000' : '#FFF';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: cardColor }]} 
        onPress={() => handlePlayerAdvance(item.id)}
        activeOpacity={0.7}
      >
        {/* Nom du Joueur */}
        <Text style={[styles.playerName, { color: textColor }]} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.cardInfoRow}>
          {/* Niveau (Ex: Lvl 3) */}
          <Text style={[styles.playerLevel, { color: textColor }]}>
             {isFinished ? '🏆' : `Lvl ${item.currentLevel}`}
          </Text>

          {/* Chrono (Temps actuel ou temps final) */}
          <Text style={[styles.playerTime, { color: textColor }]}>
            {isFinished ? formatTime(item.finishedTime) : formatTime(secondsElapsed)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- HAUT : PROFIL DE L'ÉTAPE --- */}
      <View style={styles.headerContainer}>
        <Text style={styles.stageTitle}>{stage.name || "L'ÉTAPE DU JOUR"}</Text>
        
        <View style={styles.graphContainer}>
          {/* Image Placeholder (Remplacer par ton image locale plus tard) */}
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2460/2460831.png' }} 
            style={styles.graphImage}
            resizeMode="contain" // L'image s'adapte sans être coupée
          />
          {/* Petites bulles pour simuler les étapes sur le graphe */}
          <View style={styles.graphOverlay}>
             <Text style={{color:'white', fontSize:10}}>Départ ---------------- Arrivée</Text>
          </View>
        </View>
      </View>

      {/* --- BAS : GRILLE DES JOUEURS --- */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayerCard}
        numColumns={2} // C'est ici qu'on fait les 2 colonnes !
        columnWrapperStyle={styles.row} // Espacement entre les colonnes
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222', // Fond sombre
  },
  // Header
  headerContainer: {
    height: 250, // Hauteur de la zone du haut
    backgroundColor: '#333',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    marginBottom: 20,
    elevation: 10,
    zIndex: 10,
  },
  stageTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  graphContainer: {
    width: '90%',
    height: 150,
    backgroundColor: '#444', // Fond du graphique
    borderRadius: 15,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666',
  },
  graphImage: {
    width: '100%',
    height: '80%',
    tintColor: 'white', // Colore l'image en blanc pour le contraste
  },
  graphOverlay: {
    marginTop: 5,
  },
  
  // Liste
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 50,
  },
  row: {
    justifyContent: 'space-between', // Écarte les cartes gauche/droite
    marginBottom: 15,
  },
  
  // Carte Joueur (Les rectangles arrondis du croquis)
  card: {
    width: (width - 50) / 2, // Calcul mathématique pour que 2 cartes tiennent parfaitement
    padding: 15,
    borderRadius: 15,
    // Ombre légère
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)', // Ligne séparatrice fine
    paddingTop: 8,
  },
  playerLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  playerTime: {
    fontSize: 18,
    fontFamily: 'monospace', // Police style "digital" pour les chiffres
    fontWeight: 'bold',
  },
});