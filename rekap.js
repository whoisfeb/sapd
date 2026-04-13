/**
 * REKAP.JS - FULL VERSION (UPDATED WITH UU SYSTEM)
 * Perbaikan: Urutan Inisialisasi Supabase & Security
 * Penambahan: Pilihan Warning Kehadiran & Pelanggaran (uu.js)
 */

// --- 1. INISIALISASI SUPABASE (WAJIB DI PALING ATAS) ---
const _supabase = window.supabase.createClient(
    "https://urclmvdkfkfwvdascobs.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4"
);

let currentWeekOffset = 0;
let userWeekly = {}; 
let tempWarningData = {}; // Menyimpan data sementara saat tombol klik

// --- [ADDON] LOGIKA AUTOMASI DAFTAR ISI UU (GROUPING ANTI-DUPLIKAT) ---
function generateRekapUU() {
    if (typeof kodeHTML === 'undefined') return {};
    const parser = new DOMParser();
    const doc = parser.parseFromString(kodeHTML, 'text/html');
    const sections = doc.querySelectorAll('section');
    
    const rekapTerstruktur = {};

    sections.forEach((section) => {
        const babTitle = section.querySelector('.bab-title')?.innerText || "TANPA BAB";
        const pasalLabel = section.querySelector('.pasal-label')?.innerText || "Tanpa Pasal";
        const ayatLabel = section.querySelector('.ayat-label')?.innerText || "";
        const idBab = section.id;

        // 1. Buat Grup BAB jika belum ada
        if (!rekapTerstruktur[babTitle]) {
            rekapTerstruktur[babTitle] = {
                id: idBab,
                pasalMap: {} // Menggunakan map agar Pasal tidak duplikat
            };
        }

        // 2. Buat Grup PASAL di dalam BAB tersebut jika belum ada
        if (!rekapTerstruktur[babTitle].pasalMap[pasalLabel]) {
            rekapTerstruktur[babTitle].pasalMap[pasalLabel] = {
                ayatList: [] // List untuk menampung banyak Ayat
            };
        }

        // 3. Masukkan Ayat ke dalam Pasal (Hanya jika ayat tersebut belum ada)
        if (ayatLabel && !rekapTerstruktur[babTitle].pasalMap[pasalLabel].ayatList.includes(ayatLabel)) {
            rekapTerstruktur[babTitle].pasalMap[pasalLabel].ayatList.push(ayatLabel);
        }
    });
    return rekapTerstruktur;
}

function renderDaftarIsi() {
    const groupedData = generateRekapUU();
    const container = document.getElementById('rekap-list-container');
    if (!container) return;

    let htmlMarkup = '<div class="rekap-container" style="font-family: sans-serif; padding: 5px;">';

    for (const babName in groupedData) {
        const bab = groupedData[babName];
        
        htmlMarkup += `
            <div class="bab-box" style="background: #222831; border: 1px solid #393e46; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                <div style="background: #00adb5; color: #eeeeee; padding: 12px; font-weight: 900; font-size: 15px; text-align: center; border-bottom: 2px solid #393e46; text-transform: uppercase;">
                    <a href="#${bab.id}" style="color: inherit; text-decoration: none; display: block;">${babName}</a>
                </div>
                
                <div style="padding: 10px;">
        `;

        // Looping Pasal di dalam BAB
        for (const pasalName in bab.pasalMap) {
            const pasalObj = bab.pasalMap[pasalName];
            
            htmlMarkup += `
                <div style="border-bottom: 1px solid #393e46; padding: 10px 0;">
                    <div style="color: #fff; font-weight: bold; font-size: 13px; text-transform: uppercase;">${pasalName}</div>
                    <div style="margin-top: 5px; display: flex; flex-direction: column; gap: 3px;">
            `;

            // Looping Ayat di dalam Pasal
            pasalObj.ayatList.forEach(ayat => {
                htmlMarkup += `<div style="color: #00adb5; font-size: 11px; font-weight: 600; padding-left: 5px; border-left: 2px solid #00adb5;">${ayat}</div>`;
            });

            htmlMarkup += `
                    </div>
                </div>
            `;
        }

        htmlMarkup += `
                </div>
            </div>
        `;
    }

    htmlMarkup += '</div>';
    container.innerHTML = htmlMarkup;
}

