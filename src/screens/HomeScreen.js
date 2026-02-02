// Importation des outils de base React et des composants mobiles
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

// Début de la page "Accueil"
export default function HomeScreen({ navigation }) {
  
  // Fonction déclenchée quand on appuie sur JOUER
  const handlePressPlay = () => {
    // console.log("Vers la configuration..."); // Tu peux supprimer ça
    navigation.navigate('Players'); // AJOUTE CETTE LIGNE
  };

  return (
    // Conteneur principal (le fond de l'écran)
    <View style={styles.container}>
      {/* Barre d'état en haut du téléphone (heure, batterie) en blanc */}
      <StatusBar barStyle="light-content" />
      
        {/* Couche invisible pour organiser les éléments verticalement */}
        <View style={styles.overlay}>
          
          {/* Section du Haut : Titres */}
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>L'ÉTAPE</Text>
            <Text style={styles.appSubtitle}>LE JEU À BOIRE MADE BY THE MICHI</Text>
          </View>

          {/* Section du Milieu : Le Bouton Action */}
          <View style={styles.centerContainer}>
            <TouchableOpacity 
              style={styles.playButton} 
              onPress={handlePressPlay}
            >
              <Text style={styles.playButtonText}>JOUER</Text>
            </TouchableOpacity>
          </View>

          {/* Section du Bas : Infos secondaires */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>v1.0 - Credits to VEL</Text>
          </View>
        </View>
    </View>
  );
}

// --- ZONE DE DESIGN (CSS) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333', // Fond gris anthracite
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between', // Aligne un bloc en haut, un au milieu, un en bas
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  headerContainer: { 
    alignItems: 'center' 
  },
  appTitle: {
    fontSize: 60,
    fontWeight: '900',
    color: '#FFD700', // Jaune Maillot Jaune
    fontStyle: 'italic',
    textAlign: 'center',
  },
  appSubtitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  centerContainer: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  playButton: {
    backgroundColor: '#E30513', // Rouge vif
    width: 200,
    height: 200,
    borderRadius: 100, // En faire un rond parfait
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  playButtonText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  footerContainer: { 
    alignItems: 'center' 
  },
  footerText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontSize: 12 
  },
});