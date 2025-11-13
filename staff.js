class StaffInterface {
    constructor() {
        this.currentTab = 'requests';
        this.requestsInProgress = new Set();
        this.totalRequests = 3;
        this.totalQuestions = 2;
        this.archivedItems = []; 
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    initialize() {
        console.log('Инициализация StaffInterface...');
        this.createStaffLayout();
        this.setupNavigation();
        this.loadRequests();
        this.loadQuestions();
        this.loadArchive();
    }

    createStaffLayout() {
        const content = document.querySelector('.content');
        if (!content) {
            console.error('Контейнер content не найден');
            return;
        }

        content.innerHTML = `
            <div class="staff-interface">
                <div class="staff-header">
                    <div class="staff-info">
                        <h2>👨‍🏫 Панель сотрудника - ${authService.currentUniversity?.shortName}</h2>
                        <div class="staff-badge">${authService.currentUser.profile.position}</div>
                    </div>
                </div>

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

                <div class="staff-content">
                    <section id="staff-requests" class="staff-tab-content active">
                        <div class="requests-header">
                            <h3>📋 Новые заявки</h3>
                            <div class="requests-stats">
                                <span class="stat">Всего: <strong>${this.totalRequests}</strong></span>
                                <span class="stat">Ожидают: <strong>${this.totalRequests}</strong></span>
                                <span class="stat">В работе: <strong>0</strong></span>
                            </div>
                        </div>
                        <div id="requests-list" class="requests-list">
                        </div>
                    </section>

                    <section id="staff-questions" class="staff-tab-content">
                        <div class="questions-header">
                            <h3>💬 Вопросы от студентов</h3>
                        </div>
                        <div id="questions-list" class="questions-list"></div>
                    </section>

                    <section id="staff-archive" class="staff-tab-content">
                        <div class="archive-header">
                            <h3>📁 Архив обработанных</h3>
                        </div>
                        <div id="archive-list" class="archive-list"></div>
                    </section>
                </div>
            </div>
        `;
        
        console.log('Интерфейс сотрудника создан');
    }

     loadRequests() {
        const requestsList = document.getElementById('requests-list');
        if (!requestsList) return;

        requestsList.innerHTML = `
            <div class="request-item status-new" data-request-id="1">
                <div class="request-header">
                    <span class="student-name">Далер Каримов</span>
                    <span class="request-date">Сегодня, 10:30</span>
                </div>
                <div class="request-type">📄 Справка об обучении</div>
                <div class="request-message">Нужна справка для банка для оформления кредита на обучение</div>
                <div class="request-actions">
                    <button class="btn-success" onclick="staffInterface.startProcessing(1)">
                        <span>✅ Принять</span>
                    </button>
                    <button class="btn-secondary" onclick="staffInterface.rejectRequest(1)">
                        <span>❌ Отклонить</span>
                    </button>
                </div>
            </div>
            <div class="request-item status-new" data-request-id="2">
                <div class="request-header">
                    <span class="student-name">Иван Иванов</span>
                    <span class="request-date">Сегодня, 09:15</span>
                </div>
                <div class="request-type">🏠 Заявка на общежитие</div>
                <div class="request-message">Прошу предоставить место в общежитии на следующий учебный год</div>
                <div class="request-actions">
                    <button class="btn-success" onclick="staffInterface.startProcessing(2)">
                        <span>✅ Принять</span>
                    </button>
                    <button class="btn-secondary" onclick="staffInterface.rejectRequest(2)">
                        <span>❌ Отклонить</span>
                    </button>
                </div>
            </div>
            <div class="request-item status-new" data-request-id="3">
                <div class="request-header">
                    <span class="student-name">Анна Петрова</span>
                    <span class="request-date">Вчера, 16:20</span>
                </div>
                <div class="request-type">💰 Запрос о стипендии</div>
                <div class="request-message">Уточнение по поводу повышенной академической стипендии</div>
                <div class="request-actions">
                    <button class="btn-success" onclick="staffInterface.startProcessing(3)">
                        <span>✅ Принять</span>
                    </button>
                    <button class="btn-secondary" onclick="staffInterface.rejectRequest(3)">
                        <span>❌ Отклонить</span>
                    </button>
                </div>
            </div>
        `;
    }


    loadQuestions() {
        const questionsList = document.getElementById('questions-list');
        if (!questionsList) return;

        questionsList.innerHTML = `
            <div class="request-item status-new" data-question-id="1">
                <div class="request-header">
                    <span class="student-name">Годжо Сатору</span>
                    <span class="request-date">Вчера, 16:45</span>
                </div>
                <div class="request-type">💬 Вопрос по стипендии</div>
                <div class="request-message">Когда будет доступна стипендия за этот месяц?</div>
                <div class="request-actions">
                    <button class="btn-success" onclick="staffInterface.openAnswerModal(1)">
                        <span>💬 Ответить</span>
                    </button>
                    <button class="btn-secondary" onclick="staffInterface.rejectQuestion(1)">
                        <span>❌ Удалить</span>
                    </button>
                </div>
            </div>
            <div class="request-item status-new" data-question-id="2">
                <div class="request-header">
                    <span class="student-name">Юджи Итадори</span>
                    <span class="request-date">Сегодня, 11:20</span>
                </div>
                <div class="request-type">💬 Вопрос по расписанию</div>
                <div class="request-message">Будет ли перенос пар на следующей неделе?</div>
                <div class="request-actions">
                    <button class="btn-success" onclick="staffInterface.openAnswerModal(2)">
                        <span>💬 Ответить</span>
                    </button>
                    <button class="btn-secondary" onclick="staffInterface.rejectQuestion(2)">
                        <span>❌ Удалить</span>
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const waiting = this.totalRequests - this.requestsInProgress.size;
        const inProgress = this.requestsInProgress.size;
        
        const statsElement = document.querySelector('.requests-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                <span class="stat">Всего: <strong>${this.totalRequests}</strong></span>
                <span class="stat">Ожидают: <strong>${waiting}</strong></span>
                <span class="stat">В работе: <strong>${inProgress}</strong></span>
            `;
        }
    }

    startProcessing(requestId) {
        const requestItem = document.querySelector(`[data-request-id="${requestId}"]`);
        if (!requestItem) return;

        this.requestsInProgress.add(requestId);
        
        requestItem.classList.remove('status-new');
        requestItem.classList.add('status-in-progress');
        
        const actionsDiv = requestItem.querySelector('.request-actions');
        actionsDiv.innerHTML = `
            <button class="btn-warning" onclick="staffInterface.completeRequest(${requestId})">
                <span>🎯 Работа закончена</span>
            </button>
            <button class="btn-secondary" onclick="staffInterface.cancelProcessing(${requestId})">
                <span>↩️ Вернуть</span>
            </button>
        `;

        this.updateStats();
        this.showNotification('🔄 Заявка взята в работу', 'info');
    }

    completeRequest(requestId) {
        const requestItem = document.querySelector(`[data-request-id="${requestId}"]`);
        if (!requestItem) return;

        requestItem.classList.add('removing');
        
        setTimeout(() => {
            requestItem.remove();
            this.requestsInProgress.delete(requestId);
            this.totalRequests--; 
            this.updateStats();
            this.showNotification('✅ Заявка успешно обработана', 'success');
        }, 400);
    }

    cancelProcessing(requestId) {
        const requestItem = document.querySelector(`[data-request-id="${requestId}"]`);
        if (!requestItem) return;

        this.requestsInProgress.delete(requestId);
        
        requestItem.classList.remove('status-in-progress');
        requestItem.classList.add('status-new');
        
        const actionsDiv = requestItem.querySelector('.request-actions');
        actionsDiv.innerHTML = `
            <button class="btn-success" onclick="staffInterface.startProcessing(${requestId})">
                <span>✅ Принять</span>
            </button>
            <button class="btn-secondary" onclick="staffInterface.rejectRequest(${requestId})">
                <span>❌ Отклонить</span>
            </button>
        `;

        this.updateStats();
        this.showNotification('↩️ Заявка возвращена в ожидание', 'info');
    }

    rejectRequest(requestId) {
        const requestItem = document.querySelector(`[data-request-id="${requestId}"]`);
        if (!requestItem) return;

        requestItem.classList.add('removing');
        
        setTimeout(() => {
            requestItem.remove();
            this.requestsInProgress.delete(requestId);
            this.totalRequests--; 
            this.updateStats();
            this.showNotification('❌ Заявка отклонена', 'error');
        }, 400);
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

    loadTabData(tab) {
        console.log('Загрузка данных для вкладки:', tab);
        
        if (tab === 'questions') {
            this.loadQuestions();
        } else if (tab === 'archive') {
            this.loadArchive();
        }
    }

    loadArchive() {
        const archiveList = document.getElementById('archive-list');
        if (!archiveList) return;

        archiveList.innerHTML = `
            <div class="request-item status-completed">
                <div class="request-header">
                    <span class="student-name">Юджи Итадори</span>
                    <span class="request-date">12.11.2024</span>
                </div>
                <div class="request-type">📄 Академическая справка</div>
                <div class="request-message">Справка для военкомата - выполнено</div>
            </div>
        `;
    }
    
    openAnswerModal(questionId) {
        const questionItem = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!questionItem) return;

        const studentName = questionItem.querySelector('.student-name').textContent;
        const questionType = questionItem.querySelector('.request-type').textContent;
        const questionMessage = questionItem.querySelector('.request-message').textContent;

        const modal = document.createElement('div');
        modal.className = 'answer-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>💬 Ответ студенту</h3>
                    <button class="close-modal" onclick="staffInterface.closeAnswerModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="answer-form" onsubmit="staffInterface.submitAnswer(event, ${questionId})">
                        <div class="question-preview">
                            <h4>${questionType}</h4>
                            <p><strong>${studentName}:</strong> ${questionMessage}</p>
                        </div>
                        
                        <div class="form-group">
                            <label>Ваш ответ:</label>
                            <textarea class="answer-textarea" placeholder="Напишите ответ студенту..." required></textarea>
                        </div>
                        
                        <div class="answer-actions">
                            <button type="button" class="btn-secondary" onclick="staffInterface.closeAnswerModal()">Отмена</button>
                            <button type="submit" class="btn-primary">📨 Отправить ответ</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAnswerModal();
            }
        });
    }

    closeAnswerModal() {
        const modal = document.querySelector('.answer-modal');
        if (modal) {
            modal.remove();
        }
    }

    submitAnswer(event, questionId) {
        event.preventDefault();
        
        const modal = document.querySelector('.answer-modal');
        const answerText = modal.querySelector('.answer-textarea').value.trim();
        
        if (!answerText) {
            this.showNotification('❌ Напишите ответ студенту', 'error');
            return;
        }

        const questionItem = document.querySelector(`[data-question-id="${questionId}"]`);
        const studentName = questionItem.querySelector('.student-name').textContent;
        const questionType = questionItem.querySelector('.request-type').textContent;
        const questionMessage = questionItem.querySelector('.request-message').textContent;
        
        this.archivedItems.push({
            type: 'question',
            id: questionId,
            student: studentName,
            questionType: questionType,
            question: questionMessage,
            answer: answerText,
            date: new Date().toLocaleDateString('ru-RU'),
            status: 'answered'
        });

        questionItem.classList.add('removing');
        setTimeout(() => {
            questionItem.remove();
            this.totalQuestions--;
            this.closeAnswerModal();
            this.showNotification('✅ Ответ отправлен студенту', 'success');
            this.loadArchive(); 
        }, 400);
    }

    rejectQuestion(questionId) {
        const questionItem = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!questionItem) return;

        questionItem.classList.add('removing');
        
        setTimeout(() => {
            questionItem.remove();
            this.totalQuestions--;
            this.showNotification('❌ Вопрос удален', 'error');
        }, 400);
    }


    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `staff-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '🔄'}</span>
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

const staffInterface = new StaffInterface();