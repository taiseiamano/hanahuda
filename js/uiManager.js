// UI Manager for Hanafuda (Hana-Awase) Game
// Interacts with DOM, binds click listeners, plays animations and audio.

import { MONTH_DETAILS, CARD_TYPES } from './cardData.js';
import { soundEffects } from './audio.js';
import { CPUPlayer } from './cpuPlayer.js';

export class UIManager {
  constructor(game, options = {}) {
    this.game = game;
    this.localActor = options.localActor || 'player';
    this.onlineMode = Boolean(options.onlineMode);
    this.selectedCardId = null;
    this.selectedSpecialCardId = null;
    this.isCPUTyping = false; // CPU action state to prevent interface conflicts
    
    // Cache DOM Elements
    this.playerHandEl = document.getElementById('player-hand');
    this.cpuHandEl = document.getElementById('cpu-hand');
    this.fieldEl = document.getElementById('field-grid');
    this.deckEl = document.getElementById('deck-pile');
    this.deckCountEl = document.getElementById('deck-count');
    
    // Captured piles
    this.pCapturedHikari = document.getElementById('p-captured-hikari');
    this.pCapturedTane = document.getElementById('p-captured-tane');
    this.pCapturedTanzaku = document.getElementById('p-captured-tanzaku');
    this.pCapturedKasu = document.getElementById('p-captured-kasu');
    
    this.cCapturedHikari = document.getElementById('c-captured-hikari');
    this.cCapturedTane = document.getElementById('c-captured-tane');
    this.cCapturedTanzaku = document.getElementById('c-captured-tanzaku');
    this.cCapturedKasu = document.getElementById('c-captured-kasu');
    
    // Log & scoreboards
    this.logListEl = document.getElementById('log-list');
    this.pScoreEl = document.getElementById('player-score');
    this.cScoreEl = document.getElementById('cpu-score');
    this.roundNumEl = document.getElementById('round-number');
    this.turnIndicatorEl = document.getElementById('turn-indicator');
    
    this.pYakuListEl = document.getElementById('player-yaku-list');
    this.cYakuListEl = document.getElementById('cpu-yaku-list');
    
    // Modals & Banners
    this.overlayEl = document.getElementById('game-overlay');
    this.modalTitleEl = document.getElementById('modal-title');
    this.modalBodyEl = document.getElementById('modal-body');
    this.modalBtnEl = document.getElementById('modal-btn');
    
    this.toastEl = document.getElementById('yaku-toast');
    this.toastTitleEl = document.getElementById('yaku-toast-title');
    this.toastDescEl = document.getElementById('yaku-toast-desc');
    this.specialUseToastEl = document.getElementById('special-use-toast');
    this.specialUseActorEl = document.getElementById('special-use-actor');
    this.specialUseCardSlotEl = document.getElementById('special-use-card-slot');
    this.specialUseNameEl = document.getElementById('special-use-name');
    this.specialUseEffectEl = document.getElementById('special-use-effect');
    this.presentedSpecialUseId = null;
    this.presentedAnnouncementIds = new Set();
    this.presentationQueue = [];
    this.isPresentationActive = false;
    this.specialUseTimer = null;

    // Setup active tracking of completed Yakus to show toast alerts when a new Yaku is formed
    this.completedYakus = {
      player: new Set(),
      cpu: new Set()
    };

    // Bind event listeners
    this.modalBtnEl.addEventListener('click', () => this.handleModalButtonClick());
    this.deckEl.addEventListener('click', () => this.handleDeckClick());
    
    // Register change callback with game engine
    this.game.registerStateChangeCallback((state) => this.render(state));
  }

  setLocalActor(actor) {
    this.localActor = actor === 'cpu' ? 'cpu' : 'player';
  }

  setOnlineMode(enabled) {
    this.onlineMode = Boolean(enabled);
  }

  getOpponentActor() {
    return this.localActor === 'player' ? 'cpu' : 'player';
  }

  getActorLabel(actor) {
    if (this.onlineMode) return actor === this.localActor ? 'あなた' : '相手';
    return actor === 'player' ? 'あなた' : 'CPU';
  }

  // Starts the interface
  init() {
    this.game.startRound();
    soundEffects.playShuffle();
  }

  // Renders the full game state
  render(state) {
    this.renderScores(state);
    this.renderHands(state);
    this.renderField(state);
    this.renderDeck(state);
    this.renderCaptured(state);
    this.renderLogs(state);
    this.checkYakuAlerts(state);
    this.checkAnnouncementPresentation(state);
    this.checkSpecialUsePresentation(state);
    this.checkModalOverlays(state);
    this.updateStatus(state);
  }

