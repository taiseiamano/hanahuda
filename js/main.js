// Main Bootstrapper for Hanafuda Hana-Awase Game Base

import { HanafudaGame } from './gameEngine.js';
import { UIManager } from './uiManager.js';
import { PVPClient } from './pvpClient.js';

window.addEventListener('DOMContentLoaded', () => {
  // Initialize game engine
  const game = new HanafudaGame();
  
  // Initialize UI Manager
  const ui = new UIManager(game);
  const pvp = new PVPClient();
  let applyingRemoteState = false;

  pvp.onRemoteState = (remoteState) => {
    applyingRemoteState = true;
    ui.selectedCardId = null;
    ui.selectedSpecialCardId = null;
    game.importState(remoteState);
    ui.renderWithMatches(game.getState());
    applyingRemoteState = false;
  };

  pvp.onStatus = (message) => {
    const statusEl = document.getElementById('pvp-status');
    if (statusEl) statusEl.textContent = message;
  };
  
  // Custom hook: when state changes, we render and bind matching clicks
  game.registerStateChangeCallback((state) => {
    ui.renderWithMatches(state);

    if (pvp.enabled && !applyingRemoteState) {
      pvp.publishState(game.exportState()).catch(error => {
        const statusEl = document.getElementById('pvp-status');
        if (statusEl) statusEl.textContent = `通信エラー: ${error.message}`;
      });
    }
    
    // CPU turn trigger if phase shifted to PLAY_HAND and currentTurn is cpu
    if (!pvp.enabled && state.currentTurn === 'cpu' && !ui.isCPUTyping) {
      if (state.phase === 'PLAY_HAND') {
        ui.triggerCPUTurn();
      }
    }
  });

  // Bind Restart Button
  const restartBtn = document.getElementById('restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      if (confirm('ゲームを再起動しますか？現在進行中の対局はリセットされます。')) {
        ui.completedYakus.player.clear();
        ui.completedYakus.cpu.clear();
        ui.selectedCardId = null;
        ui.selectedSpecialCardId = null;
        game.reset();
        game.startRound();
      }
    });
  }

  const createRoomBtn = document.getElementById('create-room-btn');
  const joinRoomBtn = document.getElementById('join-room-btn');
  const roomInput = document.getElementById('room-id-input');
  const roomIdLabel = document.getElementById('current-room-id');

  const activatePVP = (localActor, roomId) => {
    ui.setOnlineMode(true);
    ui.setLocalActor(localActor);
    document.body.classList.add('online-mode');
    if (roomIdLabel) roomIdLabel.textContent = roomId;
    ui.completedYakus.player.clear();
    ui.completedYakus.cpu.clear();
    ui.selectedCardId = null;
    ui.selectedSpecialCardId = null;
    ui.renderWithMatches(game.getState());
  };

  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', async () => {
      try {
        game.reset();
        game.startRound();
        const result = await pvp.createRoom(game.exportState());
        activatePVP(result.localActor, result.roomId);
      } catch (error) {
        pvp.onStatus?.(error.message);
      }
    });
  }

  if (joinRoomBtn) {
    joinRoomBtn.addEventListener('click', async () => {
      try {
        const result = await pvp.joinRoom(roomInput?.value || '');
        if (result.state) {
          applyingRemoteState = true;
          game.importState(result.state);
          applyingRemoteState = false;
        }
        activatePVP(result.localActor, result.roomId);
      } catch (error) {
        pvp.onStatus?.(error.message);
      }
    });
  }

  // Start the first round!
  ui.init();
});
