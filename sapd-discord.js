require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ==========================================
// --- KONFIGURASI CHANNEL & TOKEN ---
// ==========================================
const TOKEN = process.env.DISCORD_BOT_TOKEN; 
const PROMOTION_CHANNEL_ID = process.env.DISCORD_PROMOTION_CHANNEL_ID || '1444904948692422756';
const NOTIF_CHANNEL_ID = '1493137414175326249'; 

// ==========================================
// --- ROLE IDENTITAS UTAMA (WAJIB BENAR) ---
// ==========================================
const WARGA_ROLE_ID = '1444908142587547658';       // Role: Warga Excellence
const POLICE_MAIN_ROLE_ID = '1444908462067945623'; // Role: Excellence Police


// ==========================================
// --- 1. MAPPING PREFIX NICKNAME ---
// ==========================================
const rankPrefixes = {
    '1499035567135133816': 'CENTRAL',
    '1499035667496177836': 'D.CENTRAL',
    '1444909938001580257': 'COP',
    '1444909771181522974': 'ACOP',
    '1444909625475596349': 'DCOP',
    '1444908730230771723': 'COM',
    '1444918644600606770': 'CAPT III',
    '1444918698484826173': 'CAPT II',
    '1444918744815112302': 'CAPT I',
    '1444918819717124186': 'LT III',
    '1444918867691569244': 'LT II',
    '1444918922766843904': 'LT I',
    '1444919014139756685': 'SGT III',
    '1444919052815564910': 'SGT II',
    '1444919550981308426': 'SGT I',
    '1444919660054188032': 'DET III',
    '1444919733114896465': 'DET II',
    '1444919777553420339': 'DET I',
    '1444919938891649145': 'PO III',
    '1444920044239982673': 'PO II',
    '1444920144793964595': 'PO I',
    '1444920482578173953': 'CADET'
};

// ==========================================
// --- 2. MAPPING ROLE KELOMPOK (GROUPS) ---
// ==========================================
const groupRoles = {

    '1444919938891649145': '1444918351037206570', // Group: Police Officer
    '1444920044239982673': '1444918351037206570',
    '1444920144793964595': '1444918351037206570',
    '1444919660054188032': '1444918302508843139', // Group: Detective
    '1444919733114896465': '1444918302508843139',
    '1444919777553420339': '1444918302508843139',
    '1444919014139756685': '1469596428706910292', // Group: Supervisor
    '1444919052815564910': '1469596428706910292',
    '1444919550981308426': '1469596428706910292',
    '1444918819717124186': '1444910648516415488', // Group: Command Team
    '1444918867691569244': '1444910648516415488',
    '1444918922766843904': '1444910648516415488',
    '1444918644600606770': '1444910648516415488',
    '1444918698484826173': '1444910648516415488',
    '1444918744815112302': '1444910648516415488',
    '1444908730230771723': '1444910578266148897', // Group: High Command
    '1444909625475596349': '1444910578266148897',
    '1444909771181522974': '1444910578266148897',
    '1444909938001580257': '1444910578266148897',
    '1499035567135133816': '1497996042518663363', // Group: Central Command
    '1499035667496177836': '1497996042518663363'
};

// ==========================================
// --- ROLE GOLOGAN SAJA (UNTUK SINKRONISASI)
// ==========================================
const groupRoleIDs = [
    '1444918351037206570', // Group: Police Officer
    '1444918302508843139', // Group: Detective
    '1469596428706910292', // Group: Supervisor
    '1444910648516415488', // Group: Command Team
    '1444910578266148897', // Group: High Command
    '1497996042518663363' // Group: Central Command
];

// ==========================================
// --- 3. DAFTAR MEMBERSIHKAN ROLE POLISI ---
// ==========================================
const allGroupIDs = [
    POLICE_MAIN_ROLE_ID,
    '1496865881739890800',
    '1496865881706201281',
    '1496865881698074695',
    '1496865881698074691',
    '1496865881681166465',
    '1496865881727176759',
    '1496865881727176758',
    '1496865881672912905',
    '1496865881672912904',
    '1496865881672912903',
    '1496865881672912902',
    '1496865881672912901'
];

// ==========================================
// --- HELPER FUNCTIONS ---
// ==========================================

