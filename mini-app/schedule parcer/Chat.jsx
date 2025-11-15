import React, { useState, useRef, useEffect } from 'react';
import './Chat.css';

const Chat = () => {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: 'Привет! Я ваш помощник MAX. Узнайте о возможностях нашего мини-приложения и запустите его! 🚀', 
            isUser: false,
            hasButton: false
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const APP_CONFIG = {
        TAG: 'f9LHodD0cOK_cT3nx-Hm0bGtDiB2ZwO8gxL3FxF1cJ4IgHsRG87RNKjOOwV7tw9LXLQ7Nez6UR9m1J10pO0Y',
        URL: 'https://hackaton-for-max-4iki.vercel.app/',
        NAME: 'MAX Platform'
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            isUser: true,
            hasButton: false
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = generateBotResponse(inputValue);
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const generateBotResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        
        const responses = {
            'привет': {
                text: `Добро пожаловать в ${APP_CONFIG.NAME}! 🎉\n\nЯ помогу вам узнать о нашем мини-приложении и запустить его.\n\n**Доступные команды:**\n• 📊 Возможности\n• 📖 Как использовать\n• ⭐ Преимущества\n• 🚀 Запустить приложение`,
                hasButton: false
            },
            'возможности': {
                text: `🎯 **Основные возможности ${APP_CONFIG.NAME}:**\n\n• 📊 Аналитика в реальном времени\n• 🔐 Безопасные транзакции\n• 💬 Умный чат-помощник\n• 🎨 Интуитивный интерфейс\n• ⚡ Быстрая работа\n• 📱 Поддержка всех устройств\n\nГотовы опробовать?`,
                hasButton: true
            },
            'как использовать': {
                text: `📖 **Как использовать ${APP_CONFIG.NAME}:**\n\n1. Нажмите "Запустить мини-приложение"\n2. Авторизуйтесь с вашим ID\n3. Выберите нужный раздел\n4. Настройте под себя\n5. Наслаждайтесь удобством!\n\nВаш ID: ${APP_CONFIG.TAG.substring(0, 10)}...`,
                hasButton: true
            },
            'преимущества': {
                text: `⭐ **Преимущества ${APP_CONFIG.NAME}:**\n\n• ✅ Простота использования\n• ✅ Надежность и безопасность\n• ✅ Поддержка 24/7\n• ✅ Регулярные обновления\n• ✅ Бесплатные функции\n• ✅ Кроссплатформенность\n\nИдеальный выбор для современных пользователей!`,
                hasButton: true
            },
            'запуск': {
                text: `Отлично! Запускаем ${APP_CONFIG.NAME}...\n\n🔐 Ваш идентификатор: ${APP_CONFIG.TAG.substring(0, 15)}...\n🌐 Платформа: Web\n🚀 Готов к запуску!`,
                hasButton: true
            },
            'start': {
                text: `Great! Launching ${APP_CONFIG.NAME}...\n\n🔐 Your ID: ${APP_CONFIG.TAG.substring(0, 15)}...\n🌐 Platform: Web\n🚀 Ready to launch!`,
                hasButton: true
            },
            'default': {
                text: `Я могу рассказать о **возможностях**, **как использовать**, **преимуществах** ${APP_CONFIG.NAME}, или вы можете сразу **запустить** приложение! 🚀\n\nВаш ID: ${APP_CONFIG.TAG.substring(0, 10)}...`,
                hasButton: true
            }
        };

        for (const [key, value] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return {
                    id: Date.now() + 1,
                    text: value.text,
                    isUser: false,
                    hasButton: value.hasButton
                };
            }
        }
        
        return {
            id: Date.now() + 1,
            text: responses.default.text,
            isUser: false,
            hasButton: responses.default.hasButton
        };
    };

    const handleLaunchApp = () => {
        const { TAG, URL, NAME } = APP_CONFIG;
        
        // Сообщение о начале запуска
        setMessages(prev => [...prev, {
            id: Date.now(),
            text: `🚀 **Инициализация запуска...**\n\n📱 Приложение: ${NAME}\n🔐 ID: ${TAG.substring(0, 10)}...\n⏳ Подготовка...`,
            isUser: false,
            hasButton: false
        }]);

        setIsTyping(true);

        // Имитация процесса запуска
        setTimeout(() => {
            setIsTyping(false);
            
            // Создаем URL с параметрами
            const launchUrl = `${URL}?tag=${encodeURIComponent(TAG)}&source=chatbot&timestamp=${Date.now()}`;
            
            // Открываем приложение
            window.open(launchUrl, '_blank');
            
            // Сообщение об успешном запуске
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: `✅ **${NAME} успешно запущен!**\n\n🌐 Открыто в новой вкладке\n🔐 Авторизация по вашему ID\n📊 Доступны все функции\n\nПриятного использования! 🎉`,
                isUser: false,
                hasButton: false
            }]);
        }, 2000);
    };

    const handleQuickAction = (action) => {
        setInputValue(action);
        setTimeout(() => handleSend(), 100);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-avatar">
                    <div className="avatar-icon">MAX</div>
                </div>
                <div className="chat-info">
                    <h3>Помощник MAX</h3>
                    <span className="status">ID: {APP_CONFIG.TAG.substring(0, 8)}...</span>
                </div>
                <div className="header-actions">
                    <button className="action-btn" onClick={() => handleQuickAction('возможности')}>
                        📊
                    </button>
                    <button className="action-btn" onClick={() => handleQuickAction('преимущества')}>
                        ⭐
                    </button>
                </div>
            </div>

            <div className="quick-actions">
                <button className="quick-btn" onClick={() => handleQuickAction('возможности')}>
                    📊 Возможности
                </button>
                <button className="quick-btn" onClick={() => handleQuickAction('как использовать')}>
                    📖 Инструкция
                </button>
                <button className="quick-btn" onClick={handleLaunchApp}>
                    🚀 Быстрый запуск
                </button>
            </div>

            <div className="messages-container">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
                    >
                        <div className="message-content">
                            {message.text.split('\n').map((line, i) => (
                                <p key={i} dangerouslySetInnerHTML={{ 
                                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                                }} />
                            ))}
                        </div>
                        
                        {message.hasButton && !message.isUser && (
                            <div className="action-buttons">
                                <button className="launch-button" onClick={handleLaunchApp}>
                                    🚀 Запустить {APP_CONFIG.NAME}
                                </button>
                                <div className="app-info">
                                    <small>ID: {APP_CONFIG.TAG.substring(0, 12)}...</small>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {isTyping && (
                    <div className="message bot-message typing-indicator">
                        <div className="typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Спросите о ${APP_CONFIG.NAME}...`}
                    className="chat-input"
                />
                <button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim()}
                    className="send-button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Chat;