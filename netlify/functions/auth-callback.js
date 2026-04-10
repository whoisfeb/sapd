const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.handler = async (event) => {
    const { code } = event.queryStringParameters;
    if (!code) return { statusCode: 400, body: "Authorization code missing" };

    try {
        // 1. Tukar code dengan token
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            scope: 'identify',
        }));

        const accessToken = tokenRes.data.access_token;

        // 2. Ambil ID User
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userId = userRes.data.id;

        // 3. Ambil Nickname & Role dari Server
        const memberRes = await axios.get(
            `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}`,
            { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
        );

        const { nick, roles, user } = memberRes.data;
        const displayName = nick || user.global_name || user.username;

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

        // --- MAPPING DIVISI ---
        const DIVISI_MAP = {
            "1444920880370159617": "METROPOLITAN",
            "1444920955620032533": "RAMPART DIVISION",
            "1444921188215165141": "HIGHWAY PATROL",
            "1444908272363769887": "HUMAN RESOURCE BUREAU",
            "1444921352120434819": "INTERNAL AFFAIRS DIVISION"
        };

        // --- ROLE ADMIN / PETINGGI ---
        const ADMIN_ROLE_ID = "1444910578266148897"; 

        let userPangkat = "Unknown";
        let userDivisi = [];
        let isAdmin = false;

        roles.forEach(r => {
            if (PANGKAT_MAP[r]) userPangkat = PANGKAT_MAP[r];
            if (DIVISI_MAP[r]) userDivisi.push(DIVISI_MAP[r]);
            if (r === ADMIN_ROLE_ID) isAdmin = true; // Cek jika user High Command
        });

        // 4. Redirect ke Dashboard dengan tambahan status Admin
        const redirectUrl = `/dashboard.html?id=${userId}&name=${encodeURIComponent(displayName)}&pangkat=${encodeURIComponent(userPangkat)}&divisi=${encodeURIComponent(JSON.stringify(userDivisi))}&admin=${isAdmin}`;
        
        return {
            statusCode: 302,
            headers: { Location: redirectUrl }
        };

    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: "Login Failed" };
    }
};
