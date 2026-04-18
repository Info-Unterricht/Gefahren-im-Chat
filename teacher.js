// ── teacher.js ── Lehrkraft-Dashboard

import { db } from './firebase-config.js';
import {
  ref, set, get, push, remove, onValue, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { drawAvatarFromDataURL } from './avatar.js';

// ── QR Code & Student URL ──
const studentURL = window.location.origin + window.location.pathname.replace('teacher.html', 'index.html');
document.getElementById('student-url').textContent = studentURL;

new QRCode(document.getElementById('qr-code'), {
  text:   studentURL,
  width:  160,
  height: 160,
  colorDark:  '#1a1d27',
  colorLight: '#ffffff',
  correctLevel: QRCode.CorrectLevel.M
});

// ── Live user list ──
let currentUsers = {};

onValue(ref(db, 'users'), snap => {
  currentUsers = {};
  const grid = document.getElementById('user-grid');
  grid.innerHTML = '';

  if (!snap.exists()) {
    document.getElementById('online-count').textContent = '0';
    return;
  }

  snap.forEach(child => {
    currentUsers[child.key] = child.val();
  });

  document.getElementById('online-count').textContent = Object.keys(currentUsers).length;

  Object.entries(currentUsers).forEach(([id, u]) => {
    const card = document.createElement('div');
    card.className = 'user-card';

    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    drawAvatarFromDataURL(c, u.avatar);

    card.appendChild(c);
    card.appendChild(document.createTextNode(u.name));
    grid.appendChild(card);
  });
});

// ── Pairing ──
document.getElementById('pair-btn').onclick = async () => {
  const users = Object.entries(currentUsers);
  if (users.length < 2) {
    alert('Mindestens 2 Schüler:innen müssen online sein!');
    return;
  }

  // Shuffle
  const shuffled = [...users].sort(() => Math.random() - .5);

  // Clear existing pairs
  await remove(ref(db, 'pairs'));

  const pairs = [];
  for (let i = 0; i + 1 < shuffled.length; i += 2) {
    const [idA, userA] = shuffled[i];
    const [idB, userB] = shuffled[i + 1];

    const pairKey = [idA, idB].sort().join('_');
    await set(ref(db, `pairs/${pairKey}`), { userA: idA, userB: idB });

    // Tell each user who their pair is
    await set(ref(db, `users/${idA}/pairedWith`), idB);
    await set(ref(db, `users/${idB}/pairedWith`), idA);

    pairs.push({ idA, nameA: userA.name, avatarA: userA.avatar, idB, nameB: userB.name, avatarB: userB.avatar });
  }

  renderPairs(pairs);
  document.getElementById('pair-count').textContent = pairs.length;
};

async function renderPairs(pairs) {
  const grid = document.getElementById('pair-grid');
  grid.innerHTML = '';

  for (const p of pairs) {
    const card = document.createElement('div');
    card.className = 'pair-card';

    const cA = document.createElement('canvas');
    cA.width = 28; cA.height = 28;
    await drawAvatarFromDataURL(cA, p.avatarA);

    const cB = document.createElement('canvas');
    cB.width = 28; cB.height = 28;
    await drawAvatarFromDataURL(cB, p.avatarB);

    const sep = document.createElement('span');
    sep.className = 'pair-sep';
    sep.textContent = '↔';

    card.append(cA, document.createTextNode(p.nameA), sep, cB, document.createTextNode(p.nameB));
    grid.appendChild(card);
  }
}

// Reload pairs on page load
onValue(ref(db, 'pairs'), async snap => {
  if (!snap.exists()) {
    document.getElementById('pair-count').textContent = '0';
    document.getElementById('pair-grid').innerHTML = '';
    return;
  }
  const pairs = [];
  for (const child of Object.values(snap.val())) {
    const [uA, uB] = await Promise.all([
      get(ref(db, `users/${child.userA}`)),
      get(ref(db, `users/${child.userB}`))
    ]);
    if (uA.exists() && uB.exists()) {
      pairs.push({
        idA: child.userA, nameA: uA.val().name, avatarA: uA.val().avatar,
        idB: child.userB, nameB: uB.val().name, avatarB: uB.val().avatar
      });
    }
  }
  document.getElementById('pair-count').textContent = pairs.length;
  renderPairs(pairs);
});

// ── Pause / Resume ──
let paused = false;

onValue(ref(db, 'session/paused'), snap => {
  paused = snap.val() === true;
  updatePauseUI();
});

function updatePauseUI() {
  const pauseBtn  = document.getElementById('pause-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const pill = document.getElementById('status-pill');

  if (paused) {
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    pill.textContent = '⏸ Pausiert';
    pill.classList.add('paused');
  } else {
    pauseBtn.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
    pill.textContent = '● Aktiv';
    pill.classList.remove('paused');
  }
}

document.getElementById('pause-btn').onclick  = () => set(ref(db, 'session/paused'), true);
document.getElementById('resume-btn').onclick = () => set(ref(db, 'session/paused'), false);

// ── All Messages (monitoring) ──
onValue(ref(db, 'chats'), snap => {
  const box = document.getElementById('all-messages');
  box.innerHTML = '';

  if (!snap.exists()) {
    box.innerHTML = '<p class="empty-hint">Noch keine Nachrichten</p>';
    return;
  }

  const allMsgs = [];
  snap.forEach(chatSnap => {
    const chatId = chatSnap.key;
    if (!chatSnap.child('messages').exists()) return;
    chatSnap.child('messages').forEach(msgSnap => {
      allMsgs.push({ chatId, ...msgSnap.val() });
    });
  });

  allMsgs.sort((a, b) => (a.ts || 0) - (b.ts || 0));

  allMsgs.forEach(m => {
    const el = document.createElement('div');
    el.className = 'teacher-msg';
    const ids = m.chatId.split('_');
    const pair = ids.map(id => currentUsers[id]?.name || id.slice(0,6)).join(' ↔ ');
    el.innerHTML = `<span class="t-sender">${escapeHtml(m.senderName)}</span><span class="t-pair">${escapeHtml(pair)}</span><span class="t-text">${escapeHtml(m.text)}</span>`;
    box.appendChild(el);
  });

  box.scrollTop = box.scrollHeight;
});

// ── Reset / Delete all ──
document.getElementById('reset-btn').onclick = () => {
  document.getElementById('confirm-modal').classList.remove('hidden');
};
document.getElementById('modal-cancel').onclick = () => {
  document.getElementById('confirm-modal').classList.add('hidden');
};
document.getElementById('modal-confirm').onclick = async () => {
  await Promise.all([
    remove(ref(db, 'users')),
    remove(ref(db, 'chats')),
    remove(ref(db, 'pairs')),
    remove(ref(db, 'session')),
  ]);
  document.getElementById('confirm-modal').classList.add('hidden');
};

// ── Helpers ──
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
