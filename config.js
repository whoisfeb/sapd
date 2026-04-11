// File: config.js
const CONFIG = {
    DAFTAR_GAJI: {
        "CHIEF OF POLICE": 80000,
        "ASSISTANT CHIEF OF POLICE": 76000,
        "DEPUTY CHIEF OF POLICE": 72000,
        "COMMANDER": 68000,
        "CAPTAIN III": 64000,
        "CAPTAIN II": 60000,
        "CAPTAIN I": 56000,
        "LIEUTENANT III": 52000,
        "LIEUTENANT II": 48000,
        "LIEUTENANT I": 45000,
        "SERGEANT III": 42000,
        "SERGEANT II": 40000,
        "SERGEANT I": 38000,
        "DETECTIVE III": 36000,
        "DETECTIVE II": 34000,
        "DETECTIVE I": 32000,
        "POLICE OFFICER III": 30000,
        "POLICE OFFICER II": 28000,
        "POLICE OFFICER I": 26000,
        "CADET": 24000,
        "UNKNOWN": 0
    },
    TARGET_HADIR: 6,
    TARGET_FULL_GAJI: 5,
    BONUS_RAJIN: 10000 
};

function hitungGajiMember(pangkat, jumlahHariHadir) {
    const rankCek = pangkat ? pangkat.toUpperCase().trim() : "UNKNOWN";
    const gajiPokok = CONFIG.DAFTAR_GAJI[rankCek] || 0;
    
    // PENGAMAN GLOBAL: Maksimal hari hadir valid adalah 6 (Senin-Sabtu)
    // Ini mencegah error jika input data mentah lebih dari 6
    let hadirValid = Math.min(jumlahHariHadir, CONFIG.TARGET_HADIR);

    let totalGaji = 0;
    let totalPotongan = 0;
    let alpa = CONFIG.TARGET_HADIR - hadirValid;

    if (hadirValid >= CONFIG.TARGET_FULL_GAJI) {
        totalGaji = gajiPokok;
    } else {
        const kekurangan = CONFIG.TARGET_FULL_GAJI - hadirValid;
        const potonganPerHari = gajiPokok / CONFIG.TARGET_FULL_GAJI;
        totalPotongan = kekurangan * potonganPerHari;
        totalGaji = gajiPokok - totalPotongan;
    }

    if (hadirValid >= CONFIG.TARGET_HADIR) {
        totalGaji += CONFIG.BONUS_RAJIN;
    }

    return {
        gajiPokok,
        alpa,
        totalPotongan: Math.floor(totalPotongan),
        gajiAkhir: Math.floor(totalGaji < 0 ? 0 : totalGaji)
    };
}
