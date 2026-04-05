const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');

if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

// English Base (Keys)
const keys = {
  auth: {
    login: "Login",
    signup: "Sign Up",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    password: "Password",
    forgot_password: "Forgot Password?",
    no_account: "Don't have an account?",
    have_account: "Already have an account?",
    continue: "Continue",
    otp_sent: "OTP sent to your email",
    resend_otp: "Resend OTP",
    verify_otp: "Verify OTP",
    login_subtitle: "Secure Access to Your Data Consents",
    signup_subtitle: "Start Managing Your Privacy Today",
    welcome_back: "Welcome back"
  },
  profile: {
    title: "Profile & Settings",
    subtitle: "Manage your account preferences and security logs.",
    account: "My Account",
    principal_id: "Principal ID",
    verified_email: "Verified Email",
    verified_mobile: "Verified Mobile",
    preferences: "System Preferences",
    lang_pref: "Preferred Digital Language",
    save: "Save Preferences",
    logs: "Security & Action Logs",
    save_success: "Preferences Saved Successfully!",
    verified_account: "Verified Account",
    verified_id: "Verified Identity",
    lang_hint: "Applies to DSR communications and email alerts.",
    logs_subtitle: "Audited log of your platform interactions"
  },
  nav: {
    overview: "Overview",
    consents: "My Consents",
    dsr: "DSR Management",
    grievance: "Grievance System",
    feedback: "Feedback",
    profile: "Profile",
    main_menu: "Main Menu",
    logout: "Logout"
  }
};