// --- 2. SISTEM KEAMANAN & AUTHENTICATION ---
async function checkAuth() {
    const discordId = localStorage.getItem("discord_id");
    const isAdminLocal = localStorage.getItem("is_admin");

    if (!discordId || isAdminLocal !== "true") {
        return accessDenied();
    }

    const { data: user, error } = await _supabase
        .from('users_master')
        .select('is_admin')
        .eq('discord_id', discordId)
        .single();

    if (error || !user || user.is_admin !== true) {
        localStorage.setItem("is_admin", "false"); 
        return accessDenied();
    } else {
        // Jika benar admin, baru tampilkan halaman dan muat data
        document.body.style.display = "block";
        loadData(); 
        renderDaftarIsi(); // <--- PASTIKAN BARIS INI ADA
    }
}

function accessDenied() {
    alert("AKSES DITOLAK: Halaman ini hanya untuk High Command (Admin).");
    window.location.href = "dashboard.html";
}

checkAuth();

// --- 3. LOGIKA UTAMA: MUAT DATA MINGGUAN ---
async function loadData() {
    const { mon, sun } = getWeekRange(currentWeekOffset);
    document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

    const { data: logs } = await _supabase
        .from('absensi_sapd')
        .select('*')
        .gte('created_at', mon.toISOString())
        .lte('created_at', sun.toISOString());

    const { data: masters } = await _supabase
        .from('users_master')
        .select('*');

    if (typeof RANK_ORDER !== 'undefined' && masters) {
        masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));
    }

    userWeekly = {}; 
    masters.forEach(m => {
        userWeekly[m.discord_id] = { 
            info: m, 
            days: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }, 
            totalHadir: 0,
            uniqueDates: new Set() 
        };
    });

    logs.forEach(log => {
        const d = new Date(log.created_at).getDay();
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        const discordId = log.discord_id;

        if (userWeekly[discordId] && d !== 0) {
            const ketAsli = (log.jam_duty || "").toUpperCase();
            const status = ketAsli.includes("IZIN") ? "IZIN" : (ketAsli.includes("CUTI") ? "CUTI" : "HADIR");

            userWeekly[discordId].days[d] = { 
                status: status,
                ket: ketAsli,
                alasan: log.alasan || "-", 
                waktuDuty: log.jam_duty || "-", 
                bukti: log.bukti_foto || log.bukti_gambar,
                tanggalLog: new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }),
                divisi: userWeekly[discordId].info.divisi || "-"
            };

            if (status === "HADIR") {
                if (!userWeekly[discordId].uniqueDates.has(dateKey)) {
                    userWeekly[discordId].totalHadir++; 
                    userWeekly[discordId].uniqueDates.add(dateKey); 
                }
            }
        }
    });

    let totalGajiSemua = 0;
    const currentAdminName = localStorage.getItem("nama_user");
    const currentAdminRank = localStorage.getItem("pangkat");

    document.getElementById('tbody-weekly').innerHTML = masters.map(m => {
        const u = userWeekly[m.discord_id];
        const hasilGaji = typeof hitungGajiMember === 'function' 
            ? hitungGajiMember(m.pangkat, u.totalHadir) 
            : { gajiAkhir: 0 };

        const totalGaji = hasilGaji.gajiAkhir;
        totalGajiSemua += totalGaji;

        const cWarn = m.total_warning || 0;
        
        const getIcon = (idx) => {
            const data = u.days[idx];
            if (!data) return `<span class="cross-icon">✘</span>`;
            
            let label = "✔";
            let iconClass = "check-icon";
            if (data.status === "IZIN") { label = "I"; iconClass = "status-ic"; }
            if (data.status === "CUTI") { label = "C"; iconClass = "status-ic"; }

            const dataStr = JSON.stringify(data).replace(/"/g, '&quot;');
            return `<span class="${iconClass}" style="cursor:pointer;" onclick="openDetailPopup('${m.nama_anggota}', '${m.pangkat}', ${dataStr})">${label}</span>`;
        };

        return `<tr>
            <td style="text-align:left;"><b>${m.nama_anggota}</b></td>
            <td>${m.pangkat}</td>
            ${[1,2,3,4,5,6].map(i => `<td>${getIcon(i)}</td>`).join('')}
            <td>${u.totalHadir}/6</td>
            <td class="salary-text">$${totalGaji.toLocaleString()}</td>
            <td>
                <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                    <button class="btn-warning" onclick="pilihJenisWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${cWarn}, '${currentAdminName}', '${currentAdminRank}')">⚠️ Warning (${cWarn})</button>
                    ${cWarn > 0 ? `<span class="unwarn-link" onclick="removeWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${cWarn}, '${currentAdminName}', '${currentAdminRank}')">[ Cabut SP ]</span>` : ''}
                </div>
            </td>
            <td><button onclick="resetUser('${m.discord_id}')" style="background:none;border:none;cursor:pointer;">🗑</button></td>
        </tr>`;
    }).join('');

    document.getElementById('total-gaji-global').innerText = `$${totalGajiSemua.toLocaleString()}`;
}

