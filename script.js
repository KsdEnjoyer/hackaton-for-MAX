// === MAX mini-app logic ===

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
  console.log('Инициализация приложения...');
  const userType = authService.checkAuth();
  if (!userType) return;
  console.log('Тип пользователя из checkAuth:', userType);
  if (userType === 'staff') {
    initializeStaffApp();
  } else {
    initializeStudentApp();
  }
}

function determineUserType() {
  if (!authService.currentUser) return 'student';
  
  if (authService.currentUser.permissions?.includes('staff')) {
    return 'staff';
  }
  
  if (authService.currentUser.uid?.startsWith('staff')) {
    return 'staff';
  }
  
  const isStaff = mockData.staff.some(staff => staff.id === authService.currentUser.id);
  if (isStaff) {
    return 'staff';
  }
  
  return 'student';
}

function initializeStaffApp() {
  console.log('Инициализация интерфейса сотрудника...');
  
  const tabs = document.querySelector('.tabs');
  if (tabs) tabs.classList.add('hidden');
  
  const content = document.querySelector('.content');
  if (content) {
    content.innerHTML = '';
  }
  
  if (typeof StaffInterface !== 'undefined') {
    new StaffInterface();
    console.log('Интерфейс сотрудника создан');
  } else {
    console.error('StaffInterface не определен');
    createSimpleStaffInterface();
  }
}


function initializeStudentApp() {
  console.log('Инициализация интерфейса студента...');
  const tabs = document.querySelector('.tabs');
  if (tabs) {
    tabs.classList.remove('hidden');
    console.log('Студенческая панель показана');
  }
  
  if (typeof loadEventsFromLocalStorage === 'function') loadEventsFromLocalStorage();
  if (typeof loadClubsFromLocalStorage === 'function') loadClubsFromLocalStorage();
  if (typeof setupStudentApp === 'function') {
    setupStudentApp();
  } else {
    console.error('setupStudentApp не найден');
    if (typeof setupNavigation === 'function') setupNavigation();
    if (typeof setupServices === 'function') setupServices();
    if (typeof updateWeekInfo === 'function') updateWeekInfo();
    if (typeof renderTodaySchedule === 'function') renderTodaySchedule().catch(err => console.error('Ошибка загрузки расписания:', err));
    if (typeof renderNews === 'function') renderNews().catch(err => console.error('Ошибка загрузки новостей:', err));
    if (typeof renderWeekSchedule === 'function') renderWeekSchedule().catch(err => console.error('Ошибка загрузки недельного расписания:', err));
    if (typeof renderClubs === 'function') renderClubs().catch(err => console.error('Ошибка загрузки клубов:', err));
  }
  
  console.log('Интерфейс студента инициализирован');
}

function checkStudentFunctions() {
  const requiredFunctions = [
    'setupNavigation', 'setupServices', 'updateWeekInfo', 
    'renderTodaySchedule', 'renderNews', 'renderWeekSchedule', 'renderClubs'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.error('Отсутствующие функции:', missingFunctions);
    return false;
  }
  
  return true;
}

function createSimpleStaffInterface() {
  const content = document.querySelector('.content');
  if (!content) return;
  content.innerHTML = `
    <div class="staff-simple" style="padding: 20px; text-align: center;">
      <h2>👨‍🏫 Панель сотрудника</h2>
      <p>Добро пожаловать, ${authService.currentUser.profile.firstName}!</p>
      <p>Интерфейс сотрудника загружается...</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
        Обновить страницу
      </button>
    </div>
  `;
}