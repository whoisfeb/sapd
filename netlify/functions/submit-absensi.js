const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Inisialisasi Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body);
    const reports = Array.isArray(body) ? body : [body];
    const discordId = reports[0].discord_id;

    // --- DAFTAR MAPPING PANGKAT & DIVISI (UPDATED) ---
    const PANGKAT_MAP = {
        "1499035567135133816": "COMMISSIONNER",
            "1499035667496177836": "DEPUTY COMMISSIONNER",
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

    const PANGKAT_PRIORITY = Object.keys(PANGKAT_MAP);

    const DIVISI_MAP = {
        "1444920880370159617": "METROPOLITAN",
            "1444920955620032533": "RAMPART DIVISION",
            "1444921188215165141": "HIGHWAY PATROL",
            "1444908272363769887": "HUMAN RESOURCE BUREAU",
            "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
    };

    // Daftar ID Role Admin (Bisa lebih dari satu)
    const ADMIN_ROLE_IDS = [
        "1497996042518663363",
            "1444910578266148897", 
            "1444925161416425503", 
            "1444925095364657323"
    ];

    try {
        const memberRes = await axios.get(
            `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`,
            { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
        );

        const { roles, nick, user: discordUser } = memberRes.data;
        const REQUIRED_ROLE_ID = process.env.DISCORD_REQUIRED_ROLE_ID;

        if (!roles.includes(REQUIRED_ROLE_ID)) {
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            return { statusCode: 403, body: JSON.stringify({ message: "KICKED" }) };
        }

        // Cek status Admin (Multi-role support)
        const freshIsAdmin = roles.some(roleId => ADMIN_ROLE_IDS.includes(roleId));

        // Ambil Pangkat
        let freshPangkat = "Unknown";
        for (const roleId of PANGKAT_PRIORITY) {
            if (roles.includes(roleId)) {
                freshPangkat = PANGKAT_MAP[roleId];
                break;
            }
        }

        // Ambil Divisi
        let freshDivisi = "-";
        for (const r of roles) {
            if (DIVISI_MAP[r]) {
                freshDivisi = DIVISI_MAP[r];
                break; 
            }
        }

        const freshName = nick || discordUser.global_name || discordUser.username;

        // --- SINKRONISASI DATABASE ---
        await supabase.from('users_master').update({
            nama_anggota: freshName,
            pangkat: freshPangkat,
            divisi: freshDivisi,
            is_admin: freshIsAdmin
        }).eq('discord_id', discordId);

        await supabase.from('absensi_sapd').update({
            nama_anggota: freshName,
            pangkat: freshPangkat,
            divisi: freshDivisi
        }).eq('discord_id', discordId);

        const { error: insertError } = await supabase.from('absensi_sapd').insert(
            reports.map(r => ({
                discord_id: discordId,
                nama_anggota: freshName,
                pangkat: freshPangkat,
                divisi: freshDivisi,
                tipe_absen: r.tipe_absen,
                jam_duty: r.jam_duty,
                alasan: r.alasan,
                bukti_foto: r.bukti_foto,
                created_at: r.created_at || new Date().toISOString()
            }))
        );

        if (insertError) throw insertError;

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "SUCCESS", 
                updatedData: { name: freshName, pangkat: freshPangkat, divisi: freshDivisi, isAdmin: freshIsAdmin } 
            })
        };

    } catch (err) {
        if (err.response && err.response.status === 404) {
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            return { statusCode: 403, body: JSON.stringify({ message: "KICKED" }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: "SERVER ERROR", details: err.message }) };
    }
};
