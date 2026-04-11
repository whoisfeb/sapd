const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    const body = JSON.parse(event.body);
    const reports = Array.isArray(body) ? body : [body];
    const discordId = reports[0].discord_id;

    // --- DAFTAR MAPPING PANGKAT & DIVISI (Sesuai Server SAPD) ---
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
        "1444920880370159617": "METROPOLITAN",
        "1444920955620032533": "RAMPART DIVISION",
        "1444921188215165141": "HIGHWAY PATROL",
        "1444908272363769887": "HUMAN RESOURCE BUREAU",
        "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
    };

    try {
        // 1. TAHAP PENGECEKAN ROLE REAL-TIME KE DISCORD
        const memberRes = await axios.get(
            `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`,
            { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
        );

        const { roles, nick, user: discordUser } = memberRes.data;
        const REQUIRED_ROLE_ID = process.env.DISCORD_REQUIRED_ROLE_ID;

        // JIKA ROLE INTI SUDAH TIDAK ADA
        if (!roles.includes(REQUIRED_ROLE_ID)) {
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "KICKED", detail: "Akses dicabut oleh Admin Discord." })
            };
        }

        // 2. TAHAP UPDATE IDENTITAS (SINKRONISASI PANGKAT/NAMA)
        let freshPangkat = "Unknown";
        let freshDivisi = "-";
        roles.forEach(r => {
            if (PANGKAT_MAP[r]) freshPangkat = PANGKAT_MAP[r];
            if (DIVISI_MAP[r]) freshDivisi = DIVISI_MAP[r];
        });
        const freshName = nick || discordUser.global_name || discordUser.username;

        // Update di tabel Master agar data di Dashboard & Rekap ikut terbaru
        await supabase.from('users_master').update({
            nama_anggota: freshName,
            pangkat: freshPangkat,
            divisi: freshDivisi
        }).eq('discord_id', discordId);

        // 3. TAHAP INSERT ABSENSI DENGAN DATA TERBARU
        const { error: insertError } = await supabase.from('absensi_sapd').insert(
            reports.map(r => ({
                discord_id: discordId,
                nama_anggota: freshName, // Pakai nama terbaru dari Discord
                pangkat: freshPangkat,    // Pakai pangkat terbaru dari Discord
                divisi: freshDivisi,      // Pakai divisi terbaru dari Discord
                jam_duty: r.jam_duty,
                kegiatan: r.kegiatan,
                bukti_foto: r.bukti_foto,
                created_at: r.created_at || new Date().toISOString()
            }))
        );

        if (insertError) throw insertError;

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "SUCCESS", 
                updatedData: { name: freshName, pangkat: freshPangkat, divisi: freshDivisi } 
            })
        };

    } catch (err) {
        console.error(err);
        // Jika user tidak ditemukan di Discord (keluar server)
        if (err.response && err.response.status === 404) {
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            return { statusCode: 403, body: JSON.stringify({ message: "KICKED" }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: "SERVER ERROR" }) };
    }
};
