// === MAX mini-app logic ===

// 🔹 Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    updateUserInfo();
    updateWeekInfo();
    renderTodaySchedule();
    renderNews();
    renderWeekSchedule();
    renderClubs();
    setupServices();
}

// 🔥 ДОБАВЬ ЭТИ ПЕРЕМЕННЫЕ ПОСЛЕ mockData
let clubFormSelectedTags = [];
let availableTags = [
    "программирование", "искусство", "спорт", "наука", "музыка", 
    "танцы", "театр", "кино", "фотография", "дизайн",
    "робототехника", "ai", "хакатоны", "стартапы", "веб-разработка",
    "мобильная разработка", "data science", "киберспорт", "настольные игры",
    "волонтерство", "экология", "путешествия", "кулинария", "йога",
    "медитация", "психология", "литература", "поэзия", "дебаты"
];

// 🔹 Таб-переключение с анимацией
function setupNavigation() {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            const content = document.getElementById(target);
            content.classList.add('active');
        });
    });
}

// 🔹 Обновление информации пользователя
function updateUserInfo() {
    const userInfo = document.querySelector('.user-info');
    if (userInfo && mockData.user) {
        userInfo.textContent = `${mockData.user.group} | ${mockData.user.institute}`;
    }
}

// 🔹 Обновление информации о неделе
function updateWeekInfo() {
    const currentWeekElement = document.getElementById('current-week');
    if (currentWeekElement) {
        const weekNumber = getCurrentWeek();
        currentWeekElement.textContent = `Неделя ${weekNumber}`;
    }
}

// === ФУНКЦИИ РЕНДЕРА ===

// 📅 Расписание на сегодня
function renderTodaySchedule() {
    const todayContainer = document.getElementById('today-schedule');
    if (!todayContainer) return;

    todayContainer.innerHTML = '';

    // Находим сегодняшний день
    const today = new Date().toISOString().split('T')[0];
    const todayData = mockData.schedule.find(day => day.date === today);

    if (!todayData || todayData.lessons.length === 0) {
        todayContainer.innerHTML = `
            <div class="empty-schedule">
                <div class="icon">🎉</div>
                <p>На сегодня пар нет!</p>
            </div>
        `;
        return;
    }

    todayData.lessons.forEach(lesson => {
        const div = document.createElement('div');
        div.className = `lesson ${lesson.type}`;
        div.innerHTML = `
            <div class="lesson-time">${lesson.time}</div>
            <div class="lesson-subject">${lesson.subject}</div>
            <div class="lesson-details">
                <span>${lesson.teacher}</span>
                <span>${lesson.room}</span>
            </div>
        `;
        todayContainer.appendChild(div);
    });
}

// 📰 Новости
function renderNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    newsList.innerHTML = '';

    // Сортируем новости по приоритету
    const sortedNews = [...mockData.news].sort((a, b) => {
        const priorityOrder = { admin: 3, headman: 2, student: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    sortedNews.forEach(news => {
        const div = document.createElement('div');
        div.className = `news-item priority-${news.priority}`;
        div.innerHTML = `
            <h4>${news.title}</h4>
            <p>${news.content}</p>
            <small>${news.author} • ${formatDate(news.date)}</small>
        `;
        newsList.appendChild(div);
    });
}

// 📚 Расписание недели
function renderWeekSchedule() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;

    grid.innerHTML = '';

    mockData.schedule.forEach(dayData => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'schedule-card';
        
        dayDiv.innerHTML = `
            <h3>${dayData.day}</h3>
            <small>${formatDate(dayData.date)}</small>
        `;

        if (dayData.lessons.length > 0) {
            dayData.lessons.forEach(lesson => {
                const lessonEl = document.createElement('div');
                lessonEl.className = `lesson ${lesson.type}`;
                lessonEl.innerHTML = `
                    <div class="lesson-time">${lesson.time}</div>
                    <div class="lesson-subject">${lesson.subject}</div>
                    <div class="lesson-details">
                        <span>${lesson.teacher}</span>
                        <span>${lesson.room}</span>
                    </div>
                `;
                dayDiv.appendChild(lessonEl);
            });
        } else {
            dayDiv.innerHTML += `<div class="empty-day">Нет занятий</div>`;
        }

        grid.appendChild(dayDiv);
    });
}

