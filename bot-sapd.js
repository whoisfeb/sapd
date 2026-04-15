require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ChannelType } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// 1. INISIALISASI KONEKSI
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ] 
});

// 2. MAPPING DATA
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

const DIVISI_MAP = {
    "1444921188215165141": "HIGHWAY PATROL",
    "1444920955620032533": "RAMPART DIVISION",
    "1444920880370159617": "METROPOLITAN",
    "1444908272363769887": "HUMAN RESOURCE BUREAU",
    "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
};

// 3. KONFIGURASI ID
const ANNOUNCEMENT_CHANNEL_ID = "1492812998379700246"; 
const FORUM_CHANNEL_ID = "1493906313342615692"; 
const STORAGE_BUCKET_NAME = "bukti-absen";
const REQUIRED_ROLE_ID = "1444908462067945623"; 
const ADMIN_ROLE_ID = "1444910578266148897"; 

// --- FUNGSI LOGS KE FORUM & HAPUS STORAGE ---
async function processForumLogs(guild) {
    try {
        const forumChannel = await guild.channels.fetch(FORUM_CHANNEL_ID);
        if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) return;

        const { data: logs, error } = await supabase
            .from('absensi_sapd')
            .select('*')
            .not('bukti_foto', 'is', null);

        if (error || !logs || logs.length === 0) return;

        console.log(`[FORUM] Ditemukan ${logs.length} data untuk diproses...`);

        // Menggunakan for...of agar proses berjalan berurutan (mencegah Received one or more errors)
        for (const log of logs) {
            try {
                const statusAbsen = log.tipe_absen || "HADIR";
                const keteranganAbsen = log.alasan || "Tidak ada keterangan";
                
                const threads = await forumChannel.threads.fetchActive();
                let thread = threads.threads.find(t => t.name.toLowerCase() === log.nama_anggota.toLowerCase());

                if (!thread) {
                    thread = await forumChannel.threads.create({
                        name: log.nama_anggota,
                        message: { content: `Logs Kehadiran untuk **${log.nama_anggota}**` },
                    });
                }

                let embedColor = 0x2ecc71;
                if (statusAbsen === 'IZIN') embedColor = 0xf1c40f;
                if (statusAbsen === 'CUTI') embedColor = 0xe67e22;

                const embed = new EmbedBuilder()
                    .setTitle(`LOG KEHADIRAN - ${statusAbsen}`)
                    .setColor(embedColor)
                    .addFields(
                        { name: 'Pangkat', value: log.pangkat || "-", inline: true },
                        { name: 'Divisi', value: log.divisi || "-", inline: true },
                        { name: 'Jam Duty', value: log.jam_duty || "-", inline: true },
                        { name: 'Kegiatan', value: log.kegiatan || "-", inline: false },
                        { name: 'Alasan/Keterangan', value: keteranganAbsen, inline: false }
                    )
                    .setImage(log.bukti_foto) 
                    .setTimestamp(new Date(log.created_at));

                // Kirim dan tunggu sampai selesai
                await thread.send({ embeds: [embed] });
                
                // Proses penghapusan Storage
                const fileName = log.bukti_foto.split('/').pop();
                const fullPath = `absensi/${fileName}`;

                const { error: storageError } = await supabase.storage
                    .from(STORAGE_BUCKET_NAME)
                    .remove([fullPath]);

                if (!storageError) {
                    await supabase.from('absensi_sapd')
                        .update({ bukti_foto: null })
                        .eq('id', log.id);
                    console.log(`[FORUM] Sukses: ${log.nama_anggota} (${statusAbsen})`);
                } else {
                    console.error(`[STORAGE ERROR] ${log.nama_anggota}: ${storageError.message}`);
                }
            } catch (innerError) {
                console.error(`[PROCESS ERROR] Data ID ${log.id} gagal:`, innerError.message);
            }
        }
    } catch (err) {
        console.error("Gagal memproses forum logs:", err.message);
    }
}

