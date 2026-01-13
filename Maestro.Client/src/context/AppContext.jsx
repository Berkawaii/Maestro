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
        lastCheck: "Son kontrol: Az önce",
        users: "Kullanıcılar",
        userManagement: "Kullanıcı Yönetimi",
        category: "Kategori",
        departments: "Departmanlar",
        slaSettings: "SLA Ayarları",
        slaReports: "SLA Raporları",
        workingHours: "Mesai Saatleri",
        responseTargets: "Hedef Süreler",
        startTime: "Başlangıç Saati",
        endTime: "Bitiş Saati",
        workingDays: "Çalışma Günleri",
        saveSettings: "Ayarları Kaydet",
        updatePolicies: "Politikaları Güncelle",
        maxTime: "Maks. Süre (Dakika)",
        estHours: "Tahmini Saat",
        slaComplianceByDept: "Departman Bazlı SLA Uyumu",
        totalResolved: "Toplam Çözülen",
        totalImpacted: "Toplam Etkilenen",
        metSla: "SLA Başarılı",
        missedSla: "SLA Başarısız",
        complianceRate: "Başarı Oranı",
        noResolvedTickets: "Bu dönemde çözülen talep bulunamadı.",
        daily: "Günlük",
        weekly: "Haftalık",
        monthly: "Aylık"
    },
    en: {
        dashboard: "Dashboard",
        projects: "Projects",
        backlog: "Backlog",
        board: "Board",
        reports: "Reports",
        tickets: "Tickets",
        users: "Users",
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
        lastCheck: "Last check: Just now",
        userManagement: "User Management",
        category: "Category",
        departments: "Departments",
        slaSettings: "SLA Settings",
        slaReports: "SLA Reports",
        workingHours: "Working Hours",
        responseTargets: "Response Targets",
        startTime: "Start Time",
        endTime: "End Time",
        workingDays: "Working Days",
        saveSettings: "Save Settings",
        updatePolicies: "Update Policies",
        maxTime: "Max Time (Minutes)",
        estHours: "Est. Hours",
        slaComplianceByDept: "SLA Compliance by Department",
        totalResolved: "Total Resolved",
        totalImpacted: "Total Impacted",
        metSla: "Met SLA",
        missedSla: "Missed SLA",
        complianceRate: "Compliance Rate",
        noResolvedTickets: "No resolved tickets in this period.",
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly"
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
