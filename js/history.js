// ==================== ИСТОРИЯ И ЭКСПОРТ ====================

// ==================== ЭКСПОРТ В CSV ====================
function exportHistory() {
    const period = document.getElementById('historyPeriod')?.value || '30';
    let filtered = [...history];
    
    if (period !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
        filtered = filtered.filter(h => new Date(h.startDt) >= cutoffDate);
    }
    
    if (filtered.length === 0) {
        showAlert('⚠️ Нет данных для экспорта', 'warning');
        return;
    }
    
    let csv = 'Дата начала;Дата окончания;Техника;№;База;Бригада;Работа;Путь;Всего;Смена;Пересменка;Статус\n';
    filtered.forEach(h => {
        const startDate = new Date(h.startDt);
        const endDate = new Date(h.endDt);
        const duration = ((endDate - startDate) / 1000 / 60 / 60).toFixed(1);
        csv += `${h.start};${h.end};${TYPE_NAMES[h.type]};${h.equipNum};${h.base};${h.brigade};${h.workHours}ч;${h.travelHours || 0}ч;${duration}ч;${h.assignedShift === 'day' ? 'Дневная' : 'Ночная'};${h.shiftText};${h.completionReason || 'Завершено'}\n`;
    });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `история_техники_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showAlert(`✅ Экспортировано ${filtered.length} записей`, 'success');
}

// ==================== ОТРИСОВКА ИСТОРИИ ====================
function renderHistoryCards() {
    const container = document.getElementById('historyCards');
    const empty = document.getElementById('historyEmpty');
    const period = document.getElementById('historyPeriod')?.value || '30';
    const filterType = document.getElementById('historyType')?.value || 'all';
    const search = document.getElementById('searchHistory')?.value.toLowerCase() || '';
    
    let filtered = [...history];
    
    if (period !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(period));
        filtered = filtered.filter(h => new Date(h.startDt) >= cutoffDate);
    }
    
    if (filterType !== 'all') {
        filtered = filtered.filter(h => h.type === filterType);
    }
    
    if (search) {
        filtered = filtered.filter(h => 
            h.brigade.toLowerCase().includes(search) || 
            h.equipNum.toLowerCase().includes(search)
        );
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    
    empty.style.display = 'none';
    
    // Группировка по датам
    const grouped = {};
    filtered.forEach(h => {
        const dateKey = new Date(h.startDt).toLocaleDateString('ru-RU');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(h);
    });
    
    let html = '';
    Object.keys(grouped).sort((a, b) => {
        const dateA = new Date(a.split('.').reverse().join('-'));
        const dateB = new Date(b.split('.').reverse().join('-'));
        return dateB - dateA;
    }).forEach(date => {
        html += `<div class="history-date">📅 ${date}</div>`;
        html += grouped[date].map(h => {
            const startDate = new Date(h.startDt);
            const endDate = new Date(h.endDt);
            const duration = ((endDate - startDate) / 1000 / 60 / 60).toFixed(1);
            return `
                <div class="card history" onclick="openHistoryDetailModal(${JSON.stringify(h).replace(/"/g, '&quot;')})">
                    <div class="card-header">
                        <div>
                            <span class="type-badge bg-${h.type}">${TYPE_NAMES[h.type]}</span>
                            <span class="card-title">${h.equipNum}</span>
                        </div>
                        <span class="card-badge badge-history">${h.completionReason || 'Завершено'}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Бригада</span>
                        <span class="card-value">${h.brigade}</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Время</span>
                        <span class="card-value">${duration}ч (${h.workHours}ч + ${h.travelHours || 0}ч путь)</span>
                    </div>
                    <div class="card-row">
                        <span class="card-label">Пересменка</span>
                        <span class="card-value">${h.shiftText}</span>
                    </div>
                </div>`;
        }).join('');
    });
    
    container.innerHTML = html;
}
