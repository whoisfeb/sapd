require('dotenv').config();
const { 
Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, 
UserSelectMenuBuilder, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle 
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const dataSurat = new Map();

const CHANNEL_PROMOSI = "1444904948692422756";

const ROLE_ALLOWED_PROMOSI = [
"1444912804929732849",
"1497996042518663363",
"1444910578266148897",
"1444908272363769887"
];

const MAPPING_ROLE = {

PANGKAT: [
    { label:'Commissioner', value:'1499035567135133816'},
    { label:'Deputy Commissioner', value:'1499035667496177836'},
    { label:'Chief of Police', value:'1444909938001580257'},
    { label:'Assistance Chief of Police', value:'1444909771181522974'},
    { label:'Deputy Chief of Police', value:'1444909625475596349'},
    { label:'Commander', value:'1444908730230771723'},
    { label:'Captain III', value:'1444918644600606770'},
    { label:'Captain II', value:'1444918698484826173'},
    { label:'Captain I', value:'1444918744815112302'},
    { label:'Lieutenant III', value:'1444918819717124186'},
    { label:'Lieutenant II', value:'1444918867691569244'},
    { label:'Lieutenant I', value:'1444918922766843904'},
    { label:'Sergeant III', value:'1444919014139756685'},
    { label:'Sergeant II', value:'1444919052815564910'},
    { label:'Sergeant I', value:'1444919550981308426'},
    { label:'Detective III', value:'1444919660054188032'},
    { label:'Detective II', value:'1444919733114896465'},
    { label:'Detective I', value:'1444919777553420339'},
    { label:'Police Officer III', value:'1444919938891649145'},
    { label:'Police Officer II', value:'1444920044239982673'},
    { label:'Police Officer I', value:'1444920144793964595'},
    { label:'Cadet', value:'1444920482578173953'},
    { label:'-', value:'-'}
],

JABATAN:[
    { label:'Kepala Kepolisian San Andreas', value:'1496865881739890801'},
    { label:'Wakil Kepala San Andreas', value:'1496865881651810518'},
    { label:'Head of Internal Affairs', value:'1444925095364657323'},
    { label:'Head of Human Resource Beurau', value:'1444925161416425503'},
    { label:'Head of Metropolitan', value:'1444924556199596092'},
    { label:'Head of Rampart Division', value:'1444924681105707119'},
    { label:'Head of Highway Patrol', value:'1444924874677158039'},
    { label:'-', value:'-'}
],

SATUAN:[
    { label:'Internal Affairs', value:'1444921352120434819'},
    { label:'Human Resource Beurau', value:'1444908272363769887'},
    { label:'Metropolitan', value:'1444920880370159617'},
    { label:'Rampart Division', value:'1444920955620032533'},
    { label:'Highway Patrol', value:'1444921188215165141'},
    { label:'-', value:'-'}
]

};

function getPangkatUser(member){

const pangkatRoles = MAPPING_ROLE.PANGKAT
.map(r=>r.value)
.filter(id=>id !== '-');

const role = member.roles.cache.find(r=>pangkatRoles.includes(r.id));

return role ? role.id : '-';

}

client.once('ready',()=>{

console.log(`✅ Bot Online: ${client.user.tag}`);

client.application.commands.create(
new SlashCommandBuilder()
.setName('promosi')
.setDescription('Membuat surat promosi/demosi/rotasi')
);

});

client.on('interactionCreate', async interaction=>{

if(interaction.isChatInputCommand() && interaction.commandName === 'promosi'){

const member = interaction.member;

if(!member.roles.cache.some(role=>ROLE_ALLOWED_PROMOSI.includes(role.id))){

return interaction.reply({
content:'❌ Anda tidak memiliki izin menggunakan command ini.',
ephemeral:true
});

}

dataSurat.set(interaction.user.id,{
ttdNama:`<@${interaction.user.id}>`,
ttdPangkat:getPangkatUser(member)
});

const row = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId('status')
.setPlaceholder('1. Pilih Status')
.addOptions([
{label:'Promosi',value:'Promosi'},
{label:'Demosi',value:'Demosi'},
{label:'Rotasi',value:'Rotasi'},
{label:'PTDH',value:'PTDH'},
{label:'RESIGN',value:'RESIGN'}
])
);

await interaction.reply({
content:'### 📜 Form Pembuatan Surat',
components:[row],
ephemeral:true
});

}

if(interaction.isModalSubmit()){

const userData = dataSurat.get(interaction.user.id);
if(!userData) return;

userData.pertimbangan = interaction.fields.getTextInputValue('input_pertimbangan');

await kirimSuratFinal(interaction,userData);

}

if(!interaction.isStringSelectMenu() && !interaction.isUserSelectMenu()) return;

const userData = dataSurat.get(interaction.user.id);
if(!userData) return;

const val = interaction.values[0];

switch(interaction.customId){

case 'status':

userData.status = val;

await showStep(interaction,'s3','2. Pilih Jabatan Penandatangan',MAPPING_ROLE.JABATAN);

break;

case 's3':

userData.ttdJabatan = val;

await showStep(interaction,'s4','3. Pilih Satuan Penandatangan',MAPPING_ROLE.SATUAN);

break;

case 's4':

userData.ttdSatuan = val;

const rowTarget = new ActionRowBuilder().addComponents(
new UserSelectMenuBuilder()
.setCustomId('s5')
.setPlaceholder('4. Pilih Nama Pihak Terkait')
);

await interaction.update({content:'Pilih Pihak Terkait',components:[rowTarget]});

break;

case 's5':

userData.targetNama = `<@${val}>`;

await showStep(interaction,'s6','5. Pilih Pangkat Lama',MAPPING_ROLE.PANGKAT);

break;

case 's6':

userData.pLama = val;

if(userData.status === "PTDH" || userData.status === "RESIGN"){

userData.pBaru='-';

await showStep(interaction,'s8','6. Pilih Jabatan Lama',MAPPING_ROLE.JABATAN);
break;

}

await showStep(interaction,'s7','6. Pilih Pangkat Baru',MAPPING_ROLE.PANGKAT);
break;

case 's7':

userData.pBaru = val;

await showStep(interaction,'s8','7. Pilih Jabatan Lama',MAPPING_ROLE.JABATAN);

break;

case 's8':

userData.jLama = val;

if(userData.status === "PTDH" || userData.status === "RESIGN"){

userData.jBaru='-';

await showStep(interaction,'s10','8. Pilih Satuan Lama',MAPPING_ROLE.SATUAN);
break;

}

await showStep(interaction,'s9','8. Pilih Jabatan Baru',MAPPING_ROLE.JABATAN);

break;

case 's9':

userData.jBaru = val;

await showStep(interaction,'s10','9. Pilih Satuan Lama',MAPPING_ROLE.SATUAN);

break;

case 's10':

userData.sLama = val;

if(userData.status === "PTDH" || userData.status === "RESIGN"){

userData.sBaru='-';

return showModal(interaction);

}

await showStep(interaction,'s11','10. Pilih Satuan Baru',MAPPING_ROLE.SATUAN);

break;

case 's11':

userData.sBaru = val;

return showModal(interaction);

}

});

