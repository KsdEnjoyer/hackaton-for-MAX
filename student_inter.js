let clubFormSelectedTags = [];
let availableTags = [
    "программирование", "искусство", "спорт", "наука", "музыка", 
    "танцы", "театр", "кино", "фотография", "дизайн",
    "робототехника", "ai", "хакатоны", "стартапы", "веб-разработка",
    "мобильная разработка", "data science", "киберспорт", "настольные игры",
    "волонтерство", "экология", "путешествия", "кулинария", "йога",
    "медитация", "психология", "литература", "поэзия", "дебаты"
];

let currentPlannerDate = new Date();
let userEvents = [];
let isMonthlyCalendarRendered = false;

function getEventTypeColor(type) {
    const colors = {
        'personal': '#2196f3',
        'academic': '#4caf50',
        'social': '#ff9800',
        'work': '#9c27b0'
    };
    return colors[type] || '#2196f3';
}

async function initializePlanner() {
    await loadUserEvents();
    setupViewSwitcher();
    setupMonthNavigation();
    renderMonthlyCalendar();
}

async function loadUserEvents() {
    try {
        const currentUser = authService.currentUser;
        if (!currentUser) {
            console.error('Пользователь не авторизован');
            userEvents = [];
            return;
        }

        const events = await SupabaseDB.getUserEvents(currentUser.uid);
        userEvents = events || [];
        console.log('📅 События пользователя загружены:', userEvents.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки событий пользователя:', error);
        userEvents = [];
    }
}

async function saveUserEvents() {
    console.log('💾 Сохранение через БД');
}

function setupViewSwitcher() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const weekView = document.getElementById('week-view');
    const monthView = document.getElementById('month-planner-view');
    const weekNav = document.getElementById('week-navigation');
    const monthNav = document.getElementById('month-navigation');

    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (view === 'week') {
                weekView.classList.remove('hidden');
                monthView.classList.add('hidden');
                weekNav.classList.remove('hidden');
                monthNav.classList.add('hidden');
            } else {
                weekView.classList.add('hidden');
                monthView.classList.remove('hidden');
                weekNav.classList.add('hidden');
                monthNav.classList.remove('hidden');
                if (!isMonthlyCalendarRendered) {
                    renderMonthlyCalendar();
                    isMonthlyCalendarRendered = true;
                }
            }
        });
    });
}


function setupMonthNavigation() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    const addEventBtn = document.getElementById('add-event-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentPlannerDate.setMonth(currentPlannerDate.getMonth() - 1);
            isMonthlyCalendarRendered = false; 
            renderMonthlyCalendar();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPlannerDate.setMonth(currentPlannerDate.getMonth() + 1);
            isMonthlyCalendarRendered = false; 
            renderMonthlyCalendar();
        });
    }

    if (addEventBtn) {
        addEventBtn.addEventListener('click', openAddEventModal);
    }
}

function renderMonthlyCalendar() {
    const calendar = document.getElementById('monthly-calendar');
    if (!calendar) return;

    calendar.innerHTML = '';

    const year = currentPlannerDate.getFullYear();
    const month = currentPlannerDate.getMonth();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay() + (firstDay.getDay() === 0 ? -6 : 1));

    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    calendar.innerHTML = `
        <div class="calendar-header">
            <div class="calendar-day-header">Пн</div>
            <div class="calendar-day-header">Вт</div>
            <div class="calendar-day-header">Ср</div>
            <div class="calendar-day-header">Чт</div>
            <div class="calendar-day-header">Пт</div>
            <div class="calendar-day-header">Сб</div>
            <div class="calendar-day-header">Вс</div>
        </div>
        <div class="calendar-grid" id="calendar-grid"></div>
    `;

    const calendarGrid = document.getElementById('calendar-grid');
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let date = new Date(startDate);
    while (date <= endDate) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const isOtherMonth = date.getMonth() !== month;
        const isToday = date.toDateString() === currentDate.toDateString();
        
        if (isOtherMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');

        const dayEvents = getEventsForDate(date);
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
        }

        dayElement.innerHTML = `
            <div class="calendar-day-number">${date.getDate()}</div>
            <div class="calendar-events">
                ${dayEvents.slice(0, 2).map(event => `
                    <div class="calendar-event ${event.type}" 
                         onclick="openEventDetails('${event.id}')"
                         title="${event.title}">
                        ${event.time ? event.time + ' ' : ''}${event.title}
                    </div>
                `).join('')}
                ${dayEvents.length > 2 ? `<div class="calendar-event-more">+${dayEvents.length - 2} еще</div>` : ''}
            </div>
        `;

        dayElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('calendar-event')) {
                showDayEventsPanel(new Date(date));
            }
        });

        calendarGrid.appendChild(dayElement);
        
        date.setDate(date.getDate() + 1);
    }

    isMonthlyCalendarRendered = true;
}

function getEventsForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return userEvents.filter(event => 
        event.date === dateString && 
        event.user_id === authService.currentUser.uid
    );
}

function showDayEventsPanel(date) {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents = getEventsForDate(date);
    
    const panel = document.createElement('div');
    panel.className = 'service-modal active';
    panel.id = 'day-events-panel';
    
    const dateDisplay = date.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    panel.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📅 ${dateDisplay}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="day-events-list" id="day-events-list">
                    ${dayEvents.length > 0 ? dayEvents.map(event => {
                        const eventColor = getEventTypeColor(event.type);
                        return `
                        <div class="day-event-item ${event.type}" style="border-left-color: ${eventColor}">
                            <div class="event-header">
                                <span class="event-time">${event.time || 'Весь день'}</span>
                                <button class="delete-event-btn" onclick="deleteEvent('${event.id}')" title="Удалить">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="event-title">${event.title}</div>
                            ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                        </div>
                        `;
                    }).join('') : '<p class="no-events">📭 На этот день нет запланированных задач</p>'}
                </div>
                
                <button class="add-task-btn" id="show-add-task-form">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    ДОБАВИТЬ ЗАДАЧУ
                </button>
                
                <div class="add-task-form-container" id="add-task-form-container" style="display: none; max-height: 0; overflow: hidden;">
                    <form id="add-event-form-inline" class="event-form">
                        <div class="form-group">
                            <label>Название задачи *</label>
                            <input type="text" id="event-title-inline" class="form-input" placeholder="Введите название задачи" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Время</label>
                                <input type="time" id="event-time-inline" class="form-input">
                            </div>
                            
                            <div class="form-group">
                                <label>Тип</label>
                                <select id="event-type-inline" class="form-select">
                                    <option value="personal">Личное</option>
                                    <option value="academic">Учебное</option>
                                    <option value="social">Социальное</option>
                                    <option value="work">Работа</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Описание</label>
                            <textarea id="event-description-inline" class="form-textarea" placeholder="Описание задачи..." rows="2"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="cancel-add-task">Отмена</button>
                            <button type="button" id="submit-event-inline" class="btn-primary">Сохранить</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    const showFormBtn = panel.querySelector('#show-add-task-form');
    const formContainer = panel.querySelector('#add-task-form-container');
    const cancelBtn = panel.querySelector('#cancel-add-task');
    const submitBtn = panel.querySelector('#submit-event-inline');
    
    showFormBtn.addEventListener('click', () => {
        formContainer.style.display = 'block';
        setTimeout(() => {
            formContainer.style.maxHeight = '600px';
            formContainer.style.transition = 'max-height 0.3s ease-in-out';
        }, 10);
        showFormBtn.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        formContainer.style.maxHeight = '0';
        setTimeout(() => {
            formContainer.style.display = 'none';
            showFormBtn.style.display = 'flex';
        }, 300);
    });
    
    submitBtn.addEventListener('click', async () => {
        const formData = {
            title: panel.querySelector('#event-title-inline').value.trim(),
            date: dateString,
            time: panel.querySelector('#event-time-inline').value,
            priority: 'medium',
            type: panel.querySelector('#event-type-inline').value,
            description: panel.querySelector('#event-description-inline').value.trim(),
            user_id: authService.currentUser.uid,
            university_id: authService.currentUser.profile.universityId || 1,
            completed: false
        };
        
        if (!formData.title) {
            alert('Пожалуйста, введите название задачи');
            return;
        }
        
        try {
            const createdEvent = await SupabaseDB.createUserEvent(formData);
            
            if (createdEvent) {
                userEvents.push(createdEvent);
                document.body.removeChild(panel);
                renderMonthlyCalendar();
                
                showNotification('Задача добавлена!', 'success');
            }
        } catch (error) {
            console.error('Ошибка создания события:', error);
            alert('Не удалось создать событие');
        }
    });
    
    setupModalHandlers(panel);
}

async function deleteEvent(eventId) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) {
        return;
    }
    
    try {
        await SupabaseDB.deleteUserEvent(eventId);
        userEvents = userEvents.filter(e => e.id !== eventId);
        
        const panel = document.getElementById('day-events-panel');
        if (panel) {
            document.body.removeChild(panel);
        }
        
        renderMonthlyCalendar();
        showNotification('Задача удалена', 'success');
    } catch (error) {
        console.error('Ошибка удаления события:', error);
        alert('Не удалось удалить событие');
    }
}


function openAddEventModal(prefilledDate = null) {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    
    const defaultDate = prefilledDate || new Date();
    const dateString = defaultDate.toISOString().split('T')[0];
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📅 Добавить событие</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="add-event-form" class="event-form">
                    <div class="form-group">
                        <label>Название события *</label>
                        <input type="text" id="event-title" class="form-input" placeholder="Введите название события" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Дата *</label>
                        <input type="date" id="event-date" class="form-input" value="${dateString}" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Время</label>
                        <input type="time" id="event-time" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label>Тип события</label>
                        <select id="event-type" class="form-select">
                            <option value="personal">Личное</option>
                            <option value="academic">Учебное</option>
                            <option value="social">Социальное</option>
                            <option value="work">Работа</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Описание</label>
                        <textarea id="event-description" class="form-textarea" placeholder="Описание события..." rows="3"></textarea>
                    </div>
                </form>
                
                <div class="service-actions">
                    <button type="button" class="btn-secondary">Отмена</button>
                    <button type="button" id="submit-event" class="btn-primary">Сохранить событие</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setupEventModalHandlers(modal);
}

function setupEventModalHandlers(modal) {
    const submitBtn = modal.querySelector('#submit-event');
    const form = modal.querySelector('#add-event-form');
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleEventSubmission(modal);
    });
    
    setupModalHandlers(modal);
}

async function handleEventSubmission(modal) {
    const formData = {
        title: modal.querySelector('#event-title').value.trim(),
        date: modal.querySelector('#event-date').value,
        time: modal.querySelector('#event-time').value,
        priority: 'medium',
        type: modal.querySelector('#event-type').value,
        description: modal.querySelector('#event-description').value.trim(),
        user_id: authService.currentUser.uid,
        university_id: authService.currentUser.profile.universityId || 1,
        completed: false
    };
    
    if (!formData.title) {
        alert('Пожалуйста, введите название события');
        return;
    }
    
    try {
        const createdEvent = await SupabaseDB.createUserEvent(formData);
        
        if (createdEvent) {
            userEvents.push(createdEvent);
            
            document.body.removeChild(modal);
            renderMonthlyCalendar();
            
            showNotification('✅ Событие добавлено в планировщик', 'success');
        } else {
            showNotification('❌ Не удалось добавить событие', 'error');
        }
    } catch (error) {
        console.error('Ошибка создания события:', error);
        showNotification('❌ Ошибка при добавлении события', 'error');
    }
}

