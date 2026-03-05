// ==================== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ ====================

const CONFIG = {
    // Ключи localStorage
    STORAGE_KEYS: {
        EQUIPMENT: 'equipment_v8',
        DATABASE: 'equipment_db_v8',
        REPAIR: 'equipment_repair_v8',
        HISTORY: 'equipment_history_v8'
    },
    
    // Время смен
    SHIFT: {
        MORNING_START: 7,
        MORNING_END: 8,
        EVENING_START: 19,
        EVENING_END: 20,
        DAY_START: 8,
        DAY_END: 20
    },
    
    // Настройки
    HISTORY_RETENTION_DAYS: 90,
    REFRESH_INTERVAL: 1000,
    PAUSE_TIMEOUT: 5000
};

// Названия типов техники
const TYPE_NAMES = {
    'avtokran': 'Автокран',
    'polupricep': 'Полуприцеп',
    'tyagach': 'Тягач',
    'ppu': 'ППУ',
    'ca320': 'ЦА-320',
    'akn': 'АКН',
    'amkador': 'Амкодор'
};

// Названия подрядчиков
const CONTRACTOR_NAMES = {
    'ours': 'Наша',
    'pno': 'ПНО',
    'fdv': 'ФДВ',
    'onr': 'ОНР',
    'eprs': 'ЕПРС'
};

// Режимы работы
const SHIFT_LABELS = {
    'full': 'День+Ночь',
    'day': 'Только день',
    'night': 'Только ночь',
    'repair': 'В ремонте'
};

// Базы
const BASES = ['БСО-1', 'БСО-2', 'КП-135'];
