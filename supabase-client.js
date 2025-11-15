// 🔥 SUPABASE CLIENT И API ДЛЯ БАЗЫ ДАННЫХ

const SUPABASE_CONFIG = {
    url: 'https://xkdfizflkwofviyifacw.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrZGZpemZsa3dvZnZpeWlmYWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNTU5NjEsImV4cCI6MjA3ODYzMTk2MX0.YK2wQaBlwUP3tc0HAq1HIDlac19eFcJCtQ2sNdv6_S0'
};

const supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

const SupabaseDB = {
    client: supabaseClient,

    async getNews(universityId) {
        try {
            const { data, error } = await supabaseClient
                .from('news')
                .select('*')
                .eq('university_id', universityId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log('✅ Новости загружены из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения новостей:', error);
            return mockData.news.filter(n => n.university_id === universityId) || [];
        }
    },

    async createNews(newsData) {
        try {
            const { data, error } = await supabaseClient
                .from('news')
                .insert([newsData])
                .select();
            
            if (error) throw error;
            console.log('✅ Новость создана в БД:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания новости:', error);
            const newNews = { ...newsData, id: Date.now() };
            mockData.news.push(newNews);
            return newNews;
        }
    },

    async deleteNews(id) {
        try {
            const { error } = await supabaseClient
                .from('news')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            console.log('✅ Новость удалена из БД');
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления новости:', error);
            mockData.news = mockData.news.filter(n => n.id !== id);
            return true;
        }
    },

 
    async getClubs(universityId) {
        try {
            const { data, error } = await supabaseClient
                .from('clubs')
                .select('*')
                .eq('university_id', universityId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log('✅ Клубы загружены из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения клубов:', error);
            return mockData.clubs.filter(c => c.university_id === universityId) || [];
        }
    },

    async createClub(clubData) {
        try {
            const { data, error } = await supabaseClient
                .from('clubs')
                .insert([clubData])
                .select();
            
            if (error) throw error;
            console.log('Клуб создан в БД:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания клуба:', error);
            const newClub = { ...clubData, id: Date.now() };
            mockData.clubs.push(newClub);
            return newClub;
        }
    },

    async getEvents(universityId) {
        try {
            const { data, error } = await supabaseClient
                .from('events')
                .select('*')
                .eq('university_id', universityId)
                .order('date', { ascending: true });
            
            if (error) throw error;
            console.log('Мероприятия загружены из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения мероприятий:', error);
            return mockData.events.filter(e => e.university_id === universityId) || [];
        }
    },

    async registerForEvent(eventId, userId) {
        try {
            const { data: event, error: fetchError } = await supabaseClient
                .from('events')
                .select('registered_users')
                .eq('id', eventId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const registeredUsers = event.registered_users || [];
            if (!registeredUsers.includes(userId)) {
                registeredUsers.push(userId);
            }
            
            const { data, error } = await supabaseClient
                .from('events')
                .update({ registered_users: registeredUsers })
                .eq('id', eventId)
                .select();
            
            if (error) throw error;
            console.log('Пользователь записан на мероприятие');
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка записи на мероприятие:', error);
            const event = mockData.events.find(e => e.id === eventId);
            if (event) {
                if (!event.registeredUsers) event.registeredUsers = [];
                if (!event.registeredUsers.includes(userId)) {
                    event.registeredUsers.push(userId);
                }
            }
            return event;
        }
    },

    async unregisterFromEvent(eventId, userId) {
        try {
            const { data: event, error: fetchError } = await supabaseClient
                .from('events')
                .select('registered_users')
                .eq('id', eventId)
                .single();
            
            if (fetchError) throw fetchError;
            
            const registeredUsers = (event.registered_users || []).filter(id => id !== userId);
            
            const { data, error } = await supabaseClient
                .from('events')
                .update({ registered_users: registeredUsers })
                .eq('id', eventId)
                .select();
            
            if (error) throw error;
            console.log('Пользователь отписан от мероприятия');
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка отписки от мероприятия:', error);
            const event = mockData.events.find(e => e.id === eventId);
            if (event && event.registeredUsers) {
                event.registeredUsers = event.registeredUsers.filter(id => id !== userId);
            }
            return event;
        }
    },

    async getSchedule(universityId) {
        try {
            const { data, error } = await supabaseClient
                .from('schedule')
                .select('*')
                .eq('university_id', universityId);
            
            if (error) throw error;
            console.log('Расписание загружено из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения расписания:', error);
            return mockData.schedule.filter(s => s.university_id === universityId) || [];
        }
    },

    async getClassrooms(universityId) {
        try {
            const { data, error } = await supabaseClient
                .from('classrooms')
                .select('*')
                .eq('university_id', universityId);
            
            if (error) throw error;
            console.log('Аудитории загружены из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения аудиторий:', error);
            return mockData.classrooms.filter(c => c.university_id === universityId) || [];
        }
    },

    async getUserEvents(userId) {
        try {
            console.log('🔄 Загружаем события пользователя из БД:', userId);
            const { data, error } = await supabaseClient
                .from('user_events')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: true });
            
            if (error) throw error;
            console.log('События пользователя загружены из БД:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('❌ Ошибка получения событий пользователя:', error);
            return [];
        }
    },

    async createUserEvent(eventData) {
        try {
            console.log('Создаем событие в БД:', eventData);
                const dataToInsert = {
                user_id: eventData.user_id,
                university_id: eventData.university_id,
                title: eventData.title,
                date: eventData.date,
                time: eventData.time || null,
                type: eventData.type || 'personal',
                description: eventData.description || null
            };
            
            if (eventData.color) {
                dataToInsert.color = eventData.color;
            }
            
            console.log('📦 Отправляем в БД:', dataToInsert);

            const { data, error } = await supabaseClient
                .from('user_events')
                .insert([dataToInsert])
                .select();
            
            if (error) {
                console.error('❌ Ошибка от Supabase:', error);
                throw error;
            }
            console.log('Событие создано в БД:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания события:', error);
            return null;
        }
    },

    async updateUserEvent(eventId, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('user_events')
                .update(updates)
                .eq('id', eventId)
                .select();
            
            if (error) throw error;
            console.log('Событие обновлено в БД:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка обновления события:', error);
            return null;
        }
    },

    async deleteUserEvent(eventId) {
        try {
            const { error } = await supabaseClient
                .from('user_events')
                .delete()
                .eq('id', eventId);
            
            if (error) throw error;
            console.log('✅ Событие удалено из БД:', eventId);
            return true;
        } catch (error) {
            console.error('❌ Ошибка удаления события:', error);
            return false;
        }
    },

    async getNotifications(userId) {
        try {
            const { data, error} = await supabaseClient
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .eq('is_read', false)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log('Уведомления загружены из БД:', data.length);
            return data;
        } catch (error) {
            console.error('❌ Ошибка загрузки уведомлений:', error);
            return [];
        }
    },

    async markNotificationAsRead(notificationId) {
        try {
            const { data, error } = await supabaseClient
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)
                .select();
            
            if (error) throw error;
            console.log('Уведомление прочитано:', notificationId);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка обновления уведомления:', error);
            return null;
        }
    },

    async createNotification(notificationData) {
        try {
            const { data, error } = await supabaseClient
                .from('notifications')
                .insert([notificationData])
                .select();
            
            if (error) throw error;
            console.log('Уведомление создано:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания уведомления:', error);
            return null;
        }
    },

    async getQuestions(universityId, status = 'pending') {
        try {
            const { data, error } = await supabaseClient
                .from('questions')
                .select('*')
                .eq('university_id', universityId)
                .eq('status', status)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log(`Вопросы загружены (${status}):`, data.length);
            return data;
        } catch (error) {
            console.error('❌ Ошибка загрузки вопросов:', error);
            return [];
        }
    },

    async createQuestion(questionData) {
        try {
            const { data, error } = await supabaseClient
                .from('questions')
                .insert([questionData])
                .select();
            
            if (error) throw error;
            console.log('Вопрос создан:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания вопроса:', error);
            return null;
        }
    },

    async answerQuestion(questionId, answer, answeredBy) {
        try {
            const { data, error } = await supabaseClient
                .from('questions')
                .update({ 
                    status: 'answered',
                    answer: answer,
                    answered_by: answeredBy,
                    answered_at: new Date().toISOString()
                })
                .eq('id', questionId)
                .select();
            
            if (error) throw error;
            console.log('Вопрос отвечен:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка ответа на вопрос:', error);
            return null;
        }
    },

    async getRequests(universityId, status = 'pending') {
        try {
            const { data, error } = await supabaseClient
                .from('requests')
                .select('*')
                .eq('university_id', universityId)
                .eq('status', status)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log(`Заявки загружены (${status}):`, data.length);
            return data;
        } catch (error) {
            console.error('❌ Ошибка загрузки заявок:', error);
            return [];
        }
    },

    async createRequest(requestData) {
        try {
            const { data, error } = await supabaseClient
                .from('requests')
                .insert([requestData])
                .select();
            
            if (error) throw error;
            console.log('Заявка создана:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка создания заявки:', error);
            return null;
        }
    },

    async updateRequestStatus(requestId, status, comment = null) {
        try {
            const updateData = { 
                status: status,
                processed_at: new Date().toISOString()
            };
            if (comment) updateData.comment = comment;
            
            const { data, error } = await supabaseClient
                .from('requests')
                .update(updateData)
                .eq('id', requestId)
                .select();
            
            if (error) throw error;
            console.log('Заявка обновлена:', data);
            return data[0];
        } catch (error) {
            console.error('❌ Ошибка обновления заявки:', error);
            return null;
        }
    }
};

