// ==================== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ====================

// ==================== НАВИГАЦИЯ ====================
function showSection(section, event) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`section-${section}`).classList.add('active');
    
    if (event) {
        event.currentTarget.classList.add('active');
    } else {
        // Найти соответствующую кнопку навигации
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.getAttribute('onclick').includes(section)) {
                item.classList.add('active');
            }
        });
    }
    
    renderAll();
    window.scrollTo(0, 0);
}

// ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
window.onload = function() {
    // Загрузка данных
    loadData();
    
    // Исправление старых данных
    fixOldData();
    
    // Очистка старой истории
    cleanOldHistory();
    
    // Добавление тестовых данных если база пуста
    if (database.length === 0) {
        addToDatabaseDirect('avtokran', '369', 'БСО-1', 'ours', '8-992-222-00-60', '8-992-222-00-61', 'full', '');
        addToDatabaseDirect('avtokran', '307', 'БСО-1', 'ours', '8-992-222-00-61', '8-992-222-00-62', 'full', '');
        addToDatabaseDirect('avtokran', '545', 'БСО-1', 'ours', '8-992-222-00-62', '8-992-222-00-63', 'full', '');
    }
    
    // Первичная отрисовка
    renderAll();
    
    // Запуск автообновления
    setInterval(updateColors, CONFIG.REFRESH_INTERVAL);
    
    // Обновление времени
    updateCurrentTime();
    
    console.log('✅ Приложение запущено');
};

// ==================== ОБРАБОТКА ОШИБОК ====================
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Ошибка:', message, 'в', source, 'строка', lineno);
    showAlert('⚠️ Произошла ошибка', 'warning');
    return true;
};