// --- FUNGSI REMINDER ---
async function checkMissingAbsence(channel) {
    try {
        const { data: allUsers, error: errUsers } = await supabase.from('users_master').select('discord_id');
        if (errUsers) throw errUsers;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: attendedToday, error: errAbsen } = await supabase
            .from('absensi_sapd')
            .select('discord_id')
            .gte('created_at', startOfDay.toISOString());

        if (errAbsen) throw errAbsen;

        const attendedIds = attendedToday.map(u => u.discord_id);
        const slackingUsers = allUsers.filter(u => !attendedIds.includes(u.discord_id));

        if (slackingUsers.length > 0) {
            const mentions = slackingUsers.map(u => `<@${u.discord_id}>`).join(' ');
            await channel.send(`⚠️ **REMINDER**\nAnggota berikut belum melakukan absensi hari ini:\n${mentions}\n\nSegera lakukan absensi di: https://san-andreas-police-departement.netlify.app/\n@everyone`);
        } else {
            await channel.send("✅ **REMINDER**: Semua anggota sudah melakukan absensi.\n@everyone");
        }
    } catch (err) {
        console.error("Gagal melakukan pengecekan absensi:", err.message);
    }
}

// 4. FUNGSI UTAMA
async function runSapdTask() {
    console.log(`[${new Date().toLocaleString('id-ID')}] Memulai tugas rutin SAPD...`);
    
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) return console.error("Error: Server Discord tidak ditemukan!");

    try {
        const members = await guild.members.fetch();
        const dataToUpsert = [];
        const activeDiscordIds = [];
        const updateTasks = [];

        for (const [id, member] of members) {
            if (member.roles.cache.has(REQUIRED_ROLE_ID)) {
                let userPangkat = "-";
                let userDivisi = "-";

                member.roles.cache.forEach(role => {
                    if (PANGKAT_MAP[role.id]) userPangkat = PANGKAT_MAP[role.id];
                    if (DIVISI_MAP[role.id]) userDivisi = DIVISI_MAP[role.id];
                });

                const freshName = member.nickname || member.user.globalName || member.user.username;
                activeDiscordIds.push(member.id);

                updateTasks.push(
                    supabase.from('absensi_sapd').update({
                        nama_anggota: freshName,
                        pangkat: userPangkat,
                        divisi: userDivisi
                    }).eq('discord_id', member.id)
                );

                dataToUpsert.push({
                    discord_id: member.id,
                    nama_anggota: freshName,
                    pangkat: userPangkat,
                    divisi: userDivisi,
                    is_admin: member.roles.cache.has(ADMIN_ROLE_ID), 
                    last_login: new Date().toISOString()
                });
            }
        }

        await Promise.all(updateTasks);

        if (activeDiscordIds.length > 0) {
            const formattedIds = `(${activeDiscordIds.join(',')})`;
            await supabase.from('users_master').delete().not('discord_id', 'in', formattedIds);
            await supabase.from('absensi_sapd').delete().not('discord_id', 'in', formattedIds);
        }

        await supabase.from('users_master').upsert(dataToUpsert, { onConflict: 'discord_id' });

        // JALANKAN FORUM LOGS SECARA BERTAHAP
        await processForumLogs(guild);
        
        console.log("Sinkronisasi & Forum Logs Selesai.");

        const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const jam = now.getHours();
        const menit = now.getMinutes();

        const channel = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
        if (channel && jam >= 19 && jam <= 23) {
            if (jam === 19 && menit <= 10) {
                await channel.send("📢 **REMINDER **\nWaktunya duty teman teman...\n@everyone");
                await checkMissingAbsence(channel);
            } 
            else if (jam === 22 && menit <= 10) {
                await channel.send("📢 **REMINDER **\nJangan lupa mengisi kehadiran...\n@everyone");
                await checkMissingAbsence(channel);
            }
        }
    } catch (err) {
        console.error("Terjadi kesalahan:", err.message);
    }
}

client.once('ready', () => {
    console.log(`Bot SAPD aktif sebagai ${client.user.tag}`);
    runSapdTask();
    setInterval(runSapdTask, 600000); 
});

client.login(process.env.DISCORD_BOT_TOKEN);