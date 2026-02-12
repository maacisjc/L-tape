// src/screens/StageSelectionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar
} from 'react-native';

// --- IMPORT DES DONNÉES DEPUIS VOTRE NOUVEAU FICHIER ---
// Assurez-vous que le chemin est correct selon votre structure de dossiers
import { STAGES_LIST } from '../data/StagesData';
import Svg, { Polyline } from 'react-native-svg';
import { STAGES } from '../data/StagesData'; // On a besoin des heights pour le dessin
import { Dimensions } from 'react-native'; // <--- Ajouter l'import
const SW = Dimensions.get('window').width; // <--- Déclarer SW
//C:\Users\emeri\LetapeGame\src\data
export default function StageSelectionScreen({ navigation, route }) {
  // On récupère la liste des joueurs passée depuis la page précédente
  const { players } = route.params || { players: [] };

  const [selectedStage, setSelectedStage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoStage, setInfoStage] = useState(null);

  // Ouvrir les infos
  const openInfo = (stage) => {
    setInfoStage(stage);
    setModalVisible(true);
  };

  // LANCER LA COURSE
  const handleStartRace = () => {
    if (selectedStage) {
      // On envoie 'stageKey' qui correspond aux clés du fichier StagesData (ex: 'everest')
      navigation.navigate('Race', {
        stageKey: selectedStage.id,
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
        data={STAGES_LIST} // On utilise la liste exportée de StagesData
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              selectedStage?.id === item.id && styles.cardSelected,
              { borderColor: item.color }
            ]}
            onPress={() => setSelectedStage(item)}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={[styles.badgeText, { color: '#000' }]}>{item.difficulty}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => openInfo(item)}>
              <Text style={styles.infoButtonText}>ℹ️ Infos & Profil</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* --- FOOTER --- */}
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
                <View style={styles.previewChartContainer}>
                  {infoStage && (
                    <Svg height="60" width={SW * 0.7}>
                      <Polyline
                        points={(() => {
                          const stageKey = infoStage.id;
                          const heights = STAGES[stageKey].heights;
                          const len = Object.keys(heights).length || 20;
                          return [...Array(len)].map((_, i) => {
                            const h = heights[i + 1] || 0;
                            const x = (i * (SW * 0.7)) / ((len - 1) || 1);
                            const y = 60 - (h * 0.25) - 5;
                            return `${x},${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke={infoStage.color}
                        strokeWidth="3"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
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

// Les styles restent identiques à votre version originale
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  backButton: {
    marginBottom: 10
  },
  backButtonText: {
    color: '#888',
    fontSize: 16
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '300'
  },
  subtitle: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic'
  },
  listContent: {
    padding: 20
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333'
  },
  cardSelected: {
    backgroundColor: '#111',
    transform: [{ scale: 1.02 }],
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold'
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FFF'
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  infoButton: {
    alignSelf: 'flex-start',
    marginTop: 5
  },
  infoButtonText: {
    color: '#666',
    fontStyle: 'italic',
    textDecorationLine: 'underline'
  },
  previewChartContainer: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#222'
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#111',
    opacity: 0.3,
    borderWidth: 1,
    borderColor: '#222'
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#111',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    color: '#FFF'
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10
  },
  modalDesc: {
    fontSize: 16,
    color: '#AAA',
    lineHeight: 22,
    marginBottom: 20
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16
  }
});