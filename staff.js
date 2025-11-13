class StaffInterface {
   constructor() {
        this.currentTab = 'requests';
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        console.log('🔄 Инициализация StaffInterface...');
        this.createStaffLayout();
        this.setupNavigation();
        this.loadRequests();
    }

     createStaffLayout() {
        const content = document.querySelector('.content');
        if (!content) {
            console.error('Контейнер content не найден');
            return;
        }

        content.innerHTML = `
            <div class="staff-interface">
                <!-- Шапка сотрудника -->
                <div class="staff-header">
                    <h2>👨‍🏫 Панель сотрудника - ${authService.currentUniversity?.shortName}</h2>
                    <div class="staff-info">
                        <div class="staff-badge">${authService.currentUser.profile.position}</div>
                        <div class="user-info">
                            ${authService.currentUser.profile.firstName} ${authService.currentUser.profile.lastName}
                        </div>
                    </div>
                </div>

                <!-- Нижняя панель сотрудника -->
                <nav class="staff-tabs">
                    <button class="staff-tab-button active" data-tab="requests">
                        <i>📋</i>
                        <span>Заявки</span>
                    </button>
                    <button class="staff-tab-button" data-tab="questions">
                        <i>💬</i>
                        <span>Вопросы</span>
                    </button>
                    <button class="staff-tab-button" data-tab="archive">
                        <i>📁</i>
                        <span>Архив</span>
                    </button>
                </nav>

                <!-- Контент -->
                <div class="staff-content">
                    <!-- Заявки -->
                    <section id="staff-requests" class="staff-tab-content active">
                        <div class="requests-header">
                            <h3>📋 Новые заявки</h3>
                            <div class="requests-stats">
                                <span class="stat">Ожидают: <strong>5</strong></span>
                                <span class="stat">Сегодня: <strong>2</strong></span>
                            </div>
                        </div>
                        <div id="requests-list" class="requests-list">
                            <!-- Заявки будут здесь -->
                        </div>
                    </section>

                    <!-- Вопросы -->
                    <section id="staff-questions" class="staff-tab-content">
                        <div class="questions-header">
                            <h3>💬 Вопросы от студентов</h3>
                        </div>
                        <div id="questions-list" class="questions-list">
                            <!-- Вопросы будут здесь -->
                        </div>
                    </section>

                    <!-- Архив -->
                    <section id="staff-archive" class="staff-tab-content">
                        <div class="archive-header">
                            <h3>📁 Архив обработанных</h3>
                        </div>
                        <div id="archive-list" class="archive-list">
                            <!-- Архив будет здесь -->
                        </div>
                    </section>
                </div>
            </div>
        `;
        
        console.log('Интерфейс сотрудника создан');
    }   

    setupNavigation() {
        const tabs = document.querySelectorAll('.staff-tab-button');
        const contents = document.querySelectorAll('.staff-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const target = tab.dataset.tab;
                document.getElementById(`staff-${target}`).classList.add('active');
                
                this.currentTab = target;
                this.loadTabData(target);
            });
        });
    }

    loadRequests() {
        const requestsList = document.getElementById('requests-list');
        if (!requestsList) return;

        requestsList.innerHTML = `
            <div class="request-item">
                <div class="request-header">
                    <span class="student-name">Далер Каримов</span>
                    <span class="request-date">Сегодня, 10:30</span>
                </div>
                <div class="request-type">📄 Справка об обучении</div>
                <div class="request-message">Нужна справка для банка</div>
                <div class="request-actions">
                    <button class="btn-success">Принять</button>
                    <button class="btn-secondary">Отклонить</button>
                </div>
            </div>
            <div class="request-item">
                <div class="request-header">
                    <span class="student-name">Иван Иванов</span>
                    <span class="request-date">Сегодня, 09:15</span>
                </div>
                <div class="request-type">🏠 Заявка на общежитие</div>
                <div class="request-message">Прошу предоставить место в общежитии</div>
                <div class="request-actions">
                    <button class="btn-success">Принять</button>
                    <button class="btn-secondary">Отклонить</button>
                </div>
            </div>
        `;

        this.setupRequestHandlers();
    }

    setupRequestHandlers() {
        document.querySelectorAll('.btn-success').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestItem = e.target.closest('.request-item');
                this.acceptRequest(requestItem);
            });
        });

        document.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const requestItem = e.target.closest('.request-item');
                this.rejectRequest(requestItem);
            });
        });
    }

    acceptRequest(requestItem) {
        requestItem.style.opacity = '0.5';
        setTimeout(() => {
            requestItem.remove();
            this.showNotification('✅ Заявка принята в работу', 'success');
        }, 300);
    }

    rejectRequest(requestItem) {
        requestItem.style.opacity = '0.5';
        setTimeout(() => {
            requestItem.remove();
            this.showNotification('❌ Заявка отклонена', 'error');
        }, 300);
    }

    loadTabData(tab) {
        console.log('Загрузка данных для вкладки:', tab);
        
        if (tab === 'questions') {
            this.loadQuestions();
        } else if (tab === 'archive') {
            this.loadArchive();
        }
    }

    loadQuestions() {
        const questionsList = document.getElementById('questions-list');
        if (!questionsList) return;

        questionsList.innerHTML = `
            <div class="question-item">
                <div class="question-header">
                    <span class="student-name">Годжо Сатору</span>
                    <span class="question-date">Вчера, 16:45</span>
                </div>
                <div class="question-text">Когда будет доступна стипендия?</div>
                <div class="question-actions">
                    <button class="btn-primary">Ответить</button>
                </div>
            </div>
        `;
    }

    loadArchive() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        archiveList.innerHTML = `
            <div class="archive-item">
                <div class="archive-header">
                    <span class="student-name">Юджи Итадори</span>
                    <span class="archive-date">12.11.2024</span>
                </div>
                <div class="archive-type">📄 Академическая справка</div>
                <div class="archive-status completed">✅ Выполнено</div>
            </div>
        `;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `staff-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
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
}