// 🎭 Клубы
function renderClubs() {
    const container = document.getElementById('clubs-list');
    if (!container) return;

    container.innerHTML = '';

    mockData.clubs.forEach(club => {
        const div = document.createElement('div');
        div.className = 'club-card';
        div.innerHTML = `
            <div class="club-icon">${club.icon}</div>
            <div class="club-info">
                <h3>${club.name}</h3>
                <p>${club.desc}</p>
                <div class="club-meta">
                    <span class="members">👥 ${club.members} участников</span>
                    <span class="contact">${club.contact}</span>
                </div>
            </div>
        `;
        
        // Добавляем обработчик клика
        div.addEventListener('click', () => {
            alert(`Вступай в ${club.name}! Контакт: ${club.contact}`);
        });

        container.appendChild(div);
    });
}

// ⚙️ Сервисы
// ⚙️ Сервисы - обновленная функция
// ⚙️ Сервисы - исправленная версия
function setupServices() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        // Убираем все старые обработчики
        card.replaceWith(card.cloneNode(true));
    });
    
    // Вешаем новые обработчики
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', handleServiceClick);
    });
}

// 🔥 ОДИН обработчик для всех сервисов
function handleServiceClick(event) {
    const card = event.currentTarget;
    const service = card.getAttribute('data-service');
    
    console.log('🎯 Клик по сервису:', service); // Для отладки
    
    // Закрываем все открытые модалки перед открытием новой
    closeAllServiceModals();
    
    switch(service) {
        case 'library':
            showServiceModal('📚 Библиотека', 
                'Доступ к электронным ресурсам, заказ книг и учебников. Онлайн-каталог и продление срока аренды.');
            break;
            
        case 'documents':
            showServiceModal('📄 Документы', 
                'Заказ справок об обучении, академических выписок, копий дипломов и других документов.');
            break;
            
        case 'dormitory':
            showServiceModal('🏠 Общежитие', 
                'Подача заявок на заселение, решение бытовых вопросов, заявки на ремонт.');
            break;

        // 🔥 НОВЫЕ СЕРВИСЫ
        case 'create-club':
            openCreateClubModal();
            break;
            
        case 'book-room':
            openRoomBooking();
            break;
            
        case 'events':
            showEventsCalendar();
            break;
    }
}

function openCreateClubModal() {
    console.log('🎯 Открытие модалки создания клуба...');
    
    // Закрываем все другие модалки
    closeAllServiceModals();
    
    // Находим модалку
    const modal = document.getElementById('create-club-modal');
    
    if (!modal) {
        console.error('❌ Модалка создания клуба не найдена!');
        return;
    }
    
    // Показываем модалку
    modal.classList.remove('hidden');
    
    // 🔥 ВЫЗЫВАЕМ ВСЕ ФУНКЦИИ ИНИЦИАЛИЗАЦИИ СРАЗУ
    initializeClubForm();
    
    // Добавляем небольшую задержку для гарантии, что DOM обновился
    setTimeout(() => {
        initializeTags();
        initializeEmojiPicker();
        setupClubModalHandlers();
        console.log('✅ Все обработчики установлены');
    }, 100);
}

// 🔥 ОБРАБОТКА СОЗДАНИЯ КЛУБА
function handleClubCreation(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('club-name').value.trim(),
        desc: document.getElementById('club-desc').value.trim(),
        category: document.getElementById('club-category').value,
        icon: document.getElementById('club-icon').value,
        format: document.querySelector('input[name="club-format"]:checked').value,
        maxMembers: parseInt(document.getElementById('club-max-members').value),
        meetingDay: document.getElementById('club-meeting-day').value,
        contact: document.getElementById('club-contact').value.trim(),
        tags: [...clubFormSelectedTags]
    };
    
    // Валидация
    if (formData.tags.length === 0) {
        alert('Пожалуйста, выберите хотя бы один тег');
        return;
    }
    
    if (formData.tags.length > 5) {
        alert('Можно выбрать не более 5 тегов');
        return;
    }
    
    // Создаем новый клуб
    const newClub = {
        id: Date.now(),
        ...formData,
        members: 1, // Создатель - первый участник
        activity: 'medium',
        createdDate: new Date().toISOString().split('T')[0],
        creator: 'Вы' // Можно добавить имя пользователя из MAX
    };
    
    // Добавляем в mockData
    mockData.clubs.push(newClub);
    
    // Закрываем модальное окно
    closeAllServiceModals();
    
    // Показываем уведомление об успехе
    showSuccessMessage(`🎉 Клуб "${newClub.name}" успешно создан!`);
    
    // Обновляем отображение клубов
    filterClubs();
    
    // Сохраняем в localStorage
    saveClubsToLocalStorage();
}