function openEventDetails(eventId) {
    const event = userEvents.find(e => e.id === eventId);
    if (!event) return;
    
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📅 ${event.title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="event-details">
                    <p><strong>Дата:</strong> ${formatDate(event.date)}</p>
                    ${event.time ? `<p><strong>Время:</strong> ${event.time}</p>` : ''}
                    <p><strong>Тип:</strong> ${getEventTypeText(event.type)}</p>
                    ${event.description ? `<p><strong>Описание:</strong> ${event.description}</p>` : ''}
                </div>
                
                <div class="service-actions">
                    <button type="button" class="btn-secondary" id="delete-event">Удалить</button>
                    <button type="button" class="btn-primary" id="edit-event">Редактировать</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#delete-event').addEventListener('click', async () => {
        if (confirm('Удалить это событие?')) {
            try {
                const success = await SupabaseDB.deleteUserEvent(eventId);
                if (success) {
                    userEvents = userEvents.filter(e => e.id !== eventId);
                    document.body.removeChild(modal);
                    renderMonthlyCalendar();
                    showNotification('✅ Событие удалено', 'success');
                } else {
                    showNotification('❌ Не удалось удалить событие', 'error');
                }
            } catch (error) {
                console.error('Ошибка удаления события:', error);
                showNotification('❌ Ошибка при удалении события', 'error');
            }
        }
    });
    
    setupModalHandlers(modal);
}

function getEventTypeText(type) {
    const types = {
        'personal': 'Личное',
        'academic': 'Учебное',
        'social': 'Социальное',
        'work': 'Работа'
    };
    return types[type] || type;
}

function getCurrentAcademicWeek() {
  const today = new Date();
  const startDate = new Date("2025-09-01"); 
  
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  
  const diffTime = today - startDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  
  const academicWeek = diffWeeks + 1;
  
  console.log('Вычисление учебной недели:', {
    today: today.toDateString(),
    startDate: startDate.toDateString(), 
    diffDays: diffDays,
    diffWeeks: diffWeeks,
    academicWeek: academicWeek
  });
  
  return academicWeek;
}

let currentFilters = {
    searchText: '',
    category: 'all',
    activity: 'any',
    day: 'any',
    size: 'any'
};

let currentDisplayWeek = getCurrentAcademicWeek(); 
let currentDisplayDate = new Date(); 


function initializeStudentApp() {
  console.log('Инициализация интерфейса студента...');
  
  if (typeof loadEventsFromLocalStorage === 'function') loadEventsFromLocalStorage();
  if (typeof loadClubsFromLocalStorage === 'function') loadClubsFromLocalStorage();
  if (typeof loadNewsFromLocalStorage === 'function') loadNewsFromLocalStorage();
  setupStudentApp();
}

function forceUpdateHeader() {
  if (typeof authService !== 'undefined' && authService.updateHeader) {
    authService.updateHeader();
  }
}

function setupStudentApp() {
    console.log('Запуск setupStudentApp...');
    
    currentDisplayWeek = getCurrentAcademicWeek();
    
    setupNavigation();
    setupServices();
    renderTodaySchedule(); 
    renderNews();
    renderClubs();
    
    setupPlannerButton();
    
    setTimeout(() => {
        setupWeekNavigation();
        setupPlannerButton(); 
    }, 1000);
    
    console.log('setupStudentApp завершен. Текущая неделя:', currentDisplayWeek);
}

function setupPlannerButton() {
    const plannerBtn = document.getElementById('planner-btn');
    if (plannerBtn) {
        plannerBtn.replaceWith(plannerBtn.cloneNode(true));
        
        const newPlannerBtn = document.getElementById('planner-btn');
        newPlannerBtn.addEventListener('click', openPlanner);
        console.log('Обработчик кнопки планировщика установлен');
    } else {
        console.log('Кнопка планировщика не найдена, попытка через 500мс...');
        setTimeout(() => {
            const retryBtn = document.getElementById('planner-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', openPlanner);
                console.log('Обработчик кнопки планировщика установлен (повторная попытка)');
            }
        }, 500);
    }
}
function openPlanner() {
    console.log('Открываем планировщик...');
    
    const modal = document.createElement('div');
    modal.className = 'service-modal active planner-modal-overlay';
    
    const currentDate = new Date();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    modal.innerHTML = `
        <div class="modal-content planner-modal-content">
            <div class="planner-modal-header">
                <div class="planner-header-left">
                    <span class="planner-header-icon">📅</span>
                    <h3>Планировщик задач</h3>
                </div>
                <button class="planner-close">&times;</button>
            </div>
            <div class="planner-modal-body">
                <div class="planner-controls">
                    <div class="planner-nav-group">
                        <button class="planner-nav-btn" id="prev-month-planner">←</button>
                    </div>
                    <h4 id="current-month-planner">${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</h4>
                    <div class="planner-nav-group">
                        <button class="planner-nav-btn" id="next-month-planner">→</button>
                    </div>
                </div>
                
                <div class="monthly-calendar-grid">
                    <div class="calendar-weekdays">
                        <div class="weekday-header">Пн</div>
                        <div class="weekday-header">Вт</div>
                        <div class="weekday-header">Ср</div>
                        <div class="weekday-header">Чт</div>
                        <div class="weekday-header">Пт</div>
                        <div class="weekday-header">Сб</div>
                        <div class="weekday-header">Вс</div>
                    </div>
                    <div class="calendar-days-grid" id="planner-calendar-days"></div>
                </div>
                
                <div class="planner-actions">
                    <button class="add-task-btn" id="add-task-planner-btn">
                        <span class="btn-icon">➕</span>
                        <span class="btn-text">Добавить задачу</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let plannerCurrentDate = new Date();
    
    function renderPlannerCalendar() {
        const year = plannerCurrentDate.getFullYear();
        const month = plannerCurrentDate.getMonth();
        const monthElement = document.getElementById('current-month-planner');
        if (monthElement) {
            monthElement.textContent = `${monthNames[month]} ${year}`;
        }
        
        const calendarDays = document.getElementById('planner-calendar-days');
        if (!calendarDays) return;
        
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startDate = new Date(firstDay);
        const dayOfWeek = firstDay.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(firstDay.getDate() - daysToSubtract);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startDate);
            cellDate.setDate(startDate.getDate() + i);
            
            const dayCell = document.createElement('div');
            dayCell.className = 'planner-day-cell';
            dayCell.setAttribute('data-date', cellDate.toISOString().split('T')[0]);
            
            const isOtherMonth = cellDate.getMonth() !== month;
            const isToday = cellDate.toDateString() === today.toDateString();
            const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
            const isHol = isHoliday(cellDate);
            
            if (isOtherMonth) dayCell.classList.add('other-month');
            if (isToday) dayCell.classList.add('today-cell');
            if (isWeekend) dayCell.classList.add('weekend-cell');
            if (isHol) dayCell.classList.add('holiday-cell');
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = cellDate.getDate();
            dayCell.appendChild(dayNumber);
            
            const dayItems = document.createElement('div');
            dayItems.className = 'day-items';
            
            const schedule = getScheduleForDate(cellDate);
            let hasLessons = false;
            schedule.forEach(lesson => {
                const lessonItem = document.createElement('div');
                lessonItem.className = `day-item ${lesson.type}`;
                dayItems.appendChild(lessonItem);
                hasLessons = true;
            });
            
            if (hasLessons) {
                const divider = document.createElement('div');
                divider.className = 'tasks-divider';
                dayItems.appendChild(divider);
            }
            
            const tasks = getTasksForDate(cellDate);
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `day-item task-item ${task.priority}`;
                dayItems.appendChild(taskItem);
            });
            
            dayCell.appendChild(dayItems);
            
            if (isHol) {
                const holidayName = document.createElement('div');
                holidayName.className = 'holiday-name';
                holidayName.textContent = getHolidayName(cellDate);
                dayCell.appendChild(holidayName);
            }
            
            dayCell.addEventListener('click', () => {
                showDayPlan(cellDate);
            });
            
            calendarDays.appendChild(dayCell);
        }
    }
    
    function getScheduleForDate(date) {
        const dayName = getRussianDayName(date.getDay());
        const baseSchedule = getUniversityData('schedule');
        const daySchedule = baseSchedule.find(day => day.day === dayName);
        
        return daySchedule ? daySchedule.lessons : [];
    }
    
    function getTasksForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        const userTasks = JSON.parse(localStorage.getItem(`userTasks_${authService.currentUser.uid}`) || '[]');
        return userTasks.filter(task => task.date === dateString);
    }
    
    const prevBtn = modal.querySelector('#prev-month-planner');
    const nextBtn = modal.querySelector('#next-month-planner');
    const closeBtn = modal.querySelector('.planner-close');
    const addTaskBtn = modal.querySelector('#add-task-planner-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            plannerCurrentDate.setMonth(plannerCurrentDate.getMonth() - 1);
            renderPlannerCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            plannerCurrentDate.setMonth(plannerCurrentDate.getMonth() + 1);
            renderPlannerCalendar();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            openTaskModal();
        });
    }
    
    renderPlannerCalendar();
}

function showDayPlan(selectedDate) {
    document.querySelectorAll('.planner-day-cell').forEach(cell => {
        cell.classList.remove('selected-day');
    });
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const selectedCell = [...document.querySelectorAll('.planner-day-cell')].find(cell => {
        const cellDate = cell.getAttribute('data-date') || '';
        return cellDate === dateString;
    });
    
    if (selectedCell) {
        selectedCell.classList.add('selected-day');
        selectedCell.setAttribute('data-date', dateString);
    }
    
    const existingPlan = document.querySelector('.day-plan-container');
    if (existingPlan) {
        existingPlan.remove();
    }
    
    const planContainer = document.createElement('div');
    planContainer.className = 'day-plan-container';
    
    const formattedDate = selectedDate.toLocaleDateString('ru-RU', { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    
    const schedule = getScheduleForDate(selectedDate);
    const tasks = getTasksForDate(selectedDate);
    const isHol = isHoliday(selectedDate);
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
    
    let eventsHtml = '';
    
    if (isHol) {
        eventsHtml += `
            <div class="day-event-item holiday">
                <div class="event-time">🎉</div>
                <div class="event-details">
                    <h5>${getHolidayName(selectedDate)}</h5>
                    <p>Праздничный день</p>
                </div>
            </div>
        `;
    }
    
    if (schedule.length > 0 && !isWeekend && !isHol) {
        schedule.forEach(lesson => {
            eventsHtml += `
                <div class="day-event-item ${lesson.type}">
                    <div class="event-time">${lesson.time}</div>
                    <div class="event-details">
                        <h5>${lesson.subject}</h5>
                        <p>👨‍🏫 ${lesson.teacher} • 🏢 ${lesson.room}</p>
                    </div>
                </div>
            `;
        });
    }
    
    if (tasks.length > 0) {
        tasks.forEach(task => {
            const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
            eventsHtml += `
                <div class="day-event-item task">
                    <div class="event-time">${task.time || priorityIcon}</div>
                    <div class="event-details">
                        <h5>${task.title}</h5>
                        <p>Задача • Приоритет: ${task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}</p>
                    </div>
                </div>
            `;
        });
    }
    
    if (eventsHtml === '' && !isHol) {
        if (isWeekend) {
            eventsHtml = `
                <div class="empty-day-plan">
                    <div class="icon">🥰</div>
                    <h4>Выходной день</h4>
                    <p>Время для отдыха и развлечений</p>
                </div>
            `;
        } else {
            eventsHtml = `
                <div class="empty-day-plan">
                    <div class="icon">📅</div>
                    <h4>Свободный день</h4>
                    <p>На этот день ничего не запланировано</p>
                </div>
            `;
        }
    }
    
    planContainer.innerHTML = `
        <div class="day-plan-header">
            <h4>📅 ${formattedDate}</h4>
            <button class="close-day-plan">×</button>
        </div>
        <div class="day-plan-content">
            <div class="day-events-list">
                ${eventsHtml}
            </div>
            <button class="add-to-day-plan" onclick="showAddTaskForm('${dateString}')">
                <span>➕</span>
                <span>ДОБАВИТЬ ЗАДАЧУ</span>
            </button>
        </div>
    `;
    
    const plannerBody = document.querySelector('.planner-modal-body');
    if (plannerBody) {
        plannerBody.appendChild(planContainer);
        
        planContainer.querySelector('.close-day-plan').addEventListener('click', () => {
            planContainer.remove();
            document.querySelectorAll('.planner-day-cell').forEach(cell => {
                cell.classList.remove('selected-day');
            });
        });
    }
}

function showAddTaskForm(dateString) {
    const planContainer = document.querySelector('.day-plan-container');
    if (!planContainer) return;
    
    const existingForm = planContainer.querySelector('.add-task-form');
    if (existingForm) {
        existingForm.remove();
        return;
    }
    
    const taskForm = document.createElement('div');
    taskForm.className = 'add-task-form';
    
    taskForm.innerHTML = `
        <div class="task-form-header">
            <h5>✏️ Новая задача</h5>
        </div>
        <div class="task-form-body">
            <div class="form-group">
                <label>Название задачи *</label>
                <input type="text" id="inline-task-title" class="form-input" placeholder="Например: Подготовиться к экзамену" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Время</label>
                    <input type="time" id="inline-task-time" class="form-input">
                </div>
                <div class="form-group">
                    <label>Приоритет</label>
                    <select id="inline-task-priority" class="form-select">
                        <option value="low">🟢 Низкий</option>
                        <option value="medium">🟡 Средний</option>
                        <option value="high">🔴 Высокий</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>Описание</label>
                <textarea id="inline-task-description" class="form-textarea" placeholder="Добавьте детали..." rows="2"></textarea>
            </div>
            
            <div class="task-form-actions">
                <button type="button" class="btn-cancel" onclick="closeAddTaskForm()">Отмена</button>
                <button type="button" class="btn-save" onclick="saveInlineTask('${dateString}')">
                    <span>💾</span>
                    <span>Сохранить</span>
                </button>
            </div>
        </div>
    `;
    
    const dayContent = planContainer.querySelector('.day-plan-content');
    dayContent.appendChild(taskForm);
    
    setTimeout(() => {
        const titleInput = taskForm.querySelector('#inline-task-title');
        if (titleInput) titleInput.focus();
    }, 100);
}

function closeAddTaskForm() {
    const taskForm = document.querySelector('.add-task-form');
    if (taskForm) {
        taskForm.remove();
    }
}

function saveInlineTask(dateString) {
    const titleInput = document.querySelector('#inline-task-title');
    const timeInput = document.querySelector('#inline-task-time');
    const prioritySelect = document.querySelector('#inline-task-priority');
    const descriptionInput = document.querySelector('#inline-task-description');
    
    if (!titleInput || !titleInput.value.trim()) {
        alert('Пожалуйста, введите название задачи');
        return;
    }
    
    const newTask = {
        id: Date.now().toString(),
        title: titleInput.value.trim(),
        date: dateString,
        time: timeInput ? timeInput.value : '',
        priority: prioritySelect ? prioritySelect.value : 'low',
        description: descriptionInput ? descriptionInput.value.trim() : '',
        type: 'personal',
        userId: authService.currentUser.uid,
        completed: false
    };
    
    userEvents.push(newTask);
    saveUserEvents();
    
    closeAddTaskForm();
    
    const selectedDate = new Date(dateString + 'T00:00:00');
    showDayPlan(selectedDate);
    
    const calendarDays = document.getElementById('planner-calendar-days');
    if (calendarDays) {
        const prevBtn = document.querySelector('#prev-month-planner');
        const nextBtn = document.querySelector('#next-month-planner');
        if (prevBtn && nextBtn) {
            prevBtn.click();
            setTimeout(() => nextBtn.click(), 50);
        }
    }
    
    showNotification('✅ Задача добавлена!', 'success');
}

function openTaskModal(date = null) {
    const taskModal = document.createElement('div');
    taskModal.className = 'service-modal active task-modal';
    
    const defaultDate = date || new Date();
    const dateString = defaultDate.toISOString().split('T')[0];
    
    taskModal.innerHTML = `
        <div class="modal-content task-modal-content">
            <div class="task-modal-header">
                <h3>✏️ Новая задача</h3>
                <button class="task-close">&times;</button>
            </div>
            <div class="task-modal-body">
                <form class="task-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Название задачи *</label>
                            <input type="text" id="task-title" class="form-input" placeholder="Введите название" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Дата *</label>
                            <input type="date" id="task-date" class="form-input" value="${dateString}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Время</label>
                            <input type="time" id="task-time" class="form-input">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <textarea id="task-desc" class="form-textarea" placeholder="Описание задачи..." rows="3"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Приоритет</label>
                        <div class="priority-selector">
                            <div class="priority-option">
                                <input type="radio" name="priority" value="low" id="priority-low" checked>
                                <label for="priority-low" class="priority-badge low">🟢 Низкий</label>
                            </div>
                            <div class="priority-option">
                                <input type="radio" name="priority" value="medium" id="priority-medium">
                                <label for="priority-medium" class="priority-badge medium">🟡 Средний</label>
                            </div>
                            <div class="priority-option">
                                <input type="radio" name="priority" value="high" id="priority-high">
                                <label for="priority-high" class="priority-badge high">🔴 Высокий</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="task-actions">
                        <button type="button" class="btn-cancel">Отмена</button>
                        <button type="button" class="btn-save" id="save-task-btn">
                            <span>💾</span>
                            <span>Сохранить</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(taskModal);
    
    const closeBtn = taskModal.querySelector('.task-close');
    const cancelBtn = taskModal.querySelector('.btn-cancel');
    const saveBtn = taskModal.querySelector('#save-task-btn');
    
    const closeModal = () => {
        document.body.removeChild(taskModal);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const title = taskModal.querySelector('#task-title').value.trim();
            const taskDate = taskModal.querySelector('#task-date').value;
            const time = taskModal.querySelector('#task-time').value;
            const desc = taskModal.querySelector('#task-desc').value.trim();
            const priority = taskModal.querySelector('input[name="priority"]:checked').value;
            
            if (!title || !taskDate) {
                alert('Пожалуйста, заполните название и дату задачи');
                return;
            }
            
            const newTask = {
                id: Date.now(),
                title,
                date: taskDate,
                time,
                desc,
                priority,
                userId: authService.currentUser.uid,
                completed: false
            };
            
            const userTasks = JSON.parse(localStorage.getItem(`userTasks_${authService.currentUser.uid}`) || '[]');
            userTasks.push(newTask);
            localStorage.setItem(`userTasks_${authService.currentUser.uid}`, JSON.stringify(userTasks));
            
            showNotification('✅ Задача добавлена!', 'success');
            closeModal();
            
            const plannerModal = document.querySelector('.planner-modal-overlay');
            if (plannerModal) {
                const event = new Event('click');
                const nextBtn = plannerModal.querySelector('#next-month-planner');
                const prevBtn = plannerModal.querySelector('#prev-month-planner');
                if (nextBtn) {
                    nextBtn.click();
                    setTimeout(() => prevBtn && prevBtn.click(), 10);
                }
            }
        });
    }
}

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
            if (target === 'schedule') {
                console.log('Переключились на вкладку расписания, рендерим расписание...');
                setTimeout(() => {
                    renderWeekSchedule();
                    setupWeekNavigation();
                }, 100);
            }
        });
    });
}



