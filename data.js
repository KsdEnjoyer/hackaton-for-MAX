// === mock data для разработки ===

const mockData = {

   universities: [
    {
      id: 1,
      name: "Университет имени Куарта",
      city: "Санкт-Петербург",
      shortName: "4rt",
      logo: "📈",
      isActive: true
    },
    {
      id: 2,
      name: "Магический политех",
      city: "Токио",
      shortName: "ТМП", 
      logo: "⚡️",
      isActive: true
    }
  ],

  users: [
    {
      id: 1,
      uid: "q466123",
      password: "123",
      university_id: 1,
      profile: {
        firstName: "Далер",
        lastName: "Каримов",
        avatar: "👨‍🎓",
        group: "М3235",
        institute: "ФИТиП",
        email: "email@example.ru"
      },
      permissions: ["student"],
      isActive: true
    },
    {
      id: 2,
      uid: "123",
      password: "123",
      university_id: 2,
      profile: {
        firstName: "Годжо",
        lastName: "Сатору",
        avatar: "😎",
        group: "Спец-1",
        institute: "Проклятия",
        email: "strongest@sorcerer.jp"
      },
      permissions: ["student", "teacher"],
      isActive: true
    },
    {
      id: 3,
      uid: "1111", 
      password: "123",
      university_id: 2,
      profile: {
        firstName: "Юджи",
        lastName: "Итадори",
        avatar: "💪",
        group: "Спец-1", 
        institute: "Проклятия",
        email: "sukuna@vessel.jp"
      },
      permissions: ["student"],
      isActive: true
    }
  ],

  news: [
    {
      id: 1,
      university_id: 1,
      title: "Важное объявление от администрации",
      content: "Завтра занятия по сокращенному расписанию",
      author: "Администрация",
      priority: "admin",
      date: "2024-01-20"
    },
    {
      id: 2,
      university_id: 1,
      title: "Собрание группы",
      content: "Собрание в 14:00 в аудитории 301",
      author: "Староста",
      priority: "headman",
      date: "2024-01-19"
    },
    {
      id: 3,
      university_id: 1,
      title: "Хакатон MAX",
      content: "Приглашаем всех студентов принять участие в IT-хакатоне!",
      author: "IT-клуб",
      priority: "student",
      date: "2024-01-18"
    },
    {
      id: 4,
      university_id: 1,
      title: "Смотрим Бората",
      content: "вы даже не представляете, что можете упустить...",
      author: "Далер",
      priority: "headman",
      date: "2025-11-11"
    },
     {
      id: 5,
      university_id: 2,
      title: "Мастер-класс: Бесконечность",
      content: "Годжо Сатору проведет занятие по расширенной технике Бесконечности. Не опаздывать!",
      author: "Годжо Сатору",
      priority: "admin",
      date: "2025-11-15"
    },
    {
      id: 6,
      university_id: 2,
      title: "Тренировка с Маки",
      content: "КТО НЕ ПРИДЕТ, ТОТ СИЛЬНО ПОЖАЛЕЕТ",
      author: "Маки",
      priority: "headman",
      date: "2025-11-9"
    },
    {
      id: 7,
      university_id: 2,
      title: "Идем на фестиваль в Сибуе",
      content: "там тыквенный спас намечается...",
      author: "Итадори",
      priority: "student",
      date: "2025-11-12"
    }
  ],

  schedule: [
    {
      university_id: 1,
      day: "Понедельник",
      date: "2025-11-11",
      lessons: [
        { time: "9:00-10:30", subject: "Высшая математика", type: "lecture", room: "101", teacher: "Проф. Иванов" },
        { time: "10:45-12:15", subject: "Программирование", type: "practice", room: "203", teacher: "Доц. Петрова" },
        { time: "13:00-14:30", subject: "Физика", type: "lab", room: "305", teacher: "Проф. Сидоров" }
      ]
    },
    {
      university_id: 1,
      day: "Вторник",
      date: "2025-11-12",
      lessons: [
        { time: "9:00-10:30", subject: "Иностранный язык", type: "practice", room: "415", teacher: "Доц. Козлова" },
        { time: "12:00-13:30", subject: "Дискретная математика", type: "lecture", room: "102", teacher: "Проф. Никитин" }
      ]
    },
    {
      university_id: 1,
      day: "Среда",
      date: "2025-11-13",
      lessons: [
        { time: "10:45-12:15", subject: "Базы данных", type: "lab", room: "310", teacher: "Доц. Смирнов" },
        { time: "14:00-15:30", subject: "Веб-разработка", type: "practice", room: "205", teacher: "Ст. преп. Васильев" }
      ]
    },
    {
      university_id: 1,
      day: "Четверг",
      date: "2025-11-14",
      lessons: [
        { time: "9:00-11:15", subject: "Операционные системы", type: "lecture", room: "103", teacher: "Проф. Федоров" },
        { time: "11:30-13:00", subject: "Алгоритмы", type: "practice", room: "210", teacher: "Доц. Орлова" }
      ]
    },
    {
      university_id: 1,
      day: "Пятница",
      date: "2025-11-15",
      lessons: [
        { time: "9:00-10:30", subject: "Компьютерные сети", type: "lab", room: "315", teacher: "Доц. Павлов" },
        { time: "12:00-13:30", subject: "Теория вероятностей", type: "lecture", room: "104", teacher: "Проф. Кудрявцева" }
      ]
    },
    {
      university_id: 1,
      day: "Суббота",
      date: "2025-11-16",
      lessons: [
        { time: "10:00-11:30", subject: "Физкультура", type: "practice", room: "Спортзал", teacher: "Преп. Михайлов" }
      ]
    },
    {
      university_id: 2,
      day: "Понедельник",
      date: "2025-11-11", 
      lessons: [
        { time: "9:00-10:30", subject: "Основы проклятий", type: "lecture", room: "Додзё-1", teacher: "Годжо Сатору" },
        { time: "11:00-13:00", subject: "Физическая подготовка", type: "practice", room: "Тренировочный зал", teacher: "Дзэнин Маки" },
        { time: "14:00-16:00", subject: "Техники энергетических ударов", type: "lab", room: "Полигон-А", teacher: "Нанами Кэнт" }
      ]
    },
    {
      university_id: 2,
      day: "Вторник",
      date: "2025-11-12",
      lessons: [
        { time: "10:00-12:00", subject: "Расширенные техники доменов", type: "lecture", room: "Теория-3", teacher: "Годжо Сатору" },
        { time: "13:00-15:00", subject: "Боевые искусства", type: "practice", room: "Додзё-2", teacher: "Аои Тодо" }
      ]
    },
    {
      university_id: 2, 
      day: "Среда",
      date: "2025-11-13",
      lessons: [
        { time: "9:00-11:00", subject: "Шикиgamи-контроль", type: "lab", room: "Сумрачный лес", teacher: "Мегуми Фусигуро" },
        { time: "12:00-14:00", subject: "Тактика против особых проклятий", type: "seminar", room: "Комната-404", teacher: "Кугисаки Нобара" }
      ]
    },
    {
      university_id: 2, 
      day: "четверг",
      date: "2025-11-13",
      lessons: [
        { time: "9:00 - 18:00", subject: "Изгнание проклятий", type: "practice", room: "Сумрачный лес", teacher: "Мегуми" },
      ]
    },
    {
      university_id: 2, 
      day: "пятница",
      date: "2025-11-13",
      lessons: [
        { time: "9:00 - 18:00", subject: "Изгнание проклятий", type: "practice", room: "Сумрачный лес", teacher: "Мегуми" },
      ]
    },
    {
      university_id: 2, 
      day: "суббота",
      date: "2025-11-13",
      lessons: [
        { time: "9:00 - 18:00", subject: "Изгнание проклятий", type: "practice", room: "Сумрачный лес", teacher: "Мегуми" },
      ]
    },
  ],

  user: {
    group: "ИВТ-321",
    stream: "ИТ-3",
    institute: "Институт информационных технологий"
  },

  classrooms: [
     {
      id: 1,
      university_id: 1,
      number: "101",
      type: "lecture",
      capacity: 50,
      floor: 1,
      building: "Главный корпус",
      equipment: ["проектор", "доска", "микрофон"],
      available: true
    },
    {
      id: 2,
      university_id: 1,
      number: "203",
      type: "practice",
      capacity: 25,
      floor: 2, 
      building: "Главный корпус",
      equipment: ["проектор", "доска", "ПК"],
      available: true
    },
    // СПб университет аудитории
    {
      id: 1,
      university_id: 1,
      number: "101",
      type: "lecture",
      capacity: 50,
      floor: 1,
      building: "Главный корпус",
      equipment: ["проектор", "доска", "микрофон"],
      available: true
    },
    {
      id: 2,
      university_id: 1,
      number: "203",
      type: "practice",
      capacity: 25,
      floor: 2, 
      building: "Главный корпус",
      equipment: ["проектор", "доска", "ПК"],
      available: true
    }
  ],

  // 🔥 ДОБАВЛЯЕМ КЛУБЫ
  clubs: [
    { 
        id: 1,
        university_id: 1,
        icon: "🎨", 
        name: "Арт-клуб", 
        desc: "Рисование, выставки и творчество.",
        members: 24,
        contact: "@art_club_max",
        category: "creative",
        tags: ["рисование", "живопись", "графика", "выставки", "творчество"],
        activity: "high", // low, medium, high
        meetingDay: "пятница"
    },
    { 
      id: 7,
      university_id: 1,
      icon: "😎", 
      name: "Клуб фанатов Далера", 
      desc: "Мы его верные фанаты! Как же волнительно! >.< ",
      members: 123124,
      contact: "@dalerka_supremacy_max",
      category: "HAIP",
      tags: ["рисование"],
      activity: "high", 
      meetingDay: "пятница"
    },
    { 
        id: 2,
        university_id: 1,
        icon: "💻", 
        name: "IT клуб", 
        desc: "Кодинг, дизайн, проекты и стартапы. Хакатоны каждую неделю!",
        members: 156,
        contact: "@it_club_max",
        category: "tech",
        tags: ["программирование", "веб-разработка", "ai", "хакатоны", "стартапы"],
        activity: "high",
        meetingDay: "среда"
    },
    { 
        id: 4,
        university_id: 1,
        icon: "🏀", 
        name: "Баскетбольная команда", 
        desc: "Тренировки и соревнования. Приходи на отбор!",
        members: 18,
        contact: "@basketball_max",
        category: "sports",
        tags: ["баскетбол", "тренировки", "соревнования", "команда"],
        activity: "high",
        meetingDay: "понедельник"
    },
    { 
        id: 5,
        university_id: 1,
        icon: "🎭", 
        name: "Театральная студия", 
        desc: "Актерское мастерство и постановки. От новичков до профи.",
        members: 31,
        contact: "@theatre_max",
        category: "creative",
        tags: ["актерское", "постановки", "импровизация", "сцена"],
        activity: "medium",
        meetingDay: "четверг"
    },
    { 
        id: 6,
        university_id: 1,
        icon: "🔬", 
        name: "Научное общество", 
        desc: "Исследования, конференции, публикации. Для будущих ученых!",
        members: 87,
        contact: "@science_max",
        category: "academic",
        tags: ["исследования", "конференции", "публикации", "наука"],
        activity: "medium",
        meetingDay: "пятница"
    },
    { 
        id: 7,
        university_id: 1,
        icon: "♟️", 
        name: "Шахматный клуб", 
        desc: "Турниры и обучение. Подходит для любого уровня.",
        members: 29,
        contact: "@chess_max",
        category: "games",
        tags: ["шахматы", "турниры", "стратегия", "логика"],
        activity: "low",
        meetingDay: "суббота"
    },
    { 
        id: 8,
        university_id: 1,
        icon: "🌍", 
        name: "Клуб дебатов", 
        desc: "Развивай ораторское искусство и критическое мышление.",
        members: 53,
        contact: "@debate_max",
        category: "academic",
        tags: ["дебаты", "ораторское", "критическое мышление", "политика"],
        activity: "medium",
        meetingDay: "вторник"
    },
    { 
      id: 9,
      university_id: 2,
      icon: "🌀", 
      name: "Клуб техники Бесконечности", 
      desc: "Изучаем продвинутые техники пространственного контроля",
      members: 3,
      contact: "@infinity_club",
      category: "combat",
      tags: ["бесконечность", "пространство", "защита"],
      activity: "high",
      meetingDay: "понедельник"
    },
    { 
      id: 10,
      university_id: 2,
      icon: "⚡️", 
      name: "Общество Черной молнии", 
      desc: "Тренируем технику рассеивания и усиления энергии",
      members: 8,
      contact: "@black_flash",
      category: "energy", 
      tags: ["молния", "энергия", "скорость"],
      activity: "medium",
      meetingDay: "среда"
    },
    { 
      id: 11,
      university_id: 2,
      icon: "👹", 
      name: "Клуб изучения Проклятий", 
      desc: "Анализируем и классифицируем особые проклятия",
      members: 12,
      contact: "@cursed_research",
      category: "academic",
      tags: ["проклятия", "исследование", "анализ"],
      activity: "high", 
      meetingDay: "вторник"
    },
    { 
      id: 12,
      university_id: 2,
      icon: "🎭", 
      name: "Театр теней Фусигуро", 
      desc: "Осваиваем технику призыва 10 теней",
      members: 5,
      contact: "@10_shadows",
      category: "summoning",
      tags: ["тени", "призыв", "shikigami"],
      activity: "medium",
      meetingDay: "четверг"
    }
  ],

   events: [
    {
      id: 1,
      university_id: 1,
      title: "Хакатон MAX",
      description: "IT-соревнование для разработчиков",
      date: "2025-11-15",
      time: "10:00 - 18:00",
      location: "Главный корпус",
      type: "hackathon",
      capacity: 50,
      registeredUsers: [/* массив ID пользователей */],
      status: "registration_open",
      organizer: "IT-клуб",
      tags: ["программирование", "соревнование", "IT"],
      image: "💻"
    },
    {
      id: 2,
      university_id: 1,
      title: "Научная конференция",
      description: "Достижения в области компьютерных наук",
      date: "2025-11-18",
      time: "14:00 - 17:00",
      location: "Аудитория 301",
      type: "conference",
      capacity: 40,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Научное общество",
      tags: ["наука", "исследования", "доклады"],
      image: "🔬"
    },
    {
      id: 3,
      university_id: 1,
      title: "Карьерный день",
      description: "Встреча с IT-компаниями и стартапами",
      date: "2025-11-22",
      time: "11:00 - 16:00",
      location: "Актовый зал",
      type: "career",
      capacity: 100,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Центр карьеры",
      tags: ["трудоустройство", "карьера", "IT-компании"],
      image: "💼"
    },
    {
      id: 4,
      university_id: 1,
      title: "Мастер-класс по Figma",
      description: "Основы дизайна интерфейсов для начинающих",
      date: "2025-11-25",
      time: "16:00 - 18:00",
      location: "Аудитория 205",
      type: "workshop",
      capacity: 25,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Дизайн-клуб",
      tags: ["дизайн", "figma", "UI/UX"],
      image: "🎨"
    },
     {
      id: 5,
      university_id: 2,
      title: "Турнир сильнейших",
      description: "Ежегодный турнир для определения сильнейшего мага",
      date: "2025-11-20",
      time: "14:00 - 18:00",
      location: "Главный додзё",
      type: "tournament",
      capacity: 30,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Годжо Сатору",
      tags: ["турнир", "битва", "рейтинг"],
      image: "🥊"
    },
    {
      id: 6,
      university_id: 2,
      title: "Ночь охоты на проклятия",
      description: "Практическое занятие по нейтрализации проклятий в городских условиях",
      date: "2025-11-25",
      time: "20:00 - 06:00", 
      location: "Район Сибуя",
      type: "field_training",
      capacity: 15,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Нанами Кэнт",
      tags: ["проклятия", "охота", "практика"],
      image: "🌃"
    },
    {
      id: 7,
      university_id: 2,
      title: "Мастер-класс: Расширенные домены",
      description: "Годжо Сатору раскрывает секреты техники 'Бесконечный пустота'",
      date: "2025-11-30",
      time: "10:00 - 13:00",
      location: "Спец-полигон",
      type: "masterclass", 
      capacity: 10,
      registeredUsers: [],
      status: "registration_open",
      organizer: "Годжо Сатору",
      tags: ["домен", "бесконечность", "мастер-класс"],
      image: "🌀"
    }
  ],

  currentUser: {
    id: 12345,
    name: "Иван Иванов",
    group: "ИВТ-321",
    email: "ivan@edu.max"
  }  
};

