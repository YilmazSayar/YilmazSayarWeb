<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import ContactWatchers from './components/ContactWatchers.vue'

const STORAGE_KEY = 'portfolio-accent-color'
const LOCALE_KEY = 'portfolio-locale'
const DEFAULT_ACCENT = '#f59e0b'

const accentColor = ref(DEFAULT_ACCENT)
const showColorPicker = ref(false)
const mobileMenuOpen = ref(false)

const presetColors = [
  '#f59e0b', '#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4',
  '#14b8a6', '#10b981', '#f43f5e', '#ef4444', '#a1a1aa',
]

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '245, 158, 11'
}

function applyAccent(hex) {
  accentColor.value = hex
  document.documentElement.style.setProperty('--accent', hex)
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(hex))
  try { localStorage.setItem(STORAGE_KEY, hex) } catch (_) {}
}

function chooseColor(hex) {
  stopColorCycle()
  applyAccent(hex)
  showColorPicker.value = false
}

/* RGB modu — vurgu rengini renk çemberinde sürekli döndürür */
const colorCycleActive = ref(false)
const CYCLE_DURATION_MS = 12000
let cycleAnimationId = null
let cycleStartTime = 0

function hslToHex(h, s, l) {
  h = h % 360
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  const r = Math.round(f(0) * 255)
  const g = Math.round(f(8) * 255)
  const b = Math.round(f(4) * 255)
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

function setAccentFromHue(hue) {
  const hex = hslToHex(hue, 82, 58)
  accentColor.value = hex
  document.documentElement.style.setProperty('--accent', hex)
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(hex))
}

function runCycleStep(timestamp) {
  if (!cycleAnimationId) return
  if (cycleStartTime === 0) cycleStartTime = timestamp
  const elapsed = timestamp - cycleStartTime
  const hue = ((elapsed / CYCLE_DURATION_MS) * 360) % 360
  setAccentFromHue(hue)
  cycleAnimationId = requestAnimationFrame(runCycleStep)
}

function startColorCycle() {
  if (colorCycleActive.value) return
  colorCycleActive.value = true
  document.documentElement.classList.add('color-cycle-active')
  cycleStartTime = 0
  cycleAnimationId = requestAnimationFrame(runCycleStep)
}

function stopColorCycle() {
  if (!colorCycleActive.value) return
  colorCycleActive.value = false
  document.documentElement.classList.remove('color-cycle-active')
  if (cycleAnimationId) {
    cancelAnimationFrame(cycleAnimationId)
    cycleAnimationId = null
  }
  cycleStartTime = 0
  try { localStorage.setItem(STORAGE_KEY, accentColor.value) } catch (_) {}
}

function toggleColorCycle() {
  if (colorCycleActive.value) stopColorCycle()
  else startColorCycle()
}

const locale = ref('tr')
function setLocale(lang) {
  locale.value = lang
  try { localStorage.setItem(LOCALE_KEY, lang) } catch (_) {}
}

const colorPickerContainer = ref(null)
function closeColorPickerOnClickOutside(e) {
  if (
    showColorPicker.value &&
    colorPickerContainer.value &&
    !colorPickerContainer.value.contains(e.target)
  ) {
    showColorPicker.value = false
  }
}
function toggleThemePicker() {
  showColorPicker.value = !showColorPicker.value
}

let revealObserver = null
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  )
  els.forEach((el) => revealObserver.observe(el))
}

function closeMenu() {
  mobileMenuOpen.value = false
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    applyAccent(saved || DEFAULT_ACCENT)
    const savedLocale = localStorage.getItem(LOCALE_KEY)
    if (savedLocale === 'en' || savedLocale === 'tr') locale.value = savedLocale
  } catch (_) {
    applyAccent(DEFAULT_ACCENT)
  }
  document.addEventListener('click', closeColorPickerOnClickOutside)
  nextTick(initReveal)
})

onUnmounted(() => {
  document.removeEventListener('click', closeColorPickerOnClickOutside)
  if (revealObserver) revealObserver.disconnect()
  stopColorCycle()
})

