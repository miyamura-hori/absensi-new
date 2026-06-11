const video = document.getElementById('videoPreview');
const canvas = document.getElementById('canvas');
const fotoData = document.getElementById('fotoData');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const cameraAlert = document.getElementById('cameraAlert');
const btnGroupFoto = document.getElementById('btnGroupFoto');
const btnRetake = document.getElementById('btnRetake');
const btnConfirm = document.getElementById('btnConfirm');
const loadingOverlay = document.getElementById('loadingOverlay');
const mainMenu = document.querySelector('.main-menu');
const absensiInput = document.getElementById('absensiInput');
const selectedAbsensiName = document.getElementById('selectedAbsensiName');
const selectionSummary = document.querySelector('.selection-summary');
const changeSelection = document.querySelector('.change-selection');
const absensiForm = document.getElementById('absensiForm');
const absensiTypeGroup = document.getElementById('absensiTypeGroup');
const absensiTypeInputs = document.querySelectorAll('input[name="absensiType"]');
const btnTakePhoto = document.getElementById('btnTakePhoto');

let kameraAktif = false;
let cameraStream = null;

function startCamera() {
    if (kameraAktif || cameraStream) return;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            cameraStream = stream;
            video.srcObject = stream;
            kameraAktif = true;
            cameraAlert.style.display = 'none';
        })
        .catch(err => {
            kameraAktif = false;
            cameraAlert.style.display = 'block';
            console.error("Kamera error:", err);
        });
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    kameraAktif = false;
    video.srcObject = null;
}

function ambilFoto() {
    if (!kameraAktif) {
        alert("🚫 Tidak bisa ambil foto. Kamera belum diaktifkan.");
        cameraAlert.style.display = 'block';
        return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg');
    imagePreview.src = dataURL;
    previewContainer.style.display = 'block';
    video.style.display = 'none';
    if (btnTakePhoto) btnTakePhoto.style.display = 'none';
}

function retakeFoto() {
    previewContainer.style.display = 'none';
    video.style.display = 'block';
    fotoData.value = "";
    btnGroupFoto.classList.remove('single');
    btnRetake.style.width = 'auto';
    if (btnTakePhoto) btnTakePhoto.style.display = 'inline-block';
}

function konfirmasiFoto() {
    fotoData.value = imagePreview.src;
    btnConfirm.style.display = 'none';
    btnGroupFoto.classList.add('single');
    btnRetake.style.width = '100%';
    alert("📸 Foto disimpan!");
}

document.getElementById('absensiForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    if (!fotoData.value) return alert("Harap ambil dan konfirmasi foto dulu!");
    loadingOverlay.style.display = 'flex';
    fetch('https://script.google.com/macros/s/AKfycbwTutyXMaO9nWglVq2AkzfbsJJzqfaB5WvZgIm2xIUndgQTmKIzPbWRW3jEmi-tF4fZBw/exec', {
        method: 'POST',
        body: formData
    })
        .then(res => res.text())
        .then(data => {
            const status = encodeURIComponent(absensiInput.value || 'Absensi');
            window.location.href = `page2.html?status=${status}`;
        })
        .catch(err => {
            loadingOverlay.style.display = 'none';
            alert("❌ Gagal mengirim absensi.");
        });
});

fetch("https://script.google.com/macros/s/AKfycbwTutyXMaO9nWglVq2AkzfbsJJzqfaB5WvZgIm2xIUndgQTmKIzPbWRW3jEmi-tF4fZBw/exec?namaList")
    .then(res => res.json())
    .then(namaList => {
        const selectNama = document.getElementById("nama");
        namaList.forEach(nama => {
            const opt = document.createElement("option");
            opt.value = nama;
            opt.textContent = nama;
            selectNama.appendChild(opt);
        });
    })
    .catch(err => {
        alert("⚠️ Gagal ambil nama dari Google Sheets.");
        console.error(err);
    });

function setAbsensiTypeVisibility(show) {
    if (!absensiTypeGroup) return;
    absensiTypeGroup.style.display = show ? 'flex' : 'none';
    absensiTypeInputs.forEach(input => {
        input.required = show;
        if (!show) input.checked = false;
    });
}

function showFormForAbsensi(value) {
    absensiInput.value = value;
    selectedAbsensiName.textContent = value;
    setAbsensiTypeVisibility(value === 'Absensi');
    if (mainMenu) mainMenu.classList.add('hidden');
    if (selectionSummary) selectionSummary.classList.remove('hidden');
    if (absensiForm) absensiForm.classList.remove('hidden');
    absensiForm.classList.add('fadeInUp');
    startCamera();
}

function resetAbsensiSelection() {
    absensiInput.value = '';
    setAbsensiTypeVisibility(false);
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (selectionSummary) selectionSummary.classList.add('hidden');
    if (absensiForm) absensiForm.classList.add('hidden');
    stopCamera();
}

const menuCards = document.querySelectorAll('.menu-card');
menuCards.forEach(card => {
    card.addEventListener('click', () => {
        const value = card.getAttribute('data-absensi');
        if (!value) return;
        if (value === 'Istirahat') {
            window.location.href = 'absensi_istirahat.html';
            return;
        }
        showFormForAbsensi(value);
    });
});

if (changeSelection) {
    changeSelection.addEventListener('click', resetAbsensiSelection);
}

// Splash show -> hold 2s -> fade out
document.addEventListener('DOMContentLoaded', () => {
    const splash = document.querySelector('.splash');
    if (!splash) return;
    // small delay to allow CSS to be applied
    setTimeout(() => {
        splash.classList.add('show');
        // Wait: fade-in duration (600ms) + hold 2000ms
        const totalHold = 600 + 2000;
        setTimeout(() => {
            splash.classList.add('hide');
            // remove from flow after fade-out (600ms)
            setTimeout(() => {
                if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
            }, 600);
        }, totalHold);
    }, 50);
});