/**
 * REKAP.JS - FINAL PRODUCTION VERSION
 * Update: Mapping Column (Alasan & Waktu), Fix UI Popup Bug, Complete logic
 */

// 1. KEAMANAN AKSES (Admin Only)
function checkAuth() {
    const isAdmin = localStorage.getItem("is_admin");
    if (isAdmin !== "true") {
        alert("AKSES DITOLAK: Halaman ini hanya untuk High Command (Admin).");
        window.location.href = "dashboard.html";
    } else {
        document.body.style.display = "block";
    }
}
checkAuth();

// 2. KONFIGURASI DATABASE
const _supabase = window.supabase.createClient(
    "https://urclmvdkfkfwvdascobs.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4"
);

let currentWeekOffset = 0;
let userWeekly = {}; 

// 3. LOGIKA PENGAMBILAN DATA
async function loadData() {
    const { mon, sun } = getWeekRange(currentWeekOffset);
    document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

    // Ambil data absensi dan master user secara bersamaan
    const [resLogs, resMasters] = await Promise.all([
        _supabase.from('absensi_sapd').select('*').gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString()),
        _supabase.from('users_master').select('*')
    ]);

    if (resLogs.error || resMasters.error) {
        console.error("Gagal mengambil data database");
        return;
    }

    const logs = resLogs.data;
    const masters = resMasters.data;

    // Urutkan berdasarkan Pangkat (RANK_ORDER harus ada di config.js)
    masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));

    // Reset dan Inisialisasi Data Weekly
    userWeekly = {}; 
    masters.forEach(m => {
        userWeekly[m.discord_id] = { 
            info: m, 
            days: { 1:null, 2:null, 3:null, 4:null, 5:null, 6:null }, 
            totalHadir: 0,
            uniqueDates: new Set() 
        };
    });

    // Proses Log Absensi
    logs.forEach(log => {
        const d = new Date(log.created_at).getDay();
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        const discordId = log.discord_id;

        // Skip jika hari Minggu (0) atau user tidak ada di master
        if (userWeekly[discordId] && d !== 0) {
            const ketAsli = (log.jam_duty || "").toUpperCase();
            const status = ketAsli.includes("IZIN") ? "IZIN" : (ketAsli.includes("CUTI") ? "CUTI" : "HADIR");

            userWeekly[discordId].days[d] = { 
                alasan: log.alasan || "-",         // AMBIL DARI KOLOM ALASAN
                waktuDuty: log.jam_duty || "-",    // AMBIL DARI KOLOM JAM_DUTY
                bukti: log.bukti_foto,
                tanggalLog: new Date(log.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' }),
                divisi: userWeekly[discordId].info.divisi || "-",
                status: status
            };

            // Hitung kehadiran (Hanya jika status HADIR dan belum tercatat di tanggal tersebut)
            if (status === "HADIR" && !userWeekly[discordId].uniqueDates.has(dateKey)) {
                userWeekly[discordId].totalHadir++; 
                userWeekly[discordId].uniqueDates.add(dateKey); 
            }
        }
    });

    renderTable(masters);
}

