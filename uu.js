// Bagian isi konten hukum
const kodeHTML = `
    <section id="bab1">
        <h2 class="bab-title">BAB 1: Hierarki Komando (Pembangkangan)</h2>
        <div class="pasal">
            <span class="pasal-label">Pasal 1</span>
            <div class="ayat">
                <div class="ayat-n">1.</div>
                <div>Setiap personil yang sengaja mengabaikan atau membangkang perintah operasional atasan langsung.</div>
            </div>
            <div class="penalty-box">
                <span class="denda-text">SANKSI AYAT 1:</span>
                MIN: Denda Rp 5.000 | Teguran<br>
                MAX: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari
            </div>
        </div>
    </section>

    `;

// Bagian Sidebar / Indeks (Sudah diperbarui sesuai permintaan Anda)
const menuHTML = `
    <h2>INDEKS ATURAN & SANKSI</h2>
    <a href="#bab1">BAB 1: Hierarki Komando (Pembangkangan)</a>
    <a href="#bab2">BAB 2: Perintah Lisan (Pelaksanaan Tugas)</a>
    <a href="#bab3">BAB 3: Kerahasiaan Negara (Kebocoran Info)</a>
    <a href="#bab4">BAB 4: Demosi Jabatan (Sanksi Penurunan)</a>
    <a href="#bab5">BAB 5: Seragam & Atribut (Uniform)</a>
    <a href="#bab6">BAB 6: Kehadiran & Apel (Indisipliner)</a>
    <a href="#bab7">BAB 7: Etika Asmara (Pelanggaran Moral)</a>
    <a href="#bab8">BAB 8: Larangan Kriminal (Tindak Pidana)</a>
    <a href="#bab9">BAB 9: Media Sosial (Pelanggaran Etika Digital)</a>
    <a href="#bab10">BAB 10: Anti-Korupsi (Suap & Pungli)</a>
    <a href="#bab11">BAB 11: Unit, Callsign & Sirine</a>
    <a href="#bab12">BAB 12: Penangkapan Dasar (Salah Prosedur)</a>
    <a href="#bab13">BAB 13: Penggunaan Borgol (Kekerasan Berlebih)</a>
    <a href="#bab14">BAB 14: Penggunaan Taser (Kekerasan Berlebih)</a>
    <a href="#bab15">BAB 15: Senjata Api Tajam (Penyalahgunaan Senpi)</a>
    <a href="#bab16">BAB 16: Prosedur Interogasi (Kekerasan/Intimidasi)</a>
    <a href="#bab17">BAB 17: Barang Bukti (Penggelapan/Perusakan)</a>
    <a href="#bab18">BAB 18: Olah TKP (Kelalaian Prosedur)</a>
    <a href="#bab19">BAB 19: Penyadapan Radio (Ilegal Monitoring)</a>
    <a href="#bab20">BAB 20: Dana Informan (Penyimpangan Anggaran)</a>
    <a href="#bab21">BAB 21: Penanganan Massa (Pelanggaran Prosedur)</a>
    <a href="#bab22">BAB 22: Gas Air Mata (Penyalahgunaan)</a>
    <a href="#bab23">BAB 23: Tilang Manual (Penyimpangan/Pungli)</a>
    <a href="#bab24">BAB 24: Reserse Kriminal (Rekayasa Kasus)</a>
    <a href="#bab25">BAB 25: Reserse Narkotika (Penyalahgunaan Zat)</a>
    <a href="#bab26">BAB 26: Reserse Cyber (Penyalahgunaan Akses)</a>
    <a href="#bab27">BAB 27: Persenjataan (Kelalaian Inventaris)</a>
    <a href="#bab28">BAB 28: Perawatan Senpi (Kelalaian Teknis)</a>
    <a href="#bab29">BAB 29: Divisi Propam (Pengawasan Internal)</a>
    <a href="#bab30">BAB 30: Provos Disiplin (Tindakan Fisik)</a>
    <a href="#bab31">BAB 31: Tes Urin (Positif Narkoba)</a>
    <a href="#bab32">BAB 32: Kekayaan Personil (Laporan Palsu/TPPU)</a>
    <a href="#bab33">BAB 33: Kode Etik Profesi (Pelanggaran Umum)</a>
    <a href="#bab34">BAB 34: Sidang Internal (Mekanisme Vonis)</a>
    <a href="#bab35">BAB 35: Skorsing (Pemberhentian Sementara)</a>
    <a href="#bab36">BAB 36: Patsus Sel (Penahanan Internal)</a>
    <a href="#bab37">BAB 37: PTDH Pecat (Sanksi Tertinggi)</a>
    <a href="#bab38">BAB 38: Blacklist NRP (Pemutusan Akses)</a>
    <a href="#bab39">BAB 39: Denda Administratif (Sanksi Finansial)</a>
`;

// Masukkan ke dalam elemen HTML
document.getElementById('isi-hukum-otomatis').innerHTML = kodeHTML;
document.getElementById('sidebar-nav').innerHTML = menuHTML;