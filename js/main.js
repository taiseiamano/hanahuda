// Main Bootstrapper for Hanafuda Hana-Awase Game Base

import { HanafudaGame } from './gameEngine.js';
import { UIManager } from './uiManager.js';
import { PVPClient } from './pvpClient.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new HanafudaGame();
  const ui = new UIManager(game);
  const pvp = new PVPClient();
  let applyingRemoteState = false;
  let hasActiveGame = false;

  const homeScreen = document.getElementById('home-screen');
  const appContainer = document.getElementById('app-container');
  const homeStatusEl = document.getElementById('home-status');
  const pvpStatusEl = document.getElementById('pvp-status');
  const roomIdLabel = document.getElementById('current-room-id');
  const homeRoomInput = document.getElementById('home-room-id-input');

  const setHomeStatus = (message) => {
    if (homeStatusEl) homeStatusEl.textContent = message;
  };

  const showHome = () => {
    hasActiveGame = false;
    pvp.leaveRoom();
    ui.setOnlineMode(false);
    ui.setLocalActor('player');
    ui.resetViewState();
    game.reset();
    document.body.classList.remove('online-mode');
    homeScreen?.classList.remove('is-hidden');
    appContainer?.classList.add('is-hidden');
    if (pvpStatusEl) pvpStatusEl.textContent = 'CPU対戦';
    if (roomIdLabel) roomIdLabel.textContent = 'CPU戦';
    setHomeStatus('モードを選択してください');
  };

  const showGame = () => {
    homeScreen?.classList.add('is-hidden');
    appContainer?.classList.remove('is-hidden');
    hasActiveGame = true;
  };

  const resetLocalGameView = () => {
    ui.completedYakus.player.clear();
    ui.completedYakus.cpu.clear();
    ui.resetViewState();
  };

  pvp.onRemoteState = (remoteState) => {
    applyingRemoteState = true;
    resetLocalGameView();
    game.importState(remoteState);
    ui.renderWithMatches(game.getState());
    applyingRemoteState = false;
  };

  pvp.onStatus = (message) => {
    if (pvpStatusEl) pvpStatusEl.textContent = message;
    setHomeStatus(message);
  };

  game.registerStateChangeCallback((state) => {
    if (!hasActiveGame) return;

    ui.renderWithMatches(state);

    if (pvp.enabled && !applyingRemoteState) {
      pvp.publishState(game.exportState()).catch(error => {
        const message = `通信エラー: ${error.message}`;
        if (pvpStatusEl) pvpStatusEl.textContent = message;
        setHomeStatus(message);
      });
    }

    if (!pvp.enabled && state.currentTurn === 'cpu' && !ui.isCPUTyping) {
      if (state.phase === 'PLAY_HAND') {
        ui.triggerCPUTurn();
      }
    }
  });

  const startCpuGame = () => {
    pvp.leaveRoom();
    ui.setOnlineMode(false);
    ui.setLocalActor('player');
    document.body.classList.remove('online-mode');
    if (roomIdLabel) roomIdLabel.textContent = 'CPU戦';
    if (pvpStatusEl) pvpStatusEl.textContent = 'CPU対戦';
    resetLocalGameView();
    game.reset();
    showGame();
    game.startRound();
  };

  const activatePVP = (localActor, roomId) => {
    ui.setOnlineMode(true);
    ui.setLocalActor(localActor);
    document.body.classList.add('online-mode');
    if (roomIdLabel) roomIdLabel.textContent = `部屋 ${roomId}`;
    resetLocalGameView();
    showGame();
    ui.renderWithMatches(game.getState());
  };

  document.getElementById('home-cpu-btn')?.addEventListener('click', () => {
    startCpuGame();
  });

  document.getElementById('home-create-room-btn')?.addEventListener('click', async () => {
    try {
      setHomeStatus('ルームを作成中...');
      resetLocalGameView();
      game.reset();
      showGame();
      game.startRound();
      const result = await pvp.createRoom(game.exportState());
      activatePVP(result.localActor, result.roomId);
    } catch (error) {
      showHome();
      setHomeStatus(error.message);
    }
  });

  document.getElementById('home-join-room-btn')?.addEventListener('click', async () => {
    try {
      setHomeStatus('ルームに参加中...');
      const result = await pvp.joinRoom(homeRoomInput?.value || '');
      if (result.state) {
        applyingRemoteState = true;
        game.importState(result.state);
        applyingRemoteState = false;
      }
      activatePVP(result.localActor, result.roomId);
    } catch (error) {
      setHomeStatus(error.message);
    }
  });

  document.getElementById('home-btn')?.addEventListener('click', () => {
    if (confirm('ホームに戻りますか？現在の対局は画面から離れます。')) {
      showHome();
    }
  });

  document.getElementById('restart-btn')?.addEventListener('click', () => {
    if (!confirm('ゲームを再起動しますか？現在進行中の対局はリセットされます。')) return;

    if (pvp.enabled) {
      resetLocalGameView();
      game.reset();
      game.startRound();
      return;
    }

    startCpuGame();
  });

  ui.initEmpty();
  showHome();
});

});