async function getUniversityDataFromDB(dataType) {
    const universityId = authService?.currentUniversity?.id;
    
    if (!universityId) {
        console.warn('⚠️ Университет не выбран, используем mock данные');
        return mockData[dataType] || [];
    }
    
    try {
        console.log(`🔄 Загружаем ${dataType} из Supabase...`);
        
        switch(dataType) {
            case 'news':
                return await SupabaseDB.getNews(universityId);
            case 'clubs':
                return await SupabaseDB.getClubs(universityId);
            case 'events':
                return await SupabaseDB.getEvents(universityId);
            case 'schedule':
                return await SupabaseDB.getSchedule(universityId);
            case 'classrooms':
                return await SupabaseDB.getClassrooms(universityId);
            default:
                console.warn(`⚠️ Неизвестный тип данных: ${dataType}, используем mock`);
                return mockData[dataType]?.filter(item => item.university_id === universityId) || [];
        }
    } catch (error) {
        console.error(`❌ Ошибка загрузки ${dataType}:`, error);
        return mockData[dataType]?.filter(item => item.university_id === universityId) || [];
    }
}

window.supabaseClient = supabaseClient;
window.SupabaseDB = SupabaseDB;
window.getUniversityDataFromDB = getUniversityDataFromDB;

console.log('🚀 Supabase клиент инициализирован');
console.log('📦 SupabaseDB API готов к использованию');
