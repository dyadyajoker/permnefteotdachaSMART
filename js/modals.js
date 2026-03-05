// ==================== УПРАВЛЕНИЕ МОДАЛЬНЫМИ ОКНАМИ ====================

// ==================== МОДАЛЬНОЕ ОКНО ЗВОНКА ====================
function openCallModal(data) {
    callData = data;
    const currentShift = getCurrentShift();
    const driverPhone = getDriverPhone(data, currentShift);
    const shiftBadge = currentShift === 'day' 
        ? '<span class="shift-driver-badge shift-day">☀️ Дневная смена</span>'
        : '<span class="shift-driver-badge shift-night">🌙 Ночная смена</span>';
    
    const modalBody = document.getElementById('callModalBody');
    modalBody.innerHTML = `
        <div class="card working">
            <div class="card-header">
                <span class="card-title">${TYPE_NAMES[data.type]} №${data.num}</span>
                <span class="card-badge badge-working">Назначение</span>
            </div>
            <div class="card-row">
                <span class="card-label">База</span>
                <span class="card-value">${data.base}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Бригада</span>
                <span class="card-value">${data.brigade}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Время работы</span>
                <span class="card-value">${data.workHours}ч</span>
            </div>
            <div class="card-row">
                <span class="card-label">Время пути</span>
                <span class="card-value">${data.travelHours}ч</span>
            </div>
            <div class="card-row">
                <span class="card-label">ВСЕГО</span>
                <span class="card-value"><strong>${(data.workHours + data.travelHours).toFixed(2)}ч</strong></span>
            </div>
        </div>
        <div class="card repair">
            <h4 style="margin-bottom: 10px; font-size: 14px;">📞 Позвоните водителю ${shiftBadge}:</h4>
            <p style="text-align: center; font-size: 20px; margin: 15px 0;">
                <a href="tel:${driverPhone}" class="phone-link">${driverPhone}</a>
            </p>
            <p style="text-align: center; font-size: 12px; color: #7f8c8d;">Нажмите на номер для звонка</p>
            <div class="card-row" style="margin-top: 10px;">
                <span class="card-label">☀️ День:</span>
                <span class="card-value"><a href="tel:${data.phoneDay}" class="phone-link">${data.phoneDay}</a></span>
            </div>
            <div class="card-row">
                <span class="card-label">🌙 Ночь:</span>
                <span class="card-value"><a href="tel:${data.phoneNight}" class="phone-link">${data.phoneNight}</a></span>
            </div>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="driverConfirmed" onchange="toggleConfirmButton()">
            <label for="driverConfirmed">Водитель подтвердил задание</label>
        </div>
    `;
    
    document.getElementById('callModal').classList.add('show');
}

function closeCallModal() {
    document.getElementById('callModal').classList.remove('show');
    callData = null;
    document.getElementById('confirmAssignBtn').style.display = 'none';
}

function toggleConfirmButton() {
    const confirmed = document.getElementById('driverConfirmed').checked;
    document.getElementById('confirmAssignBtn').style.display = confirmed ? 'block' : 'none';
}

// ==================== МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ ====================
function openEditModal(eid) {
    const item = equipment.find(e => e.id === eid);
    if (!item) return;
    editingId = eid;
    
    const modalBody = document.getElementById('editModalBody');
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Бригада</label>
            <input type="text" id="editBrigade" value="${item.brigade}">
        </div>
        <div class="form-group">
            <label>Время работы (ч)</label>
            <input type="number" id="editWorkHours" value="${item.workHours}" step="0.01">
        </div>
        <div class="form-group">
            <label>Время пути (ч)</label>
            <input type="number" id="editTravelHours" value="${item.travelHours || 0}" step="0.01">
        </div>
        <div class="form-group">
            <label>Пересменка</label>
            <select id="editShiftLocation">
                <option value="base" ${item.shiftLocation === 'base' ? 'selected' : ''}>🏠 На базе</option>
                <option value="site" ${item.shiftLocation === 'site' ? 'selected' : ''}>📍 На кусту</option>
            </select>
        </div>
    `;
    
    document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingId = null;
}

// ==================== МОДАЛЬНОЕ ОКНО РЕМОНТА ====================
function openRepairFromCall() {
    if (!callData) return;
    repairId = { 
        type: callData.type, 
        num: callData.num, 
        base: callData.base, 
        phoneDay: callData.driverPhone 
    };
    
    const modalBody = document.getElementById('repairModalBody');
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Что сломалось</label>
            <input type="text" id="repairWhat" placeholder="Двигатель...">
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="repairComment" rows="2" placeholder="Подробности..."></textarea>
        </div>
    `;
    
    document.getElementById('repairModal').classList.add('show');
    closeCallModal();
}

function closeRepairModal() {
    document.getElementById('repairModal').classList.remove('show');
    repairId = null;
}

