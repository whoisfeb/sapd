// Simpan semua HTML di dalam variabel ini
const kodeHTML = `
    <section id="bab1">
        <h2 class="bab-title">BAB 1: Hierarki Komando</h2>
        <div class="pasal">
            <span class="pasal-label">Pasal 1</span>
            <div class="ayat"><div class="ayat-n">1.</div><div>Setiap personil yang sengaja mengabaikan atau membangkang perintah operasional atasan langsung.</div></div>
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
            <div class="ayat"><div class="ayat-n">1.</div><div>Kegagalan melaksanakan perintah lisan dalam situasi kontak senjata (High Risk).</div></div>
            <div class="penalty-box">
                <span class="denda-text">SANKSI AYAT 1:</span>
                MIN: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari<br>
                MAX: Denda Rp 20.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 2 Hari
            </div>
        </div>
    </section>

    `;

// Perintah untuk memasukkan variabel kodeHTML ke dalam div di index.html
document.getElementById('isi-hukum-otomatis').innerHTML = kodeHTML;