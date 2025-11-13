class MultiUniversityAuth {
  constructor() {
    this.currentUser = null;
    this.currentUniversity = null;
    this.isAuthenticated = false;
  }

showButtonLoading(button) {
    button.classList.add('loading');
    button.disabled = true;
}

showButtonSuccess(button) {
    button.classList.remove('loading');
    button.classList.add('success');
    button.querySelector('.btn-text').textContent = 'Успешно!';
}

showButtonError(button, message) {
    button.classList.remove('loading');
    button.classList.add('error');
    
    const originalText = button.querySelector('.btn-text').textContent;
    button.querySelector('.btn-text').textContent = message || 'Ошибка';
    
    setTimeout(() => {
        button.classList.remove('error');
        button.disabled = false;
        button.querySelector('.btn-text').textContent = originalText;
    }, 2000);
}

resetButton(button) {
    button.classList.remove('loading', 'success', 'error');
    button.disabled = false;
}
  
  getAvailableCities() {
    const cities = [...new Set(mockData.universities.map(u => u.city))];
    return cities.sort();
  }

  getUniversitiesByCity(city) {
    return mockData.universities.filter(u => u.city === city && u.isActive);
  }

  async login(universityId, uid, password, isStaff = false) {
    console.log('Попытка входа в университет:', universityId, 'UID:', uid, 'Тип:', isStaff ? 'сотрудник' : 'студент');
    
    const university = mockData.universities.find(u => u.id === universityId);
    if (!university) {
      this.showNotification('error', 'Университет не найден');
      return { success: false, error: 'Университет не найден' };
    }

    let user = null;
    
    if (isStaff) {
      user = mockData.staff.find(u => 
        u.university_id === universityId && 
        u.uid === uid && 
        u.password === password &&
        u.isActive
      );
    } else {
      user = mockData.users.find(u => 
        u.university_id === universityId && 
        u.uid === uid && 
        u.password === password &&
        u.isActive
      );
    }

    if (user && university) {
    this.currentUser = user;
    this.currentUniversity = university;
    this.isAuthenticated = true;
    
    localStorage.setItem('currentUniversity', JSON.stringify(university));
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', 'jjk-auth-' + user.id);
    localStorage.setItem('userType', isStaff ? 'staff' : 'student');
    
    console.log('Успешный вход:', user.profile.firstName, 'в', university.name, 'как', isStaff ? 'сотрудник' : 'студент');
    this.showNotification('success', `Добро пожаловать в ${university.name}!`);
    
    console.log('Переключаем интерфейс на:', isStaff ? 'staff' : 'student');
    this.switchUserInterface(isStaff ? 'staff' : 'student');
    
    return { success: true, user, university, isStaff };
  } else {
    this.showNotification('error', 'Неверный UID или пароль');
    return { success: false, error: 'Неверные учетные данные' };
  }
}

logout() {
    if (this.currentUser) {
        console.log('Выход:', this.currentUser.profile.firstName);
        this.showNotification('info', 'До свидания!');
    }
    
    this.currentUser = null;
    this.currentUniversity = null;
    this.isAuthenticated = false;
    
    localStorage.clear();
    
    const tabs = document.querySelector('.tabs');
    if (tabs) {
        tabs.classList.add('hidden');
    }
    
    this.showLoginScreen();
}


checkAuth() {
  console.log('checkAuth начат');
  const savedUser = localStorage.getItem('currentUser');
  const savedUniversity = localStorage.getItem('currentUniversity');

  if (savedUser && savedUniversity) {
    try {
      this.currentUser = JSON.parse(savedUser);
      this.currentUniversity = JSON.parse(savedUniversity);
      this.isAuthenticated = true;
      const userType = this.currentUser.permissions.includes('staff') ? 'staff' : 'student';
      console.log('Автоматический вход:', this.currentUser.profile.firstName, 'как', userType);
      this.switchUserInterface(userType);
      console.log('checkAuth возвращает:', userType);
      return userType;
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error);
      this.logout();
      return false;
    }
  }
  
  console.log('Нет сохраненной сессии, показываем экран входа');
  this.showLoginScreen();
  return false;
}