// 🔥 ПОКАЗАТЬ СООБЩЕНИЕ ОБ УСПЕХЕ
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// 🔥 ФОРМАТИРОВАНИЕ ФОРМАТА КЛУБА ДЛЯ ОТОБРАЖЕНИЯ
function getClubFormatText(format) {
    const formats = {
        'open': 'Открытый',
        'approval': 'По заявке', 
        'closed': 'Закрытый'
    };
    return formats[format] || format;
}

// 🔥 Закрываем все модалки сервисов
function closeAllServiceModals() {
    const existingModals = document.querySelectorAll('.service-modal');
    existingModals.forEach(modal => {
        document.body.removeChild(modal);
    });
}

// 🔥 МОДАЛЬНОЕ ОКНО ДЛЯ СЕРВИСОВ
function showServiceModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>${content}</p>
                <div class="service-actions">
                    <button class="btn-secondary">Закрыть</button>
                    <button class="btn-primary">Перейти к сервису</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Обработчики закрытия
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.btn-secondary').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// 🔥 БРОНИРОВАНИЕ ПОМЕЩЕНИЙ
function openRoomBooking() {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏢 Бронирование помещений</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="booking-form" class="booking-form">
                    <div class="form-group">
                        <label>Тип помещения:</label>
                        <select id="room-type" class="form-select" required>
                            <option value="">Выберите тип</option>
                            <option value="lecture">Лекционная аудитория</option>
                            <option value="practice">Практическая аудитория</option>
                            <option value="lab">Лаборатория</option>
                            <option value="conference">Конференц-зал</option>
                            <option value="meeting">Переговорная</option>
                            <option value="sports">Спортивный зал</option>
                            <option value="event">Актовый зал</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Выберите аудиторию:</label>
                        <select id="room-select" class="form-select" required disabled>
                            <option value="">Сначала выберите тип помещения</option>
                        </select>
                        <div id="room-info" class="room-info" style="display: none; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <small><strong>Информация об аудитории:</strong></small>
                            <div id="room-details"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Дата и время:</label>
                        <input type="datetime-local" id="booking-datetime" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Продолжительность:</label>
                        <select id="booking-duration" class="form-select" required>
                            <option value="1">1 час</option>
                            <option value="2">2 часа</option>
                            <option value="3">3 часа</option>
                            <option value="4">4 часа</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Количество участников:</label>
                        <input type="number" id="participants-count" class="form-input" min="1" max="200" value="10" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Цель использования:</label>
                        <textarea id="booking-purpose" class="form-textarea" placeholder="Опишите цель бронирования..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Контактные данные:</label>
                        <input type="text" id="booking-contact" class="form-input" placeholder="Ваш Telegram или email" required>
                    </div>
                </form>
                
                <div class="service-actions">
                    <button type="button" class="btn-secondary">Отмена</button>
                    <button type="button" id="submit-booking" class="btn-primary">Забронировать</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupRoomBookingHandlers(modal);
}
// 🔥 ОБРАБОТЧИКИ ДЛЯ ФОРМЫ БРОНИРОВАНИЯ
function setupRoomBookingHandlers(modal) {
    const roomTypeSelect = modal.querySelector('#room-type');
    const roomSelect = modal.querySelector('#room-select');
    const roomInfo = modal.querySelector('#room-info');
    const roomDetails = modal.querySelector('#room-details');
    const submitBtn = modal.querySelector('#submit-booking');
    const bookingForm = modal.querySelector('#booking-form');
    
    // Обновление списка аудиторий при выборе типа
    roomTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        updateRoomOptions(roomSelect, roomInfo, roomDetails, selectedType);
    });
    
    // Показ информации об аудитории
    roomSelect.addEventListener('change', function() {
        const selectedRoomId = this.value;
        if (selectedRoomId) {
            showRoomDetails(roomDetails, selectedRoomId);
            roomInfo.style.display = 'block';
        } else {
            roomInfo.style.display = 'none';
        }
    });
    
    // Обработчик отправки формы
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleBookingSubmission(modal, bookingForm);
    });
    
    // Стандартные обработчики закрытия модалки
    setupModalHandlers(modal);
}