const t = computed(() => ({
  nav: {
    about: locale.value === 'tr' ? 'Hakkımda' : 'About',
    skills: locale.value === 'tr' ? 'Yetenekler' : 'Skills',
    experience: locale.value === 'tr' ? 'Deneyim' : 'Experience',
    education: locale.value === 'tr' ? 'Eğitim' : 'Education',
    projects: locale.value === 'tr' ? 'Projeler' : 'Projects',
    contact: locale.value === 'tr' ? 'İletişim' : 'Contact',
    downloadCv: locale.value === 'tr' ? 'CV İndir' : 'Download CV',
    menu: locale.value === 'tr' ? 'Menü' : 'Menu',
  },
  hero: {
    status: locale.value === 'tr' ? 'Junior Yazılım Geliştirici - Yazılım Destek Uzmanı' : 'Junior Software Developer - Software Support Specialist',
    role: locale.value === 'tr' ? 'Bilgisayar Mühendisi' : 'Computer Engineer',
    lead:
      locale.value === 'tr'
        ? 'Yazılım projelerini yapay zeka ve makine öğrenmesiyle birleştiren bir mühendis adayı. Backend, API tasarımı ve modern web üzerine çalışıyorum.'
        : 'An engineer-in-training combining software with AI and machine learning. I work on backend systems, API design and modern web.',
    contact: locale.value === 'tr' ? 'İletişime geç' : 'Get in touch',
  },
  sections: {
    about: locale.value === 'tr' ? 'Hakkımda' : 'About',
    education: locale.value === 'tr' ? 'Eğitim' : 'Education',
    projects: locale.value === 'tr' ? 'Projeler' : 'Projects',
    experience: locale.value === 'tr' ? 'Deneyim' : 'Experience',
    skills: locale.value === 'tr' ? 'Yetenekler' : 'Skills',
    contact: locale.value === 'tr' ? 'İletişim' : 'Contact',
    team: locale.value === 'tr' ? 'Tek başıma değilim, 5 kişilik büyük bir ekibiz...' : 'I am not alone — we are a team of five...',
  },
  labels: {
    details: locale.value === 'tr' ? 'Detayları gör' : 'View details',
    close: locale.value === 'tr' ? 'Kapat' : 'Close',
    themeColor: locale.value === 'tr' ? 'Tema rengi' : 'Theme color',
    rgbMode: locale.value === 'tr' ? 'RGB modu — renkler otomatik değişsin' : 'RGB mode — auto-cycle colors',
    rgbHint: locale.value === 'tr' ? 'Son kare: otomatik döngü' : 'Last swatch: auto-cycle',
    custom: locale.value === 'tr' ? 'Özel' : 'Custom',
    email: locale.value === 'tr' ? 'E-posta' : 'Email',
    contactLead:
      locale.value === 'tr'
        ? 'Bir fikir, iş birliği ya da sadece merhaba demek için ulaşabilirsiniz.'
        : 'Reach out for an idea, a collaboration, or just to say hello.',
  },
  form: {
    name: locale.value === 'tr' ? 'İsim Soyisim' : 'Full Name',
    namePlaceholder: locale.value === 'tr' ? 'İsim Soyisim' : 'Full Name',
    mail: 'Mail',
    mailPlaceholder: 'ornek@gmail.com',
    subject: locale.value === 'tr' ? 'Konu' : 'Subject',
    subjectPlaceholder: locale.value === 'tr' ? 'Proje Hakkında' : 'About the project',
    message: locale.value === 'tr' ? 'Mesajınız' : 'Your Message',
    messagePlaceholder:
      locale.value === 'tr' ? 'Projeniz Hakkında Detaylı Bilgi Verin...' : 'Tell me about your project...',
    send: locale.value === 'tr' ? 'Mesaj Gönder' : 'Send Message',
    sending: locale.value === 'tr' ? 'Gönderiliyor...' : 'Sending...',
    success:
      locale.value === 'tr'
        ? 'Mesajınız gönderildi. En kısa sürede dönüş yapacağım.'
        : 'Your message has been sent. I will get back to you soon.',
    pending:
      locale.value === 'tr'
        ? 'Form ilk kez etkinleştiriliyor. Site sahibi onayladıktan sonra tekrar gönderdiğinizde mesajınız iletilecek.'
        : 'The form is being activated for the first time. Once the owner confirms it, your next message will be delivered.',
    error:
      locale.value === 'tr'
        ? 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin veya doğrudan e-posta gönderin.'
        : 'Message could not be sent. Please try again later or email directly.',
  },
  readout: {
    file: 'yilmaz.profile',
    rows:
      locale.value === 'tr'
        ? [
            { k: 'DURUM', v: 'Çalışıyor · Yazılım Destek Uzmanı — Freelance\'a açık', dot: true },
            { k: 'ODAK', v: 'Backend · Yapay Zeka · Full-stack' },
            { k: 'ŞİRKET', v: 'Seneka Yazılım' },
            { k: 'KONUM', v: 'Türkiye' },
            { k: 'YIĞIN', v: 'Java · C# · Spring · .NET · Vue' },
          ]
        : [
            { k: 'STATUS', v: 'Working · Software Support Specialist — Open to freelance', dot: true },
            { k: 'FOCUS', v: 'Backend · AI · Full-stack' },
            { k: 'COMPANY', v: 'Seneka Yazılım' },
            { k: 'LOCATION', v: 'Türkiye' },
            { k: 'STACK', v: 'Java · C# · Spring · .NET · Vue' },
          ],
  },
  footStatement:
    locale.value === 'tr' ? 'Kod yazarak öğrenir, öğrenerek üretirim.' : 'I learn by building, and build by learning.',
}))

const aboutFacts = computed(() =>
  locale.value === 'tr'
    ? [
        { k: 'ÜNİVERSİTE', v: 'Selçuk Üniversitesi' },
        { k: 'BÖLÜM', v: 'Bilgisayar Mühendisliği' },
        { k: 'SINIF', v: '4. sınıf' },
        { k: 'ODAK', v: 'AI · Makine Öğrenmesi · Web' },
      ]
    : [
        { k: 'UNIVERSITY', v: 'Selçuk University' },
        { k: 'DEPARTMENT', v: 'Computer Engineering' },
        { k: 'YEAR', v: '4th year' },
        { k: 'FOCUS', v: 'AI · Machine Learning · Web' },
      ],
)

