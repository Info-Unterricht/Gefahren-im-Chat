// ── app.js ── Student logic

import { db } from './firebase-config.js';
import {
  ref, set, get, push, onValue, onDisconnect, remove, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { drawAvatar, drawAvatarFromDataURL, BG_COLORS, FACES, ACCS } from './avatar.js';

// ── State ──
let myId = null, myName = '', myAvatar = null, myPairId = null, chatId = null;
let avatarState = { bgColor: BG_COLORS[0], face: FACES[0], acc: 'none' };
let sessionPaused = false;

// ── Screens ──
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

// ── Avatar-Vorschau ──
const canvas = document.getElementById('avatar-canvas');

function renderPreview() {
  drawAvatar(canvas, avatarState);
}

// Hintergrundfarben
BG_COLORS.forEach((c, i) => {
  const s = document.createElement('div');
  s.className = 'color-swatch' + (i === 0 ? ' selected' : '');
  s.style.background = c;
  s.onclick = () => {
    document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
    s.classList.add('selected');
    avatarState.bgColor = c;
    renderPreview();
  };
  document.getElementById('bg-colors').appendChild(s);
});

// Gesichter
FACES.forEach((f, i) => {
  const b = document.createElement('button');
  b.className = 'face-btn' + (i === 0 ? ' selected' : '');
  b.textContent = f;
  b.onclick = () => {
    document.querySelectorAll('.face-btn').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    avatarState.face = f;
    renderPreview();
  };
  document.getElementById('face-options').appendChild(b);
});

// Accessoires
ACCS.forEach((a, i) => {
  const b = document.createElement('button');
  b.className = 'acc-btn' + (i === 0 ? ' selected' : '');
  b.textContent = a === 'none' ? '✕' : a;
  b.onclick = () => {
    document.querySelectorAll('.acc-btn').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    avatarState.acc = a;
    renderPreview();
  };
  document.getElementById('acc-options').appendChild(b);
});

renderPreview();

// ── Bild-Upload ──
const uploadInput  = document.getElementById('avatar-upload');
const uploadBtn    = document.getElementById('upload-btn');
const removeImgBtn = document.getElementById('remove-img-btn');
const builderArea  = document.getElementById('avatar-builder-area');

uploadBtn.addEventListener('click', () => uploadInput.click());

uploadInput.addEventListener('change', () => {
  const file = uploadInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width  - minDim) / 2;
      const sy = (img.height - minDim) / 2;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.restore();

      builderArea.classList.add('builder-disabled');
      removeImgBtn.classList.remove('hidden');
      uploadBtn.textContent = '🖼 Bild ändern';
    };
    // Bild aus Data-URL laden – kein CORS-Problem, da base64
    img.src = e.target.result;
  };
  // FileReader liest lokale Datei als base64 → kein Canvas-Taint
  reader.readAsDataURL(file);
});

removeImgBtn.addEventListener('click', () => {
  builderArea.classList.remove('builder-disabled');
  removeImgBtn.classList.add('hidden');
  uploadBtn.textContent = '📷 Bild hochladen';
  uploadInput.value = '';
  renderPreview();
});

// ── Beitreten ──
document.getElementById('join-btn').addEventListener('click', async () => {
  const nameInput = document.getElementById('username-input');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    nameInput.style.borderColor = '#ff6584';
    setTimeout(() => nameInput.style.borderColor = '', 1500);
    return;
  }

  // Avatar als Data-URL aus Canvas lesen
  let avatarDataURL;
  try {
    avatarDataURL = canvas.toDataURL('image/png');
  } catch (e) {
    // Falls Canvas durch Upload getaintet – Fallback auf Emoji-Avatar
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 120; fallbackCanvas.height = 120;
    drawAvatar(fallbackCanvas, avatarState);
    avatarDataURL = fallbackCanvas.toDataURL('image/png');
  }

  myName   = name;
  myAvatar = avatarDataURL;

  const userRef = push(ref(db, 'users'));
  myId = userRef.key;

  await set(userRef, {
    name:     myName,
    avatar:   myAvatar,
    online:   true,
    joinedAt: serverTimestamp()
  });

  onDisconnect(userRef).remove();

  showScreen('waiting');
  renderWaitingBadge();
  watchOnlineUsers();
  watchMyPairing();
  watchSession();
});

