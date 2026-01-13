import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

const translations = {
    tr: {
        dashboard: "Panel",
        projects: "Projeler",
        backlog: "İş Listesi",
        board: "Panolar",
        reports: "Raporlar",
        tickets: "Talepler",
        login: "Giriş",
        logout: "Çıkış",
        settings: "Ayarlar",
        theme: "Tema",
        language: "Dil",
        createIssue: "Kayıt Oluştur",
        createSprint: "Sprint Oluştur",
        startSprint: "Sprint Başlat",
        completeSprint: "Sprint Tamamla",
        editSprint: "Düzenle",
        issues: "kayıt",
        planSprint: "Bir sprint planlamak için kayıtları buraya sürükleyin",
        active: "PROJE YÖNETİMİ",
        activeBoard: "Aktif Pano",
        status: "Durum",
        assignee: "Atanan",
        priority: "Öncelik",
        storyPoints: "Efor Puanı",
        description: "Açıklama",
        comments: "Yorumlar",
        save: "Kaydet",
        cancel: "İptal",
        loading: "Yükleniyor...",
        sprintSuccess: "Sprint başarıyla oluşturuldu",
        sprintStartFail: "Sprint başlatılamadı",
        sprintCompleteConfirm: "Bu sprinti tamamlamak istediğinize emin misiniz? Tamamlanan kayıtlar arşivlenecektir.",
        welcome: "Hoş geldin",
        dashboardSubtitle: "Bugün projelerinizde neler olup bittiğine bir bakalım.",
        totalProjects: "Toplam Proje",
        activeTickets: "Aktif Talepler",
        pendingTasks: "Bekleyen İşler",
        completed: "Tamamlanan",
        newToday: "bugün yeni",
        requiresAttention: "İlgi gerekiyor",
        thisWeek: "bu hafta",
        sprintVelocity: "Sprint Hızı",
        quickActions: "Hızlı İşlemler",
        createProject: "Yeni Proje Oluştur",
        createTicket: "Yeni Talep Oluştur",
        manageTeam: "Ekibi Yönet",
        systemStatus: "Sistem Durumu",
        operational: "Tüm sistemler çalışıyor",
        lastCheck: "Son kontrol: Az önce"
    },
    en: {
        dashboard: "Dashboard",
        projects: "Projects",
        backlog: "Backlog",
        board: "Board",
        reports: "Reports",
        tickets: "Tickets",
        login: "Login",
        logout: "Logout",
        settings: "Settings",
        theme: "Theme",
        language: "Language",
        createIssue: "Create Issue",
        createSprint: "Create Sprint",
        startSprint: "Start Sprint",
        completeSprint: "Complete Sprint",
        editSprint: "Edit",
        issues: "issues",
        planSprint: "Plan a sprint by dragging issues here",
        active: "ACTIVE",
        activeBoard: "Active Board",
        status: "Status",
        assignee: "Assignee",
        priority: "Priority",
        storyPoints: "Story Points",
        description: "Description",
        comments: "Comments",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        sprintSuccess: "Sprint created successfully",
        sprintStartFail: "Failed to start sprint",
        sprintCompleteConfirm: "Are you sure you want to complete this sprint? All completed issues will be archived.",
        welcome: "Welcome",
        dashboardSubtitle: "Here's what's happening with your projects today.",
        totalProjects: "Total Projects",
        activeTickets: "Active Tickets",
        pendingTasks: "Pending Tasks",
        completed: "Completed",
        newToday: "new today",
        requiresAttention: "Requires attention",
        thisWeek: "this week",
        sprintVelocity: "Sprint Velocity",
        quickActions: "Quick Actions",
        createProject: "Create New Project",
        createTicket: "Create New Ticket",
        manageTeam: "Manage Team",
        systemStatus: "System Status",
        operational: "All systems operational",
        lastCheck: "Last check: Just now"
    }
};

export function AppProvider({ children }) {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'tr');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => translations[language][key] || key;

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLanguage = () => setLanguage(prev => prev === 'tr' ? 'en' : 'tr');

    return (
        <AppContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, t }}>
            {children}
        </AppContext.Provider>
    );
}