const translations = {
  en: keys,
  hi: {
    auth: { ...keys.auth, login: 'लॉगइन', signup: 'साइन अप', first_name: 'पहला नाम', last_name: 'अंतिम नाम', email: 'ईमेल पता', phone: 'फोन नंबर', password: 'पासवर्ड', forgot_password: 'पासवर्ड भूल गए?', no_account: 'खाता नहीं है?', have_account: 'क्या आपके पास पहले से खाता है?', continue: 'जारी रखें', otp_sent: 'आपके ईमेल पर ओटीपी भेजा गया', resend_otp: 'ओटीपी पुनः भेजें', verify_otp: 'ओटीपी सत्यापित करें', login_subtitle: 'आपके डेटा सहमति तक सुरक्षित पहुंच', signup_subtitle: 'आज ही अपनी गोपनीयता का प्रबंधन शुरू करें', welcome_back: 'आपका स्वागत है' },
    profile: { ...keys.profile, title: 'प्रोफ़ाइल और सेटिंग्स', subtitle: 'अपनी खाता प्राथमिकताओं और सुरक्षा लॉग का प्रबंधन करें।', account: 'मेरा खाता', principal_id: 'प्रिंसिपल आईडी', verified_email: 'सत्यापित ईमेल', verified_mobile: 'सत्यापित मोबाइल', preferences: 'सिस्टम प्राथमिकताएं', lang_pref: 'पसंदीदा डिजिटल भाषा', save: 'प्राथमिकताएं सहेजें', logs: 'सुरक्षा और कार्रवाई लॉग', save_success: 'प्राथमिकताएं सफलतापूर्वक सहेजी गईं!', verified_account: 'सत्यापित खाता', verified_id: 'सत्यापित पहचान', lang_hint: 'DSR संचार और ईमेल अलर्ट पर लागू होता है।', logs_subtitle: 'आपके प्लेटफ़ॉर्म इंटरैक्शन का ऑडिटेड लॉग' },
    nav: { ...keys.nav, overview: 'अवलोकन', consents: 'मेरी सहमति', dsr: 'डीएसआर प्रबंधन', grievance: 'शिकायत प्रणाली', feedback: 'प्रतिक्रिया', profile: 'प्रोफ़ाइल', main_menu: 'मुख्य मेनू', logout: 'लॉगआउट' }
  },
  ur: {
    auth: { ...keys.auth, login: 'لاگ ان', signup: 'سائن اپ', first_name: 'پہلا نام', last_name: 'آخری نام', email: 'ای میل، پتہ', phone: 'فون نمبر', continue: 'جاری رکھیں', otp_sent: 'او ٹی پی بھیج دیا گیا', verify_otp: 'او ٹی پی کی تصدیق کریں', welcome_back: 'خوش آمدید' },
    profile: { ...keys.profile, title: 'پروفائل اور ترتیبات', account: 'میرا اکاؤنٹ', save: 'محفوظ کریں', logs: 'سیکیورٹی لاگز' },
    nav: { ...keys.nav, overview: 'جائزہ', consents: 'میری رضامندیاں', profile: 'پروفائل', logout: 'لاگ آؤٹ' }
  },
  bn: {
    auth: { ...keys.auth, login: 'লগইন', signup: 'সাইন আপ', first_name: 'নাম', last_name: 'পদবি', email: 'ইমেইল ঠিকানা', phone: 'ফোন নম্বর', continue: 'চালিয়ে যান', otp_sent: 'ওটিপি পাঠানো হয়েছে', verify_otp: 'ওটিপি যাচাই করুন', welcome_back: 'আবার স্বাগতম' },
    profile: { ...keys.profile, title: 'প্রোফাইল এবং সেটিংস', account: 'আমার অ্যাকাউন্ট', save: 'সংরক্ষণ করুন', logs: 'সুরক্ষা লগ' },
    nav: { ...keys.nav, overview: 'ওভারভিউ', consents: 'আমার সম্মতি', profile: 'প্রোফাইল', logout: 'লগআউট' }
  },
  te: {
    auth: { ...keys.auth, login: 'లాగిన్', signup: 'సైన్ అప్', first_name: 'మొదటి పేరు', last_name: 'చివరి పేరు', email: 'ఇమెయిల్', phone: 'ఫోన్ నంబర్', continue: 'కొనసాగించు', otp_sent: 'OTP పంపబడింది', verify_otp: 'OTP ధృవీకరించు', welcome_back: 'తిరిగి స్వాగతం' },
    profile: { ...keys.profile, title: 'ప్రొఫైల్ & సెట్టింగ్‌లు', account: 'నా ఖాతా', save: 'సేవ్ చేయి', logs: 'భద్రతా లాగ్‌లు' },
    nav: { ...keys.nav, overview: 'అవలోకనం', consents: 'నా సమ్మతులు', profile: 'ప్రొఫైల్', logout: 'లాగ్అవుట్' }
  },
  mr: {
    auth: { ...keys.auth, login: 'लॉगिन', signup: 'साइन अप', first_name: 'पहिले नाव', last_name: 'आडनाव', email: 'ईमेल', phone: 'फोन नंबर', continue: 'पुढे जा', otp_sent: 'OTP पाठवला', verify_otp: 'OTP सत्यापित करा', welcome_back: 'परत स्वागत आहे' },
    profile: { ...keys.profile, title: 'प्रोफाइल आणि सेटिंग्ज', account: 'माझे खाते', save: 'जतन करा', logs: 'सुरक्षा लॉग' },
    nav: { ...keys.nav, overview: 'आढावा', consents: 'माझ्या संमती', profile: 'प्रोफाइल', logout: 'लॉगआउट' }
  },
  ta: {
    auth: { ...keys.auth, login: 'உள்நுழை', signup: 'பதிவு செய்', first_name: 'முதல் பெயர்', last_name: 'கடைசி பெயர்', email: 'மின்னஞ்சல்', phone: 'தொலைபேசி', continue: 'தொடரவும்', otp_sent: 'OTP அனுப்பப்பட்டது', verify_otp: 'OTP ஐ சரிபார்க்கவும்', welcome_back: 'மீண்டும் வரவேற்கிறோம்' },
    profile: { ...keys.profile, title: 'சுயவிவரம் & அமைப்புகள்', account: 'என் கணக்கு', save: 'சேமி', logs: 'பாதுகாப்பு பதிவுகள்' },
    nav: { ...keys.nav, overview: 'கண்ணோட்டம்', consents: 'எனது ஒப்புதல்கள்', profile: 'சுயவிவரம்', logout: 'வெளியேறு' }
  },
  gu: {
    auth: { ...keys.auth, login: 'લૉગિન', signup: 'સાઇન અપ', first_name: 'પ્રથમ નામ', last_name: 'અંતિમ નામ', email: 'ઇમેઇલ', phone: 'ફોન નંબર', continue: 'ચાલુ રાખો', otp_sent: 'OTP મોકલવામાં આવ્યો', verify_otp: 'OTP ચકાસો', welcome_back: 'પાછા સ્વાગત છે' },
    profile: { ...keys.profile, title: 'પ્રોફાઇલ અને સેટિંગ્સ', account: 'મારું એકાઉન્ટ', save: 'સાચવો', logs: 'સુરક્ષા લૉગ્સ' },
    nav: { ...keys.nav, overview: 'વિહંગાવલોકન', consents: 'મારી સંમતિ', profile: 'પ્રોફાઇલ', logout: 'લૉગઆઉટ' }
  },
  kn: {
    auth: { ...keys.auth, login: 'ಲಾಗಿನ್', signup: 'ಸೈನ್ ಅಪ್', first_name: 'ಹೆಸರು', last_name: 'ಉಪನಾಮ', email: 'ಇಮೇಲ್', phone: 'ಫೋನ್', continue: 'ಮುಂದುವರಿಸಿ', otp_sent: 'OTP ಕಳುಹಿಸಲಾಗಿದೆ', verify_otp: 'OTP ಪರಿಶೀಲಿಸಿ', welcome_back: 'ಮರಳಿ ಸ್ವಾಗತ' },
    profile: { ...keys.profile, title: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್ಸ್', account: 'ನನ್ನ ಖಾತೆ', save: 'ಉಳಿಸಿ', logs: 'ಭದ್ರತಾ ಲಾಗ್‌ಗಳು' },
    nav: { ...keys.nav, overview: 'ಅವಲೋಕನ', consents: 'ನನ್ನ ಸಮ್ಮತಿಗಳು', profile: 'ಪ್ರೊಫೈಲ್', logout: 'ಲಾಗ್ ಔಟ್' }
  },
  or: {
    auth: { ...keys.auth, login: 'ଲଗ୍ ଇନ୍', signup: 'ସାଇନ୍ ଅପ୍', first_name: 'ପ୍ରଥମ ନାମ', last_name: 'ଶେଷ ନାମ', email: 'ଇମେଲ୍', phone: 'ଫୋନ୍ ନମ୍ବର', continue: 'ଜାରି ରଖନ୍ତୁ', otp_sent: 'OTP ପଠାଗଲା', verify_otp: 'OTP ଯାଞ୍ଚ କରନ୍ତୁ', welcome_back: 'ସ୍ୱାଗତମ୍' },
    profile: { ...keys.profile, title: 'ପ୍ରୋଫାଇଲ୍ ଏବଂ ସେଟିଂସମୂହ', account: 'ମୋ ଆକାଉଣ୍ଟ୍', save: 'ସେଭ୍ କରନ୍ତୁ', logs: 'ସୁରକ୍ଷା ଲଗ୍' },
    nav: { ...keys.nav, overview: 'ଓଭରଭ୍ୟୁ', consents: 'ମୋର ସମ୍ମତି', profile: 'ପ୍ରୋଫାଇଲ୍', logout: 'ଲଗଆଉଟ୍' }
  },
  ml: {
    auth: { ...keys.auth, login: 'ലോഗിൻ', signup: 'സൈൻ അപ്പ്', first_name: 'പേര്', last_name: 'കുടുംബപ്പേര്', email: 'ഇമെയിൽ', phone: 'ഫോൺ', continue: 'തുടരുക', otp_sent: 'OTP അയച്ചു', verify_otp: 'OTP പരിശോധിക്കുക', welcome_back: 'വീണ്ടും സ്വാഗതം' },
    profile: { ...keys.profile, title: 'പ്രൊഫൈൽ & ക്രമീകരണങ്ങൾ', account: 'എൻ്റെ അക്കൗണ്ട്', save: 'സംരക്ഷിക്കുക', logs: 'സുരക്ഷാ ലോഗുകൾ' },
    nav: { ...keys.nav, overview: 'അവലോകനം', consents: 'എന്റെ സമ്മതങ്ങൾ', profile: 'പ്രൊഫൈൽ', logout: 'ലോഗൗട്ട്' }
  },
  pa: {
    auth: { ...keys.auth, login: 'ਲਾਗਇਨ', signup: 'ਸਾਈਨ ਅੱਪ', first_name: 'ਪਹਿਲਾ ਨਾਂ', last_name: 'ਆਖਰੀ ਨਾਂ', email: 'ਈਮੇਲ', phone: 'ਫੋਨ ਨੰਬਰ', continue: 'ਜਾਰੀ ਰੱਖੋ', otp_sent: 'OTP ਭੇਜਿਆ ਗਿਆ', verify_otp: 'OTP ਦੀ ਪੜਤਾਲ ਕਰੋ', welcome_back: 'ਜੀ ਆਇਆਂ ਨੂੰ' },
    profile: { ...keys.profile, title: 'ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੈਟਿੰਗਾਂ', account: 'ਮੇਰਾ ਖਾਤਾ', save: 'ਸੁਰੱਖਿਅਤ ਕਰੋ', logs: 'ਸੁਰੱਖਿਆ ਲੌਗ' },
    nav: { ...keys.nav, overview: 'ਅਵਲੋਕਨ', consents: 'ਮੇਰੀਆਂ ਸਹਿਮਤੀਆਂ', profile: 'ਪ੍ਰੋਫਾਈਲ', logout: 'ਲਾਗ ਆਉਟ' }
  },
  as: {
    auth: { ...keys.auth, login: 'লগইন', signup: 'চাইন আপ', first_name: 'নাম', last_name: 'উপাধি', email: 'ইমেইল', phone: 'ফোন নম্বৰ', continue: 'অব্যাহত ৰাখক', otp_sent: 'OTP পঠোৱা হ’ল', verify_otp: 'OTP প্ৰমাণীকৰণ কৰক', welcome_back: 'আকৌ স্বাগতম' },
    profile: { ...keys.profile, title: 'প্ৰফাইল আৰু ছেটিংছ', account: 'মোৰ একাউন্ট', save: 'সংৰক্ষণ কৰক', logs: 'সুৰক্ষা লগ' },
    nav: { ...keys.nav, overview: 'অৱলোকন', consents: 'মোৰ সন্মতি', profile: 'প্ৰফাইল', logout: 'লগআউট' }
  },
  mai: {
    auth: { ...keys.auth, login: 'लॉगिन', signup: 'साइन अप', first_name: 'नाम', last_name: 'उपनाम', email: 'ईमेल', phone: 'फोन', continue: 'जारी राखू', otp_sent: 'OTP पठाओल गेल', verify_otp: 'OTP सत्यापित करू', welcome_back: 'वापस स्वागत अछि' },
    profile: { ...keys.profile, title: 'प्रोफाइल आ सेटिंग्स', account: 'हमर खाता', save: 'सहेजू', logs: 'सुरक्षा लॉग' },
    nav: { ...keys.nav, overview: 'अवलोकन', consents: 'हमर सहमति', profile: 'प्रोफाइल', logout: 'लॉगआउट' }
  },
  sat: {
    auth: { ...keys.auth, login: 'ᱞᱚᱜᱽ ᱤᱱ', signup: 'ᱥᱟᱭᱤᱱ ᱟᱯ', first_name: 'ᱧᱩᱛᱩᱢ', last_name: 'ᱯᱟᱹᱨᱤᱥ', email: 'ᱤ-ᱢᱮᱞ', phone: 'ᱯᱷᱚᱱ', continue: 'ᱞᱟᱦᱟᱜ ᱢᱮ', otp_sent: 'OTP ᱵᱷᱮᱡᱟ ᱮᱱᱟ', verify_otp: 'OTP ᱯᱚᱨᱢᱟᱱ ᱢᱮ', welcome_back: 'ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ' },
    profile: { ...keys.profile, title: 'ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱟᱨ ᱥᱮᱴᱤᱝᱥ', account: 'ᱤᱧᱟᱜ ᱮᱠᱟᱣᱩᱱᱴ', save: 'ᱥᱟᱧᱪᱟᱣ', logs: 'ᱥᱤᱠᱤᱣᱨᱤᱴᱤ ᱞᱚᱜᱽ' },
    nav: { ...keys.nav, overview: 'ᱚᱵᱷᱟᱨᱵᱷᱤᱭᱩ', consents: 'ᱤᱧᱟᱜ ᱦᱮᱸᱥᱟᱹᱨᱤ', profile: 'ᱯᱨᱚᱯᱷᱟᱭᱤᱞ', logout: 'ᱞᱚᱜᱽ ᱟᱣᱩᱴ' }
  },
  ks: {
    auth: { ...keys.auth, login: 'لاگ ان', signup: 'سائن اپ', first_name: 'ناو', last_name: 'ذات', email: 'ای میل', phone: 'فون', continue: 'جٲری تھٲوِو', otp_sent: 'OTP سوزنہٕ آو', verify_otp: 'OTP تصدیق کٔرِو', welcome_back: 'خوش آمدید' },
    profile: { ...keys.profile, title: 'پروفائل تہٕ سیٹنگز', account: 'میون اکاؤنٹ', save: 'محفوظ کٔرِو', logs: 'سیکیورٹی لاگز' },
    nav: { ...keys.nav, overview: 'جائزہ', consents: 'میٲنی رضامندی', profile: 'پروفائل', logout: 'لاگ آؤٹ' }
  },
  ne: {
    auth: { ...keys.auth, login: 'लगइन', signup: 'साइन अप', first_name: 'नाम', last_name: 'थर', email: 'इमेल', phone: 'फोन', continue: 'जारी राख्नुहोस्', otp_sent: 'OTP पठाइयो', verify_otp: 'OTP प्रमाणित गर्नुहोस्', welcome_back: 'फेरि स्वागत छ' },
    profile: { ...keys.profile, title: 'प्रोफाइल र सेटिङहरू', account: 'मेरो खाता', save: 'बचत गर्नुहोस्', logs: 'सुरक्षा लगहरू' },
    nav: { ...keys.nav, overview: 'सिंहावलोकन', consents: 'मेरो सहमतिहरू', profile: 'प्रोफाइल', logout: 'लगआउट' }
  },
  kok: {
    auth: { ...keys.auth, login: 'लाॅगीन', signup: 'साइन अप', first_name: 'नांव', last_name: 'आडनांव', email: 'ईमेल', phone: 'फोन', continue: 'मुखार वचात', otp_sent: 'OTP धाडलो', verify_otp: 'OTP तपासात', welcome_back: 'परत स्वागत आसा' },
    profile: { ...keys.profile, title: 'प्रोफायल आनी सेटींग्ज', account: 'म्हाजें खातें', save: 'सांबाळात', logs: 'सुरक्षा लाॅग्स' },
    nav: { ...keys.nav, overview: 'आढावो', consents: 'म्हाज्यो संमती', profile: 'प्रोफायल', logout: 'लाॅगआऊट' }
  },
  sd: {
    auth: { ...keys.auth, login: 'لاگ ان', signup: 'سائن اپ', first_name: 'نالو', last_name: 'ذات', email: 'اي ميل', phone: 'فون', continue: 'جاري رکو', otp_sent: 'OTP موڪليو ويو', verify_otp: 'OTP تصديق ڪريو', welcome_back: 'ڀلي ڪري آيا' },
    profile: { ...keys.profile, title: 'پروفائيل ۽ سيٽنگون', account: 'منهنجو اڪائونٽ', save: 'محفوظ ڪريو', logs: 'سيڪيورٽي لاگز' },
    nav: { ...keys.nav, overview: 'جائزو', consents: 'منهنجون رضامنديون', profile: 'پروفائيل', logout: 'لاگ آئوٽ' }
  },
  doi: {
    auth: { ...keys.auth, login: 'लागिन', signup: 'साइन अप', first_name: 'नां', last_name: 'उपनां', email: 'ईमेल', phone: 'फोन', continue: 'जारी रक्खो', otp_sent: 'OTP भेजिता', verify_otp: 'OTP दी पश्ताल करो', welcome_back: 'परतियै स्वागत ऐ' },
    profile: { ...keys.profile, title: 'प्रोफाइल ते सैटिंगां', account: 'मेरा खाता', save: 'सहेजो', logs: 'सुरक्षा लाग्ग' },
    nav: { ...keys.nav, overview: 'सार', consents: 'मेरी सहमतियां', profile: 'प्रोफाइल', logout: 'लागआउट' }
  },
  mni: {
    auth: { ...keys.auth, login: 'লগইন', signup: 'সাইন অপ', first_name: 'মিং', last_name: 'সগে', email: 'ইমেল', phone: 'ফোন', continue: 'মখা চত্থবা', otp_sent: 'OTP থাখ্রে', verify_otp: 'OTP য়েংবা', welcome_back: 'তরাম্না ওকচরি' },
    profile: { ...keys.profile, title: 'প্রোফাইল অমসুং সেটিং', account: 'ঐগী একাউন্ট', save: 'সেভ তৌবা', logs: 'সেক্যুরিটি লগ' },
    nav: { ...keys.nav, overview: 'ওভরভ্যু', consents: 'ঐগী অয়াবশিং', profile: 'প্রোফাইল', logout: 'লগআউট' }
  },
  brx: {
    auth: { ...keys.auth, login: 'लgin', signup: 'साइन अप', first_name: 'मुं', last_name: 'आफि', email: 'इमेल', phone: 'फोन', continue: 'जागायनो', otp_sent: 'OTP हरबाय', verify_otp: 'OTP नायबिजिर', welcome_back: 'बरायबाय' },
    profile: { ...keys.profile, title: 'प्रफाइल आरो सेटिंस', account: 'आंनि एकाउन्ट', save: 'सेभ खालाम', logs: 'निरापद लग' },
    nav: { ...keys.nav, overview: 'नोजोर', consents: 'आंनि गनायथि', profile: 'प्रफाइल', logout: 'लगआउट' }
  }
};

Object.entries(translations).forEach(([lang, data]) => {
  const fileData = JSON.stringify(data, null, 2);
  fs.writeFileSync(path.join(localesDir, `${lang}.json`), fileData);
});

console.log('Successfully generated JSON files for 22 languages.');
