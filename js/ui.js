// ==================== ОТРИСОВКА ИНТЕРФЕЙСА ====================

// ==================== ОБНОВЛЕНИЕ СТАТУСОВ ====================
function updateColors() {
    if (refreshPaused) return;
    const now = new Date();
    
    equipment.forEach(e => {
        const timeToEnd = (e.endDt - now) / 1000 / 60;
        if (!e.manualStatus) {
            if (now >= e.endDt) e.status = 'Готов';
            else if (timeToEnd <= 60) e.status = 'Скоро';
            else e.status = 'В работе';
        }
        if (!e.shiftManual) {
            const shiftInfo = getShiftChangeLocation(e.startDt, e.endDt, e.base);
            e.shiftLocation = shiftInfo.location;
            e.shiftText = shiftInfo.text;
        }
    });
    
    renderAll();
    updateStatusBar();
    updateCurrentTime();
}

function updateCurrentTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = `🕐 ${timeStr}`;
    
    const currentShift = getCurrentShift();
    document.getElementById('currentShift').textContent = getShiftLabel(currentShift);
    document.getElementById('currentShiftBadge').textContent = currentShift === 'day' ? '☀️' : '🌙';
    document.getElementById('currentShiftBadgeQuick').textContent = currentShift === 'day' ? '☀️' : '🌙';
}

