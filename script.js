// Konfigurasi Firebase Bapak (Ambil dari Console Firebase)
const firebaseConfig = {
  apiKey: "API_KEY_BAPAK",
  authDomain: "PROJECT_ID.firebaseapp.com",
  databaseURL: "URL_DATABASE_FIREBASE_BAPAK",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 1. MENDENGARKAN DATA DARI ESP32 (REAL-TIME)
// Membaca data sensor yang dikirim ESP32 ke Firebase
database.ref('sensor').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById('txt-jarak').innerText = data.jarak.toFixed(2);
        document.getElementById('txt-persen').innerText = Math.round(data.persen);
    }
});

// Membaca status pompa otomatis
database.ref('status/pompa').on('value', (snapshot) => {
    document.getElementById('txt-pompa').innerText = snapshot.val() || "-";
});

// 2. MENGIRIM KONTROL KE ESP32
let state = { evaporasi: 0, kondensasi: 0, presipitasi: 0, banjir: 0 };

function toggleControl(path) {
    // Balikkan nilai (0 jadi 1, 1 jadi 0)
    state[path] = state[path] === 0 ? 1 : 0;
    
    // Update ke Firebase agar dibaca ESP32
    database.ref('controls/' + path).set(state[path]);

    // Update tampilan tombol di Web
    const btn = document.getElementById('btn-' + path.substring(0, 4));
    if (state[path] === 1) {
        btn.innerText = path.toUpperCase() + ": ON";
        btn.className = "btn on";
    } else {
        btn.innerText = path.toUpperCase() + ": OFF";
        btn.className = "btn off";
    }
}
