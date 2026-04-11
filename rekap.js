/**
 * REKAP.JS - CLEAN VERSION
 * Menggunakan RANK_ORDER dan hitungGajiMember dari config.js
 */

// 1. PROTEKSI HALAMAN
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

// 2. KONFIGURASI SUPABASE
const _supabase = window.supabase.createClient(
    "https://urclmvdkfkfwvdascobs.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4"
);

let currentWeekOffset = 0;
let userWeekly = {}; 

// 3. LOAD & RENDER DATA
async function loadData() {
    const { mon, sun } = getWeekRange(currentWeekOffset);
    document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

    // Ambil Data Absensi & Master User secara paralel
    const [resLogs, resMasters] = await Promise.all([
        _supabase.from('absensi_sapd').select('*').gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString()),
        _supabase.from('users_master').select('*')
    ]);

    if (resLogs.error || resMasters.error) {
        console.error("Database Error:", resLogs.error || resMasters.error);
        return;
    }

    const logs = resLogs.data;
    const masters = resMasters.data;

    // SORTING: Menggunakan RANK_ORDER dari config.js
    masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));

    // Inisialisasi struktur data mingguan
    userWeekly = {}; 
    masters.forEach(m => {
        userWeekly[m.discord_id] = { 
            info: m, 
            days: { 1:null, 2:null, 3:null, 4:null, 5:null, 6:null }, 
            totalHadir: 0,
            uniqueDates: new Set() 
        };
    });

    // Mapping Logs ke User
    logs.forEach(log => {
        const d = new Date(log.created_at).getDay();
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        const discordId = log.discord_id;

        if (userWeekly[discordId] && d !== 0) { // d=0 adalah Minggu (Libur)
            const ketAsli = (log.jam_duty || "").toUpperCase();
            const status = ketAsli.includes("IZIN") ? "IZIN" : (ketAsli.includes("CUTI") ? "CUTI" : "HADIR");

            userWeekly[discordId].days[d] = { 
                ket: log.alasan || log.jam_duty || "Tanpa Keterangan",
                bukti: log.bukti_foto,
                waktu: new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                divisi: userWeekly[discordId].info.divisi || "-",
                status: status
            };

            // Hitung kehadiran valid (Bukan Izin/Cuti)
            if (status === "HADIR" && !userWeekly[discordId].uniqueDates.has(dateKey)) {
                userWeekly[discordId].totalHadir++; 
                userWeekly[discordId].uniqueDates.add(dateKey); 
            }
        }
    });

    let totalGajiGlobal = 0;

    // Render Baris Tabel
    document.getElementById('tbody-weekly').innerHTML = masters.map(m => {
        const u = userWeekly[m.discord_id];
        
        // GAJI: Menggunakan hitungGajiMember dari config.js
        const hasilGaji = hitungGajiMember(m.pangkat, u.totalHadir); 
        const totalGaji = hasilGaji.gajiAkhir;
        totalGajiGlobal += totalGaji;

        const currentWarn = m.total_warning || 0;
        const adminName = localStorage.getItem("nama_user");
        const adminRank = localStorage.getItem("pangkat");

        const getIcon = (idx) => {
            const data = u.days[idx];
            if (!data) return `<span class="cross-icon">✘</span>`;
            
            let iconClass = (data.status === "HADIR") ? "check-icon" : "status-ic";
            let label = (data.status === "HADIR") ? "✔" : (data.status === "IZIN" ? "I" : "C");

            const dataStr = JSON.stringify(data).replace(/"/g, '&quot;');
            return `<span class="${iconClass}" style="cursor:pointer;" onclick="openDetailPopup('${m.nama_anggota}', '${m.pangkat}', ${idx}, ${dataStr})">${label}</span>`;
        };

        return `<tr>
            <td style="text-align:left;"><b>${m.nama_anggota}</b></td>
            <td>${m.pangkat}</td>
            ${[1,2,3,4,5,6].map(i => `<td>${getIcon(i)}</td>`).join('')}
            <td>${u.totalHadir}/6</td>
            <td class="salary-text">$${totalGaji.toLocaleString()}</td>
            <td>
                <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                    <button class="btn-warning" onclick="sendWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${currentWarn}, '${adminName}', '${adminRank}')">⚠️ Warning (${currentWarn})</button>
                    ${currentWarn > 0 ? `<span class="unwarn-link" onclick="removeWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${currentWarn}, '${adminName}', '${adminRank}')">[ Cabut SP ]</span>` : ''}
                </div>
            </td>
            <td><button onclick="resetUser('${m.discord_id}')" style="background:none;border:none;cursor:pointer;">🗑</button></td>
        </tr>`;
    }).join('');

    document.getElementById('total-gaji-global').innerText = `$${totalGajiGlobal.toLocaleString()}`;
}

