const state = {
  // Vistas: home, servicios, reservas, cursos, galeria, contacto, login, registro, mi-cuenta, mis-reservas, admin
  view: 'home',
  adminTab: 'servicios', // resumen, reservas, servicios, cursos, galeria, configuracion
  user: null, // { fullName, email, role: 'customer' | 'admin' }
  profileDropdownOpen: false,
  notice: null,

  // Filtros Servicios
  selectedServiceCategory: 'all',
  serviceSearchQuery: '',

  // Wizard de Reservas (4 pasos)
  bookingStep: 1,
  selectedServiceId: 'srv-01',
  nailShape: 'Almendra de salón',
  needsRemoval: false,
  selectedDate: '2026-11-18',
  selectedTime: '10:30',
  bookingFullName: '',
  bookingEmail: '',
  bookingPhone: '',
  bookingNotes: '',
  paymentMethod: 'stripe_card',
  bookingConfirmed: false,

  // Filtros y Modal de Cursos
  selectedCourseCategory: 'all',
  activeSessionIdForModal: null,
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  enrollmentSuccess: false,

  // Filtros y Lightbox de Galería
  selectedGalleryTag: 'Todos',
  lightboxGalleryId: null,

  // Contacto
  contactSent: false,

  business: {
    name: "Vaema Nails",
    subtitle: "Studio & Academy · Elche",
    description: "Estudio especializado en estética avanzada de uñas en Elche (Alicante): uñas de gel, acrílicas y poligel, manicura semipermanente con bases de vitamina y queratina para recuperar uñas dañadas, podo-estética y formación profesional certificada.",
    phone: "+34 646 42 47 67",
    whatsapp: "https://wa.me/34646424767",
    instagram: "https://www.instagram.com/erma_elche_alicante_formadora?rpxt=bG84Y216eWdicHY0",
    instagramHandle: "@erma_elche_alicante_formadora",
    previousMapsUrl: "https://maps.app.goo.gl/kjxvA2t9LgbNGNPt8",
    previousAddress: "Carrer Cristóbal Sanz, 6, 03201 Elx, Alicante (Vaema Nails)",
    email: "contacto@vaemanails.es",
    address: "Carrer Mestre Giner, 6, 03201 Elx, Alicante",
    mapsUrl: "https://www.google.com/maps?q=38.267838793962184,-0.7062819844494604&hl=es&z=17&output=embed"
  },

  hours: [
    { day: "Lunes", hours: "08:00 - 21:00", closed: false },
    { day: "Martes", hours: "08:00 - 21:00", closed: false },
    { day: "Miércoles", hours: "08:00 - 21:00", closed: false },
    { day: "Jueves", hours: "08:00 - 21:00", closed: false },
    { day: "Viernes", hours: "08:00 - 21:00", closed: false },
    { day: "Sábado", hours: "08:00 - 21:00", closed: false },
    { day: "Domingo", hours: "Cerrado", closed: true }
  ],

  categories: [
    { id: "cat-manicura", name: "Manicura & Recuperación con Queratina", description: "Limpieza profunda de cutícula y bases especiales con vitaminas y queratina para reestructurar uñas dañadas." },
    { id: "cat-semi", name: "Semipermanente & Nivelación", description: "Esmaltado de larga duración con ápice anatómico mediante base rubber, vitaminas o builder gel." },
    { id: "cat-esculpidas", name: "Uñas Esculpidas (Gel, Acrílico & Poligel)", description: "Extensiones desde cero con molde a medida en gel, acrílico y poligel con arquitectura resistente." },
    { id: "cat-nailart", name: "Nail Art, Pedicura & Podo-Estética", description: "Diseños a mano alzada, pedrería, rellenos periódicos y cuidado avanzado de pies y durezas." }
  ],

  services: [
    {
      id: "srv-01",
      category_id: "cat-semi",
      name: "Manicura Semipermanente + Base Vitamina y Queratina",
      description: "Nuestro tratamiento estrella en Elche. Limpieza de cutícula de alta precisión, nivelación con base especial enriquecida con vitaminas y queratina enfocada en la reestructuración de uñas dañadas y esmaltado de larga duración.",
      price: 38,
      duration_minutes: 75,
      image_path: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      badge: "Más reservado",
      includes: ["Manicura rusa combinada", "Base reestructurante con vitamina y queratina", "Color liso o nude translúcido", "Hidratación profunda de cutícula"]
    },
    {
      id: "srv-02",
      category_id: "cat-esculpidas",
      name: "Uñas Esculpidas en Gel o Poligel / Acrygel (Puesta Nueva)",
      description: "Extensión con molde adaptado a la morfología de tu mano en gel o poligel de última generación. Estructura estilizada, ultra resistente y ligera en acabado natural, milky, baby boomer o francesa.",
      price: 56,
      duration_minutes: 120,
      image_path: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      badge: "Especialidad",
      includes: ["Preparación completa de la lámina", "Esculpido en Gel o Poligel con molde", "Forma almendra, cuadrada o bailarina", "Acabado French / Milky / Color"]
    },
    {
      id: "srv-03",
      category_id: "cat-esculpidas",
      name: "Uñas Acrílicas Esculpidas de Alta Precisión",
      description: "Construcción en acrílico profesional de máxima adherencia y durabilidad. Ideal para longitudes medias o largas, uñas mordidas y reconstrucciones estructurales impecables.",
      price: 62,
      duration_minutes: 135,
      image_path: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      includes: ["Manicura completa previa", "Esculpido en acrílico profesional", "Esmaltado semipermanente incluido", "Diseño básico o francesa en 2 uñas"]
    },
    {
      id: "srv-04",
      category_id: "cat-manicura",
      name: "Tratamiento Reestructurante para Uñas Dañadas (Vitamina & Queratina)",
      description: "Protocolo específico de recuperación para láminas débiles, estriadas o dañadas. Perfeccionamiento de cutícula, sellado multicapa con complejo de queratina, calcio y vitaminas.",
      price: 28,
      duration_minutes: 50,
      image_path: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      badge: "Salud Ungueal",
      includes: ["Diagnóstico y limpieza de cutícula", "Sellado intensivo de queratina y vitamina", "Exfoliación suave de manos", "Masaje nutritivo reparador"]
    },
    {
      id: "srv-05",
      category_id: "cat-semi",
      name: "Manicura Semipermanente French / Baby Boomer",
      description: "Nivelación con base constructora en tonos nude empolvados y degradado Baby Boomer o sonrisa francesa trazada a mano alzada.",
      price: 44,
      duration_minutes: 90,
      image_path: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      includes: ["Manicura rusa combinada", "Nivelación con tono cover a medida", "Francesa clásica, micro-french o baby boomer", "Top coat ultra gloss anti-rayaduras"]
    },
    {
      id: "srv-06",
      category_id: "cat-esculpidas",
      name: "Relleno de Gel, Acrílico o Poligel (Mantenimiento 3-4 semanas)",
      description: "Rebalanceo completo de la estructura tras el crecimiento, retirada de posibles levantamientos, manicura completa y nuevo diseño o esmaltado.",
      price: 46,
      duration_minutes: 95,
      image_path: "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      includes: ["Reconstrucción de ápice", "Corrección de curvatura e inclinación", "Manicura rusa completa", "Nuevo color a elegir"]
    },
    {
      id: "srv-07",
      category_id: "cat-nailart",
      name: "Decoración Artística a Mano Alzada & Pedrería",
      description: "Personalización artística especializada: diseños a mano alzada, pedrería fina, efectos cromados, ojo de gato magnético y relieves 3D.",
      price: 18,
      duration_minutes: 30,
      image_path: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      includes: ["Diseño personalizado a mano alzada", "Aplicación de pedrería o pigmentos", "Sellado de alta durabilidad"]
    },
    {
      id: "srv-08",
      category_id: "cat-nailart",
      name: "Pedicura Completa & Podo-Estética Avanzada",
      description: "Cuidado integral estético de los pies: retirada especializada de durezas y callosidades, atención a uñeros, limpieza profunda de cutícula y esmaltado semipermanente.",
      price: 42,
      duration_minutes: 75,
      image_path: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      badge: "Podo-Estética",
      includes: ["Tratamiento de durezas y callosidades", "Cuidado de cutícula y lámina", "Esmaltado semipermanente o base vitamínica", "Masaje podal hidratante"]
    }
  ],

  courseCategories: [
    { id: "ccat-iniciacion", name: "Iniciación Profesional en Uñas" },
    { id: "ccat-estructuras", name: "Perfeccionamiento & Estructuras" },
    { id: "ccat-nailart", name: "Especialización Nail Art & Mano Alzada" }
  ],

  courses: [
    {
      id: "crs-01",
      category_id: "ccat-estructuras",
      name: "Masterclass Manicura Rusa, Nivelación & Reestructuración con Queratina",
      modality: "Presencial",
      duration_hours: 16,
      level: "Intermedio / Avanzado",
      price: 290,
      includes_kit: true,
      is_active: true,
      image_path: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
      description: "Formación presencial en Elche impartida por Erma Formadora. Domina el uso seguro del torno, corte limpio con tijera y técnica de nivelación con bases de vitamina y queratina.",
      syllabus: [
        "Anatomía de la uña natural y diagnóstico de láminas dañadas",
        "Química de materiales: bases con vitamina, queratina y rubber",
        "Geometría de fresas, revoluciones exactas y bolsillo profundo",
        "Corte continuo con tijera profesional sin heridas",
        "Nivelación inteligente sin limado y esmaltado bajo cutícula"
      ]
    },
    {
      id: "crs-02",
      category_id: "ccat-iniciacion",
      name: "Curso Intensivo Inicial: Gel, Acrílico y Poligel desde Cero",
      modality: "Presencial",
      duration_hours: 32,
      level: "Principiante (Sin experiencia previa)",
      price: 480,
      includes_kit: true,
      is_active: true,
      image_path: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
      description: "Formación integral presencial en nuestro estudio de Elche diseñada para quienes desean emprender como técnicas de uñas.",
      syllabus: [
        "Esterilización, desinfección y protocolo de cabina profesional",
        "Preparación mecánica y química de la lámina ungueal",
        "Colocación y adaptación de moldes según cada tipo de uña",
        "Estructuras de salón en Gel, Acrílico y Poligel",
        "Práctica real con modelos supervisada paso a paso"
      ]
    },
    {
      id: "crs-03",
      category_id: "ccat-nailart",
      name: "Especialización Diseño a Mano Alzada, French & Pedrería",
      modality: "Presencial",
      duration_hours: 8,
      level: "Todos los niveles",
      price: 160,
      includes_kit: false,
      is_active: true,
      image_path: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=85",
      description: "Perfecciona los diseños más solicitados en salón reduciendo tus tiempos de trabajo: sonrisa francesa exacta, trazos a mano alzada y pedrería.",
      syllabus: [
        "Proporción exacta de la sonrisa francesa en almendra y cuadrada",
        "Trazos finos y diseño artístico a mano alzada",
        "Baby Boomer difuminado sin marcas de transición",
        "Encapsulados, efectos cromados y sellado de pedrería"
      ]
    }
  ],

  courseSessions: [
    { id: "ses-01", course_id: "crs-01", date: "28 Nov 2026", location: "Vaema Nails Elche — Carrer Mestre Giner, 6", capacity: 6, enrolled: 4, status: "open" },
    { id: "ses-02", course_id: "crs-01", date: "12 Dic 2026", location: "Vaema Nails Elche — Carrer Mestre Giner, 6", capacity: 6, enrolled: 6, status: "full" },
    { id: "ses-03", course_id: "crs-02", date: "03 Dic 2026", location: "Vaema Nails Elche — Carrer Mestre Giner, 6", capacity: 4, enrolled: 2, status: "open" },
    { id: "ses-04", course_id: "crs-03", date: "19 Dic 2026", location: "Vaema Nails Elche — Carrer Mestre Giner, 6", capacity: 8, enrolled: 5, status: "open" }
  ],

  gallery: [
    {
      id: "gal-01",
      image_path: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
      tag: "Clean Nails & Nude",
      alt: "Manicura semipermanente con base de vitamina y queratina",
      caption: "Nivelación con base de vitamina y queratina en tono hueso cálido — Reestructuración de uña natural",
      is_published: true
    },
    {
      id: "gal-02",
      image_path: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
      tag: "French & Baby Boomer",
      alt: "Uñas esculpidas en gel y poligel con micro french",
      caption: "Estructura almendra de salón en poligel con sonrisa micro-french y velo perlado",
      is_published: true
    },
    {
      id: "gal-03",
      image_path: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=85",
      tag: "Esculpidas Gel & Acrílico",
      alt: "Uñas acrílicas esculpidas en tonos tierra y crema",
      caption: "Arquitectura en acrílico talla M realizada en nuestro estudio de Elche",
      is_published: true
    },
    {
      id: "gal-04",
      image_path: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=85",
      tag: "French & Baby Boomer",
      alt: "Diseño Baby Boomer suave",
      caption: "Baby Boomer difuminado a mano con sellado bajo cutícula de alta precisión",
      is_published: true
    },
    {
      id: "gal-05",
      image_path: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=85",
      tag: "Nail Art de Autor",
      alt: "Decoración de uñas a mano alzada y pedrería",
      caption: "Nail Art a mano alzada con relieves sutiles y detalles artesanales",
      is_published: true
    },
    {
      id: "gal-06",
      image_path: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
      tag: "Clean Nails & Nude",
      alt: "Cuidado de cutícula y tratamiento de queratina",
      caption: "Tratamiento reestructurante con vitaminas y queratina para uñas dañadas",
      is_published: true
    }
  ],

  appointments: [
    {
      id: "apt-01",
      customerName: "Claudia Morales Vega",
      serviceName: "Manicura Semipermanente + Base Vitamina y Queratina",
      dateText: "18 de noviembre de 2026 a las 10:30 h",
      price: 38,
      deposit: 19,
      status: "Confirmada",
      upcoming: true
    },
    {
      id: "apt-02",
      customerName: "Azacin",
      serviceName: "Relleno de Gel, Acrílico o Poligel (Mantenimiento)",
      dateText: "2 de noviembre de 2026 a las 17:00 h",
      price: 46,
      deposit: 23,
      status: "Completada",
      upcoming: false
    }
  ],

  // Estado edición Admin Servicios
  editingServiceId: null,
  srvForm: {
    name: "",
    category_id: "cat-semi",
    price: "38",
    duration_minutes: "75",
    description: "",
    image_path: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    fileName: ""
  },

  // Estado edición Admin Cursos
  editingCourseId: null,
  crsForm: {
    name: "",
    category_id: "ccat-estructuras",
    modality: "Presencial",
    price: "290",
    duration_hours: "16",
    level: "Todos los niveles",
    description: "",
    image_path: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
    fileName: ""
  },

  // Estado subida Admin Galería
  galForm: {
    image_path: "",
    fileName: "",
    tag: "Clean Nails & Nude",
    alt: "",
    caption: ""
  }
};