function extractUserID(text) {
    if (!text) return null;
    const match = text.match(/<@!?(\d+)>/);
    return match ? match[1] : null;
}

function extractRoleIDs(text) {
    if (!text) return [];

    const roleIDArray = [];
    const regex = /<@&(\d+)>/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        roleIDArray.push(match[1]);
    }

    return roleIDArray;
}

function extractRoleID(text) {
    const ids = extractRoleIDs(text);
    return ids.length > 0 ? ids[0] : null;
}

function isEmpty(value) {
    if (!value) return true;
    const cleaned = value.trim().toLowerCase();
    return cleaned === '-' || cleaned === 'n/a' || cleaned === 'na' || cleaned === '';
}

// ==========================================
// --- PARSE PROMOTION LETTER ---
// ==========================================
function parsePromotionLetter(messageContent) {

    const pihakTerkaitStart = messageContent.indexOf('Pihak Terkait');
    if (pihakTerkaitStart === -1) return null;

    const after = messageContent.substring(pihakTerkaitStart);
    const next = after.indexOf('Bersama ini saya membuat');

    const content = next !== -1 ? after.substring(0, next) : after;

    const namaMatch = content.match(/a\.\s*Nama\s*:\s*(.+?)(?=\nb\.|$)/is);
    const pangkatLamaMatch = content.match(/b\.\s*Pangkat\s+Lama\s*:\s*(.+?)(?=\nc\.|$)/is);
    const pangkatBaruMatch = content.match(/c\.\s*Pangkat\s+Baru\s*:\s*(.+?)(?=\nd\.|$)/is);
    const jabatanLamaMatch = content.match(/d\.\s*Jabatan\s+Lama\s*:\s*(.+?)(?=\ne\.|$)/is);
    const jabatanBaruMatch = content.match(/e\.\s*Jabatan\s+Baru\s*:\s*(.+?)(?=\nf\.|$)/is);
    const satuanLamaMatch = content.match(/f\.\s*Satuan\s+Lama\s*:\s*(.+?)(?=\ng\.|$)/is);
    const satuanBaruMatch = content.match(/g\.\s*Satuan\s+Baru\s*:\s*(.+?)(?=\nh\.|$)/is);
    const statusMatch = content.match(/h\.\s*Status\s*:\s*(.+)/i);

    const nama = namaMatch ? namaMatch[1].trim() : null;
    const userID = nama ? extractUserID(nama) : null;

    if (!userID) return null;

    return {
        userID,
        pangkatLama: isEmpty(pangkatLamaMatch?.[1]) ? null : pangkatLamaMatch[1].trim(),
        pangkatBaru: isEmpty(pangkatBaruMatch?.[1]) ? null : pangkatBaruMatch[1].trim(),
        jabatanLama: isEmpty(jabatanLamaMatch?.[1]) ? null : jabatanLamaMatch[1].trim(),
        jabatanBaru: isEmpty(jabatanBaruMatch?.[1]) ? null : jabatanBaruMatch[1].trim(),
        satuanLama: isEmpty(satuanLamaMatch?.[1]) ? null : satuanLamaMatch[1].trim(),
        satuanBaru: isEmpty(satuanBaruMatch?.[1]) ? null : satuanBaruMatch[1].trim(),
        status: isEmpty(statusMatch?.[1]) ? null : statusMatch[1].trim().toUpperCase()
    };
}