  updateStatus(state) {
    if (state.phase === 'ROUND_OVER' || state.phase === 'GAME_OVER') {
      this.turnIndicatorEl.textContent = '対局終了';
      return;
    }

    const currentName = this.getActorLabel(state.currentTurn);
    let phaseText = '';
    
    switch (state.phase) {
      case 'PLAY_HAND':
        if (this.selectedSpecialCardId) {
          const specialCard = this.getSelectedSpecialCard(state);
          if (specialCard?.id === 'special_14') {
            phaseText = `特殊カード「${specialCard.nameJa}」: 黄色い枠の花カードから、山札に戻す1枚を選択してください。${specialCard.effectText}`;
          } else if (specialCard?.id === 'special_09') {
            phaseText = `特殊カード「${specialCard.nameJa}」: 黄色い枠の場札を1枚選択してください。${specialCard.effectText}`;
          } else if (specialCard?.id === 'special_10') {
            phaseText = `特殊カード「${specialCard.nameJa}」: 黄色い枠の対象カス札を1枚選択してください。${specialCard.effectText}`;
          } else if (specialCard?.id === 'special_04') {
            phaseText = `特殊カード「${specialCard.nameJa}」: あなたの獲得カード欄から、黄色い枠のカスを1枚選択してください。${specialCard.effectText}`;
          } else if (specialCard?.id === 'special_05') {
            phaseText = `特殊カード「${specialCard.nameJa}」: 相手の獲得カード欄から、黄色い枠のカードを1枚選択してください。${specialCard.effectText}`;
          } else if (specialCard?.id === 'special_16') {
            phaseText = `特殊カード「${specialCard.nameJa}」: 相手の獲得カード欄から、黄色い枠の動物の種札を1枚選択してください。${specialCard.effectText}`;
          } else if (this.isFieldRibbonSpecial(specialCard)) {
            phaseText = `特殊カード「${specialCard.nameJa}」: 光っている場か手札の通常たんを1枚選択してください。${specialCard.effectText}`;
          } else {
            phaseText = specialCard ? `特殊カード「${specialCard.nameJa}」: ${specialCard.effectText} もう一度クリックして使用します。` : '手札を選び、同じ月の場札をクリックして獲得してください';
          }
        } else {
          phaseText = '手札を選び、同じ月の場札をクリックして獲得してください';
        }
        break;
      case 'RESOLVE_HAND_CHOICE':
        phaseText = '合わせる場札を選択してください';
        break;
      case 'CPU_CHOICE':
        phaseText = this.onlineMode ? '合わせる場札を選択してください' : 'CPUが選択中...';
        break;
    }
    
    this.turnIndicatorEl.textContent = `${currentName}の番: ${phaseText}`;
  }

  renderScores(state) {
    const local = this.localActor;
    const opponent = this.getOpponentActor();
    this.pScoreEl.textContent = `合計点: ${state.scores[local]} 点 (今宵: ${state.roundScores[local].totalPoints} 点 / 素 ${state.roundScores[local].cardPoints} + 役 ${state.roundScores[local].yakuPoints})`;
    this.cScoreEl.textContent = `合計点: ${state.scores[opponent]} 点 (今宵: ${state.roundScores[opponent].totalPoints} 点 / 素 ${state.roundScores[opponent].cardPoints} + 役 ${state.roundScores[opponent].yakuPoints})`;
    this.roundNumEl.textContent = `${state.round} / ${state.maxRounds}`;
    
    // Render Yaku lists
    this.pYakuListEl.innerHTML = this.buildYakuListHTML(state.roundScores[local].yakus);
    this.cYakuListEl.innerHTML = this.buildYakuListHTML(state.roundScores[opponent].yakus);
  }

  buildYakuListHTML(yakus) {
    if (yakus.length === 0) {
      return '<div class="text-muted" style="font-size:0.8rem; padding: 4px;">役なし</div>';
    }
    return yakus.map(y => `
      <div class="yaku-item">
        <span class="yaku-name">${y.nameJa}</span>
        <span class="yaku-points">${y.points} 点</span>
      </div>
    `).join('');
  }

