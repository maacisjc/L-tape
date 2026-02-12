// src/data/StagesData.js

export const STAGES = {
  everest: {
    id: 'everest',
    title: "L'EVEREST",
    color: "#FFD700", // Jaune
    // Profil très varié
    heights: { 1: 10, 2: 30, 3: 30, 4: 50, 5: 50, 6: 50, 7: 70, 8: 30, 9: 30, 10: 50, 11: 90, 12: 90, 13: 110, 14: 110, 15: 150, 16: 100, 17: 120, 18: 160, 19: 160, 20: 180 },
    data: {
      // 1-3: Approche (Plat)
      1: { t: 600 }, 2: { t: 300 }, 3: { t: 600, r: true },
      // 4-7: Ça grimpe (Montée)
      4: { t: 300 }, 5: { t: 600 }, 6: { t: 600, r: true }, 7: { t: 300 },
      // 8-9: Descente (Repos)
      8: { t: 900 }, 9: { t: 600, r: true },
      // 10-14: Montée progressive
      10: { t: 300 }, 11: { t: 180 }, 12: { t: 600, r: true }, 13: { t: 300 }, 14: { t: 600 },
      // 15: Le Mur (Intense)
      15: { t: 180, r: true },
      // 16: Petite descente
      16: { t: 900 },
      // 17: Mur
      17: { t: 300 },
      // 18-19: Montée finale
      18: { t: 180, r: true }, 19: { t: 600 },
      // 20: Pif Paf
      20: { t: 300 }
    }
  },
  mont_ventoux: {
    id: 'mont_ventoux',
    title: "LE MONT VENTOUX",
    color: "#E74C3C", // Rouge
    // Profil : Longue montée constante, un replat au milieu (Chalet Reynard), final terrible
    heights: { 1: 20, 2: 20, 3: 40, 4: 60, 5: 80, 6: 100, 7: 120, 8: 140, 9: 140, 10: 140, 11: 160, 12: 180, 13: 200, 14: 220, 15: 240, 16: 260, 17: 280, 18: 280, 19: 350, 20: 350 },
    data: {
      // 1-2: Approche dans la plaine (Plat)
      1: { t: 600 }, 2: { t: 600 },
      // 3-8: Ascension de la forêt (Montée)
      3: { t: 300, r: true }, 4: { t: 300 }, 5: { t: 300 }, 6: { t: 300, r: true }, 7: { t: 300 }, 8: { t: 300 },
      // 9-10: Chalet Reynard (Le replat - Repos)
      9: { t: 600, r: true }, 10: { t: 600 },
      // 11-17: Le désert de pierres (Montée dure)
      11: { t: 300 }, 12: { t: 300, r: true }, 13: { t: 300 }, 14: { t: 300 }, 15: { t: 300, r: true }, 16: { t: 300 }, 17: { t: 300 },
      // 18-19: Le Sommet / Col des tempêtes (Mur)
      18: { t: 600, r: true }, 19: { t: 180 },
      // 20: Pif Paf
      20: { t: 600 }
    }
  },
  enfer_du_nord: {
    id: 'enfer_du_nord',
    title: "L'ENFER DU NORD",
    color: "#555555", // Gris Anthracite
    // Profil : Tout plat, mais haché par les pavés (pics d'intensité)
    heights: { 1: 10, 2: 10, 3: 30, 4: 10, 5: 10, 6: 30, 7: 10, 8: 10, 9: 40, 10: 10, 11: 10, 12: 40, 13: 10, 14: 10, 15: 40, 16: 10, 17: 40, 18: 10, 19: 40, 20: 40 },
    data: {
      // Alternance de Route (Plat) et de Secteurs Pavés (Mur/Montée)

      // Départ calme
      1: { t: 600 }, 2: { t: 600 },
      // Secteur Pavé 1 (Petit Mur)
      3: { t: 300, r: true },
      // Répit
      4: { t: 900 }, 5: { t: 600 },
      // Secteur Pavé 2 (Petit Mur)
      6: { t: 300, r: true },
      // Répit
      7: { t: 900 }, 8: { t: 600 },
      // Trouée d'Arenberg (Gros Mur)
      9: { t: 180, r: true },
      // Long répit
      10: { t: 900 }, 11: { t: 600 },
      // Secteur Pavé 4
      12: { t: 300, r: true },
      // Répit
      13: { t: 900 }, 14: { t: 600 },
      // Carrefour de l'Arbre (Gros Mur)
      15: { t: 120, r: true },
      // Dernier répit
      16: { t: 900 },
      // Mur final
      17: { t: 180, r: true },
      // Sprint vélodrome (Plat rapide avant finish)
      18: { t: 900 },
      // Dernier effort
      19: { t: 180 },
      // 20: Pif Paf
      20: { t: 600 }
    }
  },
  la_soif: {
    id: 'la_soif',
    title: "LA SOIF",
    color: "#D35400", // Orange intense
    // 10 étapes, beaucoup de murs de 3 min
    heights: { 1: 10, 2: 40, 3: 60, 4: 90, 5: 120, 6: 140, 7: 170, 8: 200, 9: 220, 10: 220 },
    data: {
      // 1: Départ
      1: { t: 300 },
      // 2: Mur 1 (3 min)
      2: { t: 180 },
      // 3: Repos
      3: { t: 300, r: true },
      // 4-5: Double Mur (3 min chaque)
      4: { t: 180 }, 5: { t: 180 },
      // 6: Repos
      6: { t: 300, r: true },
      // 7-8: Double Mur final (3 min chaque)
      7: { t: 180 }, 8: { t: 180 },
      // 9: Repos avant final
      9: { t: 300, r: true },
      // 10: Pif Paf
      10: { t: 600 }
    }
  }
};

// 2. Le tableau pour l'affichage dans StageSelectionScreen
export const STAGES_LIST = [
  {
    id: 'everest',
    name: 'L\'Everest',
    difficulty: 'Extrême',
    color: '#FFD700', // Jaune
    desc: 'Le toit du monde. Des cols mythiques et des descentes vertigineuses.',
    profile: '⛰️ Montagne'
  },
  {
    id: 'mont_ventoux',
    name: 'Mont Ventoux',
    difficulty: 'Moyen',
    color: '#E74C3C', // Rouge
    desc: 'Une montée interminable. Gérez votre effort jusqu\'au sommet chauve.',
    profile: '↗️ Ascension'
  },
  {
    id: 'enfer_du_nord',
    name: 'L\'Enfer du Nord',
    difficulty: 'Difficile',
    color: '#555555', // Gris
    desc: 'Le royaume des pavés. Ça secoue : alternance de calme et de murs brutaux.',
    profile: '🧱 Pavés'
  },
  {
    id: 'la_soif',
    name: "L'Apéro Sprint",
    difficulty: 'Intense',
    color: '#D35400',
    desc: '10 étapes rapides. Une série de murs de 3 minutes pour les assoiffés.',
    profile: '🍺 Sprint'
  },
];