// 🔥 ОБНОВЛЕНИЕ СПИСКА АУДИТОРИЙ
function updateRoomOptions(roomSelect, roomInfo, roomDetails, roomType) {
    roomSelect.innerHTML = '<option value="">Выберите аудиторию</option>';
    roomInfo.style.display = 'none';
    
    if (!roomType) {
        roomSelect.disabled = true;
        return;
    }
    
    const filteredRooms = mockData.classrooms.filter(room => room.type === roomType);
    
    if (filteredRooms.length === 0) {
        roomSelect.innerHTML = '<option value="">Нет доступных аудиторий</option>';
        roomSelect.disabled = true;
        return;
    }
    
    roomSelect.disabled = false;
    
    filteredRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `${room.number} (вместимость: ${room.capacity} чел.) - ${room.building}`;
        roomSelect.appendChild(option);
    });
}

// 🔥 ПОКАЗ ИНФОРМАЦИИ ОБ АУДИТОРИИ
function showRoomDetails(roomDetails, roomId) {
    const room = mockData.classrooms.find(r => r.id == roomId);
    if (!room) return;
    
    const equipmentList = room.equipment.map(item => `• ${item}`).join('<br>');
    
    roomDetails.innerHTML = `
        <div style="font-size: 0.85rem; line-height: 1.4;">
            <div><strong>Аудитория:</strong> ${room.number}</div>
            <div><strong>Корпус:</strong> ${room.building}</div>
            <div><strong>Этаж:</strong> ${room.floor}</div>
            <div><strong>Вместимость:</strong> ${room.capacity} человек</div>
            <div><strong>Оборудование:</strong><br>${equipmentList}</div>
            <div style="color: #48bb78; margin-top: 5px;">
                <strong>✓ Доступно для бронирования</strong>
            </div>
        </div>
    `;
}

