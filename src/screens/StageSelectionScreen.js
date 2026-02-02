// src/screens/StageSelectionScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  StatusBar,
  ScrollView
} from 'react-native';

// --- DONNÉES DES ÉTAPES ---
const STAGES = [
  { 
    id: '1', 
    name: 'La Plage', 
    difficulty: 'Facile', 
    color: '#4CAF50', // Vert
    desc: 'Une balade tranquille au soleil. Idéal pour les débutants.',
    profile: '🛣️ Plat  ➡️  🛣️ Plat  ➡️  Sprint ⚡'
  },
  { 
    id: '2', 
    name: 'Col du Galibier', 
    difficulty: 'Moyen', 
    color: '#FF9800', // Orange
    desc: 'Ça commence à grimper. Gérez votre hydratation !',
    profile: '🛣️ Plat  ↗️  Montée  ↘️  Descente'
  },
  { 
    id: '3', 
    name: 'Djebel Toubkal', 
    difficulty: 'Difficile', 
    color: '#E91E63', // Rose foncé
    desc: 'Le plus haut sommet d’Afrique du Nord. L’oxygène se fait rare.',
    profile: '↗️ Montée  ↗️  Montée  ➡️  Plat'
  },
  { 
    id: '4', 
    name: 'L\'Everest', 
    difficulty: 'Extrême', 
    color: '#E30513', // Rouge Sang
    desc: 'Le toit du monde. Seuls les vrais grimpeurs survivront. Préparez les sacs.',
    profile: '⛰️ Mur  ↗️  Montée  ⛰️  Mur Final'
  }
];

export default function StageSelectionScreen({ navigation, route }) {
  // On récupère la liste des joueurs passée depuis la page précédente
  const { players } = route.params || { players: [] }; 

  const [selectedStage, setSelectedStage] = useState(null); // Quelle étape est sélectionnée ?
  const [modalVisible, setModalVisible] = useState(false);  // Afficher les infos ?
  const [infoStage, setInfoStage] = useState(null);         // Les infos de quelle étape ?

  // Ouvrir les infos
  const openInfo = (stage) => {
    setInfoStage(stage);
    setModalVisible(true);
  };

  // Lancer la course (à coder plus tard)
  const handleStartRace = () => {
    if (selectedStage) {
      // On envoie les joueurs ET l'étape choisie à l'écran de jeu
      navigation.navigate('Race', { 
        stage: selectedStage, 
        players: players 
      });
    }
  };

  // Retour en arrière
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CHOISISSEZ</Text>
        <Text style={styles.subtitle}>VOTRE ÉTAPE</Text>
      </View>

      {/* --- LISTE DES ÉTAPES --- */}
      <FlatList
        data={STAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.card, 
              selectedStage?.id === item.id && styles.cardSelected, // Style si sélectionné
              { borderColor: item.color }
            ]}
            onPress={() => setSelectedStage(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.difficulty}</Text>
              </View>
            </View>
            
            {/* Bouton Info */}
            <TouchableOpacity style={styles.infoButton} onPress={() => openInfo(item)}>
              <Text style={styles.infoButtonText}>ℹ️ Infos & Profil</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* --- FOOTER (Bouton Lancer) --- */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.startButton, !selectedStage && styles.disabledButton]} 
          disabled={!selectedStage}
          onPress={handleStartRace}
        >
          <Text style={styles.startButtonText}>
            {selectedStage ? `LANCER ${selectedStage.name.toUpperCase()}` : "SÉLECTIONNEZ UNE ÉTAPE"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL INFOS --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {infoStage && (
              <>
                <Text style={[styles.modalTitle, { color: infoStage.color }]}>{infoStage.name}</Text>
                
                <Text style={styles.sectionTitle}>PROFIL DE L'ÉTAPE :</Text>
                <View style={styles.profileContainer}>
                  <Text style={styles.profileText}>{infoStage.profile}</Text>
                </View>

                <Text style={styles.sectionTitle}>DESCRIPTION :</Text>
                <Text style={styles.modalDesc}>{infoStage.desc}</Text>

                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: infoStage.color }]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>FERMER</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 20,
  },
  // Style des cartes
  card: {
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderLeftWidth: 8, // Grosse bordure à gauche pour la couleur
  },
  cardSelected: {
    backgroundColor: '#444',
    transform: [{ scale: 1.02 }], // Grossit légèrement si sélectionné
    shadowColor: "#FFD700",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  infoButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  infoButtonText: {
    color: '#AAA',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
  },
  // Footer
  footer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  startButton: {
    backgroundColor: '#E30513',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  profileContainer: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDesc: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  closeButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});