// ==================== МОДАЛЬНОЕ ОКНО БАЗЫ ====================
function openAddDbModal() {
    const modalBody = document.getElementById('addDbModalBody');
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Тип</label>
            <select id="dbType">
                <option value="avtokran">🏗️ Автокран</option>
                <option value="polupricep">🚛 Полуприцеп</option>
                <option value="tyagach">🚚 Тягач</option>
                <option value="ppu">⚙️ ППУ</option>
                <option value="ca320">🔧 ЦА-320</option>
                <option value="akn">🚰 АКН</option>
                <option value="amkador">🚜 Амкодор</option>
            </select>
        </div>
        <div class="form-group">
            <label>№ Техники</label>
            <input type="text" id="dbNum" placeholder="369">
        </div>
        <div class="form-group">
            <label>База</label>
            <select id="dbBase">
                <option value="БСО-1">БСО-1</option>
                <option value="БСО-2">БСО-2</option>
                <option value="КП-135">КП-135</option>
            </select>
        </div>
        <div class="form-group">
            <label>Подрядчик</label>
            <select id="dbContractor">
                <option value="ours">Наша</option>
                <option value="pno">ПНО</option>
                <option value="fdv">ФДВ</option>
                <option value="onr">ОНР</option>
                <option value="eprs">ЕПРС</option>
            </select>
        </div>
        <div class="form-group">
            <label>Режим</label>
            <select id="dbShiftType">
                <option value="full">День+Ночь</option>
                <option value="day">Только день</option>
                <option value="night">Только ночь</option>
                <option value="repair">В ремонте</option>
            </select>
        </div>
        <div class="form-group">
            <label>Телефон день ☀️</label>
            <input type="tel" id="dbPhoneDay" placeholder="8-992-222-00-60">
        </div>
        <div class="form-group">
            <label>Телефон ночь 🌙</label>
            <input type="tel" id="dbPhoneNight" placeholder="8-992-222-00-61">
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="dbComment" rows="2" placeholder="Особенности..."></textarea>
        </div>
    `;
    
    document.getElementById('addDbModal').classList.add('show');
}

function closeAddDbModal() {
    document.getElementById('addDbModal').classList.remove('show');
}

function openDbEditModal(id) {
    const item = database.find(d => d.id === id);
    if (!item) return;
    dbEditId = id;
    
    const modalBody = document.getElementById('dbEditModalBody');
    modalBody.innerHTML = `
        <div class="form-group">
            <label>Телефон день ☀️</label>
            <input type="tel" id="editPhoneDay" value="${item.phoneDay}">
        </div>
        <div class="form-group">
            <label>Телефон ночь 🌙</label>
            <input type="tel" id="editPhoneNight" value="${item.phoneNight || item.phoneDay}">
        </div>
        <div class="form-group">
            <label>Режим</label>
            <select id="editShiftType">
                <option value="full" ${item.shiftType === 'full' ? 'selected' : ''}>День+Ночь</option>
                <option value="day" ${item.shiftType === 'day' ? 'selected' : ''}>Только день</option>
                <option value="night" ${item.shiftType === 'night' ? 'selected' : ''}>Только ночь</option>
                <option value="repair" ${item.shiftType === 'repair' ? 'selected' : ''}>В ремонте</option>
            </select>
        </div>
        <div class="form-group">
            <label>Комментарий</label>
            <textarea id="editComment" rows="2">${item.comment || ''}</textarea>
        </div>
    `;
    
    document.getElementById('dbEditModal').classList.add('show');
}

function closeDbEditModal() {
    document.getElementById('dbEditModal').classList.remove('show');
    dbEditId = null;
}

// ==================== МОДАЛЬНОЕ ОКНО ИСТОРИИ ====================
function openHistoryDetailModal(record) {
    const modalBody = document.getElementById('historyDetailBody');
    const startDate = new Date(record.startDt);
    const endDate = new Date(record.endDt);
    const duration = ((endDate - startDate) / 1000 / 60 / 60).toFixed(1);
    
    modalBody.innerHTML = `
        <div class="card history">
            <div class="card-header">
                <div>
                    <span class="type-badge bg-${record.type}">${TYPE_NAMES[record.type]}</span>
                    <span class="card-title">${record.equipNum}</span>
                </div>
                <span class="card-badge badge-history">📜 История</span>
            </div>
            <div class="card-row">
                <span class="card-label">Бригада</span>
                <span class="card-value">${record.brigade}</span>
            </div>
            <div class="card-row">
                <span class="card-label">База</span>
                <span class="card-value"><span class="base-badge">${record.base}</span></span>
            </div>
            <div class="card-row">
                <span class="card-label">Начало</span>
                <span class="card-value">${record.start}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Окончание</span>
                <span class="card-value">${record.end}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Работа</span>
                <span class="card-value">${record.workHours}ч</span>
            </div>
            <div class="card-row">
                <span class="card-label">Путь</span>
                <span class="card-value">${record.travelHours || 0}ч</span>
            </div>
            <div class="card-row">
                <span class="card-label">Длительность</span>
                <span class="card-value">${duration} ч</span>
            </div>
            <div class="card-row">
                <span class="card-label">Пересменка</span>
                <span class="card-value">${record.shiftText}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Смена назначения</span>
                <span class="card-value">${record.assignedShift === 'day' ? '☀️ Дневная' : '🌙 Ночная'}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Статус</span>
                <span class="card-value">${record.completionReason || 'Завершено'}</span>
            </div>
            <div class="card-row">
                <span class="card-label">Архивировано</span>
                <span class="card-value">${new Date(record.archivedAt).toLocaleString('ru-RU')}</span>
            </div>
        </div>
    `;
    
    document.getElementById('historyDetailModal').classList.add('show');
}

function closeHistoryDetailModal() {
    document.getElementById('historyDetailModal').classList.remove('show');
}