updateUI() {
    console.log('updateUI вызван, isAuthenticated:', this.isAuthenticated);
    
    if (this.isAuthenticated) {
        this.removeBuildNotification();
    }
    
    const tabs = document.querySelector('.tabs');
    if (tabs) {
        console.log('Панель ДО updateUI:', tabs.classList.contains('hidden'));
        
        if (this.isAuthenticated) {
            tabs.classList.remove('hidden');
            console.log('Панель ПОСЛЕ remove hidden:', tabs.classList.contains('hidden'));
        } else {
            tabs.classList.add('hidden');
            console.log('Панель ПОСЛЕ add hidden:', tabs.classList.contains('hidden'));
        }
    }

    this.updateHeader();
    
    console.log('updateUI завершен');
}

updateHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    if (this.isAuthenticated) {
        header.innerHTML = `
            <div class="header-authenticated">
                <div class="header-info">
                    <h1>${this.currentUniversity.logo} ${this.currentUniversity.shortName} Портал</h1>
                    <div class="user-info">
                        ${this.currentUser.profile.firstName} ${this.currentUser.profile.lastName} | ${this.currentUser.profile.group}
                        ${this.currentUser.permissions.includes('teacher') ? ' | 👨‍🏫 Преподаватель' : ''}
                    </div>
                </div>
                <button id="logout-btn" class="logout-btn">
                    🚪 Выйти
                </button>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    } else {
        header.innerHTML = `
            <h1>📚 Учебный портал</h1>
            <div class="user-info">Войдите в систему</div>
        `;
    }
}

updateActiveTabColor() {
    const style = document.createElement('style');
    style.id = 'university-theme';
    style.textContent = `
        .tab-button.active {
            color: ${this.currentUniversity.themeColor} !important;
        }
        .tab-button.active i {
            color: ${this.currentUniversity.themeColor} !important;
        }
    `;
    
    const oldStyle = document.getElementById('university-theme');
    if (oldStyle) oldStyle.remove();
    
    document.head.appendChild(style);
}

updateContent() {
  console.log('Полное обновление контента для студента');
  
  const content = document.querySelector('.content');
  if (!content) return;
  content.innerHTML = `
    <section id="feed" class="tab-content active">
      <div class="schedule-card">
        <h2>📅 Сегодня</h2>
        <div id="today-schedule"></div>
      </div>

      <div class="news-feed">
        <div id="news-list"></div>
      </div>
    </section>

    <section id="schedule" class="tab-content">
      <div class="schedule-header">
        <button id="prev-week">←</button>
        <h3 id="current-week"></h3>
        <button id="next-week">→</button>
      </div>
      <div id="schedule-grid"></div>
      <button id="month-view" class="month-btn">📆 Месячный вид</button>
    </section>

    <section id="services" class="tab-content">
      <h2>⚙️ Сервисы университета</h2>
      <div class="services-grid">
        <div class="service-card" data-service="library">
          <div class="service-icon">❓</div>
          <h3>Вопросы</h3>
          <p>Задать вопрос</p>
        </div>
        <div class="service-card" data-service="documents">
          <div class="service-icon">📄</div>
          <h3>Документы</h3>
          <p>Справки и выписки</p>
        </div>
        <div class="service-card" data-service="dormitory">
          <div class="service-icon">🏠</div>
          <h3>Общежитие</h3>
          <p>Заявки и вопросы</p>
        </div>
        <div class="service-card" data-service="create-club">
          <div class="service-icon">🎭</div>
          <h3>Создать клуб</h3>
          <p>Организуй свое сообщество</p>
        </div>
        <div class="service-card" data-service="book-room">
          <div class="service-icon">🏢</div>
          <h3>Бронь помещений</h3>
          <p>Аудитории, переговорки</p>
        </div>
        <div class="service-card" data-service="events">
          <div class="service-icon">📅</div>
          <h3>Мероприятия</h3>
          <p>Конференции, встречи</p>
        </div>
      </div>
    </section>

    <section id="clubs" class="tab-content">
      <h2>🎭 Студенческие клубы ${this.currentUniversity.shortName}</h2>
      
      <div class="smart-search">
        <div class="search-header">
          <div class="search-input-container">
            <input type="text" id="club-search" placeholder="Найди клуб по интересам..." class="search-input">
            <span class="search-icon">🔍</span>
          </div>
          <button id="smart-filters-btn" class="filters-btn">🎯 Умный подбор</button>
        </div>
        
        <div class="quick-filters">
          <button class="filter-btn active" data-filter="all">Все</button>
          <button class="filter-btn" data-filter="popular">Популярные</button>
          <button class="filter-btn" data-filter="tech">IT</button>
          <button class="filter-btn" data-filter="creative">Творчество</button>
          <button class="filter-btn" data-filter="sports">Спорт</button>
          <button class="filter-btn" data-filter="new">Новичкам</button>
        </div>
      </div>

      <div id="smart-filters" class="smart-filters hidden">
        <h4>🎯 Подбери клуб по интересам</h4>
        
        <div class="filter-group">
          <label>Уровень активности:</label>
          <select id="activity-filter" class="filter-select">
            <option value="any">Любой</option>
            <option value="high">Высокая</option>
            <option value="medium">Средняя</option>
            <option value="low">Низкая</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>День встреч:</label>
          <select id="day-filter" class="filter-select">
            <option value="any">Любой день</option>
            <option value="понедельник">Понедельник</option>
            <option value="вторник">Вторник</option>
            <option value="среда">Среда</option>
            <option value="четверг">Четверг</option>
            <option value="пятница">Пятница</option>
            <option value="суббота">Суббота</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Размер клуба:</label>
          <select id="size-filter" class="filter-select">
            <option value="any">Любой</option>
            <option value="small">Маленький (до 30)</option>
            <option value="medium">Средний (30-80)</option>
            <option value="large">Большой (80+)</option>
          </select>
        </div>
        
        <button id="apply-filters" class="apply-btn">Применить фильтры</button>
      </div>

      <div id="clubs-list" class="clubs-grid"></div>
      
      <div id="no-results" class="no-results hidden">
        <div class="no-results-icon">🔍</div>
        <h3>Не нашли подходящий клуб?</h3>
        <p>Попробуйте изменить фильтры или посмотрите все клубы</p>
        <button id="reset-filters" class="reset-btn">Показать все клубы</button>
      </div>
    </section>
  `;

console.log('Запускаем базовые функции студента');
this.reinitializeApp();
}


switchUserInterface(userType) {
  console.log('Полное переключение интерфейса на:', userType);
  const content = document.querySelector('.content');
  if (content) {
    content.innerHTML = '';
  }
  
  const tabs = document.querySelector('.tabs');
  
  this.removeBuildNotification();
  
  if (userType === 'staff') {
    if (tabs) {
      console.log('Скрываем панель для сотрудника');
      tabs.classList.add('hidden');
    }
    
    if (typeof initializeStaffApp === 'function') {
      console.log('Запускаем initializeStaffApp');
      initializeStaffApp();
    }
  } else {
    if (tabs) {
      console.log('Показываем панель для студента');
      tabs.classList.remove('hidden');
    }
    
    console.log('Полная перерисовка студенческого интерфейса');
    this.updateContent();
  }
  
  this.updateHeader();
}

reinitializeApp() {
  console.log('Переинициализация приложения...');
  const tabs = document.querySelector('.tabs');
  if (tabs && determineUserType() === 'student') {
    tabs.classList.remove('hidden');
    console.log('Панель восстановлена в reinitializeApp');
  }
  
  if (typeof setupNavigation === 'function') {
    setupNavigation();
  }
  
  if (typeof setupServices === 'function') {
    setupServices();
  }
  
  if (typeof newsAlreadyRendered !== 'undefined') {
    newsAlreadyRendered = false;
  }
  
  if (typeof renderTodaySchedule === 'function') renderTodaySchedule();
  
  if (typeof renderNews === 'function' && determineUserType() === 'student') {
    console.log('Вызываем renderNews для студента');
    renderNews();
  }
  
  if (typeof renderClubs === 'function') renderClubs();
  if (typeof renderWeekSchedule === 'function') renderWeekSchedule();
  if (typeof updateWeekInfo === 'function') updateWeekInfo();
  
  if (typeof initializeSmartSearch === 'function') {
    setTimeout(() => {
      initializeSmartSearch();
    }, 100);
  }
  
  console.log('Приложение переинициализировано');
}

showLoginScreen() {
    console.log('showLoginScreen вызван');
    const tabs = document.querySelector('.tabs');
    if (tabs) {
        console.log('Панель в showLoginScreen ДО:', tabs.classList.contains('hidden'));
        tabs.classList.add('hidden');
        console.log('Панель в showLoginScreen ПОСЛЕ:', tabs.classList.contains('hidden'));
    }
    this.addBuildNotification();
    const content = document.querySelector('.content');
    if (!content) return;
    content.innerHTML = `
        <div class="login-container">
            <div class="welcome-card">
                <h2>🎓 Добро пожаловать!</h2>
                <p>Выберите ваш университет для входа в систему</p>
                <button id="start-login-btn" class="btn-primary" style="margin-top: 20px;">
                    Начать вход
                </button>
            </div>
            
            <div style="position: fixed; bottom: 40px; left: 0; right: 0; text-align: center;">
                <a href="https://forms.gle/b8avc77sc6v1RE3V6" 
                   target="_blank" 
                   style="display: inline-block; 
                          padding: 8px 12px; 
                          background-color: #808182ff; 
                          color: white; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-size: 12px;
                          border: none;
                          cursor: pointer;">
                    Вашего университета нет? Отправьте форму на его добавление
                </a>
            </div>
            
        </div>
    `;

    document.getElementById('start-login-btn').addEventListener('click', () => {
        this.showUniversitySelection();
    });
    
    console.log('showLoginScreen завершен');
}

showUniversitySelection() {
    const modal = document.createElement('div');
    modal.className = 'service-modal active university-selection';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🎓 Выбор университета</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="university-flow">
                    <!-- Шаг 1: Поиск города или университета -->
                    <div class="step active" id="step-search">
                        <h4>Найдите ваш университет</h4>
                        <div class="search-section">
                            <div class="search-input-container large">
                                <input type="text" id="university-search" 
                                       placeholder="Введите город или название университета..." 
                                       class="search-input large">
                                <span class="search-icon">🔍</span>
                            </div>
                            <div class="search-results" id="search-results">
                                <!-- Результаты поиска появятся здесь -->
                            </div>
                        </div>
                        
                        <div class="popular-cities">
                            <h5>Популярные города:</h5>
                            <div class="cities-chips" id="cities-chips">
                                <!-- Популярные города -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="step" id="step-login">
                        <h4>Вход в <span id="selected-university"></span></h4>
                        <div class="university-badge" id="university-badge">
                        </div>
                        <form class="login-form" id="university-login-form">
                            <div class="form-group">
                                <label>UID / Student ID:</label>
                                <input type="text" id="university-uid" required 
                                       placeholder="Введите ваш UID (например: q466123)">
                            </div>
                            <div class="form-group">
                                <label>Пароль:</label>
                                <input type="password" id="university-password" required 
                                       placeholder="Введите пароль">
                                <div class="password-hint">
                                    <small>Демо-пароль: <code>123</code></small>
                                </div>
                            </div>
                           <button type="submit" class="login-btn beautiful" id="login-submit-btn">
                                <span class="btn-content">
                                    <span class="btn-text">Войти</span>
                                    <span class="btn-arrow">→</span>
                                </span>
                                <span class="btn-spinner"></span>
                            </button>
                        </form>
                        <div class="login-actions">
                            <button class="btn-secondary back-btn">← Назад к поиску</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    this.setupUniversitySearchHandlers(modal);
}

  setupUniversitySearchHandlers(modal) {
    const searchInput = modal.querySelector('#university-search');
    const searchResults = modal.querySelector('#search-results');
    const citiesChips = modal.querySelector('#cities-chips');
    this.setupPopularCities(citiesChips, modal);
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        this.performUniversitySearch(query, searchResults, modal);
    });
    
    setTimeout(() => {
        searchInput.focus();
    }, 100);
    
    this.setupModalHandlers(modal);
}
  setupPopularCities(citiesChips, modal) {
    const cities = this.getAvailableCities();
    citiesChips.innerHTML = cities.map(city => `
        <button class="city-chip" data-city="${city}">
            ${city === 'Токио' ? '🗼' : '🏛️'} ${city}
        </button>
    `).join('');
    
    citiesChips.querySelectorAll('.city-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const city = chip.getAttribute('data-city');
            this.performUniversitySearch(city, modal.querySelector('#search-results'), modal);
        });
    });
}
performUniversitySearch(query, searchResults, modal) {
    if (!query) {
        this.showAllUniversities(searchResults, modal);
        return;
    }
    
    const allUniversities = mockData.universities.filter(u => u.isActive);
    const filteredUniversities = allUniversities.filter(uni => {
        const searchText = query.toLowerCase();
        const fullName = uni.name.toLowerCase();
        const shortName = uni.shortName.toLowerCase();
        const city = uni.city.toLowerCase();
        
        return fullName.includes(searchText) || 
               shortName.includes(searchText) || 
               city.includes(searchText);
    });
    
    this.displaySearchResults(filteredUniversities, searchResults, modal);
}

showAllUniversities(searchResults, modal) {
    const allUniversities = mockData.universities.filter(u => u.isActive);
    this.displaySearchResults(allUniversities, searchResults, modal);
}

displaySearchResults(universities, searchResults, modal) {
    if (universities.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h4>Университеты не найдены</h4>
                <p>Попробуйте изменить запрос или выбрать город из списка выше</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = universities.map(uni => `
        <div class="university-result" data-university-id="${uni.id}">
            <div class="uni-result-logo">${uni.logo}</div>
            <div class="uni-result-info">
                <h4>${uni.name}</h4>
                <p>${uni.shortName} • ${uni.city}</p>
            </div>
            <button class="select-uni-btn result">
                Выбрать
            </button>
        </div>
    `).join('');
    
    searchResults.querySelectorAll('.university-result').forEach(result => {
        result.addEventListener('click', (e) => {
            if (!e.target.classList.contains('select-uni-btn')) {
                const universityId = parseInt(result.getAttribute('data-university-id'));
                this.showLoginStep(modal, universityId);
            }
        });
    });
    
    searchResults.querySelectorAll('.select-uni-btn.result').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const universityId = parseInt(btn.closest('.university-result').getAttribute('data-university-id'));
            this.showLoginStep(modal, universityId);
        });
    });
}

  showUniversitiesStep(modal, city) {
    const universities = this.getUniversitiesByCity(city);
    const universitiesList = modal.querySelector('#universities-list');
    const selectedCitySpan = modal.querySelector('#selected-city');
    
    selectedCitySpan.textContent = city;
    universitiesList.innerHTML = universities.map(uni => `
      <div class="university-card" data-university-id="${uni.id}">
        <div class="uni-logo">${uni.logo}</div>
        <div class="uni-info">
          <h4>${uni.name}</h4>
          <p>${uni.shortName}</p>
        </div>
        <button class="select-uni-btn">Выбрать</button>
      </div>
    `).join('');

    this.switchStep(modal, 'step-university');

    universitiesList.querySelectorAll('.select-uni-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const universityCard = btn.closest('.university-card');
        const universityId = parseInt(universityCard.getAttribute('data-university-id'));
        this.showLoginStep(modal, universityId);
      });
    });

    modal.querySelector('.back-btn').addEventListener('click', () => {
      this.switchStep(modal, 'step-city');
    });
  }

showLoginStep(modal, universityId) {
    const university = mockData.universities.find(u => u.id === universityId);
    const selectedUniSpan = modal.querySelector('#selected-university');
    const universityBadge = modal.querySelector('#university-badge');
    const loginForm = modal.querySelector('#university-login-form');
    
    selectedUniSpan.textContent = university.name;
    
    universityBadge.innerHTML = `
        <div class="selected-university-badge">
            <span class="uni-badge-logo">${university.logo}</span>
            <div class="uni-badge-info">
                <strong>${university.name}</strong>
                <span>${university.city}</span>
            </div>
        </div>
        
        <!-- 🔥 ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМА ВХОДА -->
        <div class="login-mode-selector">
            <div class="mode-tabs">
                <button type="button" class="mode-tab active" data-mode="student">
                    👨‍🎓 Студент
                </button>
                <button type="button" class="mode-tab" data-mode="staff">
                    👨‍🏫 Сотрудник
                </button>
            </div>
        </div>
    `;
    
    this.switchStep(modal, 'step-login');
    
    setTimeout(() => {
        modal.querySelector('#university-uid').focus();
    }, 100);

    const modeTabs = modal.querySelectorAll('.mode-tab');
    let currentMode = 'student'; 
    
    modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentMode = tab.getAttribute('data-mode');
            const uidInput = modal.querySelector('#university-uid');
            const passwordHint = modal.querySelector('.password-hint');
            if (currentMode === 'staff') {
                uidInput.placeholder = "Введите ваш Staff ID";
                passwordHint.innerHTML = '<small>Демо-пароль для сотрудников: <code>123</code></small>';
            } else {
                uidInput.placeholder = "Введите ваш UID (например: 123)";
                passwordHint.innerHTML = '<small>Демо-пароль: <code>123</code></small>';
            }
        });
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const loginBtn = modal.querySelector('.login-btn.beautiful');
        const uid = modal.querySelector('#university-uid').value.trim();
        const password = modal.querySelector('#university-password').value;
        
        if (!uid || !password) {
            this.showButtonError(loginBtn, 'Заполните все поля');
            return;
        }
        
        this.showButtonLoading(loginBtn);
        
        try {
            const result = await this.login(universityId, uid, password, currentMode === 'staff');
            
            if (result.success) {
                this.showButtonSuccess(loginBtn);
                setTimeout(() => {
                    document.body.removeChild(modal);
                }, 800);
            } else {
                this.showButtonError(loginBtn, result.error);
            }
        } catch (error) {
            this.showButtonError(loginBtn, 'Ошибка соединения');
        }
    });

    modal.querySelector('.back-btn').addEventListener('click', () => {
        this.switchStep(modal, 'step-search');
        loginForm.reset();
    });
}

  switchStep(modal, stepId) {
    const steps = modal.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('active'));
    modal.querySelector(`#${stepId}`).classList.add('active');
  }

  setupModalHandlers(modal) {
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  showNotification(type, message) {
    const notification = document.createElement('div');
    notification.className = `auth-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${
          type === 'success' ? '✅' : 
          type === 'error' ? '❌' : 'ℹ️'
        }</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 3000);
  }
addBuildNotification() {
    this.removeBuildNotification();
    const notification = document.createElement('div');
    notification.className = 'build-notification';
    notification.textContent = 'ранний билд';
    notification.id = 'build-notification';
    document.body.appendChild(notification);
}

removeBuildNotification() {
    const existingNotification = document.getElementById('build-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
}
}

const authService = new MultiUniversityAuth();