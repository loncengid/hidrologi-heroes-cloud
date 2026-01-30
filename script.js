// 1. Inisialisasi State (Paling Atas agar tidak error)
let relayState = {
    evaporasi: 0,
    kondensasi: 0,
    presipitasi: 0,
    banjir: 0
};

// 2. Konfigurasi Firebase Boss
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

// 3. Hubungkan ke Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 4. Pantau Data Sensor (ESP32 ke Web)
database.ref('sensor').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        document.getElementById('txt-jarak').innerText = data.jarak.toFixed(1);
        document.getElementById('txt-persen').innerText = Math.round(data.persen);
        document.getElementById('water-bar').style.height = data.persen + "%";
    }
});

// 5. Pantau Status Tombol (Agar Sinkron saat Web dibuka)
database.ref('controls').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        relayState = { ...relayState, ...data };
        Object.keys(relayState).forEach(key => updateButtonUI(key));
    }
});

// 6. Fungsi Klik Tombol (Web ke ESP32)
function toggleControl(name) {
    const newVal = relayState[name] === 0 ? 1 : 0;
    database.ref('controls/' + name).set(newVal)
        .then(() => console.log(name + " berhasil diubah."))
        .catch(err => alert("Gagal kirim data!"));
}

// 7. Fungsi Update Tampilan Tombol
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