// ==========================================
// --- BOT READY ---
// ==========================================
client.once('clientReady', async () => {

    console.log(`✅ Bot login sebagai ${client.user.tag}`);

    const notifChannel = client.channels.cache.get(NOTIF_CHANNEL_ID);
    if (!notifChannel) return;

    // PESAN 1
    await notifChannel.send(`✅ **Sistem SAPD Online** | ${new Date().toLocaleString('id-ID')}
Status: **Menunggu Promosi/Demotion...**

*Bot ini akan otomatis memproses promosi/demotion berdasarkan format surat resmi yang ditentukan di channel promosi.*
*Pastikan format surat benar agar bot dapat memproses dengan lancar.*
*Ketika tidak ada aktivitas yang sesuai format di channel <#${PROMOTION_CHANNEL_ID}> maka bot akan standby.*

@everyone

━━━━━━━━━━━━━━━━━━━━
📑 **Tutorial Mengisi Format Promotion**
━━━━━━━━━━━━━━━━━━━━

Gunakan format berikut:

**SURAT PROMOSI, DEMOSI, ROTASI**

27/01/2026 19:05PM
Klasifikasi: Rahasia
Lampiran Satu Lembar
Perihal : Promosi/Demosi/Rotasi

Dengan Hormat,

Yang bertanda tangan dibawah ini :
a. Nama     :
b. Pangkat  :
c. Jabatan  :
d. Satuan :

Pihak Terkait
Biro Sumber Daya Manusia
a. Nama         :
b. Pangkat Lama :
c. Pangkat Baru :
d. Jabatan Lama :
e. Jabatan Baru :
f. Satuan Lama :
g. Satuan Baru :
h. Status :
Bersama ini saya membuat surat secara
resmi dan sah, sesuai Peraturan Kepolisian Daerah, dengan pertimbangan sebagai berikut :

<@&1444908462067945623>
`);

    // PESAN 2
    await notifChannel.send(`━━━━━━━━━━━━━━━━━━━━
📌 **Contoh Pengisian**
━━━━━━━━━━━━━━━━━━━━

**SURAT PROMOSI, DEMOSI, ROTASI**

27/01/2026 19:05PM
Klasifikasi: Rahasia
Lampiran Satu Lembar
Perihal : Promosi/Demosi/Rotasi (pilih salah satunya)

Dengan Hormat,

Yang bertanda tangan dibawah ini :
a. Nama     : isi nama anda disini
b. Pangkat  : isi pangkat anda
c. Jabatan  : isi jabatan anda
d. Satuan : isi satuan atau divisi anda

Pihak Terkait
Biro Sumber Daya Manusia
a. Nama         : tag user yang bersangkutan
b. Pangkat Lama : tag pangkat lama (jika ada, jika tidak ada isi dengan -)
c. Pangkat Baru : tag pangkat baru (jika ada, jika tidak ada isi dengan -)
d. Jabatan Lama : tag jabatan lama (jika ada, jika tidak ada isi dengan -)
e. Jabatan Baru : tag jabatan baru (jika ada, jika tidak ada isi dengan -)
f. Satuan Lama : tag satuan lama (jika ada, jika tidak ada isi dengan -)
g. Satuan Baru : tag satuan baru (jika ada, jika tidak ada isi dengan -)
h. Status : tag status (PROMOSI / DEMOSI / ROTASI / RESIGN / PTDH)

Bersama ini saya membuat surat secara
resmi dan sah, sesuai Peraturan Kepolisian Daerah, dengan pertimbangan sebagai berikut :

<@&1444908462067945623>
`);

    // PESAN 3
    await notifChannel.send(`contoh pengisian PTDH ATAU RESIGN

**SURAT PROMOSI, DEMOSI, ROTASI**

27/01/2026 19:05PM
Klasifikasi: Rahasia
Lampiran Satu Lembar
Perihal : Promosi/Demosi/Rotasi (pilih salah satunya)

Dengan Hormat,

Yang bertanda tangan dibawah ini :
a. Nama     : isi nama anda disini
b. Pangkat  : isi pangkat anda
c. Jabatan  : isi jabatan anda
d. Satuan : isi satuan atau divisi anda

Pihak Terkait
Biro Sumber Daya Manusia
a. Nama         : tag user yang bersangkutan
b. Pangkat Lama : tag pangkat lama
c. Pangkat Baru : isi dengan tanda -
d. Jabatan Lama : tag jabatan lama
e. Jabatan Baru : isi dengan tanda -
f. Satuan Lama : tag satuan lama
g. Satuan Baru : isi dengan tanda -
h. Status : PTDH atau RESIGN (pilih salah satunya)

Bersama ini saya membuat surat secara
resmi dan sah, sesuai Peraturan Kepolisian Daerah, dengan pertimbangan sebagai berikut :

<@&1444908462067945623>

⚠️ **Catatan:**
• Gunakan **mention user** untuk nama
• Gunakan **mention role** untuk pangkat/jabatan/satuan
• Jika tidak ada perubahan isi dengan **-**

━━━━━━━━━━━━━━━━━━━━
🤖 **Sistem akan otomatis:**
• Menghapus pangkat lama
• Memberikan pangkat baru
• Mengubah divisi/satuan
• Menyesuaikan golongan
• Mengubah nickname sesuai pangkat
━━━━━━━━━━━━━━━━━━━━
`);

});

