const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    const { discordId, jam_duty, kegiatan, bukti_foto, nama_anggota, pangkat } = JSON.parse(event.body);

    try {
        // --- PROSES PENGECEKAN ROLE REAL-TIME ---
        const memberRes = await axios.get(
            `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${discordId}`,
            { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
        );

        const roles = memberRes.data.roles;
        const REQUIRED_ROLE_ID = process.env.DISCORD_REQUIRED_ROLE_ID;

        // JIKA ROLE INTI SUDAH DICABUT
        if (!roles.includes(REQUIRED_ROLE_ID)) {
            // Hapus dari users_master detik itu juga
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Akses dicabut! Anda tidak memiliki Role Inti." })
            };
        }

        // JIKA ROLE MASIH ADA: Masukkan ke database absensi
        const { error } = await supabase.from('absensi_sapd').insert([{
            discord_id: discordId,
            nama_anggota,
            pangkat,
            jam_duty,
            kegiatan,
            bukti_foto
        }]);

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Absensi Berhasil!" })
        };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ message: "Server Error / User tidak ditemukan di Discord" }) };
    }
};