// ── Warteraum ──
function renderWaitingBadge() {
  document.getElementById('waiting-name').textContent = myName;
  const badge = document.getElementById('waiting-badge');
  badge.innerHTML = '';
  const c = document.createElement('canvas');
  c.width = 80; c.height = 80;
  drawAvatarFromDataURL(c, myAvatar);
  badge.appendChild(c);
}

function watchOnlineUsers() {
  onValue(ref(db, 'users'), snap => {
    const list = document.getElementById('online-users');
    list.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const u = child.val();
      const chip = document.createElement('div');
      chip.className = 'online-chip';
      const c = document.createElement('canvas');
      c.width = 22; c.height = 22;
      drawAvatarFromDataURL(c, u.avatar);
      chip.appendChild(c);
      chip.appendChild(document.createTextNode(u.name));
      list.appendChild(chip);
    });
  });
}

// ── Paarung abwarten ──
function watchMyPairing() {
  onValue(ref(db, `users/${myId}/pairedWith`), async snap => {
    if (!snap.exists()) return;
    myPairId = snap.val();

    const pairSnap = await get(ref(db, `users/${myPairId}`));
    if (!pairSnap.exists()) return;
    const partner = pairSnap.val();

    const pc = document.getElementById('partner-canvas');
    drawAvatarFromDataURL(pc, partner.avatar);
    document.getElementById('partner-name').textContent = partner.name;

    chatId = [myId, myPairId].sort().join('_');
    showScreen('chat');
    watchMessages();
  });
}

// ── Nachrichten ──
function watchMessages() {
  onValue(ref(db, `chats/${chatId}/messages`), snap => {
    const box = document.getElementById('messages');
    box.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const m = child.val();
      const el = document.createElement('div');
      el.className = 'msg-bubble ' + (m.senderId === myId ? 'mine' : 'theirs');
      el.innerHTML = `<div>${esc(m.text)}</div><div class="msg-meta">${esc(m.senderName)} · ${fmtTime(m.ts)}</div>`;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  });
}

async function sendMessage() {
  if (sessionPaused || !chatId) return;
  const input = document.getElementById('msg-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  await push(ref(db, `chats/${chatId}/messages`), {
    senderId: myId, senderName: myName, text, ts: Date.now()
  });
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('msg-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

// ── Session-Status (Pause) ──
function watchSession() {
  onValue(ref(db, 'session/paused'), snap => {
    sessionPaused = snap.val() === true;
    const overlay = document.getElementById('paused-overlay');
    const input   = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const badge   = document.getElementById('session-badge');
    overlay.classList.toggle('active', sessionPaused);
    input.disabled   = sessionPaused;
    sendBtn.disabled = sessionPaused;
    badge.textContent = sessionPaused ? '⏸ Pausiert' : '● Live';
    badge.classList.toggle('paused', sessionPaused);
  });
}

// ── Hilfsfunktionen ──
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}
// ── app.js ── Student logic

