function showNotice(text) {
  state.notice = text;
  render();
  setTimeout(() => {
    state.notice = null;
    render();
  }, 3200);
}

function navigate(view, serviceId) {
  state.view = view;
  state.profileDropdownOpen = false;
  if (serviceId) {
    state.selectedServiceId = serviceId;
    state.bookingStep = 1;
    state.bookingConfirmed = false;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function handleUnifiedLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('login-email').value.trim();
  const lower = emailInput.toLowerCase();

  const isAdmin = lower.includes('admin') || lower.includes('erma') || lower.includes('vaema');
  const derivedName = isAdmin
    ? "Erma (Administradora Vaema Nails)"
    : (emailInput.split('@')[0] || "Azacin");

  state.user = {
    fullName: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
    email: emailInput,
    role: isAdmin ? 'admin' : 'customer'
  };

  state.bookingFullName = state.user.fullName;
  state.bookingEmail = state.user.email;

  if (isAdmin) {
    navigate('admin');
  } else {
    navigate('mi-cuenta');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  const fullName = document.getElementById('reg-fullname').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  state.user = {
    fullName: fullName || "Clienta",
    email: email,
    role: 'customer'
  };
  state.bookingFullName = state.user.fullName;
  state.bookingEmail = state.user.email;
  navigate('mi-cuenta');
}

function quickFillLogin(email, pass) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = pass;
}

function logout() {
  state.user = null;
  state.profileDropdownOpen = false;
  navigate('home');
}

function handleConfirmBooking(e) {
  e.preventDefault();
  const selectedService = state.services.find(s => s.id === state.selectedServiceId) || state.services[0];
  const extraRemovalPrice = state.needsRemoval ? 10 : 0;
  const totalPrice = selectedService.price + extraRemovalPrice;
  const depositAmount = Number((totalPrice * 0.5).toFixed(2));

  state.appointments.unshift({
    id: "apt-" + Date.now(),
    customerName: state.bookingFullName || (state.user ? state.user.fullName : "Clienta"),
    serviceName: selectedService.name,
    dateText: state.selectedDate + " a las " + state.selectedTime + " h",
    price: totalPrice,
    deposit: depositAmount,
    status: "Confirmada",
    upcoming: true
  });

  state.bookingConfirmed = true;
  state.bookingStep = 4;
  render();
}

// Subida de foto personalizada para Servicios
function handleServicePhotoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  state.srvForm.fileName = file.name;
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.srvForm.image_path = ev.target.result;
    render();
  };
  reader.readAsDataURL(file);
}

function saveService(e) {
  e.preventDefault();
  const f = state.srvForm;
  if (state.editingServiceId) {
    state.services = state.services.map(s =>
      s.id === state.editingServiceId
        ? { ...s, name: f.name, category_id: f.category_id, price: Number(f.price), duration_minutes: Number(f.duration_minutes), description: f.description, image_path: f.image_path }
        : s
    );
    showNotice("Servicio de uñas modificado correctamente.");
  } else {
    state.services.unshift({
      id: "srv-" + Date.now(),
      name: f.name,
      category_id: f.category_id,
      price: Number(f.price),
      duration_minutes: Number(f.duration_minutes),
      description: f.description,
      image_path: f.image_path || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
      is_active: true,
      includes: ["Diagnóstico previo de la uña natural", "Esterilización completa en autoclave"]
    });
    showNotice("Nuevo servicio de uñas publicado.");
  }
  resetServiceForm();
}

function editService(id) {
  const srv = state.services.find(s => s.id === id);
  if (!srv) return;
  state.editingServiceId = srv.id;
  state.srvForm = {
    name: srv.name,
    category_id: srv.category_id,
    price: String(srv.price),
    duration_minutes: String(srv.duration_minutes),
    description: srv.description,
    image_path: srv.image_path,
    fileName: ""
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function deleteService(id) {
  state.services = state.services.filter(s => s.id !== id);
  if (state.editingServiceId === id) resetServiceForm();
  showNotice("Servicio de uñas borrado.");
}

function toggleService(id) {
  state.services = state.services.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s);
  render();
}

function resetServiceForm() {
  state.editingServiceId = null;
  state.srvForm = {
    name: "",
    category_id: "cat-semi",
    price: "38",
    duration_minutes: "75",
    description: "",
    image_path: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    fileName: ""
  };
  render();
}

// Subida de foto personalizada para Cursos
function handleCoursePhotoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  state.crsForm.fileName = file.name;
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.crsForm.image_path = ev.target.result;
    render();
  };
  reader.readAsDataURL(file);
}

function saveCourse(e) {
  e.preventDefault();
  const f = state.crsForm;
  if (state.editingCourseId) {
    state.courses = state.courses.map(c =>
      c.id === state.editingCourseId
        ? { ...c, name: f.name, category_id: f.category_id, modality: f.modality, price: Number(f.price), duration_hours: Number(f.duration_hours), level: f.level, description: f.description, image_path: f.image_path }
        : c
    );
    showNotice("Curso modificado correctamente.");
  } else {
    const newId = "crs-" + Date.now();
    state.courses.unshift({
      id: newId,
      category_id: f.category_id || "ccat-estructuras",
      name: f.name,
      modality: f.modality,
      price: Number(f.price),
      duration_hours: Number(f.duration_hours),
      level: f.level,
      description: f.description,
      image_path: f.image_path || "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
      includes_kit: true,
      is_active: true,
      syllabus: ["Teoría anatómica y química de productos", "Práctica supervisada paso a paso", "Certificado acreditativo"]
    });
    state.courseSessions.push({
      id: "ses-" + Date.now(),
      course_id: newId,
      date: "20 Dic 2026",
      location: "Vaema Nails Elche — Carrer Mestre Giner, 6",
      capacity: 6,
      enrolled: 0,
      status: "open"
    });
    showNotice("Nuevo curso publicado correctamente.");
  }
  resetCourseForm();
}

function editCourse(id) {
  const c = state.courses.find(item => item.id === id);
  if (!c) return;
  state.editingCourseId = c.id;
  state.crsForm = {
    name: c.name,
    category_id: c.category_id || "ccat-estructuras",
    modality: c.modality,
    price: String(c.price),
    duration_hours: String(c.duration_hours),
    level: c.level,
    description: c.description,
    image_path: c.image_path,
    fileName: ""
  };
  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function deleteCourse(id) {
  state.courses = state.courses.filter(c => c.id !== id);
  if (state.editingCourseId === id) resetCourseForm();
  showNotice("Curso borrado correctamente.");
}

function toggleCourse(id) {
  state.courses = state.courses.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c);
  render();
}

function resetCourseForm() {
  state.editingCourseId = null;
  state.crsForm = {
    name: "",
    category_id: "ccat-estructuras",
    modality: "Presencial",
    price: "290",
    duration_hours: "16",
    level: "Todos los niveles",
    description: "",
    image_path: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=85",
    fileName: ""
  };
  render();
}

// Subida de foto personalizada para Galería
function handleGalleryPhotoUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  state.galForm.fileName = file.name;
  const reader = new FileReader();
  reader.onload = (ev) => {
    state.galForm.image_path = ev.target.result;
    render();
  };
  reader.readAsDataURL(file);
}

function saveGalleryItem(e) {
  e.preventDefault();
  state.gallery.unshift({
    id: "gal-" + Date.now(),
    image_path: state.galForm.image_path || "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    tag: state.galForm.tag,
    alt: state.galForm.alt || "Trabajo realizado en Vaema Nails Elche",
    caption: state.galForm.caption || "Trabajo real en Vaema Nails Elche",
    is_published: true
  });
  state.galForm = { image_path: "", fileName: "", tag: "Clean Nails & Nude", alt: "", caption: "" };
  showNotice("Fotografía subida y publicada en la galería.");
}

function deleteGalleryItem(id) {
  state.gallery = state.gallery.filter(g => g.id !== id);
  showNotice("Fotografía borrada de la galería.");
}

function toggleGalleryItem(id) {
  state.gallery = state.gallery.map(g => g.id === id ? { ...g, is_published: !g.is_published } : g);
  render();
}