// 🔥 ОБРАБОТКА ОТПРАВКИ ФОРМЫ БРОНИРОВАНИЯ
function handleBookingSubmission(modal, form) {
    const formData = new FormData(form);
    const roomType = document.getElementById('room-type').value;
    const roomId = document.getElementById('room-select').value;
    const room = mockData.classrooms.find(r => r.id == roomId);
    
    // Валидация
    if (!roomType || !roomId) {
        alert('Пожалуйста, выберите тип помещения и конкретную аудиторию');
        return;
    }
    
    const bookingData = {
        room: room ? `${room.number} (${room.building})` : 'Неизвестная аудитория',
        roomType: roomType,
        datetime: document.getElementById('booking-datetime').value,
        duration: document.getElementById('booking-duration').value,
        participants: document.getElementById('participants-count').value,
        purpose: document.getElementById('booking-purpose').value,
        contact: document.getElementById('booking-contact').value,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Проверка вместимости
    if (room && parseInt(bookingData.participants) > room.capacity) {
        alert(`❌ Превышена вместимость аудитории! Максимум: ${room.capacity} человек`);
        return;
    }
    
    // Показываем уведомление об успехе
    showBookingSuccessNotification(bookingData, modal);
}

// 🔥 УВЕДОМЛЕНИЕ ОБ УСПЕШНОМ БРОНИРОВАНИИ
function showBookingSuccessNotification(bookingData, modal) {
    // Закрываем модалку
    document.body.removeChild(modal);
    
    // Создаем красивое уведомление
    const notification = document.createElement('div');
    notification.className = 'success-notification booking-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
                <strong>Бронирование отправлено на модерацию!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    Аудитория: ${bookingData.room}<br>
                    Дата: ${formatBookingDate(bookingData.datetime)}<br>
                    Время: ${formatBookingTime(bookingData.datetime, bookingData.duration)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    // Логируем в консоль для демонстрации
    console.log('🎯 Бронирование создано:', bookingData);
}

// 🔥 ФОРМАТИРОВАНИЕ ДАТЫ И ВРЕМЕНИ
function formatBookingDate(datetimeString) {
    const date = new Date(datetimeString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatBookingTime(datetimeString, duration) {
    const startTime = new Date(datetimeString);
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    return `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
}

// 🔥 КАЛЕНДАРЬ МЕРОПРИЯТИЙ
function showEventsCalendar() {
    if (document.querySelector('.service-modal[data-service="events"]')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    modal.setAttribute('data-service', 'events');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📅 Мероприятия университета</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="events-list">
                    <div class="event-item">
                        <div class="event-date">
                            <span class="day">15</span>
                            <span class="month">нояб</span>
                        </div>
                        <div class="event-info">
                            <h4>Хакатон MAX</h4>
                            <p>IT-соревнование для разработчиков</p>
                            <span class="event-time">🕒 10:00 - 18:00 | 🏢 Главный корпус</span>
                        </div>
                        <button class="btn-outline">Записаться</button>
                    </div>
                    
                    <div class="event-item">
                        <div class="event-date">
                            <span class="day">18</span>
                            <span class="month">нояб</span>
                        </div>
                        <div class="event-info">
                            <h4>Научная конференция</h4>
                            <p>Достижения в области компьютерных наук</p>
                            <span class="event-time">🕒 14:00 - 17:00 | 🏢 Аудитория 301</span>
                        </div>
                        <button class="btn-outline">Записаться</button>
                    </div>
                    
                    <div class="event-item">
                        <div class="event-date">
                            <span class="day">22</span>
                            <span class="month">нояб</span>
                        </div>
                        <div class="event-info">
                            <h4>Карьерный день</h4>
                            <p>Встреча с IT-компаниями и стартапами</p>
                            <span class="event-time">🕒 11:00 - 16:00 | 🏢 Актовый зал</span>
                        </div>
                        <button class="btn-outline">Записаться</button>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn-primary" style="width: 100%;">
                        📋 Показать все мероприятия
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupModalHandlers(modal);
    
    // Добавляем обработчики для кнопок "Записаться"
    modal.querySelectorAll('.btn-outline').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventTitle = this.closest('.event-item').querySelector('h4').textContent;
            alert(`🎉 Вы записаны на мероприятие: "${eventTitle}"`);
        });
    });
}

// 🔥 ОБЩИЕ ОБРАБОТЧИКИ МОДАЛОК
function setupModalHandlers(modal) {
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Закрытие по кнопке "Отмена"
    const cancelBtn = modal.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}

// 🔄 Навигация по неделям
let currentDisplayWeek = getCurrentWeek();
const currentWeekLabel = document.getElementById('current-week');
const prevBtn = document.getElementById('prev-week');
const nextBtn = document.getElementById('next-week');

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentDisplayWeek > 1) {
            currentDisplayWeek--;
            updateWeekDisplay();
            renderWeekSchedule();
        }
    });

    nextBtn.addEventListener('click', () => {
        currentDisplayWeek++;
        updateWeekDisplay();
        renderWeekSchedule();
    });
}

function updateWeekDisplay() {
    if (currentWeekLabel) {
        currentWeekLabel.textContent = `Неделя ${currentDisplayWeek}`;
    }
}

// 📆 Месячный вид
document.getElementById('month-view')?.addEventListener('click', () => {
    alert("📆 Месячный вид в разработке! Скоро будет доступен.");
});

// 🛠 Вспомогательные функции
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long' 
    });
}

// 🔥 УМНЫЙ ПОИСК КЛУБОВ
let currentFilters = {
    searchText: '',
    category: 'all',
    activity: 'any',
    day: 'any',
    size: 'any'
};

function initializeSmartSearch() {
    const searchInput = document.getElementById('club-search');
    const smartFiltersBtn = document.getElementById('smart-filters-btn');
    const quickFilters = document.querySelectorAll('.quick-filters .filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Поиск по тексту
    searchInput.addEventListener('input', (e) => {
        currentFilters.searchText = e.target.value.toLowerCase();
        filterClubs();
    });

    // Кнопка умных фильтров
    smartFiltersBtn.addEventListener('click', () => {
        const filtersPanel = document.getElementById('smart-filters');
        filtersPanel.classList.toggle('hidden');
    });

    // Быстрые фильтры
    quickFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            quickFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            currentFilters.category = filter;
            filterClubs();
        });
    });

    // Применение умных фильтров
    applyFiltersBtn.addEventListener('click', applySmartFilters);
    
    // Сброс фильтров
    resetFiltersBtn.addEventListener('click', resetFilters);
}

function applySmartFilters() {
    currentFilters.activity = document.getElementById('activity-filter').value;
    currentFilters.day = document.getElementById('day-filter').value;
    currentFilters.size = document.getElementById('size-filter').value;
    
    filterClubs();
    document.getElementById('smart-filters').classList.add('hidden');
}

function resetFilters() {
    currentFilters = {
        searchText: '',
        category: 'all',
        activity: 'any',
        day: 'any',
        size: 'any'
    };
    
    document.getElementById('club-search').value = '';
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === 'all') btn.classList.add('active');
    });
    
    document.getElementById('activity-filter').value = 'any';
    document.getElementById('day-filter').value = 'any';
    document.getElementById('size-filter').value = 'any';
    
    filterClubs();
}

function filterClubs() {
    const filteredClubs = mockData.clubs.filter(club => {
        // Поиск по тексту (умный - ищет в названии, описании и тегах)
        if (currentFilters.searchText) {
            const searchText = currentFilters.searchText;
            const searchIn = `${club.name} ${club.desc} ${club.tags.join(' ')}`.toLowerCase();
            if (!searchIn.includes(searchText)) return false;
        }

        // Быстрые фильтры по категориям
        if (currentFilters.category !== 'all') {
            switch (currentFilters.category) {
                case 'popular':
                    if (club.members < 50) return false;
                    break;
                case 'tech':
                    if (club.category !== 'tech') return false;
                    break;
                case 'creative':
                    if (club.category !== 'creative') return false;
                    break;
                case 'sports':
                    if (club.category !== 'sports') return false;
                    break;
                case 'new':
                    if (club.members > 30 || club.activity === 'high') return false;
                    break;
            }
        }

        // Умные фильтры
        if (currentFilters.activity !== 'any' && club.activity !== currentFilters.activity) {
            return false;
        }

        if (currentFilters.day !== 'any' && club.meetingDay !== currentFilters.day) {
            return false;
        }

        if (currentFilters.size !== 'any') {
            const size = getClubSize(club.members);
            if (size !== currentFilters.size) return false;
        }

        return true;
    });

    renderFilteredClubs(filteredClubs);
}

function getClubSize(members) {
    if (members < 30) return 'small';
    if (members < 80) return 'medium';
    return 'large';
}

// 🔥 ОБНОВИМ РЕНДЕРИНГ КЛУБОВ С НОВЫМИ ПОЛЯМИ
function renderFilteredClubs(clubs) {
    const container = document.getElementById('clubs-list');
    const noResults = document.getElementById('no-results');

    if (clubs.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');
    container.innerHTML = '';

    clubs.forEach(club => {
        const div = document.createElement('div');
        div.className = `club-card activity-${club.activity}`;
        
        const memberInfo = club.maxMembers > 0 ? 
            `${club.members}/${club.maxMembers} участников` : 
            `${club.members} участников`;
            
        div.innerHTML = `
            <div class="club-icon">${club.icon}</div>
            <div class="club-info">
                <div class="club-header">
                    <h3>${club.name}</h3>
                    <span class="club-format ${club.format}">${getClubFormatText(club.format)}</span>
                </div>
                <p>${club.desc}</p>
                <div class="club-meta">
                    <span class="members">👥 ${memberInfo}</span>
                    <span class="club-activity">${getActivityText(club.activity)}</span>
                </div>
                <div class="club-tags">
                    <small>📅 ${club.meetingDay} • 🏷️ ${club.tags.slice(0, 3).join(', ')}</small>
                </div>
                <div class="club-contact">
                    <small>📞 ${club.contact}</small>
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            showClubDetails(club);
        });

        container.appendChild(div);
    });
}

