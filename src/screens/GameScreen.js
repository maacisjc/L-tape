import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Dimensions,
  Image,
  Animated,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}
import Svg, { Polyline, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { STAGES } from '../data/StagesData';

const { width: SW, height: SH } = Dimensions.get('window');
const CH = 220;



export default function GameScreen({ route, navigation }) {
  console.log('GameScreen params:', route.params);
  const { players: initP = [], stageKey } = route.params || {};

  const currentStage = STAGES[stageKey];

  if (!currentStage) {
    console.error('Stage not found for key:', stageKey);
    return (
      <View style={s.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Erreur: Étape introuvable</Text>
      </View>
    );
  }

  const stageData = currentStage.data || {};
  const stageHeights = currentStage.heights || {};

  // --- CALCUL DYNAMIQUE DE L'ÉCHELLE (SCALING) ---
  const allHeights = Object.values(stageHeights);
  const maxHeight = Math.max(...allHeights, 100);
  const STAGE_LENGTH = Object.keys(stageHeights).length > 0 ? Object.keys(stageHeights).length : 20;


  const PADDING_TOP = 60; // Augmenté pour permettre l'empilement des joueurs
  const PADDING_BOTTOM = 20;
  const DRAWING_HEIGHT = CH - PADDING_TOP - PADDING_BOTTOM;

  const scaleFactor = DRAWING_HEIGHT / maxHeight;
  const getY = (h) => CH - PADDING_BOTTOM - ((h || 0) * scaleFactor);



  // --- PRÉPARATION DU SVG (LIGNE + REMPLISSAGE) ---
  const step = (SW * 0.9) / (STAGE_LENGTH - 1);

  const linePoints = [...Array(STAGE_LENGTH)]
    .map((_, i) => {
      const h = stageHeights[i + 1] || 0;
      return `${i * step},${getY(h)}`;
    })
    .join(' ');

  const fillPoints = `${linePoints} ${(STAGE_LENGTH - 1) * step},${CH} 0,${CH}`;


  // --- ÉTATS DU JEU ---
  const [globalTimer, setGlobalTimer] = useState(0);

  const [ps, setPs] = useState(
    initP.map((p, i) => ({
      ...p,
      lvl: 1,
      t: stageData[1].t,
      n: i + 1,
      f: false,
      dnf: false,
      dope: false,
      isPunctured: false,
      punctureLvl: Math.floor(Math.random() * (Math.max(4, STAGE_LENGTH - 3) - 4 + 1)) + 4,
      startAt: Date.now(),
    }))
  );

  // --- CALCUL TAILLE CARTES JOUEURS ---
  // Hauteur dispo = Ecran - gArea (365)
  // On veut tout faire tenir sans scroll
  const AVAILABLE_HEIGHT = SH - 365;
  const pCount = Math.max(2, ps.length);
  const rows = Math.ceil(pCount / 2);
  // Hauteur max par carte : (Hauteur dispo / nbr lignes) - marge verticale (16)
  // On baisse le min à 55 pour permettre d'afficher plus de joueurs sans scroll
  const dynamicCardHeight = Math.min(150, Math.max(60, (AVAILABLE_HEIGHT / rows) - 10));

  const [spr, setSpr] = useState(false);
  const [st, setSt] = useState(600);
  const [sprintActivatorId, setSprintActivatorId] = useState(null); // ID du joueur qui a activé le sprint
  const [showRavito, setShowRavito] = useState(false);
  const [ravitoCount, setRavitoCount] = useState({});
  const [showSprintAlert, setShowSprintAlert] = useState(false);
  const [showPuncture, setShowPuncture] = useState(false);
  const [showPifPafRanking, setShowPifPafRanking] = useState(false);
  const [pifPafPlayers, setPifPafPlayers] = useState([]);
  const [pifPafRanking, setPifPafRanking] = useState([]);
  const [isPifPafCompleted, setIsPifPafCompleted] = useState(false);

  const [ranking, setRanking] = useState([]);



  useEffect(() => {
    const clock = setInterval(() => {
      setGlobalTimer((prev) => prev + 1);

      setPs((prev) =>
        prev.map((x) => {
          if (x.dnf || x.dope) return x;
          if (x.f) return x.t > 0 ? { ...x, t: x.t - 1 } : x;
          if (x.lvl === STAGE_LENGTH && st > 0) return x;
          if (x.t <= 0) return { ...x, dnf: true, t: 0 };
          return { ...x, t: x.t - 1 };
        })
      );

      if (spr && st > 0) {
        setSt((s) => {
          const newSt = s - 1;
          return newSt;
        });
      }
    }, 1000);

    return () => clearInterval(clock);
  }, [spr, st]);

  // Effet séparé pour détecter quand le chrono arrive à 0
  useEffect(() => {
    if (spr && st === 0 && !showPifPafRanking) {
      const playersAtLvl20 = ps.filter((p) => p.lvl === STAGE_LENGTH && !p.dnf && !p.dope);
      setPifPafPlayers(playersAtLvl20);
      setShowPifPafRanking(true);
    }
  }, [spr, st, showPifPafRanking, ps]);

  // --- HELPERS ---
  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  const formatGlobalTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPositions = (playersArr) => {
    const alive = playersArr.filter((p) => !p.dnf && !p.dope);
    const sorted = [...alive].sort((a, b) => {
      if (b.lvl !== a.lvl) return b.lvl - a.lvl;
      return b.t - a.t;
    });
    const map = {};
    sorted.forEach((p, idx) => {
      map[p.id] = idx + 1;
    });
    return { map, total: sorted.length };
  };

  // temps moyen par bière (sec/🍺)
  const getAvgTimePerBeer = (p) => {
    const beers = Math.max(0, (p.lvl || 1) - 1);
    if (beers === 0) return null;
    const elapsedSec = Math.max(1, Math.floor((Date.now() - (p.startAt || Date.now())) / 1000));
    const avgSec = Math.round(elapsedSec / beers);
    const m = Math.floor(avgSec / 60);
    const s = (avgSec % 60).toString().padStart(2, '0');
    return `${m}:${s} / 🍺`;
  };



  // --- LOGIQUE DE FIN ---
  const handleFinish = (finishedPlayer, currentPs) => {
    setRanking((prevRanking) => {
      const newRanking = [...prevRanking, finishedPlayer];
      const survivors = currentPs.filter((p) => !p.dnf && !p.dope);
      const isGameTotallyOver = newRanking.length >= survivors.length;

      if (isGameTotallyOver) {
        // Jeu terminé
      }

      setTimeout(() => {
        navigation.navigate('Podium', {
          ranking: newRanking,
          isGameOver: isGameTotallyOver,
        });

      }, 500);

      return newRanking;
    });
  };

  const press = (id) => {
    let playerToFinish = null;
    let updatedPsSnapshot = null;

    setPs((curr) => {
      const p = curr.find((x) => x.id === id);
      if (!p || p.f || p.dnf || p.dope) return curr;

      // ✅ FIX CRITIQUE : si le joueur est déjà dans un col, on démarre le chrono maintenant
      // (Supprimé car on enlève les cols)

      const n = p.lvl + 1;


      if (n === STAGE_LENGTH && !spr && !isPifPafCompleted) {
        setSpr(true);
        setSprintActivatorId(id); // Enregistrer qui a activé le sprint
        setShowSprintAlert(true);
      }

      if (p.lvl === STAGE_LENGTH) {
        // Si le Pif Paf est déjà terminé par d'autres, on finit direct
        if (isPifPafCompleted) {
          playerToFinish = p;
          const nextState = curr.map((x) => (x.id === id ? { ...x, f: true, t: stageData[STAGE_LENGTH].t } : x));
          updatedPsSnapshot = nextState;
          return nextState;
        }

        if (st > 0) return curr;

        playerToFinish = p;
        const nextState = curr.map((x) => (x.id === id ? { ...x, f: true, t: stageData[STAGE_LENGTH].t } : x));
        updatedPsSnapshot = nextState;
        return nextState;
      }

      if (n === p.punctureLvl) {
        setShowPuncture(true);
        return curr.map((x) =>
          x.id === id
            ? {
              ...x,
              lvl: n,
              t: stageData[n].t,
              isPunctured: true,
            }
            : x
        );
      }

      if (stageData[n]?.r) {
        setRavitoCount((prev) => {
          const nc = (prev[n] || 0) + 1;
          if (nc === 3) setShowRavito(true);
          return { ...prev, [n]: nc };
        });
      }

      return curr.map((x) => {
        if (x.id !== id) return x;

        return { ...x, lvl: n, t: stageData[n].t, isPunctured: false };
      });
    });

    if (playerToFinish && updatedPsSnapshot) {
      handleFinish(playerToFinish, updatedPsSnapshot);
    }
  };

  const vomi = (id) => {
    setPs((curr) => {
      const updated = curr.map((x) => {
        if (x.id !== id) return x;

        // (Supprimé logique col vomi)

        if (x.f) return { ...x, dope: true, f: false, t: 0 };
        if (x.lvl > 1 && !x.dnf)
          return { ...x, lvl: x.lvl - 1, t: stageData[x.lvl - 1].t, isPunctured: false };

        return { ...x };
      });

      // Vérifier si le joueur qui a activé le sprint vomit et redescend au LVL 19
      const player = updated.find((p) => p.id === id);
      if (
        sprintActivatorId === id &&
        player &&
        player.lvl === (STAGE_LENGTH - 1) &&
        spr &&
        st > 0
      ) {
        // Reset du sprint
        setSpr(false);
        setSt(600);
        setSprintActivatorId(null);
      }

      return updated;
    });
  };

  const revive = (id) => {
    setPs((curr) =>
      curr.map((x) => (x.id === id && x.dnf ? { ...x, dnf: false, t: stageData[x.lvl].t } : x))
    );
  };

  const col = (item) => {
    if (item.dnf) return '#333';
    if (item.dope) return '#9b59b6';
    if (item.f) return '#8e44ad';
    if (item.lvl === STAGE_LENGTH && st > 0) return '#2980b9';
    if (item.isPunctured) return '#D35400';
    return item.t > 300 ? '#2ECC71' : item.t >= 120 ? '#F39C12' : '#E74C3C';
  };

  const { map: posMap, total: posTotal } = getPositions(ps);

  // --- CALCUL DES POSITIONS EMPILÉES POUR LES JOUEURS AU MÊME NIVEAU ---
  const playerPositions = useMemo(() => {
    const positions = {};
    const playersByLevel = {};

    // Grouper les joueurs actifs par niveau
    ps.filter((p) => !p.dnf).forEach((p) => {
      if (!playersByLevel[p.lvl]) {
        playersByLevel[p.lvl] = [];
      }
      playersByLevel[p.lvl].push(p);
    });

    // Calculer les offsets pour chaque groupe
    Object.keys(playersByLevel).forEach((lvlStr) => {
      const lvl = parseInt(lvlStr, 10);
      const playersAtLevel = playersByLevel[lvlStr];
      // Calculer la position Y exacte sur la ligne du profil pour ce niveau
      const lineY = getY(stageHeights[lvl]);
      // Centrer le jeton (hauteur 30px, donc -15px pour centrer)
      const baseY = lineY - 15;
      const offsetStep = 35; // Espacement vertical entre joueurs empilés

      // Trier les joueurs par position (pour un ordre cohérent)
      const sortedPlayers = [...playersAtLevel].sort((a, b) => {
        const posA = posMap[a.id] || 999;
        const posB = posMap[b.id] || 999;
        return posA - posB;
      });

      sortedPlayers.forEach((player, index) => {
        // Pour le premier joueur (index 0), pas d'offset - il reste centré sur la ligne
        // Pour les suivants, on les empile vers le haut
        const verticalOffset = index * offsetStep; // Offset vers le haut
        let finalY = baseY - verticalOffset;

        // Vérifier que le jeton ne sort pas du haut (avec une marge de sécurité)
        // Mais seulement si ce n'est pas le premier joueur seul, pour éviter de décaler le jeton
        if (index > 0 || sortedPlayers.length > 1) {
          const minY = 5; // Marge minimale pour éviter de sortir du SVG
          finalY = Math.max(finalY, minY);
        }

        positions[player.id] = {
          left: (player.lvl - 1) * step,
          top: finalY,
        };
      });
    });

    return positions;
  }, [ps, stageHeights, posMap, step, getY]); // Removed PADDING_TOP dependency

  // --- GESTION DES ANIMATIONS POUR LES JETONS ---
  const animatedPositionsRef = useRef({});

  // Initialiser et animer les positions des jetons
  useEffect(() => {
    ps.filter((p) => !p.dnf).forEach((p) => {
      const targetPos = playerPositions[p.id];

      if (!targetPos) return;

      // Initialiser les valeurs animées pour un nouveau joueur
      if (!animatedPositionsRef.current[p.id]) {
        animatedPositionsRef.current[p.id] = {
          left: new Animated.Value(targetPos.left),
          top: new Animated.Value(targetPos.top),
        };
      } else {
        // Animer vers les nouvelles positions si elles ont changé
        const animatedPos = animatedPositionsRef.current[p.id];
        const currentLeft = animatedPos.left._value;
        const currentTop = animatedPos.top._value;
        const hasChanged = Math.abs(currentLeft - targetPos.left) > 0.5 || Math.abs(currentTop - targetPos.top) > 0.5;

        if (hasChanged) {
          Animated.parallel([
            Animated.spring(animatedPos.left, {
              toValue: targetPos.left,
              useNativeDriver: false, // left/top ne supportent pas native driver
              tension: 50,
              friction: 7,
            }),
            Animated.spring(animatedPos.top, {
              toValue: targetPos.top,
              useNativeDriver: false,
              tension: 50,
              friction: 7,
            }),
          ]).start();
        }
      }
    });

    // Nettoyer les animations des joueurs qui ne sont plus actifs
    Object.keys(animatedPositionsRef.current).forEach((playerId) => {
      const playerExists = ps.some((p) => p.id === playerId && !p.dnf);
      if (!playerExists) {
        delete animatedPositionsRef.current[playerId];
      }
    });
  }, [playerPositions, ps]);


  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      <View style={s.gArea}>
        <View style={s.headerChart}>
          <Text style={s.title}>PROFIL : {currentStage.title}</Text>
          <View style={s.globalTimerBox}>
            <Text style={s.globalTimerText}>{formatGlobalTime(globalTimer)}</Text>
          </View>
        </View>



        {/* Bouton pour voir le podium */}
        {ranking.length > 0 && (
          <TouchableOpacity
            style={s.podiumButton}
            onPress={() => {
              const survivors = ps.filter((p) => !p.dnf && !p.dope);
              const isGameTotallyOver = ranking.length >= survivors.length;

              navigation.navigate('Podium', {
                ranking,
                isGameOver: isGameTotallyOver,
              });
            }}
          >
            <Text style={s.podiumButtonText}>🏆 VOIR LE PODIUM ({ranking.length})</Text>
          </TouchableOpacity>
        )}

        <View style={s.chart}>
          <Svg height={CH} width={SW * 0.9}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={currentStage.color} stopOpacity="0.8" />
                <Stop offset="1" stopColor={currentStage.color} stopOpacity="0.1" />
              </LinearGradient>
            </Defs>

            <Path d={`M ${fillPoints} Z`} fill="url(#grad)" />

            <Polyline
              points={linePoints}
              fill="none"
              stroke={currentStage.color || '#FFD700'}
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </Svg>

          {ps.map(
            (p) =>
              !p.dnf && p.lvl !== STAGE_LENGTH && playerPositions[p.id] && animatedPositionsRef.current[p.id] && (
                <Animated.View
                  key={p.id}
                  style={[
                    s.ball,
                    {
                      left: animatedPositionsRef.current[p.id].left,
                      top: animatedPositionsRef.current[p.id].top,
                      backgroundColor: col(p),
                    },
                  ]}
                >
                  {p.photo ? <Image source={{ uri: p.photo }} style={s.ballImg} /> : <Text style={s.bt}>{p.n}</Text>}
                </Animated.View>
              )
          )}

          {/* ZONE D'ATTENTE PIF PAF (LVL 20) */}
          {spr && (
            <View style={s.pifPafZone}>
              <Text style={s.pifPafZoneTitle}>EN ATTENTE DU PIF PAF</Text>
              <View style={s.pifPafZoneContent}>
                {ps.filter(p => !p.dnf && p.lvl === STAGE_LENGTH).map(p => (
                  <View key={p.id} style={[s.ballMini, { backgroundColor: col(p) }]}>
                    {p.photo ? <Image source={{ uri: p.photo }} style={s.ballImg} /> : <Text style={s.btMini}>{p.n}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={ps}
        numColumns={2}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) => {
          const pos = posMap[item.id] || '-';
          const avg = getAvgTimePerBeer(item);

          return (
            <View style={[s.card, { backgroundColor: col(item), height: dynamicCardHeight }]}>
              <TouchableOpacity
                style={s.cardAction}
                onPress={() => press(item.id)}
                disabled={item.dnf || (item.f && item.t <= 0) || item.dope}
                activeOpacity={0.85}
              >
                <View style={s.topRow}>
                  <Text style={[s.pseudo, { fontSize: dynamicCardHeight < 65 ? 14 : dynamicCardHeight < 100 ? 18 : 24 }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[s.posText, { fontSize: dynamicCardHeight < 65 ? 12 : dynamicCardHeight < 100 ? 14 : 18 }]}>
                    {pos}/{posTotal || '-'}
                  </Text>
                </View>

                <Text style={[s.lvlLine, { fontSize: dynamicCardHeight < 65 ? 9 : dynamicCardHeight < 100 ? 10 : 12 }]}>
                  {item.dnf
                    ? 'DNF'
                    : item.dope
                      ? 'DOPÉ 💉'
                      : item.f
                        ? 'ANTIDOPAGE'
                        : item.lvl === STAGE_LENGTH && st > 0
                          ? 'ATTENTE PIF PAF'
                          : item.isPunctured
                            ? 'CREVAISON !'
                            : `LVL ${item.lvl}`}
                </Text>

                <View style={s.centerBlock}>
                  {item.dnf ? (
                    <TouchableOpacity style={s.reviveBtn} onPress={() => revive(item.id)}>
                      <Text style={[s.reviveText, { fontSize: dynamicCardHeight < 65 ? 10 : 14 }]}>🔄 REVIVRE</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[s.timerBig, { fontSize: dynamicCardHeight < 65 ? 20 : dynamicCardHeight < 100 ? 28 : 38 }]}>
                      {item.dope ? 'DISQ' : item.lvl === STAGE_LENGTH && st > 0 ? 'GO!' : formatTime(item.t)}
                    </Text>
                  )}
                </View>

                <View style={s.bottomRow}>
                  <TouchableOpacity style={s.vomiMini} onPress={() => vomi(item.id)} disabled={item.dnf || item.dope}>
                    <Text style={{ fontSize: dynamicCardHeight < 65 ? 14 : dynamicCardHeight < 100 ? 18 : 24 }}>🤮</Text>
                  </TouchableOpacity>

                  <Text style={[s.avgText, { fontSize: dynamicCardHeight < 65 ? 10 : dynamicCardHeight < 100 ? 12 : 14 }]}>{avg || '--:-- / 🍺'}</Text>
                </View>

                {item.isPunctured && <Text style={s.x2Text}>BOIRE X2 🥤🥤</Text>}
              </TouchableOpacity>
            </View>
          );
        }}
      />



      <Modal visible={showRavito} transparent animationType="fade">
        <View style={s.mBg}>
          <View style={s.mBox}>
            <Text style={s.mT}>🍹 RAVITO !</Text>
            {['DING DING', 'VIKING', 'GRENOUILLE', 'AUTRE'].map((g) => (
              <TouchableOpacity key={g} style={s.mBtn} onPress={() => setShowRavito(false)}>
                <Text style={s.mBtnT}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={showSprintAlert} transparent animationType="slide">
        <View style={[s.mBg, { backgroundColor: 'rgba(231, 76, 60, 0.9)' }]}>
          <View style={s.mBox}>
            <Text style={[s.mT, { color: '#E74C3C' }]}>🏁 PIF PAF GÉNÉRAL !</Text>
            <TouchableOpacity style={[s.mBtn, { backgroundColor: '#E74C3C' }]} onPress={() => setShowSprintAlert(false)}>
              <Text style={[s.mBtnT, { color: 'white' }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPuncture} transparent animationType="fade">
        <View style={[s.mBg, { backgroundColor: 'rgba(211, 84, 0, 0.9)' }]}>
          <View style={s.mBox}>
            <Text style={[s.mT, { color: '#D35400' }]}>🛠️ CREVAISON !</Text>
            <TouchableOpacity style={[s.mBtn, { backgroundColor: '#D35400' }]} onPress={() => setShowPuncture(false)}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>C'EST PARTI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {spr && st > 0 && (
        <View style={s.stBar}>
          <Text style={s.stT}>
            CHRONO PIF PAF : {Math.floor(st / 60)}:{(st % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* MODAL DE CLASSEMENT PIF PAF */}
      <Modal visible={showPifPafRanking} transparent animationType="slide">
        <View style={s.mBg}>
          <View style={[s.mBox, { maxHeight: '80%', width: '90%' }]}>
            <Text style={[s.mT, { color: '#E74C3C', marginBottom: 20 }]}>🏁 CLASSEMENT PIF PAF</Text>
            <Text style={{ color: '#666', marginBottom: 15, textAlign: 'center', fontSize: 14 }}>
              Appuyez sur un joueur pour l'ajouter au classement dans l'ordre
            </Text>

            <ScrollView style={{ maxHeight: 400, width: '100%' }}>
              {pifPafRanking.length > 0 && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ color: '#E74C3C', fontWeight: 'bold', marginBottom: 10 }}>Classement actuel :</Text>
                  {pifPafRanking.map((player, index) => (
                    <TouchableOpacity
                      key={player.id}
                      style={[s.pifPafRankedCard]}
                      onPress={() => {
                        // Retirer du classement
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        const newRanking = [...pifPafRanking];
                        newRanking.splice(index, 1);
                        setPifPafRanking(newRanking);
                      }}
                    >
                      <View style={s.pifPafRankBadge}>
                        <Text style={s.pifPafRankText}>#{index + 1}</Text>
                      </View>
                      <View style={s.pifPafPlayerInfo}>
                        {player.photo ? (
                          <Image source={{ uri: player.photo }} style={s.pifPafPlayerPhoto} />
                        ) : (
                          <View style={s.pifPafPlayerAvatar}>
                            <Text style={s.pifPafPlayerAvatarText}>{player.n}</Text>
                          </View>
                        )}
                        <Text style={s.pifPafPlayerName}>{player.name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => {
                        // Déplacer vers le haut
                        if (index > 0) {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          const newRanking = [...pifPafRanking];
                          [newRanking[index - 1], newRanking[index]] = [newRanking[index], newRanking[index - 1]];
                          setPifPafRanking(newRanking);
                        }
                      }}>
                        <Text style={{ fontSize: 20 }}>⬆️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {
                        // Déplacer vers le bas
                        if (index < pifPafRanking.length - 1) {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          const newRanking = [...pifPafRanking];
                          [newRanking[index], newRanking[index + 1]] = [newRanking[index + 1], newRanking[index]];
                          setPifPafRanking(newRanking);
                        }
                      }}>
                        <Text style={{ fontSize: 20 }}>⬇️</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={{ color: '#666', fontWeight: 'bold', marginBottom: 10, marginTop: 10 }}>
                Joueurs non classés :
              </Text>
              {pifPafPlayers
                .filter((p) => !pifPafRanking.some((r) => r.id === p.id))
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={s.pifPafPlayerCard}
                    onPress={() => {
                      // Ajouter le joueur à la fin du classement
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setPifPafRanking([...pifPafRanking, player]);
                    }}
                  >
                    <View style={s.pifPafPlayerInfo}>
                      {player.photo ? (
                        <Image source={{ uri: player.photo }} style={s.pifPafPlayerPhoto} />
                      ) : (
                        <View style={s.pifPafPlayerAvatar}>
                          <Text style={s.pifPafPlayerAvatarText}>{player.n}</Text>
                        </View>
                      )}
                      <Text style={s.pifPafPlayerName}>{player.name}</Text>
                    </View>
                    <Text style={{ color: '#999', fontSize: 20 }}>➕</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
              <TouchableOpacity
                style={[s.mBtn, { backgroundColor: '#95a5a6', flex: 1 }]}
                onPress={() => {
                  setShowPifPafRanking(false);
                  setPifPafRanking([]);
                }}
              >
                <Text style={s.mBtnT}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.mBtn,
                  {
                    backgroundColor: pifPafRanking.length === pifPafPlayers.length ? '#27ae60' : '#95a5a6',
                    flex: 1,
                  },
                ]}
                disabled={pifPafRanking.length !== pifPafPlayers.length}
                onPress={() => {
                  // Valider le classement et marquer les joueurs comme terminés
                  const sortedRanking = [...pifPafRanking];

                  // Compute updatedPs locally using the current ps state
                  const updatedPs = ps.map((x) => {
                    const rankIndex = sortedRanking.findIndex((r) => r.id === x.id);
                    if (rankIndex >= 0) {
                      return { ...x, f: true, t: stageData[STAGE_LENGTH].t };
                    }
                    return x;
                  });

                  // Update players state
                  setPs(updatedPs);

                  // Update ranking and check for game over
                  setRanking((prevRanking) => {
                    const newRanking = [...prevRanking, ...sortedRanking];

                    const survivors = updatedPs.filter((p) => !p.dnf && !p.dope);
                    const isGameTotallyOver = newRanking.length >= survivors.length;

                    if (isGameTotallyOver) {
                      setTimeout(() => {
                        navigation.navigate('Podium', {
                          ranking: newRanking,
                          isGameOver: isGameTotallyOver,
                        });
                      }, 500);
                    }

                    return newRanking;
                  });

                  // Reset du sprint
                  setSpr(false);
                  setSt(600);
                  setSprintActivatorId(null);
                  setShowPifPafRanking(false);
                  setPifPafRanking([]);
                  setPifPafPlayers([]);
                  setIsPifPafCompleted(true);
                }}
              >
                <Text style={s.mBtnT}>
                  Valider ({pifPafRanking.length}/{pifPafPlayers.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  gArea: { height: 365, backgroundColor: '#1A1A1A', paddingTop: 40, alignItems: 'center' },
  headerChart: { width: SW * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { color: '#FFD700', fontWeight: 'bold', fontSize: 25 },

  globalTimerBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  globalTimerText: { color: 'white', fontWeight: '900', fontSize: 30 },

  chart: { width: SW * 0.9, height: CH, position: 'relative' },



  ball: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 10,
    marginLeft: -15,
    overflow: 'hidden',
  },
  ballImg: { width: '100%', height: '100%', borderRadius: 999 },
  bt: { fontSize: 10, fontWeight: 'bold', color: 'white' },

  card: { flex: 1, margin: 8, borderRadius: 15, overflow: 'hidden' },
  cardAction: { flex: 1, padding: 12, justifyContent: 'space-between' },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pseudo: { color: 'white', fontWeight: '900', maxWidth: '70%' },
  posText: { color: 'white', fontWeight: '900', fontSize: 18 },

  lvlLine: { color: 'white', fontSize: 12, fontWeight: '900', marginTop: -2 },

  centerBlock: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerBig: { color: 'white', fontSize: 38, fontWeight: '900', letterSpacing: 0.5 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  vomiMini: { paddingHorizontal: 4, paddingVertical: 2 },
  avgText: { color: 'rgba(255,255,255,0.95)', fontWeight: '900', fontSize: 14 },

  stBar: { padding: 10, alignItems: 'center', backgroundColor: '#E74C3C' },
  stT: { color: 'white', fontWeight: 'bold' },

  mBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  mBox: { width: '80%', backgroundColor: '#222', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#FFD700', alignItems: 'center' },
  mT: { color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  mBtn: { backgroundColor: '#FFD700', padding: 12, borderRadius: 10, marginVertical: 5, width: 140 },
  mBtnT: { textAlign: 'center', fontWeight: 'bold', color: 'black' },

  reviveBtn: { backgroundColor: '#FFD700', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, marginTop: 10 },
  reviveText: { color: 'black', fontWeight: 'bold', fontSize: 14 },

  x2Text: { color: 'white', fontWeight: 'bold', fontSize: 12, marginTop: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 8, borderRadius: 4 },

  pifPafPlayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pifPafPlayerCardSelected: {
    borderColor: '#E74C3C',
    backgroundColor: '#ffe5e5',
  },
  pifPafPlayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pifPafPlayerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  pifPafPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pifPafPlayerAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pifPafPlayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  pifPafRankBadge: {
    backgroundColor: '#E74C3C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pifPafRankText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 18,
  },
  pifPafRankedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E74C3C',
    gap: 10,
  },
  podiumButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  podiumButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  pifPafZone: {
    position: 'absolute',
    top: 10,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    maxWidth: 200,
  },
  pifPafZoneTitle: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  pifPafZoneContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  ballMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
  },
  btMini: {
    fontSize: 8,
    fontWeight: 'bold',
    color: 'white',
  },
});