function updateUserInfo() {
    const userInfo = document.querySelector('.user-info');
    if (userInfo && mockData.user) {
        userInfo.textContent = `${mockData.user.group} | ${mockData.user.institute}`;
    }
}

function updateWeekInfo() {
    const currentWeekElement = document.getElementById('current-week');
    if (currentWeekElement) {
        const weekNumber = getCurrentWeek();
        currentWeekElement.textContent = `Неделя ${weekNumber}`;
    }
}


function isWeekend(dayOfWeek) {
  return dayOfWeek === 0 || dayOfWeek === 6; 
}

const HOLIDAYS = {
  '01-01': 'Новый год',
  '01-07': 'Рождество',
  '02-23': 'День защитника Отечества',
  '03-08': 'Международный женский день',
  '05-01': 'Праздник весны и труда',
  '05-09': 'День Победы',
  '06-12': 'День России',
  '11-04': 'День народного единства'
};

function isHoliday(date) {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return HOLIDAYS.hasOwnProperty(monthDay);
}

function getHolidayName(date) {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return HOLIDAYS[monthDay] || 'Праздничный день';
}

function getWeekDates(weekOffset = 0) {
    const startDate = new Date("2025-09-01");
    
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + ((currentDisplayWeek - 1) * 7)); 
    
    const dayOfWeek = monday.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(monday.getDate() + diffToMonday);
    
    const weekDates = [];
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        weekDates.push({
            dateString: `${year}-${month}-${day}`,
            date: new Date(date),
            dayOfWeek: date.getDay(),
            russianDayName: getRussianDayName(date.getDay())
        });
    }
    
    console.log('Даты для недели', currentDisplayWeek, ':', weekDates.map(d => d.dateString));
    return weekDates;
}


let cachedScheduleData = []; 
let scheduleAlreadyLoaded = false; 

async function getScheduleForWeek() {
    const universityId = authService.currentUniversity?.id;
    if (!universityId) return [];
    
    let baseSchedule = cachedScheduleData;
    if (cachedScheduleData.length === 0 && !scheduleAlreadyLoaded) {
        scheduleAlreadyLoaded = true;
        baseSchedule = await getUniversityDataFromDB('schedule');
        cachedScheduleData = baseSchedule;
        console.log('📅 Расписание загружено из БД:', baseSchedule.length);
        scheduleAlreadyLoaded = false;
    }
    
    const weekDates = getWeekDates();
    
    return weekDates.map(weekDay => {
        const daySchedule = baseSchedule.find(day => day.day === weekDay.russianDayName);
        
        if (daySchedule) {
            return {
                ...daySchedule,
                date: weekDay.dateString,
                dateObj: weekDay.date,
                dayOfWeek: weekDay.dayOfWeek
            };
        }
        
        return {
            university_id: universityId,
            day: weekDay.russianDayName,
            date: weekDay.dateString,
            dateObj: weekDay.date,
            dayOfWeek: weekDay.dayOfWeek,
            lessons: []
        };
    });
}



function getRussianDayName(dayIndex) {
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[dayIndex];
}

async function renderWeekSchedule() {
    const grid = document.getElementById('schedule-grid');
    if (!grid) return;

    if (!grid.classList.contains('schedule-grid')) {
        grid.classList.add('schedule-grid');
    }

    grid.innerHTML = '';

    const weekSchedule = await getScheduleForWeek();
    
    console.log('Рендерим расписание для учебной недели:', currentDisplayWeek);

    weekSchedule.forEach((dayData, index) => {
        const date = new Date(dayData.date);
        const dayOfWeek = date.getDay();
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'schedule-card';
        dayDiv.style.animationDelay = `${index * 0.1}s`;
        
        let dayIcon = '📅';
        let dayStatus = '';
        
        if (isWeekend(dayOfWeek)) {
            dayIcon = '🥰';
            dayStatus = 'Выходной';
        } else if (isHoliday(date)) {
            dayIcon = '🎉';
            dayStatus = getHolidayName(date);
        }
        
        const formattedDate = formatDate(dayData.date);
        
        dayDiv.innerHTML = `
            <div class="day-header">
                <h3>${dayIcon} ${dayData.day}</h3>
                <small>${formattedDate}</small>
                ${dayStatus ? `<div class="day-status">${dayStatus}</div>` : ''}
            </div>
        `;

        if (dayData.lessons && dayData.lessons.length > 0 && !isWeekend(dayOfWeek) && !isHoliday(date)) {
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
            const status = isHoliday(date) ? '🎉 Праздник' : 
                          (isWeekend(dayOfWeek) ? '🥰 Выходной' : '📚 Нет занятий');
            dayDiv.innerHTML += `<div class="empty-day">${status}</div>`;
        }

        grid.appendChild(dayDiv);
    });
}

