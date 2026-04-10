const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    // Dashboard sekarang mengirim payload berupa ARRAY (reports)
    const body = JSON.parse(event.body);
    
    // Jika dashboard mengirim array (masal), kita ambil discordId dari elemen pertama
    const reports = Array.isArray(body) ? body : [body];
    const discordId = reports[0].discord_id;

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
        // Kita langsung masukkan seluruh array reports agar efisien
        const { error } = await supabase.from('absensi_sapd').insert(
            reports.map(r => ({
                discord_id: r.discord_id,
                nama_anggota: r.nama_anggota,
                pangkat: r.pangkat,
                divisi: r.divisi, // Tambahkan kolom divisi
                jam_duty: r.jam_duty,
                kegiatan: r.kegiatan,
                bukti_foto: r.bukti_foto,
                created_at: r.created_at // Menggunakan tanggal yang dikirim dashboard (Penting untuk Cuti/Izin)
            }))
        );

        if (error) throw error;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Absensi Berhasil!" })
        };

    } catch (err) {
        console.error(err);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Server Error / User tidak ditemukan di Discord" }) 
        };
    }
};
