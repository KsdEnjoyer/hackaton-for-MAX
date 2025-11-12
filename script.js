// === MAX mini-app logic ===

// 🔹 Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
  console.log('🚀 Инициализация приложения...');
  
  // Проверяем авторизацию и получаем тип пользователя
  const userType = authService.checkAuth();
  
  if (!userType) return;
  
  console.log('👤 Тип пользователя из checkAuth:', userType);
  
  // 🔥 ИСПОЛЬЗУЕМ ТИП ПОЛЬЗОВАТЕЛЯ ИЗ checkAuth
  if (userType === 'staff') {
    initializeStaffApp();
  } else {
    initializeStudentApp();
  }
}

// 🔥 ФУНКЦИЯ ОПРЕДЕЛЕНИЯ ТИПА ПОЛЬЗОВАТЕЛЯ
function determineUserType() {
  if (!authService.currentUser) return 'student';
  
  // 1. Проверяем permissions
  if (authService.currentUser.permissions?.includes('staff')) {
    return 'staff';
  }
  
  // 2. Проверяем по UID (начинается с staff)
  if (authService.currentUser.uid?.startsWith('staff')) {
    return 'staff';
  }
  
  // 3. Проверяем наличие в массиве staff
  const isStaff = mockData.staff.some(staff => staff.id === authService.currentUser.id);
  if (isStaff) {
    return 'staff';
  }
  
  return 'student';
}

// 🔥 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ДЛЯ СОТРУДНИКОВ
function initializeStaffApp() {
  console.log('🎯 Инициализация интерфейса сотрудника...');
  
  // Скрываем студенческую панель
  const tabs = document.querySelector('.tabs');
  if (tabs) tabs.classList.add('hidden');
  
  // 🔥 ОЧИЩАЕМ КОНТЕНТ ПЕРЕД СОЗДАНИЕМ ИНТЕРФЕЙСА СОТРУДНИКА
  const content = document.querySelector('.content');
  if (content) {
    content.innerHTML = '';
  }
  
  // Немедленно создаем интерфейс сотрудника
  if (typeof StaffInterface !== 'undefined') {
    new StaffInterface();
    console.log('✅ Интерфейс сотрудника создан');
  } else {
    console.error('❌ StaffInterface не определен');
    createSimpleStaffInterface();
  }
}

// 🔥 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ДЛЯ СТУДЕНТОВ
// 🔥 ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ДЛЯ СТУДЕНТОВ
function initializeStudentApp() {
  console.log('🎯 Инициализация интерфейса студента...');
  
  // 🔥 ПОКАЗЫВАЕМ СТУДЕНЧЕСКУЮ ПАНЕЛЬ
  const tabs = document.querySelector('.tabs');
  if (tabs) {
    tabs.classList.remove('hidden');
    console.log('✅ Студенческая панель показана');
  }
  
  // Загружаем сохраненные данные
  if (typeof loadEventsFromLocalStorage === 'function') loadEventsFromLocalStorage();
  if (typeof loadClubsFromLocalStorage === 'function') loadClubsFromLocalStorage();
  
  // Инициализируем студенческое приложение
  if (typeof setupStudentApp === 'function') {
    setupStudentApp();
  } else {
    console.error('❌ setupStudentApp не найден');
    // 🔥 ЕСЛИ ФУНКЦИЯ НЕ НАЙДЕНА, ВЫЗЫВАЕМ ОСНОВНЫЕ ФУНКЦИИ ВРУЧНУЮ
    if (typeof setupNavigation === 'function') setupNavigation();
    if (typeof setupServices === 'function') setupServices();
    if (typeof updateWeekInfo === 'function') updateWeekInfo();
    if (typeof renderTodaySchedule === 'function') renderTodaySchedule();
    if (typeof renderNews === 'function') renderNews();
    if (typeof renderWeekSchedule === 'function') renderWeekSchedule();
    if (typeof renderClubs === 'function') renderClubs();
  }
  
  console.log('✅ Интерфейс студента инициализирован');
}

// 🔥 ПРОВЕРКА НАЛИЧИЯ ВСЕХ НЕОБХОДИМЫХ ФУНКЦИЙ
function checkStudentFunctions() {
  const requiredFunctions = [
    'setupNavigation', 'setupServices', 'updateWeekInfo', 
    'renderTodaySchedule', 'renderNews', 'renderWeekSchedule', 'renderClubs'
  ];
  
  const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
  
  if (missingFunctions.length > 0) {
    console.error('❌ Отсутствующие функции:', missingFunctions);
    return false;
  }
  
  return true;
}

// 🔥 ЗАГЛУШКА ДЛЯ СОТРУДНИКА (если StaffInterface не загрузился)
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