// --- 4. FITUR POPUP DETAIL (FIX LAYOUT & MULTI-IMAGE) ---
function openDetailPopup(nama, pangkat, data) {
    const modal = document.getElementById('modal-detail');
    const content = document.getElementById('detail-content');
    
    content.style.maxHeight = "80vh";
    content.style.overflowY = "auto";

    const daftarGambar = data.bukti && data.bukti !== "N/A" ? data.bukti.split(', ') : [];

    content.innerHTML = `
        <div style="color: #eee; font-family: 'Segoe UI', sans-serif; padding: 5px;">
            <h3 style="text-align:center; border-bottom: 2px solid #00adb5; padding-bottom: 10px; margin-bottom: 15px; color:#00adb5;">DETAIL ABSENSI</h3>
            
            <style>
                .pop-row { display: flex; margin-bottom: 10px; line-height: 1.4; border-bottom: 1px solid #333; padding-bottom: 5px; }
                .pop-label { width: 100px; color: #00adb5; font-weight: bold; flex-shrink: 0; }
                .pop-colon { width: 20px; flex-shrink: 0; text-align: center; }
                .pop-val { flex-grow: 1; word-break: break-word; overflow-wrap: anywhere; }
                .img-thumbnail-container { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
                .img-thumbnail { width: 100px; height: 100px; object-fit: cover; border-radius: 6px; border: 2px solid #30475e; cursor: pointer; transition: transform 0.2s; }
                .img-thumbnail:hover { transform: scale(1.05); border-color: #00adb5; }
            </style>

            <div class="pop-row"><div class="pop-label">Nama</div><div class="pop-colon">:</div><div class="pop-val">${nama}</div></div>
            <div class="pop-row"><div class="pop-label">Pangkat</div><div class="pop-colon">:</div><div class="pop-val">${pangkat}</div></div>
            <div class="pop-row"><div class="pop-label">Divisi</div><div class="pop-colon">:</div><div class="pop-val">${data.divisi}</div></div>
            <div class="pop-row"><div class="pop-label">Hari</div><div class="pop-colon">:</div><div class="pop-val">${data.tanggalLog}</div></div>
            <div class="pop-row"><div class="pop-label">Waktu</div><div class="pop-colon">:</div><div class="pop-val">${data.waktuDuty}</div></div>
            <div class="pop-row">
                <div class="pop-label">Status</div><div class="pop-colon">:</div>
                <div class="pop-val"><span style="background:#00adb5; color:#000; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">${data.tipe_absen}</span></div>
            </div>
            <div class="pop-row" style="border-bottom:none;">
                <div class="pop-label">Alasan</div><div class="pop-colon">:</div>
                <div class="pop-val" style="font-style:italic; color:#bbb;">${data.alasan}</div>
            </div>

            <div style="margin-top:20px; border-top: 1px solid #444; padding-top:10px;">
                <p style="color:#00adb5; font-weight:bold; margin-bottom:10px;">Bukti Gambar (${daftarGambar.length}):</p>
                <div class="img-thumbnail-container">
                    ${daftarGambar.length > 0 ? 
                        daftarGambar.map(url => `
                            <img src="${url}" class="img-thumbnail" title="Klik untuk memperbesar" onclick="window.open('${url}', '_blank')">
                        `).join('') : 
                        `<div style="width:100%; padding:20px; text-align:center; background:#222831; border-radius:8px; color:#666;">Tidak ada bukti gambar.</div>`
                    }
                </div>
            </div>
        </div>
    `;
    modal.style.display = "flex";
}

