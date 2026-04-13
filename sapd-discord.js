const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// --- KONFIGURASI (MENGGUNAKAN SECRETS GITHUB) ---
const TOKEN = process.env.DISCORD_BOT_TOKEN; 
const PROMOTION_CHANNEL_ID = process.env.DISCORD_PROMOTION_CHANNEL_ID || '1444904948692422756';
// GANTI ID DI BAWAH INI DENGAN ID CHANNEL NOTIF KAMU
const NOTIF_CHANNEL_ID = '1493137414175326249'; 

// 1. Mapping ID Role ke Singkatan Nickname
const rankPrefixes = {
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
    '1444920482578173953': 'CADET',
};

// 2. Mapping ID Rank ke ID Role Kelompok
const groupRoles = {
    // POLICE OFFICER
    '1444919938891649145': '1444918351037206570', // PO III
    '1444920044239982673': '1444918351037206570', // PO II
    '1444920144793964595': '1444918351037206570', // PO I
    
    // DETECTIVE
    '1444919660054188032': '1444918302508843139', // DET III
    '1444919733114896465': '1444918302508843139', // DET II
    '1444919777553420339': '1444918302508843139', // DET I

    // SUPERVISOR
    '1444919014139756685': '1469596428706910292', // SGT III
    '1444919052815564910': '1469596428706910292', // SGT II
    '1444919550981308426': '1469596428706910292', // SGT I

    // COMMAND TEAM
    '1444918819717124186': '1444910648516415488', // LT III
    '1444918867691569244': '1444910648516415488', // LT II
    '1444918922766843904': '1444910648516415488', // LT I
    '1444918644600606770': '1444910648516415488', // CAPT III
    '1444918698484826173': '1444910648516415488', // CAPT II
    '1444918744815112302': '1444910648516415488', // CAPT I

    // HIGH COMMAND
    '1444908730230771723': '1444910578266148897', // COM
    '1444909625475596349': '1444910578266148897', // DCOP
    '1444909771181522974': '1444910578266148897', // ACOP
    '1444909938001580257': '1444910578266148897', // COP        
};

const allGroupIDs = [
    '1444918351037206570', // POLICE OFFICER
    '1444918302508843139', // DETECTIVE
    '1469596428706910292', // SUPERVISOR
    '1444910648516415488', // COMMAND TEAM
    '1444910578266148897' // HIGH COMMAND     
];

// NOTIFIKASI AKTIF (TANPA HAPUS OTOMATIS)
client.once('ready', () => {
    console.log(`Bot login sebagai ${client.user.tag}`);
    
    const notifChannel = client.channels.cache.get(NOTIF_CHANNEL_ID);
    if (notifChannel) {
        notifChannel.send(`✅ **Sistem SAPD Online** | ${new Date().toLocaleString('id-ID')} | Status: Menunggu Promosi... \n\n*Bot ini akan otomatis memproses promosi berdasarkan format yang ditentukan di channel promosi.*\n**Pastikan format promosi benar agar bot dapat memproses dengan lancar.**\n**Ketika tidak ada aktifitas yang sesuai format di channel <#1444904948692422756> maka bot akan offline\n @everyone`)
        .catch(console.error);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== PROMOTION_CHANNEL_ID) return;

    if (message.content.includes('**PROMOTION**')) {
        const nameLine = message.content.match(/Name:\s*(.*)/i);
        const userMatches = nameLine ? nameLine[1].match(/<@!?(\d+)>/g) : null;
        const prevRankMatch = message.content.match(/Previous Rank:\s*<@&(\d+)>/i);
        const newRankMatch = message.content.match(/Rank to be promoted:\s*<@&(\d+)>/i);
        const prevDivLine = message.content.match(/Previous Division\s*:\s*(.*)/i);
        const prevDivs = prevDivLine ? prevDivLine[1].match(/<@&(\d+)>/g) : null;
        const newDivLine = message.content.match(/Moved to this\s+division\s*:?\s*(.*)/i);
        const newDivs = newDivLine ? newDivLine[1].match(/<@&(\d+)>/g) : null;

        if (!userMatches) return;

        for (const mention of userMatches) {
            const userID = mention.replace(/[<@!>]/g, '');
            try {
                const member = await message.guild.members.fetch(userID);
                const botMember = message.guild.members.me;

                if (member.roles.highest.position >= botMember.roles.highest.position) continue;

                const newRankID = newRankMatch ? newRankMatch[1] : null;

                if (prevRankMatch) await member.roles.remove(prevRankMatch[1]).catch(() => null);
                if (newRankID) await member.roles.add(newRankID).catch(console.error);

                if (prevDivs) {
                    for (const div of prevDivs) await member.roles.remove(div.replace(/[<@&>]/g, '')).catch(() => null);
                }
                if (newDivs) {
                    for (const div of newDivs) await member.roles.add(div.replace(/[<@&>]/g, '')).catch(console.error);
                }

                if (newRankID && groupRoles[newRankID]) {
                    const targetGroupID = groupRoles[newRankID];
                    for (const groupID of allGroupIDs) {
                        if (member.roles.cache.has(groupID) && groupID !== targetGroupID) {
                            await member.roles.remove(groupID).catch(() => null);
                        }
                    }
                    await member.roles.add(targetGroupID).catch(console.error);
                }

                if (newRankID && rankPrefixes[newRankID]) {
                    const prefix = rankPrefixes[newRankID];
                    let cleanName = member.displayName;
                    if (cleanName.includes('|')) cleanName = cleanName.split('|')[1].trim();
                    const newNickname = `${prefix} | ${cleanName}`.substring(0, 32);
                    await member.setNickname(newNickname).catch(() => null);
                }
                console.log(`Berhasil: ${member.user.tag} diproses.`);
            } catch (error) {
                console.error(`Kesalahan pada ID ${userID}:`, error);
            }
        }
        await message.react('✅');
    }
});

client.login(TOKEN);