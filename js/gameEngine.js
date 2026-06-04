// Hanafuda Game Engine
// Manages the state machine, rules, dealing, match resolution, and logs.

import { INITIAL_CARDS, MONTH_DETAILS, SPECIAL_CARDS } from './cardData.js';
import { calculateScore } from './yakuCalculator.js';

export class HanafudaGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.deck = [];
    this.specialDeck = [];
    this.hands = {
      player: [],
      cpu: []
    };
    this.specialHands = {
      player: [],
      cpu: []
    };
    this.field = [];
    this.captured = {
      player: [],
      cpu: []
    };
    this.scores = {
      player: 0,
      cpu: 0
    };
    this.roundScores = {
      player: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] },
      cpu: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] }
    };
    this.currentTurn = 'player'; // 'player' or 'cpu'
    this.firstActor = 'player';
    this.secondActor = 'cpu';
    this.phase = 'START_ROUND'; // START_ROUND, PLAY_HAND, RESOLVE_HAND_CHOICE, CPU_CHOICE, ROUND_OVER, GAME_OVER
    this.round = 1;
    this.maxRounds = 1;
    this.turnsTaken = {
      player: 0,
      cpu: 0
    };
    this.usedSpecialThisTurn = false;
    this.specialCardSerial = 0;
    this.specialPresentation = null;
    this.announcementPresentation = null;
    this.announcementPresentations = [];
    
    // For tracking match selections when cards of the same month are on field.
    this.pendingCard = null; // Card being played from hand
    this.pendingMatches = []; // Field cards available for matching
    this.pendingSource = ''; // 'hand'
    
    this.logs = [];
    this.onStateChange = null; // Callback for state updates
  }

  getActorName(actor) {
    return actor === this.firstActor ? '先手' : '後手';
  }

  getOpponent(actor = this.currentTurn) {
    return actor === 'player' ? 'cpu' : 'player';
  }

  addLog(message, type = 'info') {
    this.logs.push({ text: message, type, id: Date.now() + Math.random().toString() });
    if (this.onStateChange) this.onStateChange(this.getState());
  }

  getState() {
    return {
      deck: this.deck,
      specialDeck: this.specialDeck,
      hands: this.hands,
      specialHands: this.specialHands,
      field: this.field,
      captured: this.captured,
      currentTurn: this.currentTurn,
      firstActor: this.firstActor,
      secondActor: this.secondActor,
      phase: this.phase,
      round: this.round,
      maxRounds: this.maxRounds,
      pendingCard: this.pendingCard,
      pendingMatches: this.pendingMatches,
      logs: this.logs,
      scores: this.scores,
      roundScores: this.roundScores,
      turnsTaken: this.turnsTaken,
      usedSpecialThisTurn: this.usedSpecialThisTurn,
      specialCardSerial: this.specialCardSerial,
      specialPresentation: this.specialPresentation,
      announcementPresentation: this.announcementPresentation,
      announcementPresentations: this.announcementPresentations
    };
  }

  exportState() {
    return JSON.parse(JSON.stringify(this.getState()));
  }

  importState(state) {
    if (!state) return;

    this.deck = state.deck || [];
    this.specialDeck = state.specialDeck || [];
    this.hands = state.hands || { player: [], cpu: [] };
    this.specialHands = state.specialHands || { player: [], cpu: [] };
    this.field = state.field || [];
    this.captured = state.captured || { player: [], cpu: [] };
    this.currentTurn = state.currentTurn || 'player';
    this.firstActor = state.firstActor || 'player';
    this.secondActor = state.secondActor || (this.firstActor === 'player' ? 'cpu' : 'player');
    this.phase = state.phase || 'START_ROUND';
    this.round = state.round || 1;
    this.maxRounds = state.maxRounds || 1;
    this.pendingCard = state.pendingCard || null;
    this.pendingMatches = state.pendingMatches || [];
    this.logs = state.logs || [];
    this.scores = state.scores || { player: 0, cpu: 0 };
    this.roundScores = state.roundScores || {
      player: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] },
      cpu: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] }
    };
    this.turnsTaken = state.turnsTaken || this.turnsTaken || { player: 0, cpu: 0 };
    this.usedSpecialThisTurn = Boolean(state.usedSpecialThisTurn);
    this.specialCardSerial = Number(state.specialCardSerial || this.specialCardSerial || 0);
    this.specialPresentation = state.specialPresentation || null;
    this.announcementPresentation = state.announcementPresentation || null;
    this.announcementPresentations = state.announcementPresentations || (state.announcementPresentation ? [state.announcementPresentation] : []);
  }

  addAnnouncementPresentation(presentation) {
    this.announcementPresentation = presentation;
    this.announcementPresentations.push(presentation);
    if (this.announcementPresentations.length > 8) {
      this.announcementPresentations = this.announcementPresentations.slice(-8);
    }
  }

  registerStateChangeCallback(cb) {
    this.onStateChange = cb;
  }

  // Starts a new round, shuffles, deals cards
  startRound() {
    this.addLog(`--- 第 ${this.round} 回戦 開始 ---`, 'system');
    
    // Copy and shuffle initial deck
    let cards = [...INITIAL_CARDS];
    this.shuffle(cards);

    this.captured.player = [];
    this.captured.cpu = [];
    this.roundScores = {
      player: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] },
      cpu: { yakuPoints: 0, cardPoints: 0, totalPoints: 0, yakus: [] }
    };

    this.turnsTaken = {
      player: 0,
      cpu: 0
    };

    // Deal: 4 cards to each player, 6 cards to the field.
    this.hands.player = cards.slice(0, 4);
    this.hands.cpu = cards.slice(4, 8);
    this.specialHands.player = [];
    this.specialHands.cpu = [];
    this.field = cards.slice(8, 14);
    this.deck = cards.slice(14);
    this.specialDeck = [];
    this.firstActor = Math.random() < 0.5 ? 'player' : 'cpu';
    this.secondActor = this.firstActor === 'player' ? 'cpu' : 'player';
    this.addAnnouncementPresentation({
      id: `game_start_${this.round}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type: 'game-start',
      round: this.round,
      firstActor: this.firstActor,
      secondActor: this.secondActor
    });

    this.addLog("カードが配られました。ゲームを開始します。");
    this.beginTurn(this.firstActor);
    
    if (this.onStateChange) this.onStateChange(this.getState());
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Standard Hana-Awase rules for initial field:
  // - If 4 cards of the same month exist on the field at deal, dealer (player) captures them automatically or we redeal. Let's capture them automatically for simplicity and log it.
  // - If 3 cards of the same month exist, stack them; the remaining 4th card will capture all three.
  resolveInitialField() {
    const monthCounts = {};
    this.field.forEach(c => {
      monthCounts[c.month] = (monthCounts[c.month] || 0) + 1;
    });

    for (const [monthStr, count] of Object.entries(monthCounts)) {
      const month = parseInt(monthStr);
      if (count === 4) {
        // Capture all 4 immediately to current dealer (Player is default dealer for round 1)
        const matched = this.field.filter(c => c.month === month);
        this.field = this.field.filter(c => c.month !== month);
        this.captured.player.push(...matched);
        this.addLog(`場札に同じ月のカードが4枚揃っていたため、プレイヤーが獲得しました (${month}月)。`, 'win');
      }
    }
    
    // We update scores
    this.recalculateRoundScores();
  }

  // Recalculates points and formed Yakus
  recalculateRoundScores() {
    const playerResult = calculateScore(this.captured.player);
    const cpuResult = calculateScore(this.captured.cpu);

    this.roundScores.player = playerResult;
    this.roundScores.cpu = cpuResult;
  }

  // Returns list of cards on the field that match the month of the target card
  getMatchesOnField(card) {
    return this.field.filter(c => c.month === card.month);
  }

  beginTurn(actor) {
    this.currentTurn = actor;
    this.usedSpecialThisTurn = false;
    this.addAnnouncementPresentation({
      id: `turn_start_${actor}_${this.turnsTaken[actor] + 1}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type: 'turn-start',
      actor,
      turnNumber: this.turnsTaken[actor] + 1
    });
    const actorName = this.getActorName(actor);
    const isFirstTurn = this.turnsTaken[actor] === 0;
    const drawCount = actor === this.secondActor && this.turnsTaken[actor] === 0 ? 2 : 1;
    const drawnCards = [];

    for (let i = 0; i < drawCount && this.deck.length > 0; i++) {
      const card = this.deck.shift();
      this.hands[actor].push(card);
      drawnCards.push(card);
    }

    if (drawnCards.length > 0) {
      const names = drawnCards.map(card => card.nameJa).join('、');
      this.addLog(`${actorName} は山札から ${drawnCards.length} 枚引きました: ${names}`);
    } else {
      this.addLog(`${actorName} の番です。山札は空です。`);
    }

    if (isFirstTurn) {
      this.addSpecialCardToHand(actor, 'special_13', '初回ターン');
    } else {
      this.tryRandomSpecialDrop(actor);
    }

    this.phase = 'PLAY_HAND';
    this.turnsTaken[actor] += 1;
    if (this.checkGameEnd()) {
      if (this.onStateChange) this.onStateChange(this.getState());
      return;
    }

    if (this.hands[actor].length === 0) {
      this.addLog(`${actorName} は出せる手札がないため、番を送ります。`);
      this.finishTurn();
      return;
    }

    if (this.onStateChange) this.onStateChange(this.getState());
  }

  refillFieldIfFull() {
    if (this.field.length < 8) return;

    const returnedCount = this.field.length;
    this.deck.push(...this.field);
    this.field = [];
    this.shuffle(this.deck);

    const refillCount = Math.min(6, this.deck.length);
    this.field = this.deck.splice(0, refillCount);
    this.addLog(`場札が ${returnedCount} 枚になったため、場札を山札に戻して混ぜ直し、${refillCount} 枚を場に出しました。`, 'system');
  }

  drawFlowerCardToField(actor, reason) {
    if (this.deck.length === 0) {
      this.addLog(`${reason}しようとしましたが、山札は空です。`);
      return null;
    }

    const card = this.deck.shift();
    this.field.push(card);
    this.addLog(`${reason}: ${card.nameJa} が場に出ました。`);
    this.refillFieldIfFull();
    return card;
  }

  drawFlowerCardToHand(actor, reason) {
    if (this.deck.length === 0) {
      this.addLog(`${reason}しようとしましたが、山札は空です。`);
      return null;
    }

    const card = this.deck.shift();
    this.hands[actor].push(card);
    const actorName = this.getActorName(actor);
    this.addLog(`${reason}: ${actorName} は ${card.nameJa} を手札に加えました。`);
    return card;
  }

  drawSpecialCard(actor, count = 1) {
    const actorName = this.getActorName(actor);
    const drawnCards = [];

    for (let i = 0; i < count && this.specialDeck.length > 0; i++) {
      const card = this.specialDeck.shift();
      this.specialHands[actor].push(card);
      drawnCards.push(card);
    }

    if (drawnCards.length > 0) {
      this.addLog(`${actorName} は特殊カードを ${drawnCards.length} 枚引きました: ${drawnCards.map(c => c.nameJa).join('、')}`, 'system');
    } else {
      this.addLog('特殊カード山札は空です。');
    }

    if (this.onStateChange) this.onStateChange(this.getState());
    return drawnCards;
  }

  createSpecialCard(cardId) {
    const template = SPECIAL_CARDS.find(card => card.id === cardId);
    if (!template) return null;

    this.specialCardSerial += 1;
    return {
      ...template,
      uid: `${cardId}_${this.specialCardSerial}`
    };
  }

  addSpecialCardToHand(actor, cardId, reason) {
    const card = this.createSpecialCard(cardId);
    if (!card) return null;

    this.specialHands[actor].push(card);
    const actorName = this.getActorName(actor);
    this.addLog(`${reason}: ${actorName} は特殊カード「${card.nameJa}」を手札に加えました。`, 'system');
    return card;
  }

  getRandomSpecialByRarity() {
    const rarityWeights = {
      "一": 40,
      "二": 30,
      "三": 20,
      "四": 10
    };
    const pool = SPECIAL_CARDS.filter(card => rarityWeights[card.rarity] > 0);
    const totalWeight = pool.reduce((sum, card) => sum + rarityWeights[card.rarity], 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const card of pool) {
      roll -= rarityWeights[card.rarity];
      if (roll <= 0) return card;
    }

    return pool[pool.length - 1] || null;
  }

  tryRandomSpecialDrop(actor) {
    const actorTurnNumber = this.turnsTaken[actor] + 1;
    const secondPlayerFourthTurnHasStarted = actor === 'cpu' ? this.turnsTaken.cpu >= 3 : this.turnsTaken.cpu >= 4;
    const shouldDrawThisTurn = actor === 'cpu' ? actorTurnNumber % 2 === 0 : actorTurnNumber % 2 === 1;

    if (!secondPlayerFourthTurnHasStarted) return;
    if (!shouldDrawThisTurn) return;
    if (this.specialHands[actor].length >= 3) return;

    const template = this.getRandomSpecialByRarity();
    if (!template) return;

    this.addSpecialCardToHand(actor, template.id, '特殊カード排出');
  }

  discardSpecialCard(cardIdentifier) {
    if (this.phase !== 'PLAY_HAND') return false;
    if (this.pendingCard) return false;
    if (this.usedSpecialThisTurn) {
      this.addLog('特殊カードは1ターンに1回だけ、使うか捨てることができます。');
      return false;
    }

    const actor = this.currentTurn;
    const cardIndex = this.specialHands[actor].findIndex(card => card.uid === cardIdentifier || card.id === cardIdentifier);
    if (cardIndex === -1) return false;

    const [discardedCard] = this.specialHands[actor].splice(cardIndex, 1);
    this.usedSpecialThisTurn = true;
    this.addLog(`特殊カード「${discardedCard.nameJa}」を捨てました。`, 'system');
    if (this.onStateChange) this.onStateChange(this.getState());
    return true;
  }

  isNormalRibbonCard(card) {
    return card?.type === 'tanzaku' && card.ribbonType === 'red';
  }

  isHarvestKasuCard(card) {
    return card?.type === 'kasu' && [2, 4, 6, 7, 8, 10, 11].includes(card.month);
  }

  getRibbonImagePath(month, ribbonType) {
    const baseRibbonImages = {
      akatan: {
        1: 'assets/cards/m1_2.jpg',
        2: 'assets/cards/m2_2.jpg',
        3: 'assets/cards/m3_2.jpg'
      },
      aotan: {
        6: 'assets/cards/m6_2.jpg',
        9: 'assets/cards/m9_2.jpg',
        10: 'assets/cards/m10_2.jpg'
      }
    };

    if (baseRibbonImages[ribbonType]?.[month]) {
      return baseRibbonImages[ribbonType][month];
    }

    const suffix = ribbonType === 'aotan' ? 'aotan' : 'akatan';
    return `assets/additional_cards/add_m${month}_${suffix}.jpg`;
  }

  transformRibbonCard(targetCardId, ribbonType, specialName) {
    const actor = this.currentTurn;
    const zones = [
      { name: '場', cards: this.field },
      { name: `${this.getActorName(actor)}の手札`, cards: this.hands[actor] }
    ];
    const targetZone = zones.find(zone => zone.cards.some(card => card.id === targetCardId));
    const targetCard = targetZone?.cards.find(card => card.id === targetCardId);

    if (!this.isNormalRibbonCard(targetCard)) {
      this.addLog(`特殊カード「${specialName}」は、場か手札にある通常たんを選んでください。`);
      return false;
    }

    const monthName = MONTH_DETAILS[targetCard.month]?.nameJa || `${targetCard.month}月`;
    targetCard.ribbonType = ribbonType;
    targetCard.nameJa = `${monthName}に${ribbonType === 'aotan' ? '青短' : '赤短'}`;
    targetCard.nameEn = `${MONTH_DETAILS[targetCard.month]?.nameEn || 'Flower'} ${ribbonType === 'aotan' ? 'Blue' : 'Red Poetry'} Ribbon`;
    targetCard.imagePath = this.getRibbonImagePath(targetCard.month, ribbonType);

    this.addLog(`特殊カード「${specialName}」の効果: ${targetZone.name}の ${monthName} の通常たんが${ribbonType === 'aotan' ? '青たん' : '赤たん'}になりました。`, 'system');
    return true;
  }

  returnOpponentCardsToDeck(count, specialName) {
    const opponent = this.currentTurn === 'player' ? 'cpu' : 'player';
    const opponentName = this.getActorName(opponent);
    const returnedCards = [];

    for (let i = 0; i < count && this.hands[opponent].length > 0; i++) {
      const cardIndex = Math.floor(Math.random() * this.hands[opponent].length);
      const [card] = this.hands[opponent].splice(cardIndex, 1);
      this.deck.push(card);
      returnedCards.push(card);
    }

    if (returnedCards.length === 0) {
      this.addLog(`特殊カード「${specialName}」を使いましたが、${opponentName}の手札に戻せる花カードがありません。`);
      return false;
    }

    this.shuffle(this.deck);
    this.addLog(`特殊カード「${specialName}」の効果: ${opponentName}の花カード ${returnedCards.length} 枚を山札に戻しました。`, 'system');
    return true;
  }

  transformCapturedKasuToKikuTane(specialName) {
    return this.transformSelectedCapturedKasuToKikuTane(null, specialName);
  }

  transformSelectedCapturedKasuToKikuTane(targetCardId, specialName) {
    const kasuIndex = targetCardId
      ? this.captured[this.currentTurn].findIndex(card => card.id === targetCardId && card.type === 'kasu')
      : this.captured[this.currentTurn].findIndex(card => card.type === 'kasu');
    if (kasuIndex === -1) {
      this.addLog(`特殊カード「${specialName}」は、自分の獲得カードにカスがある時だけ使えます。`);
      return false;
    }

    const oldCard = this.captured[this.currentTurn][kasuIndex];
    const newCard = {
      id: `created_m9_tane_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      month: 9,
      type: 'tane',
      points: 10,
      nameEn: 'Created Chrysanthemum Sake Cup',
      nameJa: '菊のたね',
      ribbonType: null,
      isRain: false,
      isCup: true,
      imagePath: 'assets/cards/m9_1.jpg'
    };

    this.captured[this.currentTurn].splice(kasuIndex, 1, newCard);
    this.addLog(`特殊カード「${specialName}」の効果: 獲得カードの ${oldCard.nameJa} が「菊のたね」になりました。`, 'system');
    this.recalculateRoundScores();
    return true;
  }

  destroyOpponentCapturedCardAndCreateWillowCards(targetCardId, specialName) {
    const opponent = this.getOpponent();
    const targetIndex = this.captured[opponent].findIndex(card => card.id === targetCardId);
    if (targetIndex === -1) {
      this.addLog(`特殊カード「${specialName}」は、相手の獲得カードを1枚選んでください。`);
      return false;
    }

    const [destroyedCard] = this.captured[opponent].splice(targetIndex, 1);
    const timestamp = Date.now();
    const willowKasu = {
      id: `created_m11_kasu_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 11,
      type: 'kasu',
      points: 1,
      nameEn: 'Created Willow Chaff',
      nameJa: '柳のカス',
      ribbonType: null,
      isRain: true,
      isCup: false,
      imagePath: 'assets/cards/m11_4.jpg'
    };
    const willowHikari = {
      id: `created_m11_hikari_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 11,
      type: 'hikari',
      points: 20,
      nameEn: 'Created Willow Bright',
      nameJa: '柳の光',
      ribbonType: null,
      isRain: true,
      isCup: false,
      imagePath: 'assets/cards/m11_1.jpg'
    };

    this.field.push(willowHikari);
    this.hands[this.currentTurn].push(willowKasu);
    this.addLog(`特殊カード「${specialName}」の効果: ${this.getActorName(opponent)}の獲得カード ${destroyedCard.nameJa} を消滅させ、柳の光を場に出し、柳のカスを手札に加えました。`, 'system');
    this.recalculateRoundScores();
    this.refillFieldIfFull();
    return true;
  }

  createPaulowniaTane() {
    return {
      id: `created_m12_tane_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      month: 12,
      type: 'tane',
      points: 10,
      nameEn: 'Created Paulownia Seed',
      nameJa: '桐の種',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/additional_cards/add_m12_tane.jpg'
    };
  }

  createPhoenixGardenCards(specialName) {
    const timestamp = Date.now();
    const paulowniaHikari = {
      id: `created_m12_hikari_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 12,
      type: 'hikari',
      points: 20,
      nameEn: 'Created Paulownia Phoenix',
      nameJa: '桐の光',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m12_1.jpg'
    };

    this.field.push(paulowniaHikari);
    this.hands[this.currentTurn].push(this.createPaulowniaTane());

    let transformedCount = 0;
    this.captured[this.currentTurn] = this.captured[this.currentTurn].map(card => {
      if (card.month === 12 && card.type === 'kasu') {
        transformedCount += 1;
        return this.createPaulowniaTane();
      }
      return card;
    });

    this.addLog(`特殊カード「${specialName}」の効果: 桐の光を場に出し、桐の種を手札に加え、獲得済みの桐のカス ${transformedCount} 枚を桐の種にしました。`, 'system');
    this.recalculateRoundScores();
    this.refillFieldIfFull();
    return true;
  }

  createCraneRepaymentCards(specialName) {
    const timestamp = Date.now();
    const pineHikari = {
      id: `created_m1_hikari_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 1,
      type: 'hikari',
      points: 20,
      nameEn: 'Created Pine Crane',
      nameJa: '松の光',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m1_1.jpg'
    };
    const pineAkatan = {
      id: `created_m1_akatan_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 1,
      type: 'tanzaku',
      points: 5,
      nameEn: 'Created Pine Red Poetry Ribbon',
      nameJa: '松に赤短',
      ribbonType: 'akatan',
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m1_2.jpg'
    };

    this.field.push(pineHikari);
    this.hands[this.currentTurn].push(pineAkatan);

    const normalRibbonIndexes = this.captured[this.currentTurn]
      .map((card, index) => this.isNormalRibbonCard(card) ? index : -1)
      .filter(index => index !== -1);
    this.shuffle(normalRibbonIndexes);

    const transformCount = Math.min(2, normalRibbonIndexes.length);
    for (let i = 0; i < transformCount; i++) {
      const card = this.captured[this.currentTurn][normalRibbonIndexes[i]];
      const monthName = MONTH_DETAILS[card.month]?.nameJa || `${card.month}月`;
      card.ribbonType = 'akatan';
      card.nameJa = `${monthName}に赤短`;
      card.nameEn = `${MONTH_DETAILS[card.month]?.nameEn || 'Flower'} Red Poetry Ribbon`;
      card.imagePath = this.getRibbonImagePath(card.month, 'akatan');
    }

    this.addLog(`特殊カード「${specialName}」の効果: 松の光を場に出し、松の赤たんを手札に加え、獲得済みの通常たん ${transformCount} 枚を赤たんにしました。`, 'system');
    this.recalculateRoundScores();
    this.refillFieldIfFull();
    return true;
  }

  createMoonRabbitCards(specialName) {
    const timestamp = Date.now();
    const susukiHikari = {
      id: `created_m8_hikari_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 8,
      type: 'hikari',
      points: 20,
      nameEn: 'Created Susuki Full Moon',
      nameJa: '芒の光',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m8_1.jpg'
    };
    const susukiKasu = {
      id: `created_m8_kasu_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 8,
      type: 'kasu',
      points: 1,
      nameEn: 'Created Susuki Chaff',
      nameJa: '芒のカス',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m8_3.jpg'
    };

    this.field.push(susukiHikari);
    this.hands[this.currentTurn].push(susukiKasu);
    this.addSpecialCardToHand(this.currentTurn, 'special_04', `特殊カード「${specialName}」の効果`);
    this.addLog(`特殊カード「${specialName}」の効果: 芒の光を場に出し、芒のカスと「酒器と盃」を手札に加えました。`, 'system');
    this.refillFieldIfFull();
    return true;
  }

  createCherryBlizzardCards(specialName) {
    const timestamp = Date.now();
    const createCherryHikari = () => ({
      id: `created_m3_hikari_${timestamp}_${Math.random().toString(16).slice(2)}`,
      month: 3,
      type: 'hikari',
      points: 20,
      nameEn: 'Created Cherry Curtain',
      nameJa: '桜の光',
      ribbonType: null,
      isRain: false,
      isCup: false,
      imagePath: 'assets/cards/m3_1.jpg'
    });

    this.field.push(createCherryHikari());
    this.hands[this.currentTurn].push(createCherryHikari());
    this.addLog(`特殊カード「${specialName}」の効果: 桜の光を場に出し、桜の光を手札に加えました。`, 'system');
    this.refillFieldIfFull();
    return true;
  }

  drawRandomSpecialCardToHand(actor, reason) {
    const template = this.getRandomSpecialByRarity();
    if (!template) {
      this.addLog(`${reason}: 排出できる特殊カードがありません。`);
      return null;
    }

    return this.addSpecialCardToHand(actor, template.id, reason);
  }

  resolveAbnormalWeather(specialName) {
    const returnedCount = this.hands.player.length + this.hands.cpu.length + this.field.length;
    this.deck.push(...this.hands.player, ...this.hands.cpu, ...this.field);
    this.hands.player = [];
    this.hands.cpu = [];
    this.field = [];
    this.specialHands.player = [];
    this.specialHands.cpu = [];
    this.shuffle(this.deck);

    const fieldDrawCount = Math.min(5, this.deck.length);
    this.field = this.deck.splice(0, fieldDrawCount);

    const dealToHand = (actor, count) => {
      const drawnCards = [];
      for (let i = 0; i < count && this.deck.length > 0; i++) {
        const card = this.deck.shift();
        this.hands[actor].push(card);
        drawnCards.push(card);
      }
      return drawnCards.length;
    };

    const playerDrawCount = dealToHand('player', 4);
    const cpuDrawCount = dealToHand('cpu', 4);
    this.drawRandomSpecialCardToHand('player', `特殊カード「${specialName}」の効果`);
    this.drawRandomSpecialCardToHand('cpu', `特殊カード「${specialName}」の効果`);
    this.addLog(`特殊カード「${specialName}」の効果: 花カード ${returnedCount} 枚を山札に戻し、場に ${fieldDrawCount} 枚、あなたに ${playerDrawCount} 枚、CPUに ${cpuDrawCount} 枚配りました。`, 'system');
    return true;
  }

  isAnimalTaneCard(card) {
    const animalTaneIds = new Set(['m2_1', 'm4_1', 'm6_1', 'm7_1', 'm8_2', 'm10_1', 'm11_2']);
    return card?.type === 'tane' && (animalTaneIds.has(card.id) || animalTaneIds.has(card.animalTaneBaseId));
  }

  getKasuImagePath(month) {
    const kasuImages = {
      11: 'assets/cards/m11_4.jpg'
    };
    return kasuImages[month] || `assets/cards/m${month}_3.jpg`;
  }

  getAnimalTaneTemplate(month) {
    const templates = {
      2: { baseId: 'm2_1', imagePath: 'assets/cards/m2_1.jpg', nameJa: '梅に鶯', nameEn: 'Plum with Bush Warbler' },
      4: { baseId: 'm4_1', imagePath: 'assets/cards/m4_1.jpg', nameJa: '藤にほととぎす', nameEn: 'Wisteria with Cuckoo' },
      6: { baseId: 'm6_1', imagePath: 'assets/cards/m6_1.jpg', nameJa: '牡丹に蝶', nameEn: 'Peony with Butterflies' },
      7: { baseId: 'm7_1', imagePath: 'assets/cards/m7_1.jpg', nameJa: '萩に猪', nameEn: 'Bush Clover with Boar' },
      8: { baseId: 'm8_2', imagePath: 'assets/cards/m8_2.jpg', nameJa: '芒に雁', nameEn: 'Susuki with Wild Geese' },
      10: { baseId: 'm10_1', imagePath: 'assets/cards/m10_1.jpg', nameJa: '楓に鹿', nameEn: 'Maple with Deer' },
      11: { baseId: 'm11_2', imagePath: 'assets/cards/m11_2.jpg', nameJa: '柳に燕', nameEn: 'Willow with Swallow' }
    };
    return templates[month] || null;
  }

  transformOpponentAnimalTaneToKasu(targetCardId, specialName) {
    const opponent = this.getOpponent();
    const targetIndex = this.captured[opponent].findIndex(card => card.id === targetCardId && this.isAnimalTaneCard(card));
    if (targetIndex === -1) {
      this.addLog(`特殊カード「${specialName}」は、相手が獲得した動物の種札を選んでください。`);
      return false;
    }

    const oldCard = this.captured[opponent][targetIndex];
    const monthName = MONTH_DETAILS[oldCard.month]?.nameJa || `${oldCard.month}月`;
    const newCard = {
      ...oldCard,
      id: `created_m${oldCard.month}_kasu_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type: 'kasu',
      points: 1,
      nameEn: `${MONTH_DETAILS[oldCard.month]?.nameEn || 'Flower'} Chaff`,
      nameJa: `${monthName}のカス`,
      ribbonType: null,
      isCup: false,
      imagePath: this.getKasuImagePath(oldCard.month)
    };

    this.captured[opponent].splice(targetIndex, 1, newCard);
    this.addLog(`特殊カード「${specialName}」の効果: ${this.getActorName(opponent)}の ${oldCard.nameJa} が ${newCard.nameJa} になりました。`, 'system');
    this.recalculateRoundScores();
    return true;
  }

  transformHarvestKasuToTane(targetCardId, specialName) {
    const actor = this.currentTurn;
    const zones = [
      { name: '場', cards: this.field },
      { name: `${this.getActorName(actor)}の手札`, cards: this.hands[actor] }
    ];
    const targetZone = zones.find(zone => zone.cards.some(card => card.id === targetCardId));
    const targetIndex = targetZone?.cards.findIndex(card => card.id === targetCardId);
    const targetCard = targetIndex >= 0 ? targetZone.cards[targetIndex] : null;

    if (!this.isHarvestKasuCard(targetCard)) {
      this.addLog(`特殊カード「${specialName}」は、場か手札の対象カス札を選んでください。`);
      return false;
    }

    const template = this.getAnimalTaneTemplate(targetCard.month);
    if (!template) return false;

    const newCard = {
      id: `created_${template.baseId}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      animalTaneBaseId: template.baseId,
      month: targetCard.month,
      type: 'tane',
      points: 10,
      nameEn: template.nameEn,
      nameJa: template.nameJa,
      ribbonType: null,
      isRain: targetCard.month === 11,
      isCup: false,
      imagePath: template.imagePath
    };

    targetZone.cards.splice(targetIndex, 1, newCard);
    this.addLog(`特殊カード「${specialName}」の効果: ${targetZone.name}の ${targetCard.nameJa} が ${newCard.nameJa} になりました。`, 'system');
    return true;
  }

  captureFieldCardAndReplaceWithKasu(targetCardId, specialName) {
    const targetIndex = this.field.findIndex(card => card.id === targetCardId);
    if (targetIndex === -1) {
      this.addLog(`特殊カード「${specialName}」は、場のカードを1枚選んでください。`);
      return false;
    }

    const [capturedCard] = this.field.splice(targetIndex, 1);
    this.captured[this.currentTurn].push(capturedCard);

    const monthName = MONTH_DETAILS[capturedCard.month]?.nameJa || `${capturedCard.month}月`;
    const replacementCard = {
      id: `created_m${capturedCard.month}_kasu_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      month: capturedCard.month,
      type: 'kasu',
      points: 1,
      nameEn: `${MONTH_DETAILS[capturedCard.month]?.nameEn || 'Flower'} Chaff`,
      nameJa: `${monthName}のカス`,
      ribbonType: null,
      isRain: capturedCard.month === 11,
      isCup: false,
      imagePath: this.getKasuImagePath(capturedCard.month)
    };

    this.field.push(replacementCard);
    this.addLog(`特殊カード「${specialName}」の効果: 場の ${capturedCard.nameJa} を獲得し、${replacementCard.nameJa} を場に出しました。`, 'system');
    this.recalculateRoundScores();
    return true;
  }

  cycleFieldCards(specialName) {
    const returnedCount = this.field.length;
    this.deck.push(...this.field);
    this.field = [];
    this.shuffle(this.deck);

    const drawCount = Math.min(6, this.deck.length);
    this.field = this.deck.splice(0, drawCount);
    this.addLog(`特殊カード「${specialName}」の効果: 場の ${returnedCount} 枚を山札に戻し、${drawCount} 枚を場に出しました。`, 'system');
    return true;
  }

  drawRandomHikariFromDeckToField(specialName) {
    const hikariIndexes = this.deck
      .map((card, index) => card.type === 'hikari' ? index : -1)
      .filter(index => index !== -1);

    if (hikariIndexes.length === 0) {
      this.addSpecialCardToHand(this.currentTurn, 'special_17', `特殊カード「${specialName}」の効果`);
      this.addLog(`特殊カード「${specialName}」の効果: 山札に光札がないため、「月に叢雲花に風」を手札に加えました。`, 'system');
      return true;
    }

    const deckIndex = hikariIndexes[Math.floor(Math.random() * hikariIndexes.length)];
    const [card] = this.deck.splice(deckIndex, 1);
    this.field.push(card);
    this.addLog(`特殊カード「${specialName}」の効果: 山札から光札 ${card.nameJa} を場に出しました。`, 'system');
    this.refillFieldIfFull();
    return true;
  }

  returnHandHikariCardsToDeck(specialName) {
    const returnedCards = [];

    ['player', 'cpu'].forEach(actor => {
      const remainingCards = [];
      this.hands[actor].forEach(card => {
        if (card.type === 'hikari') {
          this.deck.push(card);
          returnedCards.push(card);
        } else {
          remainingCards.push(card);
        }
      });
      this.hands[actor] = remainingCards;
    });

    if (returnedCards.length === 0) {
      this.addSpecialCardToHand(this.currentTurn, 'special_11', `特殊カード「${specialName}」の効果`);
      this.addLog(`特殊カード「${specialName}」の効果: お互いの手札に光札がないため、「瞬光」を手札に加えました。`, 'system');
      return true;
    }

    this.shuffle(this.deck);
    this.addLog(`特殊カード「${specialName}」の効果: お互いの手札から光札 ${returnedCards.length} 枚を山札に戻しました。`, 'system');
    return true;
  }

  useSpecialCard(cardIdentifier, selectedFlowerCardId = null) {
    if (this.phase !== 'PLAY_HAND') return false;
    if (this.pendingCard) return false;
    if (this.usedSpecialThisTurn) {
      this.addLog('特殊カードは1ターンに1回だけ使えます。');
      return false;
    }

    const actor = this.currentTurn;
    const opponent = this.getOpponent(actor);
    const cardIndex = this.specialHands[actor].findIndex(card => card.uid === cardIdentifier || card.id === cardIdentifier);
    if (cardIndex === -1) return false;

    const card = this.specialHands[actor][cardIndex];
    if (card.id === 'special_14' && !selectedFlowerCardId) {
      this.addLog('特殊カード「開花」は、山札に戻す花カードを1枚選んでください。');
      return false;
    }
    if (card.id === 'special_09' && !selectedFlowerCardId) {
      this.addLog('特殊カード「場違い」は、場のカードを1枚選んでください。');
      return false;
    }
    if (card.id === 'special_10' && !selectedFlowerCardId) {
      this.addLog('特殊カード「豊穣の季節」は、場か手札の対象カス札を1枚選んでください。');
      return false;
    }
    if (card.id === 'special_04' && !selectedFlowerCardId) {
      this.addLog('特殊カード「酒器と盃」は、自分の獲得カードのカスを1枚選んでください。');
      return false;
    }
    if (card.id === 'special_05' && !selectedFlowerCardId) {
      this.addLog('特殊カード「大嵐」は、相手の獲得カードを1枚選んでください。');
      return false;
    }
    if (card.id === 'special_16' && !selectedFlowerCardId) {
      this.addLog('特殊カード「火縄銃」は、相手が獲得した動物の種札を1枚選んでください。');
      return false;
    }
    if ((card.id === 'special_07' || card.id === 'special_08') && !selectedFlowerCardId) {
      this.addLog(`特殊カード「${card.nameJa}」は、場か手札にある通常たんを1枚選んでください。`);
      return false;
    }
    if (card.id === 'special_04' && !this.captured[actor].some(capturedCard => capturedCard.type === 'kasu')) {
      this.addLog('特殊カード「酒器と盃」は、自分の獲得カードにカスがある時だけ使えます。');
      return false;
    }
    if (card.id === 'special_05' && this.captured[opponent].length === 0) {
      this.addLog('特殊カード「大嵐」は、相手の獲得カードがある時だけ使えます。');
      return false;
    }
    if (card.id === 'special_16' && !this.captured[opponent].some(capturedCard => this.isAnimalTaneCard(capturedCard))) {
      this.addLog('特殊カード「火縄銃」は、相手が動物の種札を獲得している時だけ使えます。');
      return false;
    }
    if (card.id === 'special_09' && this.field.length === 0) {
      this.addLog('特殊カード「場違い」は、場にカードがある時だけ使えます。');
      return false;
    }
    if (card.id === 'special_10' && !this.field.some(fieldCard => this.isHarvestKasuCard(fieldCard)) && !this.hands[actor].some(handCard => this.isHarvestKasuCard(handCard))) {
      this.addLog('特殊カード「豊穣の季節」は、場か手札に対象カス札がある時だけ使えます。');
      return false;
    }

    const [usedCard] = this.specialHands[actor].splice(cardIndex, 1);
    this.usedSpecialThisTurn = true;
    let shouldFinishTurn = false;

    if (usedCard.id === 'special_13') {
      this.drawFlowerCardToField(actor, `特殊カード「${usedCard.nameJa}」の効果`);
    } else if (usedCard.id === 'special_03') {
      const returned = this.returnOpponentCardsToDeck(2, usedCard.nameJa);
      if (!returned) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_04') {
      const transformed = this.transformSelectedCapturedKasuToKikuTane(selectedFlowerCardId, usedCard.nameJa);
      if (!transformed) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_05') {
      const destroyed = this.destroyOpponentCapturedCardAndCreateWillowCards(selectedFlowerCardId, usedCard.nameJa);
      if (!destroyed) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_06') {
      this.createPhoenixGardenCards(usedCard.nameJa);
    } else if (usedCard.id === 'special_07' || usedCard.id === 'special_08') {
      const ribbonType = usedCard.id === 'special_07' ? 'aotan' : 'akatan';
      const transformed = this.transformRibbonCard(selectedFlowerCardId, ribbonType, usedCard.nameJa);
      if (!transformed) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_09') {
      const captured = this.captureFieldCardAndReplaceWithKasu(selectedFlowerCardId, usedCard.nameJa);
      if (!captured) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
      shouldFinishTurn = true;
    } else if (usedCard.id === 'special_10') {
      const transformed = this.transformHarvestKasuToTane(selectedFlowerCardId, usedCard.nameJa);
      if (!transformed) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_11') {
      this.drawRandomHikariFromDeckToField(usedCard.nameJa);
    } else if (usedCard.id === 'special_12') {
      this.createCraneRepaymentCards(usedCard.nameJa);
    } else if (usedCard.id === 'special_14') {
      const flowerCardIndex = this.hands[actor].findIndex(card => card.id === selectedFlowerCardId);
      if (flowerCardIndex === -1) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        this.addLog('特殊カード「開花」で戻す花カードを選べませんでした。');
        return false;
      }

      const [returnedCard] = this.hands[actor].splice(flowerCardIndex, 1);
      this.deck.push(returnedCard);
      this.shuffle(this.deck);
      this.addLog(`特殊カード「${usedCard.nameJa}」の効果: ${returnedCard.nameJa} を山札に戻しました。`);
      this.drawFlowerCardToField(actor, `特殊カード「${usedCard.nameJa}」の効果`);
      this.drawFlowerCardToField(actor, `特殊カード「${usedCard.nameJa}」の効果`);
      this.drawFlowerCardToHand(actor, `特殊カード「${usedCard.nameJa}」の効果`);
      this.drawFlowerCardToHand(actor, `特殊カード「${usedCard.nameJa}」の効果`);
    } else if (usedCard.id === 'special_15') {
      this.cycleFieldCards(usedCard.nameJa);
    } else if (usedCard.id === 'special_16') {
      const transformed = this.transformOpponentAnimalTaneToKasu(selectedFlowerCardId, usedCard.nameJa);
      if (!transformed) {
        this.specialHands[actor].splice(cardIndex, 0, usedCard);
        this.usedSpecialThisTurn = false;
        return false;
      }
    } else if (usedCard.id === 'special_17') {
      this.returnHandHikariCardsToDeck(usedCard.nameJa);
    } else if (usedCard.id === 'special_18') {
      this.createMoonRabbitCards(usedCard.nameJa);
    } else if (usedCard.id === 'special_19') {
      this.createCherryBlizzardCards(usedCard.nameJa);
    } else if (usedCard.id === 'special_20') {
      this.resolveAbnormalWeather(usedCard.nameJa);
    } else {
      this.addLog(`特殊カード「${usedCard.nameJa}」の効果はまだ未実装です。`);
    }

    this.specialPresentation = {
      id: `${usedCard.uid || usedCard.id}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      actor,
      card: usedCard
    };
    this.addLog(`特殊カード「${usedCard.nameJa}」を使いました。`, 'system');
    if (this.checkGameEnd()) return true;
    if (shouldFinishTurn) {
      this.finishTurn();
      return true;
    }
    if (this.onStateChange) this.onStateChange(this.getState());
    return true;
  }

  captureSelectedMatch(card, selectedFieldCardId, matches, actor) {
    const matchCard = matches.find(c => c.id === selectedFieldCardId);
    if (!matchCard) return false;

    const actorName = this.getActorName(actor);
    this.field = this.field.filter(c => c.id !== matchCard.id);
    this.captured[actor].push(card, matchCard);
    this.addLog(`${actorName} は ${card.nameJa} で ${matchCard.nameJa} を選択して合わせました！`);
    this.pendingCard = null;
    this.pendingMatches = [];
    this.recalculateRoundScores();
    this.finishTurn();
    return true;
  }

  // Step 1: Play a card from hand.
  playHandCard(cardId, selectedFieldCardId = null) {
    if (this.phase !== 'PLAY_HAND') return;
    const actor = this.currentTurn;
    const hand = this.hands[actor];
    const cardIndex = hand.findIndex(c => c.id === cardId);
    
    if (cardIndex === -1) return;
    const card = hand.splice(cardIndex, 1)[0];
    
    this.pendingCard = card;
    this.pendingSource = 'hand';
    
    const matches = this.getMatchesOnField(card);
    const actorName = this.getActorName(actor);

    if (matches.length === 0) {
      // No matches: played card is placed on the field
      this.field.push(card);
      this.addLog(`${actorName} は ${card.nameJa} (${card.month}月) を場に出しました。`);
      this.pendingCard = null;
      this.refillFieldIfFull();
      this.finishTurn();
    } else {
      if (selectedFieldCardId && this.captureSelectedMatch(card, selectedFieldCardId, matches, actor)) {
        if (this.onStateChange) this.onStateChange(this.getState());
        return;
      }

      // A field card must be selected whenever matching cards exist.
      this.pendingMatches = matches;
      this.phase = actor === 'player' ? 'RESOLVE_HAND_CHOICE' : 'CPU_CHOICE';
      this.addLog(`${actorName} は ${card.nameJa} の合わせるカードを選択中...`);
    }

    if (this.onStateChange) this.onStateChange(this.getState());
  }

  // Resolve multiple match choice for a played hand card.
  resolveChoice(fieldCardId) {
    if (this.phase !== 'RESOLVE_HAND_CHOICE') return;
    
    const actor = this.currentTurn;
    const actorName = this.getActorName(actor);
    const matchCard = this.field.find(c => c.id === fieldCardId);
    
    if (!matchCard || !this.pendingCard) return;

    this.captureSelectedMatch(this.pendingCard, matchCard.id, this.pendingMatches, actor);
  }

  finishTurn() {
    if (this.phase === 'ROUND_OVER' || this.phase === 'GAME_OVER') return;

    if (this.checkGameEnd()) {
      return;
    }

    const nextActor = this.currentTurn === 'player' ? 'cpu' : 'player';
    this.addLog(`現在のターン: ${this.getActorName(nextActor)}`);
    this.beginTurn(nextActor);
  }

  checkGameEnd() {
    const capturedCount = this.captured.player.length + this.captured.cpu.length;
    const noPlayableCards = this.deck.length === 0 && this.hands.player.length === 0 && this.hands.cpu.length === 0;

    if (capturedCount >= INITIAL_CARDS.length) {
      this.endRound();
      return true;
    }

    if (noPlayableCards) {
      if (this.field.length > 0) {
        const actor = this.currentTurn;
        const actorName = this.getActorName(actor);
        this.captured[actor].push(...this.field);
        this.addLog(`山札と手札がなくなったため、場に残った ${this.field.length} 枚は ${actorName} が獲得しました。`, 'system');
        this.field = [];
        this.recalculateRoundScores();
      }
      this.endRound();
      return true;
    }

    return false;
  }

  endRound() {
    this.phase = 'ROUND_OVER';
    
    // Evaluate Yaku scores
    this.recalculateRoundScores();
    
    const pPoints = this.roundScores.player.totalPoints;
    const cPoints = this.roundScores.cpu.totalPoints;

    // Traditional Hana-Awase scoring: Whoever has more points wins the round
    // We add round points to cumulative scores
    this.scores.player += pPoints;
    this.scores.cpu += cPoints;

    this.addLog(`--- 第 ${this.round} 回戦 終了 ---`, 'system');
    this.addLog(`あなたの得点: ${pPoints} 点 (素点 ${this.roundScores.player.cardPoints} + 役 ${this.roundScores.player.yakuPoints} / 合計: ${this.scores.player} 点)`);
    this.addLog(`CPUの得点: ${cPoints} 点 (素点 ${this.roundScores.cpu.cardPoints} + 役 ${this.roundScores.cpu.yakuPoints} / 合計: ${this.scores.cpu} 点)`);

    if (pPoints > cPoints) {
      this.addLog("あなたがこの回戦で勝利しました！", 'win');
    } else if (cPoints > pPoints) {
      this.addLog("CPUがこの回戦で勝利しました。", 'lose');
    } else {
      this.addLog("この回戦は引き分けでした。");
    }

    if (this.round >= this.maxRounds) {
      this.phase = 'GAME_OVER';
      this.addLog(`--- ゲーム終了 ---`, 'system');
      if (this.scores.player > this.scores.cpu) {
        this.addLog(`最終結果: プレイヤーの勝利！(${this.scores.player} vs ${this.scores.cpu})`, 'win');
      } else if (this.scores.cpu > this.scores.player) {
        this.addLog(`最終結果: CPUの勝利。(${this.scores.player} vs ${this.scores.cpu})`, 'lose');
      } else {
        this.addLog(`最終結果: 引き分け (${this.scores.player} 点)`, 'system');
      }
    }

    if (this.onStateChange) this.onStateChange(this.getState());
  }

  nextRound() {
    if (this.round >= this.maxRounds) {
      this.phase = 'GAME_OVER';
      this.addLog(`--- ゲーム終了 ---`, 'system');
      if (this.scores.player > this.scores.cpu) {
        this.addLog(`最終結果: プレイヤーの勝利！(${this.scores.player} vs ${this.scores.cpu})`, 'win');
      } else if (this.scores.cpu > this.scores.player) {
        this.addLog(`最終結果: CPUの勝利。(${this.scores.player} vs ${this.scores.cpu})`, 'lose');
      } else {
        this.addLog(`最終結果: 引き分け (${this.scores.player} 点)`, 'system');
      }
    } else {
      this.round += 1;
      this.startRound();
    }
    if (this.onStateChange) this.onStateChange(this.getState());
  }
}