function closeDetailPopup() {
    document.getElementById('modal-detail').style.display = "none";
}

// --- 5. FITUR WARNING & SELEKSI JENIS (BARU) ---

// Fungsi yang dipanggil oleh tombol Warning di tabel
function pilihJenisWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    tempWarningData = { discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank };
    
    // Tampilkan Modal Pilihan Warning (Pastikan ID ini ada di HTML Anda)
    const modalPilihan = document.getElementById('modal-warning-pilihan');
    if (modalPilihan) {
        modalPilihan.style.display = "flex";
    } else {
        // Jika belum ada modal di HTML, gunakan confirm sederhana
        if (confirm("Klik OK untuk Warning Kehadiran\nKlik CANCEL untuk Warning Pelanggaran (UU)")) {
            sendWarning(); // Jalankan fungsi asli (kehadiran)
        } else {
            bukaModalPelanggaranUU();
        }
    }
}

// FUNGSI ASLI: WARNING KEHADIRAN (Hanya ganti nama fungsi agar lebih spesifik)
async function sendWarning() {
    // Data diambil dari tempWarningData jika dipicu lewat pilihJenisWarning
    const { discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank } = tempWarningData;
    
    if (!confirm(`Kirim SP-${currentWarn + 1} Kehadiran ke Discord?`)) return;
    
    const { mon } = getWeekRange(currentWeekOffset);
    const u = userWeekly[discord_id];
    const daftarBolos = [];
    const hariNames = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    for(let i = 1; i <= 6; i++) { 
        const tglTarget = new Date(mon); 
        tglTarget.setDate(mon.getDate() + (i - 1)); 
        tglTarget.setHours(0, 0, 0, 0);
        if(!u.days[i] && tglTarget < hariIni) { 
            daftarBolos.push(`- ${hariNames[i]}, ${tglTarget.toLocaleDateString('id-ID')}`); 
        } 
    }

    if (daftarBolos.length === 0) {
        alert("Tidak ditemukan riwayat bolos s/d kemarin.");
        return;
    }

    const newWarnCount = currentWarn + 1;
    const logPayload = {
        "content": "@everyone <@&1444908462067945623>",
        "embeds": [{
            "title": `📋 SURAT PERINGATAN (SP - ${newWarnCount}) - KEHADIRAN`,
            "color": 15285324,
            "description": `**Nama Anggota:** ${nama_anggota}\n**Pangkat:** ${pangkat_anggota}\n\n**Alasan:** Tidak memenuhi syarat kehadiran mingguan.\n\n**Detail:**\n${daftarBolos.join('\n')}\n\n**Pemberi:** ${adminName}`,
            "timestamp": new Date()
        }]
    };

    await executeWarningFinal(discord_id, newWarnCount, logPayload, nama_anggota);
}

