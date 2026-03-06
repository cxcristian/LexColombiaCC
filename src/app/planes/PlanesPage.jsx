"use client";
import { useState, useEffect, useRef } from "react";

const CHECK = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#16a34a" fillOpacity="0.12"/>
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const X_ICON = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="8" fill="#94a3b8" fillOpacity="0.12"/>
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

// Testimonios — prueba social
const TESTIMONIOS = [
  { nombre: "Carlos Mejía", cargo: "Abogado litigante · Medellín", texto: "Perdí un término de traslado en 2022. Me costó una queja disciplinaria. Con BiblioLex eso no vuelve a pasar.", stars: 5 },
  { nombre: "Firma Rodríguez & Asociados", cargo: "Firma de 4 abogados · Bogotá", texto: "Ahora todos en la firma ven los mismos casos. Antes cada quien tenía su Excel. Esto cambió cómo trabajamos.", stars: 5 },
  { nombre: "Valentina Torres", cargo: "Abogada independiente · Cali", texto: "El sistema me avisó de un auto admisorio a las 6am. Contesté la demanda con 25 días de sobra.", stars: 5 },
];

// Planes
const PLANES = [
  {
    id: "gratis",
    nombre: "Biblioteca",
    precio: 0,
    precioAnual: 0,
    desc: "Para explorar la plataforma",
    color: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0",
    popular: false,
    features: [
      { texto: "Biblioteca de leyes y normas", ok: true },
      { texto: "Jurisprudencia — 29.000+ sentencias", ok: true },
      { texto: "Calculadora procesal CGP", ok: true },
      { texto: "2 casos activos", ok: true },
      { texto: "Notas judiciales (hasta 20)", ok: true },
      { texto: "Monitoreo automático SAMAI", ok: false },
      { texto: "Alertas por email", ok: false },
      { texto: "Exportar expedientes", ok: false },
    ],
    cta: "Empezar gratis",
    ctaStyle: "outline",
    urgencia: null,
  },
  {
    id: "independiente",
    nombre: "Independiente",
    precio: 59000,
    precioAnual: 49000,
    desc: "Para abogados que no pueden fallar",
    color: "#1e3a6e",
    bg: "#0f172a",
    border: "#253352",
    popular: true,
    badge: "MÁS POPULAR",
    features: [
      { texto: "Todo del plan Biblioteca", ok: true },
      { texto: "20 casos activos", ok: true },
      { texto: "Monitoreo automático SAMAI — 6am diario", ok: true },
      { texto: "Alertas email: nueva actuación + vencimientos", ok: true },
      { texto: "Calculadora con festivos 2025-2026", ok: true },
      { texto: "Exportar expedientes PDF", ok: true },
      { texto: "Notas ilimitadas", ok: true },
      { texto: "Panel multi-abogado", ok: false },
    ],
    cta: "Comenzar 14 días gratis",
    ctaStyle: "primary",
    urgencia: "⚡ Sin tarjeta de crédito. Cancela cuando quieras.",
    ahorro: "Ahorra $120.000/año",
  },
  {
    id: "firma",
    nombre: "Firma",
    precio: 149000,
    precioAnual: 124000,
    desc: "Para equipos de hasta 6 abogados",
    color: "#92400e",
    bg: "#fffbeb",
    border: "#fde68a",
    popular: false,
    features: [
      { texto: "Todo del plan Independiente", ok: true },
      { texto: "Casos ilimitados", ok: true },
      { texto: "Hasta 6 abogados con roles", ok: true },
      { texto: "Admin de firma + gestión del equipo", ok: true },
      { texto: "Resumen diario del equipo por email", ok: true },
      { texto: "Asignar casos por abogado", ok: true },
      { texto: "Panel unificado de la firma", ok: true },
      { texto: "Soporte prioritario WhatsApp", ok: true },
    ],
    cta: "Comenzar 14 días gratis",
    ctaStyle: "gold",
    urgencia: "✓ Incluye onboarding personalizado",
    ahorro: "= $25.000/abogado",
  },
];

