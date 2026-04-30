import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-display text-slate-900 overflow-x-hidden">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/30 bg-white/80 backdrop-blur-xl shadow-soft">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="size-10 bento-gradient-1 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:shadow-blue-500/30 transition-all rotate-3 group-hover:rotate-0 duration-300">
              <span className="material-symbols-rounded text-xl font-black">lightbulb</span>
            </div>
            <span className="text-xl font-black tracking-tight text-gradient-blue">EduPlan Pro</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex text-slate-600 hover:text-slate-900 font-bold text-sm">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button className="px-6 h-10 text-sm font-black rounded-2xl shadow-glow-blue hover:shadow-lg hover:scale-105 transition-all duration-300">
                Empezar Gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-36 pb-24 lg:pt-52 lg:pb-36 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-[600px] h-[600px] rounded-full bg-blue-400/15 blur-[140px] animate-blob" />
          <div className="absolute top-[25%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-500/15 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[10%] left-[40%] w-[400px] h-[400px] rounded-full bg-purple-400/10 blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/50 via-transparent to-transparent" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-5 py-2 rounded-full text-xs font-black mb-10 border-white/60 text-blue-700 uppercase tracking-[0.15em] shadow-soft animate-in fade-in duration-700">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistema de Gestión Curricular 2026
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Planifica con
              <br />
              <span className="text-gradient-landing">Inteligencia Real.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              La plataforma definitiva para docentes bolivianos. Crea PDCs alineados a la normativa, gestiona tus aulas y ahorra <span className="font-black text-slate-700">horas de trabajo administrativo</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full px-10 py-4 text-base h-auto shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 rounded-2xl font-black">
                  <span className="material-symbols-rounded text-xl mr-2">rocket_launch</span>
                  Crear mi primer PDC
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full px-10 py-4 text-base h-auto bg-white hover:bg-slate-50 rounded-2xl font-bold border border-slate-200/80 shadow-soft">
                  Ver características
                  <span className="material-symbols-rounded text-xl ml-2">arrow_downward</span>
                </Button>
              </Link>
            </div>

            {/* UI Preview Card */}
            <div className="relative mx-auto max-w-5xl animate-in fade-in zoom-in-95 duration-1000 delay-700">
              {/* Floating badges */}
              <div className="absolute -left-8 top-8 glass-card px-4 py-3 rounded-2xl shadow-medium z-10 hidden lg:flex items-center gap-3 animate-float">
                <div className="size-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-rounded">check_circle</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</p>
                  <p className="text-sm font-black text-slate-800">PDC Aprobado</p>
                </div>
              </div>

              <div className="absolute -right-8 bottom-16 glass-card px-4 py-3 rounded-2xl shadow-medium z-10 hidden lg:flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-rounded">psychology</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IA activa</p>
                  <p className="text-sm font-black text-slate-800">Optimizando...</p>
                </div>
              </div>

              {/* Mock dashboard card */}
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/15 border border-slate-200/60 bg-white/60 backdrop-blur-xl p-3">
                <div className="rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
                  {/* Mock header */}
                  <div className="h-12 bg-slate-900 flex items-center px-6 gap-2">
                    <div className="size-3 rounded-full bg-red-400" />
                    <div className="size-3 rounded-full bg-yellow-400" />
                    <div className="size-3 rounded-full bg-green-400" />
                    <div className="flex-1 mx-6 h-6 bg-slate-700/80 rounded-full" />
                  </div>
                  {/* Mock content with bento grid */}
                  <div className="p-6 grid grid-cols-3 gap-4 min-h-[240px]">
                    <div className="col-span-1 space-y-3">
                      {['Mi Escritorio', 'Áreas de Trabajo', 'Planificación', 'Mis PDC'].map((item, i) => (
                        <div key={i} className={`h-8 rounded-xl flex items-center px-3 gap-2 ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                          <div className={`size-2 rounded-full ${i === 0 ? 'bg-white/50' : 'bg-slate-200'}`} />
                          <div className={`h-2 rounded flex-1 ${i === 0 ? 'bg-white/30' : 'bg-slate-100'}`} />
                        </div>
                      ))}
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-3 content-start">
                      <div className="col-span-2 h-16 bg-white rounded-2xl border border-slate-100 shadow-soft p-4 flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-blue-50" />
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-28 bg-slate-200 rounded" />
                          <div className="h-2 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                      {[['bg-blue-50', 'bg-blue-200'], ['bg-purple-50', 'bg-purple-200'], ['bg-emerald-50', 'bg-emerald-200'], ['bg-amber-50', 'bg-amber-200']].map(([bg, bar], i) => (
                        <div key={i} className={`h-20 ${bg} rounded-2xl p-3 space-y-2`}>
                          <div className={`h-2 w-12 ${bar} rounded`} />
                          <div className="h-5 w-8 bg-white/80 rounded" />
                          <div className={`h-1.5 w-full ${bar}/50 rounded`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES (BENTO GRID) ─── */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-slate-100/60 via-transparent to-transparent" />
        </div>
        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Características</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
              Todo lo que necesitas <br /> para enseñar<span className="text-gradient-blue"> mejor</span>.
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto leading-relaxed">
              Herramientas diseñadas específicamente para el modelo educativo boliviano.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bento-gradient-1 p-10 text-white shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 animate-blob" />
              <div className="relative z-10">
                <div className="size-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-rounded text-3xl font-black">edit_document</span>
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight">Editor de PDCs</h3>
                <p className="text-blue-100 font-medium leading-relaxed max-w-sm">Crea planes de desarrollo curricular paso a paso con nuestra interfaz guiada y asistencia de IA integrada.</p>
                <div className="mt-8 flex gap-2">
                  {['Paso a Paso', 'IA Integrada', 'Exportación'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Small card */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-medium p-8 card-hover">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/80 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="size-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-rounded text-2xl font-black">library_books</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Banco de Contenidos</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Miles de recursos y actividades pedagógicas organizadas por nivel y área.</p>
              </div>
            </div>

            {/* Small card */}
            <div className="group relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-medium p-8 card-hover">
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-50/80 rounded-full -ml-10 -mb-10 group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-rounded text-2xl font-black">assignment_turned_in</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Evaluación Continua</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">Gestiona dimensiones Ser, Saber, Hacer y Decidir con criterios personalizados.</p>
              </div>
            </div>

            {/* Wide card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                <div className="size-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-3xl font-black">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Planificación Semanal Inteligente</h3>
                  <p className="text-slate-300 font-medium leading-relaxed">Distribuye automáticamente tus contenidos en semanas de trabajo. Conecta objetivos, actividades y evaluaciones en un solo lugar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Docentes activos', color: 'text-blue-600' },
              { value: '2,800+', label: 'PDCs creados', color: 'text-purple-600' },
              { value: '98%', label: 'Satisfacción', color: 'text-emerald-600' },
              { value: '10h', label: 'Ahorradas por PDC', color: 'text-amber-600' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className={`text-4xl md:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 font-medium text-sm uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-28 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-white" />
        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Precios</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">Planes justos,<br /> para cada docente.</h2>
            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Elige el paquete que mejor se adapte a tu ritmo de trabajo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {/* Basic */}
            <div className="group relative bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
              <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-1">Básico</h3>
                <p className="text-slate-400 font-medium text-sm">Para empezar a planificar</p>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">Bs. 50</span>
                <span className="text-slate-400 font-medium">/ mes</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['100 Créditos mensuales', 'Acceso a Contenidos Base', 'Exportación PDF básica'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <span className="size-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-rounded text-sm font-black">check</span>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full rounded-2xl h-12 font-black border-2">Comenzar</Button>
            </div>

            {/* Pro - Featured */}
            <div className="group relative rounded-[2.5rem] bento-gradient-1 p-8 text-white shadow-2xl shadow-blue-500/25 md:-translate-y-4 overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-2 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl rounded-tr-[2.5rem]">
                ⭐ Mejor Valor
              </div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full -ml-20 -mb-20" />

              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-lg font-black uppercase tracking-wide mb-1">Profesional</h3>
                  <p className="text-blue-100 font-medium text-sm">Para docentes comprometidos</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">Bs. 100</span>
                  <span className="text-blue-200 font-medium">/ mes</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {['250 Créditos mensuales', 'Contenidos Premium', 'Exportación Word Editable', 'Soporte Prioritario 24/7'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                      <span className="size-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-rounded text-sm font-black">check</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-white text-blue-900 hover:bg-blue-50 rounded-2xl h-12 font-black shadow-xl shadow-blue-900/20">
                  Obtener Pro
                </Button>
              </div>
            </div>

            {/* Institutional */}
            <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="mb-8">
                  <h3 className="text-lg font-black uppercase tracking-wide mb-1">Institucional</h3>
                  <p className="text-slate-400 font-medium text-sm">Para unidades educativas</p>
                </div>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-3xl font-black tracking-tighter">Personalizado</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {['Créditos ilimitados', 'Panel de Director', 'Gestión de Docentes', 'Integración curricular'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-300">
                      <span className="size-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-rounded text-sm font-black text-purple-400">check</span>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-2xl h-12 font-black border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-600">
                  Contactar Ventas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bento-gradient-1 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-white">
          <span className="material-symbols-rounded text-5xl mb-6 block animate-float font-black">school</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
            Transforma tu práctica <br /> docente hoy mismo.
          </h2>
          <p className="text-blue-100 font-medium text-lg mb-10 leading-relaxed">
            Únete a más de 500 docentes bolivianos que ya están ahorrando tiempo y mejorando la calidad de sus planificaciones.
          </p>
          <Link href="/register">
            <Button className="px-12 py-4 text-lg h-auto bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all duration-300">
              Comenzar Ahora — Es Gratis
              <span className="material-symbols-rounded text-xl ml-2">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="size-10 bento-gradient-1 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-rounded text-xl font-black">lightbulb</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">EduPlan Pro</span>
            </div>

            <div className="flex items-center gap-8">
              {['Características', 'Precios', 'Soporte'].map(link => (
                <Link key={link} href="#" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
                  {link}
                </Link>
              ))}
            </div>

            <p className="text-slate-500 font-medium text-sm text-center md:text-right">
              © 2026 EduPlan Pro.<br />Hecho con ❤️ para la educación.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
