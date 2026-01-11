// Главный модуль приложения
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация вкладок
    initTabs();

    // Инициализация модулей
    ManagersModule.init();
    ClientsModule.init();
    ProfilesModule.init();

    // Загрузка начальных данных
    loadInitialData();
});

// Управление вкладками
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Убираем активный класс со всех вкладок
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Добавляем активный класс к выбранной вкладке
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Загрузка начальных данных
async function loadInitialData() {
    try {
        await ProfilesModule.loadProfiles();
        await ManagersModule.loadManagers();
        await ClientsModule.loadClients();
    } catch (error) {
        showNotification('Ошибка загрузки данных: ' + error.message, 'error');
    }
}

// Показ уведомлений
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Утилиты для модальных окон
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Закрытие модальных окон по клику вне их
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('show');
    }
};

// Закрытие по кнопке X
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').classList.remove('show');
    });
});