// 4. POPUP DETAIL (ALIGNED & RESPONSIVE)
function openDetailPopup(nama, pangkat, dayIdx, data) {
    const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const modal = document.getElementById('modal-detail');
    const content = document.getElementById('detail-content');
    
    const imageUrl = (data.bukti && data.bukti.trim() !== "") ? data.bukti : null;

    content.innerHTML = `
        <div style="text-align:left; font-family: 'Segoe UI', sans-serif;">
            <h3 style="border-bottom: 2px solid #00adb5; padding-bottom: 10px; color: #fff; margin-top:0; text-align:center;">DETAIL ABSENSI</h3>
            <table style="width:100%; color:#ccc; border-collapse: collapse;">
                <tr style="height: 32px;">
                    <td style="width:100px; color:#00adb5; font-weight:bold;">Nama</td>
                    <td style="width:15px;">:</td>
                    <td>${nama}</td>
                </tr>
                <tr style="height: 32px;">
                    <td style="color:#00adb5; font-weight:bold;">Pangkat</td>
                    <td>:</td>
                    <td>${pangkat}</td>
                </tr>
                <tr style="height: 32px;">
                    <td style="color:#00adb5; font-weight:bold;">Divisi</td>
                    <td>:</td>
                    <td>${data.divisi}</td>
                </tr>
                <tr style="height: 32px;">
                    <td style="color:#00adb5; font-weight:bold;">Waktu</td>
                    <td>:</td>
                    <td>${daysName[dayIdx]}, ${data.waktu}</td>
                </tr>
                <tr style="height: 32px;">
                    <td style="color:#00adb5; font-weight:bold;">Status</td>
                    <td>:</td>
                    <td><span style="padding:2px 8px; border-radius:4px; background:#30475e; color:#00adb5; border:1px solid #00adb5; font-size:11px; font-weight:bold;">${data.status}</span></td>
                </tr>
                <tr>
                    <td style="color:#00adb5; font-weight:bold; vertical-align:top; padding-top:10px;">Alasan</td>
                    <td style="vertical-align:top; padding-top:10px;">:</td>
                    <td style="vertical-align:top; padding-top:10px; line-height:1.4;">${data.ket}</td>
                </tr>
            </table>
            
            ${imageUrl ? `
                <div style="margin-top:15px;">
                    <p style="color:#00adb5; font-weight:bold; margin-bottom:8px;">Bukti Gambar:</p>
                    <img src="${imageUrl}" style="width:100%; border-radius:8px; border:1px solid #30475e; cursor:pointer;" 
                         onclick="window.open('${imageUrl}', '_blank')"
                         onerror="this.src='https://placehold.co/600x400?text=Gambar+Bermasalah'">
                </div>
            ` : `<div style="margin-top:15px; padding:15px; text-align:center; background:#222831; border-radius:8px; color:#666; font-style:italic; border:1px dashed #444;">Tidak ada bukti gambar.</div>`}
        </div>
    `;
    modal.style.display = "flex";
}

// 5. SISTEM WARNING & DISCORD
async function sendWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    if (!confirm(`Kirim SP-${currentWarn + 1} ke Discord?`)) return;
    
    const { mon } = getWeekRange(currentWeekOffset);
    const u = userWeekly[discord_id];
    const hari = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const daftarBolos = [];
    
    for(let i=1; i<=6; i++) { 
        if(!u.days[i]) { 
            const t = new Date(mon); t.setDate(mon.getDate()+(i-1)); 
            daftarBolos.push(`- ${hari[i]}, ${t.toLocaleDateString('id-ID')}`); 
        } 
    }

    const newWarnCount = currentWarn + 1;
    const logPayload = {
        "content": "@everyone <@&1444908462067945623>",
        "embeds": [{
            "title": `📋 SURAT PERINGATAN (SP - ${newWarnCount})`,
            "color": 15285324,
            "description": `**Nama:** ${nama_anggota} (<@${discord_id}>)\n**Pangkat:** ${pangkat_anggota}\n\n**Detail Bolos:**\n${daftarBolos.join('\n')}\n\n**Oleh:** ${adminName} (${adminRank})`,
            "timestamp": new Date()
        }]
    };

    await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
    await fetch('/.netlify/functions/send-warning', { 
        method: 'POST', 
        body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) 
    });
    alert("SP Terkirim!"); 
    loadData();
}

async function removeWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    if (!confirm(`Cabut SP untuk ${nama_anggota}?`)) return;
    const newWarnCount = Math.max(0, currentWarn - 1);

    const logPayload = {
        "content": "<@&1444908462067945623>",
        "embeds": [{
            "title": `🔓 PENCABUTAN SURAT PERINGATAN`,
            "color": 3066993,
            "description": `**Nama:** ${nama_anggota} (<@${discord_id}>)\n**Sisa SP:** ${newWarnCount}\n\n**Oleh:** ${adminName} (${adminRank})`,
            "timestamp": new Date()
        }]
    };

    await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
    await fetch('/.netlify/functions/send-warning', { 
        method: 'POST', 
        body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) 
    });
    alert("SP Dicabut!"); 
    loadData();
}

async function updateDiscordList() {
    const { data: masters } = await _supabase.from('users_master').select('*');
    masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));
    let txt = "## 📊 DAFTAR TOTAL WARNING ANGGOTA SAPD\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    masters.forEach(m => {
        const emoji = m.total_warning >= 3 ? "🔴" : (m.total_warning > 0 ? "🟡" : "🟢");
        txt += `${emoji} ${m.nama_anggota} (<@${m.discord_id}>) : \`${m.total_warning || 0} SP\`\n`;
    });
    return txt.substring(0, 1990);
}

// 6. UTILITIES
function getWeekRange(offset = 0) {
    const now = new Date(); now.setDate(now.getDate() + (offset * 7));
    const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff)); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    return { mon, sun };
}

async function resetUser(id) {
    if (!confirm("Hapus data absensi minggu ini?")) return;
    const { mon, sun } = getWeekRange(currentWeekOffset);
    await _supabase.from('absensi_sapd').delete().eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
    loadData();
}

function closeDetailPopup() { document.getElementById('modal-detail').style.display = "none"; }
function changeWeek(dir) { currentWeekOffset += dir; loadData(); }

// Jalankan Awal
loadData();