async function renderTodaySchedule() {
    const todayContainer = document.getElementById('today-schedule');
    if (!todayContainer) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayName = getRussianDayName(dayOfWeek);
    
    console.log('📅 Рендерим сегодняшнее расписание:', dayName);
    
    if (cachedScheduleData.length === 0 && !scheduleAlreadyLoaded) {
        scheduleAlreadyLoaded = true;
        todayContainer.innerHTML = '<div class="loading">⏳ Загрузка расписания...</div>';
        const universitySchedule = await getUniversityDataFromDB('schedule');
        cachedScheduleData = universitySchedule;
        console.log('📅 Расписание загружено из БД (today):', universitySchedule.length);
        scheduleAlreadyLoaded = false;
    }
    
    todayContainer.innerHTML = '';
    
    const todaySchedule = cachedScheduleData.find(day => day.day === dayName);

    if (isWeekend(dayOfWeek) || isHoliday(today)) {
        todayContainer.innerHTML = `
            <div class="empty-schedule">
                <div class="icon">🎉</div>
                <h3>${isHoliday(today) ? '🎉 Праздничный день!' : '🥰 Выходной!'}</h3>
                <p>${isHoliday(today) ? getHolidayName(today) : 'Сегодня можно отдохнуть'}</p>
            </div>
        `;
        return;
    }

    if (!todaySchedule || !todaySchedule.lessons || todaySchedule.lessons.length === 0) {
        todayContainer.innerHTML = `
            <div class="empty-schedule">
                <div class="icon">📚</div>
                <h3>На сегодня пар нет!</h3>
                <p>Можно заняться самообразованием</p>
            </div>
        `;
        return;
    }

    todaySchedule.lessons.forEach(lesson => {
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

function getDayName(dayOfWeek) {
  const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  return days[dayOfWeek];
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            console.warn('Невалидная дата:', dateString);
            return dateString;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        
        if (compareDate.getTime() === today.getTime()) {
            return 'Сегодня';
        } else if (compareDate.getTime() === tomorrow.getTime()) {
            return 'Завтра';
        } else {
            return date.toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long' 
            });
        }
    } catch (error) {
        console.error('Ошибка форматирования даты:', error, dateString);
        return dateString;
    }
}


let newsAlreadyRendered = false;

