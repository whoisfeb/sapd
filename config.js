// File: config.js

// PENTING: Gunakan window. agar variabel bisa diakses oleh file HTML lain
window.CONFIG = {
    DAFTAR_GAJI: {
        "COMMISSIONER": 100000,
        "DEPUTY COMMISSIONER": 90000,
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

// Tambahkan variabel ini untuk memperbaiki error "RANK_ORDER is not defined"
window.RANK_ORDER = {
    "COMMISSIONER": 1,
    "DEPUTY COMMISSIONER": 2,
    "CHIEF OF POLICE": 3,
    "ASSISTANT CHIEF OF POLICE": 4,
    "DEPUTY CHIEF OF POLICE": 5,
    "COMMANDER": 6,
    "CAPTAIN III": 7,
    "CAPTAIN II": 8,
    "CAPTAIN I": 9,
    "LIEUTENANT III": 10,
    "LIEUTENANT II": 11,
    "LIEUTENANT I": 12,
    "SERGEANT III": 13,
    "SERGEANT II": 14,
    "SERGEANT I": 15,
    "DETECTIVE III": 16,
    "DETECTIVE II": 17,
    "DETECTIVE I": 18,
    "POLICE OFFICER III": 19,
    "POLICE OFFICER II": 20,
    "POLICE OFFICER I": 21,
    "CADET": 22
};

window.hitungGajiMember = function(pangkat, jumlahHariHadir) {
    const rankCek = pangkat ? pangkat.toUpperCase().trim() : "UNKNOWN";
    const gajiPokok = window.CONFIG.DAFTAR_GAJI[rankCek] || 0;
    
    let hadirValid = Math.min(jumlahHariHadir, window.CONFIG.TARGET_HADIR);
    let totalGaji = 0;
    let totalPotongan = 0;
    let alpa = window.CONFIG.TARGET_HADIR - hadirValid;

    if (hadirValid >= window.CONFIG.TARGET_FULL_GAJI) {
        totalGaji = gajiPokok;
    } else {
        const kekurangan = window.CONFIG.TARGET_FULL_GAJI - hadirValid;
        const potonganPerHari = gajiPokok / window.CONFIG.TARGET_FULL_GAJI;
        totalPotongan = kekurangan * potonganPerHari;
        totalGaji = gajiPokok - totalPotongan;
    }

    if (hadirValid >= window.CONFIG.TARGET_HADIR) {
        totalGaji += window.CONFIG.BONUS_RAJIN;
    }

    return {
        gajiPokok,
        alpa,
        totalPotongan: Math.floor(totalPotongan),
        gajiAkhir: Math.floor(totalGaji < 0 ? 0 : totalGaji)
    };
}