// 4. RENDER TABEL UTAMA
function renderTable(masters) {
    let totalGajiGlobal = 0;
    const tbody = document.getElementById('tbody-weekly');
    
    tbody.innerHTML = masters.map(m => {
        const u = userWeekly[m.discord_id];
        // Fungsi hitungGajiMember berasal dari config.js
        const hasilGaji = hitungGajiMember(m.pangkat, u.totalHadir); 
        totalGajiGlobal += hasilGaji.gajiAkhir;

        const getIcon = (idx) => {
            const data = u.days[idx];
            if (!data) return `<span class="cross-icon">✘</span>`;
            
            const iconClass = (data.status === "HADIR") ? "check-icon" : "status-ic";
            const label = (data.status === "HADIR") ? "✔" : (data.status === "IZIN" ? "I" : "C");
            
            // Konversi objek data ke string untuk dikirim ke popup
            const dataStr = JSON.stringify(data).replace(/"/g, '&quot;');
            return `<span class="${iconClass}" style="cursor:pointer;" onclick="openDetailPopup('${m.nama_anggota}', '${m.pangkat}', ${dataStr})">${label}</span>`;
        };

        return `
        <tr>
            <td style="text-align:left;"><b>${m.nama_anggota}</b></td>
            <td>${m.pangkat}</td>
            ${[1, 2, 3, 4, 5, 6].map(i => `<td>${getIcon(i)}</td>`).join('')}
            <td>${u.totalHadir}/6</td>
            <td class="salary-text">$${hasilGaji.gajiAkhir.toLocaleString()}</td>
            <td>
                <button class="btn-warning" onclick="sendWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${m.total_warning || 0})">⚠️ (${m.total_warning || 0})</button>
            </td>
            <td><button onclick="resetUser('${m.discord_id}')" style="background:none;border:none;cursor:pointer;">🗑</button></td>
        </tr>`;
    }).join('');

    document.getElementById('total-gaji-global').innerText = `$${totalGajiGlobal.toLocaleString()}`;
}

// 5. MODAL POPUP DETAIL (PERBAIKAN TAMPILAN)
function openDetailPopup(nama, pangkat, data) {
    const modal = document.getElementById('modal-detail');
    const content = document.getElementById('detail-content');
    
    // Pastikan area konten bisa di-scroll jika terlalu panjang
    content.style.maxHeight = "85vh";
    content.style.overflowY = "auto";

    content.innerHTML = `
        <div style="color: #eee; font-family: 'Segoe UI', sans-serif; padding: 5px;">
            <h3 style="text-align:center; border-bottom: 2px solid #00adb5; padding-bottom: 10px; margin-bottom: 15px; color:#00adb5; letter-spacing: 1px;">DETAIL ABSENSI</h3>
            
            <style>
                .popup-row { display: flex; margin-bottom: 12px; line-height: 1.5; border-bottom: 1px solid #333; padding-bottom: 8px; align-items: flex-start; }
                .popup-label { width: 100px; color: #00adb5; font-weight: bold; flex-shrink: 0; font-size: 14px; }
                .popup-colon { width: 20px; flex-shrink: 0; text-align: center; }
                .popup-value { flex-grow: 1; word-break: break-word; overflow-wrap: anywhere; font-size: 14px; }
            </style>

            <div class="popup-row"><div class="popup-label">Nama</div><div class="popup-colon">:</div><div class="popup-value">${nama}</div></div>
            <div class="popup-row"><div class="popup-label">Pangkat</div><div class="popup-colon">:</div><div class="popup-value">${pangkat}</div></div>
            <div class="popup-row"><div class="popup-label">Divisi</div><div class="popup-colon">:</div><div class="popup-value">${data.divisi}</div></div>
            <div class="popup-row"><div class="popup-label">Hari</div><div class="popup-colon">:</div><div class="popup-value">${data.tanggalLog}</div></div>
            <div class="popup-row"><div class="popup-label">Waktu</div><div class="popup-colon">:</div><div class="popup-value">${data.waktuDuty}</div></div>
            <div class="popup-row">
                <div class="popup-label">Status</div><div class="popup-colon">:</div>
                <div class="popup-value">
                    <span style="background:#00adb5; color:#000; padding:2px 10px; border-radius:4px; font-weight:bold; font-size:12px;">${data.status}</span>
                </div>
            </div>
            <div class="popup-row" style="border-bottom:none;">
                <div class="popup-label">Alasan</div><div class="popup-colon">:</div>
                <div class="popup-value" style="font-style:italic; color:#00adb5;">${data.alasan}</div>
            </div>

            <div style="margin-top:20px;">
                <p style="color:#00adb5; font-weight:bold; margin-bottom:10px; border-top: 1px solid #444; padding-top:10px; font-size: 14px;">Bukti Gambar:</p>
                ${data.bukti ? 
                    `<img src="${data.bukti}" style="width:100%; border-radius:8px; border:2px solid #30475e; box-shadow: 0 4px 15px rgba(0,0,0,0.5); cursor: pointer;" onclick="window.open('${data.bukti}', '_blank')">` : 
                    `<div style="padding:30px; text-align:center; background:#1a1a1a; border-radius:8px; color:#555; border: 1px dashed #444;">Tidak ada bukti gambar.</div>`
                }
            </div>
        </div>
    `;
    modal.style.display = "flex";
}

function closeDetailPopup() {
    document.getElementById('modal-detail').style.display = "none";
}

// Menutup modal jika user klik area gelap (background)
window.onclick = function(event) {
    const modal = document.getElementById('modal-detail');
    if (event.target == modal) closeDetailPopup();
}

// 6. FUNGSI UTILITAS (WAKTU & RESET)
function getWeekRange(offset = 0) {
    const now = new Date(); now.setDate(now.getDate() + (offset * 7));
    const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff)); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    return { mon, sun };
}

async function resetUser(id) {
    if (!confirm("Peringatan: Hapus data absensi anggota ini untuk minggu yang dipilih?")) return;
    const { mon, sun } = getWeekRange(currentWeekOffset);
    await _supabase.from('absensi_sapd').delete()
        .eq('discord_id', id)
        .gte('created_at', mon.toISOString())
        .lte('created_at', sun.toISOString());
    loadData();
}

function changeWeek(dir) { 
    currentWeekOffset += dir; 
    loadData(); 
}

// Jalankan aplikasi pertama kali
loadData();