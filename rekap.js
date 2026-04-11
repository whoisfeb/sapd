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

        // MENGAMBIL DATA DARI TABEL absensi_sapd
        const { data: logs, error: errLogs } = await _supabase
            .from('absensi_sapd')
            .select('*')
            .gte('created_at', mon.toISOString())
            .lte('created_at', sun.toISOString());

        const { data: masters, error: errMasters } = await _supabase
            .from('users_master')
            .select('*');

        if (errLogs || errMasters) {
            console.error("Database Error:", errLogs || errMasters);
            return;
        }

        // Sorting berdasarkan pangkat
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
                
                // MENGGUNAKAN kolom bukti_foto
                userWeekly[discordId].days[d] = { 
                    ket: ket,
                    bukti: log.bukti_foto 
                };

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
            
            const getIcon = (idx) => {
                const data = u.days[idx];
                if (!data) return `<span class="cross-icon">✘</span>`;
                
                let iconClass = "check-icon";
                let label = "✔";
                
                if (data.ket.includes("IZIN")) { iconClass = "status-ic"; label = "I"; }
                if (data.ket.includes("CUTI")) { iconClass = "status-ic"; label = "C"; }

                return `<span class="${iconClass}" style="cursor:pointer;" onclick="openDetailPopup('${m.nama_anggota}', ${idx}, '${data.ket}', '${data.bukti}')">${label}</span>`;
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

    // FUNGSI POPUP DENGAN FIX URL (Langsung pakai link dari database)
    function openDetailPopup(nama, dayIdx, ket, buktiPath) {
        const daysName = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const modal = document.getElementById('modal-detail');
        const content = document.getElementById('detail-content');
        
        // Langsung gunakan buktiPath karena di tabel sudah berisi link lengkap
        const imageUrl = buktiPath || null;

        content.innerHTML = `
            <div style="text-align:left;">
                <p><b>Anggota:</b> ${nama}</p>
                <p><b>Hari:</b> ${daysName[dayIdx]}</p>
                <p><b>Keterangan:</b><br><span style="color:#00adb5;">${ket || 'Tanpa keterangan'}</span></p>
                <p><b>Bukti Gambar:</b></p>
                ${imageUrl ? 
                    `<img src="${imageUrl}" style="width:100%; border-radius:8px; border:1px solid #30475e; cursor:pointer;" 
                      onerror="this.src='https://placehold.co/600x400?text=Gambar+Bermasalah'"
                      onclick="window.open('${imageUrl}', '_blank')">` : 
                    `<p style="color:#888; font-style:italic;">Tidak ada bukti gambar tersedia.</p>`
                }
            </div>
        `;
        modal.style.display = "flex";
    }

    function closeDetailPopup() {
        document.getElementById('modal-detail').style.display = "none";
    }

    window.onclick = function(event) {
        const modal = document.getElementById('modal-detail');
        if (event.target == modal) closeDetailPopup();
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
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap");
        XLSX.writeFile(wb, `Rekap_SAPD.xlsx`);
    }

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
        
        await _supabase.from('absensi_sapd').delete()
            .eq('discord_id', id)
            .gte('created_at', mon.toISOString())
            .lte('created_at', sun.toISOString());
            
        alert("Data berhasil dihapus!");
        loadData();
    }

    function changeWeek(dir) { currentWeekOffset += dir; loadData(); }
    loadData();