async function renderNews() {
  if (newsAlreadyRendered) {
    console.log('Новости уже рендерятся, пропускаем...');
    return;
  }
  
  newsAlreadyRendered = true;
  console.log('Начинаем рендеринг новостей из БД...');
  
  const newsList = document.getElementById('news-list');
  if (!newsList) {
    console.log('Контейнер новостей не найден');
    newsAlreadyRendered = false;
    return;
  }

  console.log('Контейнер новостей найден');
  newsList.innerHTML = '';

  const newsHeader = document.createElement('div');
  newsHeader.className = 'news-header';
  newsHeader.innerHTML = `
    <h2>📢 Новости ${authService.currentUniversity?.shortName}</h2>
    <button class="add-news-btn" title="Добавить новость">
      <span class="plus-icon">+</span>
      <span class="btn-text">Добавить</span>
    </button>
  `;
  newsList.appendChild(newsHeader);

  const universityNews = await getUniversityDataFromDB('news');
  console.log('📰 Найдено новостей для университета:', universityNews.length);

  if (universityNews.length === 0) {
    const emptyNews = document.createElement('div');
    emptyNews.className = 'empty-news';
    emptyNews.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📢</div>
        <h3>Пока нет новостей</h3>
        <p>Будьте первым, кто поделится новостью!</p>
      </div>
    `;
    newsList.appendChild(emptyNews);
    setupNewsHandlers();
    return;
  }

  const sortedNews = [...universityNews].sort((a, b) => {
    const priorityOrder = { admin: 3, headman: 2, student: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    
    if (priorityDiff === 0) {
      return new Date(b.date) - new Date(a.date);
    }
    
    return priorityDiff;
  });

  console.log('Отсортированные новости:', sortedNews.length);

  const newsContainer = document.createElement('div');
  newsContainer.className = 'news-container';

  sortedNews.forEach(news => {
    const canEdit = canUserEditNews(news);
    const canDelete = canUserDeleteNews(news);
    
    const div = document.createElement('div');
    div.className = `news-item priority-${news.priority}`;
    div.innerHTML = `
      <div class="news-header-info">
        <span class="news-author">${getAuthorWithBadge(news)}</span>
        <span class="news-date">${formatDate(news.date)}</span>
      </div>
      <h4>${news.title}</h4>
      <p>${news.content}</p>
      ${canEdit || canDelete ? `
        <div class="news-actions">
          ${canEdit ? `<button class="news-action-btn edit-news" data-news-id="${news.id}" title="Редактировать">✏️</button>` : ''}
          ${canDelete ? `<button class="news-action-btn delete-news" data-news-id="${news.id}" title="Удалить">🗑️</button>` : ''}
        </div>
      ` : ''}
    `;
    newsContainer.appendChild(div);
  });

  newsList.appendChild(newsContainer);

  setupNewsHandlers();
  
  console.log('✅ Новости успешно отрендерены');
  newsAlreadyRendered = false;
}


async function forceRenderNews() {
  console.log('🔄 Принудительная перерисовка новостей');
  newsAlreadyRendered = false; 
  await renderNews();
}

function getAuthorWithBadge(news) {
  const badges = {
    'admin': '🔔',
    'headman': '⭐', 
    'student': '📢'
  };
  
  return `${badges[news.priority]} ${news.author}`;
}

function canUserEditNews(news) {
  const user = authService.currentUser;
  if (!user) return false;
  
  if (news.author === (user.profile.firstName + ' ' + user.profile.lastName)) {
    return true;
  }
  
  if (user.permissions.includes('admin')) {
    return true;
  }
  
  if (user.permissions.includes('headman') && news.priority === 'student') {
    return true;
  }
  
  return false;
}

function canUserDeleteNews(news) {
  const user = authService.currentUser;
  if (!user) return false;
  
  console.log('Проверка прав удаления:', {
    user: user.profile.firstName,
    userPermissions: user.permissions,
    newsAuthor: news.author,
    newsPriority: news.priority
  });
  
  const userName = user.profile.firstName + ' ' + user.profile.lastName;
  if (news.author === userName) {
    console.log('Может удалить: своя новость');
    return true;
  }
  
  if (user.permissions.includes('admin')) {
    console.log('Может удалить: администратор');
    return true;
  }
  
  if (user.permissions.includes('headman')) {
    const newsPriorityLevel = getPriorityLevel(news.priority);
    const userPriorityLevel = getPriorityLevel('headman');
    
    console.log('Проверка прав старосты:', {
      newsPriority: news.priority,
      newsPriorityLevel: newsPriorityLevel,
      userPriorityLevel: userPriorityLevel
    });
    
    if (newsPriorityLevel < userPriorityLevel) {
      console.log('Может удалить: староста может удалять студенческие новости');
      return true;
    } else {
      console.log('Не может удалить: староста не может удалять новости других старост или админов');
      return false;
    }
  }
  
  console.log('Не может удалить: нет прав');
  return false;
}

function getPriorityLevel(priority) {
  const levels = {
    'admin': 3,    
    'headman': 2,   
    'student': 1    
  };
  return levels[priority] || 0;
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `success-notification ${type}-notification`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

function editNews(newsId) {
  const news = mockData.news.find(n => n.id === newsId);
  if (!news) return;
  
  if (!canUserEditNews(news)) {
    alert('У вас нет прав для редактирования этой новости');
    return;
  }
  
  openEditNewsModal(news);
}

function saveNewsToLocalStorage() {
  try {
    localStorage.setItem('universityNews', JSON.stringify(mockData.news));
    console.log('Новости сохранены в localStorage');
  } catch (error) {
    console.error('Ошибка сохранения новостей:', error);
  }
}

function deleteNews(newsId) {
  console.log('Попытка удаления новости:', newsId);
  
  const news = mockData.news.find(n => n.id === newsId);
  if (!news) {
    console.log('Новость не найдена');
    return;
  }
  
  console.log('Найдена новость:', {
    id: news.id,
    title: news.title,
    author: news.author,
    priority: news.priority
  });
  
  if (!canUserDeleteNews(news)) {
    alert('❌ У вас нет прав для удаления этой новости');
    return;
  }
  
  const userName = authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName;
  const isOwnNews = news.author === userName;
  const userPriority = authService.currentUser.permissions.includes('admin') ? 'admin' : 
                      authService.currentUser.permissions.includes('headman') ? 'headman' : 'student';
  
  let confirmMessage = 'Вы уверены, что хотите удалить эту новость?';
  
  if (!isOwnNews) {
    if (userPriority === 'headman') {
      confirmMessage = `Вы уверены, что хотите удалить новость студента "${news.author}"?\n\nКак староста, вы можете удалять только студенческие новости.`;
    } else if (userPriority === 'admin') {
      confirmMessage = `Вы уверены, что хотите удалить новость пользователя "${news.author}"?\n\nКак администратор, вы можете удалять любые новости.`;
    }
  }
  
  if (confirm(confirmMessage)) {
    const initialLength = mockData.news.length;
    mockData.news = mockData.news.filter(n => n.id !== newsId);
    
    console.log('Новость удалена. Было:', initialLength, 'стало:', mockData.news.length);
    
    saveNewsToLocalStorage();
    
    forceRenderNews();
    
    let successMessage = '✅ Новость удалена';
    if (!isOwnNews) {
      if (userPriority === 'headman') {
        successMessage = `✅ Новость студента "${news.author}" удалена`;
      } else if (userPriority === 'admin') {
        successMessage = `✅ Новость пользователя "${news.author}" удалена`;
      }
    }
    
    showNotification(successMessage, 'success');
  }
}

function openEditNewsModal(news) {
  const modal = document.createElement('div');
  modal.className = 'service-modal active';
  
  const canChangePriority = authService.currentUser.permissions.includes('admin') || 
                          (authService.currentUser.permissions.includes('headman') && news.priority === 'student');
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>✏️ Редактировать новость</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="edit-news-form" class="news-form">
          <div class="form-group">
            <label>Заголовок новости *</label>
            <input type="text" id="edit-news-title" class="form-input" value="${news.title}" maxlength="100" required>
            <div class="char-counter"><span id="edit-title-chars">${news.title.length}</span>/100</div>
          </div>
          
          <div class="form-group">
            <label>Текст новости *</label>
            <textarea id="edit-news-content" class="form-textarea" rows="5" maxlength="500" required>${news.content}</textarea>
            <div class="char-counter"><span id="edit-content-chars">${news.content.length}</span>/500</div>
          </div>
          
          ${canChangePriority ? `
            <div class="form-group">
              <label>Приоритет</label>
              <div class="priority-options">
                <label class="radio-option">
                  <input type="radio" name="edit-priority" value="student" ${news.priority === 'student' ? 'checked' : ''}>
                  <span class="radio-custom"></span>
                  <span class="radio-label">
                    <strong>Обычная</strong>
                    <small>Новость от студента</small>
                  </span>
                </label>
                ${authService.currentUser.permissions.includes('headman') ? `
                  <label class="radio-option">
                    <input type="radio" name="edit-priority" value="headman" ${news.priority === 'headman' ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-label">
                      <strong>Важная</strong>
                      <small>Новость от старосты</small>
                    </span>
                  </label>
                ` : ''}
                ${authService.currentUser.permissions.includes('admin') ? `
                  <label class="radio-option">
                    <input type="radio" name="edit-priority" value="admin" ${news.priority === 'admin' ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-label">
                      <strong>Официальная</strong>
                      <small>Новость от администрации</small>
                    </span>
                  </label>
                ` : ''}
              </div>
            </div>
          ` : ''}
          
          <div class="news-preview">
            <h4>👀 Предпросмотр</h4>
            <div class="preview-content">
              <div class="preview-header">
                <span class="preview-author">${news.author}</span>
                <span class="preview-date">${formatDate(news.date)} (изменено)</span>
              </div>
              <h5 id="edit-preview-title">${news.title}</h5>
              <p id="edit-preview-content">${news.content}</p>
              <div class="preview-priority" id="edit-preview-priority">${getPriorityBadge(news.priority)}</div>
            </div>
          </div>
        </form>
        
        <div class="service-actions">
          <button type="button" class="btn-secondary">Отмена</button>
          <button type="button" id="update-news" class="btn-primary">Сохранить изменения</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setupEditNewsModalHandlers(modal, news);
}

function setupEditNewsModalHandlers(modal, originalNews) {
  const form = modal.querySelector('#edit-news-form');
  const updateBtn = modal.querySelector('#update-news');
  const titleInput = modal.querySelector('#edit-news-title');
  const contentInput = modal.querySelector('#edit-news-content');
  
  const titleCounter = modal.querySelector('#edit-title-chars');
  const contentCounter = modal.querySelector('#edit-content-chars');
  
  const updatePreview = () => {
    const title = titleInput.value || 'Заголовок новости';
    const content = contentInput.value || 'Текст новости появится здесь...';
    const priority = modal.querySelector('input[name="edit-priority"]:checked')?.value || originalNews.priority;
    
    modal.querySelector('#edit-preview-title').textContent = title;
    modal.querySelector('#edit-preview-content').textContent = content;
    modal.querySelector('#edit-preview-priority').textContent = getPriorityBadge(priority);
  };
  
  titleInput.addEventListener('input', () => {
    titleCounter.textContent = titleInput.value.length;
    updatePreview();
  });
  
  contentInput.addEventListener('input', () => {
    contentCounter.textContent = contentInput.value.length;
    updatePreview();
  });
  
  const priorityRadios = modal.querySelectorAll('input[name="edit-priority"]');
  priorityRadios.forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });
  
  updateBtn.addEventListener('click', function(e) {
    e.preventDefault();
    handleNewsUpdate(modal, originalNews.id);
  });
  
  setupModalHandlers(modal);
}

function handleNewsUpdate(modal, newsId) {
  const title = modal.querySelector('#edit-news-title').value.trim();
  const content = modal.querySelector('#edit-news-content').value.trim();
  const priority = modal.querySelector('input[name="edit-priority"]:checked')?.value;
  
  if (!title || !content) {
    alert('Пожалуйста, заполните заголовок и текст новости');
    return;
  }
  
  const newsIndex = mockData.news.findIndex(n => n.id === newsId);
  if (newsIndex === -1) return;
  
  mockData.news[newsIndex].title = title;
  mockData.news[newsIndex].content = content;
  if (priority) {
    mockData.news[newsIndex].priority = priority;
  }
  
  saveNewsToLocalStorage();
  
  document.body.removeChild(modal);
  
  showNotification('✅ Новость обновлена', 'success');
  renderNews();
}

function getPriorityBadge(priority) {
  const badges = {
    'student': '📢 Обычная новость',
    'headman': '⭐ Важная новость', 
    'admin': '🔔 Официальная новость'
  };
  return badges[priority] || '📢 Новость';
}

function setupNewsHandlers() {
  const addNewsBtn = document.querySelector('.add-news-btn');
  if (addNewsBtn) {
    addNewsBtn.addEventListener('click', openCreateNewsModal);
  }

  const editButtons = document.querySelectorAll('.edit-news');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newsId = parseInt(e.target.closest('.edit-news').getAttribute('data-news-id'));
      editNews(newsId);
    });
  });

  const deleteButtons = document.querySelectorAll('.delete-news');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newsId = parseInt(e.target.closest('.delete-news').getAttribute('data-news-id'));
      deleteNews(newsId);
    });
  });
}

function openCreateNewsModal() {
  const modal = document.createElement('div');
  modal.className = 'service-modal active';
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>📝 Создать новость</h3>
        <button class="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <form id="create-news-form" class="news-form">
          <div class="form-group">
            <label>Заголовок новости *</label>
            <input type="text" id="news-title" class="form-input" placeholder="Введите заголовок..." maxlength="100" required>
            <div class="char-counter"><span id="title-chars">0</span>/100</div>
          </div>
          
          <div class="form-group">
            <label>Текст новости *</label>
            <textarea id="news-content" class="form-textarea" placeholder="Напишите текст новости..." rows="5" maxlength="500" required></textarea>
            <div class="char-counter"><span id="content-chars">0</span>/500</div>
          </div>
          
          <div class="form-group">
            <label>Приоритет</label>
            <div class="priority-options">
              <label class="radio-option">
                <input type="radio" name="priority" value="student" checked>
                <span class="radio-custom"></span>
                <span class="radio-label">
                  <strong>Обычная</strong>
                  <small>Новость от студента</small>
                </span>
              </label>
              ${authService.currentUser.permissions.includes('headman') ? `
                <label class="radio-option">
                  <input type="radio" name="priority" value="headman">
                  <span class="radio-custom"></span>
                  <span class="radio-label">
                    <strong>Важная</strong>
                    <small>Новость от старосты</small>
                  </span>
                </label>
              ` : ''}
              ${authService.currentUser.permissions.includes('admin') ? `
                <label class="radio-option">
                  <input type="radio" name="priority" value="admin">
                  <span class="radio-custom"></span>
                  <span class="radio-label">
                    <strong>Официальная</strong>
                    <small>Новость от администрации</small>
                  </span>
                </label>
              ` : ''}
            </div>
          </div>
          
          <div class="form-group">
            <label>Категория</label>
            <select id="news-category" class="form-select">
              <option value="general">Общая</option>
              <option value="events">Мероприятия</option>
              <option value="studies">Учеба</option>
              <option value="sports">Спорт</option>
              <option value="clubs">Клубы</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div class="news-preview">
            <h4>👀 Предпросмотр</h4>
            <div class="preview-content">
              <div class="preview-header">
                <span class="preview-author">${authService.currentUser.profile.firstName} ${authService.currentUser.profile.lastName}</span>
                <span class="preview-date">Сегодня</span>
              </div>
              <h5 id="preview-title">Заголовок новости</h5>
              <p id="preview-content">Текст новости появится здесь...</p>
              <div class="preview-priority" id="preview-priority">📢 Обычная новость</div>
            </div>
          </div>
        </form>
        
        <div class="service-actions">
          <button type="button" class="btn-secondary">Отмена</button>
          <button type="button" id="submit-news" class="btn-primary">Опубликовать</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setupNewsModalHandlers(modal);
}

function setupNewsModalHandlers(modal) {
  const form = modal.querySelector('#create-news-form');
  const submitBtn = modal.querySelector('#submit-news');
  const titleInput = modal.querySelector('#news-title');
  const contentInput = modal.querySelector('#news-content');
  const priorityRadios = modal.querySelectorAll('input[name="priority"]');
  
  const titleCounter = modal.querySelector('#title-chars');
  const contentCounter = modal.querySelector('#content-chars');
  
  const updatePreview = () => {
    const title = titleInput.value || 'Заголовок новости';
    const content = contentInput.value || 'Текст новости появится здесь...';
    const priority = modal.querySelector('input[name="priority"]:checked').value;
    
    modal.querySelector('#preview-title').textContent = title;
    modal.querySelector('#preview-content').textContent = content;
    
    const priorityTexts = {
      'student': '📢 Обычная новость',
      'headman': '⭐ Важная новость',
      'admin': '🔔 Официальная новость'
    };
    modal.querySelector('#preview-priority').textContent = priorityTexts[priority];
  };
  
  titleInput.addEventListener('input', () => {
    titleCounter.textContent = titleInput.value.length;
    updatePreview();
  });
  
  contentInput.addEventListener('input', () => {
    contentCounter.textContent = contentInput.value.length;
    updatePreview();
  });
  
  priorityRadios.forEach(radio => {
    radio.addEventListener('change', updatePreview);
  });
  
  updatePreview();
  
  submitBtn.addEventListener('click', function(e) {
    e.preventDefault();
    handleNewsSubmission(modal);
  });
  setupModalHandlers(modal);
}

async function handleNewsSubmission(modal) {
  const title = modal.querySelector('#news-title').value.trim();
  const content = modal.querySelector('#news-content').value.trim();
  const priority = modal.querySelector('input[name="priority"]:checked').value;
  const category = modal.querySelector('#news-category').value;
  
  console.log('📝 Создание новости:', { title, content, priority, category });
  
  if (!title || !content) {
    alert('Пожалуйста, заполните заголовок и текст новости');
    return;
  }
  
  const newsData = {
    university_id: authService.currentUniversity.id,
    title: title,
    content: content,
    author: authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName,
    priority: priority,
    date: new Date().toISOString().split('T')[0],
    likes: 0,
    comments: []
  };
  
  console.log('📋 Данные новости:', newsData);
  
  const createdNews = await SupabaseDB.createNews(newsData);
  console.log('✅ Новость создана:', createdNews);
  
  document.body.removeChild(modal);
  
  showNewsSuccessNotification(createdNews);
  
  console.log('🔄 Обновляем список новостей');
  await renderNews();
}

function editNews(newsId) {
  const news = mockData.news.find(n => n.id === newsId);
  if (!news) return;
  
  if (news.author !== authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName) {
    alert('Вы можете редактировать только свои новости');
    return;
  }
  
  console.log('Редактирование новости:', newsId);
  alert('Редактирование новости в разработке!');
}

async function deleteNews(newsId) {
  console.log('🗑️ Попытка удаления новости:', newsId);
  
  let news = null;
  try {
    const allNews = await getUniversityDataFromDB('news');
    news = allNews.find(n => n.id === newsId);
  } catch (error) {
    console.error('Ошибка загрузки новости:', error);
    news = mockData.news.find(n => n.id === newsId);
  }
  
  if (!news) {
    console.log('❌ Новость не найдена');
    return;
  }
  
  if (!canUserDeleteNews(news)) {
    alert('❌ У вас нет прав для удаления этой новости');
    return;
  }
  
  const userName = authService.currentUser.profile.firstName + ' ' + authService.currentUser.profile.lastName;
  const isOwnNews = news.author === userName;
  
  let confirmMessage = 'Вы уверены, что хотите удалить эту новость?';
  if (!isOwnNews) {
    confirmMessage = `Вы уверены, что хотите удалить новость пользователя "${news.author}"?`;
  }
  
  if (confirm(confirmMessage)) {
    await SupabaseDB.deleteNews(newsId);
    
    let successMessage = '✅ Новость удалена';
    if (!isOwnNews) {
      successMessage = `✅ Новость пользователя "${news.author}" удалена`;
    }
    
    showNotification(successMessage, 'success');
    
    await renderNews();
  }
}


function showNewsSuccessNotification(newsData) {
  const notification = document.createElement('div');
  notification.className = 'success-notification news-success';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">✅</span>
      <div class="notification-text">
        <strong>Новость опубликована!</strong>
        <div style="font-size: 0.9rem; margin-top: 5px; opacity: 0.9;">
          "${newsData.title}"<br>
          <em>Статус: Опубликовано</em>
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
}

function setupServices() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.replaceWith(card.cloneNode(true));
    });
    
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', handleServiceClick);
    });
}

function handleServiceClick(event) {
    const card = event.currentTarget;
    const service = card.getAttribute('data-service');

    console.log('Клик по сервису:', service);
    closeAllServiceModals();
    switch(service) {
        case 'library':
            showServiceModal('📚 Библиотека', 
                'Данный сервис пока не реализован, но мы займемся этим позже, но вы не расстраивайтесь, посмотрите на остальные сервисы, они хороши, поверьте мне )');
            break;
            
        case 'documents':
            openDocumentsService();
            break;
            
        case 'dormitory':
            openDormitoryService();
            break;

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

function closeAllServiceModals() {
    const existingModals = document.querySelectorAll('.service-modal');
    existingModals.forEach(modal => {
        document.body.removeChild(modal);
    });
}

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

function openRoomBooking() {
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
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

function setupRoomBookingHandlers(modal, classrooms) {
    const roomTypeSelect = modal.querySelector('#room-type');
    const roomSelect = modal.querySelector('#room-select');
    const roomInfo = modal.querySelector('#room-info');
    const roomDetails = modal.querySelector('#room-details');
    const submitBtn = modal.querySelector('#submit-booking');
    const bookingForm = modal.querySelector('#booking-form');
    
    roomTypeSelect.addEventListener('change', function() {
        const selectedType = this.value;
        updateRoomOptions(roomSelect, roomInfo, roomDetails, selectedType, classrooms);
    });
    
    roomSelect.addEventListener('change', function() {
        const selectedRoomId = this.value;
        if (selectedRoomId) {
            showRoomDetails(roomDetails, selectedRoomId, classrooms);
            roomInfo.style.display = 'block';
        } else {
            roomInfo.style.display = 'none';
        }
    });
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleBookingSubmission(modal, bookingForm, classrooms);
    });
    
    setupModalHandlers(modal);
}

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
    
    if (room && parseInt(bookingData.participants) > room.capacity) {
        alert(`❌ Превышена вместимость аудитории! Максимум: ${room.capacity} человек`);
        return;
    }
    
    showBookingSuccessNotification(bookingData, modal);
}

function showBookingSuccessNotification(bookingData, modal) {
    document.body.removeChild(modal);
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
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    console.log('Бронирование создано:', bookingData);
}

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

function showEventsCalendar() {
    if (document.querySelector('.service-modal[data-service="events"]')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'service-modal active';
    modal.setAttribute('data-service', 'events');
    
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
    
    renderEventsFromDatabase('all', universityEvents);
    setupEventsFilterHandlers(modal, universityEvents);
}

function renderEventsFromDatabase(filter = 'all', events = null) {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) {
        console.log('Контейнер мероприятий не найден');
        return;
    }
    
    const universityEvents = events || getUniversityData('events');
    
    console.log('Рендерим мероприятия. Фильтр:', filter, 'Количество:', universityEvents.length);

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
    
    setupEventRegistrationHandlers();
    setupEventUnregistrationHandlers();
    
    console.log('Мероприятия отрендерены:', filteredEvents.length);
}

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

function setupEventRegistrationHandlers() {
    const registerButtons = document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)');
    
    console.log(' Найдено кнопок записи:', registerButtons.length);
    
    registerButtons.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            console.log('Клик по записи на мероприятие:', eventId);
            
            const event = mockData.events.find(e => e.id === eventId);
            
            if (!event) {
                console.error('❌ Мероприятие не найдено:', eventId);
                return;
            }
            
            const registeredCount = event.registeredUsers ? event.registeredUsers.length : 0;
            if (registeredCount >= event.capacity) {
                alert('❌ Извините, все места заняты!');
                return;
            }
            
            registerUserForEvent(eventId, this);
        });
    });
}

function registerUserForEvent(eventId, button) {
    const event = mockData.events.find(e => e.id === eventId);
    if (!event) {
        console.error('Мероприятие не найдено');
        return;
    }

    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    btnText.textContent = 'Записываем...';
    btnIcon.textContent = '⏳';
    button.classList.add('registering');
    
    console.log('Начинаем запись пользователя', authService.currentUser.id, 'на мероприятие', eventId);
    
    setTimeout(() => {
        if (!event.registeredUsers) {
            event.registeredUsers = [];
        }
        
        if (!event.registeredUsers.includes(authService.currentUser.id)) {
            event.registeredUsers.push(authService.currentUser.id);
            
            saveEventsToLocalStorage();
            
            showEventRegistrationSuccess(event.title);
            
            const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
            renderEventsFromDatabase(currentFilter);
        }
        
    }, 1000);
}

function setupEventUnregistrationHandlers() {
    const unregisterButtons = document.querySelectorAll('.event-unregister-btn');
    
    unregisterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            const event = mockData.events.find(e => e.id === eventId);
            
            if (!event) return;
            
            if (confirm(`Вы уверены, что хотите отписаться от мероприятия "${event.title}"?`)) {
                unregisterUserFromEvent(eventId, this);
            }
        });
    });
}

function unregisterUserFromEvent(eventId, button) {
    const event = mockData.events.find(e => e.id === eventId);
    if (!event) return;

    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    btnText.textContent = 'Отписываемся...';
    btnIcon.textContent = '⏳';
    button.classList.add('unregistering');
    
    setTimeout(() => {
        if (event.registeredUsers) {
            const userIndex = event.registeredUsers.indexOf(authService.currentUser.id);
            if (userIndex !== -1) {
                event.registeredUsers.splice(userIndex, 1);
                saveEventsToLocalStorage();
                
                showEventUnregistrationSuccess(event.title);
                
                const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
                renderEventsFromDatabase(currentFilter);
            }
        }
        
    }, 1000);
}

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

function isUserRegisteredForEvent(eventId) {
    if (!authService.currentUser) return false;
    
    const event = mockData.events.find(e => e.id === eventId);
    if (!event || !event.registeredUsers) return false;
    
    return event.registeredUsers.includes(authService.currentUser.id);
}

function saveEventsToLocalStorage() {
    try {
        localStorage.setItem('universityEvents', JSON.stringify(mockData.events));
        console.log(' Мероприятия сохранены в localStorage');
    } catch (error) {
        console.error(' Ошибка сохранения мероприятий:', error);
    }
}

function loadEventsFromLocalStorage() {
    try {
        const savedEvents = localStorage.getItem('universityEvents');
        if (savedEvents) {
            const parsedEvents = JSON.parse(savedEvents);
            
            parsedEvents.forEach(savedEvent => {
                const existingEvent = mockData.events.find(e => e.id === savedEvent.id);
                if (existingEvent && savedEvent.registeredUsers) {
                    existingEvent.registeredUsers = savedEvent.registeredUsers;
                }
            });
            console.log('Данные о записях загружены из localStorage');
        }
    } catch (error) {
        console.error('Ошибка загрузки мероприятий:', error);
    }
}

function openCreateClubModal() {
    console.log('Открытие модалки создания клуба...');
    
    closeAllServiceModals();
    
    const modal = document.getElementById('create-club-modal');
    
    if (!modal) {
        console.error('Модалка создания клуба не найдена!');
        return;
    }
    
    modal.classList.remove('hidden');
    
    initializeClubForm();
    
    setTimeout(() => {
        initializeTags();
        initializeEmojiPicker();
        setupClubModalHandlers();
        console.log('Все обработчики установлены');
    }, 100);
}

async function handleClubCreation(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('club-name').value.trim(),
        description: document.getElementById('club-desc').value.trim(),
        category: document.getElementById('club-category').value,
        icon: document.getElementById('club-icon').value,
        format: document.querySelector('input[name="club-format"]:checked').value,
        max_members: parseInt(document.getElementById('club-max-members').value),
        meeting_day: document.getElementById('club-meeting-day').value,
        contact: document.getElementById('club-contact').value.trim(),
        tags: [...clubFormSelectedTags]
    };
    
    if (formData.tags.length === 0) {
        alert('Пожалуйста, выберите хотя бы один тег');
        return;
    }
    
    if (formData.tags.length > 5) {
        alert('Можно выбрать не более 5 тегов');
        return;
    }
    
    if (!formData.name || !formData.description || !formData.category || !formData.meeting_day || !formData.contact) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    const newClub = {
        university_id: authService.currentUniversity.id,
        ...formData,
        members: 1,
        activity: 'medium'
    };
    
    console.log('📝 Создание клуба:', newClub);
    
    const createdClub = await SupabaseDB.createClub(newClub);
    console.log('✅ Клуб создан:', createdClub);
    
    const modal = document.getElementById('create-club-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    const form = document.getElementById('create-club-form');
    if (form) {
        form.reset();
        clubFormSelectedTags = [];
        updateClubFormTagsDisplay();
    }
    
    showClubCreationSuccessNotification(createdClub);
    
    clubsAlreadyRendered = false;
    await renderClubs();
}

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
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
    
    console.log('Клуб создан:', club);
}

function getClubFormatText(format) {
    const formats = {
        'open': 'Открытый',
        'approval': 'По заявке', 
        'closed': 'Закрытый'
    };
    return formats[format] || format;
}

function saveClubsToLocalStorage() {
    try {
        localStorage.setItem('userClubs', JSON.stringify(mockData.clubs));
        console.log('Клубы сохранены в localStorage');
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
}

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
            console.log('Клубы загружены из localStorage');
        }
    } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
    }
}

function initializeClubForm() {
    console.log('Инициализация формы создания клуба...');
    
    clubFormSelectedTags = [];
    updateClubFormTagsDisplay();
    
    console.log('Форма инициализирована');
}

function initializeTags() {
    console.log('Инициализация тегов...');
    const tagsContainer = document.getElementById('club-tags-selector');
    if (!tagsContainer) {
        console.error('Контейнер тегов не найден!');
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
    console.log('Теги инициализированы');
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
    
    selectedTagsContainer.querySelectorAll('.remove-tag').forEach(removeBtn => {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tagToRemove = removeBtn.getAttribute('data-tag');
            removeTag(tagToRemove);
        });
    });
}

function removeTag(tag) {
    clubFormSelectedTags = clubFormSelectedTags.filter(t => t !== tag);
    updateClubFormTagsDisplay();
    
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

function initializeEmojiPicker() {
    console.log('Инициализация эмодзи...');
    const emojiGrid = document.getElementById('emoji-grid');
    const emojiCategories = document.querySelectorAll('.emoji-category');
    const iconInput = document.getElementById('club-icon');
    
    if (!emojiGrid || !iconInput) {
        console.error('Элементы эмодзи не найдены!');
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
                document.querySelectorAll('.emoji-picker').forEach(picker => {
                    picker.style.display = 'none';
                });
            });
            emojiGrid.appendChild(emojiElement);
        });
    }
    
    showEmojis('popular');
    
    emojiCategories.forEach(categoryBtn => {
        categoryBtn.addEventListener('click', () => {
            emojiCategories.forEach(btn => btn.classList.remove('active'));
            categoryBtn.classList.add('active');
            showEmojis(categoryBtn.dataset.category);
        });
    });
    
    iconInput.addEventListener('click', () => {
        const picker = document.querySelector('.emoji-picker');
        if (picker) {
            picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    console.log('Эмодзи инициализированы');
}

function setupClubModalHandlers() {
    console.log('Tастройка обработчиков модалки...');
    const modal = document.getElementById('create-club-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('create-club-form');
    
    if (!closeBtn || !cancelBtn || !form) {
        console.error('Элементы модалки не найдены!');
        return;
    }
    
    function closeModal() {
        console.log('Закрытие модалки...');
        modal.classList.add('hidden');
        form.reset();
        clubFormSelectedTags = [];
        updateClubFormTagsDisplay();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    form.addEventListener('submit', handleClubCreation);
    
    const descTextarea = document.getElementById('club-desc');
    const charCounter = document.getElementById('desc-chars');
    
    if (descTextarea && charCounter) {
        descTextarea.addEventListener('input', () => {
            charCounter.textContent = descTextarea.value.length;
        });
    }
    
    console.log('Обработчики модалки установлены');
}

function initializeSmartSearch() {
    const searchInput = document.getElementById('club-search');
    const smartFiltersBtn = document.getElementById('smart-filters-btn');
    const quickFilters = document.querySelectorAll('.quick-filters .filter-btn');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.searchText = e.target.value.toLowerCase();
            filterClubs();
        });
    }

    if (smartFiltersBtn) {
        smartFiltersBtn.addEventListener('click', () => {
            const filtersPanel = document.getElementById('smart-filters');
            filtersPanel.classList.toggle('hidden');
        });
    }

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

    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applySmartFilters);
    }
    
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
  const allUniversityClubs = cachedClubsData.length > 0 ? cachedClubsData : getUniversityData('clubs');
  
  const filteredClubs = allUniversityClubs.filter(club => {
    if (currentFilters.searchText) {
      const searchText = currentFilters.searchText;
      const searchIn = `${club.name} ${club.description || club.desc || ''} ${(club.tags || []).join(' ')}`.toLowerCase();
      if (!searchIn.includes(searchText)) return false;
    }

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
    console.log('Контейнер для клубов не найден');
    return;
  }

  console.log('Рендерим отфильтрованные клубы:', clubs.length);

  const universityClubs = clubs.filter(club => 
    club.university_id === authService.currentUniversity?.id
  );

  console.log('Клубы после фильтрации по университету:', universityClubs.length);

  if (universityClubs.length === 0) {
    container.innerHTML = '';
    if (noResults) {
      noResults.classList.remove('hidden');
    } else {
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
  
  console.log('Клубы отрендерены:', universityClubs.length);
}

let clubsAlreadyRendered = false;
let cachedClubsData = []; 

async function renderClubs() {
  if (clubsAlreadyRendered) {
    console.log('⏭️ Клубы уже рендерятся, пропускаем...');
    return;
  }
  
  clubsAlreadyRendered = true;
  
  const container = document.getElementById('clubs-list');
  if (!container) {
    console.log('❌ Контейнер клубов не найден');
    clubsAlreadyRendered = false;
    return;
  }

  console.log('🔄 Рендерим клубы для университета:', authService.currentUniversity?.name);
  
  container.innerHTML = '';

  const universityClubs = await getUniversityDataFromDB('clubs');
  cachedClubsData = universityClubs;
  console.log('🎭 Найдено клубов:', universityClubs.length);

  if (universityClubs.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🎭</div>
        <h3>В вашем университете пока нет клубов</h3>
        <p>Будьте первым - создайте свой клуб!</p>
        <button class="reset-btn" onclick="openCreateClubModal()">Создать клуб</button>
      </div>
    `;
    clubsAlreadyRendered = false;
    return;
  }

  renderFilteredClubs(universityClubs);
  
  setTimeout(() => {
    if (typeof initializeSmartSearch === 'function') {
      initializeSmartSearch();
    }
    clubsAlreadyRendered = false;
  }, 50);
}

