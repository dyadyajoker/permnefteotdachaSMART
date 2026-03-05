// ==================== НАЗНАЧЕНИЕ ТЕХНИКИ ====================

// ==================== ОБНОВЛЕНИЕ СПИСКА ТЕХНИКИ ====================
function updateQuickEquipment() {
    const typeFilter = document.getElementById('quickType')?.value || '';
    const baseFilter = document.getElementById('quickBase')?.value || '';
    const select = document.getElementById('quickEquipment');
    const now = new Date();
    const currentValue = select.value;
    
    select.innerHTML = '<option value="">-- Выберите --</option>';
    
    let available = database.filter(d => {
        const typeMatch = typeFilter === '' || d.type === typeFilter;
        const baseMatch = baseFilter === '' || d.base === baseFilter;
        const notInWork = !equipment.find(e => e.type === d.type && e.equipNum === d.num && now < e.endDt);
        const notInRepair = !repairList.find(r => r.type === d.type && r.num === d.num);
        const shiftType = d.shiftType || 'full';
        const isAvailableByTime = isEquipmentAvailable(shiftType);
        return typeMatch && baseMatch && notInWork && notInRepair && isAvailableByTime;
    });
    
    available.forEach(d => {
        const option = document.createElement('option');
        const shiftType = d.shiftType || 'full';
        option.value = JSON.stringify(d);
        const availLabel = getShiftAvailabilityLabel(shiftType);
        option.textContent = `${TYPE_NAMES[d.type]} №${d.num} - ${availLabel}`;
        select.appendChild(option);
    });
    
    if (currentValue) select.value = currentValue;
}

function filterQuickEquipment() {
    refreshPaused = true;
    updateQuickEquipment();
    setTimeout(() => { refreshPaused = false; }, CONFIG.PAUSE_TIMEOUT);
}

// ==================== БЫСТРОЕ НАЗНАЧЕНИЕ ====================
function quickAssign() {
    const select = document.getElementById('quickEquipment');
    const brigade = document.getElementById('quickBrigade')?.value.trim();
    const workHours = parseFloat(document.getElementById('quickWorkHours')?.value) || 4;
    const travelHours = parseFloat(document.getElementById('quickTravelHours')?.value) || 0;
    
    if (!select.value) {
        showAlert('⚠️ Выберите технику!', 'warning');
        return;
    }
    if (!brigade) {
        showAlert('⚠️ Введите бригаду!', 'warning');
        return;
    }
    
    const data = JSON.parse(select.value);
    const currentShift = getCurrentShift();
    const driverPhone = getDriverPhone(data, currentShift);
    
    callData = { 
        ...data, 
        brigade, 
        workHours, 
        travelHours, 
        currentShift, 
        driverPhone 
    };
    
    openCallModal(callData);
}

function confirmQuickAssign() {
    if (!callData) return;
    
    const now = new Date();
    const totalHours = callData.workHours + callData.travelHours;
    const endDt = new Date(now.getTime() + totalHours * 60 * 60 * 1000);
    const shiftInfo = getShiftChangeLocation(now, endDt, 'base');
    
    const assignment = {
        id: Date.now(),
        type: callData.type,
        equipNum: callData.num,
        base: callData.base,
        contractor: callData.contractor,
        brigade: callData.brigade,
        workHours: callData.workHours,
        travelHours: callData.travelHours,
        totalHours,
        start: now.toLocaleString('ru-RU'),
        startDt: now,
        end: endDt.toLocaleString('ru-RU'),
        endDt,
        status: 'В работе',
        shiftLocation: shiftInfo.location,
        shiftText: shiftInfo.text,
        phoneDay: callData.phoneDay,
        phoneNight: callData.phoneNight,
        assignedShift: callData.currentShift,
        completed: false
    };
    
    equipment.push(assignment);
    saveData();
    closeCallModal();
    renderAll();
    
    document.getElementById('quickBrigade').value = '';
    document.getElementById('quickEquipment').value = '';
    document.getElementById('quickTravelHours').value = '0';
    
    showAlert(`✅ Назначен в ${callData.brigade}`, 'success');
}

// ==================== ОСВОБОЖДЕНИЕ ТЕХНИКИ ====================
function completeEquipment(eid) {
    if (!confirm('❗ Освободить технику?')) return;
    
    const item = equipment.find(e => e.id === eid);
    if (item) {
        archiveAssignment(item, 'Завершено');
    }
    equipment = equipment.filter(e => e.id !== eid);
    saveData();
    renderAll();
    showAlert('ℹ️ Освобождён', 'info');
}