const COMPARATIVA = [
  { feature: "Biblioteca leyes/normas", gratis: true, independiente: true, firma: true },
  { feature: "Jurisprudencia 29k+ sentencias", gratis: true, independiente: true, firma: true },
  { feature: "Calculadora procesal CGP", gratis: true, independiente: true, firma: true },
  { feature: "Casos activos", gratis: "2", independiente: "20", firma: "Ilimitados" },
  { feature: "Monitoreo SAMAI automático", gratis: false, independiente: true, firma: true },
  { feature: "Alertas por email", gratis: false, independiente: true, firma: true },
  { feature: "Exportar expedientes", gratis: false, independiente: true, firma: true },
  { feature: "Notas judiciales", gratis: "20", independiente: "Ilimitadas", firma: "Ilimitadas" },
  { feature: "Abogados por cuenta", gratis: "1", independiente: "1", firma: "Hasta 6" },
  { feature: "Panel admin de firma", gratis: false, independiente: false, firma: true },
  { feature: "Resumen diario equipo", gratis: false, independiente: false, firma: true },
  { feature: "Soporte prioritario", gratis: false, independiente: false, firma: true },
];

const FAQ = [
  { q: "¿Qué pasa si no pago y tengo casos activos?", a: "Tus datos nunca se eliminan. Solo se pausa el monitoreo automático y quedan visibles solo 2 casos. El resto se oculta hasta que reactives el plan — no se pierde nada." },
  { q: "¿Funciona con todos los juzgados de Colombia?", a: "El monitoreo automático cubre SAMAI (Rama Judicial), Justicia XXI, SIUGJ y las principales plataformas de consulta de procesos. Más del 95% de los procesos civiles, penales y laborales del país." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí, sin penalidades ni preguntas. Cancelas y el plan se mantiene activo hasta el final del período pagado." },
  { q: "¿Los 14 días gratis requieren tarjeta?", a: "No. Empiezas sin ingresar ningún dato de pago. Solo pedimos tarjeta cuando decides continuar después del período de prueba." },
  { q: "¿Qué tan rápido llega la alerta cuando hay una actuación nueva?", a: "El sistema consulta SAMAI todos los días a las 6am. Si hay una actuación nueva, el email llega antes de las 6:30am. Para casos urgentes, puedes forzar una consulta manual en cualquier momento." },
  { q: "¿Cómo funciona el plan Firma?", a: "El abogado principal crea la firma y es el administrador. Invita a colegas por email. Cada miembro ve sus casos asignados. El admin ve todos los casos de la firma y gestiona el equipo." },
];

function StarRating({ count }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(count)].map((_, i) => (
        <span key={i} style={{ color: "#f59e0b", fontSize: 14 }}>★</span>
      ))}
    </div>
  );
}

