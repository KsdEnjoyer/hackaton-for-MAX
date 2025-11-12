// student_inter.js - Студенческий интерфейс

// 🔥 ПЕРЕМЕННЫЕ ДЛЯ КЛУБОВ И МЕРОПРИЯТИЙ
let clubFormSelectedTags = [];
let availableTags = [
    "программирование", "искусство", "спорт", "наука", "музыка", 
    "танцы", "театр", "кино", "фотография", "дизайн",
    "робототехника", "ai", "хакатоны", "стартапы", "веб-разработка",
    "мобильная разработка", "data science", "киберспорт", "настольные игры",
    "волонтерство", "экология", "путешествия", "кулинария", "йога",
    "медитация", "психология", "литература", "поэзия", "дебаты"
];

let currentFilters = {
    searchText: '',
    category: 'all',
    activity: 'any',
    day: 'any',
    size: 'any'
};

let currentDisplayWeek = getCurrentWeek();

// 🔥 ОСНОВНЫЕ ФУНКЦИИ СТУДЕНЧЕСКОГО ИНТЕРФЕЙСА

// 🔥 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ДЛЯ СТУДЕНТОВ
function initializeStudentApp() {
  console.log('🎯 Инициализация интерфейса студента...');
  
  // Загружаем сохраненные данные
  if (typeof loadEventsFromLocalStorage === 'function') loadEventsFromLocalStorage();
  if (typeof loadClubsFromLocalStorage === 'function') loadClubsFromLocalStorage();
  
  // Инициализируем студенческое приложение
  setupStudentApp();
}

