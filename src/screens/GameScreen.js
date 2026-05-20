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
const CH = 200;

export default function GameScreen({ route, navigation }) {
  const { players: initP = [], stageKey } = route.params || {};

  const currentStage = STAGES[stageKey];

  if (!currentStage) {
    return (
      <View style={s.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginTop: 100 }}>Erreur: Étape introuvable</Text>
      </View>
    );
  }

  const stageData = currentStage.data || {};
  const stageHeights = currentStage.heights || {};

  const allHeights = Object.values(stageHeights);
  const maxHeight = Math.max(...allHeights, 100);
  const STAGE_LENGTH = Object.keys(stageHeights).length > 0 ? Object.keys(stageHeights).length : 20;

  const PADDING_TOP = 50;
  const PADDING_BOTTOM = 15;
  const DRAWING_HEIGHT = CH - PADDING_TOP - PADDING_BOTTOM;
  const scaleFactor = DRAWING_HEIGHT / maxHeight;
  const getY = (h) => CH - PADDING_BOTTOM - ((h || 0) * scaleFactor);

  const step = (SW * 0.92) / (STAGE_LENGTH - 1);

  const linePoints = [...Array(STAGE_LENGTH)]
    .map((_, i) => {
      const h = stageHeights[i + 1] || 0;
      return `${i * step},${getY(h)}`;
    })
    .join(' ');

  const fillPoints = `${linePoints} ${(STAGE_LENGTH - 1) * step},${CH} 0,${CH}`;

  // --- CALCUL TAILLE CARTES ---
  const GAREA_H = 340;
  const AVAILABLE_HEIGHT = SH - GAREA_H;
  const pCount = Math.max(3, initP.length);
  const rows = Math.ceil(pCount / 3);
  const dynamicCardHeight = Math.min(130, Math.max(55, (AVAILABLE_HEIGHT / rows) - 10));

  // --- ÉTATS DU JEU ---
  const [globalTimer, setGlobalTimer] = useState(0);
  const [paused, setPaused] = useState(false);

  const [ps, setPs] = useState(
    initP.map((p, i) => ({
      ...p,
      lvl: 1,
      t: stageData[1]?.t ?? 300,
      n: i + 1,
      f: false,
      dnf: false,
      dope: false,
      isPunctured: false,
      punctureLvl: Math.floor(Math.random() * (Math.max(4, STAGE_LENGTH - 3) - 4 + 1)) + 4,
      startAt: Date.now(),
    }))
  );

  const [spr, setSpr] = useState(false);
  const [st, setSt] = useState(600);
  const [sprintActivatorId, setSprintActivatorId] = useState(null);
  const [showRavito, setShowRavito] = useState(false);
  const [ravitoCount, setRavitoCount] = useState({});
  const [showSprintAlert, setShowSprintAlert] = useState(false);
  const [showPuncture, setShowPuncture] = useState(false);
  const [showPifPafRanking, setShowPifPafRanking] = useState(false);
  const [pifPafPlayers, setPifPafPlayers] = useState([]);
  const [pifPafRanking, setPifPafRanking] = useState([]);
  const [isPifPafCompleted, setIsPifPafCompleted] = useState(false);
  const [ranking, setRanking] = useState([]);

  // --- REFS POUR TIMER STABLE ---
  const sprRef = useRef(false);
  const stRef = useRef(600);
  const psRef = useRef([]);
  const pifPafShownRef = useRef(false);
  const pausedRef = useRef(false);
  useEffect(() => { sprRef.current = spr; }, [spr]);
  useEffect(() => { stRef.current = st; }, [st]);
  useEffect(() => { psRef.current = ps; }, [ps]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // --- TIMER PRINCIPAL (créé une seule fois) ---
  useEffect(() => {
    const clock = setInterval(() => {
      if (pausedRef.current) return;

      setGlobalTimer((prev) => prev + 1);

      setPs((prev) =>
        prev.map((x) => {
          if (x.dnf || x.dope) return x;
          if (x.f) return x.t > 0 ? { ...x, t: x.t - 1 } : x;
          if (x.lvl === STAGE_LENGTH && sprRef.current && stRef.current > 0) return x;
          if (x.t <= 0) return { ...x, dnf: true, t: 0 };
          return { ...x, t: x.t - 1 };
        })
      );

      if (sprRef.current && stRef.current > 0) {
        setSt((s) => {
          const next = s - 1;
          stRef.current = next;
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(clock);
  }, []); // Une seule fois

  // --- DÉCLENCHEMENT PIFPAF ---
  useEffect(() => {
    if (!spr) { pifPafShownRef.current = false; return; }
    if (st === 0 && !pifPafShownRef.current && !showPifPafRanking) {
      pifPafShownRef.current = true;
      const playersAtLvlMax = psRef.current.filter(
        (p) => p.lvl === STAGE_LENGTH && !p.dnf && !p.dope
      );
      setPifPafPlayers(playersAtLvlMax);
      setShowPifPafRanking(true);
    }
  }, [spr, st, showPifPafRanking]);

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
      // Moins de temps restant = presque fini sa bière = meilleur rang
      return a.t - b.t;
    });
    const map = {};
    sorted.forEach((p, idx) => { map[p.id] = idx + 1; });
    return { map, total: sorted.length };
  };

  const getAvgTimePerBeer = (p) => {
    const beers = Math.max(0, (p.lvl || 1) - 1);
    if (beers === 0) return null;
    const elapsedSec = Math.max(1, Math.floor((Date.now() - (p.startAt || Date.now())) / 1000));
    const avgSec = Math.round(elapsedSec / beers);
    const m = Math.floor(avgSec / 60);
    const s2 = (avgSec % 60).toString().padStart(2, '0');
    return `${m}:${s2}/🍺`;
  };

  // --- LOGIQUE DE FIN ---
  const handleFinish = (finishedPlayer, currentPs) => {
    setRanking((prevRanking) => {
      const newRanking = [...prevRanking, finishedPlayer];
      const survivors = currentPs.filter((p) => !p.dnf && !p.dope);
      const isGameTotallyOver = newRanking.length >= survivors.length;

      setTimeout(() => {
        navigation.navigate('Podium', { ranking: newRanking, isGameOver: isGameTotallyOver });
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

      const n = p.lvl + 1;

      if (n === STAGE_LENGTH && !spr && !isPifPafCompleted) {
        setSpr(true);
        setSprintActivatorId(id);
        setShowSprintAlert(true);
      }

      if (p.lvl === STAGE_LENGTH) {
        if (isPifPafCompleted) {
          playerToFinish = p;
          const nextState = curr.map((x) => (x.id === id ? { ...x, f: true, t: stageData[STAGE_LENGTH]?.t ?? 300 } : x));
          updatedPsSnapshot = nextState;
          return nextState;
        }
        if (st > 0) return curr;
        playerToFinish = p;
        const nextState = curr.map((x) => (x.id === id ? { ...x, f: true, t: stageData[STAGE_LENGTH]?.t ?? 300 } : x));
        updatedPsSnapshot = nextState;
        return nextState;
      }

      if (n === p.punctureLvl) {
        setShowPuncture(true);
        return curr.map((x) =>
          x.id === id ? { ...x, lvl: n, t: stageData[n]?.t ?? 300, isPunctured: true } : x
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
        return { ...x, lvl: n, t: stageData[n]?.t ?? 300, isPunctured: false };
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
        if (x.f) return { ...x, dope: true, f: false, t: 0 };
        if (x.lvl > 1 && !x.dnf)
          return { ...x, lvl: x.lvl - 1, t: stageData[x.lvl - 1]?.t ?? 300, isPunctured: false };
        return { ...x };
      });

      const player = updated.find((p) => p.id === id);
      if (sprintActivatorId === id && player && player.lvl === (STAGE_LENGTH - 1) && spr && st > 0) {
        setSpr(false);
        setSt(600);
        setSprintActivatorId(null);
      }
      return updated;
    });
  };

  const revive = (id) => {
    setPs((curr) =>
      curr.map((x) => (x.id === id && x.dnf ? { ...x, dnf: false, t: stageData[x.lvl]?.t ?? 300 } : x))
    );
  };

  const cardColor = (item) => {
    if (item.dnf) return '#1a1a1a';
    if (item.dope) return '#4a1d6e';
    if (item.f) return '#1a0a2e';
    if (item.lvl === STAGE_LENGTH && st > 0) return '#0d2b4a';
    if (item.isPunctured) return '#4a1800';
    if (item.t <= 30) return '#5c0a00';
    if (item.t <= 90) return '#4a2800';
    return '#0a2a15';
  };

  const accentColor = (item) => {
    if (item.dnf) return '#444';
    if (item.dope) return '#9b59b6';
    if (item.f) return '#8e44ad';
    if (item.lvl === STAGE_LENGTH && st > 0) return '#2980b9';
    if (item.isPunctured) return '#e67e22';
    if (item.t <= 30) return '#e74c3c';
    if (item.t <= 90) return '#f39c12';
    return '#2ecc71';
  };

  const { map: posMap, total: posTotal } = getPositions(ps);

  // --- POSITIONS EMPILÉES SVG ---
  const getYMemo = useMemo(
    () => (h) => CH - PADDING_BOTTOM - ((h || 0) * scaleFactor),
    [scaleFactor]
  );

  const playerPositions = useMemo(() => {
    const positions = {};
    const playersByLevel = {};
    ps.filter((p) => !p.dnf).forEach((p) => {
      if (!playersByLevel[p.lvl]) playersByLevel[p.lvl] = [];
      playersByLevel[p.lvl].push(p);
    });
    Object.keys(playersByLevel).forEach((lvlStr) => {
      const lvl = parseInt(lvlStr, 10);
      const playersAtLevel = playersByLevel[lvlStr];
      const lineY = getYMemo(stageHeights[lvl]);
      const baseY = lineY - 14;
      const offsetStep = 30;
      const sortedPlayers = [...playersAtLevel].sort((a, b) => (posMap[a.id] || 999) - (posMap[b.id] || 999));
      sortedPlayers.forEach((player, index) => {
        let finalY = baseY - index * offsetStep;
        if (index > 0 || sortedPlayers.length > 1) finalY = Math.max(finalY, 4);
        positions[player.id] = { left: (player.lvl - 1) * step, top: finalY };
      });
    });
    return positions;
  }, [ps, stageHeights, posMap, step, getYMemo]);

  // --- ANIMATIONS JETONS ---
  const animatedPositionsRef = useRef({});
  useEffect(() => {
    ps.filter((p) => !p.dnf).forEach((p) => {
      const targetPos = playerPositions[p.id];
      if (!targetPos) return;
      if (!animatedPositionsRef.current[p.id]) {
        animatedPositionsRef.current[p.id] = {
          left: new Animated.Value(targetPos.left),
          top: new Animated.Value(targetPos.top),
        };
      } else {
        const animatedPos = animatedPositionsRef.current[p.id];
        const hasChanged =
          Math.abs(animatedPos.left._value - targetPos.left) > 0.5 ||
          Math.abs(animatedPos.top._value - targetPos.top) > 0.5;
        if (hasChanged) {
          Animated.parallel([
            Animated.spring(animatedPos.left, { toValue: targetPos.left, useNativeDriver: false, tension: 60, friction: 8 }),
            Animated.spring(animatedPos.top, { toValue: targetPos.top, useNativeDriver: false, tension: 60, friction: 8 }),
          ]).start();
        }
      }
    });
    Object.keys(animatedPositionsRef.current).forEach((playerId) => {
      if (!ps.some((p) => p.id === playerId && !p.dnf)) delete animatedPositionsRef.current[playerId];
    });
  }, [playerPositions, ps]);

  // --- ANIMATION PULSE TIMER (< 60s) ---
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef(null);
  useEffect(() => {
    const hasUrgent = ps.some((p) => !p.dnf && !p.dope && !p.f && p.t > 0 && p.t <= 60);
    if (hasUrgent && !paused) {
      if (!pulseRef.current) {
        pulseRef.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          ])
        );
        pulseRef.current.start();
      }
    } else {
      if (pulseRef.current) {
        pulseRef.current.stop();
        pulseRef.current = null;
        pulseAnim.setValue(1);
      }
    }
  }, [ps, paused]);

  // Rendre le composant carte avec barre de progression et tout le polish
  const renderCard = ({ item }) => {
    const pos = posMap[item.id] || '-';
    const avg = getAvgTimePerBeer(item);
    const beersFinished = Math.max(0, item.lvl - 1);
    const accent = accentColor(item);
    const bg = cardColor(item);

    // Progression de la bière actuelle
    const maxT = stageData[item.lvl]?.t ?? 300;
    const progress = item.dnf || item.dope ? 0 : Math.max(0, Math.min(1, 1 - item.t / maxT));

    const isUrgent = !item.dnf && !item.dope && !item.f && item.t > 0 && item.t <= 60;
    const scaleStyle = isUrgent ? { transform: [{ scale: pulseAnim }] } : {};

    const smallFont = dynamicCardHeight < 60;
    const medFont = dynamicCardHeight < 90;

    return (
      <View style={[s.card, { backgroundColor: bg, height: dynamicCardHeight, borderColor: accent }]}>
        {/* Barre de progression */}
        <View style={s.progressBarBg}>
          <Animated.View
            style={[
              s.progressBarFill,
              { width: `${progress * 100}%`, backgroundColor: accent },
            ]}
          />
        </View>

        <TouchableOpacity
          style={s.cardAction}
          onPress={() => press(item.id)}
          disabled={item.dnf || (item.f && item.t <= 0) || item.dope}
          activeOpacity={0.8}
        >
          {/* Ligne du haut : photo + nom + position */}
          <View style={s.topRow}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={[s.cardPhoto, { width: smallFont ? 22 : 28, height: smallFont ? 22 : 28, borderRadius: smallFont ? 11 : 14 }]} />
            ) : (
              <View style={[s.cardAvatar, { width: smallFont ? 20 : 26, height: smallFont ? 20 : 26, borderRadius: smallFont ? 10 : 13, backgroundColor: accent }]}>
                <Text style={[s.cardAvatarText, { fontSize: smallFont ? 8 : 10 }]}>{item.n}</Text>
              </View>
            )}
            <Text style={[s.pseudo, { fontSize: smallFont ? 10 : medFont ? 13 : 16, marginLeft: 4 }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[s.posText, { fontSize: smallFont ? 9 : medFont ? 11 : 14, color: accent }]}>
              {pos}/{posTotal || '-'}
            </Text>
          </View>

          {/* État + timer */}
          <View style={s.centerBlock}>
            {item.dnf ? (
              <TouchableOpacity style={[s.reviveBtn, { paddingVertical: smallFont ? 3 : 5 }]} onPress={() => revive(item.id)}>
                <Text style={[s.reviveText, { fontSize: smallFont ? 8 : 11 }]}>🔄 REVIVRE</Text>
              </TouchableOpacity>
            ) : (
              <Animated.Text style={[s.timerBig, scaleStyle, { fontSize: smallFont ? 16 : medFont ? 22 : 30, color: accent }]}>
                {item.dope ? 'DISQ' : item.lvl === STAGE_LENGTH && st > 0 ? '⏳' : formatTime(item.t)}
              </Animated.Text>
            )}
          </View>

          {/* Ligne du bas : vomi + infos */}
          <View style={s.bottomRow}>
            <TouchableOpacity style={s.vomiMini} onPress={() => vomi(item.id)} disabled={item.dnf || item.dope}>
              <Text style={{ fontSize: smallFont ? 12 : medFont ? 16 : 20 }}>🤮</Text>
            </TouchableOpacity>
            <View style={s.bottomInfo}>
              <Text style={[s.lvlBadge, { fontSize: smallFont ? 7 : 9, backgroundColor: accent }]}>
                {item.dnf ? 'DNF' : item.dope ? 'DOPÉ' : item.f ? 'FINI ✓' : item.isPunctured ? '🔧 X2' : item.lvl === STAGE_LENGTH && st > 0 ? 'PIF PAF' : `LVL ${item.lvl}`}
              </Text>
              {beersFinished > 0 && !item.dnf && !item.dope && (
                <Text style={[s.beerCount, { fontSize: smallFont ? 7 : 9 }]}>{'🍺'.repeat(Math.min(beersFinished, 5))}{beersFinished > 5 ? `+${beersFinished - 5}` : ''}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* ZONE GRAPHIQUE */}
      <View style={[s.gArea, { height: GAREA_H }]}>
        <View style={s.headerChart}>
          <Text style={[s.title, { color: currentStage.color }]}>{currentStage.title}</Text>
          <View style={s.headerRight}>
            {/* PAUSE */}
            <TouchableOpacity style={s.pauseBtn} onPress={() => setPaused((p) => !p)}>
              <Text style={s.pauseIcon}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <View style={[s.globalTimerBox, { borderColor: currentStage.color + '55' }]}>
              <Text style={[s.globalTimerText, { color: currentStage.color }]}>{formatGlobalTime(globalTimer)}</Text>
            </View>
          </View>
        </View>

        {/* PAUSE OVERLAY */}
        {paused && (
          <View style={s.pauseOverlay}>
            <Text style={s.pauseOverlayText}>⏸ PAUSE</Text>
          </View>
        )}

        {/* Bouton podium */}
        {ranking.length > 0 && (
          <TouchableOpacity
            style={s.podiumButton}
            onPress={() => {
              const survivors = ps.filter((p) => !p.dnf && !p.dope);
              navigation.navigate('Podium', { ranking, isGameOver: ranking.length >= survivors.length });
            }}
          >
            <Text style={s.podiumButtonText}>🏆 PODIUM ({ranking.length})</Text>
          </TouchableOpacity>
        )}

        <View style={s.chart}>
          <Svg height={CH} width={SW * 0.92}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={currentStage.color} stopOpacity="0.7" />
                <Stop offset="1" stopColor={currentStage.color} stopOpacity="0.05" />
              </LinearGradient>
            </Defs>
            <Path d={`M ${fillPoints} Z`} fill="url(#grad)" />
            <Polyline
              points={linePoints}
              fill="none"
              stroke={currentStage.color}
              strokeWidth="2.5"
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
                      backgroundColor: accentColor(p),
                      borderColor: 'rgba(255,255,255,0.6)',
                    },
                  ]}
                >
                  {p.photo ? <Image source={{ uri: p.photo }} style={s.ballImg} /> : <Text style={s.bt}>{p.n}</Text>}
                </Animated.View>
              )
          )}

          {/* Zone d'attente PifPaf */}
          {spr && (
            <View style={s.pifPafZone}>
              <Text style={s.pifPafZoneTitle}>⏳ PIF PAF</Text>
              <View style={s.pifPafZoneContent}>
                {ps.filter((p) => !p.dnf && p.lvl === STAGE_LENGTH).map((p) => (
                  <View key={p.id} style={[s.ballMini, { backgroundColor: accentColor(p) }]}>
                    {p.photo ? <Image source={{ uri: p.photo }} style={s.ballImg} /> : <Text style={s.btMini}>{p.n}</Text>}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* BARRE PIF PAF — bien visible entre le graphe et les cartes */}
      {spr && st > 0 && (
        <View style={[s.stBar, { backgroundColor: st <= 60 ? '#c0392b' : st <= 180 ? '#e67e22' : '#2980b9' }]}>
          <Text style={s.stT}>
            ⏱ PIF PAF : {Math.floor(st / 60)}:{(st % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      <FlatList
        data={ps}
        numColumns={3}
        keyExtractor={(it) => it.id}
        renderItem={renderCard}
        scrollEnabled={false}
        style={s.list}
      />

      {/* MODAL RAVITO */}
      <Modal visible={showRavito} transparent animationType="fade">
        <View style={s.mBg}>
          <View style={s.mBox}>
            <Text style={s.mT}>🍹 RAVITO !</Text>
            <Text style={{ color: '#888', marginBottom: 16, textAlign: 'center', fontSize: 13 }}>Choisissez un jeu</Text>
            {['DING DING 🔔', 'VIKING 🪖', 'GRENOUILLE 🐸', 'AUTRE 🎲'].map((g) => (
              <TouchableOpacity key={g} style={s.mBtn} onPress={() => setShowRavito(false)}>
                <Text style={s.mBtnT}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* MODAL SPRINT */}
      <Modal visible={showSprintAlert} transparent animationType="slide">
        <View style={[s.mBg, { backgroundColor: 'rgba(192, 57, 43, 0.95)' }]}>
          <View style={s.mBox}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🏁</Text>
            <Text style={[s.mT, { color: '#e74c3c' }]}>PIF PAF GÉNÉRAL !</Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 20, fontSize: 13 }}>
              Le chrono de 10 min est lancé
            </Text>
            <TouchableOpacity style={[s.mBtn, { backgroundColor: '#e74c3c', width: '100%' }]} onPress={() => setShowSprintAlert(false)}>
              <Text style={[s.mBtnT, { color: 'white' }]}>C'EST PARTI 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CREVAISON */}
      <Modal visible={showPuncture} transparent animationType="fade">
        <View style={[s.mBg, { backgroundColor: 'rgba(150, 60, 0, 0.95)' }]}>
          <View style={s.mBox}>
            <Text style={{ fontSize: 48, marginBottom: 8 }}>🔧</Text>
            <Text style={[s.mT, { color: '#e67e22' }]}>CREVAISON !</Text>
            <Text style={{ color: '#888', textAlign: 'center', marginBottom: 20, fontSize: 13 }}>
              Tu dois boire X2 sur ce niveau
            </Text>
            <TouchableOpacity style={[s.mBtn, { backgroundColor: '#e67e22', width: '100%' }]} onPress={() => setShowPuncture(false)}>
              <Text style={[s.mBtnT, { color: 'white' }]}>ON Y VA 💪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CLASSEMENT PIF PAF */}
      <Modal visible={showPifPafRanking} transparent animationType="slide">
        <View style={s.mBg}>
          <View style={[s.mBox, { maxHeight: '85%', width: '92%' }]}>
            <Text style={[s.mT, { color: '#e74c3c', marginBottom: 4 }]}>🏁 CLASSEMENT PIF PAF</Text>
            <Text style={{ color: '#555', marginBottom: 14, textAlign: 'center', fontSize: 13 }}>
              Tape dans l'ordre d'arrivée
            </Text>

            <ScrollView style={{ maxHeight: 420, width: '100%' }} showsVerticalScrollIndicator={false}>
              {pifPafRanking.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: '#e74c3c', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>
                    ✅ Classement actuel :
                  </Text>
                  {pifPafRanking.map((player, index) => (
                    <TouchableOpacity
                      key={player.id}
                      style={s.pifPafRankedCard}
                      onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        const newR = [...pifPafRanking];
                        newR.splice(index, 1);
                        setPifPafRanking(newR);
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
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity onPress={() => {
                          if (index > 0) {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            const newR = [...pifPafRanking];
                            [newR[index - 1], newR[index]] = [newR[index], newR[index - 1]];
                            setPifPafRanking(newR);
                          }
                        }}><Text style={{ fontSize: 18 }}>⬆️</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          if (index < pifPafRanking.length - 1) {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            const newR = [...pifPafRanking];
                            [newR[index], newR[index + 1]] = [newR[index + 1], newR[index]];
                            setPifPafRanking(newR);
                          }
                        }}><Text style={{ fontSize: 18 }}>⬇️</Text></TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={{ color: '#444', fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>
                🕐 Pas encore classés :
              </Text>
              {pifPafPlayers
                .filter((p) => !pifPafRanking.some((r) => r.id === p.id))
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={s.pifPafPlayerCard}
                    onPress={() => {
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
                    <Text style={{ color: '#555', fontSize: 22 }}>➕</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              <TouchableOpacity
                style={[s.mBtn, { backgroundColor: '#2c2c2c', flex: 1 }]}
                onPress={() => { setShowPifPafRanking(false); setPifPafRanking([]); }}
              >
                <Text style={[s.mBtnT, { color: '#aaa' }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.mBtn, { backgroundColor: pifPafRanking.length === pifPafPlayers.length ? '#27ae60' : '#2c2c2c', flex: 1 }]}
                disabled={pifPafRanking.length !== pifPafPlayers.length}
                onPress={() => {
                  const sortedRanking = [...pifPafRanking];
                  const updatedPs = ps.map((x) => {
                    const rankIndex = sortedRanking.findIndex((r) => r.id === x.id);
                    return rankIndex >= 0 ? { ...x, f: true, t: stageData[STAGE_LENGTH]?.t ?? 300 } : x;
                  });
                  setPs(updatedPs);
                  setRanking((prevRanking) => {
                    const newRanking = [...prevRanking, ...sortedRanking];
                    const survivors = updatedPs.filter((p) => !p.dnf && !p.dope);
                    const isGameTotallyOver = newRanking.length >= survivors.length;
                    if (isGameTotallyOver) {
                      setTimeout(() => {
                        navigation.navigate('Podium', { ranking: newRanking, isGameOver: isGameTotallyOver });
                      }, 500);
                    }
                    return newRanking;
                  });
                  setSpr(false);
                  setSt(600);
                  setSprintActivatorId(null);
                  setShowPifPafRanking(false);
                  setPifPafRanking([]);
                  setPifPafPlayers([]);
                  setIsPifPafCompleted(true);
                }}
              >
                <Text style={[s.mBtnT, { color: pifPafRanking.length === pifPafPlayers.length ? 'white' : '#555' }]}>
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
  container: { flex: 1, backgroundColor: '#080808' },

  gArea: { backgroundColor: '#080808', paddingTop: 36, alignItems: 'center' },
  headerChart: {
    width: SW * 0.92,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { color: '#FFF', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  pauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: { color: '#FFD700', fontSize: 14, fontWeight: 'bold' },

  globalTimerBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  globalTimerText: { color: 'white', fontWeight: '900', fontSize: 22 },

  pauseOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  pauseOverlayText: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 6,
  },

  chart: { width: SW * 0.92, height: CH, position: 'relative' },

  ball: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    zIndex: 10,
    marginLeft: -10,
    overflow: 'hidden',
  },
  ballImg: { width: '100%', height: '100%', borderRadius: 999 },
  bt: { fontSize: 9, fontWeight: '900', color: 'white' },

  pifPafZone: {
    position: 'absolute',
    top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
    maxWidth: 160,
  },
  pifPafZoneTitle: { color: '#FFD700', fontSize: 9, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  pifPafZoneContent: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 3 },
  ballMini: {
    width: 18, height: 18, borderRadius: 9,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    overflow: 'hidden',
  },
  btMini: { fontSize: 7, fontWeight: '900', color: 'white' },

  podiumButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 4,
    alignSelf: 'center',
  },
  podiumButtonText: { color: '#000', fontWeight: '900', fontSize: 12 },

  stBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  stT: { color: 'white', fontWeight: '900', fontSize: 15, letterSpacing: 1 },

  list: { flex: 1 },

  // Carte joueur
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: 3,
    borderRadius: 0,
  },
  cardAction: { flex: 1, padding: 8, justifyContent: 'space-between' },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardPhoto: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  cardAvatar: { justifyContent: 'center', alignItems: 'center' },
  cardAvatarText: { color: '#000', fontWeight: '900' },
  pseudo: { color: 'white', fontWeight: '900', flex: 1 },
  posText: { fontWeight: '900' },

  centerBlock: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerBig: { color: 'white', fontWeight: '900', letterSpacing: 0.5 },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  vomiMini: { paddingHorizontal: 2, paddingVertical: 1 },
  bottomInfo: { alignItems: 'flex-end', gap: 2 },
  lvlBadge: {
    color: '#000',
    fontWeight: '900',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  beerCount: { color: 'rgba(255,255,255,0.6)' },

  reviveBtn: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  reviveText: { color: 'black', fontWeight: 'bold' },

  // Modals
  mBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  mBox: {
    width: '82%',
    backgroundColor: '#111',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
  },
  mT: { color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  mBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    width: 160,
    alignItems: 'center',
  },
  mBtnT: { textAlign: 'center', fontWeight: '900', color: 'black', fontSize: 14 },

  pifPafPlayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  pifPafPlayerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pifPafPlayerPhoto: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  pifPafPlayerAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  pifPafPlayerAvatarText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  pifPafPlayerName: { fontSize: 15, fontWeight: 'bold', color: '#FFF', flex: 1 },
  pifPafRankBadge: {
    backgroundColor: '#FFD700',
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  pifPafRankText: { color: '#000', fontWeight: '900', fontSize: 14 },
  pifPafRankedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FFD70055',
    gap: 6,
  },
});