function CounterStat({ target, suffix, label, duration, start }) {
  const count = useCountUp(target, duration, start);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0f172a", lineHeight: 1 }}>
        {count.toLocaleString("es-CO")}{suffix}
      </div>
      <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function PlanesPage() {
  const [anual, setAnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [visiblePlan, setVisiblePlan] = useState(null);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef);
  const plansRef = useRef(null);
  const [plansVisible, setPlansVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPlansVisible(true); }, { threshold: 0.1 });
    if (plansRef.current) obs.observe(plansRef.current);
    return () => obs.disconnect();
  }, []);

  const getPrice = (plan) => anual ? plan.precioAnual : plan.precio;

  const styles = {
    page: { fontFamily: "'DM Sans', system-ui, sans-serif", background: "#f4f6fb", color: "#0f172a", overflowX: "hidden" },

    // HERO
    hero: {
      background: "linear-gradient(135deg, #0a0f1e 0%, #1e2a45 55%, #0f172a 100%)",
      padding: "80px 24px 100px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    },
    heroGrid: {
      position: "absolute", inset: 0,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
    },
    heroBadge: {
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)",
      color: "#fca5a5", borderRadius: 999, padding: "6px 14px",
      fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", marginBottom: 24,
    },
    heroPulse: {
      width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
      animation: "pulse 1.5s infinite",
    },
    heroTitle: {
      fontFamily: "'Lora', Georgia, serif", fontWeight: 800,
      fontSize: "clamp(2.2rem, 5vw, 3.8rem)", lineHeight: 1.1,
      color: "#fff", marginBottom: 20, position: "relative",
    },
    heroAccent: { color: "#93b4d8" },
    heroSub: {
      fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.6)",
      maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7,
    },
    heroCTA: {
      display: "inline-flex", alignItems: "center", gap: 10,
      background: "#fff", color: "#0f172a",
      padding: "14px 32px", borderRadius: 12,
      fontWeight: 700, fontSize: 15, cursor: "pointer",
      border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      transition: "transform 0.2s, box-shadow 0.2s",
      textDecoration: "none",
    },

    // URGENCIA BANNER
    urgenciaBanner: {
      background: "linear-gradient(90deg, #dc2626, #b91c1c)",
      padding: "14px 24px", textAlign: "center",
      color: "#fff", fontSize: 14, fontWeight: 600,
      letterSpacing: "0.01em",
    },

    // STATS
    statsSection: {
      background: "#fff", padding: "60px 24px",
      borderBottom: "1px solid #e2e8f0",
    },
    statsGrid: {
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 48, maxWidth: 900, margin: "0 auto",
    },

    // TOGGLE
    toggleWrap: {
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 12, margin: "60px 0 48px",
    },
    toggleLabel: { fontSize: 14, fontWeight: 600, color: "#64748b" },
    toggleTrack: {
      width: 52, height: 28, borderRadius: 999,
      background: anual ? "#1e3a6e" : "#e2e8f0",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s", border: "none",
    },
    toggleThumb: {
      position: "absolute", top: 3,
      left: anual ? 27 : 3,
      width: 22, height: 22, borderRadius: "50%",
      background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
      transition: "left 0.2s",
    },
    saveBadge: {
      background: "#dcfce7", color: "#16a34a",
      fontSize: 11, fontWeight: 700, padding: "3px 8px",
      borderRadius: 999, letterSpacing: "0.04em",
    },

    // PLANES GRID
    planesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: 24, maxWidth: 1100, margin: "0 auto",
      padding: "0 24px",
    },

    // COMPARATIVA
    comparativaSection: {
      maxWidth: 900, margin: "80px auto", padding: "0 24px",
    },

    // FAQ
    faqSection: {
      maxWidth: 720, margin: "0 auto 80px", padding: "0 24px",
    },

    // BOTTOM CTA
    bottomCta: {
      background: "linear-gradient(135deg, #0a0f1e, #1e3a6e)",
      padding: "80px 24px", textAlign: "center",
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
        @keyframes glow { 0%,100% { box-shadow:0 0 20px rgba(30,58,110,0.3); } 50% { box-shadow:0 0 40px rgba(30,58,110,0.6); } }
        .plan-card { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s; }
        .plan-card:hover { transform: translateY(-8px) !important; }
        .plan-popular { animation: glow 3s ease-in-out infinite; }
        .cta-btn { transition: transform 0.2s, box-shadow 0.2s, filter 0.2s; }
        .cta-btn:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 32px rgba(0,0,0,0.25) !important; }
        .cta-btn:active { transform: scale(0.98); }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .shimmer-text {
          background: linear-gradient(90deg, #93b4d8, #fff, #93b4d8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .float { animation: float 4s ease-in-out infinite; }
        .faq-item { border-bottom: 1px solid #e2e8f0; }
        .faq-btn { width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:20px 0; display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .toggle-btn { background:none; border:none; cursor:pointer; }
        tr:hover td { background: #f8fafc !important; }
      `}</style>

      {/* URGENCIA TOP BANNER */}
      <div style={styles.urgenciaBanner}>
        🔥 <strong>47 abogados</strong> activaron su prueba gratis esta semana — No pierdas más actuaciones por falta de vigilancia
      </div>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroGrid} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={styles.heroBadge}>
            <div style={styles.heroPulse} />
            Un término vencido puede costarle su licencia
          </div>
          <h1 style={styles.heroTitle}>
            Nunca más pierdas<br />
            <span className="shimmer-text">una actuación judicial</span>
          </h1>
          <p style={styles.heroSub}>
            BiblioLex monitorea la Rama Judicial <strong style={{ color: "#fff" }}>todos los días a las 6am</strong> y te avisa antes de que sea tarde. El seguro profesional que todo abogado necesita.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <a href="#planes" style={styles.heroCTA} className="cta-btn">
              <span>🛡️</span> Protege tu práctica — 14 días gratis
            </a>
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>
            Sin tarjeta de crédito · Cancela cuando quieras · Datos siempre seguros
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={styles.statsSection} ref={statsRef}>
        <div style={styles.statsGrid}>
          <CounterStat target={80000} suffix="+" label="Normas en la biblioteca" duration={2000} start={statsInView} />
          <CounterStat target={29210} suffix="" label="Sentencias indexadas" duration={2200} start={statsInView} />
          <CounterStat target={98} suffix="%" label="Uptime del monitoreo" duration={1500} start={statsInView} />
          <CounterStat target={14} suffix=" días" label="Prueba gratis — sin tarjeta" duration={1000} start={statsInView} />
        </div>
      </section>

      {/* PRUEBA SOCIAL */}
      <section style={{ padding: "60px 24px", background: "#f4f6fb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 40 }}>
            Lo que dicen los abogados que ya usan BiblioLex
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {TESTIMONIOS.map((t, i) => (
              <div key={i} style={{
                background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px",
                animation: `fadeUp 0.5s ease ${i * 0.15}s both`,
              }}>
                <StarRating count={t.stars} />
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, margin: "14px 0 18px", fontStyle: "italic" }}>
                  "{t.texto}"
                </p>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{t.nombre}</p>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>{t.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" style={{ padding: "20px 0 80px" }}>
        {/* Toggle anual/mensual */}
        <div style={styles.toggleWrap}>
          <span style={{ ...styles.toggleLabel, color: !anual ? "#0f172a" : "#94a3b8", fontWeight: !anual ? 700 : 500 }}>Mensual</span>
          <button className="toggle-btn" style={styles.toggleTrack} onClick={() => setAnual(!anual)}>
            <div style={styles.toggleThumb} />
          </button>
          <span style={{ ...styles.toggleLabel, color: anual ? "#0f172a" : "#94a3b8", fontWeight: anual ? 700 : 500 }}>
            Anual
          </span>
          {anual && <span style={styles.saveBadge}>AHORRA 17%</span>}
        </div>

        <div style={styles.planesGrid} ref={plansRef}>
          {PLANES.map((plan, i) => {
            const isPopular = plan.popular;
            const price = getPrice(plan);

            return (
              <div
                key={plan.id}
                className={`plan-card ${isPopular ? "plan-popular" : ""}`}
                style={{
                  background: isPopular ? "#0f172a" : plan.bg,
                  border: `2px solid ${isPopular ? "#3b5280" : plan.border}`,
                  borderRadius: 20,
                  padding: "32px 28px",
                  position: "relative",
                  opacity: plansVisible ? 1 : 0,
                  transform: plansVisible ? "translateY(0)" : "translateY(40px)",
                  transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
                }}
              >
                {/* Badge popular */}
                {plan.badge && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(90deg, #3b5280, #5b77a8)",
                    color: "#fff", fontSize: 11, fontWeight: 800,
                    padding: "5px 16px", borderRadius: 999,
                    letterSpacing: "0.08em", whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(30,58,110,0.4)",
                  }}>
                    ⭐ {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isPopular ? "#8ba4c8" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    {plan.nombre}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    {price === 0 ? (
                      <span style={{ fontFamily: "'Lora',serif", fontWeight: 800, fontSize: "2.8rem", color: isPopular ? "#fff" : "#0f172a" }}>
                        Gratis
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: 18, fontWeight: 700, color: isPopular ? "#8ba4c8" : "#64748b", marginTop: 6 }}>$</span>
                        <span style={{ fontFamily: "'Lora',serif", fontWeight: 800, fontSize: "2.8rem", color: isPopular ? "#fff" : "#0f172a", lineHeight: 1 }}>
                          {price.toLocaleString("es-CO")}
                        </span>
                        <span style={{ fontSize: 13, color: isPopular ? "#8ba4c8" : "#94a3b8", marginBottom: 4 }}>/mes</span>
                      </>
                    )}
                  </div>
                  {anual && plan.ahorro && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(22,163,74,0.15)", color: "#4ade80", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginBottom: 8 }}>
                      ✓ {plan.ahorro}
                    </div>
                  )}
                  <p style={{ fontSize: 13, color: isPopular ? "rgba(255,255,255,0.5)" : "#94a3b8" }}>{plan.desc}</p>
                </div>

                {/* Features */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: f.ok ? (isPopular ? "#e2e8f0" : "#334155") : "#94a3b8" }}>
                      {f.ok ? <CHECK /> : <X_ICON />}
                      <span style={{ textDecoration: f.ok ? "none" : "none", fontWeight: f.ok ? 500 : 400 }}>{f.texto}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="cta-btn"
                  style={{
                    width: "100%", padding: "14px", borderRadius: 12, border: "none",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                    ...(plan.ctaStyle === "primary" ? {
                      background: "linear-gradient(135deg, #3b5280, #5b77a8)",
                      color: "#fff",
                      boxShadow: "0 4px 16px rgba(30,58,110,0.4)",
                    } : plan.ctaStyle === "gold" ? {
                      background: "linear-gradient(135deg, #d97706, #f59e0b)",
                      color: "#0f0b05",
                      boxShadow: "0 4px 16px rgba(217,119,6,0.35)",
                    } : {
                      background: "transparent",
                      color: "#475569",
                      border: "1.5px solid #e2e8f0",
                    }),
                  }}
                >
                  {plan.cta}
                </button>

                {plan.urgencia && (
                  <p style={{ textAlign: "center", fontSize: 11, marginTop: 10, color: isPopular ? "rgba(255,255,255,0.35)" : "#94a3b8" }}>
                    {plan.urgencia}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Micro-copy de confianza */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 40, flexWrap: "wrap", padding: "0 24px" }}>
          {["🔒 Pago seguro con Wompi", "📧 Cancela por email en 1 minuto", "🇨🇴 Datos en servidores Colombia"].map((item, i) => (
            <span key={i} style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{item}</span>
          ))}
        </div>
      </section>

      {/* TABLA COMPARATIVA */}
      <section style={styles.comparativaSection}>
        <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.8rem", color: "#0f172a", textAlign: "center", marginBottom: 8 }}>
          Comparativa completa
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginBottom: 40 }}>
          Todo lo que incluye cada plan, sin letra pequeña
        </p>
        <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "16px 20px", textAlign: "left", color: "#94a3b8", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Feature</th>
                {["Biblioteca", "Independiente", "Firma"].map((p, i) => (
                  <th key={p} style={{ padding: "16px 20px", textAlign: "center", color: i === 1 ? "#1e3a6e" : "#0f172a", fontWeight: 700, fontSize: 13, background: i === 1 ? "rgba(30,58,110,0.04)" : "transparent" }}>
                    {p}
                    {i === 1 && <div style={{ fontSize: 10, color: "#5b77a8", fontWeight: 600, marginTop: 2 }}>⭐ Popular</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 20px", color: "#334155", fontWeight: 500 }}>{row.feature}</td>
                  {["gratis", "independiente", "firma"].map((plan, pi) => (
                    <td key={plan} style={{ padding: "14px 20px", textAlign: "center", background: pi === 1 ? "rgba(30,58,110,0.02)" : "transparent" }}>
                      {typeof row[plan] === "boolean"
                        ? (row[plan] ? <CHECK /> : <X_ICON />)
                        : <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>{row[plan]}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={styles.faqSection}>
        <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 700, fontSize: "1.8rem", color: "#0f172a", textAlign: "center", marginBottom: 40 }}>
          Preguntas frecuentes
        </h2>
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {FAQ.map((item, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", lineHeight: 1.5 }}>{item.q}</span>
                <span style={{ fontSize: 20, color: "#94a3b8", flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 0 20px", fontSize: 14, color: "#64748b", lineHeight: 1.7, animation: "fadeUp 0.2s ease" }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA — cierre agresivo */}
      <section style={styles.bottomCta}>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} className="float">⚖️</div>
          <h2 style={{ fontFamily: "'Lora',serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Cada día sin BiblioLex<br />
            <span style={{ color: "#ef4444" }}>es un término en riesgo</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
            Una sola sanción disciplinaria por término vencido puede costar más que <strong style={{ color: "#fff" }}>años de suscripción</strong>. El riesgo no vale la pena.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#planes" style={{ ...styles.heroCTA, background: "#fff", color: "#0f172a" }} className="cta-btn">
              🛡️ Empezar 14 días gratis ahora
            </a>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>
            Sin tarjeta · Sin compromisos · Sin excusas
          </p>
        </div>
      </section>
    </div>
  );
}