// ==================== СОХРАНЕНИЕ РЕДАКТИРОВАНИЯ ====================
function saveEdit() {
    const item = equipment.find(e => e.id === editingId);
    if (!item) return;
    
    const newBrigade = document.getElementById('editBrigade')?.value.trim();
    const newWorkHours = parseFloat(document.getElementById('editWorkHours')?.value) || 4;
    const newTravelHours = parseFloat(document.getElementById('editTravelHours')?.value) || 0;
    const shiftLocation = document.getElementById('editShiftLocation')?.value || 'base';
    
    if (!newBrigade) {
        showAlert('⚠️ Введите бригаду!', 'warning');
        return;
    }
    
    item.brigade = newBrigade;
    item.workHours = newWorkHours;
    item.travelHours = newTravelHours;
    item.totalHours = newWorkHours + newTravelHours;
    item.endDt = new Date(item.startDt.getTime() + item.totalHours * 60 * 60 * 1000);
    item.end = item.endDt.toLocaleString('ru-RU');
    item.shiftLocation = shiftLocation;
    item.shiftText = shiftLocation === 'base' ? '🏠 На базе' : '📍 На кусту';
    item.shiftManual = true;
    
    saveData();
    closeEditModal();
    renderAll();
    showAlert('✅ Сохранено', 'success');
}

// ==================== РЕМОНТ ====================
function saveRepair() {
    if (!repairId) return;
    
    const repairWhat = document.getElementById('repairWhat')?.value.trim();
    const repairComment = document.getElementById('repairComment')?.value.trim();
    
    if (!repairWhat) {
        showAlert('⚠️ Укажите что сломалось!', 'warning');
        return;
    }
    
    const itemToArchive = equipment.find(e => e.type === repairId.type && e.equipNum === repairId.num);
    if (itemToArchive) {
        archiveAssignment(itemToArchive, 'Ремонт');
    }
    
    equipment = equipment.filter(e => !(e.type === repairId.type && e.equipNum === repairId.num));
    
    repairList.push({
        id: Date.now(),
        type: repairId.type,
        num: repairId.num,
        base: repairId.base,
        phoneDay: repairId.phoneDay,
        when: new Date().toLocaleString('ru-RU'),
        what: repairWhat,
        comment: repairComment
    });
    
    const dbItem = database.find(d => d.type === repairId.type && d.num === repairId.num);
    if (dbItem) dbItem.shiftType = 'repair';
    
    saveData();
    closeRepairModal();
    renderAll();
    showAlert('✅ В ремонт', 'success');
}

function restoreFromRepair(id) {
    if (!confirm('❗ Восстановить технику из ремонта?')) return;
    
    const item = repairList.find(r => r.id === id);
    if (item) {
        const dbItem = database.find(d => d.type === item.type && d.num === item.num);
        if (dbItem) dbItem.shiftType = 'full';
    }
    
    repairList = repairList.filter(r => r.id !== id);
    saveData();
    renderAll();
    showAlert('ℹ️ Восстановлен', 'info');
}

// ==================== БАЗА ДАННЫХ ====================
function addToDatabase() {
    const type = document.getElementById('dbType').value;
    const num = document.getElementById('dbNum').value.trim();
    const base = document.getElementById('dbBase').value;
    const contractor = document.getElementById('dbContractor').value;
    const phoneDay = document.getElementById('dbPhoneDay').value.trim();
    const phoneNight = document.getElementById('dbPhoneNight').value.trim();
    const shiftType = document.getElementById('dbShiftType').value;
    const comment = document.getElementById('dbComment').value.trim();
    
    if (!num) {
        showAlert('⚠️ Введите номер!', 'warning');
        return;
    }
    
    addToDatabaseDirect(type, num, base, contractor, phoneDay, phoneNight || phoneDay, shiftType, comment);
    closeAddDbModal();
    renderAll();
    showAlert('✅ Добавлено', 'success');
}

function deleteFromDatabase(id) {
    if (!confirm('❗ Удалить?')) return;
    database = database.filter(d => d.id !== id);
    saveData();
    renderAll();
}

function saveDbEdit() {
    const item = database.find(d => d.id === dbEditId);
    if (!item) return;
    
    item.phoneDay = document.getElementById('editPhoneDay').value.trim();
    item.phoneNight = document.getElementById('editPhoneNight').value.trim();
    item.shiftType = document.getElementById('editShiftType').value;
    item.comment = document.getElementById('editComment').value.trim();
    
    if (item.shiftType === 'repair') {
        const exists = repairList.find(r => r.type === item.type && r.num === item.num);
        if (!exists) {
            repairList.push({
                id: Date.now(),
                type: item.type,
                num: item.num,
                base: item.base,
                phoneDay: item.phoneDay,
                when: new Date().toLocaleString('ru-RU'),
                what: 'Переведён вручную',
                comment: item.comment
            });
        }
        equipment = equipment.filter(e => !(e.type === item.type && e.equipNum === item.num));
    }
    
    saveData();
    closeDbEditModal();
    renderAll();
    showAlert('✅ Сохранено', 'success');
}
