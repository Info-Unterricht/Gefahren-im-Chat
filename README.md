# 💬 KlassenChat

Ein einfaches Echtzeit-Chatsystem für den Unterricht – gehostet auf GitHub Pages, Backend über Firebase (kostenlos).

---

## 🚀 Einrichtung (einmalig, ca. 15 Minuten)

### 1. Firebase-Projekt erstellen

1. Gehe zu [https://console.firebase.google.com](https://console.firebase.google.com)
2. Klicke auf **„Projekt hinzufügen"** → Namen eingeben → Weiter (Google Analytics: optional)
3. Im Projekt: Linkes Menü → **„Realtime Database"** → **„Datenbank erstellen"**
   - Standort: `europe-west1 (Belgium)` empfohlen
   - Sicherheitsregeln: **„Im Testmodus starten"** (erlaubt offenen Zugriff)
4. Linkes Menü → **„Projekteinstellungen"** (Zahnrad oben) → Tab **„Allgemein"**
5. Runterscrollen zu **„Deine Apps"** → **„Web-App hinzufügen"** (`</>`)
6. App-Namen eingeben → **„App registrieren"**
7. Die angezeigte `firebaseConfig` kopieren

### 2. Firebase-Config eintragen

Öffne `js/firebase-config.js` und ersetze die Platzhalterwerte mit deinen Konfigurationsdaten:

```js
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "mein-projekt.firebaseapp.com",
  databaseURL:       "https://mein-projekt-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "mein-projekt",
  storageBucket:     "mein-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc..."
};
```

### 3. Datenbank-Regeln einstellen

In der Firebase-Console → **Realtime Database → Regeln** → folgende Regeln einfügen → **Veröffentlichen**:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 4. Auf GitHub Pages veröffentlichen

1. Repository auf GitHub erstellen (z. B. `klassenchat`)
2. Alle Dateien in das Repository hochladen (oder `git push`)
3. Repository-Einstellungen → **Pages** → Branch `main`, Ordner `/root` → **Save**
4. GitHub generiert eine URL wie: `https://DEINNAME.github.io/klassenchat/`

---

## 📱 Nutzung im Unterricht

### Lehrkraft
- Öffne `https://DEINNAME.github.io/klassenchat/teacher.html`
- Der QR-Code für Schüler:innen wird automatisch angezeigt
- **Zufällige Paare bilden** → alle online Schüler:innen werden eingeteilt
- **Chat pausieren** → Schüler können keine Nachrichten schreiben
- **Alle Daten löschen** → am Ende der Stunde alles bereinigen

### Schüler:innen
- iPad → Browser → QR-Code scannen
- Username eingeben, Avatar erstellen → **Beitreten**
- Warten bis die Lehrkraft Paare zuweist
- 1:1-Chat mit dem zugewiesenen Partner

---

## 📁 Dateistruktur

```
klassenchat/
├── index.html          ← Schüler-Seite
├── teacher.html        ← Lehrkraft-Dashboard
├── css/
│   ├── style.css       ← Globale Styles
│   └── teacher.css     ← Dashboard-Styles
├── js/
│   ├── firebase-config.js  ← 🔧 HIER Firebase-Daten eintragen!
│   ├── avatar.js           ← Avatar-Zeichnung (geteilt)
│   ├── app.js              ← Schüler-Logik
│   └── teacher.js          ← Lehrkraft-Logik
└── README.md
```

---

## 🔒 Datenschutz & Sicherheit

- Es werden **keine** Login-Daten gespeichert oder überprüft
- Daten leben nur in der Firebase Realtime Database
- Alle Daten können per Knopfdruck (Lehrkraft) vollständig gelöscht werden
- Firebase-Testmodus: Zugriff offen – geeignet für geschlossene Unterrichtsszenarien
- Für mehr Sicherheit: Firebase-Regeln nach dem Unterricht einschränken oder Datenbank manuell leeren

---

## ❓ Häufige Probleme

| Problem | Lösung |
|---|---|
| QR-Code öffnet nicht | Prüfe ob GitHub Pages aktiv ist |
| Chat geht nicht | Firebase-Konfiguration in `firebase-config.js` prüfen |
| Schüler sehen sich nicht | Datenbank-Regeln auf offenen Zugriff setzen |
| Paare werden nicht zugewiesen | Mindestens 2 Schüler:innen müssen online sein |