const projectsTr = [
  {
    category: 'AI & Backend',
    language: 'Java',
    title: 'TeachWork Görev Atama Sistemi',
    description:
      'TeachWork, eğitim ve iş ortamları için tasarlanmış bir görev ve ekip yönetimi web uygulamasıdır. Kullanıcılar kayıt olup giriş yapabilir, odalar oluşturup oda kodu ile katılabilir, bu odalarda görev atayıp durumlarını güncelleyebilir. Odalarda sohbet ve oylama yapılabilir; gruplar oluşturulup yönetilebilir. Uygulama, Google Gemini ile entegre bir yapay zeka asistanı sunar: Görevlere eklenen PDF dosyaları üzerinde soru-cevap ve analiz yapılabilir. Raporlama modülü ile görev ve çalışma sonuçları raporlanabilir; tüm bu işlevler REST API ve SpringDoc OpenAPI ile dokümante edilmiştir.',
    tags: ['Java 17', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Google Gemini API', 'Thymeleaf', 'Tailwind CSS', 'SpringDoc OpenAPI', 'IntelliJ IDEA'],
    githubUrl: 'https://github.com/YilmazSayar/TeachWork-Projesi',
  },
  {
    category: 'Plugin',
    title: 'Redmine Durum Takip Eklentisi',
    language: 'Ruby',
    description:
      'Redmine proje yönetim sistemi için durum takip eklentisi. Ruby on Rails ile IDE kullanılmadan geliştirildi.',
    tags: ['Ruby', 'Ruby on Rails', 'Redmine', 'HTML'],
    githubUrl: 'https://github.com/YilmazSayar/Redmine-Durum-Takip-Eklentisi',
  },
  {
    category: 'Video / Frontend',
    title: 'SenekaRemotion',
    language: 'Remotion',
    description:
      'Remotion teknolojisiyle geliştirilen bu projede video parçaları frame frame kodlanmaktadır. Bu kodlamalar, gerçek bir yaratıcılıkla birleştirilerek ortaya gerçek bir mühendislik ürünü çıkarır. Seneka şirketi için bir tanıtım videosu olacak bu çalışmayı, farklı video düzenleme araçları kullanmadan uzman olduğum alanda gerçekleştirmek istedim ve frame frame kodlama yaparak hem yaratıcı hem de dinamik bir video ortaya çıkardım. Geliştirdiğim bu proje aktif olarak müşterilerle paylaşılmaktadır.',
    tags: ['Remotion', 'React', 'Video', 'TypeScript'],
    githubUrl: 'https://github.com/YilmazSayar/SenekaRemotion',
  },
  {
    category: 'Chat Bot',
    title: 'Seneka Onaylarım ChatBot',
    language: 'Python',
    description:
      'Onaylarım ChatBot, Seneka Yazılım\'ın Onaylarım uygulaması kullanıcıları için geliştirdiğim, yapay zeka destekli bir soru-cevap asistanıdır. Kullanıcılar; elektronik imza, dijital onay süreçleri, KEP (Kayıtlı Elektronik Posta), belge doğrulama, kullanıcı yönetimi ve kurumsal iş akışları gibi konularda doğal dilde soru sorar; yanıtlar, dokümanlardan alınan bilgilerle zenginleştirilerek verilir. Hibrit arama (anahtar kelime + anlamsal) ile en ilgili metin parçaları seçilir; büyük dil modeli bu bağlamı kullanarak yalnızca Onaylarım kapsamında ve Türkçe yanıt üretir. Gizlilik kuralları sayesinde müşteri veya kurum isimleri asla paylaşılmaz; sadece ürün özellikleri ve kullanım bilgisi sunulur. Proje kodları, gizlilik ilkesi nedeniyle paylaşılmamaktadır.',
    tags: ['Python', 'FastAPI', 'Groq API', 'Llama', 'Sentence Transformers', 'JavaScript'],
  },
  {
    category: 'Chat Bot',
    title: 'Seneka EBYS ChatBot',
    language: 'Python',
    description:
      'Onaylarım ChatBot projesiyle aynı mimariyi kullandığım, ancak farklı veri setleriyle geliştirdiğim bu çalışma, EBYS ürünü için geliştirilmiş bir ChatBot projesidir. Proje, kullanıcı sorularına detaylı şekilde yanıt verir; kullanıcının yapmak istediği işlemin uygulama ana menüsünden başlayarak adım adım nasıl yapılacağını tarif eder. Hem kullanıcılar hem de satış departmanında kullanılmak üzere geliştirdiğim bu proje, birçok sunumda satış ekibimizin teknik sorularını yanıtlamış ve teknik ekibimizin üzerindeki iş yükünü azaltmıştır. Proje kodları, gizlilik ilkesi nedeniyle paylaşılmamaktadır.',
    tags: ['Python', 'FastAPI', 'Groq API', 'Llama', 'Sentence Transformers', 'JavaScript'],
  },
  {
    category: 'Web Uygulaması',
    title: 'İzinlerim — geliştirme devam ediyor',
    language: 'C#',
    description:
      'Çalışanların yıllık izin talep formlarını yöneticilerine göndererek talepte bulunduğu, birim yöneticilerinin talepleri imzalayarak onayladığı veya reddettiği ve kalan izin günlerini yönettiği tam kapsamlı bir web uygulaması geliştirdim. Sistemde rol tabanlı erişim (Birim yöneticisi, Çalışan), birim ve davet kodu ile üyelik, izin talebi oluşturma ve onay akışı, personel listesinde kalan izin günü güncelleme ve arama/filtreleme özellikleri bulunmaktadır. Sisteme yalnızca kullanıcı hesabı ile kayıt olunur; talep dahilinde sistem yöneticisi rol ataması gerçekleştirir. Backend tarafında ASP.NET Core Web API, Entity Framework Core ve PostgreSQL kullandım. E-imza atılabilmesi için Seneka PrimeAPI entegrasyonunu kendim gerçekleştirdim. Kimlik doğrulama JWT Bearer ile sağlanmaktadır. Frontend tarafında Nuxt (Vue 3) ile SPA yapısında, Tailwind CSS ile responsive bir arayüz tasarladım. RESTful API tasarımı ve Swagger ile dokümantasyon uygulandı.',
    tags: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Nuxt', 'Vue 3', 'Tailwind CSS', 'Swagger'],
  },
]

const projectsEn = [
  {
    category: 'AI & Backend',
    language: 'Java',
    title: 'TeachWork Task Assignment System',
    description:
      'TeachWork is a task and team management web application designed for education and work environments. Users can register and sign in, create rooms and join via room code, assign tasks in these rooms and update their status. Rooms support chat and voting; groups can be created and managed. The application provides an AI assistant integrated with Google Gemini: both general conversation and Q&A or analysis on PDF files attached to tasks are supported. A reporting module allows task and work results to be reported; all these features are documented with REST API and SpringDoc OpenAPI.',
    tags: ['Java 17', 'Spring Boot', 'Spring Security', 'PostgreSQL', 'Google Gemini API', 'Thymeleaf', 'Tailwind CSS', 'SpringDoc OpenAPI', 'IntelliJ IDEA'],
    githubUrl: 'https://github.com/YilmazSayar/TeachWork-Projesi',
  },
  {
    category: 'Plugin',
    title: 'Redmine Status Tracking Plugin',
    language: 'Ruby',
    description:
      'Status tracking plugin for Redmine. Developed with Ruby on Rails without an IDE.',
    tags: ['Ruby', 'Ruby on Rails', 'Redmine', 'HTML'],
    githubUrl: 'https://github.com/YilmazSayar/Redmine-Durum-Takip-Eklentisi',
  },
  {
    category: 'Video / Frontend',
    title: 'SenekaRemotion',
    language: 'Remotion',
    description:
      'In this project built with Remotion technology, video segments are coded frame by frame. By combining this coding approach with creativity, the result becomes a true engineering product. I wanted to produce this promotional video for Seneka in my area of expertise, without relying on traditional video editing tools, and created a dynamic and creative output through frame-by-frame coding. This project is actively shared with customers.',
    tags: ['Remotion', 'React', 'Video', 'TypeScript'],
    githubUrl: 'https://github.com/YilmazSayar/SenekaRemotion',
  },
  {
    category: 'Chat Bot',
    title: 'Seneka Onaylarım ChatBot',
    language: 'Python',
    description:
      'Onaylarım Chatbot is an AI-powered Q&A assistant that I developed for users of Seneka\'s Onaylarım application. Users ask questions in natural language about electronic signature, digital approval processes, KEP (Registered Electronic Mail), document verification, user management and corporate workflows; answers are enriched with information from documents. Hybrid search (keyword + semantic) selects the most relevant text passages, and a large language model uses this context to produce answers only within the scope of Onaylarım and in Turkish. Privacy rules ensure that customer or organization names are never shared; only product features and usage information are provided. Project code is not shared due to privacy policy.',
    tags: ['Python', 'FastAPI', 'Groq API', 'Llama', 'Sentence Transformers', 'JavaScript'],
  },
  {
    category: 'Chat Bot',
    title: 'Seneka EBYS ChatBot',
    language: 'Python',
    description:
      'This chatbot project was developed for the EBYS product, using the same architecture as the Onaylarım ChatBot project but trained with different datasets. It provides detailed answers to user questions and explains how to complete requested actions step by step, starting from the application main menu. I developed it for both end users and the sales department; in many presentations, it answered technical questions from the sales team and reduced this workload on our technical team. Project code is not shared due to privacy policy.',
    tags: ['Python', 'FastAPI', 'Groq API', 'Llama', 'Sentence Transformers', 'JavaScript'],
  },
  {
    category: 'Web Application',
    title: 'İzinlerim — development in progress',
    language: 'C#',
    description:
      'I developed a full-featured web application where employees create annual leave requests, unit managers approve or reject requests, and manage remaining leave days. The system includes role-based access (Unit manager, Employee), membership by unit and invite code, leave request creation and approval workflow, updating remaining leave days in the personnel list, and search/filter features. Registration is by user account only; the system admin assigns roles on request. On the backend I used ASP.NET Core Web API, Entity Framework Core and PostgreSQL; authentication is handled with JWT Bearer. On the frontend I built an SPA with Nuxt (Vue 3) and a responsive UI with Tailwind CSS. RESTful API design and Swagger documentation are in place.',
    tags: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Nuxt', 'Vue 3', 'Tailwind CSS', 'Swagger'],
  },
]

const experiencesTr = [
  {
    company: 'Seneka Yazılım',
    role: 'Yazılım Destek Uzmanı',
    badge: 'Personel',
    date: 'Ağustos 2026 - Güncel',
    duration: 'Güncel',
    description:
      'Ürün güncelleştirmeleri, iyileştirmeleri ve testleri; sunucu bakımları, sunucu siber güvenlik testleri, güncelleme dağıtımı, teknik destek talepleri, toplantı yöneticiliği ve sunum konuşmacılığı.',
  },
  {
    company: 'Seneka Yazılım',
    role: 'Satış Öncesi Teknik Uzmanı',
    badge: 'Staj',
    date: 'Haziran 2026 - Ağustos 2026',
    duration: '2 ay',
    description:
      'Potansiyel ve mevcut müşteri toplantıları moderatörlüğü, yönetimi ve sunum konuşmacılığı.',
  },
  {
    company: 'Seneka Yazılım',
    role: 'Yazılım Geliştirme Stajyeri',
    badge: 'Staj',
    date: 'Şubat 2026 - Haziran 2026',
    duration: '4 ay',
    highlight: 'Elektronik Belge Yönetim Sistemi, ONAYLARIM e-İmza platformu, PrimeAPI',
    description: ' ürünlerinde geliştirme, test etme ve güncelleme işlemleri.',
  },
  {
    company: 'Acun Medya Akademi',
    role: 'Gönüllü Stajyer',
    badge: 'Gönüllü Staj',
    date: '',
    duration: '',
    description:
      'Java, Spring, Spring Boot, API ve Swagger teknolojileriyle web projesi geliştirme ve proje yayınlama.',
  },
  {
    company: 'Motto Elektrik AŞ',
    role: 'Stajyer',
    badge: 'Staj',
    date: 'Temmuz 2025',
    duration: '1.5 ay',
    description:
      'Anakart tasarımları, elektronik devre elemanları, mantık devreleri, dizgi makinesi ile dizgi, lehimleme ve web sitesi tasarımı.',
  },
  {
    company: 'Nova Academy Konya',
    role: 'Yazılım Geliştirme Eğitmeni',
    badge: 'Eğitmen',
    date: 'Temmuz 2024',
    duration: '1 ay',
    description: 'Çocuklara yönelik yazılım geliştirme öğretmenliği.',
  },
]
const experiencesEn = [
  {
    company: 'Seneka Yazılım',
    role: 'Software Support Specialist',
    badge: 'Staff',
    date: 'August 2026 - Present',
    duration: 'Present',
    description:
      'Product updates, improvements and testing; server maintenance, server cyber-security testing, update deployment, technical support requests, meeting management and presentation speaking.',
  },
  {
    company: 'Seneka Yazılım',
    role: 'Pre-Sales Technical Specialist',
    badge: 'Internship',
    date: 'June 2026 - August 2026',
    duration: '2 months',
    description:
      'Moderation and management of potential and existing customer meetings, and presentation speaking.',
  },
  {
    company: 'Seneka Yazılım',
    role: 'Software Development Intern',
    badge: 'Internship',
    date: 'February 2026 - June 2026',
    duration: '4 months',
    highlight: 'Electronic Document Management System, ONAYLARIM e-Signature platform, PrimeAPI',
    description: ' — development, testing and update work on these products.',
  },
  {
    company: 'Acun Medya Akademi',
    role: 'Volunteer Intern',
    badge: 'Volunteer',
    date: '',
    duration: '',
    description:
      'Web project development and deployment with Java, Spring, Spring Boot, API and Swagger technologies.',
  },
  {
    company: 'Motto Elektrik AŞ',
    role: 'Intern',
    badge: 'Internship',
    date: 'July 2025',
    duration: '1.5 months',
    description:
      'Mainboard design, electronic circuit components, logic circuits, SMT placement, soldering and website design.',
  },
  {
    company: 'Nova Academy Konya',
    role: 'Software Development Instructor',
    badge: 'Instructor',
    date: 'July 2024',
    duration: '1 month',
    description: 'Teaching software development to children.',
  },
]

const educationsTr = [
  { school: 'Düzce Üniversitesi — Bilgisayar Mühendisliği', duration: 'Eylül 2022 - Ocak 2023' },
  { school: 'Selçuk Üniversitesi — Bilgisayar Mühendisliği', duration: 'Ocak 2023 - Devam ediyor' },
  { school: 'Acun Medya Akademi — FullStack Developer', duration: 'Şubat 2025 - Ağustos 2025' },
  { school: 'Mesut Ilıca — Sıfırdan FullStack C#.NET', duration: 'Udemy, 59 saatlik program' },
  { school: 'American Kültür Dil Okulu — İngilizce', duration: 'Temmuz 2024 - Şubat 2025' },
]
const educationsEn = [
  { school: 'Düzce University — Computer Engineering', duration: 'September 2022 - January 2023' },
  { school: 'Selçuk University — Computer Engineering', duration: 'January 2023 - Ongoing' },
  { school: 'Acun Medya Academy — FullStack Developer', duration: 'February 2025 - August 2025' },
  { school: 'FullStack C#.NET from Scratch', duration: 'Udemy, 59-hour program' },
  { school: 'American Kültür Language School — English', duration: 'July 2024 - February 2025' },
]

const projects = computed(() => (locale.value === 'tr' ? projectsTr : projectsEn))
const experiences = computed(() => (locale.value === 'tr' ? experiencesTr : experiencesEn))
const educations = computed(() => (locale.value === 'tr' ? educationsTr : educationsEn))

const selectedProjectIndex = ref(null)
const selectedProject = computed(() => {
  if (selectedProjectIndex.value === null) return null
  return projects.value[selectedProjectIndex.value] ?? null
})
function openProjectDetails(index) {
  selectedProjectIndex.value = index
}
function closeProjectDetails() {
  selectedProjectIndex.value = null
}

const skillCategories = [
  { name: 'Backend', items: ['Java', 'C#', 'Spring', 'Spring Boot', 'Spring Security', 'ASP.NET Core', 'SQL', 'PostgreSQL', 'Python', 'FastAPI'] },
  { name: 'Frontend', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue 3', 'Nuxt', 'Thymeleaf', 'Tailwind CSS', 'TypeScript', 'jQuery', 'Bootstrap'] },
  { name: 'API & AI', items: ['Swagger', 'SpringDoc OpenAPI', 'Google Gemini API', 'Groq API', 'Llama', 'Sentence Transformers'] },
  { name: 'Tools', items: ['IntelliJ IDEA', 'Remotion', 'Redmine', 'Adobe Illustrator', 'After Effects'] },
]

const teammates = [
  {
    name: 'Cursor',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23"/></svg>',
  },
  {
    name: 'Claude',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"/></svg>',
  },
  {
    name: 'Gemini',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"/></svg>',
  },
  {
    name: 'ChatGPT',
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>',
  },
  {
    name: 'Yılmaz Sayar',
    svg: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><text x="32" y="44" text-anchor="middle" font-family="\'Space Grotesk\', ui-sans-serif, sans-serif" font-size="34" font-weight="700" letter-spacing="1" fill="currentColor">YS</text></svg>',
  },
]

const contactLinks = [
  { label: 'GitHub', href: 'https://github.com/YilmazSayar', icon: 'GitHub' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/y%C4%B1lmaz-sayar?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', icon: 'LinkedIn' },
]

const EMAIL_ADDRESS = 'sayaryilmaz2004@gmail.com'

/* İletişim formu — FormSubmit.co (ücretsiz, üyelik gerektirmez) üzerinden
   mesajları doğrudan e-posta adresine iletir. İlk gönderimde tek seferlik
   bir onay e-postası gelir; onaylandıktan sonra tüm mesajlar gelen kutusuna düşer. */
const contactForm = ref({ name: '', email: '', subject: '', message: '' })
const contactStatus = ref('idle') // 'idle' | 'sending' | 'success' | 'pending' | 'error'

async function submitContactForm() {
  if (contactStatus.value === 'sending') return
  contactStatus.value = 'sending'
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_ADDRESS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: contactForm.value.name,
        email: contactForm.value.email,
        _subject:
          contactForm.value.subject ||
          (locale.value === 'tr' ? 'Portföy iletişim formu' : 'Portfolio contact form'),
        message: contactForm.value.message,
        _template: 'table',
        _captcha: 'false',
      }),
    })
    const data = await res.json().catch(() => ({}))
    const succeeded = res.ok && data.success !== false && data.success !== 'false'
    if (succeeded) {
      contactStatus.value = 'success'
      contactForm.value = { name: '', email: '', subject: '', message: '' }
      return
    }
    // FormSubmit tek seferlik aktivasyon isterse bunu kullanıcıya ayrı bildir.
    if (/activat/i.test(data.message || '')) {
      contactStatus.value = 'pending'
      return
    }
    throw new Error(data.message || 'request failed')
  } catch (_) {
    contactStatus.value = 'error'
  }
}

