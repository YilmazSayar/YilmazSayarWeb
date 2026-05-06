<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StarfieldBackground from './components/StarfieldBackground.vue'
import HangingStickFigure from './components/HangingStickFigure.vue'

const STORAGE_KEY = 'portfolio-accent-color'
const LOCALE_KEY = 'portfolio-locale'
const DEFAULT_ACCENT = '#10b981'

const accentColor = ref(DEFAULT_ACCENT)
const showColorPicker = ref(false)
const colorCycleActive = ref(false)
let cycleAnimationId = null
const CYCLE_DURATION_MS = 12000
let cycleStartTime = 0

const presetColors = [
  '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
  '#ef4444', '#14b8a6', '#6366f1', '#84cc16', '#f97316',
  '#0004ff',
]

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '16, 185, 129'
}

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

function setAccentFromHue(hue) {
  const hex = hslToHex(hue, 78, 55)
  accentColor.value = hex
  document.documentElement.style.setProperty('--accent', hex)
  document.documentElement.style.setProperty('--accent-rgb', hexToRgb(hex))
}

function runCycleStep(timestamp) {
  if (!cycleAnimationId) return
  if (cycleStartTime === 0) cycleStartTime = timestamp
  const elapsed = timestamp - cycleStartTime
  const hue = (elapsed / CYCLE_DURATION_MS) * 360 % 360
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

onUnmounted(() => {
  stopColorCycle()
})

const locale = ref('tr')

function setLocale(lang) {
  locale.value = lang
  try { localStorage.setItem(LOCALE_KEY, lang) } catch (_) {}
}

const colorPickerContainer = ref(null)

function closeColorPickerOnClickOutside(e) {
  if (showColorPicker.value && colorPickerContainer.value && !colorPickerContainer.value.contains(e.target)) {
    showColorPicker.value = false
  }
}

function toggleThemePicker() {
  showColorPicker.value = !showColorPicker.value
}

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) applyAccent(saved)
    else applyAccent(DEFAULT_ACCENT)
    const savedLocale = localStorage.getItem(LOCALE_KEY)
    if (savedLocale === 'en' || savedLocale === 'tr') locale.value = savedLocale
  } catch (_) {
    applyAccent(DEFAULT_ACCENT)
  }
  document.addEventListener('click', closeColorPickerOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeColorPickerOnClickOutside)
})

const t = computed(() => ({
  nav: {
    home: locale.value === 'tr' ? 'Ana Sayfa' : 'Home',
    about: locale.value === 'tr' ? 'Hakkımda' : 'About',
    education: locale.value === 'tr' ? 'Eğitim' : 'Education',
    projects: locale.value === 'tr' ? 'Projeler' : 'Projects',
    experience: locale.value === 'tr' ? 'Deneyim' : 'Experience',
    contact: locale.value === 'tr' ? 'İletişim' : 'Contact',
    downloadCv: locale.value === 'tr' ? 'CV İndir' : 'Download CV',
  },
  hero: {
    title: locale.value === 'tr' ? 'Bilgisayar Mühendisi' : 'Computer Engineer',
  },
  sections: {
    about: locale.value === 'tr' ? 'Hakkımda' : 'About',
    education: locale.value === 'tr' ? 'Eğitim' : 'Education',
    projects: locale.value === 'tr' ? 'Projeler' : 'Projects',
    experience: locale.value === 'tr' ? 'Deneyim' : 'Experience',
    skills: locale.value === 'tr' ? 'Yetenekler' : 'Skills',
    contact: locale.value === 'tr' ? 'İletişim' : 'Contact',
  },
  themeColor: locale.value === 'tr' ? 'Tema rengi' : 'Theme color',
  custom: locale.value === 'tr' ? 'Özel:' : 'Custom:',
  contactEmailLabel: locale.value === 'tr' ? 'E-posta' : 'Email',
}))

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
    title: 'İzinlerim - Geliştirme devam etmekte',
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
    title: 'İzinlerim - Development in progress',
    language: 'C#',
    description:
      'I developed a full-featured web application where employees create annual leave requests, unit managers approve or reject requests, and manage remaining leave days. The system includes role-based access (Unit manager, Employee), membership by unit and invite code, leave request creation and approval workflow, updating remaining leave days in the personnel list, and search/filter features. Registration is by user account only; the system admin assigns roles on request. On the backend I used ASP.NET Core Web API, Entity Framework Core and PostgreSQL; authentication is handled with JWT Bearer. On the frontend I built an SPA with Nuxt (Vue 3) and a responsive UI with Tailwind CSS. RESTful API design and Swagger documentation are in place.',
    tags: ['C#', 'ASP.NET Core', 'PostgreSQL', 'Nuxt', 'Vue 3', 'Tailwind CSS', 'Swagger'],
  },
]