// 🔥 ОСНОВНАЯ ФУНКЦИЯ ДЛЯ СТУДЕНТОВ
// 🔥 ОСНОВНАЯ ФУНКЦИЯ ДЛЯ СТУДЕНТОВ
function setupStudentApp() {
  console.log('🎯 Запуск setupStudentApp...');
  
  // 🔥 ПРИНУДИТЕЛЬНО ПОКАЗЫВАЕМ ПАНЕЛЬ НАВИГАЦИИ
  const tabs = document.querySelector('.tabs');
  if (tabs) {
    tabs.classList.remove('hidden');
    console.log('✅ Панель восстановлена в setupStudentApp');
  }
  
  setupNavigation();
  setupServices();
  updateWeekInfo();
  renderTodaySchedule();
  renderNews();
  renderWeekSchedule();
  renderClubs();
  
  // 🔥 ИНИЦИАЛИЗИРУЕМ НАВИГАЦИЮ ПО НЕДЕЛЯМ
  setupWeekNavigation();
  
  console.log('✅ setupStudentApp завершен');
}

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
  
  // Берем расписание текущего университета
  const universitySchedule = getUniversityData('schedule');
  const todayData = universitySchedule.find(day => day.date === today);

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

  // Берем новости текущего университета
  const universityNews = getUniversityData('news');

  // Сортируем новости по приоритету
  const sortedNews = [...universityNews].sort((a, b) => {
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

  // Берем расписание текущего университета
  const universitySchedule = getUniversityData('schedule');

  universitySchedule.forEach(dayData => {
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

// ⚙️ Сервисы
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
// 🔥 ОДИН обработчик для всех сервисов
function handleServiceClick(event) {
    const card = event.currentTarget;
    const service = card.getAttribute('data-service');
    
    console.log('🎯 Клик по сервису:', service);
    
    // Закрываем все открытые модалки перед открытием новой
    closeAllServiceModals();
    
    switch(service) {
        case 'library':
            showServiceModal('📚 Библиотека', 
                'Данный сервис пока не реализован, но мы займемся этим позже, но вы не расстраивайтесь, посмотрите на остальные сервисы, они хороши, поверьте мне )');
            break;
            
        case 'documents':
            // 🔥 ЗАМЕНИМ НА НОВЫЙ ФУНКЦИОНАЛ
            openDocumentsService();
            break;
            
        case 'dormitory':
            // 🔥 ЗАМЕНИМ НА НОВЫЙ ФУНКЦИОНАЛ
            openDormitoryService();
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
    
    // Берем аудитории текущего университета
    const universityClassrooms = getUniversityData('classrooms');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏢 Бронирование помещений - ${authService.currentUniversity?.shortName}</h3>
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
                            <option value="dojo">Додзё</option>
                            <option value="training">Тренировочный зал</option>
                            <option value="outdoor">Открытая площадка</option>
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
    setupRoomBookingHandlers(modal, universityClassrooms);
}

// 🔥 ОБРАБОТЧИКИ ДЛЯ ФОРМЫ БРОНИРОВАНИЯ
function setupRoomBookingHandlers(modal, classrooms) {
    const roomTypeSelect = modal.querySelector('#room-type');
    const roomSelect = modal.querySelector('#room-select');
    const roomInfo = modal.querySelector('#room-info');
    const roomDetails = modal.querySelector('#room-details');
    const submitBtn = modal.querySelector('#submit-booking');
    const bookingForm = modal.querySelector('#booking-form');
    
    // Обновление списка аудиторий при выборе типа
    roomTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        updateRoomOptions(roomSelect, roomInfo, roomDetails, selectedType, classrooms);
    });
    
    // Показ информации об аудитории
    roomSelect.addEventListener('change', function() {
        const selectedRoomId = this.value;
        if (selectedRoomId) {
            showRoomDetails(roomDetails, selectedRoomId, classrooms);
            roomInfo.style.display = 'block';
        } else {
            roomInfo.style.display = 'none';
        }
    });
    
    // Обработчик отправки формы
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleBookingSubmission(modal, bookingForm, classrooms);
    });
    
    // Стандартные обработчики закрытия модалки
    setupModalHandlers(modal);
}

// 🔥 ОБНОВЛЕНИЕ СПИСКА АУДИТОРИЙ
function updateRoomOptions(roomSelect, roomInfo, roomDetails, roomType, classrooms) {
    roomSelect.innerHTML = '<option value="">Выберите аудиторию</option>';
    roomInfo.style.display = 'none';
    
    if (!roomType) {
        roomSelect.disabled = true;
        return;
    }
    
    const filteredRooms = classrooms.filter(room => room.type === roomType);
    
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
function showRoomDetails(roomDetails, roomId, classrooms) {
    const room = classrooms.find(r => r.id == roomId);
    if (!room) return;
    
    roomDetails.innerHTML = `
        <div><strong>Номер:</strong> ${room.number}</div>
        <div><strong>Тип:</strong> ${getRoomTypeText(room.type)}</div>
        <div><strong>Вместимость:</strong> ${room.capacity} человек</div>
        <div><strong>Этаж:</strong> ${room.floor}</div>
        <div><strong>Корпус:</strong> ${room.building}</div>
        <div><strong>Оборудование:</strong> ${room.equipment.join(', ')}</div>
    `;
}

function getRoomTypeText(type) {
    const types = {
        'lecture': 'Лекционная',
        'practice': 'Практическая',
        'lab': 'Лаборатория',
        'conference': 'Конференц-зал',
        'meeting': 'Переговорная',
        'sports': 'Спортивный зал',
        'event': 'Актовый зал',
        'dojo': 'Додзё',
        'training': 'Тренировочный зал',
        'outdoor': 'Открытая площадка'
    };
    return types[type] || type;
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
    
    // Берем мероприятия текущего университета
    const universityEvents = getUniversityData('events');
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📅 Мероприятия - ${authService.currentUniversity?.shortName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="events-filter">
                    <button class="filter-btn active" data-filter="all">Все</button>
                    <button class="filter-btn" data-filter="hackathon">Хакатоны</button>
                    <button class="filter-btn" data-filter="conference">Конференции</button>
                    <button class="filter-btn" data-filter="workshop">Мастер-классы</button>
                    <button class="filter-btn" data-filter="career">Карьера</button>
                    <button class="filter-btn" data-filter="tournament">Турниры</button>
                    <button class="filter-btn" data-filter="field_training">Полевые</button>
                    <button class="filter-btn" data-filter="masterclass">Мастер-классы</button>
                </div>
                
                <div class="events-list" id="events-list">
                    <!-- Мероприятия будут рендериться через JS -->
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
    
    // Рендерим мероприятия из текущего университета
    renderEventsFromDatabase('all', universityEvents);
    setupEventsFilterHandlers(modal, universityEvents);
}

// 🔥 РЕНДЕРИНГ МЕРОПРИЯТИЙ ИЗ БАЗЫ ДАННЫХ
function renderEventsFromDatabase(filter = 'all', events = null) {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) {
        console.log('❌ Контейнер мероприятий не найден');
        return;
    }
    
    // Используем переданные мероприятия или берем из текущего университета
    const universityEvents = events || getUniversityData('events');
    
    console.log('🎯 Рендерим мероприятия. Фильтр:', filter, 'Количество:', universityEvents.length);

    // Фильтруем мероприятия
    const filteredEvents = filter === 'all' 
        ? universityEvents 
        : universityEvents.filter(event => event.type === filter);

    eventsList.innerHTML = '';

    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <div class="no-events-icon">🔍</div>
                <h3>Мероприятия не найдены</h3>
                <p>Попробуйте изменить фильтр</p>
            </div>
        `;
        return;
    }

    filteredEvents.forEach(event => {
        const isRegistered = isUserRegisteredForEvent(event.id);
        const registeredCount = event.registeredUsers ? event.registeredUsers.length : 0;
        const spotsLeft = event.capacity - registeredCount;
        
        const eventElement = document.createElement('div');
        eventElement.className = `event-item ${isRegistered ? 'registered' : ''}`;
        eventElement.setAttribute('data-event-id', event.id);
        
        eventElement.innerHTML = `
            <div class="event-date">
                <span class="day">${new Date(event.date).getDate()}</span>
                <span class="month">${new Date(event.date).toLocaleDateString('ru-RU', { month: 'short' })}</span>
            </div>
            <div class="event-info">
                <div class="event-header">
                    <h4>${event.image} ${event.title}</h4>
                    <span class="event-type ${event.type}">${getEventTypeText(event.type)}</span>
                </div>
                <p>${event.description}</p>
                <span class="event-time">🕒 ${event.time} | 🏢 ${event.location}</span>
                <div class="event-stats">
                    <span class="participants-count">👥 ${registeredCount}/${event.capacity} записалось</span>
                    <span class="spots-left">${spotsLeft > 0 ? `✅ ${spotsLeft} мест осталось` : '❌ Мест нет'}</span>
                </div>
                <div class="event-organizer">
                    <small>Организатор: ${event.organizer}</small>
                </div>
                ${isRegistered ? `
                    <div class="registration-info">
                        <small>🎉 Вы записаны на это мероприятие</small>
                    </div>
                ` : ''}
            </div>
            <div class="event-actions">
                ${isRegistered ? `
                    <button class="event-unregister-btn" data-event-id="${event.id}">
                        <span class="btn-text">Отписаться</span>
                        <span class="btn-icon">❌</span>
                    </button>
                ` : `
                    <button class="event-register-btn ${spotsLeft <= 0 ? 'disabled' : ''}" 
                            data-event-id="${event.id}"
                            ${spotsLeft <= 0 ? 'disabled' : ''}>
                        <span class="btn-text">${spotsLeft <= 0 ? 'Мест нет' : 'Записаться'}</span>
                        <span class="btn-icon">${spotsLeft <= 0 ? '❌' : '📝'}</span>
                    </button>
                `}
            </div>
        `;
        
        eventsList.appendChild(eventElement);
    });
    
    // Обновляем обработчики для кнопок
    setupEventRegistrationHandlers();
    setupEventUnregistrationHandlers();
    
    console.log('✅ Мероприятия отрендерены:', filteredEvents.length);
}

// 🔥 ФУНКЦИЯ ДЛЯ ТЕКСТА ТИПА МЕРОПРИЯТИЯ
function getEventTypeText(type) {
    const types = {
        'hackathon': 'Хакатон',
        'conference': 'Конференция',
        'workshop': 'Мастер-класс',
        'career': 'Карьера',
        'tournament': 'Турнир',
        'field_training': 'Полевое занятие',
        'masterclass': 'Мастер-класс'
    };
    return types[type] || type;
}

// 🔥 ФИЛЬТРАЦИЯ МЕРОПРИЯТИЙ
function setupEventsFilterHandlers(modal) {
    const filterButtons = modal.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            renderEventsFromDatabase(filter);
        });
    });
}

// 🔥 ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ЗАПИСИ НА МЕРОПРИЯТИЯ
function setupEventRegistrationHandlers() {
    const registerButtons = document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)');
    
    console.log('🎯 Найдено кнопок записи:', registerButtons.length);
    
    registerButtons.forEach(btn => {
        // Убираем старые обработчики
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Вешаем новые обработчики
    document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            console.log('🎯 Клик по записи на мероприятие:', eventId);
            
            const event = mockData.events.find(e => e.id === eventId);
            
            if (!event) {
                console.error('❌ Мероприятие не найдено:', eventId);
                return;
            }
            
            // Проверяем, есть ли еще места
            const registeredCount = event.registeredUsers ? event.registeredUsers.length : 0;
            if (registeredCount >= event.capacity) {
                alert('❌ Извините, все места заняты!');
                return;
            }
            
            // Записываем пользователя
            registerUserForEvent(eventId, this);
        });
    });
}

// 🔥 ФУНКЦИЯ ЗАПИСИ ПОЛЬЗОВАТЕЛЯ НА МЕРОПРИЯТИЕ
function registerUserForEvent(eventId, button) {
    const event = mockData.events.find(e => e.id === eventId);
    if (!event) {
        console.error('❌ Мероприятие не найдено');
        return;
    }

    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    // Блокируем кнопку на время "записи"
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    // Анимация процесса записи
    btnText.textContent = 'Записываем...';
    btnIcon.textContent = '⏳';
    button.classList.add('registering');
    
    console.log('🎯 Начинаем запись пользователя', authService.currentUser.id, 'на мероприятие', eventId);
    
    // Имитируем запрос к серверу
    setTimeout(() => {
        // Инициализируем массив если его нет
        if (!event.registeredUsers) {
            event.registeredUsers = [];
        }
        
        // Добавляем пользователя в список записанных
        if (!event.registeredUsers.includes(authService.currentUser.id)) {
            event.registeredUsers.push(authService.currentUser.id);
            
            // Сохраняем в localStorage
            saveEventsToLocalStorage();
            
            // Показываем уведомление
            showEventRegistrationSuccess(event.title);
            
            // 🔥 ПЕРЕРИСОВЫВАЕМ ВСЕ МЕРОПРИЯТИЯ
            const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
            renderEventsFromDatabase(currentFilter);
        }
        
    }, 1000);
}

// 🔥 ФУНКЦИЯ ОБРАБОТКИ ОТПИСКИ ОТ МЕРОПРИЯТИЯ
function setupEventUnregistrationHandlers() {
    const unregisterButtons = document.querySelectorAll('.event-unregister-btn');
    
    unregisterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            const event = mockData.events.find(e => e.id === eventId);
            
            if (!event) return;
            
            // Подтверждение отписки
            if (confirm(`Вы уверены, что хотите отписаться от мероприятия "${event.title}"?`)) {
                unregisterUserFromEvent(eventId, this);
            }
        });
    });
}

// 🔥 ФУНКЦИЯ ОТПИСКИ ПОЛЬЗОВАТЕЛЯ ОТ МЕРОПРИЯТИЯ
function unregisterUserFromEvent(eventId, button) {
    const event = mockData.events.find(e => e.id === eventId);
    if (!event) return;

    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    // Блокируем кнопку на время "отписки"
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    // Анимация процесса отписки
    btnText.textContent = 'Отписываемся...';
    btnIcon.textContent = '⏳';
    button.classList.add('unregistering');
    
    // Имитируем запрос к серверу
    setTimeout(() => {
        // Удаляем пользователя из списка записанных
        if (event.registeredUsers) {
            const userIndex = event.registeredUsers.indexOf(authService.currentUser.id);
            if (userIndex !== -1) {
                event.registeredUsers.splice(userIndex, 1);
                
                // Сохраняем в localStorage
                saveEventsToLocalStorage();
                
                // Показываем уведомление об успешной отписке
                showEventUnregistrationSuccess(event.title);
                
                // 🔥 ПЕРЕРИСОВЫВАЕМ ВСЕ МЕРОПРИЯТИЯ
                const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
                renderEventsFromDatabase(currentFilter);
            }
        }
        
    }, 1000);
}

// 🔥 УВЕДОМЛЕНИЕ ОБ УСПЕШНОЙ ЗАПИСИ
function showEventRegistrationSuccess(eventTitle) {
    const notification = document.createElement('div');
    notification.className = 'success-notification event-registration-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎉</span>
            <div class="notification-text">
                <strong>Вы успешно записаны!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    Мероприятие: "${eventTitle}"
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 4 секунды
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// 🔥 УВЕДОМЛЕНИЕ ОБ УСПЕШНОЙ ОТПИСКЕ
function showEventUnregistrationSuccess(eventTitle) {
    const notification = document.createElement('div');
    notification.className = 'success-notification event-unregistration-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">👋</span>
            <div class="notification-text">
                <strong>Вы отписались от мероприятия</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    "${eventTitle}"
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 4 секунды
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 4000);
}

// 🔥 ПРОВЕРКА ЗАПИСАН ЛИ ПОЛЬЗОВАТЕЛЬ НА МЕРОПРИЯТИЕ
function isUserRegisteredForEvent(eventId) {
    if (!authService.currentUser) return false;
    
    const event = mockData.events.find(e => e.id === eventId);
    if (!event || !event.registeredUsers) return false;
    
    return event.registeredUsers.includes(authService.currentUser.id);
}

// 🔥 СОХРАНЕНИЕ МЕРОПРИЯТИЙ В LOCALSTORAGE
function saveEventsToLocalStorage() {
    try {
        localStorage.setItem('universityEvents', JSON.stringify(mockData.events));
        console.log('💾 Мероприятия сохранены в localStorage');
    } catch (error) {
        console.error('❌ Ошибка сохранения мероприятий:', error);
    }
}

// 🔥 ЗАГРУЗКА МЕРОПРИЯТИЙ ИЗ LOCALSTORAGE
function loadEventsFromLocalStorage() {
    try {
        const savedEvents = localStorage.getItem('universityEvents');
        if (savedEvents) {
            const parsedEvents = JSON.parse(savedEvents);
            
            // Обновляем мероприятия с сохраненными данными о записях
            parsedEvents.forEach(savedEvent => {
                const existingEvent = mockData.events.find(e => e.id === savedEvent.id);
                if (existingEvent && savedEvent.registeredUsers) {
                    existingEvent.registeredUsers = savedEvent.registeredUsers;
                }
            });
            console.log('💾 Данные о записях загружены из localStorage');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки мероприятий:', error);
    }
}

// 🔥 СОЗДАНИЕ КЛУБОВ
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

// 🔥 ОБНОВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ КЛУБА
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
    
    // Проверка обязательных полей
    if (!formData.name || !formData.desc || !formData.category || !formData.meetingDay || !formData.contact) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Создаем новый клуб
    const newClub = {
        id: Date.now(),
        university_id: authService.currentUniversity.id,
        ...formData,
        members: 1,
        activity: 'medium',
        createdDate: new Date().toISOString().split('T')[0],
        creator: 'Вы'
    };
    
    // Добавляем в mockData
    mockData.clubs.push(newClub);
    
    // 🔥 ЗАКРЫВАЕМ МОДАЛКУ АВТОМАТИЧЕСКИ
    const modal = document.getElementById('create-club-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Сбрасываем форму
    const form = document.getElementById('create-club-form');
    if (form) {
        form.reset();
        clubFormSelectedTags = [];
        updateClubFormTagsDisplay();
    }
    
    // 🔥 ПОКАЗЫВАЕМ УВЕДОМЛЕНИЕ ОБ УСПЕХЕ
    showClubCreationSuccessNotification(newClub);
    
    // Обновляем отображение клубов
    filterClubs();
    
    // Сохраняем в localStorage
    saveClubsToLocalStorage();
}

// 🔥 ФУНКЦИЯ УВЕДОМЛЕНИЯ ОБ УСПЕШНОМ СОЗДАНИИ КЛУБА
function showClubCreationSuccessNotification(club) {
    const notification = document.createElement('div');
    notification.className = 'success-notification club-creation-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎉</span>
            <div class="notification-text">
                <strong>Клуб "${club.name}" успешно создан!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    Формат: ${getClubFormatText(club.format)}<br>
                    Участники: ${club.members}/${club.maxMembers > 0 ? club.maxMembers : '∞'}<br>
                    Встречи: ${club.meetingDay}
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
    console.log('🎯 Клуб создан:', club);
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

// 🔥 ФУНКЦИЯ СОХРАНЕНИЯ КЛУБОВ
function saveClubsToLocalStorage() {
    try {
        localStorage.setItem('userClubs', JSON.stringify(mockData.clubs));
        console.log('💾 Клубы сохранены в localStorage');
    } catch (error) {
        console.error('❌ Ошибка сохранения в localStorage:', error);
    }
}

// 🔥 ФУНКЦИЯ ЗАГРУЗКИ КЛУБОВ
function loadClubsFromLocalStorage() {
    try {
        const savedClubs = localStorage.getItem('userClubs');
        if (savedClubs) {
            const parsedClubs = JSON.parse(savedClubs);
            parsedClubs.forEach(savedClub => {
                if (!mockData.clubs.some(club => club.id === savedClub.id)) {
                    mockData.clubs.push(savedClub);
                }
            });
            console.log('💾 Клубы загружены из localStorage');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки из localStorage:', error);
    }
}

// 🔥 ИНИЦИАЛИЗАЦИЯ ФОРМЫ КЛУБА
function initializeClubForm() {
    console.log('🎯 Инициализация формы создания клуба...');
    
    // Сбрасываем выбранные теги
    clubFormSelectedTags = [];
    updateClubFormTagsDisplay();
    
    console.log('✅ Форма инициализирована');
}

// 🔥 ИНИЦИАЛИЗАЦИЯ ТЕГОВ
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

// 🔥 ПЕРЕКЛЮЧЕНИЕ ВЫБОРА ТЕГОВ
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

// 🔥 ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ТЕГОВ
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

// 🔥 УДАЛЕНИЕ ТЕГА
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

// 🔥 ИНИЦИАЛИЗАЦИЯ ЭМОДЗИ
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

// 🔥 УМНЫЙ ПОИСК КЛУБОВ
function initializeSmartSearch() {
    const searchInput = document.getElementById('club-search');
    const smartFiltersBtn = document.getElementById('smart-filters-btn');
    const quickFilters = document.querySelectorAll('.quick-filters .filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    // Поиск по тексту
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.searchText = e.target.value.toLowerCase();
            filterClubs();
        });
    }

    // Кнопка умных фильтров
    if (smartFiltersBtn) {
        smartFiltersBtn.addEventListener('click', () => {
            const filtersPanel = document.getElementById('smart-filters');
            filtersPanel.classList.toggle('hidden');
        });
    }

    // Быстрые фильтры
    if (quickFilters.length > 0) {
        quickFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                quickFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                currentFilters.category = filter;
                filterClubs();
            });
        });
    }

    // Применение умных фильтров
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applySmartFilters);
    }
    
    // Сброс фильтров
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
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
  // 🔥 Берем клубы только текущего университета
  const allUniversityClubs = getUniversityData('clubs');
  
  const filteredClubs = allUniversityClubs.filter(club => {
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

  if (!container) {
    console.log('❌ Контейнер для клубов не найден');
    return;
  }

  console.log('🎯 Рендерим отфильтрованные клубы:', clubs.length);

  // 🔥 ФИЛЬТРУЕМ КЛУБЫ ПО ТЕКУЩЕМУ УНИВЕРСИТЕТУ
  const universityClubs = clubs.filter(club => 
    club.university_id === authService.currentUniversity?.id
  );

  console.log('🎯 Клубы после фильтрации по университету:', universityClubs.length);

  if (universityClubs.length === 0) {
    container.innerHTML = '';
    if (noResults) {
      noResults.classList.remove('hidden');
    } else {
      // Создаем сообщение если его нет
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Клубы не найдены</h3>
          <p>Попробуйте изменить фильтры поиска</p>
        </div>
      `;
    }
    return;
  }

  if (noResults) noResults.classList.add('hidden');
  container.innerHTML = '';

  universityClubs.forEach(club => {
    const div = document.createElement('div');
    div.className = `club-card activity-${club.activity}`;
    
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
          <small>📅 ${club.meetingDay} • ${getActivityText(club.activity)}</small>
        </div>
      </div>
    `;
    
    div.addEventListener('click', () => {
      showClubDetails(club);
    });

    container.appendChild(div);
  });
  
  console.log('✅ Клубы отрендерены:', universityClubs.length);
}

// 🎭 Клубы - правильный рендеринг для университета
function renderClubs() {
  const container = document.getElementById('clubs-list');
  if (!container) {
    console.log('❌ Контейнер клубов не найден');
    return;
  }

  console.log('🎭 Рендерим клубы для университета:', authService.currentUniversity?.name);
  
  // Очищаем только список клубов, не трогая поиск
  container.innerHTML = '';

  // Берем клубы текущего университета
  const universityClubs = getUniversityData('clubs');
  console.log('📊 Найдено клубов:', universityClubs.length);

  if (universityClubs.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🎭</div>
        <h3>В вашем университете пока нет клубов</h3>
        <p>Будьте первым - создайте свой клуб!</p>
        <button class="reset-btn" onclick="openCreateClubModal()">Создать клуб</button>
      </div>
    `;
    return;
  }

  // Рендерим клубы университета
  renderFilteredClubs(universityClubs);
  
  // Инициализируем умный поиск ТОЛЬКО после рендеринга
  setTimeout(() => {
    if (typeof initializeSmartSearch === 'function') {
      initializeSmartSearch();
    }
  }, 50);
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
function setupWeekNavigation() {
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
}

function updateWeekDisplay() {
    const currentWeekLabel = document.getElementById('current-week');
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

// 📄 ФУНКЦИОНАЛ ДЛЯ ЗАКАЗА ДОКУМЕНТОВ
// 📄 ФУНКЦИОНАЛ ДЛЯ ЗАКАЗА ДОКУМЕНТОВ (УЛУЧШЕННАЯ ВЕРСИЯ)
function openDocumentsService() {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📄 Заказ документов</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="service-description">
                    <p>Заказ официальных документов через студенческий офис</p>
                </div>
                
                <form id="documents-form" class="documents-form">
                    <div class="form-section">
                        <h4>📋 Информация о документе</h4>
                        
                        <div class="form-group">
                            <label>Тип документа *</label>
                            <select id="document-type" class="form-select" required>
                                <option value="">Выберите тип документа</option>
                                <option value="certificate">Справка об обучении</option>
                                <option value="academic">Академическая справка</option>
                                <option value="diploma">Копия диплома</option>
                                <option value="transcript">Выписка с оценками</option>
                                <option value="enrollment">Справка о зачислении</option>
                                <option value="other">Другой документ</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Количество экземпляров *</label>
                            <div class="copies-selector">
                                <button type="button" class="counter-btn" id="decrease-copies">-</button>
                                <input type="number" id="document-copies" class="form-input counter-input" min="1" max="10" value="1" readonly>
                                <button type="button" class="counter-btn" id="increase-copies">+</button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Язык документа *</label>
                            <div class="language-options">
                                <label class="radio-option">
                                    <input type="radio" name="language" value="russian" checked>
                                    <span class="radio-custom"></span>
                                    <span class="radio-label">Русский</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="language" value="english">
                                    <span class="radio-custom"></span>
                                    <span class="radio-label">Английский</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="language" value="both">
                                    <span class="radio-custom"></span>
                                    <span class="radio-label">Оба языка</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>📬 Получение документа</h4>
                        
                        <div class="form-group">
                            <label>Способ получения *</label>
                            <div class="delivery-options">
                                <label class="radio-option">
                                    <input type="radio" name="delivery" value="pickup" checked>
                                    <span class="radio-custom"></span>
                                    <span class="radio-label">
                                        <strong>Самовывоз из студенческого офиса</strong>
                                        <small>Бесплатно, 3-5 рабочих дней</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="delivery" value="email">
                                    <span class="radio-custom"></span>
                                    <span class="radio-label">
                                        <strong>Электронная версия на email</strong>
                                        <small>Бесплатно, 1-2 рабочих дня</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group" id="email-field" style="display: none;">
                            <label>Email для отправки *</label>
                            <input type="email" id="document-email" class="form-input" placeholder="your.email@example.com">
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h4>💬 Дополнительная информация</h4>
                        
                        <div class="form-group">
                            <label>Комментарий к заказу</label>
                            <textarea id="document-comments" class="form-textarea" placeholder="Укажите дополнительную информацию или особые пожелания..." rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div class="request-summary">
                        <h4>📝 Сводка заявки</h4>
                        <div class="summary-grid">
                            <div class="summary-item">
                                <span class="summary-label">Тип документа:</span>
                                <span class="summary-value" id="summary-type">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Количество:</span>
                                <span class="summary-value" id="summary-copies">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Язык:</span>
                                <span class="summary-value" id="summary-language">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Способ получения:</span>
                                <span class="summary-value" id="summary-delivery">-</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Примерный срок:</span>
                                <span class="summary-value" id="summary-deadline">-</span>
                            </div>
                        </div>
                    </div>
                </form>
                
                <div class="service-actions">
                    <button type="button" class="btn-secondary">Отмена</button>
                    <button type="button" id="submit-document" class="btn-primary">Подать заявку</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupDocumentsHandlers(modal);
}

function setupDocumentsHandlers(modal) {
    const form = modal.querySelector('#documents-form');
    const submitBtn = modal.querySelector('#submit-document');
    
    // Счетчик копий
    const decreaseBtn = modal.querySelector('#decrease-copies');
    const increaseBtn = modal.querySelector('#increase-copies');
    const copiesInput = modal.querySelector('#document-copies');
    
    decreaseBtn.addEventListener('click', () => {
        let value = parseInt(copiesInput.value);
        if (value > 1) {
            copiesInput.value = value - 1;
            updateSummary();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        let value = parseInt(copiesInput.value);
        if (value < 10) {
            copiesInput.value = value + 1;
            updateSummary();
        }
    });
    
    // Показ/скрытие поля email
    const deliveryRadios = modal.querySelectorAll('input[name="delivery"]');
    const emailField = modal.querySelector('#email-field');
    
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'email') {
                emailField.style.display = 'block';
            } else {
                emailField.style.display = 'none';
            }
            updateSummary();
        });
    });
    
    // Обновление сводки при изменении формы
    const updateSummary = () => {
        const type = modal.querySelector('#document-type').value;
        const copies = parseInt(modal.querySelector('#document-copies').value);
        const language = modal.querySelector('input[name="language"]:checked').value;
        const delivery = modal.querySelector('input[name="delivery"]:checked').value;
        
        // Обновляем сводку
        modal.querySelector('#summary-type').textContent = getDocumentTypeText(type) || '-';
        modal.querySelector('#summary-copies').textContent = copies || '-';
        modal.querySelector('#summary-language').textContent = getLanguageText(language) || '-';
        modal.querySelector('#summary-delivery').textContent = getDeliveryText(delivery) || '-';
        modal.querySelector('#summary-deadline').textContent = getDeadlineText(delivery, type) || '-';
    };
    
    // Слушаем изменения в форме
    form.addEventListener('change', updateSummary);
    form.addEventListener('input', updateSummary);
    
    // Инициализируем сводку
    updateSummary();
    
    // Обработчик отправки
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleDocumentSubmission(modal);
    });
    
    // Стандартные обработчики закрытия
    setupModalHandlers(modal);
}

