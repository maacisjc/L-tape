// src/screens/PlayersScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput,
  Modal, // Pour la fenêtre pop-up
  StatusBar,
  Alert
} from 'react-native';

export default function PlayersScreen({ navigation }) {
  // --- ÉTAT (Mémoire de l'écran) ---
  const [players, setPlayers] = useState([]); // Liste des joueurs
  const [modalVisible, setModalVisible] = useState(false); // Est-ce que la pop-up est ouverte ?
  const [newPlayerName, setNewPlayerName] = useState(''); // Ce qu'on tape dans le champ texte

  // --- FONCTIONS ---

  // Ajouter un joueur
  const handleAddPlayer = () => {
    if (newPlayerName.trim().length > 0) {
      // On crée un nouvel objet joueur avec un ID unique
      const newPlayer = { id: Date.now().toString(), name: newPlayerName };
      setPlayers([...players, newPlayer]);
      setNewPlayerName(''); // On vide le champ
      setModalVisible(false); // On ferme la pop-up
    }
  };

  // Aller à la suite
  const handleContinue = () => {
    if (players.length < 2) {
      Alert.alert("Pas assez de coureurs", "Il faut au moins 2 joueurs pour lancer la course !");
      return;
    }
    // On change de page ET on envoie la liste des joueurs
    navigation.navigate('StageSelection', { players: players });
  };

  // Supprimer un joueur (si on s'est trompé)
  const removePlayer = (id) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
        {/* --- 1. HEADER AVEC BOUTON RETOUR --- */}
      <View style={styles.header}>
        {/* NOUVEAU BOUTON RETOUR ICI */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Accueil</Text>
        </TouchableOpacity>

        <Text style={styles.title}>AJOUTEZ VOS</Text>
        <Text style={styles.subtitle}>JOUEURS</Text>
        </View>

      {/* --- 2. LISTE DES JOUEURS (Au milieu) --- */}
      <View style={styles.listContainer}>
        {players.length === 0 ? (
          <Text style={styles.emptyText}>Aucun coureur sur la ligne de départ...</Text>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.playerCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{index + 1}</Text>
                </View>
                <Text style={styles.playerName}>{item.name}</Text>
                <TouchableOpacity onPress={() => removePlayer(item.id)}>
                  <Text style={styles.deleteButton}>✖</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* --- 3. BOUTONS DU BAS --- */}
      <View style={styles.footer}>
        {/* Bouton Gauche : Ajouter (+) */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        {/* Bouton Droite : Continuer (->) */}
        <TouchableOpacity 
          style={[styles.continueButton, players.length < 2 && styles.disabledButton]} 
          onPress={handleContinue}
          disabled={players.length < 2}
        >
          <Text style={styles.continueButtonText}>CONTINUER</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL (POP-UP POUR AJOUTER UN NOM) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nom du coureur</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Poulidor"
              placeholderTextColor="#999"
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              autoFocus={true} // Le clavier s'ouvre tout seul
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPlayer} style={styles.validateButton}>
                <Text style={styles.validateButtonText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222', // Gris très foncé
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  // Header
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  
  backButton: {
    marginBottom: 10, // Un peu d'espace avant le titre
    alignSelf: 'flex-start', // Colle le bouton à gauche
  },
  backButtonText: {
    color: '#888', // Gris clair discret
    fontSize: 16,
  },
  
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 40,
    color: '#FFD700', // Jaune
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  // Liste
  listContainer: {
    flex: 1, // Prend toute la place disponible au milieu
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#E30513', // Rouge
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#000',
  },
  playerName: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#666',
    fontSize: 20,
    padding: 5,
  },
  // Footer (Boutons bas)
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    fontSize: 40,
    color: '#000',
    marginTop: -5,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#555', // Grisé si pas assez de joueurs
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 18,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#E30513',
    fontSize: 18,
    marginBottom: 20,
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: '#666',
  },
  validateButton: {
    backgroundColor: '#E30513',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  validateButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});