const experiencesTr = [
  {
    company: 'Seneka Yazılım',
    role: 'Uzun dönem stajyer',
    duration: 'Devam ediyor',
    description: 'Ürün geliştirme, ürün iyileştirme, entegrasyon.',
  },
  {
    company: 'Acun Medya Akademi',
    role: 'Gönüllü Staj',
    duration: '5 ay',
    description: 'Java, Spring ve API entegrasyonu üzerine yoğun proje geliştirme.',
  },
  {
    company: 'Motto Elektrik AŞ',
    role: 'Stajyer',
    duration: '1 ay',
    description: 'Donanımsal süreçlerin yanı sıra web sayfası frontend güncellemeleri ve ürün yönetimi.',
  },
]

const experiencesEn = [
  {
    company: 'Seneka Yazılım',
    role: 'Long-term intern',
    duration: 'Ongoing',
    description: 'Product development, product improvement, integration.',
  },
  {
    company: 'Acun Medya Akademi',
    role: 'Voluntary internship',
    duration: '5 months',
    description: 'Intensive project development on Java, Spring and API integration.',
  },
  {
    company: 'Motto Elektrik AŞ',
    role: 'Intern',
    duration: '1 month',
    description: 'Web frontend updates and product management alongside hardware processes.',
  },
]

const projects = computed(() => (locale.value === 'tr' ? projectsTr : projectsEn))
const experiences = computed(() => (locale.value === 'tr' ? experiencesTr : experiencesEn))
const educationsTr = [
  {
    school: 'Düzce Üniversitesi Bilgisayar Mühendisliği',
    duration: 'Eylül 2022 - Ocak 2023',
  },
  {
    school: 'Selçuk Üniversitesi Bilgisayar Mühendisliği',
    duration: 'Ocak 2023 - Devam etmekte',
  },
  {
    school: 'Acun Medya Akademi FullStack Developer Eğitimi',
    duration: 'Şubat 2025 - Ağustos 2025',
  },
  {
    school: 'Mesut Ilıca, Sıfırdan FullStack C#.NET Eğitimi',
    duration: 'Udemy platformunda 59 saatlik eğitim programı',
  },
  {
    school: 'American Kültür Dil Okulu (İngilizce)',
    duration: 'Temmuz 2024 - Şubat 2025',
  },
]
const educationsEn = [
  {
    school: 'Duzce University Computer Engineering',
    duration: 'September 2022 - January 2023',
  },
  {
    school: 'Selcuk University Computer Engineering',
    duration: 'January 2023 - Ongoing',
  },
  {
    school: 'Acun Medya Academy FullStack Developer Training',
    duration: 'February 2025 - August 2025',
  },
  {
    school: 'FullStack C#.NET from Scratch Training',
    duration: '59-hour training program',
  },
  {
    school: 'American Kultur Language School (English)',
    duration: 'July 2024 - February 2025',
  },
]
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
  {
    name: 'Backend',
    items: ['Java', 'C#', 'Spring', 'Spring Boot', 'Spring Security', 'ASP.NET Core', 'SQL', 'PostgreSQL', 'Python', 'FastAPI'],
  },
  {
    name: 'Frontend',
    items: ['HTML', 'CSS', 'JavaScript', 'React', 'Vue 3', 'Nuxt', 'Thymeleaf', 'Tailwind CSS', 'TypeScript', 'jQuery', 'Bootstrap'],
  },
  {
    name: 'API & AI',
    items: ['Swagger', 'SpringDoc OpenAPI', 'Google Gemini API', 'Groq API', 'Llama', 'Sentence Transformers'],
  },
  {
    name: 'Tools',
    items: ['IntelliJ IDEA', 'Remotion', 'Redmine', 'Adobe Illustrator', 'After Effects'],
  },
]