const cvPdfUrl = '/YILMAZSAYAR-CV.pdf'
const cvDownloadFilename = 'Yilmaz-Sayar-CV.pdf'

async function downloadCv(e) {
  e.preventDefault()
  const msgMissing =
    locale.value === 'tr'
      ? 'CV dosyası bulunamadı. Lütfen projenin public klasörüne YILMAZSAYAR-CV.pdf adında gerçek bir PDF ekleyin.'
      : 'CV file not found. Please add a real PDF named YILMAZSAYAR-CV.pdf to the project\'s public folder.'
  try {
    const res = await fetch(cvPdfUrl)
    if (!res.ok) throw new Error('not found')
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const blob = await res.blob()
    const isPdfByType = contentType.includes('application/pdf') || blob.type.includes('application/pdf')
    const head = await blob.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(head)
    const isPdfByMagic = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46
    if (!isPdfByType && !isPdfByMagic) throw new Error('not pdf')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = cvDownloadFilename
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    alert(msgMissing)
  }
}

const aboutTextTr = `Selçuk Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim. Yazılım projelerimi makine öğrenmesi ve yapay zeka ile birleştirmeye odaklanan bir mühendis adayıyım. Full stack geliştirme, API tasarımı ve modern web teknolojileri ile ilgileniyorum. Şu anda Seneka Yazılım bünyesinde aldığım birçok eğitim ve çalıştığım birçok alan sonucunda her alanda çalışma yapabileceğim, Yazılım Destek Uzmanlığı pozisyonunda çalışmaktayım. Bu alanda ürün geliştirmeleri, ürün iyileştirmeleri, entegrasyon, toplantı yöneticiliği, sunucu bakımları, sunucu siber güvenlik testleri, güncelleme dağıtımı, teknik destek talepleri ve sunum konuşmacılığı alanlarında çalışmalar yapıyorum. Kullanıcı taleplerine göre çözüm üretiyor, yapay zeka araçlarını etkin şekilde kullanıyorum. Kariyerimde her zaman kendimi gösterebilecek bir ışık arıyor ve bilgim olmayan her konu için endişe duyarak bilgi ediniyorum. Yazılım dünyası benim için bir oyun oynamak gibi ve ben bir oyun bağımlısıyım.`
const aboutTextEn = `I am a 4th year Computer Engineering student at Selçuk University. I am an aspiring engineer focused on combining software projects with machine learning and artificial intelligence. I am interested in full stack development, API design and modern web technologies. Thanks to the many trainings I have received and the many areas I have worked in at Seneka Yazılım, I now work as a Software Support Specialist, a role in which I can contribute across every area. In this position I work on product development, product improvements, integration, meeting management, server maintenance, server cyber-security testing, update deployment, technical support requests and presentation speaking. I produce solutions based on user needs and use AI tools effectively. Throughout my career I am always looking for a spark where I can prove myself, and I approach every topic I do not yet know with a healthy concern that drives me to learn it. The world of software feels like playing a game to me, and I am a game addict.`
const aboutText = computed(() => (locale.value === 'tr' ? aboutTextTr : aboutTextEn))

