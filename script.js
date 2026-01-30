/* PROJECT: HIDROLOGI HEROES - NISEEF 2026 */

// 1. Inisialisasi State (Matikan semua di awal)
let relayState = {
    evaporasi: 0, kondensasi: 0, presipitasi: 0, banjir: 0
};

// 2. Konfigurasi Firebase Boss (Update Terbaru)
const firebaseConfig = {
    apiKey: "AIzaSyCbKNlViQO-BRj818y-sNd7LjvMkf6Q0Wg",
    authDomain: "hidrologi-heroes.firebaseapp.com",
    databaseURL: "https://hidrologi-heroes-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "hidrologi-heroes",
    storageBucket: "hidrologi-heroes.firebasestorage.app",
    messagingSenderId: "349578733020",
    appId: "1:349578733020:web:df27bed634e6bdefd5db19",
    measurementId: "G-HMVQ476SYS"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 3. Pantau Data Sensor (ESP32 -> Web)
database.ref('sensor').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById('txt-jarak').innerText = data.jarak ? data.jarak.toFixed(1) : "0";
        document.getElementById('txt-persen').innerText = data.persen ? Math.round(data.persen) : "0";
        document.getElementById('water-bar').style.height = (data.persen || 0) + "%";
    }
});

// 4. Pantau Status untuk Update Warna Tombol
database.ref('diorama/status').on('value', (snapshot) => {
    const statusAktif = snapshot.val();
    // Reset semua state lokal dulu
    Object.keys(relayState).forEach(key => relayState[key] = 0);
    // Setel yang aktif
    if (statusAktif && statusAktif !== "off") {
        relayState[statusAktif] = 1;
    }
    // Update tampilan semua tombol
    Object.keys(relayState).forEach(key => updateButtonUI(key));
});

// 5. Fungsi Klik Tombol (Web -> ESP32)
function toggleControl(name) {
    // Jika tombol yang diklik sudah ON, kirim 'off'. Jika OFF, kirim namanya.
    const perintah = (relayState[name] === 1) ? "off" : name;
    
    // Tulis ke path yang ditunggu ESP32
    database.ref('diorama/status').set(perintah)
        .then(() => console.log("Perintah terkirim: " + perintah))
        .catch(err => console.error("Gagal: ", err));
}

function updateButtonUI(name) {
    const btn = document.getElementById('btn-' + name);
    if (btn) {
        if (relayState[name] === 1) {
            btn.innerText = name.toUpperCase() + ": ON";
            btn.className = "btn on";
        } else {
            btn.innerText = name.toUpperCase() + ": OFF";
            btn.className = "btn off";
        }
    }
}
