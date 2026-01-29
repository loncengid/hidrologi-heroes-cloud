/**
 * Project: Hidrologi Heroes - NISEEF 2026
 * Mentor: Tatang Gunadi, S.Kom, M.Si
 * Logic: Firebase Realtime Database Integration
 */

// 1. KONFIGURASI LENGKAP FIREBASE
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

// 2. INISIALISASI
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// State lokal untuk melacak status tombol agar sinkron
let relayState = {
  evaporasi: 0,
  kondensasi: 0,
  presipitasi: 0,
  banjir: 0
};

// 3. MENDENGARKAN DATA DARI ESP32 (REAL-TIME)
// Membaca data jarak dan persentase air
database.ref('sensor').on('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    updateSensorUI(data.jarak, data.persen);
  }
});

// Membaca status pompa otomatis
database.ref('status/pompa').on('value', (snapshot) => {
  const status = snapshot.val() || "-";
  const el = document.getElementById('txt-pompa');
  if (el) el.innerText = status;
});

// 4. FUNGSI UNTUK UPDATE TAMPILAN (UI)
function updateSensorUI(jarak, persen) {
  // Update teks angka
  if (document.getElementById('txt-jarak')) document.getElementById('txt-jarak').innerText = jarak.toFixed(2);
  if (document.getElementById('txt-persen')) document.getElementById('txt-persen').innerText = Math.round(persen);

  // LOGIKA PSIKOLOGI KARAKTER (Tirta & Tato)
  // Contoh: Tirta berubah warna/keterangan berdasarkan level air
  const tirtaMsg = document.getElementById('tirta-speech');
  if (tirtaMsg) {
    if (persen > 80) {
      tirtaMsg.innerText = "Wah, air melimpah! Aku bahagia!";
      tirtaMsg.style.color = "blue";
    } else if (persen < 20) {
      tirtaMsg.innerText = "Duh, air mulai kering. Ayo pompa lagi!";
      tirtaMsg.style.color = "red";
    } else {
      tirtaMsg.innerText = "Siklus air berjalan normal, Pak Tatang!";
      tirtaMsg.style.color = "green";
    }
  }
}

// 5. FUNGSI KONTROL RELAY (DIKIRIM KE ESP32)
function toggleControl(relayName) {
  // Balikkan nilai (Toggle)
  relayState[relayName] = relayState[relayName] === 0 ? 1 : 0;
  
  // Kirim nilai baru ke Firebase path: controls/[nama_relay]
  database.ref('controls/' + relayName).set(relayState[relayName])
    .then(() => {
      console.log(relayName + " berhasil diubah ke: " + relayState[relayName]);
      updateButtonUI(relayName);
    })
    .catch((error) => {
      console.error("Gagal mengirim data: ", error);
      alert("Koneksi bermasalah!");
    });
}

// Update tampilan tombol secara manual setelah klik
function updateButtonUI(name) {
  const btn = document.getElementById('btn-' + name);
  if (btn) {
    if (relayState[name] === 1) {
      btn.innerText = name.toUpperCase() + ": ON";
      btn.classList.add('active'); // Pastikan Bapak punya class .active di CSS
    } else {
      btn.innerText = name.toUpperCase() + ": OFF";
      btn.classList.remove('active');
    }
  }
}

// 6. SYNC AWAL (Opsional: Agar saat web dibuka, status tombol sesuai dengan database)
database.ref('controls').once('value', (snapshot) => {
  const data = snapshot.val();
  if (data) {
    relayState = { ...relayState, ...data };
    Object.keys(relayState).forEach(key => updateButtonUI(key));
  }
});
