require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Inisialisasi Discord Client
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
});

// Mapping Pangkat (Tetap)
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

// Update Mapping Divisi berdasarkan ID terbaru
const DIVISI_MAP = {
    "1444921188215165141": "HIGHWAY PATROL",
    "1444920955620032533": "RAMPART DIVISION",
    "1444920880370159617": "METROPOLITAN",
    "1444908272363769887": "HUMAN RESOURCE BUREAU",
    "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
};

client.once('ready', async () => {
    console.log(`Bot login sebagai ${client.user.tag}`);
    
    const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
    if (!guild) {
        console.error("Gagal menemukan Server Discord. Periksa DISCORD_GUILD_ID di .env!");
        process.exit();
    }

    // Role ID yang wajib dimiliki (Role Inti)
    const REQUIRED_ROLE_ID = "1444908462067945623";

    try {
        console.log("Memulai fetch member...");
        const members = await guild.members.fetch();
        const dataToUpsert = [];

        members.forEach(member => {
            // FILTER: Hanya masukkan jika member punya Role Inti
            if (member.roles.cache.has(REQUIRED_ROLE_ID)) {
                let userPangkat = "-";
                let userDivisi = "-";

                // Deteksi Pangkat & Divisi dari semua role yang dimiliki user
                member.roles.cache.forEach(role => {
                    if (PANGKAT_MAP[role.id]) userPangkat = PANGKAT_MAP[role.id];
                    if (DIVISI_MAP[role.id]) userDivisi = DIVISI_MAP[role.id];
                });

                dataToUpsert.push({
                    discord_id: member.id,
                    nama_anggota: member.nickname || member.user.globalName || member.user.username,
                    pangkat: userPangkat,
                    divisi: userDivisi,
                    last_login: new Date().toISOString()
                });
            }
        });

        console.log(`Ditemukan ${dataToUpsert.length} anggota dengan Role Inti.`);

        // 1. Bersihkan tabel master terlebih dahulu agar user yang sudah dicabut Role Intinya hilang
        const { error: deleteError } = await supabase
            .from('users_master')
            .delete()
            .neq('discord_id', '0');

        if (deleteError) throw deleteError;

        // 2. Masukkan data terbaru
        const { error: upsertError } = await supabase
            .from('users_master')
            .upsert(dataToUpsert);

        if (upsertError) throw upsertError;

        console.log("Sinkronisasi Berhasil! Database sudah bersih dan sesuai Role Inti.");
        
    } catch (err) {
        console.error("Terjadi kesalahan:", err.message);
    } finally {
        process.exit();
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);