const contactLinks = [
  { label: 'GitHub', href: 'https://github.com/YilmazSayar', icon: 'GitHub' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/y%C4%B1lmaz-sayar?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app', icon: 'LinkedIn' },
]

/** E-posta adresi – dile göre değişmez */
const EMAIL_ADDRESS = 'sayaryilmaz2004@gmail.com'

const marqueeSkills = skillCategories.flatMap((cat) => cat.items)

const cvPdfUrl = '/YILMAZSAYAR-CV.pdf'
const cvDownloadFilename = 'Yilmaz-Sayar-CV.pdf'

async function downloadCv(e) {
  e.preventDefault()
  const msgMissing = locale.value === 'tr'
    ? 'CV dosyası bulunamadı. Lütfen projenin public klasörüne YILMAZSAYAR-CV.pdf adında gerçek bir PDF ekleyin (şu an orada yok veya sunucu PDF yerine başka bir sayfa dönüyor).'
    : 'CV file not found. Please add a real PDF named YILMAZSAYAR-CV.pdf to the project\'s public folder (it is missing or the server is returning a different page).'
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

const aboutTextTr = `Selçuk Üniversitesi Bilgisayar Mühendisliği 4. sınıf öğrencisiyim. Yazılım projelerimi makine öğrenmesi ve yapay zeka ile birleştirmeye odaklanan bir mühendis adayıyım. Full stack geliştirme, API tasarımı ve modern web teknolojileri ile ilgileniyorum. Şu anda iş yeri eğitim stajımı yapmaktayım ve Seneka Yazılım bünyesinde Ürün geliştirmeleri, ürün iyileştirmeleri, entegrasyon gibi alanlarda çalışmalar yapıyorum. Kullanıcı taleplerine göre çözüm buluyor, ürün güncelleştirmelerinde görev alıyorum.`

const aboutTextEn = `I am a 4th year Computer Engineering student at Selçuk University. I am an aspiring engineer focused on combining software projects with machine learning and artificial intelligence. I am interested in full stack development, API design and modern web technologies. I am currently doing my workplace training internship at Seneka Yazılım, working on product development, product improvement and integration. I find solutions based on user needs and take part in product updates.`

const aboutText = computed(() => (locale.value === 'tr' ? aboutTextTr : aboutTextEn))
</script>

<template>
  <div class="relative isolate min-h-screen bg-[#030306] text-zinc-100 antialiased">
    <StarfieldBackground />
    <div
      class="pointer-events-none fixed inset-0 z-[1] accent-gradient-bg opacity-[0.82]"
      aria-hidden="true"
    />
    <div class="relative z-10">
      <HangingStickFigure
        :open-theme-label="locale === 'tr' ? 'Tema rengi ayarlarını aç' : 'Open theme color settings'"
        @open-theme="toggleThemePicker"
      />
      <!-- Üst navigasyon -->
    <nav class="sticky top-0 z-40 border-b border-zinc-800/80 bg-black/90 backdrop-blur-sm">
      <div class="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div class="flex flex-wrap items-center gap-4">
          <a
            href="#"
            class="rounded-lg px-4 py-2 text-sm font-medium accent-bg-muted accent-text"
          >
            {{ t.nav.home }}
          </a>
          <a href="#hakkinda" class="text-sm font-medium text-zinc-300 hover:text-white">
            {{ t.nav.about }}
          </a>
          <a href="#egitim" class="text-sm font-medium text-zinc-300 hover:text-white">
            {{ t.nav.education }}
          </a>
          <a href="#projeler" class="text-sm font-medium text-zinc-300 hover:text-white">
            {{ t.nav.projects }}
          </a>
          <a href="#deneyim" class="text-sm font-medium text-zinc-300 hover:text-white">
            {{ t.nav.experience }}
          </a>
          <a href="#iletisim" class="text-sm font-medium text-zinc-300 hover:text-white">
            {{ t.nav.contact }}
          </a>
        </div>
        <div class="flex items-center gap-3">
          <a
            href="#"
            class="rounded-lg px-4 py-2 text-sm font-medium accent-bg text-zinc-900 transition-opacity hover:opacity-90"
            @click.prevent="downloadCv"
          >
            {{ t.nav.downloadCv }}
          </a>
          <div class="flex rounded-lg border border-zinc-700 p-0.5">
            <button
              type="button"
              :class="locale === 'tr' ? 'rounded-md px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text' : 'rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white'"
              @click="setLocale('tr')"
            >
              TR
            </button>
            <button
              type="button"
              :class="locale === 'en' ? 'rounded-md px-3 py-1.5 text-xs font-medium accent-bg-muted accent-text' : 'rounded-md px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white'"
              @click="setLocale('en')"
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="mx-auto max-w-4xl px-6 pb-16">
      <!-- Ana sayfa Hero -->
      <header class="py-20 text-center sm:py-28">
        <h1 class="hero-title text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Yılmaz Sayar
        </h1>
        <p class="mt-3 text-xl font-medium accent-text sm:text-2xl">
          {{ t.hero.title }}
        </p>
      </header>

      <!-- Yetenekler şeridi (marquee) -->
      <section class="relative -mx-6 overflow-hidden py-6 sm:-mx-6">
        <div class="marquee-track flex w-max gap-4">
          <div class="flex shrink-0 gap-4">
            <span
              v-for="(skill, i) in marqueeSkills"
              :key="`a-${i}`"
              class="marquee-pill shrink-0 rounded-full border-2 px-5 py-2.5 text-sm font-medium accent-skill-border accent-skill-bg accent-skill-text"
            >
              {{ skill }}
            </span>
          </div>
          <div class="flex shrink-0 gap-4" aria-hidden="true">
            <span
              v-for="(skill, i) in marqueeSkills"
              :key="`b-${i}`"
              class="marquee-pill shrink-0 rounded-full border-2 px-5 py-2.5 text-sm font-medium accent-skill-border accent-skill-bg accent-skill-text"
            >
              {{ skill }}
            </span>
          </div>
        </div>
      </section>

      <!-- Hakkımda -->
      <section id="hakkinda" class="scroll-mt-20 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.about }}
        </h2>
        <p class="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          {{ aboutText }}
        </p>
      </section>

      <!-- Eğitim -->
      <section id="egitim" class="scroll-mt-8 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.education }}
        </h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <article
            v-for="(edu, i) in educations"
            :key="i"
            class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 transition-all duration-300 hover-accent-border hover:bg-zinc-900/80 hover-accent-shadow"
          >
            <h3 class="text-base font-semibold text-white sm:text-lg">
              {{ edu.school }}
            </h3>
            <p class="mt-2 text-sm font-medium accent-text">
              {{ edu.duration }}
            </p>
          </article>
        </div>
      </section>

      <!-- Projeler -->
      <section id="projeler" class="scroll-mt-8 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.projects }}
        </h2>
        <div class="grid gap-6 sm:grid-cols-2">
          <article
            v-for="(project, i) in projects"
            :key="i"
            class="cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 transition-all duration-300 hover-accent-border hover:bg-zinc-900 hover-accent-shadow"
            @click="openProjectDetails(i)"
          >
            <div class="mt-4">
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-lg font-semibold text-white">
                  {{ project.title }}
                </h3>
                <span
                  v-if="project.language"
                  class="inline-block rounded-md px-3 py-1.5 text-xs font-semibold ring-1"
                  :style="{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.2)',
                    color: 'var(--accent)',
                    boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb), 0.35)',
                  }"
                >
                  {{ project.language }}
                </span>
              </div>
              <div class="mt-2 flex items-center justify-start gap-3">
                <span class="shrink-0 whitespace-nowrap text-xs font-medium accent-text">
                  {{ locale === 'tr' ? 'Detayları göster' : 'Open details' }}
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Transition name="project-detail">
        <div
          v-if="selectedProject"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          @click.self="closeProjectDetails"
        >
          <article class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-950 p-6 sm:p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="mt-4 text-2xl font-bold text-white">
                  {{ selectedProject.title }}
                </h3>
                <span
                  v-if="selectedProject.language"
                  class="mt-3 inline-block rounded-md px-3 py-1.5 text-xs font-semibold ring-1"
                  :style="{
                    backgroundColor: 'rgba(var(--accent-rgb), 0.2)',
                    color: 'var(--accent)',
                    boxShadow: 'inset 0 0 0 1px rgba(var(--accent-rgb), 0.35)',
                  }"
                >
                  {{ selectedProject.language }}
                </span>
              </div>
              <button
                type="button"
                class="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                @click="closeProjectDetails"
              >
                {{ locale === 'tr' ? 'Kapat' : 'Close' }}
              </button>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <span
                v-for="tag in selectedProject.tags"
                :key="tag"
                class="rounded-full bg-zinc-700/90 px-3 py-1 text-xs font-medium text-zinc-200"
              >
                {{ tag }}
              </span>
            </div>

            <p class="mt-5 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {{ selectedProject.description }}
            </p>

            <a
              v-if="selectedProject.githubUrl"
              :href="selectedProject.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-6 inline-block text-sm font-medium accent-text transition-colors hover-accent-text"
            >
              GitHub →
            </a>
          </article>
        </div>
      </Transition>

      <!-- Deneyim -->
      <section id="deneyim" class="scroll-mt-8 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.experience }}
        </h2>
        <ul class="space-y-6">
          <li
            v-for="(exp, i) in experiences"
            :key="i"
            class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5 transition-all duration-300 hover-accent-border hover:bg-zinc-900/80 hover-accent-shadow"
          >
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <h3 class="text-lg font-semibold text-white">
                {{ exp.company }}
              </h3>
              <span
                v-if="exp.duration"
                class="text-sm font-medium accent-text"
              >
                {{ exp.duration }}
              </span>
            </div>
            <p class="mt-1 text-sm font-medium accent-text">
              {{ exp.role }}
            </p>
            <p class="mt-3 text-sm leading-relaxed text-zinc-400">
              {{ exp.description }}
            </p>
          </li>
        </ul>
      </section>

      <!-- Yetenekler -->
      <section class="scroll-mt-8 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.skills }}
        </h2>
        <div class="space-y-6">
          <div
            v-for="cat in skillCategories"
            :key="cat.name"
            class="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-5"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider accent-text">
              {{ cat.name }}
            </h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="skill in cat.items"
                :key="skill"
                class="rounded-full accent-skill-border accent-skill-bg accent-skill-text px-4 py-1.5 text-sm font-medium"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- İletişim -->
      <section id="iletisim" class="scroll-mt-8 py-10">
        <h2 class="mb-6 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {{ t.sections.contact }}
        </h2>
        <div class="flex flex-col items-center gap-4">
          <div class="flex flex-wrap items-center justify-center gap-4">
            <a
              v-for="link in contactLinks"
              :key="link.icon"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3 text-sm font-medium accent-text transition-all duration-300 hover-accent-border hover:bg-zinc-900 hover-accent-shadow hover-accent-text"
            >
              <!-- GitHub -->
              <svg v-if="link.icon === 'GitHub'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <!-- LinkedIn -->
              <svg v-else-if="link.icon === 'LinkedIn'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="shrink-0" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>{{ link.label }}</span>
            </a>
          </div>
          <p class="text-sm text-zinc-400 transition-colors duration-200 hover-accent-text">
            {{ t.contactEmailLabel }}:
            <a :href="`mailto:${EMAIL_ADDRESS}`" class="accent-text">{{ EMAIL_ADDRESS }}</a>
          </p>
        </div>
      </section>

      <footer class="border-t border-zinc-800/60 pt-8 text-center text-sm text-zinc-500">
        © {{ new Date().getFullYear() }} Yılmaz Sayar
      </footer>
    </div>

    <!-- Tema rengi seçici -->
    <div ref="colorPickerContainer" class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <Transition name="picker">
        <div
          v-show="showColorPicker"
          class="rounded-2xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-xl backdrop-blur-sm"
        >
          <p class="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
            {{ t.themeColor }}
          </p>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="color in presetColors"
              :key="color"
              type="button"
              :style="{ backgroundColor: color }"
              :class="[
                'h-9 w-9 rounded-full border-2 transition-transform hover:scale-110',
                accentColor === color ? 'border-white ring-2 ring-white/50' : 'border-transparent',
              ]"
              :aria-label="`Renk: ${color}`"
              @click="chooseColor(color)"
            />
            <button
              type="button"
              class="color-cycle-dot h-9 w-9 rounded-full border-2 transition-transform hover:scale-110"
              :class="colorCycleActive ? 'border-white ring-2 ring-white/50' : 'border-transparent'"
              aria-label="Renkler otomatik değişsin"
              @click.stop="toggleColorCycle"
            />
          </div>
          <label class="mt-3 flex items-center gap-2">
            <span class="text-xs text-zinc-400">{{ t.custom }}</span>
            <input
              v-model="accentColor"
              type="color"
              class="h-9 w-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
              @input="stopColorCycle(); applyAccent(accentColor)"
            />
          </label>
        </div>
      </Transition>
    </div>
    <!-- Mobil: çöp adam yok; tema için küçük palet kısayolu -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/95 shadow-lg backdrop-blur-sm transition hover:border-zinc-500 hover:shadow-xl sm:hidden"
      :aria-label="locale === 'tr' ? 'Tema rengi' : 'Theme color'"
      @click.stop="toggleThemePicker"
    >
      <span class="grid grid-cols-3 gap-0.5 p-1" aria-hidden="true">
        <span class="h-2 w-2 rounded-full bg-red-500" />
        <span class="h-2 w-2 rounded-full bg-sky-500" />
        <span class="h-2 w-2 rounded-full bg-amber-400" />
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        <span class="h-2 w-2 rounded-full bg-violet-500" />
        <span class="h-2 w-2 rounded-full bg-zinc-500" />
      </span>
    </button>
    </div>
  </div>
