async function renderNewsFromDB() {
    console.log('🔄 Загрузка новостей из Supabase...');
    
    const newsList = document.getElementById('news-list');
    if (!newsList) {
        console.log('Контейнер новостей не найден');
        return;
    }

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

    const universityNews = await DataBase.getNews(authService.currentUniversity.id);
    console.log('Найдено новостей для университета:', universityNews.length);

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
    
    console.log('Новости успешно отрендерены из БД');
}

async function handleNewsSubmissionDB(modal) {
    const title = modal.querySelector('#news-title').value.trim();
    const content = modal.querySelector('#news-content').value.trim();
    const priority = modal.querySelector('input[name="priority"]:checked').value;
    const category = modal.querySelector('#news-category').value;
    
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
        category: category,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        comments: []
    };
    
    const createdNews = await DataBase.createNews(newsData);
    
    document.body.removeChild(modal);
    showNewsSuccessNotification(createdNews);
    
    await renderNewsFromDB();
}

async function deleteNewsDB(newsId) {
    console.log('Попытка удаления новости:', newsId);
    
    const news = await DataBase.findById('news', newsId);
    if (!news) {
        console.log('Новость не найдена');
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
        await DataBase.deleteNews(newsId);
        
        let successMessage = '✅ Новость удалена';
        if (!isOwnNews) {
            successMessage = `✅ Новость пользователя "${news.author}" удалена`;
        }
        
        showNotification(successMessage, 'success');
        await renderNewsFromDB();
    }
}


async function renderClubsFromDB() {
    const container = document.getElementById('clubs-list');
    if (!container) {
        console.log('Контейнер клубов не найден');
        return;
    }

    console.log('Рендерим клубы для университета:', authService.currentUniversity?.name);
    
    container.innerHTML = '';

    const universityClubs = await DataBase.getClubs(authService.currentUniversity.id);
    console.log('Найдено клубов:', universityClubs.length);

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

    renderFilteredClubs(universityClubs);
    
    setTimeout(() => {
        if (typeof initializeSmartSearch === 'function') {
            initializeSmartSearch();
        }
    }, 50);
}

async function saveClubToDB(clubData) {
    const createdClub = await DataBase.createClub(clubData);
    showClubCreationSuccessNotification(createdClub);
    await renderClubsFromDB();
    filterClubs();
}


async function renderEventsFromDatabase(filter = 'all') {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) {
        console.log('Контейнер мероприятий не найден');
        return;
    }
    
    const universityEvents = await DataBase.getEvents(authService.currentUniversity.id);
    
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
        const isRegistered = event.registered_users && event.registered_users.includes(authService.currentUser.id);
        const registeredCount = event.registered_users ? event.registered_users.length : 0;
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
    
    setupEventRegistrationHandlersDB();
    setupEventUnregistrationHandlersDB();
    
    console.log('Мероприятия отрендерены:', filteredEvents.length);
}

async function registerUserForEventDB(eventId, button) {
    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    btnText.textContent = 'Записываем...';
    btnIcon.textContent = '⏳';
    button.classList.add('registering');
    
    const updatedEvent = await DataBase.registerForEvent(eventId, authService.currentUser.id);
    
    if (updatedEvent) {
        showEventRegistrationSuccess(updatedEvent.title);
        
        const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
        await renderEventsFromDatabase(currentFilter);
    }
}

async function unregisterUserFromEventDB(eventId, button) {
    const btnText = button.querySelector('.btn-text');
    const btnIcon = button.querySelector('.btn-icon');
    
    button.disabled = true;
    button.style.pointerEvents = 'none';
    
    btnText.textContent = 'Отписываемся...';
    btnIcon.textContent = '⏳';
    button.classList.add('unregistering');
    
    const updatedEvent = await DataBase.unregisterFromEvent(eventId, authService.currentUser.id);
    
    if (updatedEvent) {
        showEventUnregistrationSuccess(updatedEvent.title);
        
        const currentFilter = document.querySelector('.events-filter .filter-btn.active')?.getAttribute('data-filter') || 'all';
        await renderEventsFromDatabase(currentFilter);
    }
}

function setupEventRegistrationHandlersDB() {
    const registerButtons = document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)');
    
    registerButtons.forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.event-register-btn:not(.registered):not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            registerUserForEventDB(eventId, this);
        });
    });
}

function setupEventUnregistrationHandlersDB() {
    const unregisterButtons = document.querySelectorAll('.event-unregister-btn');
    
    unregisterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = parseInt(this.getAttribute('data-event-id'));
            
            if (confirm(`Вы уверены, что хотите отписаться от этого мероприятия?`)) {
                unregisterUserFromEventDB(eventId, this);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Активация миграции на Supabase...');
    
    window.renderNews = renderNewsFromDB;
    window.handleNewsSubmission = handleNewsSubmissionDB;
    window.deleteNews = deleteNewsDB;
    window.renderClubs = renderClubsFromDB;
    window.renderEventsFromDatabase = renderEventsFromDatabase;
    
    console.log('Миграция на Supabase активирована');
});

console.log('Модуль миграции загружен');
