import type { DoctorNavSection, LanguageCode, PatientNavSection } from '../types/rvedha';

export interface TranslationBundle {
  languageName: string;
  nativeLabel: string;
  brandSubtitle: string;
  patientNav: Record<PatientNavSection, string> & { logout: string };
  doctorNav: Record<DoctorNavSection, string> & { logout: string };
  greetings: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    patientSubtitle: string;
    doctorSubtitle: string;
  };
  header: {
    searchPlaceholder: string;
    notificationsTitle: string;
    markAllRead: string;
    viewAllNotifications: string;
  };
  statuses: {
    Pending: string;
    Confirmed: string;
    Rescheduled: string;
    Completed: string;
    Cancelled: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    month: string;
    week: string;
    day: string;
    today: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    all: string;
    unread: string;
    markRead: string;
    delete: string;
  };
  ai: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    clearChat: string;
    voiceHint: string;
    patientPrompts: string[];
    doctorPrompts: string[];
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    languageName: 'English',
    nativeLabel: 'English',
    brandSubtitle: 'AI SMART APPOINTMENT MANAGEMENT',
    patientNav: {
      dashboard: 'Dashboard',
      'book-appointment': 'Book Appointment',
      'my-appointments': 'My Appointments',
      upcoming: 'Upcoming Visits',
      history: 'Appointment History',
      calendar: 'Calendar',
      notifications: 'Notifications',
      'ai-assistant': 'Vedha AI',
      profile: 'Profile Settings',
      logout: 'Logout',
    },
    doctorNav: {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      calendar: 'Calendar',
      availability: 'Availability & Slots',
      notifications: 'Notifications',
      'ai-assistant': 'Vedha AI',
      profile: 'Profile Settings',
      logout: 'Logout',
    },
    greetings: {
      morning: 'Good Morning',
      afternoon: 'Good Afternoon',
      evening: 'Good Evening',
      night: 'Good Night',
      patientSubtitle: 'Manage your consultations, book specialists, and track upcoming visits.',
      doctorSubtitle: 'Review your clinical roster, consultation requests, and live schedule.',
    },
    header: {
      searchPlaceholder: 'Search bookings, doctors, dates...',
      notificationsTitle: 'Notifications',
      markAllRead: 'Mark all as read',
      viewAllNotifications: 'Open Notification Center',
    },
    statuses: {
      Pending: 'Pending',
      Confirmed: 'Confirmed',
      Rescheduled: 'Rescheduled',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
    },
    calendar: {
      title: 'Appointment Calendar',
      subtitle: 'Inspect scheduled consultations across Month, Week, and Day views.',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      today: 'Today',
    },
    notifications: {
      title: 'Notifications Center',
      subtitle: 'Live updates for bookings, confirmations, reschedules, cancellations, and reminders.',
      all: 'All',
      unread: 'Unread',
      markRead: 'Mark as read',
      delete: 'Delete',
    },
    ai: {
      title: 'Vedha AI Assistant',
      subtitle: 'Contextual clinical scheduling assistant synced to your R VEDHA records.',
      inputPlaceholder: 'Ask Vedha AI about appointments or open slots...',
      clearChat: 'Clear Conversation',
      voiceHint: 'Voice Input',
      patientPrompts: [
        'Show my upcoming appointments.',
        'Which doctors are available?',
        'Find the next available Cardiology slot.',
        'Summarize my appointment history.',
      ],
      doctorPrompts: [
        "Show today's appointments.",
        'Show pending appointment requests.',
        'Which slots are booked today?',
        'Summarize my weekly consultation load.',
      ],
    },
  },
  ta: {
    languageName: 'Tamil',
    nativeLabel: 'தமிழ்',
    brandSubtitle: 'AI ஸ்மார்ட் சந்திப்பு மேலாண்மை',
    patientNav: {
      dashboard: 'டாஷ்போர்டு',
      'book-appointment': 'புதிய முன்பதிவு',
      'my-appointments': 'என் சந்திப்புகள்',
      upcoming: 'வரவிருக்கும் சந்திப்புகள்',
      history: 'சந்திப்பு வரலாறு',
      calendar: 'நாள்காட்டி',
      notifications: 'அறிவிப்புகள்',
      'ai-assistant': 'வேதா AI',
      profile: 'சுயவிவர அமைப்புகள்',
      logout: 'வெளியேறு',
    },
    doctorNav: {
      dashboard: 'டாஷ்போர்டு',
      appointments: 'சந்திப்புகள்',
      calendar: 'நாள்காட்டி',
      availability: 'நேர மேலாண்மை',
      notifications: 'அறிவிப்புகள்',
      'ai-assistant': 'வேதா AI',
      profile: 'சுயவிவர அமைப்புகள்',
      logout: 'வெளியேறு',
    },
    greetings: {
      morning: 'காலை வணக்கம்',
      afternoon: 'மதிய வணக்கம்',
      evening: 'மாலை வணக்கம்',
      night: 'இனிய இரவு',
      patientSubtitle: 'உங்கள் மருத்துவ சந்திப்புகளை முன்பதிவு செய்து நிர்வகிக்கவும்.',
      doctorSubtitle: 'இன்றைய நோயாளர் சந்திப்புகள் மற்றும் நேர அட்டவணையைப் பார்க்கவும்.',
    },
    header: {
      searchPlaceholder: 'சந்திப்புகள், மருத்துவர்களைத் தேடுக...',
      notificationsTitle: 'அறிவிப்புகள்',
      markAllRead: 'அனைத்தையும் படித்ததாகக் குறி',
      viewAllNotifications: 'அறிவிப்பு மையத்தைத் திற',
    },
    statuses: {
      Pending: 'நிலுவையில்',
      Confirmed: 'உறுதி செய்யப்பட்டது',
      Rescheduled: 'நேரம் மாற்றப்பட்டது',
      Completed: 'முடிந்தது',
      Cancelled: 'ரத்து செய்யப்பட்டது',
    },
    calendar: {
      title: 'சந்திப்பு நாள்காட்டி',
      subtitle: 'மாதம், வாரம் மற்றும் நாள் காட்சிகளில் சந்திப்புகளைப் பார்க்கவும்.',
      month: 'மாதம்',
      week: 'வாரம்',
      day: 'நாள்',
      today: 'இன்று',
    },
    notifications: {
      title: 'அறிவிப்பு மையம்',
      subtitle: 'முன்பதிவு, உறுதிப்படுத்தல், மாற்றம் மற்றும் ரத்து தகவல்கள்.',
      all: 'அனைத்தும்',
      unread: 'படிக்காதவை',
      markRead: 'படித்ததாக குறி',
      delete: 'நீக்கு',
    },
    ai: {
      title: 'வேதா AI உதவியாளர்',
      subtitle: 'உங்கள் சந்திப்புகள் மற்றும் நேர இடைவெளிகளை உடனுக்குடன் பார்க்க உதவுகிறது.',
      inputPlaceholder: 'சந்திப்புகள் அல்லது நேரங்களைக் கேளுங்கள்...',
      clearChat: 'உரையாடலை அழி',
      voiceHint: 'குரல் உள்ளீடு',
      patientPrompts: [
        'Show my upcoming appointments.',
        'Which doctors are available?',
        'Find the next available Cardiology slot.',
        'Summarize my appointment history.',
      ],
      doctorPrompts: [
        "Show today's appointments.",
        'Show pending appointment requests.',
        'Which slots are booked today?',
        'Summarize my weekly consultation load.',
      ],
    },
  },
  ml: {
    languageName: 'Malayalam',
    nativeLabel: 'മലയാളം',
    brandSubtitle: 'AI സ്മാർട്ട് അപ്പോയിന്റ്മെന്റ് മാനേജ്‌മെന്റ്',
    patientNav: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      'book-appointment': 'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',
      'my-appointments': 'എന്റെ അപ്പോയിന്റ്മെന്റുകൾ',
      upcoming: 'വരാനിരിക്കുന്നവ',
      history: 'ചരിത്രം',
      calendar: 'കലണ്ടർ',
      notifications: 'അറിയിപ്പുകൾ',
      'ai-assistant': 'വേദ AI',
      profile: 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ',
      logout: 'ലോഗൗട്ട്',
    },
    doctorNav: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      appointments: 'അപ്പോയിന്റ്മെന്റുകൾ',
      calendar: 'കലണ്ടർ',
      availability: 'സമയ ക്രമീകരണം',
      notifications: 'അറിയിപ്പുകൾ',
      'ai-assistant': 'വേദ AI',
      profile: 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ',
      logout: 'ലോഗൗട്ട്',
    },
    greetings: {
      morning: 'സുപ്രഭാതം',
      afternoon: 'ശുഭ ഉച്ചയ്ക്ക്',
      evening: 'ശുഭ സായാഹ്നം',
      night: 'ശുഭരാത്രി',
      patientSubtitle: 'നിങ്ങളുടെ കൺസൾട്ടേഷനുകൾ ബുക്ക് ചെയ്യാനും നിയന്ത്രിക്കാനും.',
      doctorSubtitle: 'ഇന്നത്തെ രോഗികളുടെ ഷെഡ്യൂളും ലഭ്യതയും നിയന്ത്രിക്കുക.',
    },
    header: {
      searchPlaceholder: 'അപ്പോയിന്റ്മെന്റുകൾ, ഡോക്ടർമാർ തിരയുക...',
      notificationsTitle: 'അറിയിപ്പുകൾ',
      markAllRead: 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക',
      viewAllNotifications: 'അറിയിപ്പ് കേന്ദ്രം തുറക്കുക',
    },
    statuses: {
      Pending: 'തീരുമാനമാകാനുണ്ട്',
      Confirmed: 'സ്ഥിരീകരിച്ചു',
      Rescheduled: 'സമയം മാറ്റി',
      Completed: 'പൂർത്തിയായി',
      Cancelled: 'റദ്ദാക്കി',
    },
    calendar: {
      title: 'അപ്പോയിന്റ്മെന്റ് കലണ്ടർ',
      subtitle: 'മാസം, ആഴ്ച, ദിവസം കാഴ്ചകളിൽ ഷെഡ്യൂൾ കാണുക.',
      month: 'മാസം',
      week: 'ആഴ്ച',
      day: 'ദിവസം',
      today: 'ഇന്ന്',
    },
    notifications: {
      title: 'അറിയിപ്പ് കേന്ദ്രം',
      subtitle: 'ബുക്കിംഗുകൾ, മാറ്റങ്ങൾ, റദ്ദാക്കലുകൾ എന്നിവയുടെ വിവരങ്ങൾ.',
      all: 'എല്ലാം',
      unread: 'വായിക്കാത്തവ',
      markRead: 'വായിച്ചതായി അടയാളപ്പെടുത്തുക',
      delete: 'നീക്കം ചെയ്യുക',
    },
    ai: {
      title: 'വേദ AI അസിസ്റ്റന്റ്',
      subtitle: 'നിങ്ങളുടെ R VEDHA അക്കൗണ്ടുമായി ബന്ധിപ്പിച്ച സ്മാർട്ട് സഹായി.',
      inputPlaceholder: 'അപ്പോയിന്റ്മെന്റുകളെക്കുറിച്ച് ചോദിക്കുക...',
      clearChat: 'ചാറ്റ് മായ്ക്കുക',
      voiceHint: 'ശബ്ദ നിർദ്ദേശം',
      patientPrompts: [
        'Show my upcoming appointments.',
        'Which doctors are available?',
        'Find the next available Cardiology slot.',
        'Summarize my appointment history.',
      ],
      doctorPrompts: [
        "Show today's appointments.",
        'Show pending appointment requests.',
        'Which slots are booked today?',
        'Summarize my weekly consultation load.',
      ],
    },
  },
  te: {
    languageName: 'Telugu',
    nativeLabel: 'తెలుగు',
    brandSubtitle: 'AI స్మార్ట్ అపాయింట్‌మెంట్ మేనేజ్‌మెంట్',
    patientNav: {
      dashboard: 'డాష్‌బోర్డ్',
      'book-appointment': 'కొత్త అపాయింట్‌మెంట్',
      'my-appointments': 'నా అపాయింట్‌మెంట్లు',
      upcoming: 'రాబోయేవి',
      history: 'చరిత్ర',
      calendar: 'క్యాలెండర్',
      notifications: 'నోటిఫికేషన్లు',
      'ai-assistant': 'వేద AI',
      profile: 'ప్రొఫైల్ సెట్టింగ్‌లు',
      logout: 'లాగ్ అవుట్',
    },
    doctorNav: {
      dashboard: 'డాష్‌బోర్డ్',
      appointments: 'అపాయింట్‌మెంట్లు',
      calendar: 'క్యాలెండర్',
      availability: 'లభ్యత & స్లాట్లు',
      notifications: 'నోటిఫికేషన్లు',
      'ai-assistant': 'వేద AI',
      profile: 'ప్రొఫైల్ సెట్టింగ్‌లు',
      logout: 'లాగ్ అవుట్',
    },
    greetings: {
      morning: 'శుభోదయం',
      afternoon: 'శుభ మధ్యాహ్నం',
      evening: 'శుభ సాయంత్రం',
      night: 'శుభ రాత్రి',
      patientSubtitle: 'మీ అపాయింట్‌మెంట్లను సులభంగా బుక్ చేసి నిర్వహించండి.',
      doctorSubtitle: 'మీ నేటి కన్సల్టేషన్లు మరియు సమయాలను నిర్వహించండి.',
    },
    header: {
      searchPlaceholder: 'అపాయింట్‌మెంట్లు, వైద్యులను వెతకండి...',
      notificationsTitle: 'నోటిఫికేషన్లు',
      markAllRead: 'అన్నీ చదివినట్లు గుర్తించు',
      viewAllNotifications: 'నోటిఫికేషన్ కేంద్రాన్ని తెరవండి',
    },
    statuses: {
      Pending: 'పెండింగ్',
      Confirmed: 'నిర్ధారించబడింది',
      Rescheduled: 'మార్చబడింది',
      Completed: 'పూర్తయింది',
      Cancelled: 'రద్దు చేయబడింది',
    },
    calendar: {
      title: 'అపాయింట్‌మెంట్ క్యాలెండర్',
      subtitle: 'నెల, వారం, రోజు వీక్షణలలో మీ షెడ్యూల్ చూడండి.',
      month: 'నెల',
      week: 'వారం',
      day: 'రోజు',
      today: 'ఈరోజు',
    },
    notifications: {
      title: 'నోటిఫికేషన్ కేంద్రం',
      subtitle: 'బుకింగ్, నిర్ధారణ, రీషెడ్యూల్ మరియు రద్దు అప్‌డేట్లు.',
      all: 'అన్నీ',
      unread: 'చదవనివి',
      markRead: 'చదివినట్లు గుర్తించు',
      delete: 'తొలగించు',
    },
    ai: {
      title: 'వేద AI అసిస్టెంట్',
      subtitle: 'మీ R VEDHA రికార్డుల ఆధారంగా తక్షణ సహాయం.',
      inputPlaceholder: 'అపాయింట్‌మెంట్లు లేదా స్లాట్ల గురించి అడగండి...',
      clearChat: 'చాట్ క్లియర్ చేయి',
      voiceHint: 'వాయిస్ ఇన్‌పుట్',
      patientPrompts: [
        'Show my upcoming appointments.',
        'Which doctors are available?',
        'Find the next available Cardiology slot.',
        'Summarize my appointment history.',
      ],
      doctorPrompts: [
        "Show today's appointments.",
        'Show pending appointment requests.',
        'Which slots are booked today?',
        'Summarize my weekly consultation load.',
      ],
    },
  },
  hi: {
    languageName: 'Hindi',
    nativeLabel: 'हिन्दी',
    brandSubtitle: 'AI स्मार्ट अपॉइंटमेंट प्रबंधन',
    patientNav: {
      dashboard: 'डैशबोर्ड',
      'book-appointment': 'नया अपॉइंटमेंट बुक करें',
      'my-appointments': 'मेरे अपॉइंटमेंट्स',
      upcoming: 'आगामी विज़िट',
      history: 'परामर्श इतिहास',
      calendar: 'कैलेंडर',
      notifications: 'सूचनाएं',
      'ai-assistant': 'वेदा AI',
      profile: 'प्रोफ़ाइल सेटिंग्स',
      logout: 'लॉग आउट',
    },
    doctorNav: {
      dashboard: 'डैशबोर्ड',
      appointments: 'अपॉइंटमेंट्स',
      calendar: 'कैलेंडर',
      availability: 'उपलब्धता और स्लॉट',
      notifications: 'सूचनाएं',
      'ai-assistant': 'वेदा AI',
      profile: 'प्रोफ़ाइल सेटिंग्स',
      logout: 'लॉग आउट',
    },
    greetings: {
      morning: 'सुप्रभात',
      afternoon: 'शुभ दोपहर',
      evening: 'शुभ संध्या',
      night: 'शुभ रात्रि',
      patientSubtitle: 'अपने परामर्श बुक करें, समय बदलें और डॉक्टरों से जुड़ें।',
      doctorSubtitle: 'आज के रोगी अपॉइंटमेंट्स और अपनी उपलब्धता प्रबंधित करें।',
    },
    header: {
      searchPlaceholder: 'अपॉइंटमेंट या डॉक्टर खोजें...',
      notificationsTitle: 'सूचनाएं',
      markAllRead: 'सभी को पढ़ा हुआ चिह्नित करें',
      viewAllNotifications: 'सूचना केंद्र खोलें',
    },
    statuses: {
      Pending: 'लंबित',
      Confirmed: 'पुष्ट',
      Rescheduled: 'पुनर्निर्धारित',
      Completed: 'पूर्ण',
      Cancelled: 'रद्द',
    },
    calendar: {
      title: 'अपॉइंटमेंट कैलेंडर',
      subtitle: 'माह, सप्ताह और दिन के अनुसार अपना शेड्यूल देखें।',
      month: 'माह',
      week: 'सप्ताह',
      day: 'दिन',
      today: 'आज',
    },
    notifications: {
      title: 'सूचना केंद्र',
      subtitle: 'बुकिंग, पुष्टि, समय परिवर्तन और रद्दीकरण की सूचनाएं।',
      all: 'सभी',
      unread: 'अपठित',
      markRead: 'पढ़ा हुआ चिह्नित करें',
      delete: 'हटाएं',
    },
    ai: {
      title: 'वेदा AI सहायक',
      subtitle: 'आपके सक्रिय R VEDHA शेड्यूल से जुड़ा स्मार्ट सहायक।',
      inputPlaceholder: 'अपॉइंटमेंट या उपलब्ध स्लॉट के बारे में पूछें...',
      clearChat: 'बातचीत साफ़ करें',
      voiceHint: 'वॉइस इनपुट',
      patientPrompts: [
        'Show my upcoming appointments.',
        'Which doctors are available?',
        'Find the next available Cardiology slot.',
        'Summarize my appointment history.',
      ],
      doctorPrompts: [
        "Show today's appointments.",
        'Show pending appointment requests.',
        'Which slots are booked today?',
        'Summarize my weekly consultation load.',
      ],
    },
  },
};
