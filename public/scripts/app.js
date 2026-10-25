/* global window, document, fetch */
(function initApp() {
  console.log('app loaded');
  console.log('district element', document.getElementById('filterDistrict'));
  console.log('grade element', document.getElementById('filterGrade'));
  console.log('boot elements', {
    district: !!document.getElementById('filterDistrict'),
    schoolInput: !!document.getElementById('schoolInput'),
    schoolList: !!document.getElementById('schoolList'),
    grade: !!document.getElementById('filterGrade'),
    date: !!document.getElementById('filterDate'),
    role: !!document.getElementById('filterRole'),
    resultsMount: !!document.getElementById('resultsMount'),
  });

  const els = {
    date: document.getElementById('filterDate'),
    district: document.getElementById('filterDistrict'),
    schoolInput: document.getElementById('schoolInput'),
    schoolList: document.getElementById('schoolList'),
    clearSchool: document.getElementById('clearSchool'),
    grade: document.getElementById('filterGrade'),
    role: document.getElementById('filterRole'),
    clear: document.getElementById('clearFilters'),
    search: document.getElementById('searchBtn'),
    language: document.getElementById('languageSelect'),
    filtersForm: document.getElementById('filtersForm'),
    k8ProgramButton: document.getElementById('k8ProgramButton'),
    prekProgramButton: document.getElementById('prekProgramButton'),
    filters: document.getElementById('filters'),
    prekResources: document.getElementById('prekResources'),
    resultsDivider: document.getElementById('resultsDivider'),
    results: document.getElementById('results'),
    feedbackSection: document.getElementById('feedbackSection'),
    roleIntroMount: document.getElementById('roleIntroMount'),
    resultsMount: document.getElementById('resultsMount'),
    roleOutroMount: document.getElementById('roleOutroMount'),
    resultsCount: document.getElementById('resultsCount'),
    cards: document.getElementById('cards'),
  };

  const state = {
    meta: null,
    schoolsByDistrict: {},
    gradesBySchool: {}, // key: "district|school" -> ['PK','K','1'...'12']
    modules: [],
    activeIndex: 0,
    selectedLanguage: 'en',
    selectedRole: '',
    lastContext: null,
    lastDetails: { eq: [], genres: [], books: [] },
    selectedProgram: 'k8',
  };

  const translations = {
    en: {
      heroTitle: 'NYC Reads Curriculum Finder',
      heroSubtitle: 'Discover curriculum, themes, and reading materials for NYC schools',
      aboutTitle: 'About This Tool',
      aboutIntro: 'This curriculum search tool helps identify exactly what students are learning in literacy at a given school — including the curriculum, current module, essential questions, and book lists.',
      disclaimerLabel: 'Disclaimer:',
      disclaimerText: 'This tool is intended to provide general information about district and school curriculum implementation. Timelines and materials may vary by school or classroom. For the most accurate and up-to-date information, please contact your school directly.',
      translationNotice: 'To make this site more accessible, we have used generative artificial intelligence to create the translation you are currently reading. We acknowledge these translations are imperfect, so we greatly appreciate your understanding. Please submit a feedback form or contact your school officials if you come across major errors, so we can do our best to fix them.',
      filtersTitle: 'K-8 Find Your Curriculum',
      k8Program: 'K-8',
      prekProgram: 'Pre-K & 3K',
      prekTitle: 'Pre-K & 3K Resources',
      prekMessage: 'The NYC Reads Curriculum Finder Team is actively working to incorporate resources for 3K and Pre-K students into our website. Please check back in the future for updates. For now, you can find more information at: ',
      prekLink: 'Pre-K/3K Build a Reading Routine',
      districtLabel: 'District',
      schoolLabel: 'School',
      schoolPlaceholder: 'Type to search schools…',
      clearSchoolAria: 'Clear school',
      gradeLabel: 'Grade Level',
      dateLabel: 'Date',
      dateHint: '(We’ll find the curriculum module for this date)',
      roleLabel: 'Role',
      languageLabel: 'Language',
      programLabel: 'Curriculum program',
      allDistricts: 'All Districts',
      allGrades: 'All Grades',
      allRoles: 'All Roles',
      roleOst: 'OST/Afterschool Provider',
      roleParent: 'Parent or Caregiver',
      roleSchool: 'School Leader or Teacher',
      clearBtn: 'Clear',
      searchBtn: 'Find Curriculum',
      searchingBtn: 'Searching…',
      resultsTitle: 'Curriculum Information',
      feedbackTitle: 'Help Us Improve',
      feedbackPrompt: 'Is your school missing or something not quite right?',
      feedbackButton: 'Submit Feedback Form →',
      feedbackNote: 'We review submissions regularly and use them to improve the tool.',
      noScript: 'This site requires JavaScript to function. Please enable JavaScript in your browser.',
      noDataSheet: 'No data. Please check the connected Google Sheet.',
      noDataMeta: 'No data. Unable to load metadata.',
      noResults: 'No results. Try adjusting filters or date.',
      noResultsGeneric: 'Not Available',
      searchError: 'Unable to load search results. Please try again.',
      schoolRequired: 'Please select a school to search.',
      gradeRequired: 'Please select a grade level to search.',
      dateRequired: 'Please select a date to search.',
      schoolInformation: 'School Information',
      moduleInformation: 'Module Information',
      essentialQuestions: 'Essential Questions',
      textGenres: 'Text Genres',
      readingList: 'Reading List',
      schoolField: 'School:',
      gradeField: 'Grade:',
      districtField: 'District:',
      curriculumField: 'Curriculum:',
      moduleField: 'Module:',
      themeField: 'Theme:',
      dateRangeField: 'Date Range:',
      prevBtn: '‹ Previous',
      nextBtn: 'Next ›',
      dataSource: 'Data Source:',
      highSchoolUnavailable: 'NYC Reads is currently focused on grades K–8. Curriculum information and reading lists for grades 9–12 are not yet available in this tool.',
      learnMoreHere: 'To learn more about NYC Reads, click here.'
    },
    es: {
      heroTitle: 'Buscador de Curriculo NYC Reads',
      heroSubtitle: 'Descubre curriculo, temas y materiales de lectura para las escuelas de NYC',
      aboutTitle: 'Acerca de esta herramienta',
      aboutIntro: 'Esta herramienta ayuda a identificar exactamente lo que estudian los estudiantes en alfabetizacion en una escuela determinada, incluido el curriculo, el modulo actual, las preguntas esenciales y las listas de lectura.',
      disclaimerLabel: 'Aviso:',
      disclaimerText: 'Esta herramienta ofrece informacion general sobre la implementacion del curriculo por distrito y escuela. Los tiempos y materiales pueden variar segun la escuela o el salon. Para obtener la informacion mas precisa y actualizada, comunicate directamente con tu escuela.',
      translationNotice: 'Para que este sitio sea más accesible, hemos utilizado inteligencia artificial generativa para crear la traducción que está leyendo. Reconocemos que estas traducciones son imperfectas y agradecemos mucho su comprensión. Envíe un formulario de comentarios o comuníquese con las autoridades de su escuela si encuentra errores importantes, para que podamos hacer todo lo posible por corregirlos.',
      filtersTitle: 'K-8: Encuentra tu curriculo',
      k8Program: 'K-8',
      prekProgram: 'Pre-K y 3K',
      prekTitle: 'Recursos de Pre-K y 3K',
      prekMessage: 'El equipo de NYC Reads Curriculum Finder esta trabajando activamente para incorporar recursos para estudiantes de 3K y Pre-K en nuestro sitio web. Vuelve a consultar mas adelante para ver las novedades. Por ahora, puedes encontrar mas informacion aqui: ',
      prekLink: 'Pre-K/3K Build a Reading Routine',
      districtLabel: 'Distrito',
      schoolLabel: 'Escuela',
      schoolPlaceholder: 'Escribe para buscar escuelas…',
      clearSchoolAria: 'Borrar escuela',
      gradeLabel: 'Grado',
      dateLabel: 'Fecha',
      dateHint: '(Encontraremos el modulo curricular para esta fecha)',
      roleLabel: 'Rol',
      languageLabel: 'Idioma',
      programLabel: 'Programa curricular',
      allDistricts: 'Todos los distritos',
      allGrades: 'Todos los grados',
      allRoles: 'Todos los roles',
      roleOst: 'Proveedor OST/Despues de clases',
      roleParent: 'Padre, madre o cuidador',
      roleSchool: 'Lider escolar o maestro',
      clearBtn: 'Borrar',
      searchBtn: 'Buscar curriculo',
      searchingBtn: 'Buscando…',
      resultsTitle: 'Informacion curricular',
      feedbackTitle: 'Ayudanos a mejorar',
      feedbackPrompt: '¿Falta tu escuela o algo no esta del todo bien?',
      feedbackButton: 'Enviar formulario de comentarios →',
      feedbackNote: 'Revisamos las respuestas regularmente y las usamos para mejorar la herramienta.',
      noScript: 'Este sitio requiere JavaScript para funcionar. Activa JavaScript en tu navegador.',
      noDataSheet: 'No hay datos. Revisa la hoja de calculo conectada.',
      noDataMeta: 'No hay datos. No se pudo cargar la informacion.',
      noResults: 'No hay resultados. Intenta ajustar los filtros o la fecha.',
      noResultsGeneric: 'No disponible',
      searchError: 'No se pudieron cargar los resultados de la busqueda. Intentalo de nuevo.',
      schoolRequired: 'Selecciona una escuela para buscar.',
      gradeRequired: 'Selecciona un grado para buscar.',
      dateRequired: 'Selecciona una fecha para buscar.',
      schoolInformation: 'Informacion escolar',
      moduleInformation: 'Informacion del modulo',
      essentialQuestions: 'Preguntas esenciales',
      textGenres: 'Generos de texto',
      readingList: 'Lista de lectura',
      schoolField: 'Escuela:',
      gradeField: 'Grado:',
      districtField: 'Distrito:',
      curriculumField: 'Curriculo:',
      moduleField: 'Modulo:',
      themeField: 'Tema:',
      dateRangeField: 'Rango de fechas:',
      prevBtn: '‹ Anterior',
      nextBtn: 'Siguiente ›',
      dataSource: 'Fuente de datos:',
      highSchoolUnavailable: 'NYC Reads actualmente se enfoca en los grados K–8. La informacion curricular y las listas de lectura para los grados 9–12 aun no estan disponibles en esta herramienta.',
      learnMoreHere: 'Para obtener mas informacion sobre NYC Reads, haz clic aqui.'
    },
    ar: {
      languageLabel: 'اللغة',
      programLabel: 'البرنامج الدراسي',
      heroSubtitle: 'اكتشف المناهج والموضوعات ومواد القراءة لمدارس مدينة نيويورك',
      aboutTitle: 'حول هذه الأداة',
      filtersTitle: 'اعثر على منهجك للصفوف K-8',
      k8Program: 'K-8',
      prekProgram: 'ما قبل الروضة و3K',
      prekTitle: 'موارد ما قبل الروضة و3K',
      districtLabel: 'المنطقة التعليمية',
      schoolLabel: 'المدرسة',
      schoolPlaceholder: 'اكتب للبحث عن المدارس…',
      clearSchoolAria: 'مسح المدرسة',
      gradeLabel: 'الصف الدراسي',
      dateLabel: 'التاريخ',
      dateHint: '(سنجد وحدة المنهج لهذا التاريخ)',
      roleLabel: 'الدور',
      allDistricts: 'جميع المناطق',
      allGrades: 'جميع الصفوف',
      allRoles: 'جميع الأدوار',
      roleOst: 'مقدم خدمات ما بعد المدرسة',
      roleParent: 'ولي أمر أو مقدم رعاية',
      roleSchool: 'قائد مدرسة أو معلم',
      clearBtn: 'مسح',
      searchBtn: 'العثور على المنهج',
      searchingBtn: 'جارٍ البحث…',
      resultsTitle: 'معلومات المنهج',
      schoolInformation: 'معلومات المدرسة',
      moduleInformation: 'معلومات الوحدة',
      essentialQuestions: 'الأسئلة الأساسية',
      textGenres: 'أنواع النصوص',
      readingList: 'قائمة القراءة',
      schoolField: 'المدرسة:',
      gradeField: 'الصف:',
      districtField: 'المنطقة:',
      curriculumField: 'المنهج:',
      moduleField: 'الوحدة:',
      themeField: 'الموضوع:',
      dateRangeField: 'الفترة الزمنية:',
      prevBtn: '‹ السابق',
      nextBtn: 'التالي ›',
      noResults: 'لا توجد نتائج. جرّب تعديل عوامل التصفية أو التاريخ.',
      schoolRequired: 'يرجى اختيار مدرسة للبحث.',
      gradeRequired: 'يرجى اختيار صف دراسي للبحث.',
      dateRequired: 'يرجى اختيار تاريخ للبحث.',
      heroTitle: 'باحث مناهج NYC Reads',
      aboutIntro: 'تساعدك أداة البحث هذه على معرفة ما يتعلمه الطلاب في القراءة والكتابة في مدارسهم، بما في ذلك المنهج والوحدة الحالية والأسئلة الأساسية وقوائم الكتب.',
      disclaimerLabel: 'إخلاء المسؤولية:',
      disclaimerText: 'تقدم هذه الأداة معلومات عامة عن تطبيق المناهج في المناطق والمدارس. قد تختلف المواعيد والمواد حسب المدرسة أو الصف. للحصول على أحدث المعلومات، يرجى التواصل مباشرة مع مدرستك.',
      translationNotice: 'لجعل هذا الموقع أكثر سهولة في الاستخدام، استخدمنا الذكاء الاصطناعي التوليدي لإنشاء الترجمة التي تقرأها الآن. نقرّ بأن هذه الترجمات غير مثالية، ونقدّر تفهّمك كثيرًا. يُرجى إرسال نموذج الملاحظات أو التواصل مع مسؤولي مدرستك إذا صادفت أخطاء كبيرة، حتى نبذل قصارى جهدنا لإصلاحها.',
      prekMessage: 'يعمل فريق NYC Reads Curriculum Finder على إضافة موارد لطلاب 3K وPre-K. يرجى العودة لاحقًا للاطلاع على التحديثات. للمزيد من المعلومات الآن، راجع:',
      prekLink: 'Pre-K/3K: إنشاء روتين للقراءة',
      feedbackTitle: 'ساعدنا على التحسين',
      feedbackPrompt: 'هل مدرستك غير مدرجة أو هل هناك معلومات غير صحيحة؟',
      feedbackButton: 'إرسال نموذج الملاحظات ←',
      feedbackNote: 'نراجع الردود بانتظام ونستخدمها لتحسين الأداة.',
      noScript: 'يتطلب هذا الموقع تشغيل JavaScript. يرجى تفعيله في المتصفح.',
      noDataSheet: 'لا توجد بيانات. يرجى التحقق من جدول البيانات المرتبط.',
      noDataMeta: 'تعذر تحميل البيانات الوصفية.',
      noResultsGeneric: 'غير متوفر',
      searchError: 'تعذر تحميل نتائج البحث. يرجى المحاولة مرة أخرى.',
      dataSource: 'مصدر البيانات:',
      highSchoolUnavailable: 'يركز NYC Reads حاليًا على الصفوف K–8. معلومات المناهج وقوائم القراءة للصفوف 9–12 غير متوفرة في هذه الأداة.',
      learnMoreHere: 'لمعرفة المزيد عن NYC Reads، اضغط هنا.'
    },
    bn: {
      languageLabel: 'ভাষা',
      programLabel: 'পাঠ্যক্রমের প্রোগ্রাম',
      heroSubtitle: 'নিউ ইয়র্ক সিটির স্কুলের পাঠ্যক্রম, বিষয় এবং পড়ার উপকরণ খুঁজুন',
      aboutTitle: 'এই টুল সম্পর্কে',
      filtersTitle: 'K-8 পাঠ্যক্রম খুঁজুন',
      k8Program: 'K-8',
      prekProgram: 'প্রি-K ও 3K',
      prekTitle: 'প্রি-K ও 3K-এর উপকরণ',
      districtLabel: 'ডিস্ট্রিক্ট',
      schoolLabel: 'স্কুল',
      schoolPlaceholder: 'স্কুল খুঁজতে লিখুন…',
      clearSchoolAria: 'স্কুলের নাম মুছুন',
      gradeLabel: 'শ্রেণি',
      dateLabel: 'তারিখ',
      dateHint: '(এই তারিখের পাঠ্যক্রমের মডিউল খুঁজে দেব)',
      roleLabel: 'ভূমিকা',
      allDistricts: 'সব ডিস্ট্রিক্ট',
      allGrades: 'সব শ্রেণি',
      allRoles: 'সব ভূমিকা',
      roleOst: 'স্কুল-পরবর্তী কর্মসূচির প্রদানকারী',
      roleParent: 'অভিভাবক বা যত্নদাতা',
      roleSchool: 'স্কুলের নেতা বা শিক্ষক',
      clearBtn: 'মুছুন',
      searchBtn: 'পাঠ্যক্রম খুঁজুন',
      searchingBtn: 'খোঁজা হচ্ছে…',
      resultsTitle: 'পাঠ্যক্রমের তথ্য',
      schoolInformation: 'স্কুলের তথ্য',
      moduleInformation: 'মডিউলের তথ্য',
      essentialQuestions: 'মূল প্রশ্ন',
      textGenres: 'লেখার ধরন',
      readingList: 'পড়ার তালিকা',
      schoolField: 'স্কুল:',
      gradeField: 'শ্রেণি:',
      districtField: 'ডিস্ট্রিক্ট:',
      curriculumField: 'পাঠ্যক্রম:',
      moduleField: 'মডিউল:',
      themeField: 'বিষয়:',
      dateRangeField: 'তারিখের পরিসর:',
      prevBtn: '‹ আগের',
      nextBtn: 'পরের ›',
      noResults: 'কোনো ফলাফল নেই। ফিল্টার বা তারিখ পরিবর্তন করে দেখুন।',
      schoolRequired: 'অনুসন্ধানের জন্য একটি স্কুল বেছে নিন।',
      gradeRequired: 'অনুসন্ধানের জন্য একটি শ্রেণি বেছে নিন।',
      dateRequired: 'অনুসন্ধানের জন্য একটি তারিখ বেছে নিন।',
      heroTitle: 'NYC Reads পাঠ্যক্রম অনুসন্ধান',
      aboutIntro: 'এই টুলের মাধ্যমে শিক্ষার্থীরা স্কুলে সাক্ষরতার ক্ষেত্রে কী শিখছে—পাঠ্যক্রম, বর্তমান মডিউল, মূল প্রশ্ন ও বইয়ের তালিকা—তা খুঁজে পাওয়া যায়।',
      disclaimerLabel: 'দাবিত্যাগ:',
      disclaimerText: 'এই টুলে জেলা ও স্কুলের পাঠ্যক্রম বাস্তবায়ন সম্পর্কে সাধারণ তথ্য দেওয়া হয়। স্কুল বা শ্রেণিকক্ষ অনুযায়ী সময়সূচি ও উপকরণ ভিন্ন হতে পারে। সর্বশেষ তথ্যের জন্য সরাসরি স্কুলে যোগাযোগ করুন।',
      translationNotice: 'এই সাইটটি আরও সহজলভ্য করতে, আপনি যে অনুবাদটি পড়ছেন তা তৈরি করতে আমরা জেনারেটিভ কৃত্রিম বুদ্ধিমত্তা ব্যবহার করেছি। আমরা স্বীকার করি যে এই অনুবাদগুলো নিখুঁত নয়, তাই আপনার বোঝাপড়ার জন্য আন্তরিকভাবে কৃতজ্ঞ। বড় কোনো ভুল চোখে পড়লে অনুগ্রহ করে মতামত ফর্ম জমা দিন অথবা আপনার স্কুলের কর্মকর্তাদের সঙ্গে যোগাযোগ করুন, যাতে আমরা যথাসাধ্য তা সংশোধন করতে পারি।',
      prekMessage: 'NYC Reads Curriculum Finder টিম 3K ও প্রি-K শিক্ষার্থীদের জন্য উপকরণ যোগ করার কাজ করছে। আপডেটের জন্য পরে আবার দেখুন। আপাতত আরও তথ্য এখানে:',
      prekLink: 'প্রি-K/3K: পড়ার অভ্যাস গড়ে তুলুন',
      feedbackTitle: 'উন্নত করতে সাহায্য করুন',
      feedbackPrompt: 'আপনার স্কুল কি তালিকায় নেই, অথবা কোনো তথ্য ঠিক নয়?',
      feedbackButton: 'মতামত ফর্ম জমা দিন →',
      feedbackNote: 'আমরা নিয়মিত মতামত পর্যালোচনা করি এবং টুলটি উন্নত করতে ব্যবহার করি।',
      noScript: 'এই সাইটটি চালাতে JavaScript প্রয়োজন। ব্রাউজারে এটি চালু করুন।',
      noDataSheet: 'কোনো তথ্য নেই। সংযুক্ত স্প্রেডশিটটি পরীক্ষা করুন।',
      noDataMeta: 'তথ্য লোড করা যায়নি।',
      noResultsGeneric: 'উপলভ্য নয়',
      searchError: 'অনুসন্ধানের ফলাফল লোড করা যায়নি। আবার চেষ্টা করুন।',
      dataSource: 'তথ্যের উৎস:',
      highSchoolUnavailable: 'NYC Reads বর্তমানে K–8 শ্রেণিতে মনোযোগ দিচ্ছে। 9–12 শ্রেণির পাঠ্যক্রম ও পড়ার তালিকা এই টুলে নেই।',
      learnMoreHere: 'NYC Reads সম্পর্কে আরও জানতে এখানে ক্লিক করুন।'
    },
    fr: {
      languageLabel: 'Langue',
      programLabel: 'Programme scolaire',
      heroSubtitle: 'Découvrez les programmes, les thèmes et les lectures des écoles de New York',
      aboutTitle: 'À propos de cet outil',
      filtersTitle: 'Trouver votre programme scolaire K-8',
      k8Program: 'K-8',
      prekProgram: 'Pré-K et 3K',
      prekTitle: 'Ressources Pré-K et 3K',
      districtLabel: 'District',
      schoolLabel: 'École',
      schoolPlaceholder: 'Saisissez le nom d’une école…',
      clearSchoolAria: 'Effacer l’école',
      gradeLabel: 'Niveau scolaire',
      dateLabel: 'Date',
      dateHint: '(Nous trouverons le module correspondant à cette date)',
      roleLabel: 'Rôle',
      allDistricts: 'Tous les districts',
      allGrades: 'Tous les niveaux',
      allRoles: 'Tous les rôles',
      roleOst: 'Prestataire périscolaire',
      roleParent: 'Parent ou responsable',
      roleSchool: 'Direction ou personnel enseignant',
      clearBtn: 'Effacer',
      searchBtn: 'Trouver le programme',
      searchingBtn: 'Recherche…',
      resultsTitle: 'Informations sur le programme',
      schoolInformation: 'Informations sur l’école',
      moduleInformation: 'Informations sur le module',
      essentialQuestions: 'Questions essentielles',
      textGenres: 'Genres de textes',
      readingList: 'Liste de lecture',
      schoolField: 'École :',
      gradeField: 'Niveau :',
      districtField: 'District :',
      curriculumField: 'Programme :',
      moduleField: 'Module :',
      themeField: 'Thème :',
      dateRangeField: 'Période :',
      prevBtn: '‹ Précédent',
      nextBtn: 'Suivant ›',
      noResults: 'Aucun résultat. Essayez de modifier les filtres ou la date.',
      schoolRequired: 'Veuillez choisir une école.',
      gradeRequired: 'Veuillez choisir un niveau scolaire.',
      dateRequired: 'Veuillez choisir une date.',
      heroTitle: 'Recherche de programmes NYC Reads',
      aboutIntro: 'Cet outil aide à découvrir ce que les élèves apprennent en lecture et en écriture dans une école : programme, module actuel, questions essentielles et listes de livres.',
      disclaimerLabel: 'Avertissement :',
      disclaimerText: 'Cet outil fournit des informations générales sur les programmes des districts et des écoles. Les calendriers et les ressources peuvent varier. Pour obtenir les informations les plus récentes, contactez directement votre école.',
      translationNotice: 'Pour rendre ce site plus accessible, nous avons utilisé l’intelligence artificielle générative pour créer la traduction que vous lisez actuellement. Nous reconnaissons que ces traductions sont imparfaites et vous remercions de votre compréhension. Si vous repérez des erreurs importantes, veuillez envoyer un formulaire de commentaires ou contacter les responsables de votre école afin que nous puissions faire de notre mieux pour les corriger.',
      prekMessage: 'L’équipe NYC Reads Curriculum Finder travaille à ajouter des ressources pour les élèves de 3K et Pré-K. Revenez plus tard pour les mises à jour. En attendant, consultez :',
      prekLink: 'Pré-K/3K : instaurer une routine de lecture',
      feedbackTitle: 'Aidez-nous à améliorer cet outil',
      feedbackPrompt: 'Votre école est absente ou une information vous semble incorrecte ?',
      feedbackButton: 'Envoyer le formulaire de commentaires →',
      feedbackNote: 'Nous examinons régulièrement les réponses pour améliorer l’outil.',
      noScript: 'Ce site nécessite JavaScript. Veuillez l’activer dans votre navigateur.',
      noDataSheet: 'Aucune donnée. Vérifiez la feuille de calcul associée.',
      noDataMeta: 'Impossible de charger les métadonnées.',
      noResultsGeneric: 'Non disponible',
      searchError: 'Impossible de charger les résultats. Veuillez réessayer.',
      dataSource: 'Source des données :',
      highSchoolUnavailable: 'NYC Reads se concentre actuellement sur les classes K–8. Les programmes et listes de lecture des classes 9–12 ne sont pas encore disponibles dans cet outil.',
      learnMoreHere: 'Pour en savoir plus sur NYC Reads, cliquez ici.'
    },
    ht: {
      languageLabel: 'Lang',
      programLabel: 'Pwogram kourikoulòm',
      heroSubtitle: 'Dekouvri pwogram, sijè ak materyèl lekti pou lekòl Vil Nouyòk yo',
      aboutTitle: 'Konsènan zouti sa a',
      filtersTitle: 'Jwenn pwogram K-8 ou a',
      k8Program: 'K-8',
      prekProgram: 'Pre-K ak 3K',
      prekTitle: 'Resous Pre-K ak 3K',
      districtLabel: 'Distri',
      schoolLabel: 'Lekòl',
      schoolPlaceholder: 'Tape pou chèche lekòl…',
      clearSchoolAria: 'Efase lekòl la',
      gradeLabel: 'Nivo klas',
      dateLabel: 'Dat',
      dateHint: '(N ap jwenn modil pwogram pou dat sa a)',
      roleLabel: 'Wòl',
      allDistricts: 'Tout distri yo',
      allGrades: 'Tout klas yo',
      allRoles: 'Tout wòl yo',
      roleOst: 'Founisè aktivite apre lekòl',
      roleParent: 'Paran oswa moun k ap pran swen timoun',
      roleSchool: 'Responsab lekòl oswa pwofesè',
      clearBtn: 'Efase',
      searchBtn: 'Jwenn pwogram nan',
      searchingBtn: 'N ap chèche…',
      resultsTitle: 'Enfòmasyon sou pwogram nan',
      schoolInformation: 'Enfòmasyon sou lekòl la',
      moduleInformation: 'Enfòmasyon sou modil la',
      essentialQuestions: 'Kesyon esansyèl',
      textGenres: 'Kalite tèks',
      readingList: 'Lis lekti',
      schoolField: 'Lekòl:',
      gradeField: 'Klas:',
      districtField: 'Distri:',
      curriculumField: 'Pwogram:',
      moduleField: 'Modil:',
      themeField: 'Sijè:',
      dateRangeField: 'Peryòd dat:',
      prevBtn: '‹ Anvan',
      nextBtn: 'Apre ›',
      noResults: 'Pa gen rezilta. Eseye chanje filtè yo oswa dat la.',
      schoolRequired: 'Tanpri chwazi yon lekòl pou fè rechèch.',
      gradeRequired: 'Tanpri chwazi yon nivo klas pou fè rechèch.',
      dateRequired: 'Tanpri chwazi yon dat pou fè rechèch.',
      heroTitle: 'Chèche pwogram NYC Reads',
      aboutIntro: 'Zouti sa a ede w wè sa elèv yo ap aprann nan lekti ak ekriti nan yon lekòl: pwogram nan, modil aktyèl la, kesyon enpòtan yo ak lis liv yo.',
      disclaimerLabel: 'Nòt enpòtan:',
      disclaimerText: 'Zouti sa a bay enfòmasyon jeneral sou pwogram lekòl ak distri yo. Dat ak materyèl yo ka diferan selon lekòl oswa klas la. Pou enfòmasyon ki pi resan, kontakte lekòl ou dirèkteman.',
      translationNotice: 'Pou rann sit sa a pi aksesib, nou itilize entèlijans atifisyèl jeneratif pou kreye tradiksyon w ap li kounye a. Nou rekonèt tradiksyon sa yo pa pafè, epi nou apresye konpreyansyon ou anpil. Tanpri voye yon fòm kòmantè oswa kontakte responsab lekòl ou a si w jwenn gwo erè, pou nou ka fè tout sa nou kapab pou korije yo.',
      prekMessage: 'Ekip NYC Reads Curriculum Finder la ap travay pou ajoute resous pou timoun 3K ak Pre-K. Tounen pita pou jwenn mizajou. Pou kounye a, jwenn plis enfòmasyon isit la:',
      prekLink: 'Pre-K/3K: Kreye yon abitid lekti',
      feedbackTitle: 'Ede nou amelyore zouti a',
      feedbackPrompt: 'Lekòl ou a manke oswa gen yon bagay ki pa kòrèk?',
      feedbackButton: 'Voye fòm kòmantè a →',
      feedbackNote: 'Nou revize repons yo regilyèman pou amelyore zouti a.',
      noScript: 'Sit sa a bezwen JavaScript. Tanpri aktive l nan navigatè w la.',
      noDataSheet: 'Pa gen done. Tanpri verifye fèy kalkil ki konekte a.',
      noDataMeta: 'Nou pa kapab chaje enfòmasyon yo.',
      noResultsGeneric: 'Pa disponib',
      searchError: 'Nou pa kapab chaje rezilta rechèch yo. Eseye ankò.',
      dataSource: 'Sous done:',
      highSchoolUnavailable: 'NYC Reads konsantre kounye a sou klas K–8. Zouti sa a poko gen enfòmasyon sou pwogram ak lis lekti pou klas 9–12.',
      learnMoreHere: 'Pou aprann plis sou NYC Reads, klike la a.'
    },
    ko: {
      languageLabel: '언어',
      programLabel: '교육과정 프로그램',
      heroSubtitle: '뉴욕시 학교의 교육과정, 주제 및 읽기 자료를 찾아보세요',
      aboutTitle: '도구 소개',
      filtersTitle: 'K-8 교육과정 찾기',
      k8Program: 'K-8',
      prekProgram: '프리-K 및 3K',
      prekTitle: '프리-K 및 3K 자료',
      districtLabel: '교육구',
      schoolLabel: '학교',
      schoolPlaceholder: '학교를 검색하려면 입력하세요…',
      clearSchoolAria: '학교 지우기',
      gradeLabel: '학년',
      dateLabel: '날짜',
      dateHint: '(이 날짜에 해당하는 교육과정 모듈을 찾습니다)',
      roleLabel: '역할',
      allDistricts: '모든 교육구',
      allGrades: '모든 학년',
      allRoles: '모든 역할',
      roleOst: '방과 후 프로그램 제공자',
      roleParent: '부모 또는 보호자',
      roleSchool: '학교 관리자 또는 교사',
      clearBtn: '지우기',
      searchBtn: '교육과정 찾기',
      searchingBtn: '검색 중…',
      resultsTitle: '교육과정 정보',
      schoolInformation: '학교 정보',
      moduleInformation: '모듈 정보',
      essentialQuestions: '핵심 질문',
      textGenres: '텍스트 장르',
      readingList: '읽기 목록',
      schoolField: '학교:',
      gradeField: '학년:',
      districtField: '교육구:',
      curriculumField: '교육과정:',
      moduleField: '모듈:',
      themeField: '주제:',
      dateRangeField: '기간:',
      prevBtn: '‹ 이전',
      nextBtn: '다음 ›',
      noResults: '결과가 없습니다. 필터나 날짜를 변경해 보세요.',
      schoolRequired: '검색할 학교를 선택하세요.',
      gradeRequired: '검색할 학년을 선택하세요.',
      dateRequired: '검색할 날짜를 선택하세요.',
      heroTitle: 'NYC Reads 교육과정 검색',
      aboutIntro: '이 도구를 사용하면 학교에서 학생들이 배우는 읽기·쓰기 교육과정, 현재 모듈, 핵심 질문 및 도서 목록을 확인할 수 있습니다.',
      disclaimerLabel: '안내:',
      disclaimerText: '이 도구는 교육구와 학교의 교육과정 운영에 관한 일반 정보를 제공합니다. 일정과 자료는 학교나 교실에 따라 다를 수 있습니다. 최신 정보는 학교에 직접 문의하세요.',
      translationNotice: '이 사이트의 접근성을 높이기 위해 생성형 인공지능을 사용하여 현재 읽고 계신 번역을 만들었습니다. 번역이 완벽하지 않다는 점을 인정하며, 이해해 주셔서 진심으로 감사합니다. 큰 오류를 발견하시면 피드백 양식을 제출하거나 학교 관계자에게 문의해 주세요. 최선을 다해 수정하겠습니다.',
      prekMessage: 'NYC Reads Curriculum Finder 팀은 3K 및 프리-K 자료를 추가하고 있습니다. 업데이트를 위해 나중에 다시 확인하세요. 우선 자세한 내용은 다음을 참고하세요:',
      prekLink: '프리-K/3K: 독서 습관 만들기',
      feedbackTitle: '개선을 도와주세요',
      feedbackPrompt: '학교가 누락되었거나 정보가 정확하지 않나요?',
      feedbackButton: '피드백 양식 제출 →',
      feedbackNote: '정기적으로 의견을 검토하여 도구 개선에 반영합니다.',
      noScript: '이 사이트를 사용하려면 JavaScript가 필요합니다. 브라우저에서 활성화하세요.',
      noDataSheet: '데이터가 없습니다. 연결된 스프레드시트를 확인하세요.',
      noDataMeta: '메타데이터를 불러올 수 없습니다.',
      noResultsGeneric: '사용할 수 없음',
      searchError: '검색 결과를 불러오지 못했습니다. 다시 시도하세요.',
      dataSource: '데이터 출처:',
      highSchoolUnavailable: 'NYC Reads는 현재 K–8 학년에 중점을 두고 있습니다. 이 도구에서는 9–12학년 교육과정 및 도서 목록을 제공하지 않습니다.',
      learnMoreHere: 'NYC Reads에 대해 자세히 알아보려면 여기를 클릭하세요.'
    },
    zh: {
      languageLabel: '语言',
      programLabel: '课程项目',
      heroSubtitle: '查找纽约市学校的课程、主题和阅读材料',
      aboutTitle: '关于此工具',
      filtersTitle: '查找 K-8 课程',
      k8Program: 'K-8',
      prekProgram: '学前班和 3K',
      prekTitle: '学前班和 3K 资源',
      districtLabel: '学区',
      schoolLabel: '学校',
      schoolPlaceholder: '输入以搜索学校…',
      clearSchoolAria: '清除学校',
      gradeLabel: '年级',
      dateLabel: '日期',
      dateHint: '（我们将查找此日期对应的课程模块）',
      roleLabel: '身份',
      allDistricts: '所有学区',
      allGrades: '所有年级',
      allRoles: '所有身份',
      roleOst: '课后项目提供者',
      roleParent: '家长或照护者',
      roleSchool: '学校领导或教师',
      clearBtn: '清除',
      searchBtn: '查找课程',
      searchingBtn: '正在搜索…',
      resultsTitle: '课程信息',
      schoolInformation: '学校信息',
      moduleInformation: '模块信息',
      essentialQuestions: '核心问题',
      textGenres: '文本类型',
      readingList: '阅读清单',
      schoolField: '学校：',
      gradeField: '年级：',
      districtField: '学区：',
      curriculumField: '课程：',
      moduleField: '模块：',
      themeField: '主题：',
      dateRangeField: '日期范围：',
      prevBtn: '‹ 上一项',
      nextBtn: '下一项 ›',
      noResults: '没有结果。请尝试调整筛选条件或日期。',
      schoolRequired: '请选择要搜索的学校。',
      gradeRequired: '请选择要搜索的年级。',
      dateRequired: '请选择要搜索的日期。',
      heroTitle: 'NYC Reads 课程查询',
      aboutIntro: '此工具可帮助您了解学生在学校学习的读写内容，包括课程、当前单元、核心问题和书单。',
      disclaimerLabel: '免责声明：',
      disclaimerText: '此工具提供有关学区和学校课程实施的一般信息。时间安排和材料可能因学校或班级而异。请直接联系学校以获取最新信息。',
      translationNotice: '为了让本网站更易于使用，我们使用生成式人工智能制作了您正在阅读的译文。我们承认这些译文并不完美，非常感谢您的理解。如果您发现重大错误，请提交反馈表或联系学校工作人员，以便我们尽力修正。',
      prekMessage: 'NYC Reads Curriculum Finder 团队正在为 3K 和学前班学生添加资源。请稍后查看更新。目前可在此了解更多信息：',
      prekLink: '学前班/3K：建立阅读习惯',
      feedbackTitle: '帮助我们改进',
      feedbackPrompt: '没有找到您的学校，或发现信息不准确？',
      feedbackButton: '提交反馈表 →',
      feedbackNote: '我们会定期查看反馈并用于改进此工具。',
      noScript: '此网站需要 JavaScript 才能运行。请在浏览器中启用。',
      noDataSheet: '没有数据。请检查已连接的电子表格。',
      noDataMeta: '无法加载元数据。',
      noResultsGeneric: '暂无',
      searchError: '无法加载搜索结果。请重试。',
      dataSource: '数据来源：',
      highSchoolUnavailable: 'NYC Reads 目前主要面向 K–8 年级。此工具暂不提供 9–12 年级课程信息和阅读清单。',
      learnMoreHere: '点击此处了解更多 NYC Reads 信息。'
    },
    ru: {
      languageLabel: 'Язык',
      programLabel: 'Учебная программа',
      heroSubtitle: 'Ищите учебные программы, темы и материалы для чтения в школах Нью-Йорка',
      aboutTitle: 'Об инструменте',
      filtersTitle: 'Найдите программу для классов K–8',
      k8Program: 'K–8',
      prekProgram: 'Pre-K и 3K',
      prekTitle: 'Материалы для Pre-K и 3K',
      districtLabel: 'Округ',
      schoolLabel: 'Школа',
      schoolPlaceholder: 'Введите название школы…',
      clearSchoolAria: 'Очистить поле школы',
      gradeLabel: 'Класс',
      dateLabel: 'Дата',
      dateHint: '(Мы найдем модуль программы для этой даты)',
      roleLabel: 'Роль',
      allDistricts: 'Все округа',
      allGrades: 'Все классы',
      allRoles: 'Все роли',
      roleOst: 'Поставщик внешкольных программ',
      roleParent: 'Родитель или опекун',
      roleSchool: 'Руководитель школы или учитель',
      clearBtn: 'Очистить',
      searchBtn: 'Найти программу',
      searchingBtn: 'Поиск…',
      resultsTitle: 'Информация об учебной программе',
      schoolInformation: 'Информация о школе',
      moduleInformation: 'Информация о модуле',
      essentialQuestions: 'Основные вопросы',
      textGenres: 'Жанры текстов',
      readingList: 'Список для чтения',
      schoolField: 'Школа:',
      gradeField: 'Класс:',
      districtField: 'Округ:',
      curriculumField: 'Программа:',
      moduleField: 'Модуль:',
      themeField: 'Тема:',
      dateRangeField: 'Период:',
      prevBtn: '‹ Назад',
      nextBtn: 'Далее ›',
      noResults: 'Результатов нет. Попробуйте изменить фильтры или дату.',
      schoolRequired: 'Выберите школу для поиска.',
      gradeRequired: 'Выберите класс для поиска.',
      dateRequired: 'Выберите дату для поиска.',
      heroTitle: 'Поиск программ NYC Reads',
      aboutIntro: 'С помощью этого инструмента можно узнать, что ученики изучают в школе по чтению и письму: программу, текущий модуль, основные вопросы и списки книг.',
      disclaimerLabel: 'Отказ от ответственности:',
      disclaimerText: 'Инструмент содержит общую информацию о программах округов и школ. Сроки и материалы могут различаться. Чтобы узнать актуальную информацию, свяжитесь со школой напрямую.',
      translationNotice: 'Чтобы сделать сайт доступнее, мы использовали генеративный искусственный интеллект для создания перевода, который вы сейчас читаете. Мы признаём, что эти переводы несовершенны, и благодарим вас за понимание. Если вы заметили серьезные ошибки, отправьте форму отзыва или свяжитесь с представителями школы, чтобы мы могли постараться их исправить.',
      prekMessage: 'Команда NYC Reads Curriculum Finder добавляет материалы для учеников 3K и Pre-K. Позже вернитесь за обновлениями. А пока дополнительная информация доступна здесь:',
      prekLink: 'Pre-K/3K: формируем привычку читать',
      feedbackTitle: 'Помогите нам улучшить сервис',
      feedbackPrompt: 'Не нашли свою школу или заметили неточность?',
      feedbackButton: 'Отправить отзыв →',
      feedbackNote: 'Мы регулярно рассматриваем отзывы и используем их для улучшения инструмента.',
      noScript: 'Для работы сайта требуется JavaScript. Включите его в браузере.',
      noDataSheet: 'Данные отсутствуют. Проверьте подключенную таблицу.',
      noDataMeta: 'Не удалось загрузить метаданные.',
      noResultsGeneric: 'Недоступно',
      searchError: 'Не удалось загрузить результаты поиска. Повторите попытку.',
      dataSource: 'Источник данных:',
      highSchoolUnavailable: 'NYC Reads сейчас ориентирован на классы K–8. Информация о программах и списки чтения для классов 9–12 в этом инструменте пока недоступны.',
      learnMoreHere: 'Нажмите здесь, чтобы узнать больше о NYC Reads.'
    },
    ur: {
      languageLabel: 'زبان',
      programLabel: 'تعلیمی پروگرام',
      heroSubtitle: 'نیو یارک سٹی کے اسکولوں کے نصاب، موضوعات اور مطالعے کا مواد تلاش کریں',
      aboutTitle: 'اس ٹول کے بارے میں',
      filtersTitle: 'K-8 کا نصاب تلاش کریں',
      k8Program: 'K-8',
      prekProgram: 'پری-K اور 3K',
      prekTitle: 'پری-K اور 3K کے وسائل',
      districtLabel: 'ضلع',
      schoolLabel: 'اسکول',
      schoolPlaceholder: 'اسکول تلاش کرنے کے لیے لکھیں…',
      clearSchoolAria: 'اسکول کا نام مٹائیں',
      gradeLabel: 'جماعت',
      dateLabel: 'تاریخ',
      dateHint: '(ہم اس تاریخ کے لیے نصاب کا ماڈیول تلاش کریں گے)',
      roleLabel: 'کردار',
      allDistricts: 'تمام اضلاع',
      allGrades: 'تمام جماعتیں',
      allRoles: 'تمام کردار',
      roleOst: 'اسکول کے بعد کے پروگرام کا فراہم کنندہ',
      roleParent: 'والدین یا نگہداشت کرنے والا',
      roleSchool: 'اسکول رہنما یا استاد',
      clearBtn: 'مٹائیں',
      searchBtn: 'نصاب تلاش کریں',
      searchingBtn: 'تلاش جاری ہے…',
      resultsTitle: 'نصاب کی معلومات',
      schoolInformation: 'اسکول کی معلومات',
      moduleInformation: 'ماڈیول کی معلومات',
      essentialQuestions: 'اہم سوالات',
      textGenres: 'متن کی اقسام',
      readingList: 'مطالعے کی فہرست',
      schoolField: 'اسکول:',
      gradeField: 'جماعت:',
      districtField: 'ضلع:',
      curriculumField: 'نصاب:',
      moduleField: 'ماڈیول:',
      themeField: 'موضوع:',
      dateRangeField: 'مدت:',
      prevBtn: '‹ پچھلا',
      nextBtn: 'اگلا ›',
      noResults: 'کوئی نتیجہ نہیں۔ فلٹر یا تاریخ تبدیل کر کے دیکھیں۔',
      schoolRequired: 'تلاش کے لیے اسکول منتخب کریں۔',
      gradeRequired: 'تلاش کے لیے جماعت منتخب کریں۔',
      dateRequired: 'تلاش کے لیے تاریخ منتخب کریں۔',
      heroTitle: 'NYC Reads نصاب تلاش',
      aboutIntro: 'یہ ٹول آپ کو یہ جاننے میں مدد دیتا ہے کہ اسکول میں طلبہ خواندگی کے لیے کیا سیکھ رہے ہیں، بشمول نصاب، موجودہ ماڈیول، بنیادی سوالات اور کتابوں کی فہرست۔',
      disclaimerLabel: 'وضاحت:',
      disclaimerText: 'یہ ٹول ضلع اور اسکول میں نصاب کے نفاذ کے بارے میں عمومی معلومات فراہم کرتا ہے۔ اوقات اور مواد اسکول یا کلاس کے لحاظ سے مختلف ہو سکتے ہیں۔ تازہ ترین معلومات کے لیے اپنے اسکول سے براہ راست رابطہ کریں۔',
      translationNotice: 'اس سائٹ کو مزید قابلِ رسائی بنانے کے لیے، ہم نے آپ کے پڑھے جانے والے ترجمے کی تیاری میں تخلیقی مصنوعی ذہانت استعمال کی ہے۔ ہم تسلیم کرتے ہیں کہ یہ ترجمے مکمل طور پر درست نہیں، اور آپ کی سمجھ بوجھ کے لیے تہہ دل سے شکر گزار ہیں۔ اگر آپ کو بڑی غلطیاں نظر آئیں تو براہِ کرم رائے کا فارم جمع کریں یا اپنے اسکول کے حکام سے رابطہ کریں تاکہ ہم انہیں درست کرنے کی پوری کوشش کر سکیں۔',
      prekMessage: 'NYC Reads Curriculum Finder ٹیم 3K اور پری-K طلبہ کے لیے وسائل شامل کر رہی ہے۔ تازہ معلومات کے لیے بعد میں دوبارہ دیکھیں۔ فی الحال مزید معلومات یہاں ہیں:',
      prekLink: 'پری-K/3K: مطالعے کا معمول بنائیں',
      feedbackTitle: 'بہتری میں ہماری مدد کریں',
      feedbackPrompt: 'کیا آپ کا اسکول موجود نہیں یا کوئی معلومات درست نہیں؟',
      feedbackButton: 'رائے کا فارم جمع کریں ←',
      feedbackNote: 'ہم باقاعدگی سے جوابات کا جائزہ لیتے ہیں اور ٹول کو بہتر بنانے کے لیے استعمال کرتے ہیں۔',
      noScript: 'اس ویب سائٹ کے لیے JavaScript ضروری ہے۔ براہ کرم اسے براؤزر میں فعال کریں۔',
      noDataSheet: 'کوئی ڈیٹا نہیں۔ منسلک اسپریڈشیٹ چیک کریں۔',
      noDataMeta: 'میٹا ڈیٹا لوڈ نہیں ہو سکا۔',
      noResultsGeneric: 'دستیاب نہیں',
      searchError: 'تلاش کے نتائج لوڈ نہیں ہو سکے۔ دوبارہ کوشش کریں۔',
      dataSource: 'ڈیٹا کا ماخذ:',
      highSchoolUnavailable: 'NYC Reads فی الحال K–8 جماعتوں پر توجہ دیتا ہے۔ اس ٹول میں 9–12 جماعتوں کے نصاب اور مطالعے کی فہرستیں دستیاب نہیں ہیں۔',
      learnMoreHere: 'NYC Reads کے بارے میں مزید جاننے کے لیے یہاں کلک کریں۔'
    }
  };

  const parentCaregiverTranslations = {
    en: {
      title: 'How to Use the NYC Reads Curriculum Finder',
      intro: 'If you are a parent or caregiver, look up your child’s grade and see what they are learning about. You can:',
      tips: [
        'Read a book together on that topic using Sora (NYCPS’s digital library)',
        'Ask questions about the topic like, “What did you learn?” “What do you want to know more about?”',
        'Talk about the topic during your day (for example, notice plants on a walk if they are learning about trees)',
        'Find ways to learn more (watch a short video, visit the library, or look at pictures together)',
      ],
      readingIntro: 'The NYCPS Office of Library Services made these reading lists to help you support your child’s learning and interests. These are not the exact books your child reads in school, but they are great books to keep learning and reading, continuing at home. The books were chosen to match what students are learning, their interests, and to show many different people and experiences.',
      readingLinks: 'The links take you to the Citywide Digital Library on {{sora}}, NYCPS’s digital collection. Every NYC Public Schools student has free access to the Citywide Digital Library on Sora. It has eBooks, audiobooks, comics, and magazines for all students from Pre-K to 12th grade. If you have questions about logging into Sora, click here for {{prek}} or {{grades}}. You can also find many of these books at the New York Public Library (NYPL), Brooklyn Public Library (BPL), or Queens Public Library (QPL).',
      sora: 'Sora',
      prek: 'Pre-K–3',
      grades: 'Grades 4–12',
    },
    es: {
      title: 'Como usar el Buscador de Curriculo NYC Reads',
      intro: 'Si eres padre, madre o cuidador, busca el grado de tu hijo y mira lo que esta aprendiendo. Puedes:',
      tips: [
        'Leer juntos un libro sobre ese tema usando Sora (la biblioteca digital de NYCPS)',
        'Hacer preguntas sobre el tema como "¿Que aprendiste?" o "¿Que quieres saber mas?"',
        'Hablar del tema durante el dia',
        'Buscar maneras de aprender mas, como un video corto, una visita a la biblioteca o mirar imagenes juntos',
      ],
      readingIntro: 'La Oficina de Servicios Bibliotecarios de NYCPS preparo estas listas de lectura para ayudarte a apoyar el aprendizaje y los intereses de tu hijo. No son exactamente los libros que tu hijo lee en la escuela, pero son excelentes libros para seguir aprendiendo y leyendo en casa. Los libros fueron elegidos para conectar con lo que estudian los estudiantes, sus intereses y una variedad de personas y experiencias.',
      readingLinks: 'Los enlaces te llevan a la Biblioteca Digital de la Ciudad en {{sora}}, la coleccion digital de NYCPS. Cada estudiante de las Escuelas Publicas de NYC tiene acceso gratuito a la Biblioteca Digital de la Ciudad en Sora. Incluye libros electronicos, audiolibros, comics y revistas para estudiantes desde Pre-K hasta 12 grado. Si tienes preguntas sobre como iniciar sesion en Sora, haz clic aqui para {{prek}} o {{grades}}. Tambien puedes encontrar muchos de estos libros en la Biblioteca Publica de Nueva York (NYPL), la Biblioteca Publica de Brooklyn (BPL) o la Biblioteca Publica de Queens (QPL).',
      sora: 'Sora',
      prek: 'Pre-K–3',
      grades: 'Grados 4–12',
    },
    ar: {
      title: 'كيفية استخدام أداة البحث عن مناهج NYC Reads',
      intro: 'إذا كنت والدًا أو مقدم رعاية، فابحث عن صف طفلك وتعرّف على ما يتعلمه. يمكنك:',
      tips: [
        'قراءة كتاب معًا عن هذا الموضوع باستخدام Sora (المكتبة الرقمية لـ NYCPS)',
        'طرح أسئلة عن الموضوع، مثل: «ماذا تعلمت؟» و«ما الذي تريد معرفة المزيد عنه؟»',
        'التحدث عن الموضوع خلال يومكما (مثل ملاحظة النباتات أثناء المشي إذا كان طفلك يتعلم عن الأشجار)',
        'البحث عن طرق لمعرفة المزيد (مشاهدة فيديو قصير، أو زيارة المكتبة، أو مشاهدة الصور معًا)',
      ],
      readingIntro: 'أعدّ مكتب خدمات المكتبات في NYCPS قوائم القراءة هذه لمساعدتك على دعم تعلّم طفلك واهتماماته. هذه ليست الكتب نفسها التي يقرأها طفلك في المدرسة، لكنها كتب رائعة لمواصلة التعلّم والقراءة في المنزل. اختيرت الكتب لتتوافق مع ما يتعلمه الطلاب واهتماماتهم، ولتعرّفهم على أشخاص وتجارب متنوعة.',
      readingLinks: 'تنقلك الروابط إلى المكتبة الرقمية على {{sora}}، وهي المجموعة الرقمية لـ NYCPS. يستطيع جميع طلاب مدارس مدينة نيويورك استخدام المكتبة الرقمية مجانًا. تضم كتبًا إلكترونية وكتبًا صوتية وقصصًا مصورة ومجلات لطلاب ما قبل الروضة حتى الصف الثاني عشر. إذا كانت لديك أسئلة عن تسجيل الدخول إلى Sora، فاضغط هنا للاطلاع على إرشادات {{prek}} أو {{grades}}. ويمكنك أيضًا العثور على كثير من هذه الكتب في مكتبة نيويورك العامة (NYPL)، أو مكتبة بروكلين العامة (BPL)، أو مكتبة كوينز العامة (QPL).',
      sora: 'Sora',
      prek: 'ما قبل الروضة–الصف 3',
      grades: 'الصفوف 4–12',
    },
    bn: {
      title: 'NYC Reads কারিকুলাম ফাইন্ডার কীভাবে ব্যবহার করবেন',
      intro: 'আপনি যদি অভিভাবক বা পরিচর্যাকারী হন, তাহলে আপনার সন্তানের শ্রেণি খুঁজে দেখুন এবং সে কী শিখছে জানুন। আপনি যা করতে পারেন:',
      tips: [
        'Sora (NYCPS-এর ডিজিটাল লাইব্রেরি) ব্যবহার করে সেই বিষয়ের একটি বই একসঙ্গে পড়ুন',
        'বিষয়টি নিয়ে প্রশ্ন করুন, যেমন, “তুমি কী শিখেছ?” বা “আর কী জানতে চাও?”',
        'দিনের বিভিন্ন সময়ে বিষয়টি নিয়ে কথা বলুন (যেমন, গাছ সম্পর্কে শিখলে হাঁটার সময় গাছপালা লক্ষ্য করুন)',
        'আরও জানার উপায় খুঁজুন (ছোট ভিডিও দেখুন, লাইব্রেরিতে যান, বা একসঙ্গে ছবি দেখুন)',
      ],
      readingIntro: 'আপনার সন্তানের শেখা ও আগ্রহকে সহায়তা করতে NYCPS-এর লাইব্রেরি সার্ভিসেস অফিস এই পড়ার তালিকাগুলো তৈরি করেছে। এগুলো স্কুলে আপনার সন্তান যে বইগুলো পড়ে ঠিক সেগুলো নয়, তবে বাড়িতে শেখা ও পড়া চালিয়ে যাওয়ার জন্য দারুণ বই। শিক্ষার্থীরা যা শিখছে ও যেসব বিষয়ে আগ্রহী, সেগুলোর সঙ্গে মিল রেখে এবং নানা মানুষ ও অভিজ্ঞতার পরিচয় করিয়ে দিতে বইগুলো বেছে নেওয়া হয়েছে।',
      readingLinks: 'লিংকগুলো আপনাকে NYCPS-এর ডিজিটাল সংগ্রহ, সিটির ডিজিটাল লাইব্রেরি {{sora}}-তে নিয়ে যাবে। NYC পাবলিক স্কুলের প্রত্যেক শিক্ষার্থী বিনামূল্যে Sora-র এই লাইব্রেরি ব্যবহার করতে পারে। এতে প্রি-কে থেকে দ্বাদশ শ্রেণির শিক্ষার্থীদের জন্য ই-বুক, অডিওবুক, কমিক ও ম্যাগাজিন রয়েছে। Sora-তে লগ ইন করার বিষয়ে প্রশ্ন থাকলে এখানে ক্লিক করে {{prek}} বা {{grades}} নির্দেশিকা দেখুন। এই বইগুলোর অনেকগুলো নিউ ইয়র্ক পাবলিক লাইব্রেরি (NYPL), ব্রুকলিন পাবলিক লাইব্রেরি (BPL), অথবা কুইন্স পাবলিক লাইব্রেরিতেও (QPL) পাওয়া যায়।',
      sora: 'Sora',
      prek: 'প্রি-কে–৩',
      grades: '৪–১২ শ্রেণি',
    },
    fr: {
      title: 'Comment utiliser le moteur de recherche du programme NYC Reads',
      intro: 'Si vous êtes parent ou responsable, recherchez le niveau scolaire de votre enfant pour découvrir ce qu’il apprend. Vous pouvez :',
      tips: [
        'Lire ensemble un livre sur ce sujet avec Sora (la bibliothèque numérique de NYCPS)',
        'Poser des questions sur le sujet, comme « Qu’as-tu appris ? » ou « Qu’aimerais-tu découvrir de plus ? »',
        'Parler du sujet au fil de la journée (par exemple, observer les plantes en promenade si votre enfant étudie les arbres)',
        'Trouver des façons d’en apprendre davantage (regarder une courte vidéo, aller à la bibliothèque ou regarder des images ensemble)',
      ],
      readingIntro: 'Le Bureau des services de bibliothèque de NYCPS a préparé ces listes de lecture pour vous aider à soutenir les apprentissages et les centres d’intérêt de votre enfant. Il ne s’agit pas exactement des livres lus par votre enfant à l’école, mais de bons ouvrages pour continuer à apprendre et à lire à la maison. Ces livres ont été choisis en lien avec les apprentissages et les intérêts des élèves, et pour leur faire découvrir des personnes et des expériences variées.',
      readingLinks: 'Les liens vous dirigent vers la bibliothèque numérique de la ville sur {{sora}}, la collection numérique de NYCPS. Tous les élèves des écoles publiques de New York peuvent accéder gratuitement à cette bibliothèque. Elle propose des livres numériques, des livres audio, des bandes dessinées et des magazines pour les élèves de la pré-maternelle à la 12e année. Si vous avez des questions sur la connexion à Sora, cliquez ici pour consulter les guides {{prek}} ou {{grades}}. Vous trouverez également beaucoup de ces livres à la New York Public Library (NYPL), à la Brooklyn Public Library (BPL) ou à la Queens Public Library (QPL).',
      sora: 'Sora',
      prek: 'pré-maternelle–3e année',
      grades: '4e–12e année',
    },
    ht: {
      title: 'Kijan pou itilize zouti pou jwenn kourikoulòm NYC Reads la',
      intro: 'Si ou se paran oswa moun k ap pran swen yon timoun, chèche nivo klas pitit ou a pou wè sa l ap aprann. Men sa ou ka fè:',
      tips: [
        'Li yon liv ansanm sou sijè a avèk Sora (bibliyotèk dijital NYCPS la)',
        'Poze kesyon sou sijè a, tankou “Kisa ou te aprann?” oswa “Kisa ou ta renmen konnen plis?”',
        'Pale sou sijè a pandan jounen an (pa egzanp, remake plant yo pandan yon ti mache si y ap aprann sou pyebwa)',
        'Chèche lòt fason pou aprann plis (gade yon ti videyo, vizite bibliyotèk la, oswa gade foto ansanm)',
      ],
      readingIntro: 'Biwo Sèvis Bibliyotèk NYCPS la prepare lis lekti sa yo pou ede w soutni aprantisaj ak enterè pitit ou. Se pa egzakteman liv pitit ou li lekòl, men se bon liv pou kontinye aprann ak li lakay. Yo chwazi liv yo selon sa elèv yo ap aprann ak enterè yo, epi pou montre divès kalite moun ak eksperyans.',
      readingLinks: 'Lyen yo mennen w nan Bibliyotèk Dijital Vil la sou {{sora}}, koleksyon dijital NYCPS la. Tout elèv Lekòl Piblik Vil Nouyòk yo gen aksè gratis nan bibliyotèk dijital Sora a. Li gen liv elektwonik, liv odyo, komik ak magazin pou elèv depi pre-matènèl rive nan 12yèm ane. Si w gen kesyon sou fason pou konekte sou Sora, klike la a pou gid {{prek}} oswa {{grades}}. Ou ka jwenn anpil nan liv sa yo tou nan New York Public Library (NYPL), Brooklyn Public Library (BPL), oswa Queens Public Library (QPL).',
      sora: 'Sora',
      prek: 'Pre-K–3',
      grades: '4yèm–12yèm ane',
    },
    ko: {
      title: 'NYC Reads 교육과정 찾기 도구 사용 방법',
      intro: '부모님이나 보호자라면 자녀의 학년을 찾아 무엇을 배우고 있는지 확인해 보세요. 다음과 같이 활용할 수 있습니다.',
      tips: [
        'Sora(NYCPS 디지털 도서관)에서 해당 주제의 책을 함께 읽기',
        '“무엇을 배웠니?” 또는 “더 알고 싶은 것은 무엇이니?”와 같이 주제에 대해 질문하기',
        '하루 중 주제에 관해 이야기하기 (예: 나무를 배우고 있다면 산책하며 식물을 살펴보기)',
        '더 알아볼 방법 찾기 (짧은 영상 보기, 도서관 방문하기, 함께 사진 보기)',
      ],
      readingIntro: 'NYCPS 도서관 서비스 사무국은 자녀의 학습과 관심사를 지원하기 위해 이 독서 목록을 만들었습니다. 자녀가 학교에서 실제로 읽는 책과 정확히 같지는 않지만, 집에서도 계속 배우고 읽을 수 있는 좋은 책들입니다. 학생들이 배우는 내용과 관심사에 맞고 다양한 사람과 경험을 보여 주는 책을 골랐습니다.',
      readingLinks: '링크를 누르면 NYCPS의 디지털 자료실인 시립 디지털 도서관 {{sora}}로 이동합니다. 뉴욕시 공립학교 학생은 누구나 Sora의 디지털 도서관을 무료로 이용할 수 있습니다. 유치원 전 과정부터 12학년까지 학생을 위한 전자책, 오디오북, 만화, 잡지가 있습니다. Sora 로그인에 대해 궁금한 점이 있으면 여기를 눌러 {{prek}} 또는 {{grades}} 안내를 확인하세요. 이 책 중 상당수는 뉴욕 공립 도서관(NYPL), 브루클린 공립 도서관(BPL), 퀸스 공립 도서관(QPL)에서도 찾을 수 있습니다.',
      sora: 'Sora',
      prek: 'Pre-K–3학년',
      grades: '4–12학년',
    },
    zh: {
      title: '如何使用 NYC Reads 课程查询工具',
      intro: '如果您是家长或照护者，可以查询孩子的年级，了解他们正在学习什么。您可以：',
      tips: [
        '使用 Sora（NYCPS 数字图书馆）一起阅读一本相关主题的书',
        '围绕主题提问，例如“你学到了什么？”或“你还想了解什么？”',
        '在日常生活中聊聊这个主题（例如，孩子学习树木时，散步时一起观察植物）',
        '寻找进一步学习的方法（看一段短视频、去图书馆，或一起看图片）',
      ],
      readingIntro: 'NYCPS 图书馆服务办公室制作了这些阅读清单，帮助您支持孩子的学习和兴趣。这些并非孩子在学校实际阅读的书目，但都是适合在家继续学习和阅读的好书。选书参考了学生的学习内容和兴趣，也展现了不同的人物与经历。',
      readingLinks: '这些链接会带您前往 NYCPS 的数字馆藏——市级数字图书馆 {{sora}}。每位纽约市公立学校学生都可以免费使用 Sora 数字图书馆。馆内为学前班至 12 年级学生提供电子书、有声书、漫画和杂志。如果您对登录 Sora 有疑问，请点击此处查看{{prek}}或{{grades}}指南。您也可以在纽约公共图书馆 (NYPL)、布鲁克林公共图书馆 (BPL) 或皇后区公共图书馆 (QPL) 找到其中许多书籍。',
      sora: 'Sora',
      prek: '学前班–3 年级',
      grades: '4–12 年级',
    },
    ru: {
      title: 'Как пользоваться поиском учебной программы NYC Reads',
      intro: 'Если вы родитель или опекун, найдите класс своего ребёнка, чтобы узнать, что он изучает. Вы можете:',
      tips: [
        'Вместе прочитать книгу по этой теме в Sora (цифровой библиотеке NYCPS)',
        'Задавать вопросы по теме, например: «Что ты узнал?» или «Что тебе хотелось бы узнать ещё?»',
        'Обсуждать тему в течение дня (например, рассматривать растения на прогулке, если ребёнок изучает деревья)',
        'Найти способы узнать больше (посмотреть короткое видео, сходить в библиотеку или вместе рассмотреть картинки)',
      ],
      readingIntro: 'Отдел библиотечных услуг NYCPS составил эти списки книг, чтобы помочь вам поддержать обучение и интересы ребёнка. Это не те же самые книги, которые ребёнок читает в школе, а хорошие книги, которые помогут продолжать учиться и читать дома. Книги выбраны с учётом того, что изучают ученики, их интересов, а также разнообразия людей и жизненного опыта.',
      readingLinks: 'Ссылки ведут в городскую цифровую библиотеку {{sora}} — цифровую коллекцию NYCPS. Все ученики государственных школ Нью-Йорка могут бесплатно пользоваться библиотекой Sora. В ней есть электронные и аудиокниги, комиксы и журналы для учеников от дошкольного возраста до 12-го класса. Если у вас есть вопросы о входе в Sora, нажмите здесь, чтобы открыть инструкции для {{prek}} или {{grades}}. Многие из этих книг также можно найти в Нью-Йоркской публичной библиотеке (NYPL), Публичной библиотеке Бруклина (BPL) или Публичной библиотеке Куинса (QPL).',
      sora: 'Sora',
      prek: 'дошкольного возраста–3-го класса',
      grades: '4–12-го классов',
    },
    ur: {
      title: 'NYC Reads نصاب تلاش کا استعمال کیسے کریں',
      intro: 'اگر آپ والدین یا نگہداشت کرنے والے ہیں تو اپنے بچے کی جماعت تلاش کریں اور دیکھیں کہ وہ کیا سیکھ رہا ہے۔ آپ یہ کر سکتے ہیں:',
      tips: [
        'Sora (NYCPS کی ڈیجیٹل لائبریری) میں اس موضوع پر کوئی کتاب مل کر پڑھیں',
        'موضوع کے بارے میں سوال کریں، مثلاً: “تم نے کیا سیکھا؟” یا “تم مزید کیا جاننا چاہتے ہو؟”',
        'دن کے دوران اس موضوع پر بات کریں (مثلاً اگر بچہ درختوں کے بارے میں سیکھ رہا ہو تو چہل قدمی کے دوران پودوں کو دیکھیں)',
        'مزید سیکھنے کے طریقے تلاش کریں (مختصر ویڈیو دیکھیں، لائبریری جائیں، یا مل کر تصویریں دیکھیں)',
      ],
      readingIntro: 'NYCPS کے دفترِ لائبریری سروسز نے یہ مطالعاتی فہرستیں آپ کے بچے کے سیکھنے اور دلچسپیوں میں مدد کے لیے تیار کی ہیں۔ یہ لازماً وہی کتابیں نہیں جو آپ کا بچہ اسکول میں پڑھتا ہے، بلکہ گھر پر سیکھنے اور پڑھنے کا سلسلہ جاری رکھنے کے لیے اچھی کتابیں ہیں۔ کتابوں کا انتخاب طلبہ کی تعلیم، دلچسپیوں اور مختلف لوگوں اور تجربات کی نمائندگی کو مدنظر رکھ کر کیا گیا ہے۔',
      readingLinks: 'یہ روابط آپ کو NYCPS کے ڈیجیٹل ذخیرے، سٹی وائیڈ ڈیجیٹل لائبریری {{sora}}، تک لے جاتے ہیں۔ نیویارک کے سرکاری اسکولوں کے ہر طالب علم کو Sora کی ڈیجیٹل لائبریری مفت دستیاب ہے۔ اس میں پری کنڈرگارٹن سے 12ویں جماعت تک کے طلبہ کے لیے ای بکس، آڈیو بکس، کامکس اور رسالے شامل ہیں۔ اگر Sora میں لاگ اِن کرنے کے بارے میں سوال ہو تو یہاں کلک کرکے {{prek}} یا {{grades}} کی رہنمائی دیکھیں۔ ان میں سے بہت سی کتابیں نیویارک پبلک لائبریری (NYPL)، بروکلین پبلک لائبریری (BPL)، یا کوئنز پبلک لائبریری (QPL) میں بھی مل سکتی ہیں۔',
      sora: 'Sora',
      prek: 'پری-کے–3',
      grades: 'جماعتیں 4–12',
    },
  };

  function t(key) {
    const lang = state.selectedLanguage || 'en';
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
  }

  async function loadAdditionalTranslations() {
    const response = await fetch('/translations/additional.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error('Failed to load additional language translations');
    }
    const additional = await response.json();
    Object.assign(translations, additional.interface || {});
    Object.assign(parentCaregiverTranslations, additional.parentCaregiver || {});
  }

  function getStoredLanguage() {
    try {
      const language = window.localStorage.getItem('selectedLanguage') || 'en';
      return Object.prototype.hasOwnProperty.call(translations, language) ? language : 'en';
    } catch (err) {
      console.warn('[i18n] Unable to read selectedLanguage from localStorage', err);
      return 'en';
    }
  }

  function saveStoredLanguage(value) {
    try {
      window.localStorage.setItem('selectedLanguage', value);
    } catch (err) {
      console.warn('[i18n] Unable to save selectedLanguage to localStorage', err);
    }
  }

  function setOptions(selectEl, values, allLabel) {
    if (!selectEl) {
      console.warn('[Options] Missing select element for label', allLabel);
      return;
    }
    const escapeAttr = value => String(value).split('"').join('&quot;');
    const opts = ['<option value="">' + allLabel + '</option>']
      .concat(values.map(v => '<option value="' + escapeAttr(v) + '">' + v + '</option>'))
      .join('');
    selectEl.innerHTML = opts;
    console.log('[Options] Rendered', {
      target: selectEl.id || '(unknown)',
      label: allLabel,
      optionCount: selectEl.options ? selectEl.options.length : 0,
      sample: Array.isArray(values) ? values.slice(0, 8) : [],
    });
  }

  function setDatalistOptions(listEl, values) {
    if (!listEl) {
      console.warn('[Datalist] Missing datalist element');
      return;
    }
    const escapeAttr = value => String(value).split('"').join('&quot;');
    const opts = values.map(v => '<option value="' + escapeAttr(v) + '"></option>').join('');
    listEl.innerHTML = opts;
    console.log('[Datalist] Rendered', {
      target: listEl.id || '(unknown)',
      optionCount: Array.isArray(values) ? values.length : 0,
      sample: Array.isArray(values) ? values.slice(0, 8) : [],
    });
  }

  function sortGradeTokens(tokens) {
    const order = t => (t === 'PK' ? 0 : (t === 'K' ? 1 : (10 + Number(t))));
    return Array.from(new Set((tokens || []).map(String))).sort((a, b) => order(a) - order(b));
  }

  function defaultGradeTokens() {
    const out = ['PK', 'K'];
    for (let i = 1; i <= 12; i++) out.push(String(i));
    return out;
  }

  function schoolKey(district, school) {
    return String(district || '').trim() + '|' + String(school || '').trim();
  }

  function setDefaultDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    els.date.value = yyyy + '-' + mm + '-' + dd;
  }

  function getDistrictValues() {
    const districtsFromMeta = Array.isArray(state.meta && state.meta.districts) ? state.meta.districts : [];
    const numericSorted = Array.from(new Set(districtsFromMeta))
      .map(d => Number(String(d).trim()))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b)
      .map(n => String(n));
    if (numericSorted.length) return numericSorted;
    const keys = Object.keys(state.schoolsByDistrict || {});
    return Array.from(new Set(keys))
      .map(d => Number(String(d).trim()))
      .filter(n => !Number.isNaN(n))
      .sort((a, b) => a - b)
      .map(n => String(n));
  }

  function getAllSchoolValues() {
    return Object.values(state.schoolsByDistrict || {}).flat().sort((a, b) => a.localeCompare(b));
  }

  function updateRoleOptions() {
    if (!els.role) return;
    const selected = String(els.role.value || '').trim();
    const optionLabels = {
      '': t('allRoles'),
      'OST/Afterschool Provider': t('roleOst'),
      'Parent or Caregiver': t('roleParent'),
      'School Leader or Teacher': t('roleSchool'),
    };
    Array.from(els.role.options || []).forEach(option => {
      option.text = optionLabels[option.value] || option.value;
    });
    els.role.value = selected;
  }

  function renderFilterControls() {
    const selectedDistrict = els.district ? String(els.district.value || '').trim() : '';
    const selectedGrade = els.grade ? String(els.grade.value || '').trim() : '';
    const districts = getDistrictValues();
    const grades = (state.meta && Array.isArray(state.meta.grades) && state.meta.grades.length)
      ? state.meta.grades
      : defaultGradeTokens();
    setOptions(els.district, districts, t('allDistricts'));
    setOptions(els.grade, grades, t('allGrades'));
    setDatalistOptions(els.schoolList, getAllSchoolValues());
    if (els.district && selectedDistrict) els.district.value = selectedDistrict;
    if (els.grade && selectedGrade) els.grade.value = selectedGrade;
    updateRoleOptions();
  }

  function updateFirstOptionLabel(selectEl, label) {
    if (!selectEl || !selectEl.options || !selectEl.options.length) return;
    if (String(selectEl.options[0].value || '') !== '') return;
    selectEl.options[0].text = label;
  }

  function updateTranslatedFilterLabels() {
    updateFirstOptionLabel(els.district, t('allDistricts'));
    updateFirstOptionLabel(els.grade, t('allGrades'));
    updateRoleOptions();
  }

  function applyLanguage() {
    document.documentElement.lang = state.selectedLanguage || 'en';
    document.documentElement.dir = ['ar', 'ur'].indexOf(state.selectedLanguage) !== -1 ? 'rtl' : 'ltr';
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    setText('heroTitle', t('heroTitle'));
    setText('heroSubtitle', t('heroSubtitle'));
    setText('aboutTitle', t('aboutTitle'));
    setText('aboutIntro', t('aboutIntro'));
    setText('disclaimerLabel', t('disclaimerLabel'));
    setText('disclaimerText', t('disclaimerText'));
    const translationNotice = document.getElementById('translationNotice');
    if (translationNotice) {
      translationNotice.textContent = t('translationNotice');
      translationNotice.hidden = state.selectedLanguage === 'en';
    }
    setText('filtersTitle', t('filtersTitle'));
    setText('k8ProgramButton', t('k8Program'));
    setText('prekProgramButton', t('prekProgram'));
    setText('prekTitle', t('prekTitle'));
    setText('prekMessage', t('prekMessage'));
    setText('prekResourceLink', t('prekLink'));
    setText('districtLabel', t('districtLabel'));
    setText('schoolLabel', t('schoolLabel'));
    setText('gradeLabel', t('gradeLabel'));
    setText('roleLabel', t('roleLabel'));
    setText('languageLabel', t('languageLabel'));
    setText('resultsTitle', t('resultsTitle'));
    setText('feedbackTitle', t('feedbackTitle'));
    setText('feedbackPrompt', t('feedbackPrompt'));
    setText('feedbackButton', t('feedbackButton'));
    setText('feedbackNote', t('feedbackNote'));
    setText('noscriptMessage', t('noScript'));
    const programSwitch = document.querySelector('.program-switch');
    const filtersSection = document.getElementById('filters');
    const resultsSection = document.getElementById('results');
    const feedbackSection = document.getElementById('feedbackSection');
    if (programSwitch) programSwitch.setAttribute('aria-label', t('programLabel'));
    if (filtersSection) filtersSection.setAttribute('aria-label', t('filtersTitle'));
    if (resultsSection) resultsSection.setAttribute('aria-label', t('resultsTitle'));
    if (feedbackSection) feedbackSection.setAttribute('aria-label', t('feedbackTitle'));
    if (els.schoolInput) els.schoolInput.placeholder = t('schoolPlaceholder');
    if (els.clearSchool) els.clearSchool.setAttribute('aria-label', t('clearSchoolAria'));
    if (els.clear) els.clear.textContent = t('clearBtn');
    if (els.search && !els.search.disabled) els.search.textContent = t('searchBtn');
    if (els.language) els.language.setAttribute('aria-label', t('languageLabel'));
    const dateLabel = document.getElementById('dateLabel');
    if (dateLabel) {
      dateLabel.innerHTML = t('dateLabel') + ' <span class="hint" id="dateHint">' + t('dateHint') + '</span>';
    }
    updateTranslatedFilterLabels();
  }

  async function loadMeta() {
    try {
      console.log('[Meta] Starting loadMeta');
      // Always insert defaults first so dropdowns are never empty
      if (els.district) setOptions(els.district, [], t('allDistricts'));
      if (els.grade) setOptions(els.grade, [], t('allGrades'));

      const res = await fetch('/api/meta', { cache: 'no-cache' });
      console.log('[Meta] Response received', {
        ok: res.ok,
        status: res.status,
        contentType: res.headers.get('content-type'),
        url: res.url,
      });
      if (!res.ok) throw new Error('Failed to load meta');
      const json = await res.json();
      state.meta = json || {};
      console.log('[Meta] Raw payload summary', {
        keys: Object.keys(state.meta || {}),
        districtsIsArray: Array.isArray(json && json.districts),
        schoolsIsArray: Array.isArray(json && json.schools),
        gradesIsArray: Array.isArray(json && json.grades),
        districtsCount: Array.isArray(json && json.districts) ? json.districts.length : null,
        schoolsCount: Array.isArray(json && json.schools) ? json.schools.length : null,
        gradesCount: Array.isArray(json && json.grades) ? json.grades.length : null,
        sampleDistricts: Array.isArray(json && json.districts) ? json.districts.slice(0, 8) : [],
        sampleSchools: Array.isArray(json && json.schools) ? json.schools.slice(0, 3) : [],
        sampleGrades: Array.isArray(json && json.grades) ? json.grades.slice(0, 8) : [],
      });

      // Ensure we always have a global grade list as fallback
      if (!state.meta.grades || !Array.isArray(state.meta.grades) || state.meta.grades.length === 0) {
        state.meta.grades = defaultGradeTokens();
        console.warn('[Meta] No global grades from API; using default PK–12');
      }

      // Build schoolsByDistrict from flat schools array if provided
      const byDistrict = {};
      if (Array.isArray(json.schools)) {
        for (const s of json.schools) {
          const d = String(s.district || '').trim();
          const name = String(s.school || '').trim();
          if (!d || !name) continue;
          if (!byDistrict[d]) byDistrict[d] = [];
          byDistrict[d].push(name);
        }
        // dedupe/sort
        Object.keys(byDistrict).forEach(d => {
          byDistrict[d] = Array.from(new Set(byDistrict[d])).sort((a, b) => a.localeCompare(b));
        });
      }
      state.schoolsByDistrict = byDistrict;
      console.log('[Meta] schoolsByDistrict mapped', {
        districtKeys: Object.keys(byDistrict).slice(0, 12),
        districtCount: Object.keys(byDistrict).length,
        sampleDistrictSchoolCounts: Object.keys(byDistrict).slice(0, 6).map(d => ({ district: d, count: byDistrict[d].length })),
      });

      // Fetch grades per school mapping
      try {
        const res2 = await fetch('/api/school-grades', { cache: 'no-cache' });
        console.log('[Meta] /api/school-grades response', {
          ok: res2.ok,
          status: res2.status,
          contentType: res2.headers.get('content-type'),
        });
        if (res2.ok) {
          const j2 = await res2.json();
          const map = {};
          if (j2 && Array.isArray(j2.items)) {
            for (const it of j2.items) {
              const k = schoolKey(it.district, it.school);
              const graded = Array.isArray(it.grades) ? sortGradeTokens(it.grades) : [];
              map[k] = graded;
            }
          }
          state.gradesBySchool = map;
          console.log('[Meta] gradesBySchool mapped', {
            schoolCount: Object.keys(map).length,
            sample: Object.entries(map).slice(0, 5),
          });
        } else {
          console.warn('[Meta] /api/school-grades returned', res2.status);
        }
      } catch (e) {
        console.warn('[Meta] Failed to fetch /api/school-grades', e);
      }

      const districts = getDistrictValues();
      const allSchools = getAllSchoolValues();
      renderFilterControls();
      console.log('[Meta] Final render summary', {
        districtsRendered: districts.length,
        schoolsRendered: allSchools.length,
        gradesRendered: (state.meta.grades || []).length,
        districtSelectOptions: els.district && els.district.options ? els.district.options.length : null,
        gradeSelectOptions: els.grade && els.grade.options ? els.grade.options.length : null,
      });

      console.log('[Meta] Loaded', {
        schoolsCount: Array.isArray(json.schools) ? json.schools.length : 0,
        districtsCount: Array.isArray(json.districts) ? json.districts.length : 0,
        gradesCount: Array.isArray(json.grades) ? json.grades.length : 0,
        sampleDistricts: (json.districts || []).slice(0, 8),
        sampleGrades: (json.grades || []).slice(0, 8),
      });
      if ((!json.districts || json.districts.length === 0) && (!allSchools || allSchools.length === 0)) {
        console.error('Meta is empty from /api/meta');
        if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('noDataSheet') + '</div>';
      }
    } catch (e) {
      console.error('Failed to fetch /api/meta', e);
      console.error('[Meta] loadMeta failed details', {
        message: e && e.message ? e.message : String(e),
        stack: e && e.stack ? e.stack : null,
      });
      // Ensure placeholders still render even if meta fails
      if (els.district) setOptions(els.district, [], t('allDistricts'));
      if (els.grade) setOptions(els.grade, [], t('allGrades'));
      if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('noDataMeta') + '</div>';
    }
  }

  function onDistrictChange() {
    const district = String(els.district.value || '').trim();
    const schools = district
      ? ((state.schoolsByDistrict && state.schoolsByDistrict[district]) || [])
      : (Object.values(state.schoolsByDistrict || {}).flat());
    const sorted = Array.from(new Set((schools || []).map(s => String(s).trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
    setDatalistOptions(els.schoolList, sorted);
    console.log('[District] Change handled', {
      selectedDistrict: district,
      matchedSchools: sorted.length,
      sampleSchools: sorted.slice(0, 8),
    });
    // Clear the current school input when district changes
    els.schoolInput.value = '';
    // Reset grades to global when district changed and school cleared
    if (state.meta) setOptions(els.grade, state.meta.grades || defaultGradeTokens(), t('allGrades'));
  }

  function recomputeGradeOptionsForSelection() {
    const districtVal = String(els.district.value || '').trim();
    const schoolVal = String(els.schoolInput.value || '').trim();
    const key = schoolKey(districtVal, schoolVal);
    const allowed = (districtVal && schoolVal && state.gradesBySchool && state.gradesBySchool[key] && state.gradesBySchool[key].length)
      ? state.gradesBySchool[key]
      : ((state.meta && state.meta.grades && state.meta.grades.length) ? state.meta.grades : defaultGradeTokens());
    const allowedSorted = sortGradeTokens(allowed);
    setOptions(els.grade, allowedSorted, t('allGrades'));
    // If current selection is not allowed, reset to All
    const cur = String(els.grade.value || '').trim();
    if (cur && allowedSorted.indexOf(cur) === -1) {
      els.grade.value = '';
    }
  }

  function escapeHTML(s){
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function splitBooks(raw) {
    return String(raw || '')
      .split(/[\n;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    }

  function currentRoleValue() {
    const stateRole = String(state.selectedRole || '').trim();
    if (stateRole) return stateRole;
    if (!els.role) return '';
    const rawValue = String(els.role.value || '').trim();
    if (rawValue) return rawValue;
    const idx = Number(els.role.selectedIndex);
    const option = idx >= 0 ? els.role.options[idx] : null;
    return option ? String(option.text || '').trim() : '';
  }

  function isOstRoleSelected() {
    const role = currentRoleValue()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return role.indexOf('ost') !== -1 && role.indexOf('afterschool') !== -1 && role.indexOf('provider') !== -1;
  }

  function isParentCaregiverRoleSelected() {
    const role = currentRoleValue()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return role.indexOf('parent') !== -1 && role.indexOf('caregiver') !== -1;
  }

  function isSchoolLeaderTeacherRoleSelected() {
    const role = currentRoleValue()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    return role.indexOf('school leader') !== -1 || role.indexOf('teacher') !== -1;
  }

  function getParentCaregiverTranslation() {
    return parentCaregiverTranslations[state.selectedLanguage] || parentCaregiverTranslations.en;
  }

  function renderParentReadingLinks(copy) {
    const soraLink = '<a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">' + copy.sora + '</a>';
    const prekLink = '<a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2Awljhzo%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIxMjYkbzEkZzEkdDE3NzU1ODIyMjckajYwJGwwJGgw#/lessons/op3g0wQ8oC99f1Rznjn1BW7Q1zG5KrxA" target="_blank" rel="noopener noreferrer">' + copy.prek + '</a>';
    const gradesLink = '<a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2A882ek0%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIzNTkkajYwJGwwJGgw#/lessons/aZ9uCcYTZkMiZcWXAehV5mBBPs6dDadq" target="_blank" rel="noopener noreferrer">' + copy.grades + '</a>';
    return copy.readingLinks
      .replace('{{sora}}', soraLink)
      .replace('{{prek}}', prekLink)
      .replace('{{grades}}', gradesLink);
  }

  function renderOstUsageBlock() {
    const lang = state.selectedLanguage || 'en';
    if (isSchoolLeaderTeacherRoleSelected()) {
      const content = lang === 'es'
        ? 'Si eres lider escolar o maestro, usa la herramienta para identificar el aprendizaje por grado en tu escuela y compartirlo con el personal, los socios de afterschool y las familias para apoyar la alineacion. Usala para guiar la planificacion, fortalecer las conexiones entre la instruccion en clase y el enriquecimiento, y asegurar que todos los socios desarrollen conocimiento y vocabulario en torno a temas compartidos. Encuentra mas recursos para la participacion y la alianza con las familias <a href="https://cprl.law.columbia.edu/content/spread-word-nyc-reads-family-partnership-toolkit" target="_blank" rel="noopener noreferrer">aqui</a>.'
        : 'If you are a school leader or teacher, use the tool to identify grade-level learning across your school and share it with staff, afterschool partners, and families to support alignment. Use it to guide planning, strengthen connections between classroom instruction and enrichment, and ensure all partners are building knowledge and vocabulary around shared topics. Find more resources for family partnership and engagement <a href="https://cprl.law.columbia.edu/content/spread-word-nyc-reads-family-partnership-toolkit" target="_blank" rel="noopener noreferrer">here</a>.';
      return (
        '<div class="subcard ost-note-card section">' +
          '<h3>' + (lang === 'es' ? 'Como usar el Buscador de Curriculo NYC Reads' : 'How to Use the NYC Reads Curriculum Finder') + '</h3>' +
          '<p>' + content + '</p>' +
        '</div>'
      );
    }
    if (isParentCaregiverRoleSelected()) {
      const copy = getParentCaregiverTranslation();
      return (
        '<div class="subcard ost-note-card section">' +
          '<h3>' + copy.title + '</h3>' +
          '<p>' + copy.intro + '</p>' +
          '<ul class="role-guidance-list">' +
            copy.tips.map(item => '<li>' + item + '</li>').join('') +
          '</ul>' +
        '</div>'
      );
    }
    const content = lang === 'es'
      ? 'Si eres proveedor de tiempo fuera de la escuela, busca tu escuela y grado, identifica el modulo actual y planifica una actividad alineada usando el <a href="https://drive.google.com/file/d/1KmOwO0uxwQs1jcuXuayQPD3o0v5Nd9C7/view" target="_blank" rel="noopener noreferrer">Knowledge-Building Activity Planning Protocol</a> y el <a href="https://cprl.law.columbia.edu/content/out-school-time-nyc-reads-toolkit" target="_blank" rel="noopener noreferrer">Out-of-School Time NYC Reads Toolkit</a>. Los programas OST son un pilar clave para reforzar el aprendizaje mas alla del dia escolar al desarrollar conocimiento y vocabulario mediante experiencias atractivas del mundo real.'
      : 'If you are an Out-of-School Time provider, find your school and grade, identify the current module, and plan an aligned activity using the <a href="https://drive.google.com/file/d/1KmOwO0uxwQs1jcuXuayQPD3o0v5Nd9C7/view" target="_blank" rel="noopener noreferrer">Knowledge-Building Activity Planning Protocol</a> and the <a href="https://cprl.law.columbia.edu/content/out-school-time-nyc-reads-toolkit" target="_blank" rel="noopener noreferrer">Out-of-School Time NYC Reads Toolkit</a> - OST programs are a critical pillar in reinforcing learning beyond the school day by building knowledge and vocabulary through engaging, real-world experiences.';
    return (
      '<div class="subcard ost-note-card section">' +
        '<h3>' + (lang === 'es' ? 'Como usar el Buscador de Curriculo NYC Reads' : 'How to Use the NYC Reads Curriculum Finder') + '</h3>' +
        '<p>' + content + '</p>' +
      '</div>'
    );
  }

  function renderOstLibraryBlock() {
    return '';
  }

  function clearRoleBlocks() {
    if (els.roleIntroMount) els.roleIntroMount.innerHTML = '';
    if (els.roleOutroMount) els.roleOutroMount.innerHTML = '';
  }

  function renderEmptyMessageFromResponse(json) {
    if (!els.resultsMount) return;
    clearRoleBlocks();
    if (json && json.message_type === 'curriculum_not_rolled_out') {
      const message = document.createElement('div');
      message.className = 'empty';
      message.textContent = json.message || '';

      [
        {
          href: 'https://www.schools.nyc.gov/learning/subjects/literacy/nyc-reads',
          label: 'NYC Schools',
        },
        {
          href: 'https://www.nycreadstogether.org/',
          label: 'NYC Reads Together',
        },
      ].forEach((link, index) => {
        message.appendChild(document.createElement('br'));
        if (index === 0) message.appendChild(document.createElement('br'));
        const anchor = document.createElement('a');
        anchor.href = link.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.label;
        message.appendChild(anchor);
      });

      els.resultsMount.replaceChildren(message);
      return;
    }
    if (json && json.message_type === 'high_school_not_available') {
      const infoUrl = String((json && json.info_url) || 'https://www.schools.nyc.gov/learning/subjects/literacy/nyc-reads');
      const learnMore = state.selectedLanguage === 'es'
        ? 'Para obtener mas informacion sobre NYC Reads, haz clic <a href="' + infoUrl + '" target="_blank" rel="noopener noreferrer">aqui</a>.'
        : 'To learn more about NYC Reads, click <a href="' + infoUrl + '" target="_blank" rel="noopener noreferrer">here</a>.';
      els.resultsMount.innerHTML =
        '<div class="empty">' +
        t('highSchoolUnavailable') + ' ' +
        learnMore +
        '</div>';
      return;
    }
    els.resultsMount.innerHTML = '<div class="empty">' + escapeHTML((json && json.message) || t('noResults')) + '</div>';
  }

  function applyRoleBlocks(mainHtml) {
    const showRoleIntro = isOstRoleSelected() || isParentCaregiverRoleSelected() || isSchoolLeaderTeacherRoleSelected();
    const introHtml = showRoleIntro ? renderOstUsageBlock() : '';
    const outroHtml = isOstRoleSelected() ? renderOstLibraryBlock() : '';
    clearRoleBlocks();
    if (els.roleIntroMount && els.roleOutroMount) {
      els.roleIntroMount.innerHTML = introHtml;
      els.resultsMount.innerHTML = mainHtml;
      els.roleOutroMount.innerHTML = outroHtml;
      return;
    }
    els.resultsMount.innerHTML = introHtml + mainHtml + outroHtml;
  }

  function renderResultCard(model) {
    const { district, school, grade, curriculum, module_number, module_title, dateLabel, essential_question, text_genres, books } = model;
    const eqParagraph = '<p>' + escapeHTML(essential_question || '') + '</p>';
    const genrePills = (text_genres || []).map(g => '<span class="pill">' + escapeHTML(g) + '</span>').join('');
    const bookList = (books || []).map(b => {
      const title = b && b.title ? String(b.title) : '';
      const translatedTitle = b && b.translated_title && String(b.translated_title) !== title
        ? String(b.translated_title)
        : '';
      const link = b && b.url ? String(b.url) : '';
      const cover = b && (b.coverImageUrl || b.coverimageurl) ? String(b.coverImageUrl || b.coverimageurl) : '';
      const imgTag = cover ? ('<img src="' + cover + '" alt="' + escapeHTML(title || 'Book cover') + '" onerror="this.onerror=null; this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />') : '';
      const img = link && imgTag
        ? ('<a href="' + link + '" target="_blank" rel="noopener noreferrer">' + imgTag + '</a>')
        : imgTag;
      const fallback = '<div class="book-fallback"' + (cover ? '' : ' style="display:flex;"') + '>' + (state.selectedLanguage === 'es' ? 'Portada no disponible por ahora' : 'Book cover not available for now') + '</div>';
      const titleHtml = link ? ('<a href="' + link + '" target="_blank" rel="noopener noreferrer">' + escapeHTML(title) + '</a>') : escapeHTML(title);
      const translatedTitleHtml = translatedTitle
        ? ' <span class="translated-book-title">(' + escapeHTML(translatedTitle) + ')</span>'
        : '';
      return '<li class="book-item"><div class="book-thumb">' + img + fallback + '</div><div class="book-title">' + titleHtml + translatedTitleHtml + '</div></li>';
    }).join('');
    // Recommended Text section removed

    let readingListIntro = isOstRoleSelected()
      ? (
        '<div class="reading-list-intro">' +
          (
            state.selectedLanguage === 'es'
              ? 'La Oficina de Servicios Bibliotecarios de NYCPS preparo estas listas de lectura para apoyar la construccion de conocimiento mas alla del dia escolar. No son exactamente los libros usados en clase, sino textos recomendados para ampliar el aprendizaje e involucrar a los lectores. Estos textos ayudan a desarrollar conocimiento previo, vocabulario y comprension de temas clave que estudian los estudiantes. Los textos se eligieron por su alineacion con los temas del modulo, la representacion diversa y autentica, la calidad del texto, la accesibilidad y el interes estudiantil.'
              : 'The NYCPS Office of Library Services curated these reading lists to support knowledge-building beyond the school day; they are not the exact books used in class, but recommended texts to extend learning and engage readers. These texts help build background knowledge, vocabulary, and understanding of key topics students are studying. The texts were curated using criteria such as alignment to module topics, diverse and authentic representation, text quality, accessibility, and student interests.'
          ) +
          '<br><br>' +
          (
            state.selectedLanguage === 'es'
              ? 'Los enlaces llevan a la Biblioteca Digital de la Ciudad en <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">Sora</a>, la coleccion digital de NYCPS. Aunque los proveedores OST no tienen acceso directo, estos enlaces se incluyen para que los estudiantes con quienes trabajas puedan acceder a los textos con sus cuentas de NYCPS. Si te interesa usar alguno de estos libros en tu programa, tambien puedes buscar los titulos en la Biblioteca Publica de Nueva York (NYPL), la Biblioteca Publica de Brooklyn (BPL) o la Biblioteca Publica de Queens (QPL). Para aprender mas sobre Sora, haz clic <a href="https://company.overdrive.com/k-12-schools/discover-sora/nyc-edu/" target="_blank" rel="noopener noreferrer">aqui</a>.'
              : 'These reading lists can help you identify texts connected to what students are learning in school. If you are interested in using one of these books in your program, you can look for the titles through the <a href="https://www.nypl.org/" target="_blank" rel="noopener noreferrer">New York Public Library (NYPL)</a>, <a href="https://www.bklynlibrary.org/" target="_blank" rel="noopener noreferrer">Brooklyn Public Library (BPL)</a>, or <a href="http://www.queenslibrary.org/" target="_blank" rel="noopener noreferrer">Queens Public Library (QPL)</a>. You can also download a spreadsheet of the full reading lists <a href="https://drive.google.com/drive/u/0/folders/1rzhtP6gEH40lTYlvuYV-8__RrPTad0lV" target="_blank" rel="noopener noreferrer">here</a>.'
          ) +
        '</div>'
      )
      : isParentCaregiverRoleSelected()
        ? (
          '<div class="reading-list-intro">' +
            (
              state.selectedLanguage === 'es'
                ? 'La Oficina de Servicios Bibliotecarios de NYCPS preparo estas listas de lectura para ayudarte a apoyar el aprendizaje y los intereses de tu hijo. No son exactamente los libros que tu hijo lee en la escuela, pero son excelentes libros para seguir aprendiendo y leyendo en casa. Los libros fueron elegidos para conectar con lo que estudian los estudiantes, sus intereses y una variedad de personas y experiencias.'
                : 'The NYCPS Office of Library Services made these reading lists to help you support your child’s learning and interests. These are not the exact books your child reads in school, but they are great books to keep learning and reading, continuing at home. The books were chosen to match what students are learning, their interests, and to show many different people and experiences.'
            ) +
            '<br><br>' +
            (
              state.selectedLanguage === 'es'
                ? 'Los enlaces te llevan a la Biblioteca Digital de la Ciudad en <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">Sora</a>, la coleccion digital de NYCPS. Cada estudiante de las Escuelas Publicas de NYC tiene acceso gratuito a la Biblioteca Digital de la Ciudad en Sora. Incluye libros electronicos, audiolibros, comics y revistas para estudiantes desde Pre-K hasta 12 grado. Si tienes preguntas sobre como iniciar sesion en Sora, haz clic aqui para <a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2Awljhzo%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIxMjYkbzEkZzEkdDE3NzU1ODIyMjckajYwJGwwJGgw#/lessons/op3g0wQ8oC99f1Rznjn1BW7Q1zG5KrxA" target="_blank" rel="noopener noreferrer">Pre-K–3</a> o <a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2A882ek0%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIxMjYkbzEkZzEkdDE3NzU1ODIzNTkkajYwJGwwJGgw#/lessons/aZ9uCcYTZkMiZcWXAehV5mBBPs6dDadq" target="_blank" rel="noopener noreferrer">Grados 4–12</a>. Tambien puedes encontrar muchos de estos libros en la Biblioteca Publica de Nueva York (NYPL), la Biblioteca Publica de Brooklyn (BPL) o la Biblioteca Publica de Queens (QPL).'
                : 'The links take you to the Citywide Digital Library on <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">Sora</a>, NYCPS’s digital collection. Every NYC Public Schools student has free access to the Citywide Digital Library on Sora. It has eBooks, audiobooks, comics, and magazines for all students from Pre-K to 12th grade. If you have questions about logging into Sora, click here for <a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2Awljhzo%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIxMjYkbzEkZzEkdDE3NzU1ODIyMjckajYwJGwwJGgw#/lessons/op3g0wQ8oC99f1Rznjn1BW7Q1zG5KrxA" target="_blank" rel="noopener noreferrer">Pre-K–3</a> or <a href="https://rise.articulate.com/share/fcB-JQs3ozeuQWZHwEw4Az6upNkkYKb-?_gl=1%2A882ek0%2A_gcl_au%2ANjE5MjA1NTAzLjE3NzU1ODIxMjY.%2A_ga%2AMTA3MTMzNjUzLjE3NzU1ODIxMjA.%2A_ga_J2DYCDLK48%2AczE3NzU1ODIxMjYkbzEkZzEkdDE3NzU1ODIzNTkkajYwJGwwJGgw#/lessons/aZ9uCcYTZkMiZcWXAehV5mBBPs6dDadq" target="_blank" rel="noopener noreferrer">Grades 4–12</a>. You can also find many of these books at the New York Public Library (NYPL), Brooklyn Public Library (BPL), or Queens Public Library (QPL).'
            ) +
          '</div>'
        )
      : isSchoolLeaderTeacherRoleSelected()
        ? (
          '<div class="reading-list-intro">' +
            (
              state.selectedLanguage === 'es'
                ? 'La Oficina de Servicios Bibliotecarios de NYCPS preparo estas listas de lectura para apoyar una instruccion alineada y rica en conocimiento, junto con los intereses de los estudiantes. No son exactamente los libros usados en clase, sino textos recomendados para ampliar el aprendizaje, la curiosidad y las preguntas. Estos textos ayudan a desarrollar conocimiento previo, vocabulario y comprension de temas clave que estudian y valoran los estudiantes. Fueron elegidos por su alineacion con los temas del modulo, su representacion diversa y autentica, la calidad del texto y la accesibilidad.'
                : 'The NYCPS Office of Library Services curated these reading lists to support aligned, knowledge-rich instruction, as well as student interests; they are not the exact books used in class, but recommended texts to extend learning, curiosity, and wonderings. These texts can help build background knowledge, vocabulary, and understanding of key topics students are studying and care about. They were chosen based on alignment to module topics, diverse and authentic representation, text quality, and accessibility.'
            ) +
            '<br><br>' +
            (
              state.selectedLanguage === 'es'
                ? 'Los enlaces llevan a la Biblioteca Digital de la Ciudad en <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">Sora</a>, la coleccion digital de NYCPS, a la que todos los estudiantes de NYCPS pueden acceder gratuitamente. Para aprender mas sobre como usar Sora, haz clic <a href="https://company.overdrive.com/k-12-schools/discover-sora/nyc-edu/" target="_blank" rel="noopener noreferrer">aqui</a>, y accede a los <a href="https://rise.articulate.com/share/fN3jh1drp20vtC616toVONChj5Qm1veP?_ga=2.255888331.1789937731.1686316284-864601938.1686316284#/lessons/jy4Eps279hwoEQjn6rlV9F9u8DVJCzWP" target="_blank" rel="noopener noreferrer">recursos de capacitacion para docentes</a> aqui.'
                : 'The links direct to the Citywide Digital Library on <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener noreferrer">Sora</a>, NYCPS’s digital collection, which all NYCPS students can access for free. To learn more about using Sora, click <a href="https://company.overdrive.com/k-12-schools/discover-sora/nyc-edu/" target="_blank" rel="noopener noreferrer">here</a>, and access <a href="https://rise.articulate.com/share/fN3jh1drp20vtC616toVONChj5Qm1veP?_ga=2.255888331.1789937731.1686316284-864601938.1686316284#/lessons/jy4Eps279hwoEQjn6rlV9F9u8DVJCzWP" target="_blank" rel="noopener noreferrer">teacher training resources</a> here.'
            ) +
          '</div>'
        )
      : '';
    if (isParentCaregiverRoleSelected()) {
      const copy = getParentCaregiverTranslation();
      readingListIntro = '<div class="reading-list-intro">' +
        copy.readingIntro +
        '<br><br>' +
        renderParentReadingLinks(copy) +
        '</div>';
    }
    const soraNote = (isOstRoleSelected() || isParentCaregiverRoleSelected() || isSchoolLeaderTeacherRoleSelected())
      ? ''
      : '<div class="sora-note" style="margin-top:8px;font-size:12px;color:#475569;">' +
        (
          state.selectedLanguage === 'es'
            ? '¿Buscas titulos parecidos? Explora y toma prestado de la Biblioteca Digital de la Ciudad en <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener">Sora</a>.'
            : 'Looking for similar titles? Browse and borrow from the Citywide Digital Library on <a href="https://soraapp.com/welcome/login/310229" target="_blank" rel="noopener">Sora</a>.'
        ) +
        '</div>';

    return (
      '<div class="card section">' +
        '<div class="grid-2" style="align-items:start;">' +
          '<div>' +
            '<h3>' + t('schoolInformation') + '</h3>' +
            '<p><b>' + t('schoolField') + '</b> ' + escapeHTML(school) + '</p>' +
            '<p><b>' + t('gradeField') + '</b> ' + escapeHTML(grade) + '</p>' +
          '</div>' +
          '<div>' +
            '<h3>&nbsp;</h3>' +
            '<p><b>' + t('districtField') + '</b> ' + escapeHTML(String(district)) + '</p>' +
            '<p><b>' + t('curriculumField') + '</b> ' + escapeHTML(curriculum) + '</p>' +
          '</div>' +
        '</div>' +

        '<div class="subcard bg-blue section">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">' +
            '<h3 style="margin:0;">' + t('moduleInformation') + '</h3>' +
            '<div>' +
              '<button id="btnPrev" class="btn btn-secondary">' + t('prevBtn') + '</button>' +
              '<button id="btnNext" class="btn btn-secondary">' + t('nextBtn') + '</button>' +
            '</div>' +
          '</div>' +
          '<p><b>' + t('moduleField') + '</b> ' + escapeHTML(String(module_number || '')) + '</p>' +
          '<p><b>' + t('themeField') + '</b> ' + escapeHTML(module_title || '—') + '</p>' +
          '<p><b>' + t('dateRangeField') + '</b> ' + escapeHTML(dateLabel || '—') + '</p>' +
        '</div>' +

        (eqParagraph ? ('<div class="subcard bg-green section"><h3>' + t('essentialQuestions') + '</h3>' + eqParagraph + '</div>') : '') +

        (genrePills ? ('<div class="subcard bg-yellow section"><h3>' + t('textGenres') + '</h3><div id="genres">' + genrePills + '</div></div>') : '') +

        ('<div class="subcard bg-purple section"><h3>' + t('readingList') + '</h3>' + readingListIntro + (bookList ? ('<ul class="book-list">' + bookList + '</ul>') : '<div class="empty">' + t('noResultsGeneric') + '</div>') + soraNote + '</div>') +

        '<div class="section" style="font-size:12px;color:#475569;">' + t('dataSource') + ' <a href="https://sites.google.com/schools.nyc.gov/nycpslc/resources-for-core-instruction?utm_source" target="_blank" rel="noopener">NYC DOE Pacing Guides</a></div>' +
      '</div>'
    );
  }

  function renderResults(items) {
    if (!els.resultsMount) return;
    if (!Array.isArray(items) || items.length === 0) {
      clearRoleBlocks();
      els.resultsMount.innerHTML = '<div class="empty">' + t('noResults') + '</div>';
      return;
    }
    const row = items[0];
    console.log('[Search] Raw row sample', {
      books_json: row && row.books_json,
      text_genres: row && row.text_genres,
    });
    if (row && typeof row.books_source !== 'undefined') {
      try {
        const bj = row.books_json;
        let tmpBooks = [];
        if (Array.isArray(bj)) tmpBooks = bj;
        else if (typeof bj === 'string' && bj.trim()) {
          try { const parsed = JSON.parse(bj); tmpBooks = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : []); } catch (e) {}
        }
        console.log('[Search] books_source', row.books_source, 'books_len', Array.isArray(tmpBooks) ? tmpBooks.length : 0);
      } catch (e) {}
    }
    // Keep current selection context
    state.lastContext = {
      district: row.district,
      school: row.school,
      grade: row.grade,
      curriculum: row.curriculum,
    };
    // Details from matched row
    const eqRaw = String(row.essential_question || row.essentialQuestion || '')
      .replace(/\s*[\r\n]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const genres = Array.isArray(row.genres) ? row.genres : String(row.text_genres || row.textGenres || '')
      .split(/[\n]+/).map(s => s.trim()).filter(Boolean);
    let books = [];
    // Prefer new 'books' array from API; fallback to books_json for compatibility
    if (Array.isArray(row.books)) {
      books = row.books;
    } else {
      const bj = row.books_json;
      if (Array.isArray(bj)) {
        books = bj;
      } else if (typeof bj === 'string' && bj.trim()) {
        try {
          const parsed = JSON.parse(bj);
          books = Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : []);
        } catch (e) { books = []; }
      } else {
        books = [];
      }
    }
    console.log('[Debug] Essential Questions raw:', eqRaw);
    console.log('[Search] Parsed books', { books_len: books.length, sample: books.slice(0, 3) });
    state.lastDetails = {
      eqRaw,
      genres,
      books,
      translations: row && row.translations && typeof row.translations === 'object' ? row.translations : {},
    };

    // Load modules and set active index
    const params = new URLSearchParams({
      curriculum: String(row.curriculum || ''),
      grade: String(row.grade || ''),
      language: state.selectedLanguage || 'en',
    });
    fetch('/api/modules?' + params.toString(), { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('modules fetch failed')))
      .then(json => {
        state.modules = Array.isArray(json.modules) ? json.modules : [];
        const currentNum = Number(row.module_number || (row.module ? String(row.module).replace(/^[^0-9]*/, '') : '')) || 0;
        state.activeIndex = Math.max(0, state.modules.findIndex(m => Number(m.module_number) === currentNum));
        console.log('[Search] Rendering result', {
          district: state.lastContext.district,
          school: state.lastContext.school,
          grade: state.lastContext.grade,
          curriculum: state.lastContext.curriculum,
          module_number: state.modules[state.activeIndex] ? state.modules[state.activeIndex].module_number : ''
        });
        renderResultFromState();
        updateNavButtons();
      })
      .catch(err => {
        console.error('Failed to load modules', err);
        state.modules = [];
        state.activeIndex = 0;
        console.log('[Search] Rendering result (no modules)', {
          district: state.lastContext.district,
          school: state.lastContext.school,
          grade: state.lastContext.grade,
          curriculum: state.lastContext.curriculum
        });
        renderResultFromState();
      });
  }

  function renderResultFromState() {
    if (!els.resultsMount || !state.lastContext) return;
    const ctx = state.lastContext;
    const mod = (state.modules && state.modules[state.activeIndex]) || null;
    const translations = state.lastDetails.translations || {};
    const localeTranslation = translations[state.selectedLanguage] || {};
    const moduleTranslation = mod && mod.translations && mod.translations[state.selectedLanguage]
      ? mod.translations[state.selectedLanguage]
      : {};
    const activeTranslation = Object.assign({}, localeTranslation, moduleTranslation);
    const dateLabel = (mod && mod.start_md && mod.end_md) ? (mod.start_md + ' – ' + mod.end_md) : '';
    const activeGenres = Array.isArray(activeTranslation.genres)
      ? activeTranslation.genres
      : activeTranslation.text_genres
        ? activeTranslation.text_genres.split(/[\r\n]+/).map(value => value.trim()).filter(Boolean)
        : (mod && Array.isArray(mod.genres) ? mod.genres : state.lastDetails.genres || []);
    const activeBooks = mod && Array.isArray(mod.books) ? mod.books : state.lastDetails.books || [];
    const html = renderResultCard({
      district: ctx.district,
      school: ctx.school,
      grade: ctx.grade,
      curriculum: ctx.curriculum,
      module_number: mod ? mod.module_number : '',
      module_title: activeTranslation.module_title || (mod ? mod.module_title : ''),
      dateLabel,
      essential_question: activeTranslation.essential_question || (mod && mod.essential_question) || state.lastDetails.eqRaw || '',
      text_genres: activeGenres,
      books: activeBooks.map(book => Object.assign({}, book, {
        translated_title: activeTranslation.books && activeTranslation.books[book.title],
      })),
    });
    applyRoleBlocks(html);
    const prevBtn = document.getElementById('btnPrev');
    const nextBtn = document.getElementById('btnNext');
    if (prevBtn && nextBtn) {
      prevBtn.onclick = () => { if (state.activeIndex > 0) { state.activeIndex--; renderResultFromState(); updateNavButtons(); } };
      nextBtn.onclick = () => { if (state.activeIndex < state.modules.length - 1) { state.activeIndex++; renderResultFromState(); updateNavButtons(); } };
    }
  }

  function updateNavButtons(){
    const prevBtn = document.getElementById('btnPrev');
    const nextBtn = document.getElementById('btnNext');
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = (state.activeIndex <= 0);
    nextBtn.disabled = (state.activeIndex >= (state.modules ? state.modules.length - 1 : 0));
  }

  async function doSearch() {
    const params = new URLSearchParams();
    if (els.date.value) params.set('date', els.date.value);
    if (els.district.value) params.set('district', els.district.value);
    const schoolValue = String(els.schoolInput.value || '').trim();
    if (schoolValue) params.set('school', schoolValue);
    if (els.grade.value) params.set('grade', els.grade.value);
    if (els.role && els.role.value) params.set('role', els.role.value);
    params.set('language', state.selectedLanguage || 'en');

    const url = '/api/search' + (params.toString() ? ('?' + params.toString()) : '');
    try {
      console.log('[Search] Request start', url);
      if (els.search) { els.search.disabled = true; els.search.textContent = t('searchingBtn'); }
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to search');
      const json = await res.json();
      console.log('[Search] API response', json);
      const items = Array.isArray(json.results) ? json.results : [];
      if (items.length === 0 && json && json.message) {
        renderEmptyMessageFromResponse(json);
      } else {
        renderResults(items);
      }
    } catch (e) {
      console.error('Failed to fetch /api/search', e);
      clearRoleBlocks();
      if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('searchError') + '</div>';
    } finally {
      if (els.search) { els.search.disabled = false; els.search.textContent = t('searchBtn'); }
      console.log('[Search] Request end');
    }
  }

  function bindEvents() {
    const runSearch = () => {
      console.log('[Search] Button clicked');
      const districtVal = String(els.district.value || '').trim();
      const schoolVal = String(els.schoolInput.value || '').trim();
      const gradeVal = String(els.grade.value || '').trim();
      const dateVal = String(els.date.value || '').trim();
      state.selectedRole = els.role ? String(els.role.value || '').trim() : '';
      console.log('[Search] Selected role', currentRoleValue());

      // Validation (district optional)
      if (!schoolVal) {
        clearRoleBlocks();
        if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('schoolRequired') + '</div>';
        return;
      }
      if (!gradeVal) {
        clearRoleBlocks();
        if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('gradeRequired') + '</div>';
        return;
      }
      if (!dateVal || !/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        clearRoleBlocks();
        if (els.resultsMount) els.resultsMount.innerHTML = '<div class="empty">' + t('dateRequired') + '</div>';
        return;
      }
      // If district is blank, attempt to infer from meta.schools
      if (!districtVal && state.meta && Array.isArray(state.meta.schools)) {
        const match = state.meta.schools.find(s => String(s.school || '').trim() === schoolVal);
        if (match && match.district) {
          els.district.value = String(match.district);
        }
      }
      void doSearch();
    };

    els.district.addEventListener('change', () => { onDistrictChange(); });
    els.schoolInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } });
    els.clearSchool.addEventListener('click', () => { els.schoolInput.value = ''; els.schoolInput.focus(); });
    els.grade.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } });
    els.date.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } });
    if (els.role) {
      els.role.addEventListener('change', () => {
        state.selectedRole = String(els.role.value || '').trim();
        if (state.lastContext) renderResultFromState();
      });
    }
    if (els.language) {
      els.language.addEventListener('change', () => {
        state.selectedLanguage = els.language.value || 'en';
        saveStoredLanguage(state.selectedLanguage);
        applyLanguage();
        recomputeGradeOptionsForSelection();
        if (state.lastContext) void doSearch();
      });
    }
    els.clear.addEventListener('click', () => {
      setDefaultDate();
      els.district.value = '';
      els.grade.value = '';
      if (els.role) els.role.value = '';
      state.selectedRole = '';
      onDistrictChange();
      els.schoolInput.value = '';
      clearRoleBlocks();
      if (els.resultsMount) els.resultsMount.innerHTML = '';
    });
    if (els.search) { els.search.addEventListener('click', (e) => { e.preventDefault(); runSearch(); }); }
    if (els.filtersForm) { els.filtersForm.addEventListener('submit', (e) => { e.preventDefault(); runSearch(); }); }
  }

  function bindProgramEvents() {
    if (els.k8ProgramButton) els.k8ProgramButton.addEventListener('click', () => selectProgram('k8'));
    if (els.prekProgramButton) els.prekProgramButton.addEventListener('click', () => selectProgram('prek'));
  }

  function selectProgram(program) {
    state.selectedProgram = program;
    const isK8 = program === 'k8';
    if (els.k8ProgramButton) {
      els.k8ProgramButton.setAttribute('aria-pressed', String(isK8));
      els.k8ProgramButton.classList.toggle('is-selected', isK8);
    }
    if (els.prekProgramButton) {
      els.prekProgramButton.setAttribute('aria-pressed', String(!isK8));
      els.prekProgramButton.classList.toggle('is-selected', !isK8);
    }
    if (els.filters) els.filters.hidden = !isK8;
    if (els.prekResources) els.prekResources.hidden = isK8;
    if (els.resultsDivider) els.resultsDivider.hidden = !isK8;
    if (els.results) els.results.hidden = !isK8;
    if (els.feedbackSection) els.feedbackSection.hidden = !isK8;
  }

  (async function boot() {
    try {
      await loadAdditionalTranslations();
    } catch (err) {
      console.error('Failed to load additional language translations', err);
    }
    state.selectedLanguage = getStoredLanguage();
    if (els.language) els.language.value = state.selectedLanguage;
    applyLanguage();
    selectProgram('k8');
    // Initialize placeholders so dropdowns are visible immediately
    if (els.district) setOptions(els.district, [], t('allDistricts'));
    if (els.grade) setOptions(els.grade, [], t('allGrades'));
    setDefaultDate();
    bindProgramEvents();
    console.log('[Boot] Default date set', els.date ? els.date.value : null);
    await loadMeta();
    console.log('[Boot] loadMeta complete', {
      districtOptions: els.district && els.district.options ? els.district.options.length : null,
      gradeOptions: els.grade && els.grade.options ? els.grade.options.length : null,
      schoolOptions: els.schoolList ? els.schoolList.children.length : null,
    });
    bindEvents();
    console.log('[Boot] Event binding complete');
  }());
})();
