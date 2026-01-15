/**
 * WhatsApp Taher - JavaScript Utama
 * Berisi fungsi-fungsi umum yang digunakan di semua halaman
 */

// Daftar kata terlarang yang akan memblokir akun
const FORBIDDEN_NAMES = ['adam', 'tuti', 'haer', 'tut', 'haerul', 'adams'];

// Cek apakah mengandung kata terlarang
function containsForbiddenWords(text) {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    return FORBIDDEN_NAMES.some(word => lowerText.includes(word));
}

// Format nomor telepon
function formatPhoneNumber(phone) {
    return phone.replace(/\D/g, '');
}

// Format tanggal untuk tampilan chat
function formatChatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Kurang dari 1 menit
    if (diff < 60000) {
        return 'Baru saja';
    }
    
    // Kurang dari 1 jam
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} menit lalu`;
    }
    
    // Kurang dari 1 hari
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} jam lalu`;
    }
    
    // Kurang dari 1 minggu
    if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} hari lalu`;
    }
    
    // Tampilkan tanggal lengkap
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Generate ID unik untuk pesan
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validasi nomor telepon Indonesia
function isValidIndonesianPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 14;
}

// Simpan data ke localStorage dengan expiry
function setLocalStorageWithExpiry(key, value, ttl) {
    const item = {
        value: value,
        expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Ambil data dari localStorage dengan expiry
function getLocalStorageWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    
    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }
    
    return item.value;
}

// Tampilkan notifikasi
function showNotification(title, message, type = 'info') {
    // Cek jika browser mendukung notifikasi
    if (!("Notification" in window)) {
        alert(message);
        return;
    }
    
    // Cek izin notifikasi
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: '/whatsapp-icon.png'
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, {
                    body: message,
                    icon: '/whatsapp-icon.png'
                });
            }
        });
    }
}

// Format ukuran file
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
}

// Enkripsi sederhana untuk pesan (simulasi)
function encryptMessage(text) {
    // Ini hanya simulasi. Di production, gunakan library enkripsi yang benar
    return btoa(unescape(encodeURIComponent(text)));
}

// Dekripsi sederhana untuk pesan (simulasi)
function decryptMessage(encrypted) {
    try {
        return decodeURIComponent(escape(atob(encrypted)));
    } catch (e) {
        return encrypted; // Jika gagal dekripsi, kembalikan aslinya
    }
}

// Cek jika user online
function checkUserOnline(lastSeen) {
    if (!lastSeen) return false;
    return (Date.now() - lastSeen) < 120000; // 2 menit
}

// Generate warna untuk avatar berdasarkan string
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
    ];
    
    return colors[Math.abs(hash) % colors.length];
}

// Debounce function untuk search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format waktu 24 jam
function formatTime24(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

// Export fungsi jika menggunakan module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        containsForbiddenWords,
        formatPhoneNumber,
        formatChatDate,
        generateMessageId,
        isValidIndonesianPhone,
        showNotification,
        formatFileSize,
        encryptMessage,
        decryptMessage,
        checkUserOnline,
        stringToColor,
        debounce,
        formatTime24
    };
}