function setupModalHandlers(modal) {
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    const cancelBtn = modal.querySelector('.btn-secondary');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }
}

function setupWeekNavigation() {
    const scheduleSection = document.getElementById('schedule');
    const prevBtn = scheduleSection ? scheduleSection.querySelector('#prev-week') : null;
    const nextBtn = scheduleSection ? scheduleSection.querySelector('#next-week') : null;
    const currentWeekLabel = scheduleSection ? scheduleSection.querySelector('#current-week') : null;

    console.log('=== НАВИГАЦИЯ ПО НЕДЕЛЯМ ===');
    console.log('Текущая учебная неделя:', currentDisplayWeek);

    if (prevBtn && nextBtn && currentWeekLabel) {
        updateWeekDisplay();
        
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        
        const newPrevBtn = scheduleSection.querySelector('#prev-week');
        const newNextBtn = scheduleSection.querySelector('#next-week');
        
        newPrevBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            console.log('⬅️ Предыдущая неделя. Было:', currentDisplayWeek);
            if (currentDisplayWeek > 1) {
                await animateWeekTransition('left', async () => {
                    currentDisplayWeek--;
                    console.log('Стало:', currentDisplayWeek);
                    updateWeekDisplay();
                    await renderWeekSchedule();
                });
            } else {
                console.log('Достигнута первая неделя');
                showNotification('Это первая учебная неделя', 'info');
                shakeButton(newPrevBtn);
            }
        });

        newNextBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            console.log('➡️ Следующая неделя. Было:', currentDisplayWeek);
            
            if (currentDisplayWeek < 52) {
                await animateWeekTransition('right', async () => {
                    currentDisplayWeek++;
                    console.log('Стало:', currentDisplayWeek);
                    updateWeekDisplay();
                    await renderWeekSchedule();
                });
            } else {
                console.log('Достигнута последняя неделя учебного года');
                showNotification('Это последняя учебная неделя', 'info');
                shakeButton(newNextBtn);
            }
        });
        
        console.log('Навигация инициализирована. Текущая неделя:', currentDisplayWeek);
    }
}

