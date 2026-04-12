require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Inisialisasi Discord Client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages
    ] 
});

// Mapping Pangkat
const PANGKAT_MAP = {
    "1444909938001580257": "CHIEF OF POLICE",
    "1444909771181522974": "ASSISTANT CHIEF OF POLICE",
    "1444909625475596349": "DEPUTY CHIEF OF POLICE",
    "1444908730230771723": "COMMANDER",
    "1444918644600606770": "CAPTAIN III",
    "1444918698484826173": "CAPTAIN II",
    "1444918744815112302": "CAPTAIN I",
    "1444918819717124186": "LIEUTENANT III",
    "1444918867691569244": "LIEUTENANT II",
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

// ID Channel untuk pengumuman
const ANNOUNCEMENT_CHANNEL_ID = "1492812998379700246"; 
const REQUIRED_ROLE_ID = "1444908462067945623";

client.once('ready', async () => {
    console.log(`Bot login sebagai ${client.user.tag}`);
    
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) {
        console.error("Gagal menemukan Server Discord!");
        process.exit();
    }

    try {
        // --- 1. FITUR SINKRONISASI ---
        console.log("Memulai sinkronisasi member...");
        const members = await guild.members.fetch();
        const dataToUpsert = [];
        const activeDiscordIds = [];

        // Gunakan for...of untuk mendukung await di dalam loop
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

                // Sinkronisasi data ke tabel logs (absensi_sapd)
                // Mengupdate semua baris yang sudah ada tanpa menambah data baru (mencegah duplikat)
                await supabase
                    .from('absensi_sapd')
                    .update({
                        nama_anggota: freshName,
                        pangkat: userPangkat,
                        divisi: userDivisi
                    })
                    .eq('discord_id', member.id);

                dataToUpsert.push({
                    discord_id: member.id,
                    nama_anggota: freshName,
                    pangkat: userPangkat,
                    divisi: userDivisi,
                    last_login: new Date().toISOString()
                });
            }
        }

        // HAPUS member yang keluar (Fitur users_master tetap sesuai aslinya)
        if (activeDiscordIds.length > 0) {
            const { error: deleteError } = await supabase
                .from('users_master')
                .delete()
                .not('discord_id', 'in', `(${activeDiscordIds.join(',')})`);
            
            if (deleteError) console.error("Gagal menghapus member keluar:", deleteError.message);
        }

        // UPDATE atau TAMBAH ke users_master
        const { error: upsertError } = await supabase
            .from('users_master')
            .upsert(dataToUpsert, { onConflict: 'discord_id' });

        if (upsertError) throw upsertError;
        console.log("Sinkronisasi Berhasil! Database profil & riwayat absen terupdate.");

        // --- 2. FITUR BROADCAST (WIB) ---
        const sekarang = new Date();
        const waktuWIB = new Date(sekarang.getTime() + (7 * 60 * 60 * 1000));
        const jam = waktuWIB.getUTCHours().toString().padStart(2, '0');
        const menit = waktuWIB.getUTCMinutes();
        const waktuString = `${jam}:${menit.toString().padStart(2, '0')}`;

        console.log(`Waktu saat ini (WIB): ${waktuString}`);

        const channel = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
        
        if (channel) {
            if (jam === "19" && (menit >= 30 && menit <= 59)) { 
                await channel.send("📢 **PENGUMUMAN DUTY**\nWAKTUNYA DUTY JIKA BERHALANGAN SILAHKAN IZIN ATAU CUTI DI https://san-andreas-police-departement.netlify.app/\n\n@everyone");
                console.log("Pesan 19:30 terkirim.");
            } 
            else if (jam === "22" && (menit >= 0 && menit <= 59)) {
                await channel.send("📢 **REMINDER ABSENSI**\nJANGAN LUPA UNTUK MENGISI KEHADIRAN DI https://san-anndreas-police-departement.netlify.app/\n\n@everyone");
                console.log("Pesan 22:00 terkirim.");
            }
        }

    } catch (err) {
        console.error("Terjadi kesalahan:", err.message);
    } finally {
        setTimeout(() => process.exit(), 5000);
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);