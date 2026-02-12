// src/screens/PlayersScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function PlayersScreen({ navigation }) {
  // --- ÉTAT ---
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState(null); // uri string

  // --- PHOTO: CAMÉRA ---
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorise l'accès à la caméra pour prendre une photo."
      );
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!res.canceled) {
      const uri = res.assets?.[0]?.uri;
      if (uri) setNewPlayerPhoto(uri);
    }
  };

  // --- PHOTO: GALERIE ---
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorise l'accès aux photos."
      );
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!res.canceled) {
      const uri = res.assets?.[0]?.uri;
      if (uri) setNewPlayerPhoto(uri);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewPlayerName('');
    setNewPlayerPhoto(null);
  };

  // --- Ajouter un joueur ---
  const handleAddPlayer = () => {
    if (players.length >= 10) {
      Alert.alert('Limite atteinte', 'Le nombre maximum de joueurs est de 10.');
      closeModal();
      return;
    }

    if (newPlayerName.trim().length > 0) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        photo: newPlayerPhoto, // peut être null si pas de photo
      };

      setPlayers([...players, newPlayer]);
      closeModal();
    }
  };

  // --- Continuer ---
  const handleContinue = () => {
    if (players.length < 2) {
      Alert.alert(
        'Pas assez de coureurs',
        'Il faut au moins 2 joueurs pour lancer la course !'
      );
      return;
    }
    navigation.navigate('StageSelection', { players });
  };

  // --- Supprimer un joueur ---
  const removePlayer = (id) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Accueil</Text>
        </TouchableOpacity>

        <Text style={styles.title}>AJOUTEZ VOS</Text>
        <Text style={styles.subtitle}>JOUEURS</Text>
      </View>

      {/* LISTE */}
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

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (players.length >= 10) {
              Alert.alert('Limite atteinte', 'Vous ne pouvez pas ajouter plus de 10 joueurs.');
              return;
            }
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, players.length < 2 && styles.disabledButton]}
          onPress={handleContinue}
          disabled={players.length < 2}
        >
          <Text style={styles.continueButtonText}>CONTINUER</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL AJOUT */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nom du coureur</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Emold_667"
              placeholderTextColor="#999"
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              autoFocus={true}
            />

            {/* PHOTO PICKER */}
            <View style={{ alignItems: 'center', marginBottom: 15 }}>
              <View
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  backgroundColor: '#eee',
                  overflow: 'hidden',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {newPlayerPhoto ? (
                  <Image source={{ uri: newPlayerPhoto }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={{ color: '#888' }}>Photo</Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity onPress={pickPhoto} style={{ marginHorizontal: 8 }}>
                  <Text style={{ color: '#E30513', fontWeight: 'bold' }}>📷 Caméra</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={pickFromGallery} style={{ marginHorizontal: 8 }}>
                  <Text style={{ color: '#E30513', fontWeight: 'bold' }}>🖼️ Galerie</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BOUTONS */}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
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
    backgroundColor: '#222',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '300',
  },
  subtitle: {
    fontSize: 40,
    color: '#FFD700',
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  listContainer: {
    flex: 1,
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
    borderLeftColor: '#E30513',
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
    backgroundColor: '#555',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 18,
    fontStyle: 'italic',
  },
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