// FUNGSI BARU: Buka Modal UU
// 1. UPDATE FUNGSI BUKA MODAL (Agar menangkap teks hukuman lengkap)
function bukaModalPelanggaranUU() {
    const modalUU = document.getElementById('modal-pelanggaran-uu');
    if (!modalUU) return;

    // Menampilkan data dasar
    document.getElementById('uu-nama').innerText = tempWarningData.nama_anggota;
    document.getElementById('uu-pangkat').innerText = tempWarningData.pangkat_anggota;
    document.getElementById('uu-divisi').innerText = userWeekly[tempWarningData.discord_id]?.info?.divisi || "-";
    
    // PERBAIKAN: Menampilkan Total SP yang dimiliki user saat ini
    const spSekarang = tempWarningData.currentWarn || 0;
    document.getElementById('uu-sp-saat-ini').innerText = spSekarang;

    const container = document.getElementById('uu-list-container');
    container.innerHTML = "";
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(kodeHTML, 'text/html');
    const sections = doc.querySelectorAll('section');

    sections.forEach(sec => {
        const babTitle = sec.querySelector('.bab-title')?.innerText || "Tanpa BAB";
        const penaltyBoxes = sec.querySelectorAll('.penalty-box');

        penaltyBoxes.forEach((box, index) => {
            const sanksiLabel = box.querySelector('.denda-text')?.innerText || "SANKSI:";
            const ayatElement = box.previousElementSibling;
            const ayatText = ayatElement && ayatElement.classList.contains('ayat') ? ayatElement.innerText.trim() : "Pelanggaran terkait";

            const allLabels = Array.from(sec.querySelectorAll('.pasal-label'));
            const currentPasalLabel = allLabels.reverse().find(l => l.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING)?.innerText || "";

            // PERBAIKAN: Gunakan innerHTML lalu ganti <br> menjadi newline agar split lebih akurat
            const cleanText = box.innerHTML
                .replace(/<br\s*[\/]?>/gi, "\n") // Ubah <br> jadi baris baru
                .replace(/<[^>]+>/g, ""); // Hapus tag HTML lainnya (seperti span)
            
            const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 5);
            
            const lineMin = lines.find(l => l.toUpperCase().includes("MIN:")) || "";
            const lineMax = lines.find(l => l.toUpperCase().includes("MAX:")) || "";

            // Fungsi helper untuk ambil angka dan sanksi setelah |
            const extractData = (text) => {
                const dendaMatch = text.match(/[\d.]+/);
                const dendaVal = dendaMatch ? dendaMatch[0].replace(/\./g, '') : "0";
                const sanksiVal = text.split('|')[1]?.trim() || "-"; // Mengambil teks setelah |
                return { denda: dendaVal, sanksi: sanksiVal };
            };

            const dataMin = extractData(lineMin);
            const dataMax = extractData(lineMax);

            const uniqueId = `choice_${sec.id}_${index}`;

            const div = document.createElement('div');
            div.style.cssText = "margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.03); border-radius: 10px; border-left: 4px solid #e94560;";
            div.innerHTML = `
                <div style="font-size: 10px; color: #888; text-transform: uppercase;">${babTitle} | ${currentPasalLabel}</div>
                <div style="color:#00adb5; font-weight:bold; font-size:13px; margin: 5px 0;">${sanksiLabel}</div>
                <div style="font-size:11px; color:#bbb; margin-bottom:12px; line-height:1.4;">${ayatText}</div>
                
                <div style="display:flex; gap:10px;">
                    <label style="flex:1; cursor:pointer; background:#1a1a2e; padding:10px; border-radius:6px; border:1px solid #30475e; text-align:center;">
                        <input type="radio" name="${uniqueId}" class="cb-uu" 
                            data-denda="${dataMin.denda}" 
                            data-hukuman="${dataMin.sanksi}"
                            data-label="${currentPasalLabel} - ${sanksiLabel} (MIN)" onchange="hitungUU()">
                        <div style="font-weight:bold; color:#fff; font-size:10px;">MIN</div>
                        <div style="color:#27ae60; font-size:12px; font-weight:bold;">Rp ${parseInt(dataMin.denda).toLocaleString('id-ID')}</div>
                        <div style="color:#e94560; font-size:10px; font-weight:bold;">${dataMin.sanksi}</div>
                    </label>

                    <label style="flex:1; cursor:pointer; background:#1a1a2e; padding:10px; border-radius:6px; border:1px solid #30475e; text-align:center;">
                        <input type="radio" name="${uniqueId}" class="cb-uu" 
                            data-denda="${dataMax.denda}" 
                            data-hukuman="${dataMax.sanksi}"
                            data-label="${currentPasalLabel} - ${sanksiLabel} (MAX)" onchange="hitungUU()">
                        <div style="font-weight:bold; color:#fff; font-size:10px;">MAX</div>
                        <div style="color:#27ae60; font-size:12px; font-weight:bold;">Rp ${parseInt(dataMax.denda).toLocaleString('id-ID')}</div>
                        <div style="color:#e94560; font-size:10px; font-weight:bold;">${dataMax.sanksi}</div>
                    </label>
                </div>
            `;
            container.appendChild(div);
        });
    });

    document.getElementById('uu-total-denda').innerText = "Rp 0";
    
    // Tambahkan baris ini untuk mereset teks hukuman di popup
    const hText = document.getElementById('uu-list-hukuman');
    if(hText) hText.innerText = "Belum ada sanksi tambahan";

    modalUU.style.display = "flex";

    // PENTING: Panggil fungsi uncheck agar radio bisa dibatalkan
    enableRadioUncheck();
}