function disableWeekNavigation(disabled) {
    const prevBtn = document.querySelector('#prev-week');
    const nextBtn = document.querySelector('#next-week');
    
    if (prevBtn && nextBtn) {
        if (disabled) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            prevBtn.style.opacity = '0.5';
            nextBtn.style.opacity = '0.5';
            prevBtn.style.cursor = 'not-allowed';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            prevBtn.style.opacity = '1';
            nextBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
            nextBtn.style.cursor = 'pointer';
        }
    }
}

async function animateWeekTransition(direction, callback) {
    const grid = document.getElementById('schedule-grid');
    if (!grid) {
        callback();
        return;
    }

    if (!grid.classList.contains('schedule-grid')) {
        grid.classList.add('schedule-grid');
    }

    disableWeekNavigation(true);

    grid.classList.add(`slide-out-${direction}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    callback();
    
    grid.classList.remove(`slide-out-${direction}`);
    grid.classList.add(`slide-in-${direction}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    grid.classList.remove(`slide-in-${direction}`);
    
    disableWeekNavigation(false);
}

function updateWeekDisplay() {
    const scheduleSection = document.getElementById('schedule');
    const currentWeekLabel = scheduleSection ? scheduleSection.querySelector('#current-week') : null;
    
    if (currentWeekLabel) {
        if (!currentWeekLabel.classList.contains('current-week-display')) {
            currentWeekLabel.classList.add('current-week-display');
        }
        
        currentWeekLabel.classList.add('week-changing');
        
        setTimeout(() => {
            currentWeekLabel.textContent = `Учебная неделя ${currentDisplayWeek}`;
            setTimeout(() => {
                currentWeekLabel.classList.remove('week-changing');
            }, 150);
        }, 150);
        
        console.log('Обновлена надпись недели:', currentDisplayWeek);
    }
}

function shakeButton(button) {
    button.classList.add('shake');
    setTimeout(() => {
        button.classList.remove('shake');
    }, 500);
}


function formatWeekRange(startDate, endDate) {
    const start = startDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
    });
    const end = endDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short' 
    });
    
    if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString('ru-RU', { month: 'long' })}`;
    } else {
        return `${start} - ${end}`;
    }
}


async function openPlanner() {
    await loadUserEvents();
    
    const modal = document.createElement('div');
    modal.className = 'service-modal active planner-modal-overlay';
    
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    modal.innerHTML = `
        <div class="modal-content planner-modal-content">
            <div class="planner-modal-header">
                <div class="planner-header-left">
                    <span class="planner-header-icon">📅</span>
                    <h3>Планировщик задач</h3>
                </div>
                <button class="close-modal planner-close">&times;</button>
            </div>
            <div class="modal-body planner-modal-body">
                <div class="planner-controls">
                    <button id="prev-month" class="planner-nav-btn">
                        <span>←</span>
                    </button>
                    <h4 id="current-month">${monthNames[month]} ${year}</h4>
                    <button id="next-month" class="planner-nav-btn">
                        <span>→</span>
                    </button>
                </div>
                
                <div id="monthly-calendar" class="monthly-calendar-grid"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    let displayDate = new Date(currentDate);
    
    function renderCalendar() {
        const calendar = document.getElementById('monthly-calendar');
        if (!calendar) return;
        
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        
        const monthTitle = document.getElementById('current-month');
        if (monthTitle) {
            monthTitle.textContent = `${monthNames[month]} ${year}`;
        }
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDay.getDay() + (firstDay.getDay() === 0 ? -6 : 1));
        
        const endDate = new Date(lastDay);
        endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
        
        calendar.innerHTML = `
            <div class="calendar-weekdays">
                <div class="weekday-header">Пн</div>
                <div class="weekday-header">Вт</div>
                <div class="weekday-header">Ср</div>
                <div class="weekday-header">Чт</div>
                <div class="weekday-header">Пт</div>
                <div class="weekday-header">Сб</div>
                <div class="weekday-header">Вс</div>
            </div>
            <div class="calendar-days-grid" id="calendar-days-grid"></div>
        `;
        
        const daysGrid = document.getElementById('calendar-days-grid');
        if (!daysGrid) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let date = new Date(startDate);
        while (date <= endDate) {
            const dayElement = document.createElement('div');
            dayElement.className = 'planner-day-cell';
            
            const isOtherMonth = date.getMonth() !== month;
            const isToday = date.toDateString() === today.toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const holidayInfo = isHoliday(date);
            
            if (isOtherMonth) dayElement.classList.add('other-month');
            if (isToday) dayElement.classList.add('today-cell');
            if (isWeekend && !holidayInfo) dayElement.classList.add('weekend-cell');
            if (holidayInfo) dayElement.classList.add('holiday-cell');
            
            const dayTasks = getTasksForDate(date);
            const dayLessons = !holidayInfo && !isWeekend ? getLessonsForDate(date) : [];
            
            let dayContent = `<div class="day-number">${date.getDate()}</div>`;
            
            if (holidayInfo) {
                dayContent += `<div class="holiday-name">${getHolidayName(date)}</div>`;
            } else {
                dayContent += `
                    <div class="day-items">
                        ${dayLessons.map(lesson => `
                            <div class="day-item lesson-item ${lesson.type}" title="${lesson.subject}"></div>
                        `).join('')}
                        ${dayTasks.map(task => `
                            <div class="day-item task-item ${task.priority}" title="${task.title}"></div>
                        `).join('')}
                    </div>
                `;
            }
            
            dayElement.innerHTML = dayContent;
            
            const dateForClick = new Date(date);
            dayElement.addEventListener('click', () => {
                openDayDetailsModal(dateForClick, dayLessons, dayTasks, holidayInfo);
            });
            
            daysGrid.appendChild(dayElement);
            date.setDate(date.getDate() + 1);
        }
    }
    
    renderCalendar();
    
    const prevBtn = modal.querySelector('#prev-month');
    const nextBtn = modal.querySelector('#next-month');
    const addBtn = modal.querySelector('#add-task-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            displayDate.setMonth(displayDate.getMonth() - 1);
            renderCalendar();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            displayDate.setMonth(displayDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openAddTaskModal(new Date(), modal);
        });
    }
    
    setupModalHandlers(modal);
}

function getLessonsForDate(date) {
    const dayNames = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    const dayName = dayNames[date.getDay()];
    
    try {
        const universitySchedule = cachedScheduleData.length > 0 ? cachedScheduleData : getUniversityData('schedule');
        if (!universitySchedule) return [];
        
        const daySchedule = universitySchedule.find(day => day.day === dayName);
        return (daySchedule && daySchedule.lessons) ? daySchedule.lessons : [];
    } catch (error) {
        console.error('Ошибка получения расписания:', error);
        return [];
    }
}

function getScheduleForDate(date) {
    return getLessonsForDate(date);
}

