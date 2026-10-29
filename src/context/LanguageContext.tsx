"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.materials": "My Materials",
    "nav.chat": "AI Study Chat",
    "nav.quiz": "Quiz Generator",
    "nav.planner": "Study Planner",
    "nav.progress": "Progress",
    "nav.student": "Student",
    "nav.workspace": "Workspace",

    // Common
    "common.search": "Search...",
    "common.all": "All",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.clear": "Clear",
    "common.ready": "Ready",
    "common.streak": "day streak",

    // Topbar
    "topbar.searchPlaceholder": "Search notes, quizzes...",
    "topbar.notifications": "Notifications",
    "topbar.markRead": "Mark read",

    // Dashboard
    "dash.welcome": "Welcome back",
    "dash.tasksDue": "tasks to complete this week.",
    "dash.studyTime": "Study Time",
    "dash.documents": "Documents",
    "dash.quizzesTaken": "Quizzes",
    "dash.retention": "Retention",
    "dash.hoursThisWeek": "+4.2h this week",
    "dash.indexedNotes": "Stored notes",
    "dash.practiceSessions": "Recall tests",
    "dash.accuracyRate": "Accuracy",
    "dash.todayGoal": "Today's Study Goal",
    "dash.hoursCompleted": "3 of 4 hours completed",
    "dash.hoursLeft": "1h remaining",
    "dash.quickNewTask": "New Task",
    "dash.quickNewTaskSub": "Plan a topic",
    "dash.quickUpload": "Upload File",
    "dash.quickUploadSub": "Add PDF/notes",
    "dash.quickQuiz": "Practice Quiz",
    "dash.quickQuizSub": "Test memory",
    "dash.quickChat": "AI Chat",
    "dash.quickChatSub": "Ask questions",
    "dash.upcomingTasks": "Upcoming Tasks",
    "dash.openPlanner": "Open planner",
    "dash.recentMaterials": "Recent Materials",
    "dash.viewAll": "View all",
    "dash.recentActivity": "Recent Activity",

    // Materials
    "mat.title": "Study Materials",
    "mat.subtitle": "Textbooks, class notes, and revision sheets.",
    "mat.uploadBtn": "Upload File",
    "mat.restore": "Restore Samples",
    "mat.searchPlaceholder": "Search documents or #topics...",
    "mat.allSubjects": "All Subjects",
    "mat.pages": "pages",
    "mat.chatAction": "Chat",
    "mat.quizAction": "Quiz",
    "mat.emptyTitle": "No study materials yet",
    "mat.emptyDesc": "Add your lecture notes, summaries, or textbooks to start.",
    "mat.noMatchTitle": "Not Found — No documents match",
    "mat.noMatchDesc": "Try clearing your search or switching subject filters.",
    "mat.uploadTitle": "Add Study Document",
    "mat.uploadDesc": "Upload notes, summaries, or PDF chapters.",
    "mat.dropzoneText": "Click or drag & drop PDF/Word notes",
    "mat.dropzoneSub": "PDF, DOCX up to 25MB",
    "mat.inputTitle": "Document Title",
    "mat.subject": "Subject",
    "mat.pageCount": "Page Count",

    // Quiz
    "quiz.title": "Practice Quizzes",
    "quiz.subtitle": "Strengthen memory with active recall tests.",
    "quiz.min": "min",
    "quiz.questions": "Questions with explanations",
    "quiz.start": "Start Quiz",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.complete": "Complete",
    "quiz.previous": "Previous",
    "quiz.next": "Next Question",
    "quiz.submit": "Submit Quiz",
    "quiz.exit": "Exit Quiz",
    "quiz.score": "Score",
    "quiz.correct": "Correct",
    "quiz.retake": "Retake Quiz",
    "quiz.chooseAnother": "Choose Another Topic",
    "quiz.reviewTitle": "Question Review & Explanations",
    "quiz.yourAnswer": "Your Answer",
    "quiz.correctAnswer": "Correct Answer",

    // Planner
    "plan.title": "Study Planner",
    "plan.subtitle": "Organize your study goals, homework, and test dates.",
    "plan.addTask": "Add Task",
    "plan.restore": "Restore Samples",
    "plan.timeRemaining": "Remaining Time",
    "plan.pending": "Pending",
    "plan.done": "Done",
    "plan.searchTasks": "Search tasks...",
    "plan.allPriorities": "All Priorities",
    "plan.high": "High",
    "plan.medium": "Medium",
    "plan.low": "Low",
    "plan.emptyTitle": "No study tasks yet",
    "plan.emptyDesc": "Create your first task to schedule your study sessions.",
    "plan.noMatchTitle": "Not Found — No tasks match",
    "plan.noMatchDesc": "Try resetting your filter or search query.",
    "plan.modalTitle": "Create Study Task",
    "plan.modalDesc": "Set assignment deadlines, revision goals, or exam prep.",
    "plan.taskTitle": "Task Title",
    "plan.dueDate": "Due Date",
    "plan.duration": "Estimated Time",
    "plan.notes": "Notes (Optional)",

    // Chat
    "chat.title": "AI Study Assistant",
    "chat.subtitle": "Ask for explanations, summaries, or concept breakdowns.",
    "chat.clear": "Clear",
    "chat.tryAsking": "Try asking:",
    "chat.placeholder": "Type a question or study topic... (Press Enter to send)",
    "chat.send": "Send",
    "chat.thinking": "Thinking...",
    "chat.you": "You",
    "chat.ai": "Cognita AI",

    // Progress
    "prog.title": "Learning Progress",
    "prog.subtitle": "Track study hours, consistency, and subject mastery.",
    "prog.totalHours": "Total Hours",
    "prog.currentStreak": "Current Streak",
    "prog.retentionScore": "Retention Score",
    "prog.weeklyHours": "Weekly Study Hours",
    "prog.subjectMastery": "Subject Mastery",
    "prog.milestones": "Milestones & Achievements",
    "prog.unlocked": "Unlocked",
    "prog.inProgress": "In Progress",
    "prog.thisWeek": "This Week",
  },
  am: {
    // Nav
    "nav.dashboard": "ዳሽቦርድ",
    "nav.materials": "የጥናት ፋይሎች",
    "nav.chat": "AI ጥናት",
    "nav.quiz": "ፈተናዎች",
    "nav.planner": "የጥናት እቅድ",
    "nav.progress": "ውጤትና እድገት",
    "nav.student": "ተማሪ",
    "nav.workspace": "ክፍሎች",

    // Common
    "common.search": "ፈልግ...",
    "common.all": "ሁሉም",
    "common.cancel": "ተመለስ",
    "common.save": "መዝግብ",
    "common.delete": "ሰርዝ",
    "common.clear": "አጽዳ",
    "common.ready": "ዝግጁ",
    "common.streak": "ቀናት ተከታታይ",

    // Topbar
    "topbar.searchPlaceholder": "ማስታወሻዎችን፣ ፈተናዎችን ፈልግ...",
    "topbar.notifications": "ማሳወቂያዎች",
    "topbar.markRead": "ሁሉንም አንብብ",

    // Dashboard
    "dash.welcome": "እንኳን ደህና መጣህ",
    "dash.tasksDue": "የቀሩ የጥናት ተግባራት አሉህ።",
    "dash.studyTime": "የተጠና ሰዓት",
    "dash.documents": "ዶክመንቶች",
    "dash.quizzesTaken": "ፈተናዎች",
    "dash.retention": "የማስታወስ አቅም",
    "dash.hoursThisWeek": "+4.2 ሰዓት በዚህ ሳምንት",
    "dash.indexedNotes": "የተመዘገቡ ፋይሎች",
    "dash.practiceSessions": "የተሰሩ ፈተናዎች",
    "dash.accuracyRate": "ትክክለኛነት",
    "dash.todayGoal": "የዛሬ የጥናት ግብ",
    "dash.hoursCompleted": "ከ4 ሰዓት ውስጥ 3 ሰዓት ተጠናቀቀ",
    "dash.hoursLeft": "1 ሰዓት ቀርቷል",
    "dash.quickNewTask": "አዲስ እቅድ",
    "dash.quickNewTaskSub": "ርዕስ መዝግብ",
    "dash.quickUpload": "ፋይል ጫን",
    "dash.quickUploadSub": "PDF/ማስታወሻ",
    "dash.quickQuiz": "ፈተና ጀምር",
    "dash.quickQuizSub": "እውቀትህን ለካ",
    "dash.quickChat": "AI ጠይቅ",
    "dash.quickChatSub": "ፅንሰ-ሀሳብ ጠይቅ",
    "dash.upcomingTasks": "ቀጣይ የጥናት ስራዎች",
    "dash.openPlanner": "እቅዶችን ክፈት",
    "dash.recentMaterials": "የቅርብ ጊዜ ፋይሎች",
    "dash.viewAll": "ሁሉንም እይ",
    "dash.recentActivity": "የቅርብ ጊዜ እንቅስቃሴ",

    // Materials
    "mat.title": "የጥናት ማስታወሻዎች",
    "mat.subtitle": "የመማሪያ መጻሕፍት፣ የክፍል ማስታወሻዎችና ፒዲኤፍ ፋይሎች።",
    "mat.uploadBtn": "ፋይል ጫን",
    "mat.restore": "ምሳሌዎችን መልስ",
    "mat.searchPlaceholder": "ፋይሎችን ወይም #አርዕስቶችን ፈልግ...",
    "mat.allSubjects": "ሁሉም የትምህርት አይነቶች",
    "mat.pages": "ገጾች",
    "mat.chatAction": "ጠይቅ",
    "mat.quizAction": "ፈተና",
    "mat.emptyTitle": "ምንም የተጫነ ፋይል የለም",
    "mat.emptyDesc": "ማስታወሻዎችን ወይም ፒዲኤፍ ፋይል በመጫን ጥናትህን ጀምር።",
    "mat.noMatchTitle": "ምንም አልተገኘም (Not Found)",
    "mat.noMatchDesc": "የፍለጋ ቃሉን ወይም የትምህርት ምርጫውን ቀይረህ ሞክር።",
    "mat.uploadTitle": "አዲስ የጥናት ፋይል ጫን",
    "mat.uploadDesc": "የሌክቸር ማስታወሻዎችን ወይም ፒዲኤፍ አስገባ።",
    "mat.dropzoneText": "ፋይል ለመምረጥ እዚህ ጠቅ አድርግ",
    "mat.dropzoneSub": "PDF, DOCX እስከ 25MB",
    "mat.inputTitle": "የፋይሉ ስም",
    "mat.subject": "የትምህርት አይነት",
    "mat.pageCount": "የገጽ ብዛት",

    // Quiz
    "quiz.title": "የልምምድ ፈተናዎች",
    "quiz.subtitle": "ያነበብከውን እንዳትረሳ ራስህን ፈትን።",
    "quiz.min": "ደቂቃ",
    "quiz.questions": "ጥያቄዎች ከነሙሉ ማብራሪያ",
    "quiz.start": "ፈተና ጀምር",
    "quiz.question": "ጥያቄ",
    "quiz.of": "ከ",
    "quiz.complete": "ተጠናቋል",
    "quiz.previous": "የቀደመው",
    "quiz.next": "ቀጣይ ጥያቄ",
    "quiz.submit": "ፈተናውን ጨርስ",
    "quiz.exit": "ውጣ",
    "quiz.score": "ውጤት",
    "quiz.correct": "ትክክል",
    "quiz.retake": "እንደገና ፈትን",
    "quiz.chooseAnother": "ሌላ አርዕስት ምረጥ",
    "quiz.reviewTitle": "የጥያቄዎች ማብራሪያ",
    "quiz.yourAnswer": "የመለስከው",
    "quiz.correctAnswer": "ትክክለኛው መልስ",

    // Planner
    "plan.title": "የጥናት እቅድ",
    "plan.subtitle": "የፈተና ቀናትን፣ የቤት ስራዎችንና የንባብ ሰዓቶችን አስተካክል።",
    "plan.addTask": "ስራ መዝግብ",
    "plan.restore": "ምሳሌዎችን መልስ",
    "plan.timeRemaining": "የቀረ ሰዓት",
    "plan.pending": "ያልተጠናቀቁ",
    "plan.done": "የተጠናቀቁ",
    "plan.searchTasks": "ስራዎችን ፈልግ...",
    "plan.allPriorities": "ሁሉም ደረጃዎች",
    "plan.high": "ከፍተኛ",
    "plan.medium": "መካከለኛ",
    "plan.low": "ዝቅተኛ",
    "plan.emptyTitle": "ምንም የጥናት እቅድ የለም",
    "plan.emptyDesc": "የመጀመሪያህን የጥናት እቅድ በመመዝገብ ፕሮግራምህን አዘጋጅ።",
    "plan.noMatchTitle": "ምንም አልተገኘም (Not Found)",
    "plan.noMatchDesc": "የፍለጋ ቃሉን አስተካክለህ እንደገና ሞክር።",
    "plan.modalTitle": "አዲስ የጥናት ስራ መዝግብ",
    "plan.modalDesc": "የፈተና ቀን፣ የቤት ስራ ወይም የሚጠና ርዕስ አስገባ።",
    "plan.taskTitle": "የስራው ርዕስ",
    "plan.dueDate": "የሚጠናቀቅበት ቀን",
    "plan.duration": "የሚወስደው ጊዜ",
    "plan.notes": "ተጨማሪ ማስታወሻ",

    // Chat
    "chat.title": "AI የጥናት ረዳት",
    "chat.subtitle": "ያልገባህን ፅንሰ-ሀሳብ ጠይቅ፣ አጫጭር ማጠቃለያዎችን አግኝ።",
    "chat.clear": "አጽዳ",
    "chat.tryAsking": "እነዚህን ጠይቅ:",
    "chat.placeholder": "ጥያቄ ወይም የሚከብድህን ርዕስ ጻፍ... (Enter ተጫን)",
    "chat.send": "ላክ",
    "chat.thinking": "በማሰብ ላይ...",
    "chat.you": "አንተ",
    "chat.ai": "Cognita AI",

    // Progress
    "prog.title": "ውጤትና እድገት",
    "prog.subtitle": "የጥናት ሰዓትህን፣ ፅናትህንና እውቀትህን ተከታተል።",
    "prog.totalHours": "ጠቅላላ ሰዓት",
    "prog.currentStreak": "የጥናት ፅናት",
    "prog.retentionScore": "የማስታወስ ምጣኔ",
    "prog.weeklyHours": "የሳምንቱ የጥናት ሰዓት",
    "prog.subjectMastery": "የትምህርት መረዳት ደረጃ",
    "prog.milestones": "የስኬት ዋንጫዎች",
    "prog.unlocked": "የተገኘ",
    "prog.inProgress": "በሂደት ላይ",
    "prog.thisWeek": "በዚህ ሳምንት",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cognita_lang") as Language;
      if (saved === "en" || saved === "am") {
        setLanguageState(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("cognita_lang", lang);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