// FUNGSI HITUNG OTOMATIS SAAT DIKLIK
function hitungUU() {
    const selected = document.querySelectorAll('.cb-uu:checked');
    let total = 0;
    let listSanksi = [];

    selected.forEach(item => {
        total += parseInt(item.dataset.denda || 0);
        
        // Ambil data hukuman dari dataset
        const sanksi = item.dataset.hukuman || item.dataset.sanksi;
        if (sanksi && sanksi !== "-") {
            listSanksi.push(sanksi);
        }
    });

    // Update Angka Denda
    document.getElementById('uu-total-denda').innerText = "Rp " + total.toLocaleString('id-ID');

    // Update Teks Sanksi di Popup
    const containerSanksi = document.getElementById('uu-list-hukuman');
    if (containerSanksi) {
        if (listSanksi.length > 0) {
            // Set(listSanksi) agar sanksi yang sama tidak muncul dua kali
            const uniqueSanksi = [...new Set(listSanksi)];
            containerSanksi.innerText = "Sanksi Tambahan: " + uniqueSanksi.join(", ");
        } else {
            containerSanksi.innerText = "Tidak ada sanksi tambahan";
        }
    }
}
function enableRadioUncheck() {
    document.querySelectorAll('.cb-uu').forEach(radio => {
        radio.onclick = function() {
            if (this.previousValue === 'true') {
                this.checked = false;
                this.previousValue = 'false';
                hitungUU(); // Jalankan hitung ulang setelah batal pilih
            } else {
                // Reset flag pada radio lain dalam satu name group
                document.querySelectorAll(`input[name="${this.name}"]`).forEach(r => {
                    r.previousValue = 'false';
                });
                this.checked = true;
                this.previousValue = 'true';
                hitungUU();
            }
        };
    });
}

async function kirimWarningPelanggaran() {
    const selected = document.querySelectorAll('.cb-uu:checked');
    if (selected.length === 0) return alert("Silakan pilih pelanggaran terlebih dahulu!");

    let detailPelanggaran = [];
    let totalDenda = 0;

    selected.forEach(cb => {
        const denda = parseInt(cb.dataset.denda || 0);
        
        // PERBAIKAN DI SINI: Samakan dengan properti di dataset modal (data-sanksi)
        // Jika di modal pakai data-hukuman, gunakan cb.dataset.hukuman
        // Jika di modal pakai data-sanksi, gunakan cb.dataset.sanksi
        const sanksiTambahan = cb.dataset.sanksi || cb.dataset.hukuman || "-"; 
        
        const label = cb.dataset.label;

        totalDenda += denda;
        
        // Format teks yang akan dikirim ke Discord
        detailPelanggaran.push(`- **${label}**: Rp ${denda.toLocaleString('id-ID')} | *Sanksi: ${sanksiTambahan}*`);
    });

    // Kalkulasi Total SP (Ambil data SP saat ini + 1)
    const currentSP = parseInt(tempWarningData.currentWarn || 0);
    const totalSPBaru = currentSP + 1;

    const logPayload = {
        "content": "@everyone <@&1444908462067945623>",
        "embeds": [{
            "title": `⚖️ SURAT PERINGATAN (SP - ${totalSPBaru})`,
            "color": 15548997,
            "description": [
                `**Nama Anggota:** ${tempWarningData.nama_anggota}`,
                `**Pangkat:** ${tempWarningData.pangkat_anggota}`,
                `**Status SP:** \`SP ${totalSPBaru}\` *(Sebelumnya SP ${currentSP})*`,
                `\n**RINCIAN PELANGGARAN:**`,
                detailPelanggaran.join('\n'),
                `\n**TOTAL DENDA:** Rp ${totalDenda.toLocaleString('id-ID')}`,
                `**PEMBERI SANKSI:** ${tempWarningData.adminName}`
            ].join('\n'),
            "footer": { 
                "text": "SAPD Admin Panel Pro • " + new Date().toLocaleString('id-ID') 
            },
            "timestamp": new Date()
        }]
    };

    // Jalankan eksekusi final
    await executeWarningFinal(tempWarningData.discord_id, totalSPBaru, logPayload, tempWarningData.nama_anggota);
    
    // Tutup modal
    const modal = document.getElementById('modal-pelanggaran-uu');
    if (modal) modal.style.display = "none";
}
// Fungsi Internal Pengiriman Final
async function executeWarningFinal(discord_id, newCount, payload, nama) {
    try {
        await _supabase.from('users_master').update({ total_warning: newCount }).eq('discord_id', discord_id);
        const res = await fetch('/.netlify/functions/send-warning', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload: payload, updateList: await updateDiscordList() }) 
        });
        if (res.ok) {
            alert(`SP Berhasil dikirim untuk ${nama}!`);
            loadData();
            const modalPilihan = document.getElementById('modal-warning-pilihan');
            if (modalPilihan) modalPilihan.style.display = "none";
        }
    } catch (err) {
        console.error(err);
        alert("Gagal mengirim data.");
    }
}

