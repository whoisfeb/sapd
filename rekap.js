// ==========================================
// 1. AUTH & INITIALIZATION
// ==========================================
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

const _supabase = window.supabase.createClient("https://urclmvdkfkfwvdascobs.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4");

let currentWeekOffset = 0;
let userWeekly = {}; 

// ==========================================
// 2. FUNGSI POPUP GAMBAR (FIXED)
// ==========================================
window.showImagePopup = function(imagesRaw) {
    let images = [];
    try {
        // Decode kembali string yang di-escape dari HTML
        const decoded = imagesRaw.replace(/&quot;/g, '"');
        images = JSON.parse(decoded);
    } catch (e) {
        console.error("Gagal memproses data gambar:", e);
        alert("Gagal memuat gambar bukti.");
        return;
    }

    if (!images || images.length === 0) return;

    const existing = document.getElementById("imageModal");
    if (existing) existing.remove();

    const modal = document.createElement("div");
    modal.id = "imageModal";
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:10000; display:flex; justify-content:center; align-items:center;">
            <div style="background:#16213e; padding:25px; border-radius:12px; max-width:90%; max-height:85%; overflow-y:auto; position:relative; border:2px solid #e94560; box-shadow: 0 0 20px rgba(233, 69, 96, 0.5);">
                <button onclick="document.getElementById('imageModal').remove()" 
                        style="position:absolute; top:15px; right:15px; background:#e94560; color:white; border:none; cursor:pointer; padding:8px 15px; border-radius:5px; font-weight:bold;">
                    TUTUP (ESC)
                </button>
                <h3 style="color:white; margin-top:0; border-bottom:2px solid #30475e; padding-bottom:10px;">📸 Bukti Dokumentasi</h3>
                <div style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center; margin-top:20px;">
                    ${images.map(img => `
                        <div style="text-align:center; background:#1a1a2e; padding:10px; border-radius:8px; border:1px solid #30475e;">
                            <img src="https://urclmvdkfkfwvdascobs.supabase.co/storage/v1/object/public/bukti-absen/absensi/${img}" 
                                 style="max-width:450px; width:100%; border-radius:5px; display:block; margin-bottom:10px; border:1px solid #444;">
                            <a href="https://urclmvdkfkfwvdascobs.supabase.co/storage/v1/object/public/bukti-absen/absensi/${img}" 
                               target="_blank" style="color:#00d2ff; font-size:12px; text-decoration:none; font-weight:bold;">🔗 Buka Resolusi Penuh</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);

    const handleEsc = (e) => {
        if (e.key === "Escape") { 
            const m = document.getElementById("imageModal");
            if(m) m.remove(); 
            document.removeEventListener("keydown", handleEsc); 
        }
    };
    document.addEventListener("keydown", handleEsc);
}

// ==========================================
// 3. LOAD & RENDER DATA
// ==========================================
async function loadData() {
    const { mon, sun } = getWeekRange(currentWeekOffset);
    document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

    const { data: logs } = await _supabase.from('absensi_sapd').select('*').gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
    const { data: masters } = await _supabase.from('users_master').select('*');

    masters.sort((a, b) => (window.RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (window.RANK_ORDER[b.pangkat.toUpperCase()] || 99));

    userWeekly = {}; 
    masters.forEach(m => {
        userWeekly[m.discord_id] = { 
            info: m, 
            days: { 1:null, 2:null, 3:null, 4:null, 5:null, 6:null }, 
            totalHadir: 0,
            uniqueDates: new Set() 
        };
    });

    logs.forEach(log => {
        const d = new Date(log.created_at).getDay();
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        const discordId = log.discord_id;

        if (userWeekly[discordId] && d !== 0) {
            const ket = (log.jam_duty || "").toUpperCase();
            if (!userWeekly[discordId].days[d]) {
                userWeekly[discordId].days[d] = { ket: ket, bukti_list: [] };
            }
            if (log.bukti_gambar) {
                userWeekly[discordId].days[d].bukti_list.push(log.bukti_gambar);
            }
            if (!ket.includes("IZIN") && !ket.includes("CUTI")) {
                if (!userWeekly[discordId].uniqueDates.has(dateKey)) {
                    userWeekly[discordId].totalHadir++; 
                    userWeekly[discordId].uniqueDates.add(dateKey); 
                }
            }
        }
    });

    let totalGajiSemua = 0;

    document.getElementById('tbody-weekly').innerHTML = masters.map(m => {
        const u = userWeekly[m.discord_id];
        const hasilGaji = window.hitungGajiMember(m.pangkat, u.totalHadir);
        const totalGaji = hasilGaji.gajiAkhir;
        totalGajiSemua += totalGaji;
        const cWarn = m.total_warning || 0;

        const getIcon = (idx) => {
            const data = u.days[idx];
            if (!data) return `<span class="cross-icon">✘</span>`;
            if (data.ket.includes("IZIN")) return `<span class="status-ic">I</span>`;
            if (data.ket.includes("CUTI")) return `<span class="status-ic">C</span>`;
            
            if (data.bukti_list && data.bukti_list.length > 0) {
                // Escape quotes untuk keamanan HTML attribute
                const safeJson = JSON.stringify(data.bukti_list).replace(/"/g, '&quot;');
                return `<span class="check-icon" style="cursor:pointer; text-decoration:underline; color:#27ae60; font-weight:bold;" onclick="showImagePopup('${safeJson}')">✔</span>`;
            }
            return `<span class="check-icon">✔</span>`;
        };

        const currentAdminName = localStorage.getItem("nama_user");
        const currentAdminRank = localStorage.getItem("pangkat");

        return `<tr>
            <td style="text-align:left;"><b>${m.nama_anggota}</b></td>
            <td>${m.pangkat}</td>
            ${[1,2,3,4,5,6].map(i => `<td>${getIcon(i)}</td>`).join('')}
            <td>${u.totalHadir}/6</td>
            <td class="salary-text">$${totalGaji.toLocaleString()}</td>
            <td>
                <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                    <button class="btn-warning" onclick="sendWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${cWarn}, '${currentAdminName}', '${currentAdminRank}')">⚠️ Warning (${cWarn})</button>
                    ${cWarn > 0 ? `<span class="unwarn-link" onclick="removeWarning('${m.discord_id}', '${m.nama_anggota}', '${m.pangkat}', ${cWarn}, '${currentAdminName}', '${currentAdminRank}')">[ Cabut SP ]</span>` : ''}
                </div>
            </td>
            <td><button onclick="resetUser('${m.discord_id}')" style="background:none;border:none;cursor:pointer;">🗑</button></td>
        </tr>`;
    }).join('');

    document.getElementById('total-gaji-global').innerText = `$${totalGajiSemua.toLocaleString()}`;
}

// ==========================================
// 4. LOGIC & UTILS
// ==========================================
function getWeekRange(offset = 0) {
    const now = new Date(); now.setDate(now.getDate() + (offset * 7));
    const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff)); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    return { mon, sun };
}

function changeWeek(dir) { currentWeekOffset += dir; loadData(); }

async function sendWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    if (!confirm(`Kirim SP-${currentWarn + 1} ke Discord?\n(Oleh: ${adminName})`)) return;
    const { mon } = getWeekRange(currentWeekOffset);
    const u = userWeekly[discord_id];
    const daftarBolos = [];
    const hari = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    for(let i=1; i<=6; i++) { if(!u.days[i]) { const t=new Date(mon); t.setDate(mon.getDate()+(i-1)); daftarBolos.push(`- ${hari[i]}, ${t.toLocaleDateString('id-ID')}`); } }
    
    const newWarnCount = currentWarn + 1;
    const logPayload = {
        "content": "@everyone <@&1444908462067945623>",
        "embeds": [{
            "title": `📋 SURAT PERINGATAN (SP - ${newWarnCount})`,
            "color": 15285324,
            "description": `**Nama Anggota:** ${nama_anggota} (<@${discord_id}>)\n**Pangkat:** ${pangkat_anggota}\n\n**Alasan:** Tidak memenuhi syarat kehadiran.\n**Detail Bolos:**\n${daftarBolos.join('\n')}\n\n**Pemberi:** ${adminName}`,
            "timestamp": new Date()
        }]
    };

    await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
    await fetch('/.netlify/functions/send-warning', { method: 'POST', body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) });
    alert("SP Berhasil Dikirim!");
    loadData();
}

async function removeWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
    if (!confirm(`Cabut 1 SP untuk ${nama_anggota}?`)) return;
    const newWarnCount = Math.max(0, currentWarn - 1);
    const logPayload = {
        "content": "<@&1444908462067945623>",
        "embeds": [{
            "title": `🔓 PENCABUTAN SURAT PERINGATAN`,
            "color": 3066993,
            "description": `**Nama Anggota:** ${nama_anggota}\n**Status:** 1 SP Dicabut\n**Sisa SP:** ${newWarnCount}\n**Oleh:** ${adminName}`,
            "timestamp": new Date()
        }]
    };
    await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
    await fetch('/.netlify/functions/send-warning', { method: 'POST', body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) });
    alert("SP Berhasil Dicabut!");
    loadData();
}

async function updateDiscordList() {
    const { data: masters } = await _supabase.from('users_master').select('*');
    masters.sort((a, b) => (window.RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (window.RANK_ORDER[b.pangkat.toUpperCase()] || 99));
    let txt = "## 📊 DAFTAR TOTAL WARNING ANGGOTA SAPD\n\n";
    masters.forEach(m => {
        const emoji = m.total_warning >= 3 ? "🔴" : (m.total_warning > 0 ? "🟡" : "🟢");
        txt += `${emoji} ${m.nama_anggota} : \`${m.total_warning || 0} SP\`\n`;
    });
    return txt.substring(0, 1990);
}

async function resetUser(id) {
    if (!confirm("Hapus absensi minggu ini untuk anggota ini?")) return;
    const { mon, sun } = getWeekRange(currentWeekOffset);
    await _supabase.from('absensi_sapd').delete().eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
    alert("Data dihapus!");
    loadData();
}

async function resetAllWeeklyData() {
    if (!confirm("Hapus SELURUH absensi minggu ini?")) return;
    const { mon, sun } = getWeekRange(currentWeekOffset);
    await _supabase.from('absensi_sapd').delete().gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
    alert("Seluruh data dibersihkan!");
    loadData();
}

// ==========================================
// 5. EXPORT HANDLERS
// ==========================================
window.downloadExcel = function() {
    const table = document.getElementById("table-rekap");
    const ws = XLSX.utils.table_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Payroll");
    XLSX.writeFile(wb, "Rekap_Payroll_SAPD.xlsx");
}

window.downloadPDF = function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text("REKAP ABSENSI & PAYROLL SAPD", 14, 15);
    doc.autoTable({ html: '#table-rekap', startY: 20, theme: 'grid', styles: { fontSize: 7 } });
    doc.save("Rekap_Payroll_SAPD.pdf");
}

// Initial Load
loadData();
