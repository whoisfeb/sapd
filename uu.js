const kodeHTML = `
    <section id="bab1">
        <h2 class="bab-title">BAB 1: Hierarki Komando</h2>
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

    <section id="bab2">
        <h2 class="bab-title">BAB 2: Perintah Lisan</h2>
        <div class="pasal">
            <span class="pasal-label">Pasal 2</span>
            <div class="ayat">
                <div class="ayat-n">1.</div>
                <div>Kegagalan melaksanakan perintah lisan dalam situasi kontak senjata (High Risk).</div>
            </div>
            <div class="penalty-box">
                <span class="denda-text">SANKSI AYAT 1:</span>
                MIN: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari<br>
                MAX: Denda Rp 20.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 2 Hari
            </div>
        </div>
    </section>

    <section id="bab5">
        <h2 class="bab-title">BAB 5: Seragam & Atribut</h2>
        <div class="pasal">
            <span class="pasal-label">Pasal 5</span>
            <div class="ayat">
                <div class="ayat-n">1.</div>
                <div>Penggunaan seragam yang tidak sesuai dengan divisinya, sesuai <a href="#">SOP Uniform</a>.</div>
            </div>
            <div class="ayat">
                <div class="ayat-n">2.</div>
                <div>Penggunaan atribut atau aksesoris (toys) yang tidak sesuai aturan.</div>
            </div>
            <div class="penalty-box">
                <span class="denda-text">SANKSI AYAT 1 & 2:</span>
                MIN: Denda Rp 10.000 | Teguran<br>
                MAX: Denda Rp 20.000 | SP 1
            </div>
        </div>
    </section>
`;

// Link Sidebar otomatis
const menuHTML = `
    <h2>INDEKS ATURAN</h2>
    <a href="#bab1">BAB 1: Hierarki Komando</a>
    <a href="#bab2">BAB 2: Perintah Lisan</a>
    <a href="#bab3">BAB 3: Kerahasiaan Negara</a>
    <a href="#bab4">BAB 4: Demosi Jabatan</a>
    <a href="#bab5">BAB 5: Seragam & Atribut</a>
    <a href="#bab6">BAB 6: Kehadiran & Apel</a>
    <a href="#bab7">BAB 7: Etika Asmara</a>
`;

// Tempelkan ke HTML
document.getElementById('isi-hukum-otomatis').innerHTML = kodeHTML;
document.getElementById('sidebar-nav').innerHTML = menuHTML;