// FUNGSI CABUT SP (ASLI)
async function removeWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    if (!confirm(`Cabut SP untuk ${nama_anggota}?\n(Oleh: ${adminName} - ${adminRank})`)) return;
    const newWarnCount = Math.max(0, currentWarn - 1);

    const logPayload = {
        "content": "<@&1444908462067945623>",
        "embeds": [{
            "title": `🔓 PENCABUTAN SURAT PERINGATAN`,
            "color": 3066993,
            "description": `**Nama Anggota:** ${nama_anggota} (<@${discord_id}>)\n**Sisa SP:** ${newWarnCount}\n\n**Dicabut Oleh:** ${adminName}`,
            "timestamp": new Date()
        }]
    };

    await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
    const res = await fetch('/.netlify/functions/send-warning', { 
        method: 'POST', 
        body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) 
    });

    if (res.ok) { 
        alert("SP Berhasil dicabut!"); 
        loadData(); 
    }
}

async function updateDiscordList() {
    const { data: masters } = await _supabase.from('users_master').select('*');
    if (typeof RANK_ORDER !== 'undefined') {
        masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));
    }
    
    let txt = "## 📊 DAFTAR TOTAL WARNING ANGGOTA SAPD\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    masters.forEach(m => {
        const emoji = m.total_warning >= 3 ? "🔴" : (m.total_warning > 0 ? "🟡" : "🟢");
        txt += `${emoji} ${m.nama_anggota} (<@${m.discord_id}>) : \`${m.total_warning || 0} SP\`\n`;
    });
    return txt.substring(0, 1990);
}

// --- 6. EXPORT TOOLS (EXCEL & PDF) ---
function downloadExcel() {
    const rows = [["Nama Anggota", "Pangkat", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Total", "Gaji"]];
    document.querySelectorAll("#tbody-weekly tr").forEach(tr => {
        const rowData = [];
        tr.querySelectorAll("td").forEach((td, i) => {
            if(i < 10) {
                let val = td.innerText.trim();
                if(td.querySelector(".check-icon")) val = "HADIR";
                else if(td.querySelector(".cross-icon")) val = "ALPA";
                rowData.push(val);
            }
        });
        rows.push(rowData);
    });
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, `Rekap_SAPD.xlsx`);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.autoTable({
        html: '#table-rekap',
        columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        theme: 'grid'
    });
    doc.save(`Rekap_SAPD.pdf`);
}

// --- 7. UTILS & DATA MANAGEMENT ---
function getWeekRange(offset = 0) {
    const now = new Date(); 
    now.setDate(now.getDate() + (offset * 7));
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff)); 
    mon.setHours(0,0,0,0);
    const sun = new Date(mon); 
    sun.setDate(mon.getDate() + 6); 
    sun.setHours(23,59,59,999);
    return { mon, sun };
}

async function resetUser(id) {
    if (!confirm("Hapus data absensi minggu ini?")) return;
    const { mon, sun } = getWeekRange(currentWeekOffset);
    await _supabase.from('absensi_sapd').delete().eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
    loadData();
}

function changeWeek(dir) { 
    currentWeekOffset += dir; 
    loadData(); 
}

// Klik luar modal untuk menutup
window.onclick = function(event) {
    const modalD = document.getElementById('modal-detail');
    const modalP = document.getElementById('modal-warning-pilihan');
    const modalU = document.getElementById('modal-pelanggaran-uu');
    if (event.target == modalD) modalD.style.display = "none";
    if (event.target == modalP) modalP.style.display = "none";
    if (event.target == modalU) modalU.style.display = "none";
}