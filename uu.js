// Bagian isi konten hukum
const kodeHTML = `
     <!-- BAB 1 -->
        <section id="bab1">
            <h2 class="bab-title">BAB 1: Hierarki Komando</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 1</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Setiap personil yang sengaja mengabaikan atau membangkang perintah operasional atasan langsung.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | Teguran<br>
                    MAX: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Har
                </div>
            </div>
        </section>

        <!-- BAB 2 -->
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

        <!-- BAB 3 -->
        <section id="bab3">
            <h2 class="bab-title">BAB 3: Kerahasiaan Negara</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 3</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Membocorkan taktik operasi atau frekuensi radio kepada pihak sipil/media.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 20.000 | Penjara 30 Bulan<br>
                    MAX: Denda Rp 25.000 | Penjara 60 Bulan + PTDH
                </div>
            </div>
        </section>

        <!-- BAB 4 -->
        <section id="bab4">
            <h2 class="bab-title">BAB 4: Demosi Jabatan</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 4</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Personil yang dijatuhi hukuman demosi wajib melepaskan jabatan struktural dalam waktu 1x24 jam.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    SANKSI: Pemotongan Gaji 30% selama 2 Minggu.
                </div>
            </div>
        </section>

        <!-- BAB 5 -->
        <section id="bab5">
            <h2 class="bab-title">BAB 5: Seragam & Atribut</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 5</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Penggunaan seragam yang tidak sesuai dengan divisinya, seperti yang sudah di atur di dalam <a href="https://ottibonynyo-mods.netlify.app/sop.html#sop-uniform" target="_blank">SOP Uniform/Seragam</a> dan <a href="https://discord.com/channels/1222064790617325609/1487704929551253605" target="_blank"> Handbook Uniform & Atribut/Aksesoris(toys)</a> .</div></div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Penggunaan atribut atau aksesoris (toys) yang tidak sesuai dengan  yang sudah di atur di dalam <a href="https://discord.com/channels/1222064790617325609/1487704929551253605" target="_blank"> Handbook Uniform & Atribut/Aksesoris(toys)</a> .</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1 dan ayat 2:</span>
                    MIN: Denda Rp 10.000 | Teguran<br>
                    MAX: Denda Rp 20.000 | SP 1
                </div>
            </div>
        </section>

        <!-- BAB 6 -->
        <section id="bab6">
            <h2 class="bab-title">BAB 6: kehadiran & Apel/Roll Call/8-1-5</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 6</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Tidak mengisi kehadiran selama 3 hari berturut-turut dan tanpa alasan atau konfirmasi yang jelas ke pihak divisi sumber daya manusia.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | SP 1<br>
                    MAX: Denda Rp 10.000 | Sp 1
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Tidak mengikuti Apep/Briefing/Roll Call/8-1-5 selama 3 hari berturut-turut dan tanpa alasan atau konfirmasi yang jelas .</div></div> 
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 5.000 <br>
                    MAX: Denda Rp 10.000 
                </div>
            </div>
        </section>

        <!-- BAB 7 -->
        <section id="bab7">
            <h2 class="bab-title">BAB 7: Etika Asmara</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 7</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menjalin hubungan asmara yang mengakibatkan lalai dalam menjalankan tugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 20.000 | Mutasi<br>
                    MAX: Denda Rp 25.000 | Penurunan pangkat + Mutasi
                </div>
            </div>
        </section>

        <!-- BAB 8 -->
        <section id="bab8">
            <h2 class="bab-title">BAB 8: Larangan Kriminal</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 8</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan tindak pidana penganiayaan baik pada saat bertugas atau tidak bertugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | Larangan patroli selama 1 hari + mutasi ke bagian pelayanan administrasi<br>
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Melakukan tindak pidana pencabutan/penanaman narkotika mentah (daun ganja/kanabis) baik pada saat bertugas atau tidak bertugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 25.000 | SP 1 + Penurunan Pangkat<br>
                    MAX: Denda Rp 35.000 | SP 2 + Penjara 35 Bulan<br>
                </div>
                <div class="ayat"><div class="ayat-n">3.</div><div>Melakukan tindak pidana pemrosesan/pembuatan narkotika mentah ke siap pakai (marijuana dan yang lainnya) baik pada saat bertugas atau tidak bertugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 3:</span>
                    MIN: Denda Rp 25.000 | SP 1 + Penurunan Pangkat<br>
                    MAX: Denda Rp 35.000 | SP 2 + Penjara 40 Bulan<br>
                </div>
                <div class="ayat"><div class="ayat-n">4.</div><div>Melakukan tindak pidana penjualan hewan yang dilindungi (penyu, hiu , dan yang lainnya) baik pada saat bertugas atau tidak bertugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 4:</span>
                    MIN: Denda Rp 20.000 | SP 1 + Penurunan Pangkat<br>
                    MAX: Denda Rp 25.000 | SP 2 + Penjara 10 Bulan<br>
                </div>
            </div>
        </section>

        <!-- BAB 9 -->
        <section id="bab9">
            <h2 class="bab-title">BAB 9: Media Sosial</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 9</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menyebarkan konten asusila atau ujaran kebencian menggunakan identitas polisi.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | SP 1<br>
                    MAX: Denda Rp 15.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 10 -->
        <section id="bab10">
            <h2 class="bab-title">BAB 10: Anti-Korupsi</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 10</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menerima gratifikasi atau memeras warga sipil (Pungli).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000.000 | Penjara 24 Bulan<br>
                    MAX: Denda Rp 500.000.000 | Penjara Seumur Hidup + PTDH
                </div>
            </div>
        </section>

        <!-- BAB 11 -->
        <section id="bab11">
            <h2 class="bab-title">BAB 11: Unit, Callsign & Sirine</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 11</span>
                <span class="pasal-label">Unit atau Kendaraan Dinas</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Peggunaan kendaraan dinas yang tidak sesuai dengan divisi atau tidak sesuai dengan sop.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari<br>
                    MAX: Denda Rp 10.000 | SP 1 + Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Penyalahgunaan kendaraan dinas untuk kepentingan pribadi tanpa adanya laporan yang jelas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 2.000 | Teguran<br>
                    MAX: Denda Rp 4.000 | Teguran
                </div>
                <div class="ayat"><div class="ayat-n">3.</div><div>Penyalahgunaan kendaraan dinas untuk tindakan kriminal baik dalam status bertugas atau tidak bertugas.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 3:</span>
                    MIN: Denda Rp 10.000 | SP 1 + Penurunan Pangkat<br>
                    MAX: Denda Rp 20.000 | PTDH
                </div>
                <span class="pasal-label">Pasal 12</span>
                <span class="pasal-label">Callsign</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Tidak menggunakan atau tidak memasang callsign pada kendaraan dinas saat sedang berpatroli atau sedang menggunakan unit.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | Teguran<br>
                    MAX: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Penggunaan callsign yang tidak sesuai dengan divisi atau menggunakan callsign yang bukan miliknya.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 5.000 | Teguran<br>
                    MAX: Denda Rp 10.000 | Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari
                </div>
                <span class="pasal-label">Pasal 13</span>
                <span class="pasal-label">Sirine</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Penyalahgunaan lampu isyarat dan sirine untuk kepentingan pribadi/non-darurat.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 2.000 | Teguran<br>
                    MAX: Denda Rp 4.000 | Teguran
                </div>
            </div>
        </section>

        <!-- BAB 12 -->
        <section id="bab12">
            <h2 class="bab-title">BAB 12: Penangkapan Dasar</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 14</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan penangkapan yang tidak sesuai dengan prosedur.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 13 -->
        <section id="bab13">
            <h2 class="bab-title">BAB 13: Penggunaan Borgol</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 13</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Sengaja melakukan penyiksaan fisik menggunakan borgol pada tersangka.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | Teguran<br>
                    MAX: Denda Rp 15.000 | SP 1
                </div>
            </div>
        </section>

        <!-- BAB 14 -->
        <section id="bab14">
            <h2 class="bab-title">BAB 14: Penggunaan Kekuatan (Less-Lethal Force)</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 14</span>
                <span class="pasal-label">Penggunaan Taser</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Penggunaan senjata kejut (Taser) pada subjek yang sudah menyerah.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penjara 10 Bulan
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Penyalahgunaan Taser (Abuse Taser) baik kepada orang lain ataupun rekan kerja (memain mainkan taser).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 15.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
            <div class="pasal">
                <span class="pasal-label">Pasal 15</span>
                <span class="pasal-label">Penggunaan Beanbag</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Penggunaan peluru karet (beanbag) pada subjek yang sudah menyerah.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 20.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penjara 10 Bulan
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Penyalahgunaan peluru karet (Abuse Beanbag) baik kepada orang lain ataupun rekan kerja (memain mainkan beanbag).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 20.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
            <div class="pasal">
                <span class="pasal-label">Pasal 16</span>
                <span class="pasal-label">Tackle</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan tackle kepada orang lain ataupun rekan kerja dengan tujuan untuk bermain main atau jahil.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | SP 1<br>
                    MAX: Denda Rp 15.000 | SP 1 + Larangan Patroli + Wajib Jaga Pelayanan Selama 1 Hari
                </div>
            </div>
        </section>

        <!-- BAB 15 -->
        <section id="bab15">
            <h2 class="bab-title">BAB 15: Penggunaan kekuatan Mematikan (Deadly Force)</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 17</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Kelalaian dalam menyimpan senjata api yang berakibat senjata hilang atau disalahgunakan orang lain.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 20.000 | Penjara 10 Bulan<br>
                    MAX: Denda Rp 25.000 | Penjara 15 Bulan + Penurunan Pangkat
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Menggunakan senjata api untuk melumpuhkan orang lain tanpa alasan yang jelas dan tanpa perintah komandan.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 30.000 | Penjara 20 Bulan<br>
                    MAX: Denda Rp 60.000 | Penjara 40 Bulan + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 16 -->
        <section id="bab16">
            <h2 class="bab-title">BAB 16: Prosedur Interogasi</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 18</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan interogasi yang tidak sesuai dengan prosedur.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 20.000 | SP 1<br>
                    MAX: Denda Rp 35.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 17 -->
        <section id="bab17">
            <h2 class="bab-title">BAB 17: Barang Bukti</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 19</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Sengaja menghilangkan, merusak, atau menukar barang bukti asli.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 30.000 | Penjara 10 Bulan<br>
                    MAX: Denda Rp 40.000 | Penjara 15 Bulan + PTDH
                </div>
            </div>
        </section>

        <!-- BAB 18 -->
        <section id="bab18">
            <h2 class="bab-title">BAB 18: Olah TKP</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 20</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Membiarkan TKP terkontaminasi atau sengaja merusak garis polisi/parimeter/pembatas yang telah di pasang.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | Teguran<br>
                    MAX: Denda Rp 15.000 | SP 1
                </div>
            </div>
        </section>

        <!-- BAB 19 -->
        <section id="bab19">
            <h2 class="bab-title">BAB 19: Penyadapan Radio</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 21</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menggunakan alat penyadap instansi untuk memantau privasi personil lain tanpa izin.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | SP 1<br>
                    MAX: Denda Rp 10.000 | SP 1 + Larangan Patroli Selama 1 Hari + Wajib menjaga pelayanan selama 1 Hari
                </div>
            </div>
        </section>

        <!-- BAB 20 -->
        <section id="bab20">
            <h2 class="bab-title">BAB 20: Dana Informan</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 22</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Korupsi atau laporan fiktif terkait biaya operasional informan lapangan.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 50.000 | Penjara 36 Bulan<br>
                    MAX: Denda Rp 100.000 | Penjara 60 Bulan + PTDH
                </div>
            </div>
        </section>

        <!-- BAB 21 -->
        <section id="bab21">
            <h2 class="bab-title">BAB 21: Penanganan Massa</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 23</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan tindakan represif tanpa perintah Komandan Satuan (Dansat).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 25.000 | Penjara 6 Bulan<br>
                    MAX: Denda Rp 50.000 | Penjara 12 Bulan
                </div>
            </div>
        </section>

        <!-- BAB 22 -->
        <section id="bab22">
            <h2 class="bab-title">BAB 22: Gas Air Mata</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 24</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menembakkan gas air mata ke area pemukiman padat tanpa urgensi tinggi.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | Teguran<br>
                    MAX: Denda Rp 15.000 | SP 1
                </div>
            </div>
        </section>

        <!-- BAB 23 -->
        <section id="bab23">
            <h2 class="bab-title">BAB 23: Tilang Manual</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 25</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melakukan Penilangan tanpa melalui invoice.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 25.000 | SP 1<br>
                    MAX: Denda Rp 50.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 24 -->
        <section id="bab24">
            <h2 class="bab-title">BAB 24: Reserse Kriminal</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 26</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Sengaja merekayasa alat bukti demi menaikkan status tersangka (Kriminalisasi).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | SP 1<br>
                    MAX: Denda Rp 30.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 25 -->
        <section id="bab25">
            <h2 class="bab-title">BAB 25: Reserse Narkotika</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 27</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Positif mengonsumsi narkotika hasil sitaan atau distribusi ilegal.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 50.000 | SP 1 + Penjara 20 Bulant<br>
                    MAX: Denda Rp 100.000 | PTDH
                </div>
            </div>
        </section>

        <!-- BAB 26 -->
        <section id="bab26">
            <h2 class="bab-title">BAB 26: Reserse Cyber</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 28</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menggunakan otoritas akses database negara untuk kepentingan pemerasan.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 50.000 | SP 1<br>
                    MAX: Denda Rp 100.000 | Penjara 40 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 27 -->
        <section id="bab27">
            <h2 class="bab-title">BAB 27: Persenjataan</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 29</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Membawa senjata api ke tempat hiburan malam atau lokasi yang dilarang protokol.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | SP 1<br>
                    MAX: Denda Rp 20.000 | SP 1 + Penurunan Pangkat
                </div>
            </div>
        </section>

        <!-- BAB 28 -->
        <section id="bab28">
            <h2 class="bab-title">BAB 28: Perawatan Senpi</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 30</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Sengaja tidak membersihkan senjata hingga terjadi kerusakan fungsi teknis.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 1.000.000 | Penjara 3 Hari<br>
                    MAX: Denda Rp 5.000.000 | Penjara 14 Hari
                </div>
            </div>
        </section>

        <!-- BAB 29 -->
        <section id="bab29">
            <h2 class="bab-title">BAB 29: Internak Affairs Division</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 31</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Menolak diperiksa oleh anggota Internal Affairs Division dalam rangka investigasi internal.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | Penjara 14 Bulan<br>
                    MAX: Denda Rp 20.000 | Penjara 28 Bulan
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Melakukan perlawanan fisik saat akan ditertibkan oleh Internal Affairs Division.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp 15.000 | Penjara 15 Bulan<br>
                    MAX: Denda Rp 30.000 | Penjara 30 Bulan
                </div>
            </div>
        </section>


        <!-- BAB 30 -->
        <section id="bab30">
            <h2 class="bab-title">BAB 30: Kekayaan Personil</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 32</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Tidak mampu menjelaskan asal-usul harta kekayaan yang melebihi pendapatan logis (Money Laundering).</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | Teguran<br>
                    MAX: Denda Rp 20.000 | Teguran
                </div>
            </div>
        </section>

        <!-- BAB 31 -->
        <section id="bab31">
            <h2 class="bab-title">BAB 31: Kode Etik Profesi</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 35</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Mencemarkan kehormatan kepolisian melalui perilaku menyimpang di publik.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 25.000 | Penjara 20 Bulan<br>
                    MAX: Denda Rp 50.000 | Penjara 40 Bulan
                </div>
            </div>
        </section>

        <!-- BAB 32 -->
        <section id="bab32">
            <h2 class="bab-title">BAB 32: Sidang Internal</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 36</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Memberikan keterangan palsu di bawah sumpah saat sidang komisi kode etik.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 10.000 | - <br>
                    MAX: Denda Rp 15.000 | -
                </div>
                <div class="ayat"><div class="ayat-n">2.</div><div>Tidak menghadiri persidangan internal dengan alasan apapun .</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 2:</span>
                    MIN: Denda Rp Maksimal | Hukuman Maksimal sesuai pasal yang di langgar<br>
                    MAX: Denda Rp Maksimal | Hukuman Maksimal sesuai pasal yang di langgar
                </div>
            </div>
        </section>

        <!-- BAB 33 -->
        <section id="bab33">
            <h2 class="bab-title">BAB 33: Skorsing</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 37</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Masuk ke area dinas tanpa izin tertulis selama masa skorsing aktif.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 5.000 | Teguran<br>
                    MAX: Denda Rp 10.000 | Teguran
                </div>
            </div>
        </section>

        <!-- BAB 34 -->
        <section id="bab34">
            <h2 class="bab-title">BAB 34: Patsus Sel</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 38</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Melarikan diri atau mencoba merusak fasilitas sel penempatan khusus.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000| Penjara 6 Bulan<br>
                    MAX: Denda Rp 50.000 | Penjara 12 Bulan
                </div>
            </div>
        </section>

        <!-- BAB 35 -->
        <section id="bab35">
            <h2 class="bab-title">BAB 35: PTDH Pecat</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 39</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Personil yang di-PTDH wajib mengembalikan seluruh inventaris negara dalam 1x24 jam.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 15.000 | Penjara 60 Bulan (Jika inventaris digelapkan/tidak kembali).
                </div>
            </div>
        </section>

        <!-- BAB 36 -->
        <section id="bab36">
            <h2 class="bab-title">BAB 36: Blacklist NRP</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 40</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Mencoba mendaftar kembali atau masuk ke lingkungan militer/polisi dengan NRP palsu.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp 100.000 | Penjara 30 Bulan
                </div>
            </div>
        </section>

        <!-- BAB 37 -->
        <section id="bab37">
            <h2 class="bab-title">BAB 37: Denda Administratif</h2>
            <div class="pasal">
                <span class="pasal-label">Pasal 41</span>
                <div class="ayat"><div class="ayat-n">1.</div><div>Kelalaian membayar denda administratif yang telah dijatuhkan secara inkrah.</div></div>
                <div class="penalty-box">
                    <span class="denda-text">SANKSI AYAT 1:</span>
                    MIN: Denda Rp - | Penyitaan aset pribadi senilai denda + bunga 10%.
                </div>
            </div>
        </section>

        <div style="margin-top: 100px; text-align: right; border-top: 1px solid #000; padding-top: 20px;">
            <p>Ditetapkan di: San Andreas Police Departement</p>
            <p style="margin-bottom: 50px;">Pada Tanggal: 07 April 2026</p>
            <strong>JENDERAL POLISI</strong>
        </div>
    

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
    <a href="#bab29">BAB 29: Internal Affairs Division (Pengawasan Internal)</a>
    <a href="#bab30">BAB 30: Kekayaan Personil (Laporan Palsu/TPPU)</a>
    <a href="#bab31">BAB 32: Kode Etik Profesi (Pelanggaran Umum)</a>
    <a href="#bab32">BAB 32: Sidang Internal (Mekanisme Vonis)</a>
    <a href="#bab33">BAB 33: Skorsing (Pemberhentian Sementara)</a>
    <a href="#bab34">BAB 34: Patsus Sel (Penahanan Internal)</a>
    <a href="#bab35">BAB 35: PTDH Pecat (Sanksi Tertinggi)</a>
    <a href="#bab36">BAB 36: Blacklist NRP (Pemutusan Akses)</a>
    <a href="#bab37">BAB 37: Denda Administratif (Sanksi Finansial)</a>
`;

// Masukkan ke dalam elemen HTML
document.getElementById('isi-hukum-otomatis').innerHTML = kodeHTML;
document.getElementById('sidebar-nav').innerHTML = menuHTML;