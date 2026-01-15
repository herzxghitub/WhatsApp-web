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

// Fungsi untuk grup chat
async function createGroupChat(groupName, members, groupPhoto = null) {
    const groupId = 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2);
    
    const groupData = {
        groupId: groupId,
        groupName: groupName,
        groupPhoto: groupPhoto,
        createdBy: currentUserId,
        createdAt: Date.now(),
        members: members,
        lastActive: Date.now()
    };
    
    // Simpan ke database
    await database.ref('whatsapp_groups').child(groupId).set(groupData);
    
    // Tambahkan ke setiap anggota
    members.forEach(memberId => {
        database.ref('whatsapp_user_groups').child(memberId).child(groupId).set({
            joinedAt: Date.now()
        });
    });
    
    return groupId;
}

// Fungsi untuk kirim pesan grup
function sendGroupMessage(groupId, text, senderId) {
    const messageId = generateMessageId();
    
    const messageData = {
        messageId: messageId,
        groupId: groupId,
        sender: senderId,
        text: text,
        timestamp: Date.now(),
        type: 'text',
        status: 'sent'
    };
    
    database.ref('whatsapp_group_messages').child(groupId).push(messageData);
    
    // Update last active grup
    database.ref('whatsapp_groups').child(groupId).update({
        lastActive: Date.now()
    });
}

// Fungsi untuk upload status
async function uploadStatus(content, type = 'text', mediaFile = null) {
    const statusId = 'status_' + Date.now() + '_' + Math.random().toString(36).substr(2);
    const userId = currentUserId;
    
    let statusData = {
        statusId: statusId,
        userId: userId,
        type: type,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 jam
        views: {}
    };
    
    if (type === 'text') {
        statusData.text = content;
    } else {
        // Upload media ke storage
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`status_media/${Date.now()}_${mediaFile.name}`);
        
        await fileRef.put(mediaFile);
        const mediaURL = await fileRef.getDownloadURL();
        
        statusData.mediaURL = mediaURL;
        statusData.mediaType = mediaFile.type;
        statusData.fileName = mediaFile.name;
        statusData.fileSize = mediaFile.size;
    }
    
    // Simpan ke database
    await database.ref('whatsapp_status').child(statusId).set(statusData);
    
    return statusId;
}

// Fungsi untuk update foto profil yang bisa dilihat semua orang
async function updateProfileImage(userId, imageFile) {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(`profile_images/${userId}_${Date.now()}`);
    
    // Upload gambar
    await fileRef.put(imageFile);
    const downloadURL = await fileRef.getDownloadURL();
    
    // Update di database
    await database.ref('whatsapp_users').child(userId).update({
        profileImage: downloadURL,
        profileUpdated: Date.now()
    });
    
    return downloadURL;
}

// Fungsi untuk load grup chat
function loadGroupChats(userId) {
    return new Promise((resolve) => {
        database.ref('whatsapp_user_groups').child(userId).on('value', snapshot => {
            const groups = snapshot.val();
            resolve(groups || {});
        });
    });
}

// Fungsi untuk load status terbaru
function loadRecentStatus(userId) {
    return new Promise((resolve) => {
        // Load status dari kontak
        database.ref('whatsapp_contacts').child(userId).once('value', contactsSnapshot => {
            const contacts = contactsSnapshot.val();
            const statusPromises = [];
            
            if (contacts) {
                Object.keys(contacts).forEach(contactId => {
                    const promise = database.ref('whatsapp_status')
                        .orderByChild('userId')
                        .equalTo(contactId)
                        .limitToLast(1)
                        .once('value');
                    statusPromises.push(promise);
                });
            }
            
            // Load status sendiri juga
            statusPromises.push(
                database.ref('whatsapp_status')
                    .orderByChild('userId')
                    .equalTo(userId)
                    .limitToLast(1)
                    .once('value')
            );
            
            Promise.all(statusPromises).then(results => {
                const allStatuses = [];
                results.forEach(result => {
                    const statuses = result.val();
                    if (statuses) {
                        // Filter hanya yang belum expired
                        Object.values(statuses).forEach(status => {
                            if (!isStatusExpired(status)) {
                                allStatuses.push(status);
                            }
                        });
                    }
                });
                
                // Urutkan berdasarkan waktu
                allStatuses.sort((a, b) => b.createdAt - a.createdAt);
                resolve(allStatuses);
            });
        });
    });
}

// Cek apakah status sudah expired
function isStatusExpired(status) {
    if (!status.expiresAt) return true;
    return Date.now() > status.expiresAt;
}

// Format waktu status
function formatStatusTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
    return `${Math.floor(diff / 86400000)} hari lalu`;
}

// Update status online user
function updateUserPresence(userId, isOnline = true) {
    const updates = {
        online: isOnline,
        lastSeen: Date.now()
    };
    
    database.ref('whatsapp_users').child(userId).update(updates);
}

// Handle page visibility untuk update status online
document.addEventListener('visibilitychange', function() {
    const userId = currentUserId;
    if (!userId) return;
    
    if (document.visibilityState === 'visible') {
        updateUserPresence(userId, true);
    } else {
        updateUserPresence(userId, false);
    }
});

// Handle sebelum page unload
window.addEventListener('beforeunload', function() {
    const userId = currentUserId;
    if (userId) {
        updateUserPresence(userId, false);
    }
});