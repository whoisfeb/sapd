/**
 * DASHBOARD.JS - VERSI STABIL
 * Filter: Senin s/d Sabtu (Sinkron dengan Rekap Admin)
 */

const _supabase = window.supabase.createClient(
    "https://urclmvdkfkfwvdascobs.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4"
);

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const discordId = urlParams.get('id');
    const name = urlParams.get('name');
    const rank = urlParams.get('pangkat');
    const divisi = urlParams.get('divisi');
    const isAdmin = urlParams.get('admin') === 'true';

    // Logika Sinkronisasi Data Saat Login (Fitur Utama)
    if (discordId && name) {
        localStorage.setItem("discord_id", discordId);
        localStorage.setItem("nama_user", decodeURIComponent(name));
        localStorage.setItem("pangkat", decodeURIComponent(rank || "Unknown"));
        localStorage.setItem("divisi", decodeURIComponent(divisi || "-"));
        localStorage.setItem("is_admin", isAdmin);

        await _supabase.from('users_master').upsert({
            discord_id: discordId,
            nama_anggota: decodeURIComponent(name),
            pangkat: decodeURIComponent(rank || "Unknown"),
            divisi: decodeURIComponent(divisi || "-")
        }, { onConflict: 'discord_id' });

        window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!localStorage.getItem("discord_id")) { 
        window.location.href = "index.html"; 
        return;
    }

    updateUI();
    toggleFormMode();
    updateGajiDisplay(); 
};

function updateUI() {
    document.getElementById('name-display').innerText = localStorage.getItem("nama_user");
    document.getElementById('rank-display').innerText = `${localStorage.getItem("pangkat")} | ${localStorage.getItem("divisi")}`;
    
    // Fitur Admin Link
    const adminLink = document.getElementById('admin-link');
    if (adminLink && localStorage.getItem("is_admin") === "true") {
        adminLink.style.display = 'block';
    }
}

async function updateGajiDisplay() {
    const discId = localStorage.getItem("discord_id");
    const pangkat = localStorage.getItem("pangkat");
    
    // --- LOGIKA FILTER: SENIN s/d SABTU ---
    const sekarang = new Date();
    const hariIni = sekarang.getDay(); // 0=Minggu, 1=Senin

    // Cari tanggal Senin minggu ini
    const senin = new Date(sekarang);
    const selisihKeSenin = (hariIni === 0 ? -6 : 1 - hariIni);
    senin.setDate(sekarang.getDate() + selisihKeSenin);
    senin.setHours(0, 0, 0, 0);

    // Cari tanggal Sabtu minggu ini
    const sabtu = new Date(senin);
    sabtu.setDate(senin.getDate() + 5); 
    sabtu.setHours(23, 59, 59, 999);

    try {
        const { data: logs, error } = await _supabase
            .from('absensi_sapd')
            .select('*')
            .eq('discord_id', discId)
            .gte('created_at', senin.toISOString())
            .lte('created_at', sabtu.toISOString())
            .order('created_at', { ascending: false });
        
        if (error) throw error;

        const hariHadirUnik = new Set();
        const hariIzinUnik = new Set();
        const hariCutiUnik = new Set();

        if (logs) {
            logs.forEach(l => {
                const tglKey = new Date(l.created_at).toLocaleDateString('en-CA');
                const status = (l.tipe_absen || "").toUpperCase();

                if (status === "IZIN") hariIzinUnik.add(tglKey);
                else if (status === "CUTI") hariCutiUnik.add(tglKey);
                else if (status === "HADIR") hariHadirUnik.add(tglKey);
            });
        }

        const h = hariHadirUnik.size;
        const i = hariIzinUnik.size;
        const c = hariCutiUnik.size;
        const totalAktif = h + i + c;
        
        // Alpa dihitung dari 6 hari kerja (Senin-Sabtu)
        let a = Math.max(0, 6 - totalAktif);

        // Integrasi dengan config.js
        const hasilGaji = typeof hitungGajiMember === "function" 
            ? hitungGajiMember(pangkat, h) 
            : { gajiAkhir: 0 };
        
        document.getElementById('gaji-val').innerText = `$${hasilGaji.gajiAkhir.toLocaleString()}`;
        document.getElementById('stat-hadir').innerText = h;
        document.getElementById('stat-izin').innerText = i;
        document.getElementById('stat-cuti').innerText = c;
        document.getElementById('stat-alpa').innerText = a;

    } catch (err) { 
        console.error("Gagal sinkronisasi dashboard:", err); 
    }
}