</template>

<style scoped>
.hero-title {
  background: linear-gradient(
    90deg,
    #ffffff 0%,
    #f5f5f5 20%,
    #ffffff 40%,
    #e5e5e5 55%,
    #ffffff 70%,
    #f0f0f0 85%,
    #ffffff 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.4))
    drop-shadow(0 2px 0 rgba(0, 0, 0, 0.3))
    drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
  animation: hero-glow 4s ease-in-out infinite;
}
@keyframes hero-glow {
  50% {
    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.4))
      drop-shadow(0 2px 0 rgba(0, 0, 0, 0.3))
      drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))
      drop-shadow(0 0 24px rgba(var(--accent-rgb), 0.4))
      drop-shadow(0 0 48px rgba(var(--accent-rgb), 0.25));
  }
}

.color-cycle-dot {
  background: linear-gradient(
    135deg,
    #ef4444 0%,
    #f97316 15%,
    #eab308 30%,
    #22c55e 45%,
    #0ea5e9 60%,
    #8b5cf6 75%,
    #ec4899 90%,
    #ef4444 100%
  );
}

.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.project-detail-enter-active,
.project-detail-leave-active {
  transition: opacity 0.22s ease;
}
.project-detail-enter-from,
.project-detail-leave-to {
  opacity: 0;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.marquee-track {
  animation: marquee 35s linear infinite;
}
.marquee-track:hover {
  animation-play-state: paused;
}
</style>
