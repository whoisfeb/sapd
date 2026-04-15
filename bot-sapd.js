require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ChannelType, 
    Partials 
} = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// --- KONFIGURASI SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- INISIALISASI CLIENT DISCORD ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// --- DAFTAR ID (KONFIGURASI) ---
const ANNOUNCEMENT_CHANNEL_ID = "1492812998379700246"; 
const FORUM_CHANNEL_ID = "1493936917803302912"; 
const STORAGE_BUCKET_NAME = "bukti-absen"; 
const REQUIRED_ROLE_ID = "1444908462067945623"; 
const ADMIN_ROLE_ID = "1444910578266148897"; 
const DISCORD_GUILD_ID = "1444893321448390689";

// --- MAPPING PANGKAT ---
const PANGKAT_MAP = {
    "1444909938001580257": "CHIEF OF POLICE",
    "1444909771181522974": "ASSISTANT CHIEF OF POLICE",
    "1444909625475596349": "DEPUTY CHIEF OF POLICE",
    "1444908730230771723": "COMMANDER",
    "1444918644600606770": "CAPTAIN III",
    "1444918698484826173": "CAPTAIN II",
    "1444918744815112302": "CAPTAIN I",
    "1444918819717124186": "LIEUTENANT III",
    "144491867691569244": "LIEUTENANT II",
    "1444918922766843904": "LIEUTENANT I",
    "1444919014139756685": "SERGEANT III",
    "1444919052815564910": "SERGEANT II",
    "1444919550981308426": "SERGEANT I",
    "1444919660054188032": "DETECTIVE III",
    "1444919733114896465": "DETECTIVE II",
    "1444919777553420339": "DETECTIVE I",
    "1444919938891649145": "POLICE OFFICER III",
    "1444920044239982673": "POLICE OFFICER II",
    "1444920144793964595": "POLICE OFFICER I",
    "1444920482578173953": "CADET"
};

// --- MAPPING DIVISI ---
const DIVISI_MAP = {
    "1444921188215165141": "HIGHWAY PATROL",
    "1444920955620032533": "RAMPART DIVISION",
    "1444920880370159617": "METROPOLITAN",
    "1444908272363769887": "HUMAN RESOURCE BUREAU",
    "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
};

// --- FUNGSI UNTUK PROSES FORUM LOGS ---
async function processForumLogs(guild) {
    console.log("[DEBUG] Memulai proses pengecekan forum logs...");
    
    try {
        const forumChannel = await guild.channels.fetch(FORUM_CHANNEL_ID);
        if (!forumChannel) {
            console.error("[ERROR] Channel Forum tidak ditemukan.");
            return;
        }

        const { data: logs, error: fetchError } = await supabase
            .from('absensi_sapd')
            .select('*')
            .eq('is_archived', false);

        if (fetchError) {
            console.error("[DATABASE ERROR]", fetchError.message);
            return;
        }

        if (!logs || logs.length === 0) {
            console.log("[INFO] Tidak ada data absensi baru untuk dikirim.");
            return;
        }

        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            
            try {
                const statusKirim = log.tipe_absen || "HADIR";
                const alasanKirim = log.alasan || "Tidak ada keterangan";
                const namaUser = log.nama_anggota || "Unknown";

                const threads = await forumChannel.threads.fetchActive();
                let targetThread = threads.threads.find(t => t.name.toLowerCase() === namaUser.toLowerCase());

                if (!targetThread) {
                    console.log(`[INFO] Membuat thread baru untuk ${namaUser}`);
                    targetThread = await forumChannel.threads.create({
                        name: namaUser,
                        message: { content: `Logs Kehadiran Resmi - **${namaUser}**` },
                    });
                    // Jeda agar Discord tidak pusing
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

                let warnaEmbed = 0x2ecc71; // Default Hijau
                if (statusKirim === "IZIN") {
                    warnaEmbed = 0xf1c40f; // Kuning
                } else if (statusKirim === "CUTI") {
                    warnaEmbed = 0xe67e22; // Oranye
                }

                const reportEmbed = new EmbedBuilder()
                    .setTitle(`LOG KEHADIRAN - ${statusKirim}`)
                    .setColor(warnaEmbed)
                    .addFields(
                        { name: 'Nama Anggota', value: namaUser, inline: true },
                        { name: 'Pangkat', value: log.pangkat || "-", inline: true },
                        { name: 'Divisi', value: log.divisi || "-", inline: true },
                        { name: 'Jam Duty', value: log.jam_duty || "-", inline: true },
                        { name: 'Kegiatan', value: log.kegiatan || "-", inline: false },
                        { name: 'Keterangan/Alasan', value: alasanKirim, inline: false }
                    )
                    .setTimestamp(new Date(log.created_at))
                    .setFooter({ text: "SAPD Attendance System" });

                if (log.bukti_foto && log.bukti_foto.startsWith("http")) {
                    reportEmbed.setImage(log.bukti_foto);
                } else {
                    reportEmbed.addFields({ name: 'Bukti Gambar', value: "⚠️ Tidak melampirkan gambar.", inline: false });
                }

                await targetThread.send({ embeds: [reportEmbed] });
                console.log(`[SUCCESS] Log terkirim ke thread: ${namaUser}`);

                // Tunggu sebentar sebelum hapus file/update
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (log.bukti_foto && log.bukti_foto.startsWith("http")) {
                    const ambilNamaFile = log.bukti_foto.split('/').pop();
                    const pathLengkap = `absensi/${ambilNamaFile}`;
                    
                    const { error: delError } = await supabase.storage
                        .from(STORAGE_BUCKET_NAME)
                        .remove([pathLengkap]);
                    
                    if (delError) {
                        console.error(`[STORAGE ERROR] Gagal hapus file: ${pathLengkap}`);
                    }
                }

                const { error: upError } = await supabase
                    .from('absensi_sapd')
                    .update({ is_archived: true })
                    .eq('id', log.id);

                if (upError) {
                    console.error(`[DB ERROR] Gagal update archive ID: ${log.id}`);
                }

            } catch (errLoop) {
                console.error(`[LOOP ERROR] Gagal memproses data ID ${log.id}:`, errLoop.message);
            }
        }
    } catch (errGlobal) {
        console.error("[CRITICAL ERROR] processForumLogs:", errGlobal.message);
    }
}

