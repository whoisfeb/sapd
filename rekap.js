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

    // Inisialisasi Supabase
    const _supabase = window.supabase.createClient(
        "https://urclmvdkfkfwvdascobs.supabase.co", 
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY2xtdmRrZmtmd3ZkYXNjb2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDkzMjQsImV4cCI6MjA5MTM4NTMyNH0.FE8ynCm5Pfg861wpG1rslSCLSNUnXSwyEIVbHiqajT4"
    );

    let currentWeekOffset = 0;
    let userWeekly = {}; 

    async function loadData() {
        const { mon, sun } = getWeekRange(currentWeekOffset);
        document.getElementById('label-minggu').innerText = `${mon.toLocaleDateString('id-ID')} - ${sun.toLocaleDateString('id-ID')}`;

        // 1. Ambil Log Absensi
        const { data: logs, error: errLogs } = await _supabase
            .from('absensi_sapd')
            .select('*')
            .gte('created_at', mon.toISOString())
            .lte('created_at', sun.toISOString());

        // 2. Ambil Master User
        const { data: masters, error: errMasters } = await _supabase
            .from('users_master')
            .select('*');

        if (errLogs || errMasters) {
            console.error("Database Error:", errLogs || errMasters);
            return;
        }

        // Sorting berdasarkan pangkat (RANK_ORDER harus sudah didefinisikan secara global/di file lain)
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

        // 3. Mapping Data Logs ke User Weekly
        logs.forEach(log => {
            const d = new Date(log.created_at).getDay();
            const dateKey = new Date(log.created_at).toISOString().split('T')[0];
            const discordId = log.discord_id;

            if (userWeekly[discordId] && d !== 0) {
                const ketAsli = (log.jam_duty || "").toUpperCase();
                
                // Simpan Object Lengkap untuk Detail Popup
                userWeekly[discordId].days[d] = { 
                    ket: log.jam_duty || "Tanpa Keterangan",
                    bukti: log.bukti_foto,
                    waktu: new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
                    divisi: userWeekly[discordId].info.divisi || "-",
                    status: ketAsli.includes("IZIN") ? "IZIN" : (ketAsli.includes("CUTI") ? "CUTI" : "HADIR")
                };

                // Hitung Kehadiran (Hanya jika bukan Izin/Cuti)
                if (!ketAsli.includes("IZIN") && !ketAsli.includes("CUTI")) {
                    if (!userWeekly[discordId].uniqueDates.has(dateKey)) {
                        userWeekly[discordId].totalHadir++; 
                        userWeekly[discordId].uniqueDates.add(dateKey); 
                    }
                }
            }
        });

        let totalGajiSemua = 0;

        // 4. Render Table
        document.getElementById('tbody-weekly').innerHTML = masters.map(m => {
            const u = userWeekly[m.discord_id];
            const hasilGaji = hitungGajiMember(m.pangkat, u.totalHadir); // Pastikan fungsi ini ada
            const totalGaji = hasilGaji.gajiAkhir;
            totalGajiSemua += totalGaji;

            const cWarn = m.total_warning || 0;
            
            const getIcon = (idx) => {
                const data = u.days[idx];
                if (!data) return `<span class="cross-icon">✘</span>`;
                
                let iconClass = "check-icon";
                let label = "✔";
                
                if (data.status === "IZIN") { iconClass = "status-ic"; label = "I"; }
                if (data.status === "CUTI") { iconClass = "status-ic"; label = "C"; }

                // Konversi data ke string untuk parameter fungsi
                const dataStr = JSON.stringify(data).replace(/"/g, '&quot;');
                return `<span class="${iconClass}" style="cursor:pointer;" onclick="openDetailPopup('${m.nama_anggota}', '${m.pangkat}', ${idx}, ${dataStr})">${label}</span>`;
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

    // --- FUNGSI POPUP DETAIL ---
    function openDetailPopup(nama, pangkat, dayIdx, data) {
        const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const modal = document.getElementById('modal-detail');
        const content = document.getElementById('detail-content');
        
        const imageUrl = data.bukti || null;

        content.innerHTML = `
            <div style="text-align:left; font-family: 'Segoe UI', sans-serif;">
                <h3 style="border-bottom: 2px solid #00adb5; padding-bottom: 10px; color: #eee; margin-top:0;">Detail Absensi</h3>
                <table style="width:100%; color:#ccc; border-spacing: 0 8px;">
                    <tr><td style="width:110px; color:#00adb5;"><b>Nama</b></td><td>: ${nama}</td></tr>
                    <tr><td style="color:#00adb5;"><b>Pangkat</b></td><td>: ${pangkat}</td></tr>
                    <tr><td style="color:#00adb5;"><b>Divisi</b></td><td>: ${data.divisi}</td></tr>
                    <tr><td style="color:#00adb5;"><b>Hari/Waktu</b></td><td>: ${daysName[dayIdx]}, ${data.waktu}</td></tr>
                    <tr><td style="color:#00adb5;"><b>Status</b></td><td>: <span style="padding:2px 8px; border-radius:4px; background:#30475e; color:#fff; font-size:12px;">${data.status}</span></td></tr>
                    <tr><td style="color:#00adb5; vertical-align:top;"><b>Keterangan</b></td><td>: ${data.ket}</td></tr>
                </table>
                
                <p style="margin-top:15px; color:#00adb5; margin-bottom:5px;"><b>Bukti Gambar:</b></p>
                ${imageUrl ? 
                    `<img src="${imageUrl}" style="width:100%; border-radius:8px; border:1px solid #30475e; cursor:pointer;" 
                      onerror="this.src='https://placehold.co/600x400?text=Gambar+Bermasalah'"
                      onclick="window.open('${imageUrl}', '_blank')">
                     <p style="font-size:10px; color:#888; text-align:center; margin-top:5px;">*Klik gambar untuk memperbesar</p>` : 
                    `<div style="padding:20px; text-align:center; background:#222831; border-radius:8px; color:#888; font-style:italic; border:1px dashed #444;">Tidak ada bukti gambar.</div>`
                }
            </div>
        `;
        modal.style.display = "flex";
    }

    function closeDetailPopup() {
        document.getElementById('modal-detail').style.display = "none";
    }

    // Klik Luar Modal untuk Tutup
    window.onclick = function(event) {
        const modal = document.getElementById('modal-detail');
        if (event.target == modal) closeDetailPopup();
    }

    // --- FUNGSI WARNING & SISTEM ---
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

    function getWeekRange(offset = 0) {
        const now = new Date(); now.setDate(now.getDate() + (offset * 7));
        const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(now.setDate(diff)); mon.setHours(0,0,0,0);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
        return { mon, sun };
    }
    
    async function resetUser(id) {
        if (!confirm("Hapus data absensi anggota ini di minggu ini?")) return;
        const { mon, sun } = getWeekRange(currentWeekOffset);
        await _supabase.from('absensi_sapd').delete().eq('discord_id', id).gte('created_at', mon.toISOString()).lte('created_at', sun.toISOString());
        alert("Data berhasil dihapus!");
        loadData();
    }

    function changeWeek(dir) { currentWeekOffset += dir; loadData(); }
    
    // Jalankan Load Awal
    loadData();