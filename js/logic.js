// ==================== БИЗНЕС-ЛОГИКА ====================

// ==================== ОПРЕДЕЛЕНИЕ СМЕНЫ ====================
function getCurrentShift() {
    const hour = new Date().getHours();
    if (hour >= CONFIG.SHIFT.DAY_START && hour < CONFIG.SHIFT.DAY_END) {
        return 'day';
    }
    return 'night';
}

function getShiftLabel(shift) {
    return shift === 'day' ? '☀️ Дневная' : '🌙 Ночная';
}

// ==================== ТЕЛЕФОН ВОДИТЕЛЯ ====================
function getDriverPhone(data, shift) {
    if (shift === 'night') {
        return data.phoneNight || data.phoneDay;
    }
    return data.phoneDay || data.phoneNight;
}

// ==================== ДОСТУПНОСТЬ ТЕХНИКИ ====================
function isEquipmentAvailable(shiftType) {
    if (shiftType === 'repair') return false;
    const hour = new Date().getHours();
    if (shiftType === 'day') return hour >= 8 && hour < 20;
    if (shiftType === 'night') return hour >= 20 || hour < 8;
    return true;
}

function getShiftAvailabilityLabel(shiftType) {
    if (shiftType === 'repair') return '🔧 В ремонте';
    const hour = new Date().getHours();
    if (shiftType === 'day') {
        return hour >= 8 && hour < 20 ? '☀️ Доступно' : '🌙 Недоступно';
    } else if (shiftType === 'night') {
        return hour >= 20 || hour < 8 ? '🌙 Доступно' : '☀️ Недоступно';
    }
    return '🕐 Всегда';
}

// ==================== ПЕРЕСМЕНКА ====================
function isShiftChangeWindow(hour) {
    if (hour >= CONFIG.SHIFT.MORNING_START && hour < CONFIG.SHIFT.MORNING_END) return true;
    if (hour >= CONFIG.SHIFT.EVENING_START && hour < CONFIG.SHIFT.EVENING_END) return true;
    return false;
}

function getShiftChangeLocation(startDt, endDt, defaultLocation) {
    const endHour = endDt.getHours();
    const endMinutes = endDt.getMinutes();
    const endTimeDecimal = endHour + (endMinutes / 60);
    
    if (endTimeDecimal < 7) {
        return { location: 'base', text: '🏠 На базе', nextShift: 'дневной' };
    }
    if (isShiftChangeWindow(endHour)) {
        return { 
            location: 'site', 
            text: '📍 На кусту', 
            nextShift: endHour >= 19 ? 'ночной' : 'дневной' 
        };
    }
    if (endTimeDecimal >= 8 && endTimeDecimal < 19) {
        return { location: 'base', text: '🏠 На базе', nextShift: 'дневной' };
    }
    if (endTimeDecimal >= 20) {
        return { location: 'base', text: '🏠 На базе', nextShift: 'ночной' };
    }
    
    return { location: defaultLocation || 'base', text: '🏠 На базе', nextShift: 'дневной' };
}

// ==================== АРХИВИРОВАНИЕ ====================
function archiveAssignment(assignment, reason) {
    const archiveRecord = {
        ...assignment,
        archivedAt: new Date().toISOString(),
        completed: true,
        completionReason: reason || 'Завершено'
    };
    archiveRecord.startDt = assignment.startDt.toISOString();
    archiveRecord.endDt = assignment.endDt.toISOString();
    history.unshift(archiveRecord);
    cleanOldHistory();
    saveData();
}