function renderNavbar() {
  // Sin el apartado "El Estudio", tal como pidió el usuario
  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'reservas', label: 'Reservar Cita' },
    { id: 'cursos', label: 'Cursos' },
    { id: 'galeria', label: 'Galería' },
    { id: 'contacto', label: 'Contacto' }
  ];

  return `
    <header class="sticky top-0 z-50 border-b border-[#EBE5D9] bg-[#FAF9F7]/95 backdrop-blur-md">
      <div class="w-full px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between gap-4">
        <button onclick="navigate('home')" class="flex items-center gap-3 group shrink-0 text-left cursor-pointer">
          <div class="w-10 h-10 rounded-full bg-[#E3DAC9] border border-[#B6AEA1] flex items-center justify-center text-[#2D2C28] font-serif text-base font-semibold group-hover:bg-[#2D2C28] group-hover:text-[#FAF9F7] transition-colors">
            VN
          </div>
          <div>
            <span class="block font-serif text-xl tracking-tight text-[#2D2C28] font-semibold leading-none">
              Vaema Nails
            </span>
            <span class="block text-[10px] uppercase tracking-[0.22em] text-[#878378] mt-1">
              Studio &amp; Academy · Elche
            </span>
          </div>
        </button>

        <nav class="hidden lg:flex items-center gap-1">
          ${navItems.map(item => `
            <button onclick="navigate('${item.id}')" class="px-3.5 py-2 rounded-full text-sm transition-colors cursor-pointer ${state.view === item.id ? 'bg-[#E3DAC9] text-[#2D2C28] font-medium' : 'text-[#5B5650] hover:text-[#2D2C28] hover:bg-[#F1EDE4]'}">
              ${item.label}
            </button>
          `).join('')}
        </nav>

        <div class="flex items-center gap-2.5 shrink-0">
          ${!state.user ? `
            <button onclick="navigate('login')" class="px-4 py-2.5 rounded-full text-sm font-medium text-[#5B5650] hover:text-[#2D2C28] hover:bg-[#F1EDE4] border border-[#EBE5D9] transition-colors cursor-pointer">
              Iniciar Sesión
            </button>
            <button onclick="navigate('registro')" class="px-4 py-2.5 rounded-full text-sm font-medium text-[#2D2C28] bg-[#E3DAC9] hover:bg-[#B6AEA1]/50 border border-[#B6AEA1]/60 transition-colors cursor-pointer">
              Crear Cuenta
            </button>
          ` : `
            ${state.user.role === 'admin' ? `
              <button onclick="navigate('admin')" class="px-4 py-2.5 rounded-full text-sm font-medium text-[#2D2C28] bg-[#E3DAC9] hover:bg-[#B6AEA1]/60 border border-[#B6AEA1] transition-colors cursor-pointer">
                Panel Admin
              </button>
            ` : ''}
            <div class="relative">
              <button onclick="state.profileDropdownOpen = !state.profileDropdownOpen; render();" class="px-4 py-2.5 rounded-full border border-[#B6AEA1] bg-[#F7F4EF] text-sm font-medium text-[#2D2C28] hover:bg-[#E3DAC9] transition-colors cursor-pointer">
                ${state.user.fullName.split(' ')[0]}
              </button>
              ${state.profileDropdownOpen ? `
                <div class="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#EBE5D9] bg-[#FAF9F7] shadow-lg p-2 space-y-1 text-left z-50">
                  <button onclick="navigate('mi-cuenta')" class="w-full text-left block px-3.5 py-2 rounded-xl text-sm text-[#2D2C28] hover:bg-[#F1EDE4] cursor-pointer">
                    Mi cuenta
                  </button>
                  <button onclick="navigate('mis-reservas')" class="w-full text-left block px-3.5 py-2 rounded-xl text-sm text-[#2D2C28] hover:bg-[#F1EDE4] cursor-pointer">
                    Mis reservas
                  </button>
                  ${state.user.role === 'admin' ? `
                    <button onclick="navigate('admin')" class="w-full text-left block px-3.5 py-2 rounded-xl text-sm font-medium text-[#2D2C28] bg-[#E3DAC9]/60 hover:bg-[#E3DAC9] cursor-pointer">
                      Panel de Administración
                    </button>
                  ` : ''}
                  <button onclick="logout()" class="w-full text-left px-3.5 py-2 rounded-xl text-sm text-[#5B5650] hover:text-[#2D2C28] hover:bg-[#F1EDE4] cursor-pointer">
                    Cerrar sesión
                  </button>
                </div>
              ` : ''}
            </div>
          `}
          <button onclick="navigate('reservas')" class="px-5 py-2.5 rounded-full text-sm font-medium bg-[#2D2C28] text-[#FAF9F7] hover:bg-[#5B5650] transition-colors cursor-pointer">
            Pedir Cita
          </button>
        </div>
      </div>
      <div class="lg:hidden border-t border-[#EBE5D9] bg-[#FAF9F7] px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
        ${navItems.map(item => `
          <button onclick="navigate('${item.id}')" class="px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${state.view === item.id ? 'bg-[#E3DAC9] text-[#2D2C28] font-medium' : 'text-[#5B5650] hover:text-[#2D2C28] hover:bg-[#F1EDE4]'}">
            ${item.label}
          </button>
        `).join('')}
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="bg-[#F1EDE4] border-t border-[#E3DAC9] text-[#5B5650] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-[#E3DAC9] border border-[#B6AEA1] flex items-center justify-center text-[#2D2C28] font-serif font-semibold">
                VN
              </div>
              <span class="font-serif text-lg font-semibold text-[#2D2C28]">
                ${state.business.name}
              </span>
            </div>
            <p class="text-xs leading-relaxed text-[#5B5650]">
              ${state.business.description}
            </p>
            <div class="pt-1 flex flex-wrap gap-2">
              <a href="${state.business.whatsapp}" target="_blank" class="px-4 py-2 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium">WhatsApp Directo</a>
              <a href="${state.business.instagram}" target="_blank" class="px-4 py-2 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] text-xs font-medium">Instagram Oficial</a>
            </div>
          </div>

          <div>
            <h3 class="font-serif text-base font-semibold text-[#2D2C28] mb-3">Navegación</h3>
            <ul class="space-y-2 text-xs">
              <li><button onclick="navigate('servicios')" class="hover:text-[#2D2C28] cursor-pointer">Servicios de Uñas y Tarifas</button></li>
              <li><button onclick="navigate('reservas')" class="hover:text-[#2D2C28] cursor-pointer">Reservar Cita Online</button></li>
              <li><button onclick="navigate('cursos')" class="hover:text-[#2D2C28] cursor-pointer">Cursos de Formación en Elche</button></li>
              <li><button onclick="navigate('galeria')" class="hover:text-[#2D2C28] cursor-pointer">Galería de Trabajos</button></li>
              <li><button onclick="navigate('contacto')" class="hover:text-[#2D2C28] cursor-pointer">Contacto y Ubicación</button></li>
            </ul>
          </div>

          <div>
            <h3 class="font-serif text-base font-semibold text-[#2D2C28] mb-3">Horario de Apertura</h3>
            <ul class="space-y-1.5 text-xs">
              ${state.hours.map(h => `
                <li class="flex justify-between border-b border-[#EBE5D9] pb-1">
                  <span class="font-medium text-[#2D2C28]">${h.day}</span>
                  <span>${h.hours}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="space-y-2.5 text-xs">
            <h3 class="font-serif text-base font-semibold text-[#2D2C28] mb-3">Ubicación y Contacto</h3>
            <p><strong class="block text-[#2D2C28] uppercase tracking-wider text-[10px]">Nuevo Estudio en Elche</strong>${state.business.address}</p>
            <p><strong class="block text-[#2D2C28] uppercase tracking-wider text-[10px]">Teléfono y WhatsApp</strong>${state.business.phone}</p>
            <p><strong class="block text-[#2D2C28] uppercase tracking-wider text-[10px]">Instagram Formadora</strong><a href="${state.business.instagram}" target="_blank" class="underline text-[#2D2C28]">${state.business.instagramHandle}</a></p>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// 1. PÁGINA DE INICIO