const currentYear = new Date().getFullYear()
</script>

<template>
  <div>
    <!-- Navigation -->
    <nav class="nav">
      <div class="wrap">
        <div class="nav__inner">
          <a href="#top" class="nav__brand" @click="closeMenu">
            <span class="nav__mark">YS</span>
            Yılmaz Sayar
          </a>

          <div class="nav__rail">
            <a href="#hakkinda" class="nav__link">{{ t.nav.about }}</a>
            <a href="#yetenekler" class="nav__link">{{ t.nav.skills }}</a>
            <a href="#deneyim" class="nav__link">{{ t.nav.experience }}</a>
            <a href="#egitim" class="nav__link">{{ t.nav.education }}</a>
            <a href="#projeler" class="nav__link">{{ t.nav.projects }}</a>
            <a href="#iletisim" class="nav__link">{{ t.nav.contact }}</a>
          </div>

          <div class="nav__right">
            <a href="#" class="btn btn--primary nav__cv" @click.prevent="downloadCv">
              {{ t.nav.downloadCv }}
            </a>
            <div class="lang" role="group" aria-label="Language">
              <button type="button" class="lang__btn" :class="{ 'lang__btn--on': locale === 'tr' }" @click="setLocale('tr')">TR</button>
              <button type="button" class="lang__btn" :class="{ 'lang__btn--on': locale === 'en' }" @click="setLocale('en')">EN</button>
            </div>

            <div ref="colorPickerContainer" class="relative">
              <button
                type="button"
                class="accent-dot"
                :aria-label="t.labels.themeColor"
                :aria-expanded="showColorPicker"
                @click.stop="toggleThemePicker"
              >
                <span aria-hidden="true" />
              </button>
              <Transition name="picker">
                <div v-show="showColorPicker" class="picker absolute right-0 z-50 mt-2 w-max">
                  <p class="mono-label mb-3">{{ t.labels.themeColor }}</p>
                  <div class="picker__grid">
                    <button
                      v-for="color in presetColors"
                      :key="color"
                      type="button"
                      class="swatch"
                      :class="{ 'swatch--on': !colorCycleActive && accentColor.toLowerCase() === color.toLowerCase() }"
                      :style="{ backgroundColor: color }"
                      :aria-label="color"
                      @click="chooseColor(color)"
                    />
                    <button
                      type="button"
                      class="swatch swatch--cycle"
                      :class="{ 'swatch--on': colorCycleActive }"
                      :aria-label="t.labels.rgbMode"
                      :aria-pressed="colorCycleActive"
                      @click.stop="toggleColorCycle"
                    />
                  </div>
                  <p class="mono-label" style="margin-top: 0.6rem">{{ t.labels.rgbHint }}</p>
                  <label class="mt-3 flex items-center gap-2">
                    <span class="mono-label">{{ t.labels.custom }}</span>
                    <input
                      :value="accentColor"
                      type="color"
                      class="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                      @input="stopColorCycle(); applyAccent($event.target.value)"
                    />
                  </label>
                </div>
              </Transition>
            </div>

            <button
              type="button"
              class="nav__burger"
              :aria-label="t.nav.menu"
              :aria-expanded="mobileMenuOpen"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <template v-if="!mobileMenuOpen">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </template>
                <template v-else>
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </template>
              </svg>
            </button>
          </div>
        </div>

        <div v-show="mobileMenuOpen" class="nav__sheet">
          <a href="#hakkinda" @click="closeMenu">{{ t.nav.about }}</a>
          <a href="#yetenekler" @click="closeMenu">{{ t.nav.skills }}</a>
          <a href="#deneyim" @click="closeMenu">{{ t.nav.experience }}</a>
          <a href="#egitim" @click="closeMenu">{{ t.nav.education }}</a>
          <a href="#projeler" @click="closeMenu">{{ t.nav.projects }}</a>
          <a href="#iletisim" @click="closeMenu">{{ t.nav.contact }}</a>
          <a href="#" @click="closeMenu(); downloadCv($event)">{{ t.nav.downloadCv }}</a>
        </div>
      </div>
    </nav>

    <main id="top">
      <!-- Hero -->
      <section class="hero">
        <div class="wrap">
          <div class="hero__grid">
            <div data-reveal class="reveal">
              <span class="hero__status">
                <span class="hero__pulse" aria-hidden="true" />
                {{ t.hero.status }}
              </span>
              <h1 class="hero__name">Yılmaz Sayar</h1>
              <p class="hero__role">{{ t.hero.role }}</p>
              <p class="hero__lead">{{ t.hero.lead }}</p>
              <div class="hero__cta">
                <a href="#" class="btn btn--primary" @click.prevent="downloadCv">{{ t.nav.downloadCv }}</a>
                <a href="#iletisim" class="btn btn--line">{{ t.hero.contact }}</a>
                <a href="https://github.com/YilmazSayar" target="_blank" rel="noopener noreferrer" class="btn btn--ghost">GitHub →</a>
              </div>
            </div>

            <div data-reveal class="reveal panel">
              <div class="panel__bar">
                <span class="panel__file mono">{{ t.readout.file }}</span>
                <span class="panel__chip">READY</span>
              </div>
              <div class="panel__body">
                <div v-for="row in t.readout.rows" :key="row.k" class="panel__row">
                  <span class="panel__key">{{ row.k }}</span>
                  <span class="panel__val">
                    <span v-if="row.dot" class="dot" aria-hidden="true" />{{ row.v }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About -->
      <section id="hakkinda" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.about }}</h2>
          </div>
          <div class="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-14">
            <p data-reveal class="reveal" style="max-width: 62ch; font-size: var(--text-md); line-height: 1.7; color: var(--color-ink-2)">
              {{ aboutText }}
            </p>
            <div data-reveal class="reveal panel">
              <div class="panel__bar">
                <span class="panel__file mono">özet.md</span>
              </div>
              <div class="panel__body">
                <div v-for="fact in aboutFacts" :key="fact.k" class="panel__row">
                  <span class="panel__key">{{ fact.k }}</span>
                  <span class="panel__val">{{ fact.v }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section id="yetenekler" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.skills }}</h2>
          </div>
          <div class="spec">
            <div v-for="cat in skillCategories" :key="cat.name" class="spec__row" data-reveal>
              <div class="spec__cat">{{ cat.name }}</div>
              <div class="spec__items">
                <span v-for="skill in cat.items" :key="skill" class="chip">{{ skill }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience -->
      <section id="deneyim" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.experience }}</h2>
          </div>
          <div class="tl">
            <div v-for="(exp, i) in experiences" :key="i" class="tl__item" data-reveal>
              <div class="tl__head">
                <span class="tl__company">{{ exp.company }}</span>
                <span v-if="exp.duration" class="tl__dur mono">{{ exp.duration }}</span>
              </div>
              <p class="tl__role">
                <span>{{ exp.role }}</span>
                <span v-if="exp.badge" class="tl__badge">{{ exp.badge }}</span>
              </p>
              <p v-if="exp.date" class="tl__date mono">{{ exp.date }}</p>
              <p class="tl__desc">
                <span v-if="exp.highlight" class="tl__hl">{{ exp.highlight }}</span>{{ exp.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section id="egitim" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.education }}</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <article v-for="(edu, i) in educations" :key="i" class="card p-5" data-reveal>
              <h3 style="font-family: var(--font-display); font-weight: 600; font-size: var(--text-md); color: var(--color-ink); line-height: 1.3">
                {{ edu.school }}
              </h3>
              <p class="mono" style="margin-top: 0.6rem; font-size: var(--text-xs); color: var(--color-accent); letter-spacing: 0.02em">
                {{ edu.duration }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <!-- Projects -->
      <section id="projeler" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.projects }}</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <article
              v-for="(project, i) in projects"
              :key="i"
              class="card card--interactive p-6"
              data-reveal
              role="button"
              tabindex="0"
              @click="openProjectDetails(i)"
              @keydown.enter="openProjectDetails(i)"
              @keydown.space.prevent="openProjectDetails(i)"
            >
              <div class="flex items-start justify-between gap-3">
                <span class="mono-label">{{ project.category }}</span>
                <span v-if="project.language" class="chip chip--lang">{{ project.language }}</span>
              </div>
              <h3 style="margin-top: 0.9rem; font-family: var(--font-display); font-weight: 600; font-size: var(--text-lg); color: var(--color-ink); line-height: 1.25">
                {{ project.title }}
              </h3>
              <span class="mono" style="margin-top: 1.1rem; display: inline-block; font-size: var(--text-xs); color: var(--color-accent)">
                {{ t.labels.details }} →
              </span>
            </article>
          </div>
        </div>
      </section>

      <!-- Contact -->
      <section id="iletisim" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title">{{ t.sections.contact }}</h2>
          </div>
          <div data-reveal class="reveal contact-layout">
            <div class="contact-layout__main">
              <p style="max-width: 48ch; font-size: var(--text-md); color: var(--color-ink-2); margin-bottom: var(--space-lg)">
                {{ t.labels.contactLead }}
              </p>

              <form class="card contact-form" @submit.prevent="submitContactForm">
                <div class="contact-form__row">
                  <div class="contact-form__field">
                    <label class="contact-form__label" for="cf-name">{{ t.form.name }}</label>
                    <input
                      id="cf-name"
                      v-model="contactForm.name"
                      type="text"
                      class="contact-form__input"
                      :placeholder="t.form.namePlaceholder"
                      autocomplete="name"
                      required
                    />
                  </div>
                  <div class="contact-form__field">
                    <label class="contact-form__label" for="cf-mail">{{ t.form.mail }}</label>
                    <input
                      id="cf-mail"
                      v-model="contactForm.email"
                      type="email"
                      class="contact-form__input"
                      :placeholder="t.form.mailPlaceholder"
                      autocomplete="email"
                      required
                    />
                  </div>
                </div>

                <div class="contact-form__field">
                  <label class="contact-form__label" for="cf-subject">{{ t.form.subject }}</label>
                  <input
                    id="cf-subject"
                    v-model="contactForm.subject"
                    type="text"
                    class="contact-form__input"
                    :placeholder="t.form.subjectPlaceholder"
                  />
                </div>

                <div class="contact-form__field">
                  <label class="contact-form__label" for="cf-message">{{ t.form.message }}</label>
                  <textarea
                    id="cf-message"
                    v-model="contactForm.message"
                    class="contact-form__input contact-form__textarea"
                    :placeholder="t.form.messagePlaceholder"
                    rows="5"
                    required
                  ></textarea>
                </div>

                <p v-if="contactStatus === 'success'" class="contact-form__status contact-form__status--ok" role="status">
                  {{ t.form.success }}
                </p>
                <p v-else-if="contactStatus === 'pending'" class="contact-form__status contact-form__status--pending" role="status">
                  {{ t.form.pending }}
                </p>
                <p v-else-if="contactStatus === 'error'" class="contact-form__status contact-form__status--err" role="alert">
                  {{ t.form.error }}
                </p>

                <button type="submit" class="btn btn--primary contact-form__submit" :disabled="contactStatus === 'sending'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  <span>{{ contactStatus === 'sending' ? t.form.sending : t.form.send }}</span>
                </button>
              </form>

              <div class="flex flex-wrap items-center gap-3" style="margin-top: var(--space-xl)">
                <a
                  v-for="link in contactLinks"
                  :key="link.icon"
                  :href="link.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="contact-link"
                >
                  <svg v-if="link.icon === 'GitHub'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <svg v-else-if="link.icon === 'LinkedIn'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>{{ link.label }}</span>
                </a>
                <a :href="`mailto:${EMAIL_ADDRESS}`" class="contact-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <span>{{ EMAIL_ADDRESS }}</span>
                </a>
              </div>
            </div>

            <ContactWatchers
              class="contact-layout__watchers"
              :status="contactStatus"
            />
          </div>
        </div>
      </section>

      <!-- Teammates -->
      <section id="ekip" class="section">
        <div class="wrap" style="padding-block: var(--space-3xl)">
          <div class="section__head" data-reveal>
            <h2 class="section__title section__title--script">{{ t.sections.team }}</h2>
          </div>
          <div class="team-grid" data-reveal>
            <div v-for="mate in teammates" :key="mate.name" class="team-card" tabindex="0">
              <div class="team-card__inner">
                <div class="team-card__face team-card__face--front">
                  <span class="team-card__icon" v-html="mate.svg"></span>
                </div>
                <div class="team-card__face team-card__face--back">
                  <span class="team-card__name">{{ mate.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="foot">
      <div class="wrap">
        <div class="foot__bar">
          <span class="foot__meta">© {{ currentYear }} Yılmaz Sayar</span>
          <span class="foot__meta">{{ t.hero.role }} · Türkiye</span>
        </div>
      </div>
    </footer>

    <!-- Project detail modal -->
    <Transition name="modal">
      <div
        v-if="selectedProject"
        class="fixed inset-0 z-[400] flex items-center justify-center p-4"
        style="background: oklch(8% 0.01 258 / 0.72); backdrop-filter: blur(6px)"
        @click.self="closeProjectDetails"
      >
        <article
          class="card w-full max-w-3xl overflow-y-auto p-6 sm:p-8"
          style="max-height: 88vh; background: var(--color-paper-2)"
          role="dialog"
          aria-modal="true"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <span class="mono-label">{{ selectedProject.category }}</span>
              <h3 style="margin-top: 0.6rem; font-family: var(--font-display); font-weight: 600; font-size: var(--text-2xl); color: var(--color-ink); line-height: 1.15">
                {{ selectedProject.title }}
              </h3>
            </div>
            <button type="button" class="btn btn--line" @click="closeProjectDetails">{{ t.labels.close }}</button>
          </div>

          <span v-if="selectedProject.language" class="chip chip--lang" style="margin-top: 1rem">{{ selectedProject.language }}</span>

          <p style="margin-top: 1.25rem; font-size: var(--text-sm); line-height: 1.7; color: var(--color-ink-2)">
            {{ selectedProject.description }}
          </p>

          <div class="mt-5 flex flex-wrap gap-2">
            <span v-for="tag in selectedProject.tags" :key="tag" class="chip">{{ tag }}</span>
          </div>

          <a
            v-if="selectedProject.githubUrl"
            :href="selectedProject.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn--line"
            style="margin-top: 1.5rem"
          >
            GitHub →
          </a>
        </article>
      </div>
    </Transition>
  </div>
</template>
