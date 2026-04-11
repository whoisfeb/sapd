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

    async function loadData() {
        const { mon, sun } = getWeekRange(currentWeekOffset);
        document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

        const { data: logs } = await _supabase.from('absensi_sapd').select('*').gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        const { data: masters } = await _supabase.from('users_master').select('*');

        // Menggunakan RANK_ORDER dari config.js
        masters.sort((a, b) => (RANK_ORDER[a.pangkat.toUpperCase()] || 99) - (RANK_ORDER[b.pangkat.toUpperCase()] || 99));

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
                
                // Inisialisasi jika hari ini belum ada data
                if (!userWeekly[discordId].days[d]) {
                    userWeekly[discordId].days[d] = { ket: ket, bukti_list: [] };
                }
                
                // Masukkan gambar ke dalam list (array) untuk popup
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
            const hasilGaji = hitungGajiMember(m.pangkat, u.totalHadir);
            const totalGaji = hasilGaji.gajiAkhir;

            totalGajiSemua += totalGaji;
            const cWarn = m.total_warning || 0;

            // Fungsi internal untuk merender ikon per kolom hari
            const getIcon = (idx) => {
                const data = u.days[idx];
                if (!data) return `<span class="cross-icon">✘</span>`;
                
                if (data.ket.includes("IZIN")) return `<span class="status-ic">I</span>`;
                if (data.ket.includes("CUTI")) return `<span class="status-ic">C</span>`;
                
                // Jika ada bukti gambar, buat ikon centang bisa diklik untuk popup
                if (data.bukti_list && data.bukti_list.length > 0) {
                    const listGambar = JSON.stringify(data.bukti_list);
                    return `<span class="check-icon" style="cursor:pointer; text-decoration:underline;" onclick='showImagePopup(${listGambar})'>✔</span>`;
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

    // FUNGSI UNTUK MENAMPILKAN POPUP GAMBAR
    // PASTIKAN FUNGSI INI DI LUAR loadData()
function showImagePopup(images) {
    if (!images || images.length === 0) {
        alert("Tidak ada bukti gambar untuk hari ini.");
        return;
    }

    let modal = document.getElementById("imageModal");
    
    // Jika modal belum ada di DOM, buat baru
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "imageModal";
        document.body.appendChild(modal);
    }

    // Isi konten modal
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:10000; display:flex; justify-content:center; align-items:center;">
            <div style="background:#16213e; padding:25px; border-radius:12px; max-width:85%; max-height:85%; overflow-y:auto; position:relative; border:2px solid #e94560; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                <button onclick="document.getElementById('imageModal').remove()" 
                        style="position:absolute; top:15px; right:15px; background:#e94560; color:white; border:none; cursor:pointer; padding:8px 15px; border-radius:5px; font-weight:bold; z-index:11">
                    TUTUP (ESC)
                </button>
                <h3 style="color:white; margin-top:0; margin-bottom:20px; border-bottom:2px solid #30475e; padding-bottom:10px; font-family: 'Segoe UI', sans-serif;">
                    📸 Bukti Dokumentasi
                </h3>
                <div id="modalContent" style="display:flex; flex-wrap:wrap; gap:20px; justify-content:center;">
                    ${images.map(img => `
                        <div style="text-align:center; background:#1a1a2e; padding:10px; border-radius:8px;">
                            <img src="https://urclmvdkfkfwvdascobs.supabase.co/storage/v1/object/public/bukti-absen/absensi/${img}" 
                                 style="max-width:400px; width:100%; border-radius:5px; display:block; margin-bottom:10px;">
                            <a href="https://urclmvdkfkfwvdascobs.supabase.co/storage/v1/object/public/bukti-absen/absensi/${img}" 
                               target="_blank" 
                               style="color:#00d2ff; font-size:12px; text-decoration:none; font-weight:bold;">
                               🔗 Buka Ukuran Penuh
                            </a>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

    // Tambahkan fitur tutup dengan tombol ESC
    const handleEsc = (e) => {
        if (e.key === "Escape") {
            modal.remove();
            document.removeEventListener("keydown", handleEsc);
        }
    };
    document.addEventListener("keydown", handleEsc);
}

    async function sendWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
        if (!confirm(`Kirim SP-${currentWarn + 1} ke Discord?\n(Oleh: ${adminName} - ${adminRank})`)) return;
        
        const { mon } = getWeekRange(currentWeekOffset);
        const u = userWeekly[discord_id];
        const daftarBolos = [];
        const hari = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        for(let i=1; i<=6; i++) { 
            if(!u.days[i]) { 
                const t=new Date(mon); t.setDate(mon.getDate()+(i-1)); 
                daftarBolos.push(`- ${hari[i]}, ${t.toLocaleDateString('id-ID')}`); 
            } 
        }

        const newWarnCount = currentWarn + 1;
        const logPayload = {
            "content": "@everyone <@&1444908462067945623>",
            "embeds": [{
                "title": `📋 SURAT PERINGATAN (SP - ${newWarnCount})`,
                "color": 15285324,
                "description": `**Tanggal:** ${new Date().toLocaleDateString('id-ID')}\n**Nama Anggota:** ${nama_anggota} (<@${discord_id}>)\n**Pangkat:** ${pangkat_anggota}\n\n**Alasan Peringatan:**\nTidak memenuhi syarat kehadiran mingguan.\nDetail Bolos:\n${daftarBolos.join('\n')}\n**Total SP:** ${newWarnCount}\n\n**Pemberi Peringatan:** ${adminName}\n**Pangkat:** ${adminRank}`,
                "timestamp": new Date()
            }]
        };

        await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
        const res = await fetch('/.netlify/functions/send-warning', { 
            method: 'POST', 
            body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) 
        });
        if (res.ok) { alert("SP Terkirim!"); loadData(); }
    }

    async function removeWarning(discord_id, nama_anggota, pangkat_anggota, currentWarn, adminName, adminRank) {
        if (!confirm(`Cabut SP untuk ${nama_anggota}?\n(Oleh: ${adminName} - ${adminRank})`)) return;
        const newWarnCount = Math.max(0, currentWarn - 1);

        const logPayload = {
            "content": "<@&1444908462067945623>",
            "embeds": [{
                "title": `🔓 PENCABUTAN SURAT PERINGATAN`,
                "color": 3066993,
                "description": `**Tanggal:** ${new Date().toLocaleDateString('id-ID')}\n**Nama Anggota:** ${nama_anggota} (<@${discord_id}>)\n**Pangkat Anggota:** ${pangkat_anggota}\n\n**Status:** 1 SP telah dicabut.\n**Sisa SP:** ${newWarnCount}\n\n**Dicabut Oleh:** ${adminName}\n**Pangkat Admin:** ${adminRank}`,
                "timestamp": new Date()
            }]
        };

        await _supabase.from('users_master').update({ total_warning: newWarnCount }).eq('discord_id', discord_id);
        const res = await fetch('/.netlify/functions/send-warning', { 
            method: 'POST', 
            body: JSON.stringify({ payload: logPayload, updateList: await updateDiscordList() }) 
        });
        if (res.ok) { alert("SP Berhasil dicabut!"); loadData(); }
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
        ws['!cols'] = [{wch:25}, {wch:20}, {wch:8}, {wch:8}, {wch:8}, {wch:8}, {wch:8}, {wch:8}, {wch:8}, {wch:12}];
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
            theme: 'grid',
            styles: { fontSize: 8, lineWidth: 0.1, lineColor: [48, 71, 94] },
            didParseCell: function(data) {
                if (data.cell.section === 'body') {
                    const txt = data.cell.raw.innerText;
                    if (txt === '✔') { data.cell.styles.fillColor = [39, 174, 96]; data.cell.styles.textColor = 255; }
                    else if (txt === 'I' || txt === 'C') { data.cell.styles.fillColor = [243, 156, 18]; data.cell.styles.textColor = 255; }
                    else if (txt === '✘') { data.cell.styles.fillColor = [233, 69, 96]; data.cell.styles.textColor = 255; }
                }
            }
        });
        doc.save(`Rekap_SAPD.pdf`);
    }

    function getWeekRange(offset = 0) {
        const now = new Date(); now.setDate(now.getDate() + (offset * 7));
        const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(now.setDate(diff)); mon.setHours(0,0,0,0);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
        return { mon, sun };
    }
    
    async function resetUser(id) {
        if (!confirm("Hapus data absensi & bukti gambar anggota ini di minggu ini?")) return;
        const { mon, sun } = getWeekRange(currentWeekOffset);
        const { data: logs } = await _supabase.from('absensi_sapd').select('bukti_gambar').eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        
        if (logs && logs.length > 0) {
            const filesToRemove = logs.map(log => log.bukti_gambar ? `absensi/${log.bukti_gambar}` : null).filter(path => path !== null);
            if (filesToRemove.length > 0) {
                await _supabase.storage.from('bukti-absen').remove(filesToRemove);
            }
        }
        await _supabase.from('absensi_sapd').delete().eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        alert("Data dan Gambar di folder absensi berhasil dihapus!");
        loadData();
    }

    async function resetAllWeeklyData() {
        if (!confirm("Hapus SEMUA data absensi & bukti gambar minggu ini?")) return;
        const { mon, sun } = getWeekRange(currentWeekOffset);
        const { data: allLogs } = await _supabase.from('absensi_sapd').select('bukti_gambar').gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        
        if (allLogs && allLogs.length > 0) {
            const filesToRemove = allLogs.map(log => log.bukti_gambar ? `absensi/${log.bukti_gambar}` : null).filter(path => path !== null);
            if (filesToRemove.length > 0) {
                await _supabase.storage.from('bukti-absen').remove(filesToRemove);
            }
        }
        await _supabase.from('absensi_sapd').delete().gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        alert("Seluruh data dan gambar minggu ini telah dibersihkan!");
        loadData();
    }

    function changeWeek(dir) { currentWeekOffset += dir; loadData(); }
    loadData();