function getActivityText(activity) {
    const texts = {
        high: 'Высокая активность',
        medium: 'Средняя активность', 
        low: 'Низкая активность'
    };
    return texts[activity] || activity;
}

function showClubDetails(club) {
    const memberInfo = club.maxMembers > 0 ? 
        `${club.members}/${club.maxMembers} участников` : 
        `${club.members} участников`;
    
    const formatIcon = club.format === 'open' ? '🔓 Открытый' : 
                      club.format === 'closed' ? '🔒 Закрытый' : 
                      '📝 По заявке';
    
    const message = `
🎯 ${club.name}
${club.desc}

📊 Информация:
• Участников: ${memberInfo}
• Формат: ${formatIcon}
• Активность: ${getActivityText(club.activity)}
• Встречи: ${club.meetingDay}
• Контакт: ${club.contact}

🏷️ Теги: ${club.tags.join(', ')}

Хочешь присоединиться? Напиши в клуб! ✨
    `;
    
    alert(message);
}


function renderFilteredClubs(clubs) {
    const container = document.getElementById('clubs-list');
    const noResults = document.getElementById('no-results');

    if (clubs.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.classList.remove('hidden');
        return;
    }

    if (noResults) noResults.classList.add('hidden');
    container.innerHTML = '';

    clubs.forEach(club => {
        const div = document.createElement('div');
        div.className = `club-card activity-${club.activity}`;
        
        // 🔥 ВОЗВРАЩАЕМ СТАРЫЙ ФОРМАТ
        div.innerHTML = `
            <div class="club-icon">${club.icon}</div>
            <div class="club-info">
                <h3>${club.name}</h3>
                <p>${club.desc}</p>
                <div class="club-meta">
                    <span class="members">👥 ${club.members} участников</span>
                    <span class="contact">${club.contact}</span>
                </div>
                <div class="club-tags">
                    <small>📅 ${club.meetingDay} • ${getActivityText(club.activity)} • ${club.format === 'open' ? '🔓' : club.format === 'closed' ? '🔒' : '📝'}</small>
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => {
            showClubDetails(club);
        });

        container.appendChild(div);
    });
}

function initializeClubForm() {
    console.log('🎯 Инициализация формы создания клуба...');
    
    // Сбрасываем выбранные теги
    clubFormSelectedTags = [];
    updateClubFormTagsDisplay();
    
    // Инициализация тегов
    initializeTags();
    
    // Инициализация эмодзи
    initializeEmojiPicker();
    
    console.log('✅ Форма инициализирована');
}

function initializeTags() {
    console.log('🎯 Инициализация тегов...');
    const tagsContainer = document.getElementById('club-tags-selector');
    if (!tagsContainer) {
        console.error('❌ Контейнер тегов не найден!');
        return;
    }
    
    tagsContainer.innerHTML = '';
    
    availableTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-option-form';
        tagElement.textContent = tag;
        tagElement.addEventListener('click', () => {
            toggleTagSelection(tag, tagElement);
        });
        tagsContainer.appendChild(tagElement);
    });
    console.log('✅ Теги инициализированы');
}


function toggleTagSelection(tag, element) {
    const index = clubFormSelectedTags.indexOf(tag);
    
    if (index === -1) {
        if (clubFormSelectedTags.length < 5) {
            clubFormSelectedTags.push(tag);
            element.classList.add('selected');
        } else {
            alert('Можно выбрать не более 5 тегов');
            return;
        }
    } else {
        clubFormSelectedTags.splice(index, 1);
        element.classList.remove('selected');
    }
    
    updateClubFormTagsDisplay();
}

function updateClubFormTagsDisplay() {
    const selectedTagsContainer = document.getElementById('club-selected-tags');
    if (!selectedTagsContainer) return;
    
    selectedTagsContainer.innerHTML = '';
    
    clubFormSelectedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'selected-tag';
        tagElement.innerHTML = `
            ${tag}
            <span class="remove-tag" data-tag="${tag}">×</span>
        `;
        selectedTagsContainer.appendChild(tagElement);
    });
    
    // Обработчики удаления тегов
    selectedTagsContainer.querySelectorAll('.remove-tag').forEach(removeBtn => {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tagToRemove = removeBtn.getAttribute('data-tag');
            removeTag(tagToRemove);
        });
    });
}



// 🔥 УДАЛЕНИЕ ТЕГА (добавь эту функцию)
function removeTag(tag) {
    clubFormSelectedTags = clubFormSelectedTags.filter(t => t !== tag);
    updateClubFormTagsDisplay();
    
    // Обновляем основной список тегов
    const tagsContainer = document.getElementById('club-tags-selector');
    if (tagsContainer) {
        const tagElements = tagsContainer.querySelectorAll('.tag-option-form');
        tagElements.forEach(element => {
            if (element.textContent === tag) {
                element.classList.remove('selected');
            }
        });
    }
}


// 🔥 ИНИЦИАЛИЗАЦИЯ ЭМОДЗИ (добавь эту функцию)
function initializeEmojiPicker() {
    console.log('🎯 Инициализация эмодзи...');
    const emojiGrid = document.getElementById('emoji-grid');
    const emojiCategories = document.querySelectorAll('.emoji-category');
    const iconInput = document.getElementById('club-icon');
    
    if (!emojiGrid || !iconInput) {
        console.error('❌ Элементы эмодзи не найдены!');
        return;
    }
    
    const emojiCategoriesData = {
        popular: ['🎨', '💻', '🏀', '🎭', '🔬', '♟️', '🌍', '🎵', '📚', '⚽', '🎮', '📷'],
        activities: ['⚽', '🏀', '🎾', '🏊', '🚴', '🎯', '🎮', '🎲', '♟️', '🎨', '🎭', '🎵'],
        objects: ['💻', '📚', '🔬', '📷', '🎤', '🎸', '🎧', '🖌️', '📝', '🌱', '🔍', '💡']
    };
    
    function showEmojis(category) {
        emojiGrid.innerHTML = '';
        const emojis = emojiCategoriesData[category] || [];
        
        emojis.forEach(emoji => {
            const emojiElement = document.createElement('div');
            emojiElement.className = 'emoji-option';
            emojiElement.textContent = emoji;
            emojiElement.addEventListener('click', () => {
                iconInput.value = emoji;
                // Скрываем пикер после выбора
                document.querySelectorAll('.emoji-picker').forEach(picker => {
                    picker.style.display = 'none';
                });
            });
            emojiGrid.appendChild(emojiElement);
        });
    }
    
    // Показываем популярные эмодзи по умолчанию
    showEmojis('popular');
    
    // Обработчики категорий
    emojiCategories.forEach(categoryBtn => {
        categoryBtn.addEventListener('click', () => {
            emojiCategories.forEach(btn => btn.classList.remove('active'));
            categoryBtn.classList.add('active');
            showEmojis(categoryBtn.dataset.category);
        });
    });
    
    // Открытие/закрытие пикера
    iconInput.addEventListener('click', () => {
        const picker = document.querySelector('.emoji-picker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    console.log('✅ Эмодзи инициализированы');
}


// 🔥 ОБРАБОТЧИКИ ЗАКРЫТИЯ МОДАЛКИ
function setupClubModalHandlers() {
    console.log('🎯 Настройка обработчиков модалки...');
    const modal = document.getElementById('create-club-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('create-club-form');
    
    if (!closeBtn || !cancelBtn || !form) {
        console.error('❌ Элементы модалки не найдены!');
        return;
    }
    
    // Функция закрытия модалки
    function closeModal() {
        console.log('🔒 Закрытие модалки...');
        modal.classList.add('hidden');
        form.reset();
        clubFormSelectedTags = [];
        updateClubFormTagsDisplay();
    }
    
    // Вешаем обработчики
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Закрытие по клику вне модалки
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Обработчик отправки формы
    form.addEventListener('submit', handleClubCreation);
    
    // Счетчик символов
    const descTextarea = document.getElementById('club-desc');
    const charCounter = document.getElementById('desc-chars');
    
    if (descTextarea && charCounter) {
        descTextarea.addEventListener('input', () => {
            charCounter.textContent = descTextarea.value.length;
        });
    }
    
    console.log('✅ Обработчики модалки установлены');
}

// 🔥 ОБНОВЛЕННАЯ ФУНКЦИЯ renderClubs
// 🎭 Клубы - ТОЛЬКО первоначальная загрузка
function renderClubs() {
    const container = document.getElementById('clubs-list');
    if (!container) return;

    // Очищаем только список клубов, не трогая поиск
    container.innerHTML = '';

    // Инициализируем умный поиск
    initializeSmartSearch();
    
    // Первоначальная отрисовка всех клубов
    renderFilteredClubs(mockData.clubs);
}


// 🔥 ФУНКЦИЯ ДЛЯ РАСЧЕТА РЕЛЕВАНТНОСТИ
function calculateRelevance(club, searchText) {
    let score = 0;
    const searchLower = searchText.toLowerCase();
    
    // Название - самый высокий приоритет
    if (club.name.toLowerCase().includes(searchLower)) {
        score += 10;
        // Точное совпадение с названием - максимальный приоритет
        if (club.name.toLowerCase() === searchLower) {
            score += 20;
        }
    }
    
    // Теги - высокий приоритет
    const tagMatches = club.tags.filter(tag => 
        tag.toLowerCase().includes(searchLower)
    ).length;
    score += tagMatches * 5;
    
    // Описание - средний приоритет
    if (club.desc.toLowerCase().includes(searchLower)) {
        score += 3;
    }
    
    // Категория и день - низкий приоритет
    if (club.category.toLowerCase().includes(searchLower) || 
        club.meetingDay.toLowerCase().includes(searchLower)) {
        score += 1;
    }
    
    return score;
}

// 🔥 ПОДСВЕТКА СОВПАДЕНИЙ В ПОИСКЕ
function highlightSearchMatches(club, searchText) {
    const result = {};
    const searchLower = searchText.toLowerCase();
    const highlight = (text) => text.replace(
        new RegExp(searchText, 'gi'),
        match => `<mark style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">${match}</mark>`
    );
    
    if (club.name.toLowerCase().includes(searchLower)) {
        result.name = highlight(club.name);
    }
    
    if (club.desc.toLowerCase().includes(searchLower)) {
        result.desc = highlight(club.desc);
    }
    
    return result;
}

// 🔹 Инициализация при загрузке
initializeApp();