// ==================== СТАТУС БАР ====================
function updateStatusBar() {
    const now = new Date();
    const totalInWork = equipment.filter(e => now < e.endDt).length;
    const totalFree = database.filter(d => {
        const notInWork = !equipment.find(e => e.type === d.type && e.equipNum === d.num && now < e.endDt);
        const notInRepair = !repairList.find(r => r.type === d.type && r.num === d.num);
        const shiftType = d.shiftType || 'full';
        return notInWork && notInRepair && isEquipmentAvailable(shiftType) && d.contractor === 'ours';
    }).length;
    
    document.getElementById('statusBar').innerHTML = `
        <div class="stat-item">🔴 <strong>${totalInWork}</strong>В работе</div>
        <div class="stat-item">🟢 <strong>${totalFree}</strong>Свободно</div>
        <div class="stat-item">🔧 <strong>${repairList.length}</strong>Ремонт</div>
        <div class="stat-item">📜 <strong>${history.length}</strong>История</div>
    `;
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showAlert(message, type) {
    const container = document.getElementById('alertsContainer');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// ==================== ОТРИСОВКА ВСЕХ КАРТОЧЕК ====================
function renderAll() {
    renderActiveCards();
    renderFreeCards();
    renderHistoryCards();
    renderRepairCards();
    renderDatabaseCards();
    updateQuickEquipment();
}

// ==================== В РАБОТЕ ====================
function renderActiveCards() {
    const container = document.getElementById('activeCards');
    const empty = document.getElementById('activeEmpty');
    const filterType = document.getElementById('filterType')?.value || 'all';
    const filterStatus = document.getElementById('filterStatus')?.value || 'all';
    const search = document.getElementById('searchActive')?.value.toLowerCase() || '';
    const now = new Date();
    
    let filtered = equipment.filter(e => {
        const timeToEnd = (e.endDt - now) / 1000 / 60;
        const typeMatch = filterType === 'all' || e.type === filterType;
        let statusMatch = true;
        if (filterStatus === 'working') statusMatch = e.status === 'В работе' && timeToEnd > 60;
        else if (filterStatus === 'soon') statusMatch = e.status === 'Скоро';
        else if (filterStatus === 'ready') statusMatch = e.status === 'Готов';
        return typeMatch && statusMatch && e.brigade.toLowerCase().includes(search);
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    container.innerHTML = filtered.map(e => {
        const timeToEnd = (e.endDt - now) / 1000 / 60;
        const statusClass = e.status === 'Готов' ? 'ready' : (e.status === 'Скоро' ? 'soon' : 'working');
        const statusBadge = e.status === 'Готов' ? 'badge-ready' : (e.status === 'Скоро' ? 'badge-soon' : 'badge-working');
        const statusText = e.status === 'Готов' ? '🟢 Готов' : (e.status === 'Скоро' ? '🟡 Скоро' : '🔴 В работе');
        const soonBadge = timeToEnd <= 60 && timeToEnd > 0 ? ` ⏰ ${Math.floor(timeToEnd)} мин` : '';
        
        return `
            <div class="card ${statusClass}">
                <div class="card-header">
                    <div>
                        <span class="type-badge bg-${e.type}">${TYPE_NAMES[e.type]}</span>
                        <span class="card-title">${e.equipNum}</span>
                    </div>
                    <span class="card-badge ${statusBadge}">${statusText}${soonBadge}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Бригада</span>
                    <span class="card-value">${e.brigade}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">База</span>
                    <span class="card-value"><span class="base-badge">${e.base}</span></span>
                </div>
                <div class="card-row">
                    <span class="card-label">Время</span>
                    <span class="card-value">${e.totalHours.toFixed(1)}ч (работа: ${e.workHours}ч + путь: ${e.travelHours || 0}ч)</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Окончание</span>
                    <span class="card-value">${e.end.split(' ')[1]}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Пересменка</span>
                    <span class="card-value">${e.shiftText}</span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openEditModal(${e.id})">✏️ Изменить</button>
                    <button class="btn btn-success" onclick="completeEquipment(${e.id})">✅ Освободить</button>
                </div>
            </div>`;
    }).join('');
}

// ==================== СВОБОДНАЯ ТЕХНИКА ====================
function renderFreeCards() {
    const container = document.getElementById('freeCards');
    const empty = document.getElementById('freeEmpty');
    const now = new Date();
    
    let freeTech = database.filter(d => {
        const notInWork = !equipment.find(e => e.type === d.type && e.equipNum === d.num && now < e.endDt);
        const notInRepair = !repairList.find(r => r.type === d.type && r.num === d.num);
        const shiftType = d.shiftType || 'full';
        const isAvailableByTime = isEquipmentAvailable(shiftType);
        return notInWork && notInRepair && isAvailableByTime && d.contractor === 'ours';
    });
    
    if (freeTech.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    container.innerHTML = freeTech.map(f => {
        const shiftType = f.shiftType || 'full';
        const availLabel = getShiftAvailabilityLabel(shiftType);
        
        return `
            <div class="card free">
                <div class="card-header">
                    <div>
                        <span class="type-badge bg-${f.type}">${TYPE_NAMES[f.type]}</span>
                        <span class="card-title">${f.num}</span>
                    </div>
                    <span class="card-badge badge-free">${availLabel}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">База</span>
                    <span class="card-value"><span class="base-badge">${f.base}</span></span>
                </div>
                <div class="card-row">
                    <span class="card-label">Телефон</span>
                    <span class="card-value"><a href="tel:${f.phoneDay}" class="phone-link">${f.phoneDay}</a></span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-success" onclick="quickAssignFromFree('${f.type}', '${f.num}', '${f.base}', '${f.contractor}', '${f.phoneDay}')">
                        ⚡ Назначить
                    </button>
                </div>
            </div>`;
    }).join('');
}

function quickAssignFromFree(type, num, base, contractor, phoneDay) {
    refreshPaused = true;
    document.getElementById('quickBase').value = base;
    document.getElementById('quickType').value = type;
    filterQuickEquipment();
    
    const select = document.getElementById('quickEquipment');
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.includes(num)) {
            select.selectedIndex = i;
            break;
        }
    }
    
    showSection('quick', null);
    setTimeout(() => { refreshPaused = false; }, CONFIG.PAUSE_TIMEOUT);
    showAlert('ℹ️ Техника выбрана', 'info');
}

// ==================== РЕМОНТ ====================
function renderRepairCards() {
    const container = document.getElementById('repairCards');
    const empty = document.getElementById('repairEmpty');
    const today = new Date().toLocaleDateString('ru-RU');
    const todayCount = repairList.filter(r => new Date(r.when).toLocaleDateString('ru-RU') === today).length;
    
    document.getElementById('totalRepair').textContent = repairList.length;
    document.getElementById('todayRepair').textContent = todayCount;
    
    if (repairList.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    container.innerHTML = repairList.map(r => `
        <div class="card repair">
            <div class="card-header">
                <div>
                    <span class="type-badge bg-${r.type}">${TYPE_NAMES[r.type]}</span>
                    <span class="card-title">${r.num}</span>
                </div>
                <span class="card-badge badge-repair">🔧 Ремонт</span>
            </div>
            <div class="card-row">
                <span class="card-label">База</span>
                <span class="card-value"><span class="base-badge">${r.base}</span></span>
            </div>
            <div class="card-row">
                <span class="card-label">Сломалась</span>
                <span class="card-value">${r.when}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Проблема</span>
                <span class="card-value">${r.what}</span>
            </div>
            ${r.comment ? `<div class="card-row"><span class="card-label">Комментарий</span><span class="card-value">${r.comment}</span></div>` : ''}
            <div class="card-row">
                <span class="card-label">Телефон</span>
                <span class="card-value"><a href="tel:${r.phoneDay}" class="phone-link">${r.phoneDay}</a></span>
            </div>
            <div class="card-actions">
                <button class="btn btn-success" onclick="restoreFromRepair(${r.id})">✅ Восстановить</button>
                <button class="btn btn-danger" onclick="if(confirm('Удалить запись?')){repairList=repairList.filter(x=>x.id!==${r.id});saveData();renderAll();}">
                    ❌ Удалить
                </button>
            </div>
        </div>
    `).join('');
}

// ==================== БАЗА ДАННЫХ ====================
function renderDatabaseCards() {
    const container = document.getElementById('databaseCards');
    const empty = document.getElementById('dbEmpty');
    const search = document.getElementById('searchDb')?.value.toLowerCase() || '';
    const filterType = document.getElementById('filterDbType')?.value || 'all';
    
    let filtered = database.filter(d => {
        const typeMatch = filterType === 'all' || d.type === filterType;
        const searchMatch = d.num.toLowerCase().includes(search);
        return typeMatch && searchMatch;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    container.innerHTML = filtered.map(d => {
        const shiftType = d.shiftType || 'full';
        const shiftLabels = { 
            'full': 'День+Ночь', 
            'day': 'Только день', 
            'night': 'Только ночь', 
            'repair': 'В ремонте' 
        };
        
        return `
            <div class="card free">
                <div class="card-header">
                    <div>
                        <span class="type-badge bg-${d.type}">${TYPE_NAMES[d.type]}</span>
                        <span class="card-title">${d.num}</span>
                    </div>
                    <span class="card-badge badge-free">${shiftLabels[shiftType]}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">База</span>
                    <span class="card-value"><span class="base-badge">${d.base}</span></span>
                </div>
                <div class="card-row">
                    <span class="card-label">Подрядчик</span>
                    <span class="card-value">${CONTRACTOR_NAMES[d.contractor]}</span>
                </div>
                <div class="card-row">
                    <span class="card-label">Телефон день ☀️</span>
                    <span class="card-value"><a href="tel:${d.phoneDay}" class="phone-link">${d.phoneDay}</a></span>
                </div>
                <div class="card-row">
                    <span class="card-label">Телефон ночь 🌙</span>
                    <span class="card-value"><a href="tel:${d.phoneNight}" class="phone-link">${d.phoneNight}</a></span>
                </div>
                ${d.comment ? `<div class="card-row"><span class="card-label">Комментарий</span><span class="card-value">${d.comment}</span></div>` : ''}
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openDbEditModal(${d.id})">✏️ Изменить</button>
                    <button class="btn btn-danger" onclick="deleteFromDatabase(${d.id})">❌ Удалить</button>
                </div>
            </div>`;
    }).join('');
}
