// src/screens/PlayersScreen.js
import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const MAX_PLAYERS = 14;

export default function PlayersScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPhoto, setNewPlayerPhoto] = useState(null);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorise l'accès à la caméra.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) {
      const uri = res.assets?.[0]?.uri;
      if (uri) setNewPlayerPhoto(uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorise l'accès aux photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
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

  const handleAddPlayer = () => {
    if (players.length >= MAX_PLAYERS) {
      Alert.alert('Limite atteinte', `Maximum ${MAX_PLAYERS} joueurs.`);
      closeModal();
      return;
    }
    if (newPlayerName.trim().length > 0) {
      const newPlayer = {
        id: Date.now().toString(),
        name: newPlayerName.trim(),
        photo: newPlayerPhoto,
      };
      setPlayers([...players, newPlayer]);
      closeModal();
    } else {
      shake();
    }
  };

  const handleContinue = () => {
    if (players.length < 2) {
      Alert.alert('Pas assez de coureurs', 'Il faut au moins 2 joueurs pour lancer la course !');
      return;
    }
    navigation.navigate('StageSelection', { players });
  };

  const removePlayer = (id) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  const canAdd = players.length < MAX_PLAYERS;
  const fillRatio = players.length / MAX_PLAYERS;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Accueil</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AJOUTEZ VOS</Text>
        <Text style={styles.subtitle}>COUREURS</Text>

        {/* Barre de remplissage */}
        <View style={styles.fillBarBg}>
          <View style={[styles.fillBarFill, { width: `${fillRatio * 100}%` }]} />
        </View>
        <Text style={styles.countText}>{players.length} / {MAX_PLAYERS} coureurs</Text>
      </View>

      {/* LISTE */}
      <View style={styles.listContainer}>
        {players.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🚴</Text>
            <Text style={styles.emptyText}>Aucun coureur sur la grille...</Text>
            <Text style={styles.emptyHint}>Appuie sur + pour ajouter des joueurs</Text>
          </View>
        ) : (
          <FlatList
            data={players}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item, index }) => (
              <View style={styles.playerCard}>
                <View style={styles.playerLeft}>
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.playerPhoto} />
                  ) : (
                    <View style={styles.playerPhotoPlaceholder}>
                      <Text style={styles.playerInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text style={styles.playerName} numberOfLines={1}>{item.name}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => removePlayer(item.id)}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
          onPress={() => {
            if (!canAdd) {
              Alert.alert('Limite atteinte', `Maximum ${MAX_PLAYERS} joueurs.`);
              return;
            }
            setModalVisible(true);
          }}
        >
          <Text style={[styles.addButtonText, !canAdd && { color: '#333' }]}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueButton, players.length < 2 && styles.disabledButton]}
          onPress={handleContinue}
          disabled={players.length < 2}
        >
          <Text style={[styles.continueButtonText, players.length < 2 && { color: '#333' }]}>
            CONTINUER →
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL AJOUT */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.modalTitle}>NOM DU COUREUR</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Michi_666"
              placeholderTextColor="rgba(255, 215, 0, 0.3)"
              value={newPlayerName}
              onChangeText={setNewPlayerName}
              autoFocus={true}
              onSubmitEditing={handleAddPlayer}
              returnKeyType="done"
            />

            {/* PHOTO */}
            <View style={styles.photoSection}>
              <View style={styles.photoPreview}>
                {newPlayerPhoto ? (
                  <Image source={{ uri: newPlayerPhoto }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={styles.photoPlaceholderText}>📸</Text>
                )}
              </View>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
                  <Text style={styles.photoBtnText}>📷 Caméra</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
                  <Text style={styles.photoBtnText}>🖼 Galerie</Text>
                </TouchableOpacity>
                {newPlayerPhoto && (
                  <TouchableOpacity style={[styles.photoBtn, { borderColor: '#e74c3c' }]} onPress={() => setNewPlayerPhoto(null)}>
                    <Text style={[styles.photoBtnText, { color: '#e74c3c' }]}>✕ Supprimer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* BOUTONS */}
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={closeModal} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPlayer} style={styles.validateButton}>
                <Text style={styles.validateButtonText}>Ajouter 🚴</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', paddingTop: 50 },

  header: {
    paddingHorizontal: 22,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    paddingBottom: 16,
  },
  backButton: { marginBottom: 10, alignSelf: 'flex-start' },
  backButtonText: { color: '#666', fontSize: 15 },
  title: { fontSize: 18, color: '#888', fontWeight: '300', letterSpacing: 1 },
  subtitle: {
    fontSize: 40,
    color: '#FFD700',
    fontWeight: '900',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    lineHeight: 42,
    marginBottom: 12,
  },
  fillBarBg: { height: 4, backgroundColor: '#111', borderRadius: 2, marginBottom: 6, overflow: 'hidden' },
  fillBarFill: { height: 4, backgroundColor: '#FFD700', borderRadius: 2 },
  countText: { color: '#444', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  listContainer: { flex: 1, paddingHorizontal: 16 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { color: '#333', fontSize: 16, fontStyle: 'italic', marginBottom: 6 },
  emptyHint: { color: '#222', fontSize: 13 },

  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d0d0d',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  playerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  numberText: { fontWeight: '900', color: '#000', fontSize: 12 },
  playerPhoto: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  playerPhotoPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  playerInitial: { color: '#FFD700', fontWeight: '900', fontSize: 15 },
  playerName: { flex: 1, color: 'white', fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: '#333', fontSize: 16 },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  addButton: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFD700',
  },
  addButtonDisabled: { borderColor: '#222' },
  addButtonText: { fontSize: 34, color: '#FFD700', marginTop: -3, fontWeight: '300' },

  continueButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  disabledButton: { backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a' },
  continueButtonText: { color: '#000', fontWeight: '900', fontSize: 16, fontStyle: 'italic' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '88%',
    backgroundColor: '#0d0d0d',
    padding: 24,
    borderRadius: 22,
    borderColor: '#FFD700',
    borderWidth: 1.5,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 20,
    textAlign: 'center',
    color: '#FFD700',
    letterSpacing: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#FFD700',
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 20,
    padding: 14,
    color: '#FFF',
    backgroundColor: '#080808',
  },

  photoSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  photoPreview: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#FFD700',
    overflow: 'hidden',
  },
  photoPlaceholderText: { fontSize: 28 },
  photoButtons: { flex: 1, gap: 8 },
  photoBtn: {
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  photoBtnText: { color: '#FFD700', fontSize: 12, fontWeight: 'bold' },

  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelButton: { padding: 12 },
  cancelButtonText: { color: '#555', fontSize: 14 },
  validateButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  validateButtonText: { color: '#000', fontWeight: '900', fontSize: 15 },
});
