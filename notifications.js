// ==================== СИСТЕМА УВЕДОМЛЕНИЙ ====================

let notificationsCache = [];
let unreadCount = 0;

// Инициализация системы уведомлений
async function initializeNotifications() {
    const notifBtn = document.getElementById('notifications-btn');
    if (!notifBtn) return;

    // Загружаем уведомления при запуске
    await loadNotifications();

    // Обработчик клика на кнопку
    notifBtn.addEventListener('click', openNotificationsPanel);

    // Периодически проверяем новые уведомления (каждые 30 сек)
    setInterval(loadNotifications, 30000);
}

// Загрузка уведомлений из БД
async function loadNotifications() {
    if (!authService.currentUser) return;

    try {
        const notifications = await SupabaseDB.getNotifications(authService.currentUser.id);
        notificationsCache = notifications;
        unreadCount = notifications.length;
        updateNotificationBadge(unreadCount);
    } catch (error) {
        console.error('❌ Ошибка загрузки уведомлений:', error);
    }
}

// Обновление значка с количеством
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

// Открытие панели уведомлений
function openNotificationsPanel() {
    const existingPanel = document.getElementById('notifications-panel');
    if (existingPanel) {
        document.body.removeChild(existingPanel);
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'notifications-panel';
    panel.innerHTML = `
        <div class="notifications-header">
            <h3>🔔 Уведомления</h3>
            <button class="close-panel-btn">&times;</button>
        </div>
        <div class="notifications-list" id="notifications-list">
            ${renderNotificationsList()}
        </div>
    `;

    document.body.appendChild(panel);

    // Анимация появления
    setTimeout(() => panel.classList.add('active'), 10);

    // Обработчики
    panel.querySelector('.close-panel-btn').addEventListener('click', () => {
        panel.classList.remove('active');
        setTimeout(() => document.body.removeChild(panel), 300);
    });

    // Закрытие при клике вне панели
    panel.addEventListener('click', (e) => {
        if (e.target === panel) {
            panel.classList.remove('active');
            setTimeout(() => document.body.removeChild(panel), 300);
        }
    });
}

// Рендер списка уведомлений
function renderNotificationsList() {
    if (notificationsCache.length === 0) {
        return `
            <div class="empty-notifications">
                <div class="empty-icon">🔕</div>
                <p>Нет новых уведомлений</p>
            </div>
        `;
    }

    return notificationsCache.map(notif => `
        <div class="notification-item ${notif.is_read ? 'read' : 'unread'}" data-id="${notif.id}">
            <div class="notif-icon">${getNotificationIcon(notif.type)}</div>
            <div class="notif-content">
                <h4>${notif.title}</h4>
                <p>${notif.message}</p>
                <span class="notif-time">${formatNotificationTime(notif.created_at)}</span>
            </div>
            <button class="mark-read-btn" onclick="markAsRead(${notif.id})">✓</button>
        </div>
    `).join('');
}

// Получение иконки по типу уведомления
function getNotificationIcon(type) {
    const icons = {
        question_answer: '💬',
        request_completed: '✅',
        news: '📰',
        event: '📅',
        default: '🔔'
    };
    return icons[type] || icons.default;
}

// Форматирование времени
function formatNotificationTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
}

// Пометить уведомление как прочитанное
async function markAsRead(notificationId) {
    try {
        await SupabaseDB.markNotificationAsRead(notificationId);
        
        // Обновляем кеш
        const index = notificationsCache.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notificationsCache[index].is_read = true;
        }
        
        // Пересчитываем непрочитанные
        unreadCount = notificationsCache.filter(n => !n.is_read).length;
        updateNotificationBadge(unreadCount);
        
        // Обновляем UI
        const item = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
        if (item) {
            item.classList.remove('unread');
            item.classList.add('read');
            const btn = item.querySelector('.mark-read-btn');
            if (btn) btn.remove();
        }
    } catch (error) {
        console.error('❌ Ошибка пометки уведомления:', error);
    }
}

// Создание уведомления (вызывается после отправки вопроса/заявки)
async function createNotification(userId, type, title, message, link = null) {
    try {
        const notificationData = {
            user_id: userId,
            university_id: authService.currentUniversity.id,
            type: type,
            title: title,
            message: message,
            link: link
        };
        
        await SupabaseDB.createNotification(notificationData);
        console.log('✅ Уведомление создано');
    } catch (error) {
        console.error('❌ Ошибка создания уведомления:', error);
    }
}

// Экспортируем функции
window.initializeNotifications = initializeNotifications;
window.createNotification = createNotification;
window.loadNotifications = loadNotifications;
window.markAsRead = markAsRead;