function openDayDetailsModal(date, lessons, tasks, holidayInfo) {
    const detailModal = document.createElement('div');
    detailModal.className = 'service-modal active day-detail-modal';
    
    const dateString = date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
    
    const weekdayName = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][date.getDay()];
    
    let headerIcon = '📅';
    if (holidayInfo) headerIcon = '🎉';
    else if (date.getDay() === 0 || date.getDay() === 6) headerIcon = '🌟';
    
    detailModal.innerHTML = `
        <div class="modal-content day-detail-content">
            <div class="modal-header day-detail-header">
                <div class="detail-header-content">
                    <h3>${headerIcon} ${dateString}</h3>
                    <p class="weekday-name">${weekdayName}</p>
                </div>
                <button class="close-modal detail-close">&times;</button>
            </div>
            <div class="modal-body day-detail-body">
                ${holidayInfo ? `
                    <div class="holiday-banner">
                        <div class="holiday-icon">🎉</div>
                        <h4>${getHolidayName(date)}</h4>
                        <p>Праздничный день</p>
                    </div>
                ` : ''}
                
                ${lessons.length > 0 ? `
                    <div class="detail-section">
                        <h4 class="section-title">
                            <span class="section-icon">📚</span>
                            Занятия
                        </h4>
                        <div class="lessons-list">
                            ${lessons.map(lesson => `
                                <div class="detail-lesson ${lesson.type}">
                                    <div class="lesson-time-badge">${lesson.time}</div>
                                    <div class="lesson-content">
                                        <div class="lesson-name">${lesson.subject}</div>
                                        <div class="lesson-meta">
                                            <span>👨‍🏫 ${lesson.teacher}</span>
                                            <span>🏢 ${lesson.room}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${tasks.length > 0 ? `
                    <div class="detail-section">
                        <h4 class="section-title">
                            <span class="section-icon">✓</span>
                            Задачи
                        </h4>
                        <div class="tasks-list">
                            ${tasks.map(task => `
                                <div class="detail-task ${task.priority}" onclick="event.stopPropagation(); openTaskDetails('${task.id}')">
                                    <div class="task-check ${task.completed ? 'checked' : ''}">
                                        ${task.completed ? '✓' : '○'}
                                    </div>
                                    <div class="task-content">
                                        <div class="task-name ${task.completed ? 'completed' : ''}">${task.title}</div>
                                        ${task.time ? `<div class="task-time">⏰ ${task.time}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${lessons.length === 0 && tasks.length === 0 && !holidayInfo ? `
                    <div class="empty-day-detail">
                        <div class="empty-icon">📭</div>
                        <p>На этот день ничего не запланировано</p>
                        <small>Нажмите кнопку ниже, чтобы добавить задачу</small>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn-primary add-task-day-btn" onclick="event.stopPropagation(); openAddTaskModalForDate('${date.toISOString()}')">
                        <span>+</span>
                        <span>Добавить задачу</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailModal);
    setupModalHandlers(detailModal);
}

window.openAddTaskModalForDate = function(dateString) {
    const existingDayModal = document.querySelector('.day-detail-modal');
    if (existingDayModal) {
        existingDayModal.style.display = 'none';
    }
    
    const plannerModal = document.querySelector('.planner-modal-overlay');
    openAddTaskModal(new Date(dateString), plannerModal, existingDayModal);
};


function getTasksForDate(date) {
    const dateString = date.toISOString().split('T')[0];
    return userEvents.filter(event => 
        event.date === dateString && 
        event.user_id === authService.currentUser.uid
    );
}

function openAddTaskModal(prefilledDate, parentModal, dayModal) {
    const taskModal = document.createElement('div');
    taskModal.className = 'service-modal active task-modal';
    
    const defaultDate = prefilledDate || new Date();
    const dateString = defaultDate.toISOString().split('T')[0];
    
    taskModal.innerHTML = `
        <div class="modal-content task-modal-content">
            <div class="modal-header task-modal-header">
                <h3>✏️ Новая задача</h3>
                <button class="close-modal task-close">&times;</button>
            </div>
            <div class="modal-body task-modal-body">
                <form id="add-task-form" class="task-form">
                    <div class="form-group">
                        <label class="form-label">Название задачи *</label>
                        <input type="text" id="task-title" class="form-input" 
                               placeholder="Например: Подготовиться к экзамену" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Дата *</label>
                            <input type="date" id="task-date" class="form-input" value="${dateString}" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Время</label>
                            <input type="time" id="task-time" class="form-input">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Приоритет</label>
                        <div class="priority-selector">
                            <label class="priority-option">
                                <input type="radio" name="task-priority" value="low" checked>
                                <span class="priority-badge low">🟢 Низкий</span>
                            </label>
                            <label class="priority-option">
                                <input type="radio" name="task-priority" value="medium">
                                <span class="priority-badge medium">🟡 Средний</span>
                            </label>
                            <label class="priority-option">
                                <input type="radio" name="task-priority" value="high">
                                <span class="priority-badge high">🔴 Высокий</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Категория</label>
                        <select id="task-category" class="form-select">
                            <option value="academic">📚 Учеба</option>
                            <option value="personal">👤 Личное</option>
                            <option value="work">💼 Работа</option>
                            <option value="sport">⚽️ Спорт</option>
                            <option value="other">📌 Другое</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Описание</label>
                        <textarea id="task-description" class="form-textarea" 
                                  placeholder="Добавьте детали..." rows="3"></textarea>
                    </div>
                </form>
                
                <div class="task-actions">
                    <button type="button" class="btn-cancel close-task-modal">Отмена</button>
                    <button type="button" id="submit-task" class="btn-save">
                        <span>💾</span>
                        <span>Сохранить</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(taskModal);
    
    const closeTaskModal = () => {
        document.body.removeChild(taskModal);
        if (dayModal) {
            dayModal.style.display = 'flex';
        }
    };
    
    taskModal.querySelector('#submit-task').addEventListener('click', () => {
        handleTaskSubmission(taskModal, parentModal, dayModal);
    });
    
    taskModal.querySelector('.close-task-modal').addEventListener('click', closeTaskModal);
    taskModal.querySelector('.close-modal').addEventListener('click', closeTaskModal);
    
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeTaskModal();
        }
    });
}

async function handleTaskSubmission(taskModal, parentModal, dayModal) {
    const formData = {
        title: taskModal.querySelector('#task-title').value.trim(),
        date: taskModal.querySelector('#task-date').value,
        time: taskModal.querySelector('#task-time').value || null,
        priority: taskModal.querySelector('input[name="task-priority"]:checked').value,
        type: taskModal.querySelector('#task-category').value,
        description: taskModal.querySelector('#task-description').value.trim() || null,
        user_id: authService.currentUser.uid,
        university_id: authService.currentUser.universityId || 1,
        completed: false
    };
    
    if (!formData.title) {
        alert('Пожалуйста, введите название задачи');
        return;
    }
    
    const savedEvent = await SupabaseDB.createUserEvent(formData);
    if (savedEvent) {
        userEvents.push(savedEvent);
        showNotification('✅ Задача добавлена в планировщик', 'success');
    } else {
        showNotification('❌ Ошибка сохранения задачи', 'error');
        return;
    }
    
    document.body.removeChild(taskModal);
    
    if (dayModal) {
        document.body.removeChild(dayModal);
    }
    
    const plannerCalendar = document.querySelector('.planner-modal-overlay');
    if (plannerCalendar) {
        const renderBtn = document.querySelector('#prev-month');
        if (renderBtn) {
            renderBtn.click();
            setTimeout(() => {
                document.querySelector('#next-month').click();
            }, 10);
        }
    }
    
    if (parentModal && parentModal.querySelector) {
        const renderFunc = parentModal.querySelector('#prev-month');
        if (renderFunc) {
            renderFunc.click();
            setTimeout(() => renderFunc.nextElementSibling.nextElementSibling.click(), 10);
        }
    }
}

function openTaskDetails(taskId) {
    const task = userEvents.find(e => e.id === taskId);
    if (!task) return;
    
    const detailModal = document.createElement('div');
    detailModal.className = 'service-modal active';
    
    const priorityText = {
        'low': '🔵 Низкий',
        'medium': '🟡 Средний',
        'high': '🔴 Высокий'
    };
    
    const categoryText = {
        'academic': '📚 Учеба',
        'personal': '👤 Личное',
        'work': '💼 Работа',
        'sport': '⚽️ Спорт',
        'other': '📌 Другое'
    };
    
    detailModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📋 ${task.title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="task-details">
                    <div class="task-detail-item">
                        <strong>Дата:</strong> ${formatDate(task.date)}
                    </div>
                    ${task.time ? `<div class="task-detail-item"><strong>Время:</strong> ${task.time}</div>` : ''}
                    <div class="task-detail-item">
                        <strong>Приоритет:</strong> ${priorityText[task.priority]}
                    </div>
                    <div class="task-detail-item">
                        <strong>Категория:</strong> ${categoryText[task.type]}
                    </div>
                    ${task.description ? `<div class="task-detail-item"><strong>Описание:</strong><br>${task.description}</div>` : ''}
                    <div class="task-detail-item">
                        <strong>Статус:</strong> ${task.completed ? '✅ Выполнено' : '⏳ В работе'}
                    </div>
                </div>
                
                <div class="service-actions">
                    <button type="button" class="btn-secondary" id="delete-task">Удалить</button>
                    <button type="button" class="btn-primary" id="toggle-complete">
                        ${task.completed ? 'Вернуть в работу' : 'Отметить выполненной'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailModal);
    
    detailModal.querySelector('#delete-task').addEventListener('click', async () => {
        if (confirm('Удалить эту задачу?')) {
            const deleted = await SupabaseDB.deleteUserEvent(taskId);
            if (deleted) {
                userEvents = userEvents.filter(e => e.id !== taskId);
                document.body.removeChild(detailModal);
                showNotification('✅ Задача удалена', 'success');
                renderMonthlyCalendar();
            } else {
                showNotification('❌ Ошибка удаления задачи', 'error');
            }
        }
    });
    
    detailModal.querySelector('#toggle-complete').addEventListener('click', async () => {
        const taskIndex = userEvents.findIndex(e => e.id === taskId);
        if (taskIndex !== -1) {
            const newStatus = !userEvents[taskIndex].completed;
            
            const updated = await SupabaseDB.updateUserEvent(taskId, { completed: newStatus });
            if (updated) {
                userEvents[taskIndex].completed = newStatus;
                document.body.removeChild(detailModal);
                showNotification(newStatus ? '✅ Задача выполнена!' : '🔄 Задача возвращена в работу', 'success');
                renderMonthlyCalendar();
            } else {
                showNotification('❌ Ошибка обновления задачи', 'error');
            }
        }
    });
    
    setupModalHandlers(detailModal);
}


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
    
    const updateSummary = () => {
        const type = modal.querySelector('#document-type').value;
        const copies = parseInt(modal.querySelector('#document-copies').value);
        const language = modal.querySelector('input[name="language"]:checked').value;
        const delivery = modal.querySelector('input[name="delivery"]:checked').value;
        
        modal.querySelector('#summary-type').textContent = getDocumentTypeText(type) || '-';
        modal.querySelector('#summary-copies').textContent = copies || '-';
        modal.querySelector('#summary-language').textContent = getLanguageText(language) || '-';
        modal.querySelector('#summary-delivery').textContent = getDeliveryText(delivery) || '-';
        modal.querySelector('#summary-deadline').textContent = getDeadlineText(delivery, type) || '-';
    };
    
    form.addEventListener('change', updateSummary);
    form.addEventListener('input', updateSummary);
    
    updateSummary();
    
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleDocumentSubmission(modal);
    });
    
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
    
    showDocumentSuccessNotification(formData, modal);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showDocumentSuccessNotification(documentData, modal) {
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
    
    console.log('Заявка на документ создана:', documentData);
}


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
    
    const applicationSubmit = modal.querySelector('#submit-dorm-application');
    applicationSubmit.addEventListener('click', function(e) {
        e.preventDefault();
        handleDormApplication(modal);
    });
    
    const issueSubmit = modal.querySelector('#submit-dorm-issue');
    issueSubmit.addEventListener('click', function(e) {
        e.preventDefault();
        handleDormIssue(modal);
    });
    
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
    
    if (!formData.type || !formData.dormitory || !formData.roomType || !formData.moveInDate || !formData.stayPeriod) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
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
    
    console.log('Заявка на общежитие создана:', applicationData);
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
    
    console.log('Заявка на проблему создана:', issueData);
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

function loadNewsFromLocalStorage() {
    try {
        const savedNews = localStorage.getItem('universityNews');
        if (savedNews) {
            const parsedNews = JSON.parse(savedNews);
            
            parsedNews.forEach(savedNews => {
                if (!mockData.news.some(news => news.id === savedNews.id)) {
                    mockData.news.push(savedNews);
                }
            });
            console.log('Новости загружены из localStorage');
        }
    } catch (error) {
        console.error(' Ошибка загрузки новостей:', error);
    }
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