// Функция для получения текущей недели
function getCurrentWeek() {
  const today = new Date();
  const startDate = new Date("2025-09-01"); // начало семестра
  const diffTime = today - startDate;
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1;
}

// 🔧 УТИЛИТЫ ДЛЯ РАБОТЫ С МУЛЬТИ-УНИВЕРСИТЕТСКИМИ ДАННЫМИ

// Получить данные конкретного университета
// 🔧 УТИЛИТЫ ДЛЯ РАБОТЫ С МУЛЬТИ-УНИВЕРСИТЕТСКИМИ ДАННЫМИ
function getUniversityData(dataType, universityId = null) {
    const targetUniversityId = universityId || (authService?.currentUniversity?.id);
    
    if (!targetUniversityId) {
        console.log('❌ University ID не указан');
        return [];
    }
    
    const data = mockData[dataType]?.filter(item => 
        item.university_id === targetUniversityId
    ) || [];
    
    console.log(`📊 Данные ${dataType} для университета ${targetUniversityId}:`, data.length);
    return data;
}

// Получить все данные (для админов и т.д.)
function getAllData(dataType) {
  return mockData[dataType] || [];
}

// 🔧 ФУНКЦИИ ДЛЯ СОВМЕСТИМОСТИ СО СТАРЫМ КОДОМ
// Временные функции, которые будем постепенно заменять
function getCurrentUserData() {
  return authService.currentUser?.profile || { 
    group: "Не авторизован", 
    institute: "",
    firstName: "Гость",
    lastName: ""
  };
}

function getMockData() {
  const universityId = authService.currentUniversity?.id || 1;
  return {
    news: getUniversityData('news', universityId),
    schedule: getUniversityData('schedule', universityId),
    user: getCurrentUserData(),
    classrooms: getUniversityData('classrooms', universityId),
    clubs: getUniversityData('clubs', universityId),
    events: getUniversityData('events', universityId),
    currentUser: authService.currentUser
  };
}