function renderHome() {
  const activeServices = state.services.filter(s => s.is_active).slice(0, 4);
  const activeCourses = state.courses.filter(c => c.is_active);
  return `
    <div>
      <!-- HERO -->
      <section class="relative overflow-hidden bg-gradient-to-b from-[#E3DAC9] via-[#EBE5D9] to-[#FAF9F7] border-b border-[#E3DAC9]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div class="lg:col-span-7 space-y-6 animate-slide-left">
              <h1 class="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#2D2C28] font-semibold leading-[1.08] tracking-tight">
                Cuidado, arquitectura y perfección en tus uñas.
              </h1>
              <p class="text-base sm:text-lg text-[#5B5650] max-w-2xl leading-relaxed">
                Especialistas en Elche (Alicante) en <strong class="text-[#2D2C28]">uñas de gel, acrílicas y poligel, manicura semipermanente con bases de vitamina y queratina</strong> para recuperar uñas dañadas, nail art a mano alzada y podo-estética.
              </p>
              <div class="flex flex-wrap items-center gap-3.5 pt-2">
                <button onclick="navigate('reservas')" class="px-7 py-4 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-sm font-medium hover:bg-[#5B5650] transition-all cursor-pointer">
                  Reservar Cita Ahora
                </button>
                <button onclick="navigate('servicios')" class="px-6 py-4 rounded-full bg-[#FAF9F7] text-[#2D2C28] border border-[#B6AEA1] text-sm font-medium hover:bg-[#F1EDE4] transition-all cursor-pointer">
                  Ver Carta de Servicios
                </button>
                <button onclick="navigate('cursos')" class="px-5 py-4 rounded-full text-sm font-medium text-[#5B5650] hover:text-[#2D2C28] underline underline-offset-4 cursor-pointer">
                  Formación y Cursos en Elche
                </button>
              </div>

              <div class="pt-6 border-t border-[#B6AEA1]/40 grid grid-cols-3 gap-4 max-w-xl">
                <div>
                  <p class="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2C28]">4.9 / 5</p>
                  <p class="text-xs text-[#5B5650] mt-0.5">Valoración de clientas en Elche</p>
                </div>
                <div>
                  <p class="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2C28]">+3 a 4 sem.</p>
                  <p class="text-xs text-[#5B5650] mt-0.5">Durabilidad intacta garantizada</p>
                </div>
                <div>
                  <p class="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2C28]">100%</p>
                  <p class="text-xs text-[#5B5650] mt-0.5">Esterilización e higiene</p>
                </div>
              </div>
            </div>

            <div class="lg:col-span-5">
              <div class="relative rounded-3xl overflow-hidden border-2 border-[#FAF9F7] shadow-xl bg-[#F1EDE4]">
                <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=85" alt="Vaema Nails Elche" class="w-full h-[420px] object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-[#2D2C28]/80 via-[#2D2C28]/15 to-transparent"></div>
                <div class="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-[#FAF9F7]/95 backdrop-blur-md border border-[#E3DAC9] flex items-center justify-between gap-4">
                  <div>
                    <span class="text-[10px] uppercase tracking-[0.18em] text-[#878378] font-semibold block">Tratamiento más solicitado</span>
                    <p class="font-serif text-lg font-semibold text-[#2D2C28] mt-0.5">Semipermanente + Base Vitamina y Queratina</p>
                    <p class="text-xs text-[#5B5650] mt-0.5">75 min · 38 € total (Reserva con 19 €)</p>
                  </div>
                  <button onclick="navigate('reservas', 'srv-01')" class="shrink-0 px-4 py-2.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Elegir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PILARES DE CALIDAD -->
      <section class="py-16 bg-[#FAF9F7] border-b border-[#EBE5D9]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-7 rounded-2xl bg-[#F7F4EF] border border-[#E3DAC9] space-y-2">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Bases con Vitamina y Queratina</h2>
            <p class="text-xs text-[#5B5650] leading-relaxed">Tratamientos enfocados en la reestructuración de uñas dañadas, débiles o estriadas, fortaleciendo la lámina natural en cada sesión.</p>
          </div>
          <div class="p-7 rounded-2xl bg-[#F7F4EF] border border-[#E3DAC9] space-y-2">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Gel, Acrílico, Poligel y Podo-Estética</h2>
            <p class="text-xs text-[#5B5650] leading-relaxed">Especialistas en extensiones con molde a medida, diseño artístico a mano alzada, pedrería y cuidado podo-estético integral de durezas y callosidades.</p>
          </div>
          <div class="p-7 rounded-2xl bg-[#F7F4EF] border border-[#E3DAC9] space-y-2">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Agenda Online y Formación en Elche</h2>
            <p class="text-xs text-[#5B5650] leading-relaxed">Selecciona tu servicio, consulta los huecos disponibles de lunes a sábado (08:00 a 21:00) y asegura tu cita con el anticipo del 50%.</p>
          </div>
        </div>
      </section>

      <!-- SERVICIOS DESTACADOS -->
      <section class="py-16 bg-[#F7F4EF] border-b border-[#EBE5D9]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Especialidades de Cabina en Elche</span>
              <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-[#2D2C28] mt-1">Nuestros Servicios de Uñas</h2>
            </div>
            <button onclick="navigate('servicios')" class="px-5 py-2.5 rounded-full bg-[#E3DAC9] text-[#2D2C28] text-xs font-medium cursor-pointer">
              Ver todos los servicios (${state.services.filter(s => s.is_active).length})
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${activeServices.map(srv => `
              <article class="rounded-2xl bg-[#FAF9F7] border border-[#E3DAC9] overflow-hidden flex flex-col sm:flex-row">
                <div class="sm:w-48 h-48 sm:h-auto shrink-0 bg-[#EBE5D9]">
                  <img src="${srv.image_path}" alt="${srv.name}" class="w-full h-full object-cover" />
                </div>
                <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div class="space-y-1.5">
                    <div class="flex justify-between text-xs text-[#878378]">
                      <span>${srv.duration_minutes} min</span>
                      <span class="font-medium text-[#5B5650]">Anticipo: ${(srv.price / 2).toFixed(2)} €</span>
                    </div>
                    <h3 class="font-serif text-xl font-semibold text-[#2D2C28]">${srv.name}</h3>
                    <p class="text-xs text-[#5B5650] leading-relaxed">${srv.description}</p>
                  </div>
                  <div class="pt-3 border-t border-[#EBE5D9] flex items-center justify-between">
                    <span class="font-serif text-2xl font-semibold text-[#2D2C28]">${srv.price} €</span>
                    <button onclick="navigate('reservas', '${srv.id}')" class="px-5 py-2.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Reservar Cita</button>
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- CURSOS DESTACADOS -->
      <section class="py-16 bg-[#FAF9F7] border-b border-[#EBE5D9]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Formación Profesional en Elche</span>
              <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-[#2D2C28] mt-1">Cursos de Uñas y Perfeccionamiento</h2>
            </div>
            <button onclick="navigate('cursos')" class="px-5 py-2.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">
              Ver Convocatorias e Inscripción
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${activeCourses.map(c => `
              <article class="rounded-2xl bg-[#F7F4EF] border border-[#E3DAC9] overflow-hidden flex flex-col justify-between">
                <div>
                  <img src="${c.image_path}" class="w-full h-48 object-cover" />
                  <div class="p-6 space-y-2">
                    <span class="text-xs text-[#878378]">${c.modality} · ${c.duration_hours}h · ${c.level}</span>
                    <h3 class="font-serif text-xl font-semibold text-[#2D2C28]">${c.name}</h3>
                    <p class="text-xs text-[#5B5650] leading-relaxed">${c.description}</p>
                  </div>
                </div>
                <div class="p-6 pt-0 flex items-center justify-between">
                  <span class="font-serif text-2xl font-semibold text-[#2D2C28]">${c.price} €</span>
                  <button onclick="navigate('cursos')" class="px-4 py-2 rounded-full bg-[#E3DAC9] text-[#2D2C28] text-xs font-medium cursor-pointer">Ver Curso</button>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- UBICACIÓN EN ELCHE + GOOGLE MAPS -->
      <section class="py-16 bg-[#F7F4EF]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="rounded-3xl bg-[#E3DAC9] border border-[#B6AEA1] p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7 space-y-3">
              <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Nuevo Estudio en Elche (Alicante)</span>
              <h2 class="font-serif text-3xl sm:text-4xl font-semibold text-[#2D2C28]">Te esperamos en Vaema Nails</h2>
              <p class="text-sm text-[#5B5650]">
                <strong class="text-[#2D2C28]">${state.business.address}</strong> · Teléfono y WhatsApp: <strong class="text-[#2D2C28]">${state.business.phone}</strong>
              </p>
              <p class="text-xs text-[#5B5650]">
                Anteriormente en <strong>${state.business.previousAddress}</strong>.
              </p>
              <div class="pt-2 flex flex-wrap gap-3">
                <button onclick="navigate('reservas')" class="px-5 py-3 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Reservar Cita Online</button>
                <a href="${state.business.whatsapp}" target="_blank" class="px-5 py-3 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] text-xs font-medium">WhatsApp Directo</a>
                <a href="${state.business.instagram}" target="_blank" class="px-5 py-3 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] text-xs font-medium">Instagram ${state.business.instagramHandle}</a>
              </div>
            </div>
            <div class="lg:col-span-5 p-6 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9] space-y-2 text-xs">
              <h3 class="font-serif text-lg font-semibold text-[#2D2C28]">Horario de Atención</h3>
              ${state.hours.map(h => `
                <div class="flex justify-between border-b border-[#EBE5D9] pb-1 last:border-none">
                  <span class="font-medium text-[#2D2C28]">${h.day}</span>
                  <span class="text-[#5B5650]">${h.hours}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="rounded-3xl overflow-hidden border border-[#EBE5D9] bg-[#F1EDE4] h-80 shadow-sm">
            <iframe title="Ubicación Vaema Nails en Carrer Mestre Giner, 6, Elx" src="${state.business.mapsUrl}" class="w-full h-full border-0" loading="lazy"></iframe>
          </div>
        </div>
      </section>
    </div>
  `;
}

// 2. PÁGINA DE SERVICIOS (Catálogo con filtro por categoría y buscador)
function renderServiciosPage() {
  const activeServices = state.services.filter(srv => {
    if (!srv.is_active) return false;
    const matchesCat = state.selectedServiceCategory === 'all' || srv.category_id === state.selectedServiceCategory;
    const q = state.serviceSearchQuery.toLowerCase();
    const matchesQ = !q || srv.name.toLowerCase().includes(q) || srv.description.toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12">
        <div class="max-w-3xl space-y-3">
          <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Carta de Tratamientos · Vaema Nails Elche</span>
          <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#2D2C28]">
            Servicios de Manicura, Nivelación, Esculpidas y Podo-Estética
          </h1>
          <p class="text-sm text-[#5B5650] leading-relaxed">
            Todos nuestros servicios incluyen diagnóstico previo de la lámina natural y esterilización. Para confirmar tu cita online se abona únicamente el <strong class="text-[#2D2C28]">50% de anticipo</strong>; el resto se abona en el salón.
          </p>
        </div>
      </div>

      <!-- Filtros de categoría y buscador -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F7F4EF] p-4 rounded-2xl border border-[#EBE5D9]">
        <div class="flex flex-wrap gap-2">
          <button onclick="state.selectedServiceCategory='all'; render();" class="px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${state.selectedServiceCategory === 'all' ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#FAF9F7] text-[#5B5650] border border-[#EBE5D9]'}">
            Todos los servicios (${state.services.filter(s => s.is_active).length})
          </button>
          ${state.categories.map(cat => `
            <button onclick="state.selectedServiceCategory='${cat.id}'; render();" class="px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${state.selectedServiceCategory === cat.id ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#FAF9F7] text-[#5B5650] border border-[#EBE5D9]'}">
              ${cat.name}
            </button>
          `).join('')}
        </div>

        <div class="min-w-[260px]">
          <input type="search" value="${state.serviceSearchQuery}" oninput="state.serviceSearchQuery = this.value; render();" placeholder="Buscar servicio (gel, acrílico, queratina...)" class="w-full px-4 py-2.5 rounded-xl bg-[#FAF9F7] border border-[#B6AEA1] text-xs text-[#2D2C28]" />
        </div>
      </div>

      <!-- Listado detallado de servicios -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        ${activeServices.map(srv => {
          const cat = state.categories.find(c => c.id === srv.category_id);
          const deposit = (srv.price / 2).toFixed(2);
          return `
            <article class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] overflow-hidden flex flex-col sm:flex-row shadow-sm">
              <div class="sm:w-56 h-60 sm:h-auto relative bg-[#E3DAC9] shrink-0">
                <img src="${srv.image_path}" alt="${srv.name}" class="w-full h-full object-cover" />
                ${srv.badge ? `<span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-[11px] font-medium">${srv.badge}</span>` : ''}
              </div>
              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-2">
                  <div class="flex items-center justify-between gap-2 text-xs text-[#878378]">
                    <span class="font-medium text-[#5B5650]">${cat ? cat.name : 'General'}</span>
                    <span class="px-2.5 py-0.5 rounded-full bg-[#F1EDE4] text-[#2D2C28] font-medium">${srv.duration_minutes} min</span>
                  </div>
                  <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">${srv.name}</h2>
                  <p class="text-xs text-[#5B5650] leading-relaxed">${srv.description}</p>
                  ${srv.includes ? `
                    <ul class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      ${srv.includes.map(inc => `
                        <li class="text-[11px] text-[#5B5650] flex items-center gap-1.5">
                          <span class="w-1.5 h-1.5 rounded-full bg-[#2D2C28] shrink-0"></span>
                          <span>${inc}</span>
                        </li>
                      `).join('')}
                    </ul>
                  ` : ''}
                </div>
                <div class="pt-4 border-t border-[#EBE5D9] flex flex-wrap items-center justify-between gap-4">
                  <div class="flex items-center gap-4">
                    <div>
                      <span class="text-[11px] text-[#878378] block">Precio del servicio</span>
                      <span class="font-serif text-2xl font-semibold text-[#2D2C28]">${srv.price.toFixed(2)} €</span>
                    </div>
                    <div class="px-3 py-1.5 rounded-xl bg-[#F1EDE4] border border-[#E3DAC9]">
                      <span class="text-[10px] uppercase tracking-wider text-[#878378] block">Anticipo 50%</span>
                      <span class="text-xs font-semibold text-[#2D2C28]">${deposit} € al reservar</span>
                    </div>
                  </div>
                  <button onclick="navigate('reservas', '${srv.id}')" class="px-5 py-3 rounded-xl bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium hover:bg-[#5B5650] cursor-pointer">
                    Reservar Cita
                  </button>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// 3. PÁGINA DE RESERVAR CITA (Asistente de 4 pasos + Resumen lateral)
function renderReservasPage() {
  const selectedService = state.services.find(s => s.id === state.selectedServiceId) || state.services[0];
  const extraRemovalPrice = state.needsRemoval ? 10 : 0;
  const extraRemovalMinutes = state.needsRemoval ? 20 : 0;
  const totalPrice = selectedService.price + extraRemovalPrice;
  const depositAmount = Number((totalPrice * 0.5).toFixed(2));
  const remainingAmount = Number((totalPrice - depositAmount).toFixed(2));
  const totalDuration = selectedService.duration_minutes + extraRemovalMinutes;
  const timeSlots = ["08:30", "10:00", "11:30", "13:00", "16:00", "17:30", "19:00"];

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <!-- Cabecera e indicador de pasos -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#EBE5D9] pb-8">
        <div>
          <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Agenda Online · Vaema Nails Elche</span>
          <h1 class="font-serif text-3xl sm:text-4xl font-semibold text-[#2D2C28] mt-1">Reservar Cita de Uñas</h1>
          <p class="text-sm text-[#5B5650] mt-2">
            Selecciona tu servicio, día y hora. Tu cita quedará confirmada al instante abonando el <strong class="text-[#2D2C28]">50% de anticipo</strong>.
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          ${[
            { num: 1, label: "1. Servicio" },
            { num: 2, label: "2. Fecha y Hora" },
            { num: 3, label: "3. Datos y Anticipo" }
          ].map(s => `
            <button onclick="if(!state.bookingConfirmed){ state.bookingStep=${s.num}; render(); }" class="px-3.5 py-2 rounded-full font-medium cursor-pointer ${state.bookingStep === s.num ? 'bg-[#2D2C28] text-[#FAF9F7]' : state.bookingStep > s.num ? 'bg-[#E3DAC9] text-[#2D2C28]' : 'bg-[#F1EDE4] text-[#878378]'}">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div class="lg:col-span-8 space-y-6">
          ${state.bookingStep === 1 ? `
            <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 sm:p-8 space-y-8">
              <div>
                <h2 class="font-serif text-2xl font-semibold text-[#2D2C28]">Paso 1 · Selecciona el servicio de uñas</h2>
                <p class="text-xs text-[#5B5650] mt-1">Elige el tratamiento principal para calcular automáticamente la duración y el anticipo.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${state.services.filter(s => s.is_active).map(srv => {
                  const isSelected = srv.id === state.selectedServiceId;
                  return `
                    <button type="button" onclick="state.selectedServiceId='${srv.id}'; render();" class="text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${isSelected ? 'bg-[#E3DAC9]/60 border-[#2D2C28]' : 'bg-[#F7F4EF] border-[#EBE5D9] hover:border-[#B6AEA1]'}">
                      <div>
                        <div class="flex items-start justify-between gap-2">
                          <span class="font-serif font-semibold text-base text-[#2D2C28]">${srv.name}</span>
                          ${isSelected ? `<span class="px-2 py-0.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-[10px]">Seleccionado</span>` : ''}
                        </div>
                        <p class="text-xs text-[#5B5650] mt-1 line-clamp-2">${srv.description}</p>
                      </div>
                      <div class="flex items-center justify-between pt-2 border-t border-[#EBE5D9]/80 text-xs">
                        <span class="text-[#878378]">${srv.duration_minutes} min</span>
                        <div>
                          <strong class="text-sm text-[#2D2C28]">${srv.price} €</strong>
                          <span class="text-[11px] text-[#5B5650] ml-1">(Anticipo ${(srv.price / 2).toFixed(0)} €)</span>
                        </div>
                      </div>
                    </button>
                  `;
                }).join('')}
              </div>

              <div class="p-5 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block font-medium text-[#5B5650] mb-1.5">Forma preferida de la uña</label>
                  <select onchange="state.nailShape = this.value; render();" class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28]">
                    ${["Almendra de salón", "Cuadrada suave (Squoval)", "Cuadrada definida", "Ovalada natural", "Bailarina / Coffin"].map(sh => `
                      <option value="${sh}" ${state.nailShape === sh ? 'selected' : ''}>${sh}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="flex items-center">
                  <label class="flex items-start gap-3 cursor-pointer text-[#2D2C28] bg-[#FAF9F7] p-3.5 rounded-xl border border-[#EBE5D9] w-full">
                    <input type="checkbox" ${state.needsRemoval ? 'checked' : ''} onchange="state.needsRemoval = this.checked; render();" class="mt-0.5 accent-[#2D2C28]" />
                    <span>
                      <strong class="block">Llevo material de otro centro para retirar</strong>
                      <span class="text-[#878378]">Añade +20 min y +10 € (5 € en el anticipo)</span>
                    </span>
                  </label>
                </div>
              </div>

              <div class="flex justify-end">
                <button onclick="state.bookingStep=2; render();" class="px-7 py-3.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium hover:bg-[#5B5650] cursor-pointer">
                  Continuar a Fecha y Hora
                </button>
              </div>
            </div>
          ` : state.bookingStep === 2 ? `
            <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 sm:p-8 space-y-6">
              <div>
                <h2 class="font-serif text-2xl font-semibold text-[#2D2C28]">Paso 2 · Selecciona el día y la hora de tu cita</h2>
                <p class="text-xs text-[#5B5650] mt-1">Duración total estimada del servicio: ${totalDuration} minutos.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-[#5B5650]">Fecha de la cita</label>
                  <input type="date" value="${state.selectedDate}" onchange="state.selectedDate = this.value; render();" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1] text-sm text-[#2D2C28]" />
                  <div class="p-4 rounded-xl bg-[#F1EDE4] border border-[#E3DAC9] text-xs space-y-1.5">
                    <p class="font-semibold text-[#2D2C28]">Horario de Vaema Nails Elche:</p>
                    <p class="text-[#5B5650]">Lunes a Sábado: 08:00 - 21:00 · Domingo: Cerrado</p>
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-[#5B5650]">Horas disponibles para el ${state.selectedDate}</label>
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    ${timeSlots.map(slot => `
                      <button type="button" onclick="state.selectedTime='${slot}'; render();" class="py-3 px-4 rounded-xl text-xs font-medium border cursor-pointer ${state.selectedTime === slot ? 'bg-[#2D2C28] text-[#FAF9F7] border-[#2D2C28]' : 'bg-[#F7F4EF] text-[#2D2C28] border-[#EBE5D9]'}">
                        ${slot} h
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-[#EBE5D9]">
                <button onclick="state.bookingStep=1; render();" class="px-5 py-2.5 rounded-full border border-[#B6AEA1] text-xs font-medium text-[#5B5650] cursor-pointer">
                  Cambiar servicio
                </button>
                <button onclick="state.bookingStep=3; render();" class="px-7 py-3.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium hover:bg-[#5B5650] cursor-pointer">
                  Continuar a Datos y Pago
                </button>
              </div>
            </div>
          ` : state.bookingStep === 3 ? `
            <form onsubmit="handleConfirmBooking(event)" class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 sm:p-8 space-y-6 text-xs">
              <div>
                <h2 class="font-serif text-2xl font-semibold text-[#2D2C28]">Paso 3 · Tus datos y pago del anticipo (50%)</h2>
                <p class="text-[#5B5650] mt-1">Introduce tus datos para recibir la confirmación de tu cita.</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="block font-medium text-[#2D2C28] mb-1">Nombre y apellidos *</label>
                  <input type="text" required value="${state.bookingFullName}" oninput="state.bookingFullName = this.value" placeholder="Ej. Claudia Morales Vega" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Correo electrónico *</label>
                  <input type="email" required value="${state.bookingEmail}" oninput="state.bookingEmail = this.value" placeholder="tu@email.com" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Teléfono móvil (WhatsApp) *</label>
                  <input type="tel" required value="${state.bookingPhone}" oninput="state.bookingPhone = this.value" placeholder="+34 600 00 00 00" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-medium text-[#2D2C28] mb-1">Observaciones sobre el diseño o tus uñas (opcional)</label>
                  <textarea rows="2" oninput="state.bookingNotes = this.value" placeholder="Indica si prefieres algún tono o acabado concreto..." class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]">${state.bookingNotes}</textarea>
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-[#F1EDE4] border border-[#E3DAC9] space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-serif text-lg font-semibold text-[#2D2C28]">Método de pago para el anticipo (${depositAmount.toFixed(2)} €)</h3>
                  <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] font-medium">Pasarela Cifrada</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  ${[
                    { id: 'stripe_card', title: 'Tarjeta Bancaria', sub: 'Visa, Mastercard' },
                    { id: 'bizum', title: 'Bizum Instantáneo', sub: 'Confirmación móvil' },
                    { id: 'apple_pay', title: 'Apple Pay / Google Pay', sub: 'Pago en 1 clic' }
                  ].map(pm => `
                    <button type="button" onclick="state.paymentMethod='${pm.id}'; render();" class="p-3.5 rounded-xl border text-left cursor-pointer ${state.paymentMethod === pm.id ? 'bg-[#2D2C28] text-[#FAF9F7] border-[#2D2C28]' : 'bg-[#FAF9F7] text-[#2D2C28] border-[#EBE5D9]'}">
                      <span class="block font-semibold">${pm.title}</span>
                      <span class="block text-[11px] mt-0.5 ${state.paymentMethod === pm.id ? 'text-[#E3DAC9]' : 'text-[#878378]'}">${pm.sub}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="flex items-center justify-between pt-2">
                <button type="button" onclick="state.bookingStep=2; render();" class="px-5 py-2.5 rounded-full border border-[#B6AEA1] font-medium text-[#5B5650] cursor-pointer">
                  Volver a Fecha y Hora
                </button>
                <button type="submit" class="px-8 py-4 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-semibold hover:bg-[#5B5650] cursor-pointer">
                  Abonar Anticipo (${depositAmount.toFixed(2)} €) y Confirmar Cita
                </button>
              </div>
            </form>
          ` : `
            <div class="rounded-3xl bg-[#F1EDE4] border-2 border-[#B6AEA1] p-8 space-y-6">
              <span class="inline-block px-3.5 py-1.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium">Reserva Confirmada y Anticipo Abonado</span>
              <h2 class="font-serif text-3xl font-semibold text-[#2D2C28]">Te esperamos en Vaema Nails Elche, ${state.bookingFullName || 'Clienta'}</h2>
              <p class="text-sm text-[#5B5650]">Tu cita ha quedado registrada para el <strong>${state.selectedDate} a las ${state.selectedTime} h</strong> en ${state.business.address}.</p>
              <div class="flex flex-wrap gap-3">
                <button onclick="navigate('mis-reservas')" class="px-6 py-3 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Ver en Mis Reservas</button>
                <button onclick="state.bookingConfirmed=false; state.bookingStep=1; render();" class="px-6 py-3 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] text-xs font-medium cursor-pointer">Realizar otra reserva</button>
              </div>
            </div>
          `}
        </div>

        <!-- Resumen lateral persistente -->
        <aside class="lg:col-span-4 sticky top-28 rounded-3xl bg-[#F7F4EF] border border-[#E3DAC9] p-6 space-y-5 shadow-sm">
          <div class="flex items-center justify-between border-b border-[#EBE5D9] pb-4">
            <h3 class="font-serif text-lg font-semibold text-[#2D2C28]">Resumen de tu Cita</h3>
            <span class="text-xs px-2.5 py-1 rounded-full bg-[#E3DAC9] text-[#2D2C28] font-medium">Anticipo 50%</span>
          </div>
          <div class="flex items-center gap-3.5">
            <img src="${selectedService.image_path}" class="w-16 h-16 rounded-2xl object-cover border border-[#B6AEA1]" />
            <div>
              <p class="font-serif font-semibold text-sm text-[#2D2C28]">${selectedService.name}</p>
              <p class="text-xs text-[#878378] mt-0.5">${totalDuration} min · Forma: ${state.nailShape}</p>
            </div>
          </div>
          <div class="space-y-2 text-xs border-y border-[#EBE5D9] py-4">
            <div class="flex justify-between"><span class="text-[#878378]">Fecha seleccionada:</span><strong class="text-[#2D2C28]">${state.selectedDate}</strong></div>
            <div class="flex justify-between"><span class="text-[#878378]">Hora de inicio:</span><strong class="text-[#2D2C28]">${state.selectedTime} h</strong></div>
            <div class="flex justify-between"><span class="text-[#878378]">Servicio base:</span><span class="text-[#2D2C28]">${selectedService.price.toFixed(2)} €</span></div>
            ${state.needsRemoval ? `<div class="flex justify-between"><span class="text-[#878378]">Retirada previa:</span><span class="text-[#2D2C28]">+10.00 €</span></div>` : ''}
          </div>
          <div class="space-y-2.5">
            <div class="flex justify-between items-baseline text-sm">
              <span class="text-[#5B5650]">Importe total del servicio</span>
              <strong class="font-serif text-lg text-[#2D2C28]">${totalPrice.toFixed(2)} €</strong>
            </div>
            <div class="p-4 rounded-2xl bg-[#E3DAC9] text-[#2D2C28] flex justify-between items-center">
              <div>
                <span class="text-xs font-semibold block">Anticipo a abonar hoy (50%)</span>
                <span class="text-[11px] text-[#5B5650]">Para confirmar tu reserva</span>
              </div>
              <span class="font-serif text-2xl font-bold">${depositAmount.toFixed(2)} €</span>
            </div>
            <div class="flex justify-between text-xs text-[#878378] px-1">
              <span>Restante a abonar en el estudio:</span>
              <strong class="text-[#5B5650]">${remainingAmount.toFixed(2)} €</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `;
}

// 4. PÁGINA DE CURSOS E INSCRIPCIÓN ONLINE
function renderCursosPage() {
  const filteredCourses = state.courses.filter(c =>
    c.is_active && (state.selectedCourseCategory === 'all' || c.category_id === state.selectedCourseCategory)
  );
  const activeSession = state.courseSessions.find(s => s.id === state.activeSessionIdForModal);
  const activeCourse = activeSession ? state.courses.find(c => c.id === activeSession.course_id) : null;

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-8 space-y-3">
          <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Formación Profesional en Elche · ${state.business.instagramHandle}</span>
          <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#2D2C28]">Cursos de Uñas e Inscripción Online</h1>
          <p class="text-sm text-[#5B5650] leading-relaxed">
            Grupos reducidos de 4 a 8 alumnas por edición para garantizar corrección postural y seguimiento técnico personalizado en cada práctica.
          </p>
        </div>
        <div class="lg:col-span-4 bg-[#FAF9F7] p-6 rounded-2xl border border-[#E3DAC9] space-y-2 text-xs">
          <h2 class="font-serif text-base font-semibold text-[#2D2C28]">Qué incluyen nuestras formaciones</h2>
          <ul class="space-y-1.5 text-[#5B5650]">
            <li>- Dossier teórico-técnico impreso y digital</li>
            <li>- Todo el material y aparatología en clase</li>
            <li>- Práctica real supervisada y certificado acreditativo</li>
          </ul>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <button onclick="state.selectedCourseCategory='all'; render();" class="px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${state.selectedCourseCategory === 'all' ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#F7F4EF] text-[#5B5650] border border-[#EBE5D9]'}">
          Todos los Cursos
        </button>
        ${state.courseCategories.map(cat => `
          <button onclick="state.selectedCourseCategory='${cat.id}'; render();" class="px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${state.selectedCourseCategory === cat.id ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#F7F4EF] text-[#5B5650] border border-[#EBE5D9]'}">
            ${cat.name}
          </button>
        `).join('')}
      </div>

      <div class="space-y-8">
        ${filteredCourses.map(course => {
          const sessions = state.courseSessions.filter(s => s.course_id === course.id);
          return `
            <article class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm">
              <div class="lg:col-span-4 bg-[#E3DAC9] relative min-h-[240px]">
                <img src="${course.image_path}" alt="${course.name}" class="w-full h-full object-cover" />
                <div class="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span class="px-3 py-1 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium">${course.modality}</span>
                  <span class="px-3 py-1 rounded-full bg-[#FAF9F7]/95 text-[#2D2C28] text-xs font-medium">${course.duration_hours} horas</span>
                </div>
              </div>
              <div class="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div class="space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xs uppercase tracking-wider text-[#878378] font-semibold">Nivel: ${course.level} ${course.includes_kit ? '· Kit profesional incluido' : ''}</span>
                    <span class="font-serif text-2xl font-semibold text-[#2D2C28]">${course.price} €</span>
                  </div>
                  <h2 class="font-serif text-2xl font-semibold text-[#2D2C28]">${course.name}</h2>
                  <p class="text-xs sm:text-sm text-[#5B5650] leading-relaxed">${course.description}</p>
                  ${course.syllabus ? `
                    <div class="pt-2">
                      <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2D2C28] mb-2">Contenidos del programa:</h3>
                      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        ${course.syllabus.map(item => `<li class="text-xs text-[#5B5650]">· ${item}</li>`).join('')}
                      </ul>
                    </div>
                  ` : ''}
                </div>

                <div class="pt-4 border-t border-[#EBE5D9] space-y-3">
                  <h3 class="text-xs font-semibold uppercase tracking-wider text-[#2D2C28]">Próximas convocatorias disponibles en Elche:</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    ${sessions.map(ses => {
                      const available = ses.capacity - ses.enrolled;
                      const isFull = ses.status === 'full' || available <= 0;
                      return `
                        <div class="p-4 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9] flex items-center justify-between gap-3 text-xs">
                          <div>
                            <p class="font-semibold text-[#2D2C28]">${ses.date}</p>
                            <p class="text-[11px] text-[#878378]">${ses.location}</p>
                            <p class="text-[11px] font-medium text-[#5B5650]">${isFull ? 'Plazas agotadas' : 'Plazas libres: ' + available + ' de ' + ses.capacity}</p>
                          </div>
                          <button ${isFull ? 'disabled' : ''} onclick="state.activeSessionIdForModal='${ses.id}'; state.enrollmentSuccess=false; render();" class="px-4 py-2.5 rounded-xl text-xs font-medium shrink-0 cursor-pointer ${isFull ? 'bg-[#EBE5D9] text-[#878378] cursor-not-allowed' : 'bg-[#2D2C28] text-[#FAF9F7] hover:bg-[#5B5650]'}">
                            ${isFull ? 'Completo' : 'Inscribirme'}
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>

      ${activeSession && activeCourse ? `
        <div class="fixed inset-0 z-50 bg-[#2D2C28]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#FAF9F7] border-2 border-[#E3DAC9] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl text-xs">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="uppercase tracking-wider text-[#878378] font-semibold">Reserva de Plaza</span>
                <h3 class="font-serif text-2xl font-semibold text-[#2D2C28] mt-1">${activeCourse.name}</h3>
              </div>
              <button onclick="state.activeSessionIdForModal=null; render();" class="px-3 py-1.5 rounded-full bg-[#F1EDE4] text-[#2D2C28] font-medium cursor-pointer">Cerrar</button>
            </div>
            ${state.enrollmentSuccess ? `
              <div class="p-5 rounded-2xl bg-[#F1EDE4] border border-[#B6AEA1] space-y-3">
                <p class="text-sm font-serif font-semibold text-[#2D2C28]">Inscripción confirmada para ${state.studentName}</p>
                <p class="text-[#5B5650]">Hemos registrado tu plaza en la convocatoria del <strong>${activeSession.date}</strong> en Vaema Nails Elche.</p>
                <button onclick="state.activeSessionIdForModal=null; render();" class="w-full py-3 rounded-xl bg-[#2D2C28] text-[#FAF9F7] font-medium cursor-pointer">Finalizar</button>
              </div>
            ` : `
              <form onsubmit="event.preventDefault(); state.enrollmentSuccess=true; render();" class="space-y-4">
                <div class="p-3.5 rounded-xl bg-[#F1EDE4] border border-[#E3DAC9]">
                  <p><strong>Convocatoria:</strong> ${activeSession.date} · ${activeCourse.modality}</p>
                  <p><strong>Importe de inscripción:</strong> ${activeCourse.price} €</p>
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Nombre completo de la alumna *</label>
                  <input type="text" required value="${state.studentName}" oninput="state.studentName=this.value" placeholder="Nombre y apellidos para el certificado" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Correo electrónico *</label>
                  <input type="email" required value="${state.studentEmail}" oninput="state.studentEmail=this.value" placeholder="alumna@email.com" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Teléfono móvil (WhatsApp) *</label>
                  <input type="tel" required value="${state.studentPhone}" oninput="state.studentPhone=this.value" placeholder="+34 600 00 00 00" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <button type="submit" class="w-full py-3.5 rounded-xl bg-[#2D2C28] text-[#FAF9F7] font-medium cursor-pointer">Confirmar Plaza (${activeCourse.price} €)</button>
              </form>
            `}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// 5. PÁGINA DE GALERÍA DE TRABAJOS REALES
function renderGaleriaPage() {
  const published = state.gallery.filter(g => g.is_published);
  const tags = ['Todos', ...Array.from(new Set(published.map(g => g.tag)))];
  const visible = published.filter(g => state.selectedGalleryTag === 'Todos' || g.tag === state.selectedGalleryTag);
  const activeLightbox = published.find(g => g.id === state.lightboxGalleryId);

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="max-w-2xl space-y-3">
          <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Portfolio de Vaema Nails Elche</span>
          <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#2D2C28]">Galería de Trabajos Reales</h1>
          <p class="text-sm text-[#5B5650] leading-relaxed">
            Fotografías de trabajos realizados en nuestro estudio: manicura semipermanente con vitamina y queratina, uñas de gel, acrílico, poligel y decoración a mano alzada.
          </p>
        </div>
        <button onclick="navigate('reservas')" class="px-6 py-3.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium shrink-0 cursor-pointer">
          Reservar Cita Online
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        ${tags.map(tag => `
          <button onclick="state.selectedGalleryTag='${tag}'; render();" class="px-4 py-2 rounded-full text-xs font-medium cursor-pointer ${state.selectedGalleryTag === tag ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#F7F4EF] text-[#5B5650] border border-[#EBE5D9]'}">
            ${tag}
          </button>
        `).join('')}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${visible.map(item => `
          <figure onclick="state.lightboxGalleryId='${item.id}'; render();" class="group cursor-pointer rounded-3xl overflow-hidden bg-[#FAF9F7] border border-[#EBE5D9] hover:border-[#B6AEA1] transition-all shadow-sm flex flex-col">
            <div class="relative aspect-square bg-[#E3DAC9] overflow-hidden">
              <img src="${item.image_path}" alt="${item.alt || item.caption}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FAF9F7]/95 text-[#2D2C28] text-[11px] font-medium border border-[#EBE5D9]">
                ${item.tag}
              </span>
            </div>
            <figcaption class="p-5 flex-1 flex flex-col justify-between gap-3">
              <p class="text-xs text-[#2D2C28] font-medium leading-relaxed">${item.caption}</p>
              <div class="flex items-center justify-between text-[11px] text-[#878378] pt-2 border-t border-[#EBE5D9]">
                <span>Ampliar imagen</span>
                <span class="font-semibold text-[#2D2C28]">Ver detalle</span>
              </div>
            </figcaption>
          </figure>
        `).join('')}
      </div>

      ${activeLightbox ? `
        <div onclick="state.lightboxGalleryId=null; render();" class="fixed inset-0 z-50 bg-[#2D2C28]/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div onclick="event.stopPropagation()" class="bg-[#FAF9F7] border-2 border-[#E3DAC9] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
            <div class="aspect-[16/11] bg-[#E3DAC9]">
              <img src="${activeLightbox.image_path}" class="w-full h-full object-cover" />
            </div>
            <div class="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-[#878378] font-semibold">${activeLightbox.tag}</span>
                <p class="font-serif text-lg font-semibold text-[#2D2C28] mt-0.5">${activeLightbox.caption}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button onclick="state.lightboxGalleryId=null; navigate('reservas');" class="px-5 py-2.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Reservar este estilo</button>
                <button onclick="state.lightboxGalleryId=null; render();" class="px-4 py-2.5 rounded-full bg-[#F1EDE4] text-[#2D2C28] text-xs font-medium cursor-pointer">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// 6. PÁGINA DE CONTACTO, HORARIOS Y MAPA
function renderContactoPage() {
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12">
        <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Ubicación del Nuevo Local en Elche y Atención Directa</span>
        <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#2D2C28] mt-2">Contacto, Horarios y Mapa</h1>
        <p class="text-sm text-[#5B5650] mt-2 max-w-2xl">
          Escríbenos directamente por WhatsApp o Instagram para consultas sobre diseños, uñas de gel/acrílico/poligel, tratamientos de queratina o formaciones presenciales en Elche.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-5 space-y-6">
          <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 space-y-4">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Datos de Contacto</h2>
            <div class="space-y-3 text-xs">
              <div class="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#EBE5D9]">
                <span class="text-[#878378] block">Dirección del nuevo local</span>
                <strong class="text-[#2D2C28] text-sm block mt-0.5">${state.business.address}</strong>
                <span class="text-[11px] text-[#5B5650] mt-1 block">Coordenadas GPS: 38.267839, -0.706282</span>
              </div>

              <div class="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#EBE5D9] flex items-center justify-between gap-3">
                <div>
                  <span class="text-[#878378] block">Teléfono y WhatsApp</span>
                  <strong class="text-[#2D2C28] text-sm">${state.business.phone}</strong>
                </div>
                <a href="${state.business.whatsapp}" target="_blank" class="px-4 py-2 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-medium shrink-0">Abrir WhatsApp</a>
              </div>

              <div class="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#EBE5D9] flex items-center justify-between gap-3">
                <div>
                  <span class="text-[#878378] block">Instagram Oficial y Formaciones</span>
                  <strong class="text-[#2D2C28] text-sm">${state.business.instagramHandle}</strong>
                </div>
                <a href="${state.business.instagram}" target="_blank" class="px-4 py-2 rounded-full bg-[#E3DAC9] text-[#2D2C28] font-medium shrink-0">Ver Instagram</a>
              </div>

              <div class="p-3.5 rounded-xl bg-[#F1EDE4] border border-[#E3DAC9] space-y-1.5">
                <span class="text-[#878378] block">Referencia de nuestra ubicación anterior en Elche</span>
                <p class="text-[#5B5650]">Anteriormente en <strong class="text-[#2D2C28]">${state.business.previousAddress}</strong>. Ahora te atendemos en <strong class="text-[#2D2C28]">Carrer Mestre Giner, 6</strong>.</p>
                <a href="${state.business.previousMapsUrl}" target="_blank" class="inline-block text-[#2D2C28] font-semibold underline pt-0.5">Ver reseñas y ficha anterior en Google Maps</a>
              </div>
            </div>
          </div>

          <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 space-y-4">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Horario Habitual</h2>
            <ul class="space-y-2 text-xs">
              ${state.hours.map(bh => `
                <li class="flex justify-between py-1.5 border-b border-[#EBE5D9]">
                  <span class="font-medium text-[#2D2C28]">${bh.day}</span>
                  <span class="text-[#5B5650]">${bh.hours}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="lg:col-span-7 space-y-6">
          <div class="rounded-3xl overflow-hidden border border-[#EBE5D9] bg-[#F1EDE4] h-80 shadow-sm">
            <iframe title="Mapa Vaema Nails Elche" src="${state.business.mapsUrl}" class="w-full h-full border-0" loading="lazy"></iframe>
          </div>

          <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 sm:p-8 space-y-4">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Envíanos una consulta</h2>
            ${state.contactSent ? `
              <div class="p-4 rounded-2xl bg-[#E3DAC9] text-[#2D2C28] text-xs font-medium">
                Hemos recibido tu mensaje. Te responderemos lo antes posible por teléfono o WhatsApp.
              </div>
            ` : `
              <form onsubmit="event.preventDefault(); state.contactSent=true; render();" class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Nombre *</label>
                  <input type="text" required placeholder="Tu nombre" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div>
                  <label class="block font-medium text-[#2D2C28] mb-1">Teléfono o Email *</label>
                  <input type="text" required placeholder="+34 600 00 00 00" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block font-medium text-[#2D2C28] mb-1">Mensaje o consulta sobre servicios / cursos *</label>
                  <textarea rows="3" required placeholder="Escribe aquí tu consulta..." class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]"></textarea>
                </div>
                <div class="sm:col-span-2 flex justify-end">
                  <button type="submit" class="px-6 py-3 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-medium hover:bg-[#5B5650] cursor-pointer">Enviar Consulta</button>
                </div>
              </form>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

// 7. PÁGINA MI CUENTA
function renderMiCuenta() {
  const u = state.user || { fullName: "Azacin", email: "azayjoe1234@gmail.com", role: "customer" };
  const isAdmin = u.role === 'admin';
  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="space-y-2">
          <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Espacio Personal</span>
          <h1 class="font-serif text-3xl sm:text-5xl font-semibold text-[#2D2C28]">Mi cuenta</h1>
          <p class="text-sm sm:text-base text-[#5B5650]">
            Bienvenida a tu espacio personal. Gestiona tus datos y consulta el estado de tus citas en el estudio.
          </p>
        </div>

        <div class="flex items-center gap-3 self-start sm:self-center bg-[#FAF9F7] px-5 py-3.5 rounded-2xl border border-[#EBE5D9]">
          <div class="w-11 h-11 rounded-full bg-[#2D2C28] text-[#FAF9F7] flex items-center justify-center font-serif text-base font-semibold shrink-0">
            ${(u.fullName || u.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div class="text-xs">
            <span class="text-[10px] uppercase tracking-wider text-[#878378] font-semibold block">
              ${isAdmin ? 'Cuenta Administradora' : 'Cuenta de Clienta'}
            </span>
            <strong class="text-[#2D2C28] text-sm block">${u.fullName || 'Sin nombre'}</strong>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section class="lg:col-span-7 rounded-3xl border border-[#EBE5D9] bg-[#FAF9F7] p-6 sm:p-8 shadow-sm space-y-6">
          <div class="border-b border-[#EBE5D9] pb-4 flex items-center justify-between">
            <div>
              <span class="text-[11px] uppercase tracking-wider text-[#878378] font-semibold block">Información de Perfil</span>
              <h2 class="text-2xl font-serif font-semibold text-[#2D2C28] mt-0.5">Mis datos personales</h2>
            </div>
            <span class="px-3 py-1 rounded-full bg-[#F1EDE4] border border-[#E3DAC9] text-xs font-medium text-[#2D2C28]">Sesión activa</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9]">
              <p class="text-xs uppercase tracking-wider text-[#878378] font-medium">Nombre</p>
              <p class="font-serif text-lg font-semibold text-[#2D2C28] mt-1">${u.fullName || 'Sin nombre'}</p>
            </div>
            <div class="p-4 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9]">
              <p class="text-xs uppercase tracking-wider text-[#878378] font-medium">Correo electrónico</p>
              <p class="text-sm font-medium text-[#2D2C28] mt-1.5 break-all">${u.email}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-[#F1EDE4] border border-[#E3DAC9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#5B5650]">
            <div>
              <strong class="text-[#2D2C28] block text-sm font-serif">Ubicación del Estudio en Elche</strong>
              <span>Carrer Mestre Giner, 6, 03201 Elx, Alicante · Tel. +34 646 42 47 67</span>
            </div>
            <button onclick="navigate('reservas')" class="px-4 py-2.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-medium hover:bg-[#5B5650] shrink-0 cursor-pointer">
              Pedir Nueva Cita
            </button>
          </div>
        </section>

        <div class="lg:col-span-5 space-y-4">
          <button onclick="navigate('mis-reservas')" class="w-full text-left block rounded-3xl border border-[#EBE5D9] bg-[#FAF9F7] p-6 transition-all hover:border-[#B6AEA1] hover:bg-[#F7F4EF] shadow-sm cursor-pointer">
            <span class="text-[10px] uppercase tracking-[0.18em] text-[#878378] font-semibold block">Agenda y Citas</span>
            <h3 class="font-serif text-xl font-semibold text-[#2D2C28] mt-1">Mis reservas</h3>
            <p class="mt-1.5 text-xs text-[#5B5650] leading-relaxed">Consulta tus próximas citas confirmadas y revisa tu historial de servicios en el estudio.</p>
          </button>

          ${isAdmin ? `
            <button onclick="navigate('admin')" class="w-full text-left block rounded-3xl border border-[#B6AEA1] bg-[#E3DAC9] p-6 transition-all hover:bg-[#B6AEA1]/50 shadow-sm cursor-pointer">
              <span class="text-[10px] uppercase tracking-[0.18em] text-[#5B5650] font-semibold block">Gestión del Estudio</span>
              <h3 class="font-serif text-xl font-semibold text-[#2D2C28] mt-1">Panel de Administración</h3>
              <p class="mt-1.5 text-xs text-[#5B5650] leading-relaxed">Modifica servicios de uñas, cursos, fotografías, tarifas y gestiona la agenda de citas.</p>
            </button>
          ` : ''}

          <button onclick="logout()" class="w-full rounded-3xl bg-[#2D2C28] p-6 text-left text-[#FAF9F7] transition-colors hover:bg-[#5B5650] shadow-sm cursor-pointer">
            <span class="text-[10px] uppercase tracking-[0.18em] text-[#E3DAC9] font-semibold block">Seguridad</span>
            <h3 class="font-serif text-xl font-semibold mt-1">Cerrar sesión</h3>
            <p class="mt-1.5 text-xs text-[#E3DAC9] leading-relaxed">Salir de tu cuenta de forma segura en este dispositivo.</p>
          </button>
        </div>
      </div>
    </div>
  `;
}

// 8. PÁGINA MIS RESERVAS (Separada de Mi Cuenta)
function renderMisReservasPage() {
  const u = state.user || { fullName: "Azacin", email: "azayjoe1234@gmail.com" };
  const upcoming = state.appointments.filter(a => a.upcoming);
  const history = state.appointments.filter(a => !a.upcoming);

  return `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div class="rounded-3xl bg-[#E3DAC9]/70 border border-[#B6AEA1]/40 p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div class="space-y-2">
          <span class="text-xs uppercase tracking-[0.2em] text-[#5B5650] font-semibold">Agenda Personal</span>
          <h1 class="text-3xl sm:text-5xl font-serif font-semibold text-[#2D2C28]">Mis reservas</h1>
          <p class="text-sm sm:text-base text-[#5B5650]">
            Hola, ${u.fullName}. Aquí puedes consultar tus próximas citas y tu historial en Vaema Nails Elche.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button onclick="navigate('reservas')" class="px-6 py-3 rounded-full bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium cursor-pointer">Nueva Cita</button>
          <button onclick="navigate('mi-cuenta')" class="px-5 py-3 rounded-full bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] text-xs font-medium cursor-pointer">Volver a Mi cuenta</button>
        </div>
      </div>

      <section class="space-y-4">
        <h2 class="text-2xl font-serif font-semibold text-[#2D2C28]">Próximas citas</h2>
        <div class="grid gap-4">
          ${upcoming.map(apt => `
            <article class="rounded-3xl border border-[#EBE5D9] bg-[#FAF9F7] p-6 sm:p-8 shadow-sm">
              <div class="flex flex-wrap justify-between gap-4">
                <div>
                  <h3 class="text-xl font-serif font-semibold text-[#2D2C28]">${apt.serviceName}</h3>
                  <p class="mt-1 text-xs text-[#5B5650]">${apt.dateText}</p>
                </div>
                <span class="h-fit rounded-full bg-[#E3DAC9] px-4 py-1.5 text-xs font-medium text-[#2D2C28]">${apt.status}</span>
              </div>
              <div class="mt-4 border-t border-[#EBE5D9] pt-4 flex gap-6 text-xs text-[#5B5650]">
                <p>Precio total: <strong class="text-[#2D2C28]">${apt.price} €</strong></p>
                <p>Anticipo abonado (50%): <strong class="text-[#2D2C28]">${apt.deposit} €</strong></p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="text-2xl font-serif font-semibold text-[#2D2C28]">Historial de reservas</h2>
        <div class="grid gap-4">
          ${history.map(apt => `
            <article class="rounded-2xl border border-[#EBE5D9] bg-[#FAF9F7] p-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 class="font-serif text-lg font-semibold text-[#2D2C28]">${apt.serviceName}</h3>
                <p class="mt-1 text-xs text-[#878378]">${apt.dateText}</p>
              </div>
              <div class="text-right text-xs space-y-1">
                <span class="inline-block px-3 py-1 rounded-full bg-[#F1EDE4] text-[#5B5650] font-medium">${apt.status}</span>
                <p class="font-serif text-base font-semibold text-[#2D2C28]">${apt.price} €</p>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

// 9. PÁGINA DE INICIAR SESIÓN UNIFICADA
function renderLogin() {
  return `
    <div class="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div class="lg:col-span-6 bg-[#FAF9F7] border border-[#EBE5D9] rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm">
          <div class="space-y-1.5">
            <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Acceso a tu Cuenta</span>
            <h1 class="font-serif text-3xl font-semibold text-[#2D2C28]">Iniciar Sesión</h1>
            <p class="text-xs text-[#5B5650] leading-relaxed">
              Introduce tu correo electrónico y contraseña. El sistema identifica automáticamente si tu cuenta es de usuario normal o cuenta administradora.
            </p>
          </div>

          <form onsubmit="handleUnifiedLogin(event)" class="space-y-4 text-xs">
            <div>
              <label class="block font-medium text-[#2D2C28] mb-1.5">Correo electrónico</label>
              <input id="login-email" type="email" required placeholder="tu@email.com" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1] text-[#2D2C28]" />
            </div>
            <div>
              <label class="block font-medium text-[#2D2C28] mb-1.5">Contraseña</label>
              <input id="login-password" type="password" required placeholder="Introduce tu contraseña" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1] text-[#2D2C28]" />
            </div>
            <button type="submit" class="w-full py-3.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-medium hover:bg-[#5B5650] transition-colors cursor-pointer">
              Iniciar Sesión
            </button>
          </form>

          <div class="p-3.5 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9] text-[11px] text-[#5B5650] space-y-2">
            <span class="block font-semibold text-[#2D2C28]">Prueba rápida de detección automática de cuenta:</span>
            <div class="flex flex-wrap gap-2">
              <button type="button" onclick="quickFillLogin('azayjoe1234@gmail.com', 'Cliente2026!')" class="px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28] cursor-pointer">
                Rellenar como Usuario Normal (azayjoe1234@gmail.com)
              </button>
              <button type="button" onclick="quickFillLogin('admin@vaemanails.es', 'AdminVaema2026!')" class="px-3 py-1.5 rounded-lg bg-[#E3DAC9] border border-[#B6AEA1] text-[#2D2C28] font-medium cursor-pointer">
                Rellenar como Cuenta Admin (admin@vaemanails.es)
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-[#EBE5D9] text-xs text-center text-[#5B5650]">
            ¿Todavía no tienes cuenta? <button onclick="navigate('registro')" class="font-semibold text-[#2D2C28] underline cursor-pointer">Crear cuenta ahora</button>
          </div>
        </div>

        <div class="lg:col-span-6 rounded-3xl bg-[#F1EDE4] border border-[#E3DAC9] p-8 sm:p-10 space-y-6">
          <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Ventajas de tu cuenta</span>
          <h2 class="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2C28]">Gestiona tus reservas y formaciones con total comodidad</h2>
          <div class="space-y-4 text-xs text-[#5B5650] leading-relaxed">
            <div class="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9]">
              <strong class="block text-[#2D2C28] text-sm mb-1">Reservas más rápidas</strong>
              Tus datos quedan guardados para elegir servicio, fecha y hora en segundos.
            </div>
            <div class="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9]">
              <strong class="block text-[#2D2C28] text-sm mb-1">Seguimiento de anticipos y citas</strong>
              Consulta tus próximas citas y el justificante del anticipo del 50%.
            </div>
            <div class="p-4 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9]">
              <strong class="block text-[#2D2C28] text-sm mb-1">Acceso automático para Administración</strong>
              Si inicias sesión con la cuenta administradora del estudio, accedes directamente al Panel Admin.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 10. PÁGINA DE CREAR CUENTA (Separada de Iniciar Sesión)
function renderRegistroPage() {
  return `
    <div class="max-w-xl w-full mx-auto px-4 sm:px-6 py-14">
      <div class="bg-[#FAF9F7] border border-[#EBE5D9] rounded-3xl p-8 sm:p-10 space-y-6 shadow-sm text-xs">
        <div class="space-y-1.5">
          <span class="text-xs uppercase tracking-[0.2em] text-[#878378] font-semibold">Registro de Clientas</span>
          <h1 class="font-serif text-3xl font-semibold text-[#2D2C28]">Crear Cuenta</h1>
          <p class="text-[#5B5650] leading-relaxed">Regístrate para reservar tus citas de uñas más rápido y consultar el estado de tus reservas y cursos.</p>
        </div>

        <form onsubmit="handleRegisterSubmit(event)" class="space-y-4">
          <div>
            <label class="block font-medium text-[#2D2C28] mb-1.5">Nombre y apellidos</label>
            <input id="reg-fullname" type="text" required placeholder="Ej. Laura Gómez Pérez" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
          </div>
          <div>
            <label class="block font-medium text-[#2D2C28] mb-1.5">Correo electrónico</label>
            <input id="reg-email" type="email" required placeholder="tu@email.com" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
          </div>
          <div>
            <label class="block font-medium text-[#2D2C28] mb-1.5">Contraseña</label>
            <input id="reg-password" type="password" required minlength="6" placeholder="Mínimo 10 caracteres (mayúscula, número y símbolo)" class="w-full px-4 py-3 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
          </div>
          <button type="submit" class="w-full py-3.5 rounded-full bg-[#2D2C28] text-[#FAF9F7] font-medium hover:bg-[#5B5650] cursor-pointer">
            Crear Mi Cuenta
          </button>
        </form>

        <p class="text-center text-[#5B5650]">
          ¿Ya tienes una cuenta? <button onclick="navigate('login')" class="font-semibold text-[#2D2C28] underline cursor-pointer">Inicia sesión aquí</button>
        </p>
      </div>
    </div>
  `;
}

// 11. PANEL DE ADMINISTRACIÓN COMPLETO
function renderAdmin() {
  const f = state.srvForm;
  const cf = state.crsForm;
  const gf = state.galForm;

  return `
    <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div class="rounded-3xl bg-[#F1EDE4] border border-[#E3DAC9] p-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-[#2D2C28] text-[#FAF9F7] flex items-center justify-center font-serif font-semibold">VN</div>
          <div>
            <span class="text-[11px] uppercase tracking-wider text-[#878378] font-semibold block">Cuenta Administradora · Vaema Nails Elche</span>
            <h1 class="font-serif text-2xl font-semibold text-[#2D2C28]">Panel de Administración</h1>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 text-xs">
          <button onclick="state.adminTab='servicios'; render();" class="px-4 py-2.5 rounded-xl font-medium cursor-pointer ${state.adminTab === 'servicios' ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28]'}">
            Servicios de Uñas (${state.services.length})
          </button>
          <button onclick="state.adminTab='cursos'; render();" class="px-4 py-2.5 rounded-xl font-medium cursor-pointer ${state.adminTab === 'cursos' ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28]'}">
            Cursos (${state.courses.length})
          </button>
          <button onclick="state.adminTab='galeria'; render();" class="px-4 py-2.5 rounded-xl font-medium cursor-pointer ${state.adminTab === 'galeria' ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#FAF9F7] border border-[#B6AEA1] text-[#2D2C28]'}">
            Galería (${state.gallery.length})
          </button>
          <button onclick="navigate('mi-cuenta')" class="px-4 py-2.5 rounded-xl bg-[#E3DAC9] text-[#2D2C28] font-medium cursor-pointer">
            Ver Mi Cuenta
          </button>
        </div>
      </div>

      ${state.notice ? `
        <div class="p-4 rounded-2xl bg-[#2D2C28] text-[#FAF9F7] text-xs font-medium">
          ${state.notice}
        </div>
      ` : ''}

      ${state.adminTab === 'servicios' ? `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onsubmit="saveService(event)" class="lg:col-span-5 rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 space-y-4 text-xs shadow-sm">
            <div class="flex items-center justify-between border-b border-[#EBE5D9] pb-3">
              <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">
                ${state.editingServiceId ? 'Modificar Servicio Existente' : 'Añadir Nuevo Servicio de Uñas'}
              </h2>
              ${state.editingServiceId ? `<button type="button" onclick="resetServiceForm()" class="underline text-[#878378] cursor-pointer">Cancelar</button>` : ''}
            </div>

            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Nombre del servicio *</label>
              <input type="text" required value="${f.name}" oninput="state.srvForm.name = this.value" placeholder="Ej. Nivelación con Vitamina y Queratina" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
            </div>

            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Categoría *</label>
              <select onchange="state.srvForm.category_id = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]">
                ${state.categories.map(cat => `<option value="${cat.id}" ${f.category_id === cat.id ? 'selected' : ''}>${cat.name}</option>`).join('')}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-[#2D2C28] mb-1">Precio Total (€) *</label>
                <input type="number" step="0.5" required value="${f.price}" oninput="state.srvForm.price = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
              </div>
              <div>
                <label class="block font-medium text-[#2D2C28] mb-1">Duración (min) *</label>
                <input type="number" required value="${f.duration_minutes}" oninput="state.srvForm.duration_minutes = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Descripción *</label>
              <textarea rows="3" required oninput="state.srvForm.description = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]">${f.description}</textarea>
            </div>

            <div class="p-4 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9] space-y-3">
              <label class="block font-medium text-[#2D2C28]">Fotografía personalizada del servicio</label>
              <div class="flex items-center gap-3">
                <img src="${f.image_path}" class="w-16 h-16 rounded-xl object-cover border border-[#B6AEA1]" />
                <div class="text-[11px] text-[#5B5650]">
                  <p class="font-medium text-[#2D2C28]">${f.fileName ? 'Archivo cargado: ' + f.fileName : 'Vista previa activa'}</p>
                  <p class="text-[#878378]">Sube una foto desde tu dispositivo o pega una URL.</p>
                </div>
              </div>
              <label class="block w-full py-2.5 px-4 rounded-xl bg-[#E3DAC9] hover:bg-[#B6AEA1]/70 text-[#2D2C28] font-medium text-center cursor-pointer">
                Subir foto desde mi dispositivo
                <input type="file" accept="image/*" onchange="handleServicePhotoUpload(this)" class="hidden" />
              </label>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-[#2D2C28] text-[#FAF9F7] font-medium cursor-pointer">
              ${state.editingServiceId ? 'Guardar Cambios del Servicio' : 'Publicar Nuevo Servicio'}
            </button>
          </form>

          <div class="lg:col-span-7 space-y-4">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Servicios Registrados (${state.services.length})</h2>
            ${state.services.map(srv => `
              <div class="p-5 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <img src="${srv.image_path}" class="w-20 h-20 rounded-xl object-cover border border-[#B6AEA1] shrink-0" />
                  <div class="space-y-1 text-xs">
                    <div class="flex items-center gap-2">
                      <span class="font-serif text-base font-semibold text-[#2D2C28]">${srv.name}</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${srv.is_active ? 'bg-[#E3DAC9] text-[#2D2C28]' : 'bg-[#EBE5D9] text-[#878378]'}">${srv.is_active ? 'Visible' : 'Oculto'}</span>
                    </div>
                    <p class="text-[#878378]">${srv.duration_minutes} min · Anticipo 50%: ${(srv.price / 2).toFixed(2)} €</p>
                    <p class="text-[#5B5650]">${srv.description}</p>
                  </div>
                </div>
                <div class="flex sm:flex-col items-end justify-between gap-2 shrink-0 text-xs">
                  <strong class="font-serif text-lg text-[#2D2C28]">${srv.price} €</strong>
                  <div class="flex gap-1.5">
                    <button onclick="editService('${srv.id}')" class="px-3 py-1.5 rounded-lg bg-[#E3DAC9] border border-[#B6AEA1] text-[#2D2C28] font-medium cursor-pointer">Modificar</button>
                    <button onclick="toggleService('${srv.id}')" class="px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#EBE5D9] text-[#5B5650] cursor-pointer">${srv.is_active ? 'Ocultar' : 'Activar'}</button>
                    <button onclick="deleteService('${srv.id}')" class="px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#E3DAC9] text-[#5B5650] hover:bg-[#2D2C28] hover:text-[#FAF9F7] cursor-pointer">Borrar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : state.adminTab === 'cursos' ? `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onsubmit="saveCourse(event)" class="lg:col-span-5 rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 space-y-4 text-xs shadow-sm">
            <div class="flex items-center justify-between border-b border-[#EBE5D9] pb-3">
              <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">
                ${state.editingCourseId ? 'Modificar Curso Existente' : 'Crear Nuevo Curso de Uñas'}
              </h2>
              ${state.editingCourseId ? `<button type="button" onclick="resetCourseForm()" class="underline text-[#878378] cursor-pointer">Cancelar</button>` : ''}
            </div>

            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Nombre del curso *</label>
              <input type="text" required value="${cf.name}" oninput="state.crsForm.name = this.value" placeholder="Ej. Curso Perfeccionamiento en Gel y Poligel" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-[#2D2C28] mb-1">Precio (€) *</label>
                <input type="number" required value="${cf.price}" oninput="state.crsForm.price = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
              </div>
              <div>
                <label class="block font-medium text-[#2D2C28] mb-1">Horas *</label>
                <input type="number" required value="${cf.duration_hours}" oninput="state.crsForm.duration_hours = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Descripción *</label>
              <textarea rows="3" required oninput="state.crsForm.description = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]">${cf.description}</textarea>
            </div>

            <div class="p-4 rounded-2xl bg-[#F7F4EF] border border-[#EBE5D9] space-y-3">
              <label class="block font-medium text-[#2D2C28]">Fotografía personalizada del curso</label>
              <div class="flex items-center gap-3">
                <img src="${cf.image_path}" class="w-16 h-16 rounded-xl object-cover border border-[#B6AEA1]" />
                <div class="text-[11px] text-[#5B5650]">
                  <p class="font-medium text-[#2D2C28]">${cf.fileName ? 'Archivo cargado: ' + cf.fileName : 'Imagen activa'}</p>
                </div>
              </div>
              <label class="block w-full py-2.5 px-4 rounded-xl bg-[#E3DAC9] hover:bg-[#B6AEA1]/70 text-[#2D2C28] font-medium text-center cursor-pointer">
                Subir foto del curso desde mi dispositivo
                <input type="file" accept="image/*" onchange="handleCoursePhotoUpload(this)" class="hidden" />
              </label>
            </div>

            <button type="submit" class="w-full py-3.5 rounded-xl bg-[#2D2C28] text-[#FAF9F7] font-medium cursor-pointer">
              ${state.editingCourseId ? 'Guardar Cambios del Curso' : 'Publicar Nuevo Curso'}
            </button>
          </form>

          <div class="lg:col-span-7 space-y-4">
            <h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Cursos Registrados (${state.courses.length})</h2>
            ${state.courses.map(c => `
              <div class="p-5 rounded-2xl bg-[#FAF9F7] border border-[#EBE5D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-start gap-4">
                  <img src="${c.image_path}" class="w-20 h-20 rounded-xl object-cover border border-[#B6AEA1] shrink-0" />
                  <div class="space-y-1 text-xs">
                    <span class="font-serif text-base font-semibold text-[#2D2C28]">${c.name}</span>
                    <p class="text-[#878378]">${c.modality} · ${c.duration_hours}h · ${c.level}</p>
                    <p class="text-[#5B5650]">${c.description}</p>
                  </div>
                </div>
                <div class="flex sm:flex-col items-end justify-between gap-2 shrink-0 text-xs">
                  <strong class="font-serif text-lg text-[#2D2C28]">${c.price} €</strong>
                  <div class="flex gap-1.5">
                    <button onclick="editCourse('${c.id}')" class="px-3 py-1.5 rounded-lg bg-[#E3DAC9] border border-[#B6AEA1] text-[#2D2C28] font-medium cursor-pointer">Modificar</button>
                    <button onclick="toggleCourse('${c.id}')" class="px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#EBE5D9] text-[#5B5650] cursor-pointer">${c.is_active ? 'Ocultar' : 'Publicar'}</button>
                    <button onclick="deleteCourse('${c.id}')" class="px-3 py-1.5 rounded-lg bg-[#FAF9F7] border border-[#E3DAC9] text-[#5B5650] hover:bg-[#2D2C28] hover:text-[#FAF9F7] cursor-pointer">Borrar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="space-y-8 text-xs">
          <form onsubmit="saveGalleryItem(event)" class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
            <div class="md:col-span-2"><h2 class="font-serif text-xl font-semibold text-[#2D2C28]">Subir Nueva Fotografía a la Galería</h2></div>
            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Fotografía desde dispositivo</label>
              <label class="block w-full py-2.5 px-4 rounded-xl bg-[#E3DAC9] hover:bg-[#B6AEA1]/70 text-[#2D2C28] font-medium text-center cursor-pointer">
                ${gf.fileName ? 'Archivo cargado: ' + gf.fileName : 'Elegir foto de mi dispositivo'}
                <input type="file" accept="image/*" onchange="handleGalleryPhotoUpload(this)" class="hidden" />
              </label>
            </div>
            <div>
              <label class="block font-medium text-[#2D2C28] mb-1">Estilo / Categoría Visual</label>
              <select onchange="state.galForm.tag = this.value" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]">
                <option value="Clean Nails & Nude">Clean Nails &amp; Nude</option>
                <option value="French & Baby Boomer">French &amp; Baby Boomer</option>
                <option value="Esculpidas Gel & Acrílico">Esculpidas Gel &amp; Acrílico</option>
                <option value="Nail Art de Autor">Nail Art de Autor</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block font-medium text-[#2D2C28] mb-1">Descripción / Pie de foto *</label>
              <input type="text" required value="${gf.caption}" oninput="state.galForm.caption = this.value" placeholder="Descripción que verá la clienta al abrir la foto" class="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EF] border border-[#B6AEA1]" />
            </div>
            <div class="md:col-span-2 flex justify-end">
              <button type="submit" class="px-6 py-3 rounded-xl bg-[#2D2C28] text-[#FAF9F7] font-medium cursor-pointer">Subir y Publicar en la Galería</button>
            </div>
          </form>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.gallery.map(item => `
              <div class="rounded-3xl bg-[#FAF9F7] border border-[#EBE5D9] overflow-hidden flex flex-col justify-between">
                <div class="relative aspect-square bg-[#E3DAC9]">
                  <img src="${item.image_path}" class="w-full h-full object-cover" />
                  <span class="absolute top-3 right-3 px-3 py-1 rounded-full font-medium ${item.is_published ? 'bg-[#2D2C28] text-[#FAF9F7]' : 'bg-[#EBE5D9] text-[#878378]'}">${item.is_published ? 'Publicada' : 'Oculta'}</span>
                </div>
                <div class="p-4 space-y-3">
                  <p class="font-medium text-[#2D2C28]">${item.caption}</p>
                  <div class="flex gap-2">
                    <button onclick="toggleGalleryItem('${item.id}')" class="flex-1 py-2 rounded-xl bg-[#F1EDE4] border border-[#B6AEA1] text-[#2D2C28] font-medium cursor-pointer">${item.is_published ? 'Ocultar' : 'Publicar'}</button>
                    <button onclick="deleteGalleryItem('${item.id}')" class="px-3.5 py-2 rounded-xl bg-[#FAF9F7] border border-[#EBE5D9] text-[#5B5650] hover:bg-[#2D2C28] hover:text-[#FAF9F7] cursor-pointer">Borrar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `}
    </div>
  `;
}

function render() {
  const root = document.getElementById('app');
  let content = '';
  if (state.view === 'home') content = renderHome();
  else if (state.view === 'servicios') content = renderServiciosPage();
  else if (state.view === 'reservas') content = renderReservasPage();
  else if (state.view === 'cursos') content = renderCursosPage();
  else if (state.view === 'galeria') content = renderGaleriaPage();
  else if (state.view === 'contacto') content = renderContactoPage();
  else if (state.view === 'mi-cuenta') content = renderMiCuenta();
  else if (state.view === 'mis-reservas') content = renderMisReservasPage();
  else if (state.view === 'login') content = renderLogin();
  else if (state.view === 'registro') content = renderRegistroPage();
  else if (state.view === 'admin') content = renderAdmin();
  else content = renderHome();

  root.innerHTML = renderNavbar() + `<main class="flex-1">${content}</main>` + renderFooter();
}

render();
