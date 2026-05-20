// src/screens/StageSelectionScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  StatusBar,
  Animated,
} from 'react-native';
import { STAGES_LIST } from '../data/StagesData';
import Svg, { Polyline } from 'react-native-svg';
import { STAGES } from '../data/StagesData';
import { Dimensions } from 'react-native';

const SW = Dimensions.get('window').width;

// Calcule la durée totale estimée d'une étape (somme de tous les chrono en min)
const getEstimatedDuration = (stageId) => {
  const stage = STAGES[stageId];
  if (!stage) return '?';
  const totalSec = Object.values(stage.data).reduce((sum, d) => sum + (d.t || 0), 0);
  const totalMin = Math.round(totalSec / 60);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  }
  return `~${totalMin} min`;
};

// Nombre de niveaux
const getLevelCount = (stageId) => {
  const stage = STAGES[stageId];
  return stage ? Object.keys(stage.heights).length : '?';
};

// Compte les ravitos
const getRavitoCount = (stageId) => {
  const stage = STAGES[stageId];
  if (!stage) return 0;
  return Object.values(stage.data).filter((d) => d.r).length;
};

// Barres de difficulté visuelles
const DifficultyBars = ({ difficulty, color }) => {
  const levels = { 'Facile': 1, 'Moyen': 2, 'Difficile': 3, 'Extrême': 4 };
  const count = levels[difficulty] || 2;
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            width: 10,
            height: 6 + i * 2,
            borderRadius: 2,
            backgroundColor: i <= count ? color : '#222',
          }}
        />
      ))}
    </View>
  );
};

export default function StageSelectionScreen({ navigation, route }) {
  const { players } = route.params || { players: [] };
  const [selectedStage, setSelectedStage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [infoStage, setInfoStage] = useState(null);

  const openInfo = (stage) => { setInfoStage(stage); setModalVisible(true); };

  const handleStartRace = () => {
    if (selectedStage) {
      navigation.navigate('Race', { stageKey: selectedStage.id, players });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>CHOISISSEZ</Text>
        <Text style={styles.subtitle}>VOTRE ÉTAPE</Text>
        <Text style={styles.playerCount}>{players.length} coureur{players.length > 1 ? 's' : ''} sur la grille</Text>
      </View>

      {/* LISTE DES ÉTAPES */}
      <FlatList
        data={STAGES_LIST}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedStage?.id === item.id;
          const duration = getEstimatedDuration(item.id);
          const levels = getLevelCount(item.id);
          const ravitos = getRavitoCount(item.id);

          return (
            <TouchableOpacity
              style={[styles.card, isSelected && { borderColor: item.color, borderWidth: 2 }]}
              onPress={() => setSelectedStage(item)}
              activeOpacity={0.85}
            >
              {/* Bande colorée sur la gauche */}
              <View style={[styles.cardAccent, { backgroundColor: item.color }]} />

              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardProfile}>{item.profile}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[styles.badge, { backgroundColor: item.color + '22', borderColor: item.color }]}>
                      <Text style={[styles.badgeText, { color: item.color }]}>{item.difficulty}</Text>
                    </View>
                    <DifficultyBars difficulty={item.difficulty} color={item.color} />
                  </View>
                </View>

                {/* Stats de l'étape */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{levels}</Text>
                    <Text style={styles.statLabel}>niveaux</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{duration}</Text>
                    <Text style={styles.statLabel}>estimé</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{ravitos}</Text>
                    <Text style={styles.statLabel}>ravitos</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.infoButton} onPress={() => openInfo(item)}>
                  <Text style={[styles.infoButtonText, { color: item.color }]}>ℹ️ Voir le profil</Text>
                </TouchableOpacity>
              </View>

              {/* Indicateur de sélection */}
              {isSelected && (
                <View style={[styles.selectedIndicator, { backgroundColor: item.color }]}>
                  <Text style={styles.selectedIndicatorText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, !selectedStage && styles.disabledButton, selectedStage && { backgroundColor: selectedStage.color }]}
          disabled={!selectedStage}
          onPress={handleStartRace}
        >
          <Text style={[styles.startButtonText, !selectedStage && { color: '#444' }]}>
            {selectedStage ? `🚴 LANCER ${selectedStage.name.toUpperCase()}` : 'SÉLECTIONNEZ UNE ÉTAPE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL INFOS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {infoStage && (
              <>
                <Text style={[styles.modalTitle, { color: infoStage.color }]}>{infoStage.name}</Text>

                <Text style={styles.sectionTitle}>PROFIL DE L'ÉTAPE</Text>
                <View style={styles.previewChartContainer}>
                  <Svg height="70" width={SW * 0.72}>
                    <Polyline
                      points={(() => {
                        const heights = STAGES[infoStage.id].heights;
                        const len = Object.keys(heights).length || 20;
                        return [...Array(len)].map((_, i) => {
                          const h = heights[i + 1] || 0;
                          const x = (i * (SW * 0.72)) / ((len - 1) || 1);
                          const y = 65 - (h * 0.25) - 5;
                          return `${x},${y}`;
                        }).join(' ');
                      })()}
                      fill="none"
                      stroke={infoStage.color}
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                {/* Stats modal */}
                <View style={[styles.statsRow, { marginBottom: 14 }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: infoStage.color }]}>{getLevelCount(infoStage.id)}</Text>
                    <Text style={styles.statLabel}>niveaux</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: infoStage.color }]}>{getEstimatedDuration(infoStage.id)}</Text>
                    <Text style={styles.statLabel}>estimé</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: infoStage.color }]}>{getRavitoCount(infoStage.id)}</Text>
                    <Text style={styles.statLabel}>ravitos</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>DESCRIPTION</Text>
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
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    paddingTop: 52,
    paddingHorizontal: 22,
    paddingBottom: 16,
    backgroundColor: '#050505',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  backButton: { marginBottom: 10 },
  backButtonText: { color: '#666', fontSize: 15 },
  title: { fontSize: 18, color: '#888', fontWeight: '300', letterSpacing: 1 },
  subtitle: {
    fontSize: 36,
    color: '#FFD700',
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    lineHeight: 38,
  },
  playerCount: { color: '#444', fontSize: 12, marginTop: 4, letterSpacing: 1 },

  listContent: { padding: 14, gap: 12 },

  card: {
    backgroundColor: '#0d0d0d',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  cardAccent: { width: 4, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  cardBody: { flex: 1, padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: { color: 'white', fontSize: 20, fontWeight: '900', lineHeight: 22 },
  cardProfile: { color: '#555', fontSize: 12, marginTop: 2 },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#FFD700', fontSize: 16, fontWeight: '900' },
  statLabel: { color: '#444', fontSize: 10, marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 28, backgroundColor: '#1a1a1a' },

  infoButton: { alignSelf: 'flex-start' },
  infoButtonText: { fontSize: 13, fontStyle: 'italic', textDecorationLine: 'underline' },

  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: { color: '#000', fontWeight: '900', fontSize: 13 },

  footer: {
    padding: 16,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  startButton: {
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
  },
  disabledButton: { backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a' },
  startButtonText: { color: '#000', fontSize: 16, fontWeight: '900', fontStyle: 'italic', letterSpacing: 1 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0d0d0d',
    width: '100%',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 11,
    color: '#444',
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  previewChartContainer: {
    backgroundColor: '#080808',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  modalDesc: { fontSize: 14, color: '#888', lineHeight: 21, marginBottom: 20 },
  closeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: { color: '#000', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});