// --- FUNGSI PENGECEKAN ANGGOTA (REMINDER) ---
async function checkMissingAbsence(channel) {
    try {
        const { data: listUser, error: errU } = await supabase.from('users_master').select('discord_id');
        if (errU) return;

        const hariIni = new Date();
        hariIni.setHours(0, 0, 0, 0);

        const { data: listAbsen, error: errA } = await supabase
            .from('absensi_sapd')
            .select('discord_id')
            .gte('created_at', hariIni.toISOString());

        if (errA) return;

        const sudahAbsen = listAbsen.map(u => u.discord_id);
        const belumAbsen = listUser.filter(u => !sudahAbsen.includes(u.discord_id));

        if (belumAbsen.length > 0) {
            let mentionBelum = "";
            belumAbsen.forEach(user => {
                mentionBelum += `<@${user.discord_id}> `;
            });

            await channel.send(`⚠️ **REMINDER ABSENSI**\nAnggota berikut belum absen hari ini:\n${mentionBelum}\n\nSilakan absen di: https://san-andreas-police-departement.netlify.app/\n@everyone`);
        }
    } catch (e) {
        console.error("Reminder Error:", e.message);
    }
}

// --- TUGAS RUTIN (SINKRONISASI & FORUM) ---
async function runSapdTask() {
    console.log(`--- [START TASK ${new Date().toLocaleString()}] ---`);
    
    const serverGuild = client.guilds.cache.get(DISCORD_GUILD_ID);
    if (!serverGuild) return;

    try {
        const daftarMember = await serverGuild.members.fetch();
        const arrayDataMaster = [];
        const idsAktif = [];

        daftarMember.forEach(member => {
            if (member.roles.cache.has(REQUIRED_ROLE_ID)) {
                let pnk = "-";
                let div = "-";

                member.roles.cache.forEach(role => {
                    if (PANGKAT_MAP[role.id]) pnk = PANGKAT_MAP[role.id];
                    if (DIVISI_MAP[role.id]) div = DIVISI_MAP[role.id];
                });

                const namaDisplay = member.nickname || member.user.username;
                idsAktif.push(member.id);

                arrayDataMaster.push({
                    discord_id: member.id,
                    nama_anggota: namaDisplay,
                    pangkat: pnk,
                    divisi: div,
                    is_admin: member.roles.cache.has(ADMIN_ROLE_ID),
                    last_login: new Date().toISOString()
                });
            }
        });

        // Bersihkan data lama
        if (idsAktif.length > 0) {
            const stringIds = `(${idsAktif.join(',')})`;
            await supabase.from('users_master').delete().not('discord_id', 'in', stringIds);
        }

        // Simpan data terbaru
        await supabase.from('users_master').upsert(arrayDataMaster, { onConflict: 'discord_id' });

        // Proses Forum
        await processForumLogs(serverGuild);

        // Reminder Waktu (19:00 & 22:00)
        const waktuJkt = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const jamSekarang = waktuJkt.getHours();
        const menitSekarang = waktuJkt.getMinutes();

        if (menitSekarang <= 10) {
            if (jamSekarang === 19 || jamSekarang === 22) {
                const channelAnnounce = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
                if (channelAnnounce) await checkMissingAbsence(channelAnnounce);
            }
        }

        console.log("--- [TASK COMPLETED] ---");
    } catch (err) {
        console.error("Main Task Error:", err.message);
    }
}

// --- EVENT BOT READY ---
client.once('ready', () => {
    console.log("========================================");
    console.log(`Bot Terhubung Sebagai: ${client.user.tag}`);
    console.log("Status: Online & Monitoring Supabase");
    console.log("========================================");
    
    runSapdTask();
    setInterval(runSapdTask, 600000); // Jalankan setiap 10 menit
});

// --- LOGIN ---
client.login(process.env.DISCORD_BOT_TOKEN);