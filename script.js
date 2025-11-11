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
function setupServices() {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const service = card.getAttribute('data-service');
            const name = card.querySelector('h3').textContent;
            
            let message = '';
            switch(service) {
                case 'library':
                    message = '📚 Библиотека\nДоступ к электронным ресурсам и заказ книг';
                    break;
                case 'documents':
                    message = '📄 Документы\nЗаказ справок и академических выписок';
                    break;
                case 'dormitory':
                    message = '🏠 Общежитие\nПодача заявок и решение вопросов';
                    break;
                default:
                    message = `Открыт сервис: ${name}`;
            }
            
            alert(message);
        });
    });
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

function renderFilteredClubs(clubs) {
    const container = document.getElementById('clubs-list');
    const noResults = document.getElementById('no-results');

    if (!container) {
        console.error('❌ Контейнер клубов не найден!');
        return;
    }

    // Очищаем только список клубов
    container.innerHTML = '';

    if (clubs.length === 0) {
        if (noResults) {
            noResults.classList.remove('hidden');
        }
        
        // Показываем умное сообщение
        let message = "Не нашли подходящий клуб?";
        let suggestion = "";
        
        if (currentFilters.searchText) {
            suggestion = `По запросу "${currentFilters.searchText}" ничего не найдено`;
        } else if (currentFilters.category !== 'all') {
            suggestion = "Попробуйте изменить фильтры";
        } else {
            suggestion = "Попробуйте ослабить фильтры";
        }
        
        if (noResults) {
            noResults.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>${message}</h3>
                <p>${suggestion}</p>
                <button id="reset-filters" class="reset-btn">Показать все клубы</button>
            `;
            
            // Обновляем обработчик сброса
            document.getElementById('reset-filters').addEventListener('click', resetFilters);
        }
        return;
    }

    // Скрываем сообщение "нет результатов"
    if (noResults) {
        noResults.classList.add('hidden');
    }

    // Сортируем клубы по релевантности если есть поисковый запрос
    if (currentFilters.searchText) {
        clubs.sort((a, b) => {
            const aRelevance = calculateRelevance(a, currentFilters.searchText);
            const bRelevance = calculateRelevance(b, currentFilters.searchText);
            return bRelevance - aRelevance;
        });
    }

    // Рендерим клубы
    clubs.forEach(club => {
        const div = document.createElement('div');
        div.className = `club-card activity-${club.activity}`;
        
        // Подсветка совпадений в поиске
        const searchHighlight = currentFilters.searchText ? 
            highlightSearchMatches(club, currentFilters.searchText) : '';
        
        div.innerHTML = `
            <div class="club-icon">${club.icon}</div>
            <div class="club-info">
                <h3>${searchHighlight.name || club.name}</h3>
                <p>${searchHighlight.desc || club.desc}</p>
                <div class="club-tags">
                    <small>📅 ${club.meetingDay} • ${getActivityText(club.activity)}</small>
                </div>
                <div class="club-meta">
                    <span class="members">👥 ${club.members} участников</span>
                    <span class="contact">${club.contact}</span>
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
    const message = `
🎯 ${club.name}
${club.desc}

📊 Информация:
• Участников: ${club.members} человек
• Активность: ${getActivityText(club.activity)}
• Встречи: ${club.meetingDay}
• Контакт: ${club.contact}

🏷️ Теги: ${club.tags.join(', ')}

Хочешь присоединиться? Напиши в клуб! ✨
    `;
    
    alert(message);
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

// Добавь в initializeApp()
function initializeApp() {
    setupNavigation();
    updateUserInfo();
    updateWeekInfo();
    renderTodaySchedule();
    renderNews();
    renderWeekSchedule();
    renderClubs(); // 🔥 Теперь это запускает умный поиск
    setupServices();
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