async function showModal(interaction){

const modal = new ModalBuilder()
.setCustomId('modal_pertimbangan')
.setTitle('Input Pertimbangan');

const input = new TextInputBuilder()
.setCustomId('input_pertimbangan')
.setLabel('Masukkan Pertimbangan')
.setStyle(TextInputStyle.Paragraph);

modal.addComponents(new ActionRowBuilder().addComponents(input));

await interaction.showModal(modal);

}

async function showStep(interaction,customId,placeholder,options){

const row = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId(customId)
.setPlaceholder(placeholder)
.addOptions(options)
);

await interaction.update({
content:`Mengisi: **${placeholder}**`,
components:[row]
});

}

async function kirimSuratFinal(interaction,data){

const role = (id)=> id === '-' ? '-' : `<@&${id}>`;

const waktu = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'});

const surat = `**SURAT PROMOSI, DEMOSI, ROTASI**

${waktu}
Klasifikasi: Rahasia
Lampiran Satu Lembar
Perihal : Promosi/Demosi/Rotasi

Dengan Hormat,

Yang bertanda tangan dibawah ini :
a. Nama     : ${data.ttdNama}
b. Pangkat  : ${role(data.ttdPangkat)}
c. Jabatan  : ${role(data.ttdJabatan)}
d. Satuan   : ${role(data.ttdSatuan)}

Pihak Terkait
Biro Sumber Daya Manusia 
a. Nama         : ${data.targetNama}
b. Pangkat Lama : ${role(data.pLama)}
c. Pangkat Baru : ${role(data.pBaru)}
d. Jabatan Lama : ${role(data.jLama)}
e. Jabatan Baru : ${role(data.jBaru)}
f. Satuan Lama  : ${role(data.sLama)}
g. Satuan Baru  : ${role(data.sBaru)}
h. Status       : ${data.status}

Bersama ini saya membuat surat secara
resmi dan sah, sesuai Peraturan Kepolisian Daerah, dengan pertimbangan sebagai berikut :

${data.pertimbangan}

<@&1496865881672912899>`;

await interaction.reply({
content:'✅ Surat berhasil diterbitkan',
ephemeral:true
});

const channel = interaction.guild.channels.cache.get(CHANNEL_PROMOSI);

if(channel){
channel.send(surat);
}

dataSurat.delete(interaction.user.id);

}

client.login(process.env.DISCORD_BOT_TOKEN);
