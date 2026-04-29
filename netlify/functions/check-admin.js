const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { discordId } = JSON.parse(event.body);
    
    // 1. Ganti menjadi array untuk menampung banyak ID Admin
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

        const { roles } = memberRes.data;

        // 2. Gunakan .some() untuk mengecek apakah salah satu role user ada di daftar admin
        const freshIsAdmin = roles.some(roleId => ADMIN_ROLE_IDS.includes(roleId));

        // Update status di Database
        await supabase.from('users_master')
            .update({ is_admin: freshIsAdmin })
            .eq('discord_id', discordId);

        if (!freshIsAdmin) {
            return { 
                statusCode: 403, 
                body: JSON.stringify({ message: "Bukan Admin", isAdmin: false }) 
            };
        }

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: "Authorized", isAdmin: true }) 
        };

    } catch (err) {
        if (err.response && err.response.status === 404) {
            await supabase.from('users_master').delete().eq('discord_id', discordId);
            return { statusCode: 403, body: JSON.stringify({ message: "KICKED" }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: "Error", error: err.message }) };
    }
};
