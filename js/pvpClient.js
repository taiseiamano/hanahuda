import { firebaseConfig, hasFirebaseConfig } from './firebaseConfig.js';

export class PVPClient {
  constructor() {
    this.enabled = false;
    this.roomId = '';
    this.localActor = 'player';
    this.playerId = this.getOrCreatePlayerId();
    this.db = null;
    this.firebase = null;
    this.unsubscribe = null;
    this.lastVersion = 0;
    this.onRemoteState = null;
    this.onStatus = null;
  }

  getOrCreatePlayerId() {
    const key = 'hanafuda-player-id';
    const storage = typeof localStorage !== 'undefined' ? localStorage : null;
    const saved = storage?.getItem(key);
    if (saved) return saved;

    const id = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    storage?.setItem(key, id);
    return id;
  }

  async ensureReady() {
    if (!hasFirebaseConfig()) {
      throw new Error('Firebase設定が未入力です。js/firebaseConfig.js にWebアプリの設定を入れてください。');
    }

    if (!this.db) {
      const appModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
      const databaseModule = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js');
      this.firebase = {
        initializeApp: appModule.initializeApp,
        getDatabase: databaseModule.getDatabase,
        ref: databaseModule.ref,
        set: databaseModule.set,
        update: databaseModule.update,
        onValue: databaseModule.onValue,
        get: databaseModule.get,
        serverTimestamp: databaseModule.serverTimestamp
      };
      const { initializeApp, getDatabase } = this.firebase;
      const app = initializeApp(firebaseConfig);
      this.db = getDatabase(app);
    }
  }

  async createRoom(initialState) {
    await this.ensureReady();
    this.roomId = this.createRoomId();
    this.localActor = 'player';
    this.enabled = true;
    this.lastVersion = 1;

    const roomRef = this.firebase.ref(this.db, `rooms/${this.roomId}`);
    return this.firebase.set(roomRef, {
      createdAt: this.firebase.serverTimestamp(),
      updatedAt: this.firebase.serverTimestamp(),
      hostId: this.playerId,
      guestId: '',
      status: 'waiting',
      version: this.lastVersion,
      state: initialState
    }).then(() => {
      this.listen();
      this.emitStatus(`部屋 ${this.roomId} を作成しました。相手に部屋IDを伝えてください。`);
      return { roomId: this.roomId, localActor: this.localActor };
    });
  }

  async joinRoom(roomId) {
    await this.ensureReady();
    const normalizedId = roomId.trim().toUpperCase();
    if (!normalizedId) throw new Error('部屋IDを入力してください。');

    const roomRef = this.firebase.ref(this.db, `rooms/${normalizedId}`);
    const snapshot = await this.firebase.get(roomRef);
    if (!snapshot.exists()) {
      throw new Error('部屋が見つかりません。IDを確認してください。');
    }

    const room = snapshot.val();
    this.roomId = normalizedId;
    this.localActor = room.hostId === this.playerId ? 'player' : 'cpu';
    this.enabled = true;
    this.lastVersion = room.version || 0;

    if (this.localActor === 'cpu') {
      await this.firebase.update(roomRef, {
        guestId: this.playerId,
        status: 'playing',
        updatedAt: this.firebase.serverTimestamp()
      });
    }

    this.listen();
    this.emitStatus(`部屋 ${this.roomId} に参加しました。`);
    return { roomId: this.roomId, localActor: this.localActor, state: room.state || null };
  }

  listen() {
    if (!this.db || !this.roomId) return;
    if (this.unsubscribe) this.unsubscribe();

    const roomRef = this.firebase.ref(this.db, `rooms/${this.roomId}`);
    this.unsubscribe = this.firebase.onValue(roomRef, snapshot => {
      const room = snapshot.val();
      if (!room) return;

      if (room.status === 'playing') {
        this.emitStatus(`部屋 ${this.roomId}: 対戦中`);
      } else {
        this.emitStatus(`部屋 ${this.roomId}: 相手待ち`);
      }

      if (!room.state || !this.onRemoteState) return;
      const version = room.version || 0;
      if (version <= this.lastVersion) return;

      this.lastVersion = version;
      this.onRemoteState(room.state);
    });
  }

  publishState(state) {
    if (!this.enabled || !this.db || !this.roomId) return Promise.resolve();

    this.lastVersion += 1;
    return this.firebase.update(this.firebase.ref(this.db, `rooms/${this.roomId}`), {
      state,
      version: this.lastVersion,
      updatedAt: this.firebase.serverTimestamp(),
      lastActor: this.localActor,
      lastPlayerId: this.playerId
    });
  }

  createRoomId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 5; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  emitStatus(message) {
    if (this.onStatus) this.onStatus(message);
  }
}
