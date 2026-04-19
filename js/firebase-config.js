// ── firebase-config.js ──
// WICHTIG: Ersetze diese Werte mit deinen eigenen Firebase-Projektdaten!
// Anleitung: https://firebase.google.com/docs/web/setup
//
// 1. Gehe zu https://console.firebase.google.com
// 2. Neues Projekt erstellen (kostenlos)
// 3. "Realtime Database" aktivieren (Regeln: siehe unten)
// 4. "Projekteinstellungen > Allgemein > Deine Apps > Web-App hinzufügen"
// 5. Die Konfigurationswerte hier eintragen

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBx2TkV-c4tRMGAwDZSH4r_fHiAjnE5bEc",
  authDomain: "gefahren-im-chat.firebaseapp.com",
  databaseURL: "https://gefahren-im-chat-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gefahren-im-chat",
  storageBucket: "gefahren-im-chat.firebasestorage.app",
  messagingSenderId: "489217941266",
  appId: "1:489217941266:web:56850d4a724deb047d1dcb"
};

// Firebase Realtime Database Regeln (im Firebase-Console einstellen):
// {
//   "rules": {
//     ".read": true,
//     ".write": true
//   }
// }
// Hinweis: Diese Regeln erlauben offenen Zugriff – geeignet für den Unterrichtseinsatz.
// Für mehr Sicherheit können die Regeln nach dem Unterricht eingeschränkt werden.

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