function getDocumentTypeText(type) {
    const types = {
        'certificate': 'Справка об обучении',
        'academic': 'Академическая справка',
        'diploma': 'Копия диплома',
        'transcript': 'Выписка с оценками',
        'enrollment': 'Справка о зачислении',
        'other': 'Другой документ'
    };
    return types[type];
}

function getLanguageText(language) {
    const languages = {
        'russian': 'Русский',
        'english': 'Английский',
        'both': 'Русский + Английский'
    };
    return languages[language];
}

function getDeliveryText(delivery) {
    const deliveries = {
        'pickup': 'Самовывоз из студенческого офиса',
        'email': 'Электронная версия на email'
    };
    return deliveries[delivery];
}

function getDeadlineText(delivery, type) {
    if (delivery === 'email') {
        return '1-2 рабочих дня';
    }
    
    // Для самовывоза срок зависит от типа документа
    const deadlines = {
        'certificate': '3-5 рабочих дней',
        'academic': '5-7 рабочих дней',
        'diploma': '7-10 рабочих дней',
        'transcript': '3-5 рабочих дней',
        'enrollment': '2-3 рабочих дня',
        'other': '3-5 рабочих дней'
    };
    return deadlines[type] || '3-5 рабочих дней';
}

function handleDocumentSubmission(modal) {
    const type = modal.querySelector('#document-type').value;
    const copies = parseInt(modal.querySelector('#document-copies').value);
    const language = modal.querySelector('input[name="language"]:checked').value;
    const delivery = modal.querySelector('input[name="delivery"]:checked').value;
    const comments = modal.querySelector('#document-comments').value;
    const email = modal.querySelector('#document-email').value;
    
    const formData = {
        type: type,
        copies: copies,
        language: language,
        delivery: delivery,
        comments: comments,
        email: delivery === 'email' ? email : null,
        studentName: authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName,
        group: authService.currentUser.profile.group,
        studentId: authService.currentUser.uid,
        timestamp: new Date().toISOString(),
        status: 'pending',
        deadline: getDeadlineText(delivery, type)
    };
    
    // Валидация
    if (!formData.type) {
        alert('Пожалуйста, выберите тип документа');
        return;
    }
    
    if (formData.delivery === 'email' && !formData.email) {
        alert('Пожалуйста, укажите email для отправки документа');
        return;
    }
    
    if (formData.delivery === 'email' && !isValidEmail(formData.email)) {
        alert('Пожалуйста, введите корректный email адрес');
        return;
    }
    
    // Показываем уведомление об успехе
    showDocumentSuccessNotification(formData, modal);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showDocumentSuccessNotification(documentData, modal) {
    // Закрываем модалку
    document.body.removeChild(modal);
    
    const notification = document.createElement('div');
    notification.className = 'success-notification document-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
                <strong>Заявка на документ оформлена!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    ${getDocumentTypeText(documentData.type)} × ${documentData.copies}<br>
                    Язык: ${getLanguageText(documentData.language)}<br>
                    Получение: ${getDeliveryText(documentData.delivery)}<br>
                    Примерный срок: ${documentData.deadline}<br>
                    <em>Статус: Ожидает обработки</em>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    console.log('📄 Заявка на документ создана:', documentData);
}


// 🏠 ФУНКЦИОНАЛ ДЛЯ ОБЩЕЖИТИЯ
function openDormitoryService() {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🏠 Общежитие - ${authService.currentUniversity?.shortName}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="dormitory-tabs">
                    <button class="dorm-tab-btn active" data-tab="application">📝 Заявка на заселение</button>
                    <button class="dorm-tab-btn" data-tab="issues">🔧 Бытовые вопросы</button>
                    <button class="dorm-tab-btn" data-tab="info">ℹ️ Информация</button>
                </div>
                
                <!-- Заявка на заселение -->
                <div id="dorm-application" class="dorm-tab-content active">
                    <form id="dorm-application-form" class="dorm-form">
                        <div class="form-group">
                            <label>Тип заявки *</label>
                            <select id="application-type" class="form-select" required>
                                <option value="">Выберите тип заявки</option>
                                <option value="new">Первичное заселение</option>
                                <option value="transfer">Перевод в другое общежитие</option>
                                <option value="extension">Продление проживания</option>
                                <option value="temporary">Временное заселение</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Предпочтительное общежитие *</label>
                            <select id="dormitory-preference" class="form-select" required>
                                <option value="">Выберите общежитие</option>
                                <option value="dorm1">Общежитие №1 (ул. Студенческая, 1)</option>
                                <option value="dorm2">Общежитие №2 (ул. Молодежная, 5)</option>
                                <option value="dorm3">Общежитие №3 (ул. Университетская, 10)</option>
                                <option value="dorm4">Общежитие №4 (ул. Академическая, 3)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Тип комнаты *</label>
                            <select id="room-type-preference" class="form-select" required>
                                <option value="">Выберите тип комнаты</option>
                                <option value="single">Одноместная</option>
                                <option value="double">Двухместная</option>
                                <option value="triple">Трехместная</option>
                                <option value="quad">Четырехместная</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Желаемая дата заселения *</label>
                            <input type="date" id="move-in-date" class="form-input" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Период проживания *</label>
                            <select id="stay-period" class="form-select" required>
                                <option value="">Выберите период</option>
                                <option value="semester">На семестр</option>
                                <option value="year">На учебный год</option>
                                <option value="summer">На летний период</option>
                                <option value="custom">Другой период</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Особые потребности</label>
                            <textarea id="special-needs" class="form-textarea" placeholder="Укажите особые потребности (аллергии, медицинские показания и т.д.)"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Дополнительная информация</label>
                            <textarea id="additional-info" class="form-textarea" placeholder="Любая дополнительная информация..."></textarea>
                        </div>
                    </form>
                    
                    <div class="service-actions">
                        <button type="button" class="btn-secondary">Отмена</button>
                        <button type="button" id="submit-dorm-application" class="btn-primary">Подать заявку</button>
                    </div>
                </div>
                
                <!-- Бытовые вопросы -->
                <div id="dorm-issues" class="dorm-tab-content">
                    <form id="dorm-issues-form" class="dorm-form">
                        <div class="form-group">
                            <label>Тип проблемы *</label>
                            <select id="issue-type" class="form-select" required>
                                <option value="">Выберите тип проблемы</option>
                                <option value="repair">Ремонт</option>
                                <option value="furniture">Мебель</option>
                                <option value="plumbing">Сантехника</option>
                                <option value="electricity">Электрика</option>
                                <option value="cleaning">Уборка</option>
                                <option value="noise">Шум</option>
                                <option value="other">Другое</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Срочность *</label>
                            <select id="issue-urgency" class="form-select" required>
                                <option value="low">Низкая (можно подождать)</option>
                                <option value="medium" selected>Средняя (в течение недели)</option>
                                <option value="high">Высокая (срочно)</option>
                                <option value="critical">Критическая (немедленно)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Местоположение *</label>
                            <input type="text" id="issue-location" class="form-input" placeholder="Например: Общежитие №2, комната 305" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Описание проблемы *</label>
                            <textarea id="issue-description" class="form-textarea" placeholder="Подробно опишите проблему..." required></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label>Контакт для связи *</label>
                            <input type="text" id="issue-contact" class="form-input" placeholder="Телефон или Telegram" required>
                        </div>
                    </form>
                    
                    <div class="service-actions">
                        <button type="button" class="btn-secondary">Отмена</button>
                        <button type="button" id="submit-dorm-issue" class="btn-primary">Отправить заявку</button>
                    </div>
                </div>
                
                <!-- Информация -->
                <div id="dorm-info" class="dorm-tab-content">
                    <div class="dorm-info-content">
                        <h4>🏘️ Общежития ${authService.currentUniversity?.shortName}</h4>
                        
                        <div class="info-section">
                            <h5>📞 Контакты</h5>
                            <div class="contact-info">
                                <p><strong>Отдел общежитий:</strong> +7 (XXX) XXX-XX-XX</p>
                                <p><strong>Email:</strong> dormitory@${authService.currentUniversity?.shortName?.toLowerCase()}.edu</p>
                                <p><strong>Адрес:</strong> ул. Студенческая, 1</p>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h5>🕒 Часы работы</h5>
                            <div class="schedule-info">
                                <p><strong>Пн-Пт:</strong> 9:00 - 18:00</p>
                                <p><strong>Сб:</strong> 10:00 - 16:00</p>
                                <p><strong>Вс:</strong> Выходной</p>
                            </div>
                        </div>
                        
                        <div class="info-section">
                            <h5>💡 Полезная информация</h5>
                            <ul class="info-list">
                                <li>Заселение производится по будням с 10:00 до 17:00</li>
                                <li>При заселении необходимо иметь паспорт и студенческий билет</li>
                                <li>Оплата проживания - до 10 числа каждого месяца</li>
                                <li>Комендантский час: с 23:00 до 6:00</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupDormitoryHandlers(modal);
}

function setupDormitoryHandlers(modal) {
    // Табы общежития
    const tabButtons = modal.querySelectorAll('.dorm-tab-btn');
    const tabContents = modal.querySelectorAll('.dorm-tab-content');
    
    tabButtons.forEach(tab => {
        tab.addEventListener('click', () => {
            tabButtons.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const target = tab.dataset.tab;
            modal.querySelector(`#dorm-${target}`).classList.add('active');
        });
    });
    
    // Обработчики заявки на заселение
    const applicationSubmit = modal.querySelector('#submit-dorm-application');
    applicationSubmit.addEventListener('click', function(e) {
        e.preventDefault();
        handleDormApplication(modal);
    });
    
    // Обработчики бытовых вопросов
    const issueSubmit = modal.querySelector('#submit-dorm-issue');
    issueSubmit.addEventListener('click', function(e) {
        e.preventDefault();
        handleDormIssue(modal);
    });
    
    // Стандартные обработчики закрытия
    setupModalHandlers(modal);
}

function handleDormApplication(modal) {
    const formData = {
        type: modal.querySelector('#application-type').value,
        dormitory: modal.querySelector('#dormitory-preference').value,
        roomType: modal.querySelector('#room-type-preference').value,
        moveInDate: modal.querySelector('#move-in-date').value,
        stayPeriod: modal.querySelector('#stay-period').value,
        specialNeeds: modal.querySelector('#special-needs').value,
        additionalInfo: modal.querySelector('#additional-info').value,
        studentName: authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName,
        group: authService.currentUser.profile.group,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Валидация
    if (!formData.type || !formData.dormitory || !formData.roomType || !formData.moveInDate || !formData.stayPeriod) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    // Проверка даты
    const moveInDate = new Date(formData.moveInDate);
    const today = new Date();
    if (moveInDate < today) {
        alert('Дата заселения не может быть в прошлом');
        return;
    }
    
    showDormApplicationSuccess(formData, modal);
}

function handleDormIssue(modal) {
    const formData = {
        type: modal.querySelector('#issue-type').value,
        urgency: modal.querySelector('#issue-urgency').value,
        location: modal.querySelector('#issue-location').value,
        description: modal.querySelector('#issue-description').value,
        contact: modal.querySelector('#issue-contact').value,
        studentName: authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName,
        room: authService.currentUser.profile.group,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    // Валидация
    if (!formData.type || !formData.location || !formData.description || !formData.contact) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    showDormIssueSuccess(formData, modal);
}

function showDormApplicationSuccess(applicationData, modal) {
    document.body.removeChild(modal);
    
    const notification = document.createElement('div');
    notification.className = 'success-notification dorm-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
                <strong>Заявка на заселение подана!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    Тип: ${getApplicationTypeText(applicationData.type)}<br>
                    Общежитие: ${getDormitoryText(applicationData.dormitory)}<br>
                    Дата заселения: ${formatDate(applicationData.moveInDate)}<br>
                    Статус: На рассмотрении
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    console.log('🏠 Заявка на общежитие создана:', applicationData);
}

function showDormIssueSuccess(issueData, modal) {
    document.body.removeChild(modal);
    
    const notification = document.createElement('div');
    notification.className = 'success-notification dorm-issue-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
                <strong>Заявка на устранение проблемы отправлена!</strong>
                <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
                    Тип проблемы: ${getIssueTypeText(issueData.type)}<br>
                    Срочность: ${getUrgencyText(issueData.urgency)}<br>
                    Статус: В обработке
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    console.log('🔧 Заявка на проблему создана:', issueData);
}

function getApplicationTypeText(type) {
    const types = {
        'new': 'Первичное заселение',
        'transfer': 'Перевод',
        'extension': 'Продление',
        'temporary': 'Временное заселение'
    };
    return types[type] || type;
}

function getDormitoryText(dorm) {
    const dorms = {
        'dorm1': 'Общежитие №1',
        'dorm2': 'Общежитие №2',
        'dorm3': 'Общежитие №3',
        'dorm4': 'Общежитие №4'
    };
    return dorms[dorm] || dorm;
}

function getIssueTypeText(type) {
    const types = {
        'repair': 'Ремонт',
        'furniture': 'Мебель',
        'plumbing': 'Сантехника',
        'electricity': 'Электрика',
        'cleaning': 'Уборка',
        'noise': 'Шум',
        'other': 'Другое'
    };
    return types[type] || type;
}

function getUrgencyText(urgency) {
    const urgencies = {
        'low': 'Низкая',
        'medium': 'Средняя',
        'high': 'Высокая',
        'critical': 'Критическая'
    };
    return urgencies[urgency] || urgency;
}