import { db } from './firebase-config.js';
import {
  ref, set, get, push, onValue, remove, onDisconnect, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { drawAvatar, canvasToDataURL, drawAvatarFromDataURL, BG_COLORS, FACES, ACCS } from './avatar.js';

// ── State ──
let myId = null, myName = '', myAvatar = null, myPairId = null, chatId = null;
let avatarState = { bgColor: BG_COLORS[0], face: FACES[0], acc: 'none' };
let useUploadedImage = false;
let sessionPaused = false;

// ── DOM refs ──
const screens = {
  profile: document.getElementById('screen-profile'),
  waiting: document.getElementById('screen-waiting'),
  chat:    document.getElementById('screen-chat'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Avatar Builder ──
const canvas  = document.getElementById('avatar-canvas');
const bgRow   = document.getElementById('bg-colors');
const faceRow = document.getElementById('face-options');
const accRow  = document.getElementById('acc-options');
const uploadInput  = document.getElementById('avatar-upload');
const uploadBtn    = document.getElementById('upload-btn');
const removeImgBtn = document.getElementById('remove-img-btn');
const builderArea  = document.getElementById('avatar-builder-area');

function renderAvatarPreview() {
  if (!useUploadedImage) {
    drawAvatar(canvas, avatarState);
  }
}

function buildAvatarUI() {
  BG_COLORS.forEach((c, i) => {
    const s = document.createElement('div');
    s.className = 'color-swatch' + (i === 0 ? ' selected' : '');
    s.style.background = c;
    s.onclick = () => {
      if (useUploadedImage) return;
      document.querySelectorAll('.color-swatch').forEach(x => x.classList.remove('selected'));
      s.classList.add('selected');
      avatarState.bgColor = c;
      renderAvatarPreview();
    };
    bgRow.appendChild(s);
  });

  FACES.forEach((f, i) => {
    const b = document.createElement('button');
    b.className = 'face-btn' + (i === 0 ? ' selected' : '');
    b.textContent = f;
    b.onclick = () => {
      if (useUploadedImage) return;
      document.querySelectorAll('.face-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      avatarState.face = f;
      renderAvatarPreview();
    };
    faceRow.appendChild(b);
  });

  ACCS.forEach((a, i) => {
    const b = document.createElement('button');
    b.className = 'acc-btn' + (i === 0 ? ' selected' : '');
    b.textContent = a === 'none' ? '✕' : a;
    b.onclick = () => {
      if (useUploadedImage) return;
      document.querySelectorAll('.acc-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      avatarState.acc = a;
      renderAvatarPreview();
    };
    accRow.appendChild(b);
  });

  renderAvatarPreview();
}

buildAvatarUI();

// ── Bild-Upload ──
uploadBtn.onclick = () => uploadInput.click();

uploadInput.onchange = () => {
  const file = uploadInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Bitte wähle eine Bilddatei aus.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Bild quadratisch zuschneiden und auf Canvas zeichnen
      const ctx = canvas.getContext('2d');
      const size = canvas.width;
      const minDim = Math.min(img.width, img.height);
      const sx = (img.width - minDim) / 2;
      const sy = (img.height - minDim) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
      ctx.restore();

      useUploadedImage = true;
      builderArea.classList.add('builder-disabled');
      removeImgBtn.classList.remove('hidden');
      uploadBtn.textContent = '🖼 Bild ändern';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

removeImgBtn.onclick = () => {
  useUploadedImage = false;
  builderArea.classList.remove('builder-disabled');
  removeImgBtn.classList.add('hidden');
  uploadBtn.textContent = '📷 Bild hochladen';
  uploadInput.value = '';
  drawAvatar(canvas, avatarState);
};

// ── Join ──
document.getElementById('join-btn').onclick = async () => {
  const name = document.getElementById('username-input').value.trim();
  if (!name) {
    document.getElementById('username-input').focus();
    return;
  }
  myName   = name;
  myAvatar = canvasToDataURL(canvas);

  const userRef = push(ref(db, 'users'));
  myId = userRef.key;

  await set(userRef, {
    name:   myName,
    avatar: myAvatar,
    online: true,
    joinedAt: serverTimestamp()
  });

  onDisconnect(userRef).remove();

  showScreen('waiting');
  setupWaitingBadge();
  listenForPairing();
  listenForOnlineUsers();
  listenForSession();
};

// ── Waiting screen badge ──
function setupWaitingBadge() {
  document.getElementById('waiting-name').textContent = myName;
  const badge = document.getElementById('waiting-badge');
  const c = document.createElement('canvas');
  c.width = 80; c.height = 80;
  drawAvatarFromDataURL(c, myAvatar);
  badge.innerHTML = '';
  badge.appendChild(c);
}

// ── Online users list ──
function listenForOnlineUsers() {
  onValue(ref(db, 'users'), snap => {
    const list = document.getElementById('online-users');
    list.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const u = child.val();
      const chip = document.createElement('div');
      chip.className = 'online-chip';
      const c = document.createElement('canvas');
      c.width = 22; c.height = 22;
      drawAvatarFromDataURL(c, u.avatar);
      chip.appendChild(c);
      chip.appendChild(document.createTextNode(u.name));
      list.appendChild(chip);
    });
  });
}

// ── Listen for pairing ──
function listenForPairing() {
  onValue(ref(db, `users/${myId}/pairedWith`), snap => {
    if (!snap.exists()) return;
    myPairId = snap.val();
    loadPartnerAndOpenChat();
  });
}

async function loadPartnerAndOpenChat() {
  const pairSnap = await get(ref(db, `users/${myPairId}`));
  if (!pairSnap.exists()) return;
  const partner = pairSnap.val();

  const pc = document.getElementById('partner-canvas');
  await drawAvatarFromDataURL(pc, partner.avatar);
  document.getElementById('partner-name').textContent = partner.name;

  const ids = [myId, myPairId].sort();
  chatId = ids.join('_');

  showScreen('chat');
  listenForMessages();
  listenForPauseState();
}

// ── Messages ──
function listenForMessages() {
  onValue(ref(db, `chats/${chatId}/messages`), snap => {
    const box = document.getElementById('messages');
    box.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const m = child.val();
      const el = document.createElement('div');
      el.className = 'msg-bubble ' + (m.senderId === myId ? 'mine' : 'theirs');
      el.innerHTML = `<div>${escapeHtml(m.text)}</div><div class="msg-meta">${m.senderName} · ${formatTime(m.ts)}</div>`;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  });
}

document.getElementById('send-btn').onclick = sendMessage;
document.getElementById('msg-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  if (sessionPaused) return;
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text || !chatId) return;
  input.value = '';
  await push(ref(db, `chats/${chatId}/messages`), {
    senderId: myId, senderName: myName, text, ts: Date.now()
  });
}

// ── Session pause/resume ──
function listenForPauseState() {
  onValue(ref(db, 'session/paused'), snap => {
    sessionPaused = snap.val() === true;
    const overlay = document.getElementById('paused-overlay');
    const input   = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const badge   = document.getElementById('session-badge');
    if (sessionPaused) {
      overlay.classList.add('active');
      input.disabled = true;
      sendBtn.disabled = true;
      badge.textContent = '⏸ Pausiert';
      badge.classList.add('paused');
    } else {
      overlay.classList.remove('active');
      input.disabled = false;
      sendBtn.disabled = false;
      badge.textContent = '● Live';
      badge.classList.remove('paused');
    }
  });
}

function listenForSession() {}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
}
// ── app.js ── Student logic

import { db } from './firebase-config.js';
import {
  ref, set, get, push, onValue, remove, onDisconnect, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  buildAvatarEditor, buildAvatarSVG, renderAvatarInElement, DEFAULT_AVATAR
} from './avatar.js';

// ── State ──
let myId = null, myName = '', myAvatarData = null, myPairId = null, chatId = null;
let avatarState = { ...DEFAULT_AVATAR };
let sessionPaused = false;

// ── DOM refs ──
const screens = {
  profile: document.getElementById('screen-profile'),
  waiting: document.getElementById('screen-waiting'),
  chat:    document.getElementById('screen-chat'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ── Avatar Editor ──
const editorContainer = document.getElementById('avatar-editor-container');
buildAvatarEditor(editorContainer, avatarState, (updated) => {
  avatarState = { ...updated };
});

// ── Join ──
document.getElementById('join-btn').onclick = async () => {
  const name = document.getElementById('username-input').value.trim();
  if (!name) { document.getElementById('username-input').focus(); return; }
  myName = name;
  myAvatarData = JSON.stringify(avatarState);

  const userRef = push(ref(db, 'users'));
  myId = userRef.key;

  await set(userRef, {
    name:   myName,
    avatar: myAvatarData,
    online: true,
    joinedAt: serverTimestamp()
  });

  onDisconnect(userRef).remove();

  showScreen('waiting');
  setupWaitingBadge();
  listenForPairing();
  listenForOnlineUsers();
};

// ── Waiting screen badge ──
function setupWaitingBadge() {
  document.getElementById('waiting-name').textContent = myName;
  const badge = document.getElementById('waiting-badge');
  badge.innerHTML = buildAvatarSVG(avatarState, 80, 108);
}

// ── Online users list ──
function listenForOnlineUsers() {
  onValue(ref(db, 'users'), snap => {
    const list = document.getElementById('online-users');
    list.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const u = child.val();
      let av = {};
      try { av = JSON.parse(u.avatar); } catch(e) { av = DEFAULT_AVATAR; }
      const chip = document.createElement('div');
      chip.className = 'online-chip';
      const iconEl = document.createElement('span');
      iconEl.innerHTML = buildAvatarSVG(av, 22, 30);
      chip.appendChild(iconEl);
      chip.appendChild(document.createTextNode(u.name));
      list.appendChild(chip);
    });
  });
}

// ── Listen for pairing ──
function listenForPairing() {
  onValue(ref(db, `users/${myId}/pairedWith`), snap => {
    if (!snap.exists()) return;
    myPairId = snap.val();
    loadPartnerAndOpenChat();
  });
}

async function loadPartnerAndOpenChat() {
  const pairSnap = await get(ref(db, `users/${myPairId}`));
  if (!pairSnap.exists()) return;
  const partner = pairSnap.val();

  let partnerAv = DEFAULT_AVATAR;
  try { partnerAv = JSON.parse(partner.avatar); } catch(e) {}

  const partnerIcon = document.getElementById('partner-icon');
  partnerIcon.innerHTML = buildAvatarSVG(partnerAv, 36, 48);
  document.getElementById('partner-name').textContent = partner.name;

  const ids = [myId, myPairId].sort();
  chatId = ids.join('_');

  showScreen('chat');
  listenForMessages();
  listenForPauseState();
}

// ── Messages ──
function listenForMessages() {
  onValue(ref(db, `chats/${chatId}/messages`), snap => {
    const box = document.getElementById('messages');
    box.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      const m = child.val();
      const el = document.createElement('div');
      el.className = 'msg-bubble ' + (m.senderId === myId ? 'mine' : 'theirs');
      el.innerHTML = `<div>${escapeHtml(m.text)}</div><div class="msg-meta">${m.senderName} · ${formatTime(m.ts)}</div>`;
      box.appendChild(el);
    });
    box.scrollTop = box.scrollHeight;
  });
}

document.getElementById('send-btn').onclick = sendMessage;
document.getElementById('msg-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

async function sendMessage() {
  if (sessionPaused) return;
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text || !chatId) return;
  input.value = '';
  await push(ref(db, `chats/${chatId}/messages`), {
    senderId: myId, senderName: myName, text, ts: Date.now()
  });
}

// ── Session pause/resume ──
function listenForPauseState() {
  onValue(ref(db, 'session/paused'), snap => {
    sessionPaused = snap.val() === true;
    const overlay = document.getElementById('paused-overlay');
    const input   = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const badge   = document.getElementById('session-badge');
    if (sessionPaused) {
      overlay.classList.add('active');
      input.disabled = true;
      sendBtn.disabled = true;
      badge.textContent = '⏸ Pausiert';
      badge.classList.add('paused');
    } else {
      overlay.classList.remove('active');
      input.disabled = false;
      sendBtn.disabled = false;
      badge.textContent = '● Live';
      badge.classList.remove('paused');
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function formatTime(ts) {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');
}