  renderHands(state) {
    // Player Hand
    this.playerHandEl.innerHTML = '';

    const local = this.localActor;
    const opponent = this.getOpponentActor();
    const specialCards = state.specialHands?.[local] || [];
    specialCards.forEach(card => {
      const cardEl = this.createSpecialCardElement(card);
      if (card.uid === this.selectedSpecialCardId) {
        cardEl.classList.add('selected');
        const discardBtn = document.createElement('button');
        discardBtn.type = 'button';
        discardBtn.className = 'special-discard-btn';
        discardBtn.textContent = '捨てる';
        discardBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          this.handleSpecialDiscardClick(card.uid);
        });
        cardEl.appendChild(discardBtn);
      }
      cardEl.addEventListener('click', () => this.handleSpecialCardClick(card.uid));
      this.playerHandEl.appendChild(cardEl);
    });

    state.hands[local].forEach(card => {
      const cardEl = this.createCardElement(card, false);
      
      // Highlight matching cards on field when selected
      if (card.id === this.selectedCardId) {
        cardEl.classList.add('selected');
      }

      const selectedSpecialCard = this.getSelectedSpecialCard(state);
      if (selectedSpecialCard?.id === 'special_14' ||
          (this.isFieldRibbonSpecial(selectedSpecialCard) && this.isNormalRibbonCard(card)) ||
          (selectedSpecialCard?.id === 'special_10' && this.isHarvestKasuCard(card))) {
        cardEl.classList.add('special-target');
      }

      cardEl.addEventListener('click', () => this.handlePlayerHandClick(card.id));
      this.playerHandEl.appendChild(cardEl);
    });

    // Opponent Hand (Hidden)
    this.cpuHandEl.innerHTML = '';
    const hiddenCount = (state.specialHands?.[opponent]?.length || 0) + state.hands[opponent].length;
    for (let i = 0; i < hiddenCount; i++) {
      const cardEl = this.createCardElement({ id: `hidden_${i}`, month: 1, type: 'kasu' }, true);
      cardEl.classList.add('opponent-card');
      this.cpuHandEl.appendChild(cardEl);
    }
  }

  renderField(state) {
    this.fieldEl.innerHTML = '';
    const selectedSpecialCard = this.getSelectedSpecialCard(state);
    const isSelectingRibbonTarget = this.isFieldRibbonSpecial(selectedSpecialCard);
    
    state.field.forEach(card => {
      const cardEl = this.createCardElement(card, false);
      const isSelectableChoice = state.phase === 'RESOLVE_HAND_CHOICE' &&
                                 state.pendingMatches.some(m => m.id === card.id);
      const isRibbonTarget = state.phase === 'PLAY_HAND' &&
                             isSelectingRibbonTarget &&
                             this.isNormalRibbonCard(card);
      const isMisplacedTarget = state.phase === 'PLAY_HAND' &&
                                selectedSpecialCard?.id === 'special_09';
      const isHarvestTarget = state.phase === 'PLAY_HAND' &&
                              selectedSpecialCard?.id === 'special_10' &&
                              this.isHarvestKasuCard(card);
      
      // If player clicked a hand card, highlight field cards of the same month
      if (state.phase === 'PLAY_HAND' && this.selectedCardId) {
        const selectedCard = state.hands[this.localActor].find(c => c.id === this.selectedCardId);
        if (selectedCard && card.month === selectedCard.month) {
          cardEl.classList.add('glow-match');
        }
      }

      // If resolving multiple match choices, show options
      if (isSelectableChoice) {
        cardEl.classList.add('glow-choice');
        const choiceBadge = document.createElement('div');
        choiceBadge.className = 'choice-badge';
        choiceBadge.textContent = '✓';
        cardEl.appendChild(choiceBadge);
        
        cardEl.addEventListener('click', () => this.handleFieldChoiceClick(card.id));
      }

      if (isRibbonTarget || isMisplacedTarget || isHarvestTarget) {
        cardEl.classList.add('special-target');
        const choiceBadge = document.createElement('div');
        choiceBadge.className = 'choice-badge';
        choiceBadge.textContent = '✓';
        cardEl.appendChild(choiceBadge);
        cardEl.addEventListener('click', () => this.handleFieldSpecialTargetClick(card.id));
      }

      this.fieldEl.appendChild(cardEl);
    });
  }

  renderDeck(state) {
    if (this.deckCountEl) {
      this.deckCountEl.textContent = `${state.deck.length} 枚`;
    }

    if (this.deckEl) {
      this.deckEl.innerHTML = '';
    }

    const fieldDeckCount = document.createElement('div');
    fieldDeckCount.className = 'field-deck-count';
    fieldDeckCount.textContent = `山札 ${state.deck.length}枚`;
    this.fieldEl.appendChild(fieldDeckCount);

    // Render pending hand card above the field when resolving a match choice.
    if (state.phase === 'RESOLVE_HAND_CHOICE' && state.pendingCard) {
      const pendingContainer = document.createElement('div');
      pendingContainer.className = 'deck-pile-container';
      pendingContainer.style.bottom = '160px'; // Offset above deck
      
      const pLabel = document.createElement('div');
      pLabel.className = 'deck-count-badge';
      pLabel.textContent = '出した札';
      pLabel.style.background = 'var(--accent-gold)';
      pLabel.style.color = '#0c0b0a';

      const cardEl = this.createCardElement(state.pendingCard, false);
      cardEl.classList.add('pending-draw');
      
      pendingContainer.appendChild(pLabel);
      pendingContainer.appendChild(cardEl);
      this.fieldEl.appendChild(pendingContainer);
    }
  }

  renderCaptured(state) {
    // Clear
    this.pCapturedHikari.innerHTML = '';
    this.pCapturedTane.innerHTML = '';
    this.pCapturedTanzaku.innerHTML = '';
    this.pCapturedKasu.innerHTML = '';
    
    this.cCapturedHikari.innerHTML = '';
    this.cCapturedTane.innerHTML = '';
    this.cCapturedTanzaku.innerHTML = '';
    this.cCapturedKasu.innerHTML = '';
    const selectedSpecialCard = this.getSelectedSpecialCard(state);

    // Group captured cards
    const categorize = (playerType, containerMap, countPrefix) => {
      state.captured[playerType].forEach(card => {
        const miniCard = this.createMiniCardElement(card);
        const isPlayerKasuTarget = playerType === this.localActor &&
                                   selectedSpecialCard?.id === 'special_04' &&
                                   card.type === 'kasu';
        const isOpponentAnimalTarget = playerType === this.getOpponentActor() &&
                                       selectedSpecialCard?.id === 'special_16' &&
                                       this.isAnimalTaneCard(card);
        const isOpponentCapturedTarget = playerType === this.getOpponentActor() &&
                                         selectedSpecialCard?.id === 'special_05';
        if (isPlayerKasuTarget || isOpponentAnimalTarget || isOpponentCapturedTarget) {
          miniCard.classList.add('captured-special-target');
          miniCard.addEventListener('click', () => this.handleCapturedSpecialTargetClick(playerType, card.id));
        }
        const container = containerMap[card.type];
        if (container) container.appendChild(miniCard);
      });

      // Update counters in headers
      const groups = ['hikari', 'tane', 'tanzaku', 'kasu'];
      groups.forEach(g => {
        const list = state.captured[playerType].filter(c => c.type === g || (g === 'kasu' && c.id === 'm9_1' && c.isCup));
        const countBadge = document.getElementById(`${countPrefix}-${g}-count`);
        if (countBadge) {
          countBadge.textContent = list.length;
        }
      });
    };

    categorize(this.localActor, {
      hikari: this.pCapturedHikari,
      tane: this.pCapturedTane,
      tanzaku: this.pCapturedTanzaku,
      kasu: this.pCapturedKasu
    }, 'p');

    categorize(this.getOpponentActor(), {
      hikari: this.cCapturedHikari,
      tane: this.cCapturedTane,
      tanzaku: this.cCapturedTanzaku,
      kasu: this.cCapturedKasu
    }, 'c');
  }

  renderLogs(state) {
    this.logListEl.innerHTML = '';
    state.logs.forEach(log => {
      const logEl = document.createElement('div');
      logEl.className = `log-item ${log.type}`;
      logEl.textContent = log.text;
      this.logListEl.appendChild(logEl);
    });
    // Scroll to bottom of logs
    this.logListEl.scrollTop = this.logListEl.scrollHeight;
  }

  // Evaluates if any new Yaku has been completed to show dynamic popups
  checkYakuAlerts(state) {
    const checkUser = (actor) => {
      const currentYakus = state.roundScores[actor].yakus;
      const cached = this.completedYakus[actor];

      currentYakus.forEach(y => {
        if (!cached.has(y.id)) {
          // Found new Yaku! Trigger alert
          cached.add(y.id);
          this.triggerYakuToast(`${this.getActorLabel(actor)}の出来役！`, `${y.nameJa} (${y.points}点)`);
          soundEffects.playYaku();
        }
      });

      // If user lost cards or reset, clean up cache
      cached.forEach(id => {
        if (!currentYakus.some(y => y.id === id)) {
          cached.delete(id);
        }
      });
    };

    if (state.phase !== 'ROUND_OVER' && state.phase !== 'GAME_OVER') {
      checkUser('player');
      checkUser('cpu');
    }
  }

  triggerYakuToast(title, description) {
    this.toastTitleEl.textContent = title;
    this.toastDescEl.textContent = description;
    
    this.toastEl.classList.add('active');
    
    setTimeout(() => {
      this.toastEl.classList.remove('active');
    }, 2500);
  }

  checkSpecialUsePresentation(state) {
    const presentation = state.specialPresentation;
    if (!presentation || presentation.id === this.presentedSpecialUseId) return;

    this.presentedSpecialUseId = presentation.id;
    this.enqueuePresentation({
      type: 'special',
      actor: presentation.actor,
      card: presentation.card
    });
  }

  checkAnnouncementPresentation(state) {
    const presentations = state.announcementPresentations || (state.announcementPresentation ? [state.announcementPresentation] : []);
    presentations.forEach(presentation => {
      if (!presentation || this.presentedAnnouncementIds.has(presentation.id)) return;

      this.presentedAnnouncementIds.add(presentation.id);
      this.enqueuePresentation({
        type: presentation.type,
        actor: presentation.actor,
        turnNumber: presentation.turnNumber,
        round: presentation.round,
        firstActor: presentation.firstActor,
        secondActor: presentation.secondActor
      });
    });
  }

  enqueuePresentation(presentation) {
    this.presentationQueue.push(presentation);
    this.playNextPresentation();
  }

  playNextPresentation() {
    if (this.isPresentationActive) return;
    const presentation = this.presentationQueue.shift();
    if (!presentation) return;

    this.isPresentationActive = true;
    if (presentation.type === 'special') {
      this.showSpecialUsePresentation(presentation);
    } else {
      this.showAnnouncementPresentation(presentation);
    }
  }

  showPresentationShell({ actorText, nameText, effectText = '', card = null, duration = 1800 }) {
    if (!this.specialUseToastEl || !this.specialUseCardSlotEl) return;

    clearTimeout(this.specialUseTimer);
    this.specialUseCardSlotEl.innerHTML = '';

    if (card) {
      const cardEl = this.createSpecialCardElement(card);
      cardEl.classList.add('special-use-card');
      this.specialUseCardSlotEl.appendChild(cardEl);
      this.specialUseCardSlotEl.hidden = false;
    } else {
      this.specialUseCardSlotEl.hidden = true;
    }

    this.specialUseActorEl.textContent = actorText;
    this.specialUseNameEl.textContent = nameText;
    if (this.specialUseEffectEl) {
      this.specialUseEffectEl.textContent = effectText;
      this.specialUseEffectEl.hidden = !effectText;
    }
    this.specialUseToastEl.setAttribute('aria-hidden', 'false');
    this.specialUseToastEl.classList.remove('active');

    requestAnimationFrame(() => {
      this.specialUseToastEl.classList.add('active');
    });

    this.specialUseTimer = setTimeout(() => {
      this.specialUseToastEl.classList.remove('active');
      this.specialUseToastEl.setAttribute('aria-hidden', 'true');
      this.isPresentationActive = false;
      this.specialUseTimer = setTimeout(() => this.playNextPresentation(), 180);
    }, duration);
  }

  showSpecialUsePresentation({ actor, card }) {
    if (!card) {
      this.isPresentationActive = false;
      this.playNextPresentation();
      return;
    }

    this.showPresentationShell({
      actorText: `${this.getActorLabel(actor)}が特殊カードを使用`,
      nameText: card.nameJa,
      effectText: card.effectText || '',
      card,
      duration: 2400
    });
  }

  showAnnouncementPresentation(presentation) {
    if (presentation.type === 'game-start') {
      this.showPresentationShell({
        actorText: `第 ${presentation.round || 1} 回戦 開始`,
        nameText: `${this.getActorLabel(presentation.firstActor)}が先手`,
        effectText: `${this.getActorLabel(presentation.secondActor)}が後手`,
        duration: 1700
      });
      return;
    }

    this.showPresentationShell({
      actorText: 'ターン開始',
      nameText: `${this.getActorLabel(presentation.actor)}の番`,
      effectText: `${presentation.turnNumber || 1} ターン目`,
      duration: 1300
    });
  }

  checkModalOverlays(state) {
    if (state.phase === 'ROUND_OVER') {
      const local = this.localActor;
      const opponent = this.getOpponentActor();
      const pPoints = state.roundScores[local].totalPoints;
      const cPoints = state.roundScores[opponent].totalPoints;
      const pBreakdown = `素点 ${state.roundScores[local].cardPoints} + 役 ${state.roundScores[local].yakuPoints}`;
      const cBreakdown = `素点 ${state.roundScores[opponent].cardPoints} + 役 ${state.roundScores[opponent].yakuPoints}`;
      let title = '';
      let message = '';
      
      if (pPoints > cPoints) {
        title = '見事勝利！';
        message = `第 ${state.round} 回戦はあなたの勝利です。<br>あなた: ${pPoints} 点 (${pBreakdown})<br>相手: ${cPoints} 点 (${cBreakdown})`;
        soundEffects.playGameOver(true);
      } else if (cPoints > pPoints) {
        title = '相手の勝利';
        message = `第 ${state.round} 回戦は敗北しました。<br>あなた: ${pPoints} 点 (${pBreakdown})<br>相手: ${cPoints} 点 (${cBreakdown})`;
        soundEffects.playGameOver(false);
      } else {
        title = '引き分け (相流)';
        message = `第 ${state.round} 回戦は同点でした。<br>得点: ${pPoints} 点 (${pBreakdown})`;
        soundEffects.playGameOver(true);
      }

      this.showModal(title, message, '次へ進む');
    } else if (state.phase === 'GAME_OVER') {
      const pTotal = state.scores[this.localActor];
      const cTotal = state.scores[this.getOpponentActor()];
      let title = '';
      let message = '';
      
      if (pTotal > cTotal) {
        title = '天下無双 (最終勝利！)';
        message = `おめでとうございます！あなたが最終勝利しました。<br>最終スコア: ${pTotal} 点 vs ${cTotal} 点`;
        soundEffects.playGameOver(true);
      } else if (cTotal > pTotal) {
        title = '敗北 (最終敗北)';
        message = `相手に敗北しました。<br>最終スコア: ${pTotal} 点 vs ${cTotal} 点`;
        soundEffects.playGameOver(false);
      } else {
        title = '勝負なし (引き分け)';
        message = `最終結果は引き分けでした。<br>最終スコア: ${pTotal} 点`;
      }

      this.showModal(title, message, 'もう一度遊ぶ');
    } else {
      this.hideModal();
    }
  }

  showModal(title, htmlContent, btnText) {
    this.modalTitleEl.textContent = title;
    this.modalBodyEl.innerHTML = htmlContent;
    this.modalBtnEl.textContent = btnText;
    this.overlayEl.classList.add('active');
  }

  hideModal() {
    this.overlayEl.classList.remove('active');
  }

  getSelectedSpecialCard(state = this.game.getState()) {
    return state.specialHands?.[this.localActor]?.find(card => card.uid === this.selectedSpecialCardId || card.id === this.selectedSpecialCardId) || null;
  }

  isFieldRibbonSpecial(card) {
    return card?.id === 'special_07' || card?.id === 'special_08';
  }

  isNormalRibbonCard(card) {
    return card?.type === 'tanzaku' && card.ribbonType === 'red';
  }

  isHarvestKasuCard(card) {
    return card?.type === 'kasu' && [2, 4, 6, 7, 8, 10, 11].includes(card.month);
  }

  isAnimalTaneCard(card) {
    return card?.type === 'tane' && ['m2_1', 'm4_1', 'm6_1', 'm7_1', 'm8_2', 'm10_1', 'm11_2'].includes(card.id);
  }

  handleModalButtonClick() {
    this.hideModal();
    if (this.game.phase === 'ROUND_OVER') {
      this.game.nextRound();
      soundEffects.playShuffle();
    } else if (this.game.phase === 'GAME_OVER') {
      this.completedYakus.player.clear();
      this.completedYakus.cpu.clear();
      this.selectedCardId = null;
      this.selectedSpecialCardId = null;
      this.game.reset();
      this.game.startRound();
      soundEffects.playShuffle();
    }
  }

  // --- Hand / Matching Clicks ---
  handlePlayerHandClick(cardId) {
    if (this.game.currentTurn !== this.localActor || this.game.phase !== 'PLAY_HAND') return;

    const selectedSpecialCard = this.getSelectedSpecialCard();
    if (selectedSpecialCard?.id === 'special_14') {
      const used = this.game.useSpecialCard(this.selectedSpecialCardId, cardId);
      if (used) {
        this.selectedSpecialCardId = null;
        this.selectedCardId = null;
        soundEffects.playYaku();
      } else if (this.game.usedSpecialThisTurn) {
        this.selectedSpecialCardId = null;
        this.selectedCardId = null;
        this.render(this.game.getState());
      }
      return;
    }

    if (this.isFieldRibbonSpecial(selectedSpecialCard)) {
      const used = this.game.useSpecialCard(this.selectedSpecialCardId, cardId);
      if (used) {
        this.selectedSpecialCardId = null;
        this.selectedCardId = null;
        soundEffects.playYaku();
      }
      return;
    }

    if (selectedSpecialCard?.id === 'special_10') {
      const used = this.game.useSpecialCard(this.selectedSpecialCardId, cardId);
      if (used) {
        this.selectedSpecialCardId = null;
        this.selectedCardId = null;
        soundEffects.playYaku();
      }
      return;
    }

    this.selectedSpecialCardId = null;
    soundEffects.playSelect();

    if (this.selectedCardId === cardId) {
      // Clicked the selected card again: discard only when no matching field cards exist.
      const card = this.game.hands[this.localActor].find(c => c.id === cardId);
      const matches = this.game.getMatchesOnField(card);
      if (matches.length === 0) {
        this.selectedCardId = null;
        this.game.playHandCard(cardId);
        soundEffects.playPlace();
      } else {
        this.game.addLog(`※獲得できる場札があるため、このカードは場に出せません。光っている場札を選んでください。`);
      }
    } else {
      // Toggle selection
      const card = this.game.hands[this.localActor].find(c => c.id === cardId);
      const matches = this.game.getMatchesOnField(card);
      
      this.selectedCardId = cardId;
      this.render(this.game.getState());

      if (matches.length === 0) {
        this.game.addLog(`※このカードは場札と合わないため、もう一度クリックして場に捨ててください。`);
      } else {
        this.game.addLog(`※光っている場札をクリックして獲得してください。`);
      }
    }
  }

  // Clicking field cards to resolve matches
  handleFieldChoiceClick(fieldCardId) {
    const state = this.game.getState();
    if (state.currentTurn !== this.localActor) return;

    if (state.phase === 'RESOLVE_HAND_CHOICE' || state.phase === 'CPU_CHOICE') {
      this.game.phase = 'RESOLVE_HAND_CHOICE';
      // Selected one of the choice cards
      this.game.resolveChoice(fieldCardId);
      soundEffects.playMatch();
    }
  }

  handleFieldSpecialTargetClick(fieldCardId) {
    const selectedSpecialCard = this.getSelectedSpecialCard();
    if (!this.isFieldRibbonSpecial(selectedSpecialCard) &&
        selectedSpecialCard?.id !== 'special_09' &&
        selectedSpecialCard?.id !== 'special_10') return;

    const used = this.game.useSpecialCard(this.selectedSpecialCardId, fieldCardId);
    if (used) {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      soundEffects.playYaku();
    }
  }

  handleCapturedSpecialTargetClick(playerType, cardId) {
    const selectedSpecialCard = this.getSelectedSpecialCard();
    if (selectedSpecialCard?.id === 'special_04' && playerType !== this.localActor) return;
    if (selectedSpecialCard?.id === 'special_05' && playerType !== this.getOpponentActor()) return;
    if (selectedSpecialCard?.id === 'special_16' && playerType !== this.getOpponentActor()) return;
    if (selectedSpecialCard?.id !== 'special_04' && selectedSpecialCard?.id !== 'special_05' && selectedSpecialCard?.id !== 'special_16') return;

    const used = this.game.useSpecialCard(this.selectedSpecialCardId, cardId);
    if (used) {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      soundEffects.playYaku();
    }
  }

  // General field clicks for matches when 1 or 3 matching cards exist
  // Binds automatically via render to matching field cards.
  bindMatchClicks() {
    if (this.game.currentTurn !== this.localActor || this.game.phase !== 'PLAY_HAND' || !this.selectedCardId) return;
    
    const selectedCard = this.game.hands[this.localActor].find(c => c.id === this.selectedCardId);
    if (!selectedCard) return;

    const matches = this.game.getMatchesOnField(selectedCard);
    
    // We bind a listener to those matching cards on the field
    matches.forEach(matchCard => {
      const matchEl = this.fieldEl.querySelector(`[data-id="${matchCard.id}"]`);
      if (matchEl) {
        matchEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const cardId = this.selectedCardId;
          this.selectedCardId = null;
          this.game.playHandCard(cardId, matchCard.id);
          soundEffects.playMatch();
        });
      }
    });
  }

  handleDeckClick() {
    this.game.addLog('山札はターン開始時と、場札が8枚になった時の補充で使われます。');
  }

  handleSpecialDiscardClick(cardIdentifier) {
    const discarded = this.game.discardSpecialCard(cardIdentifier);
    if (discarded) {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      soundEffects.playPlace();
    }
  }

  handleSpecialCardClick(cardIdentifier) {
    if (this.game.currentTurn !== this.localActor || this.game.phase !== 'PLAY_HAND') return;

    const state = this.game.getState();
    const clickedCard = state.specialHands?.[this.localActor]?.find(card => card.uid === cardIdentifier || card.id === cardIdentifier);
    if (!clickedCard) return;

    if (this.game.usedSpecialThisTurn) {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      this.game.addLog('特殊カードは1ターンに1回だけ使えます。');
      this.render(this.game.getState());
      return;
    }

    if (this.selectedSpecialCardId === cardIdentifier && clickedCard.id === 'special_14') {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      soundEffects.playSelect();
      this.render(this.game.getState());
      return;
    }

    if (this.selectedSpecialCardId !== cardIdentifier) {
      const hasNormalRibbonTarget = state.field.some(card => this.isNormalRibbonCard(card)) ||
                                    state.hands[this.localActor].some(card => this.isNormalRibbonCard(card));
      if (this.isFieldRibbonSpecial(clickedCard) && !hasNormalRibbonTarget) {
        this.game.addLog(`特殊カード「${clickedCard.nameJa}」は、場か手札に通常たんがないため使えません。捨てることはできます。`);
      }
      if (clickedCard.id === 'special_09' && state.field.length === 0) {
        this.game.addLog('特殊カード「場違い」は、場にカードがある時だけ使えます。');
        return;
      }
      const hasHarvestTarget = state.field.some(card => this.isHarvestKasuCard(card)) ||
                               state.hands[this.localActor].some(card => this.isHarvestKasuCard(card));
      if (clickedCard.id === 'special_10' && !hasHarvestTarget) {
        this.game.addLog('特殊カード「豊穣の季節」は、場か手札に対象カス札がある時だけ使えます。');
        return;
      }
      if (clickedCard.id === 'special_04' && !state.captured[this.localActor].some(card => card.type === 'kasu')) {
        this.game.addLog('特殊カード「酒器と盃」は、自分の獲得カードにカスがある時だけ使えます。');
        return;
      }
      if (clickedCard.id === 'special_05' && state.captured[this.getOpponentActor()].length === 0) {
        this.game.addLog('特殊カード「大嵐」は、相手の獲得カードがある時だけ使えます。');
        return;
      }
      if (clickedCard.id === 'special_16' && !state.captured[this.getOpponentActor()].some(card => this.isAnimalTaneCard(card))) {
        this.game.addLog('特殊カード「火縄銃」は、相手が動物の種札を獲得している時だけ使えます。');
        return;
      }

      this.selectedCardId = null;
      this.selectedSpecialCardId = cardIdentifier;
      soundEffects.playSelect();
      this.render(this.game.getState());
      this.updateStatus(this.game.getState());
      return;
    }

    const used = this.game.useSpecialCard(cardIdentifier);
    if (used) {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      soundEffects.playYaku();
    } else if (clickedCard.id !== 'special_14') {
      this.selectedSpecialCardId = null;
      this.selectedCardId = null;
      this.render(this.game.getState());
    }
  }

  // --- CPU Action Loop ---
  // Paces CPU turns with clean visual delays
  triggerCPUTurn() {
    if (this.isCPUTyping) return;
    this.isCPUTyping = true;

    // Phase 1: CPU decides card to play
    setTimeout(() => {
      const state = this.game.getState();
      if (state.currentTurn !== 'cpu' || state.phase !== 'PLAY_HAND') {
        this.isCPUTyping = false;
        return;
      }

      const cardId = CPUPlayer.selectCardToPlay(this.game);
      const card = state.hands.cpu.find(c => c.id === cardId);
      const matches = this.game.getMatchesOnField(card);
      
      if (matches.length > 0) {
        const choiceId = CPUPlayer.selectMatchChoice(this.game, matches);
        this.game.playHandCard(cardId, choiceId);
      } else {
        this.game.playHandCard(cardId);
      }
      
      if (matches.length > 0) {
        soundEffects.playMatch();
      } else {
        soundEffects.playPlace();
      }

      // Check if CPU needs to make a multi-choice decision
      const newState = this.game.getState();
      if (newState.phase === 'CPU_CHOICE') {
        this.resolveCPUChoiceDelay();
      } else {
        this.isCPUTyping = false;
      }
    }, 1500);
  }

  resolveCPUChoiceDelay() {
    setTimeout(() => {
      const choiceId = CPUPlayer.selectMatchChoice(this.game, this.game.pendingMatches);

      // Override state phase to resolve choice
      this.game.phase = 'RESOLVE_HAND_CHOICE';
      this.game.resolveChoice(choiceId);
      
      soundEffects.playMatch();

      this.isCPUTyping = false;
    }, 1200);
  }

  // Override render to insert match-click callbacks after elements are inserted
  renderWithMatches(state) {
    this.render(state);
    this.bindMatchClicks();
  }

  // --- Element Creators ---
  getCardCornerBadge(card, typeInfo) {
    if (card.type === 'tanzaku') {
      if (card.ribbonType === 'akatan') return '🟥';
      if (card.ribbonType === 'aotan') return '🟦';
    }

    return typeInfo.badge;
  }

  createCardElement(card, isFlipped = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'hana-card';
    cardEl.dataset.id = card.id;
    
    if (isFlipped) {
      cardEl.classList.add('is-flipped');
    }

    const monthDetail = MONTH_DETAILS[card.month] || { nameJa: card.month + '月', emblem: '花', color: 'from-slate-700 to-slate-900' };
    const typeInfo = CARD_TYPES[card.type.toUpperCase()] || { badge: '🍃', nameJa: 'カス', color: '' };
    const cornerBadge = this.getCardCornerBadge(card, typeInfo);

    // Set styling CSS custom variable
    cardEl.style.setProperty('--card-month-gradient', `linear-gradient(135deg, ${monthDetail.color.replace('from-', '#').replace('to-', '#').split(' ').join(', ')})`);
    const imagePath = card.imagePath || `assets/cards/${card.id}.jpg`;
    cardEl.style.setProperty('--card-image', `url("${imagePath}")`);

    // Render Front & Back HTML
    cardEl.innerHTML = `
      <div class="card-face card-front">
        <div class="card-art-sheet" aria-hidden="true"></div>
        <div class="card-header-badge">
          <span class="card-month-badge">🌸</span>
          <span class="card-type-badge ${typeInfo.color}">${cornerBadge}</span>
        </div>
        <div class="card-label">${monthDetail.nameJa}</div>
      </div>
      <div class="card-face card-back"></div>
    `;

    return cardEl;
  }

  createSpecialCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'hana-card special-card';
    cardEl.dataset.id = card.id;
    cardEl.title = card.effectText || card.nameJa;
    cardEl.style.setProperty('--card-image', `url("${card.imagePath}")`);

    cardEl.innerHTML = `
      <div class="card-face card-front">
        <div class="card-art-sheet" aria-hidden="true"></div>
        <div class="card-header-badge">
          <span class="card-month-badge">✨</span>
          <span class="card-type-badge special-rarity-badge">${card.rarity || '無'}</span>
        </div>
        <div class="card-label special-card-label">${card.nameJa}</div>
      </div>
      <div class="card-face card-back"></div>
    `;

    return cardEl;
  }

  // Smaller version for captured piles
  createMiniCardElement(card) {
    const mini = document.createElement('div');
    mini.className = 'hana-card';
    mini.style.setProperty('--card-width', '32px');
    mini.style.setProperty('--card-height', '49px');
    mini.style.setProperty('--card-radius', '3px');
    mini.dataset.id = card.id;
    mini.title = card.nameJa;

    const monthDetail = MONTH_DETAILS[card.month] || { nameJa: '', emblem: '花', color: 'from-slate-700 to-slate-900' };
    const typeInfo = CARD_TYPES[card.type.toUpperCase()] || { badge: '🍃' };
    const cornerBadge = this.getCardCornerBadge(card, typeInfo);

    mini.style.setProperty('--card-month-gradient', `linear-gradient(135deg, ${monthDetail.color.replace('from-', '#').replace('to-', '#').split(' ').join(', ')})`);
    const imagePath = card.imagePath || `assets/cards/${card.id}.jpg`;
    mini.style.setProperty('--card-image', `url("${imagePath}")`);

    mini.innerHTML = `
      <div class="card-face card-front">
        <div class="card-art-sheet" aria-hidden="true"></div>
        <div class="card-header-badge mini-badges">
          <span>🌸</span>
          <span class="${typeInfo.color}">${cornerBadge}</span>
        </div>
      </div>
    `;

    return mini;
  }
}