function toggleFormMode() {
    const status = document.getElementById('status_absen').value;
    const today = new Date().toLocaleDateString('en-CA'); 
    
    const hadirSec = document.getElementById('hadir-section');
    const singleSec = document.getElementById('single-date-section');
    const rangeSec = document.getElementById('range-date-section');
    const fileInput = document.getElementById('bukti_foto');
    const tglInput = document.getElementById('tanggal_absen');
    const cutiMulai = document.getElementById('cuti_mulai');
    const cutiSelesai = document.getElementById('cuti_selesai');

    if (status === "HADIR") {
        singleSec.style.display = "block"; rangeSec.style.display = "none"; hadirSec.style.display = "block";
        tglInput.max = today; tglInput.required = true; fileInput.required = true;
    } else if (status === "IZIN") {
        singleSec.style.display = "block"; rangeSec.style.display = "none"; hadirSec.style.display = "none";
        tglInput.min = today; tglInput.required = true; fileInput.required = false;
    } else if (status === "CUTI") {
        singleSec.style.display = "none"; rangeSec.style.display = "block"; hadirSec.style.display = "none";
        cutiMulai.min = today; cutiSelesai.min = today;
        tglInput.required = false; cutiMulai.required = true; cutiSelesai.required = true; fileInput.required = false;
    }
}

document.getElementById('absensi-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const msg = document.getElementById('status-msg');
    const statusAbsen = document.getElementById('status_absen').value;
    const discordId = localStorage.getItem("discord_id");
    
    btn.disabled = true;
    btn.innerText = "Mengirim...";

    try {
        let dateList = [];
        if (statusAbsen === "CUTI") {
            let dStart = new Date(document.getElementById('cuti_mulai').value);
            let dEnd = new Date(document.getElementById('cuti_selesai').value);
            if (dEnd < dStart) throw new Error("Tanggal selesai tidak valid.");
            for (let d = new Date(dStart); d <= dEnd; d.setDate(d.getDate() + 1)) {
                if (d.getDay() !== 0) dateList.push(new Date(d));
            }
        } else {
            let tglVal = new Date(document.getElementById('tanggal_absen').value);
            if (tglVal.getDay() === 0) throw new Error("Hari Minggu libur!");
            dateList.push(tglVal);
        }

        let imgUrl = "N/A";
        const file = document.getElementById('bukti_foto').files[0];
        if (statusAbsen === "HADIR" && file) {
            btn.innerText = "Mengunggah Foto...";
            const path = `absensi/${Date.now()}_${discordId}.png`;
            await _supabase.storage.from('bukti-absen').upload(path, file);
            imgUrl = _supabase.storage.from('bukti-absen').getPublicUrl(path).data.publicUrl;
        }

        const reports = dateList.map(d => ({
            discord_id: discordId,
            nama_anggota: localStorage.getItem("nama_user"),
            pangkat: localStorage.getItem("pangkat"),
            divisi: localStorage.getItem("divisi"),
            tipe_absen: statusAbsen, 
            jam_duty: (statusAbsen === "HADIR") ? `${document.getElementById('jam_mulai').value} - ${document.getElementById('jam_selesai').value}` : null,
            alasan: document.getElementById('kegiatan').value,
            bukti_foto: imgUrl,
            created_at: d.toISOString()
        }));

        const response = await fetch('/.netlify/functions/submit-absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reports)
        });

        if (response.status !== 200) throw new Error("Gagal mengirim laporan.");

        msg.innerText = "✔ Berhasil dikirim!";
        msg.style.color = "#2ecc71";
        document.getElementById('absensi-form').reset();
        toggleFormMode();
        updateGajiDisplay();

    } catch (err) {
        msg.innerText = "❌ " + err.message;
        msg.style.color = "#e94560";
    } finally {
        btn.disabled = false;
        btn.innerText = "Kirim Laporan";
    }
});

function logout() { 
    if (confirm("Logout?")) { localStorage.clear(); window.location.href = "index.html"; }
}