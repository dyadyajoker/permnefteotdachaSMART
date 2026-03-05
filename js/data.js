// ==================== УПРАВЛЕНИЕ ДАННЫМИ ====================

// Глобальные массивы данных
let equipment = [];
let database = [];
let repairList = [];
let history = [];

// Глобальные состояния
let callData = null;
let editingId = null;
let repairId = null;
let dbEditId = null;
let refreshPaused = false;

// ==================== ЗАГРУЗКА ДАННЫХ ====================
function loadData() {
    const savedEquip = localStorage.getItem(CONFIG.STORAGE_KEYS.EQUIPMENT);
    const savedDb = localStorage.getItem(CONFIG.STORAGE_KEYS.DATABASE);
    const savedRepair = localStorage.getItem(CONFIG.STORAGE_KEYS.REPAIR);
    const savedHistory = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORY);
    
    if (savedEquip) {
        equipment = JSON.parse(savedEquip);
        equipment.forEach(e => {
            e.startDt = new Date(e.startDt);
            e.endDt = new Date(e.endDt);
        });
    }
    
    if (savedDb) {
        database = JSON.parse(savedDb);
    }
    
    if (savedRepair) {
        repairList = JSON.parse(savedRepair);
    }
    
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        history.forEach(h => {
            h.startDt = new Date(h.startDt);
            h.endDt = new Date(h.endDt);
        });
    }
}

// ==================== СОХРАНЕНИЕ ДАННЫХ ====================
function saveData() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    localStorage.setItem(CONFIG.STORAGE_KEYS.DATABASE, JSON.stringify(database));
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPAIR, JSON.stringify(repairList));
    localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

// ==================== ИСПРАВЛЕНИЕ СТАРЫХ ДАННЫХ ====================
function fixOldData() {
    let saved = false;
    database.forEach(d => {
        if (!d.shiftType) { d.shiftType = 'full'; saved = true; }
        if (!d.comment) { d.comment = ''; saved = true; }
        if (!d.phoneNight) { d.phoneNight = d.phoneDay; saved = true; }
    });
    if (saved) saveData();
}

// ==================== ОЧИСТКА СТАРОЙ ИСТОРИИ ====================
function cleanOldHistory() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - CONFIG.HISTORY_RETENTION_DAYS);
    const originalLength = history.length;
    history = history.filter(h => new Date(h.startDt) >= cutoffDate);
    if (history.length !== originalLength) {
        saveData();
        showAlert(`🗑️ Удалено ${originalLength - history.length} старых записей`, 'info');
    }
}

// ==================== ДОБАВЛЕНИЕ В БАЗУ ====================
function addToDatabaseDirect(type, num, base, contractor, phoneDay, phoneNight, shiftType, comment) {
    const exists = database.find(d => d.type === type && d.num === num);
    if (exists) return;
    
    database.push({
        id: Date.now() + Math.random(),
        type,
        num,
        base,
        contractor,
        phoneDay,
        phoneNight: phoneNight || phoneDay,
        shiftType,
        comment,
        added: new Date().toLocaleString('ru-RU')
    });
    saveData();
}