// ==========================================
// --- PROMOTION SYSTEM ---
// ==========================================
client.on('messageCreate', async (message) => {

    if (message.author.bot && message.author.id !== client.user.id) return;
    if (message.channel.id !== PROMOTION_CHANNEL_ID) return;

    if (!message.content.includes('Pihak Terkait')) return;

    const data = parsePromotionLetter(message.content);

    if (!data) {
        await message.react('❌');
        return;
    }

    const { userID, pangkatLama, pangkatBaru, satuanLama, satuanBaru, status } = data;

    try {

        const member = await message.guild.members.fetch(userID);
        const botMember = message.guild.members.me;

        if (member.roles.highest.position >= botMember.roles.highest.position) {
            await message.react('⚠️');
            return;
        }

        // ======================================
        // PTDH / RESIGN SYSTEM (FULL REMOVE)
        // ======================================
        if (status === 'PTDH' || status === 'RESIGN') {

            const member = await message.guild.members.fetch(userID);

            // Hapus semua role polisi
            for (const roleID of allGroupIDs) {
                if (member.roles.cache.has(roleID)) {
                    await member.roles.remove(roleID).catch(()=>null);
                }
            }

            // Hapus pangkat jika ada
            if (pangkatLama) {
                const roleID = extractRoleID(pangkatLama);
                if (roleID) await member.roles.remove(roleID).catch(()=>null);
            }

            // Tambahkan role warga
            if (!member.roles.cache.has(WARGA_ROLE_ID)) {
                await member.roles.add(WARGA_ROLE_ID).catch(()=>null);
            }

            // =========================
            // NICKNAME PTDH / RESIGN
            // =========================
            let clean = member.displayName || member.user.username;

            if (clean.includes('|')) {
                clean = clean.split('|')[1].trim();
            }

            let newName = clean;

            if (status === 'RESIGN') {
                newName = `RESIGN | ${clean}`;
            }

            if (status === 'PTDH') {
                newName = `PTDH | ${clean}`;
            }

            await member.setNickname(newName.substring(0,32)).catch(()=>null);

            await message.react('🔥');

            return;
        }

        // REMOVE OLD RANK
        if (pangkatLama) {

            const roleID = extractRoleID(pangkatLama);

            if (roleID) await member.roles.remove(roleID).catch(() => null);

        }

        // ADD NEW RANK
        let newRankID = null;

        if (pangkatBaru) {

            newRankID = extractRoleID(pangkatBaru);

            if (newRankID) await member.roles.add(newRankID);

        }

        // REMOVE OLD DIVISION
        if (satuanLama) {

            const roles = extractRoleIDs(satuanLama);

            for (const r of roles) await member.roles.remove(r).catch(()=>null);

        }

        // ADD NEW DIVISION
        if (satuanBaru) {

            const roles = extractRoleIDs(satuanBaru);

            for (const r of roles) await member.roles.add(r).catch(()=>null);

        }

        // ======================================
        // SYNC GROUP ROLE (FIXED)
        // ======================================
        if (newRankID && groupRoles[newRankID]) {

            const targetGroupID = groupRoles[newRankID];

            for (const groupID of groupRoleIDs) {

                if (member.roles.cache.has(groupID) && groupID !== targetGroupID) {

                    await member.roles.remove(groupID).catch(()=>null);

                }

            }

            await member.roles.add(targetGroupID);

        }

        if (newRankID) await member.roles.add(POLICE_MAIN_ROLE_ID);

        // UPDATE NICKNAME
        if (newRankID && rankPrefixes[newRankID]) {

            const prefix = rankPrefixes[newRankID];

            let clean = member.displayName;

            if (clean.includes('|')) clean = clean.split('|')[1].trim();

            await member.setNickname(`${prefix} | ${clean}`.substring(0,32));

        }

        await message.react('✅');

    } catch (err) {

        console.error(err);
        await message.react('❌');

    }

});

// ==========================================
// --- BOT LOGIN ---
// ==========================================
client.login(TOKEN);
