import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════════
//  FIREBASE CONFIG — reemplazá con tus credenciales reales
//  (ver instrucciones al final del archivo)
// ══════════════════════════════════════════════════════════════════
const FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  databaseURL:       "https://TU_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "TU_PROJECT",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID",
};

// ══════════════════════════════════════════════════════════════════
//  CONTRASEÑA DEL VENDEDOR
// ══════════════════════════════════════════════════════════════════
const CLAVE_VENDEDOR = "la12ultima34cebada56";

// ══════════════════════════════════════════════════════════════════
//  PALETA — verde mate, marrón, crema, neutros cálidos
// ══════════════════════════════════════════════════════════════════
const C = {
  verdeOsc:  "#2D5016",
  verde:     "#3D6B1F",
  verdeMed:  "#4E8426",
  verdeClaro:"#7AB648",
  marron:    "#5C3317",
  marronMed: "#7A4520",
  ambar:     "#C4832A",
  dorado:    "#D4A843",
  crema:     "#F8F3E8",
  cremaDark: "#EDE4D0",
  beige:     "#DDD0B3",
  beigeOsc:  "#BBA882",
  texto:     "#2A1F0E",
  textoMed:  "#5C3D1E",
  textoSub:  "#8A6840",
  blanco:    "#FDFAF4",
  wsp:       "#25D366",
};

// ══════════════════════════════════════════════════════════════════
//  FIREBASE SDK — cargado dinámicamente para no necesitar bundler
// ══════════════════════════════════════════════════════════════════
let db = null;
let fbRef = null;
let fbSet = null;
let fbOnValue = null;

async function initFirebase() {
  if (db) return true;
  try {
    // Intentamos cargar Firebase desde CDN
    if (!window._firebaseApp) {
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const { getDatabase, ref, set, onValue } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
      window._firebaseApp = initializeApp(FIREBASE_CONFIG);
      db = getDatabase(window._firebaseApp);
      fbRef = ref;
      fbSet = set;
      fbOnValue = onValue;
    }
    return true;
  } catch (e) {
    console.warn("Firebase no disponible:", e.message);
    return false;
  }
}

// ══════════════════════════════════════════════════════════════════
//  DATOS DE DEMOSTRACIÓN (usados si Firebase no está configurado)
// ══════════════════════════════════════════════════════════════════
const DATA_DEMO = {
  config: {
    nombreTienda:  "La Ultima Cebada",
    eslogan:       "Artesanías con alma de campo",
    whatsapp:      "5491112345678",
    moneda:        "$",
    logoTexto:     "LUC",
    heroImagenURL: "",
    bannerTexto:   "🧉 ENVÍOS A TODO EL PAÍS · MATES ARTESANALES · BOMBILLAS PREMIUM · ENVÍOS A TODO EL PAÍS ·",
    instagram:     "",
    facebook:      "",
  },
  categorias: {},
};

// ══════════════════════════════════════════════════════════════════
//  HOOK: Firebase realtime
// ══════════════════════════════════════════════════════════════════
function useFirebaseData() {
  const [data, setData] = useState(DATA_DEMO);
  const [fbOk, setFbOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = null;
    initFirebase().then((ok) => {
      if (!ok || FIREBASE_CONFIG.apiKey === "TU_API_KEY") {
        // Sin Firebase real → modo demo local
        setLoading(false);
        return;
      }
      setFbOk(true);
      const storeRef = fbRef(db, "tienda");
      unsub = fbOnValue(storeRef, (snap) => {
        const val = snap.val();
        if (val) setData(val);
        else fbSet(fbRef(db, "tienda"), DATA_DEMO); // primera vez
        setLoading(false);
      });
    });
    return () => { if (unsub) unsub(); };
  }, []);

  const guardar = useCallback(async (nuevaData) => {
    setData(nuevaData);
    if (fbOk) {
      try { await fbSet(fbRef(db, "tienda"), nuevaData); } catch (e) { console.error(e); }
    }
  }, [fbOk]);

  return { data, guardar, fbOk, loading };
}

// ══════════════════════════════════════════════════════════════════
//  UTILIDADES UI
// ══════════════════════════════════════════════════════════════════
function Input({ label, value, onChange, placeholder, type = "text", hint, small }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: "block" }}>
      {label && <span style={{ fontSize: 11, fontWeight: 700, color: C.textoMed, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</span>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || ""}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: "100%", padding: small ? "7px 11px" : "10px 13px", borderRadius: 10, border: `1.5px solid ${focus ? C.verde : C.beige}`, background: C.blanco, fontSize: small ? 13 : 14, color: C.texto, outline: "none", fontFamily: "inherit", transition: "border-color .2s" }} />
      {hint && <span style={{ fontSize: 11, color: C.textoSub, marginTop: 4, display: "block" }}>{hint}</span>}
    </label>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MODAL CONTRASEÑA
// ══════════════════════════════════════════════════════════════════
function ModalClave({ onSuccess, onClose }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const verificar = () => {
    if (clave === CLAVE_VENDEDOR) { onSuccess(); }
    else {
      setError(true); setShake(true); setClave("");
      setTimeout(() => setShake(false), 500);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,30,10,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      <div style={{ background: C.blanco, borderRadius: 22, width: "100%", maxWidth: 340, overflow: "hidden", boxShadow: "0 32px 80px rgba(20,40,10,0.4)" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.verdeOsc}, ${C.verde})`, padding: "28px 24px 22px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.12)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🔒</div>
          <p style={{ color: C.dorado, fontWeight: 900, fontSize: 18, fontFamily: "'Playfair Display', serif", margin: 0 }}>Área del vendedor</p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 6 }}>Ingresá tu contraseña</p>
        </div>
        <div style={{ padding: "22px 22px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ animation: shake ? "shake .45s ease" : "none" }}>
            <input ref={inputRef} type="password" value={clave} autoFocus
              onChange={(e) => { setClave(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && verificar()}
              placeholder="Contraseña"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `2px solid ${error ? "#f87171" : C.beige}`, background: error ? "#fff5f5" : C.blanco, fontSize: 15, color: C.texto, outline: "none", fontFamily: "inherit" }} />
            {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 600 }}>❌ Contraseña incorrecta</p>}
          </div>
          <button onClick={verificar} style={{ width: "100%", padding: 12, borderRadius: 11, background: `linear-gradient(135deg, ${C.verde}, ${C.verdeOsc})`, color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Ingresar →</button>
          <button onClick={onClose} style={{ width: "100%", padding: 8, background: "none", border: "none", color: C.textoSub, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PANEL ADMIN
// ══════════════════════════════════════════════════════════════════
function PanelAdmin({ data, onSave, onClose, fbOk }) {
  const [draft, setDraft] = useState(JSON.parse(JSON.stringify(data)));
  const [sec, setSec] = useState("tienda");
  const [catKey, setCatKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const cfg = draft.config;
  const cats = draft.categorias || {};
  const catKeys = Object.keys(cats);
  const cat = catKey ? cats[catKey] : null;

  const setC = (k, v) => setDraft((d) => ({ ...d, config: { ...d.config, [k]: v } }));

  const addCat = () => {
    const key = `cat_${Date.now()}`;
    setDraft((d) => ({ ...d, categorias: { ...d.categorias, [key]: { nombre: "", productos: {} } } }));
    setCatKey(key); setSec("productos");
  };
  const delCat = (k) => {
    const c = { ...cats }; delete c[k];
    setDraft((d) => ({ ...d, categorias: c }));
    if (catKey === k) setCatKey(catKeys.find((x) => x !== k) || null);
  };
  const setCatNombre = (k, v) => setDraft((d) => ({ ...d, categorias: { ...d.categorias, [k]: { ...d.categorias[k], nombre: v } } }));

  const addProd = () => {
    if (!catKey) return;
    const key = `p_${Date.now()}`;
    setDraft((d) => ({ ...d, categorias: { ...d.categorias, [catKey]: { ...d.categorias[catKey], productos: { ...d.categorias[catKey].productos, [key]: { nombre: "", precio: "", descripcion: "", imagenURL: "" } } } } }));
  };
  const delProd = (pk) => {
    const prods = { ...cat.productos }; delete prods[pk];
    setDraft((d) => ({ ...d, categorias: { ...d.categorias, [catKey]: { ...cat, productos: prods } } }));
  };
  const setProd = (pk, field, val) => {
    setDraft((d) => ({ ...d, categorias: { ...d.categorias, [catKey]: { ...d.categorias[catKey], productos: { ...d.categorias[catKey].productos, [pk]: { ...d.categorias[catKey].productos[pk], [field]: val } } } } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose();
  };

  const secs = [{ id: "tienda", icon: "🏪", label: "Tienda" }, { id: "hero", icon: "🖼️", label: "Hero" }, { id: "categorias", icon: "📂", label: "Categorías" }, { id: "productos", icon: "🧉", label: "Productos" }];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(20,30,10,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div style={{ background: C.blanco, borderRadius: 22, width: "100%", maxWidth: 640, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(20,40,10,0.35)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.verdeOsc}, ${C.verde})`, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: C.dorado, fontWeight: 900, fontSize: 16, fontFamily: "'Playfair Display', serif", margin: 0 }}>⚙️ Panel del vendedor</p>
            {fbOk
              ? <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "3px 0 0" }}>🟢 Conectado a Firebase — los cambios se guardan para todos</p>
              : <p style={{ color: "#fbbf24", fontSize: 11, margin: "3px 0 0" }}>⚠️ Modo demo — configurá Firebase para guardar cambios</p>}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, color: "#fff", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: C.cremaDark, borderBottom: `2px solid ${C.beige}` }}>
          {secs.map((s) => (
            <button key={s.id} onClick={() => setSec(s.id)}
              style={{ flex: 1, padding: "11px 4px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, background: sec === s.id ? C.blanco : "transparent", color: sec === s.id ? C.verdeOsc : C.textoSub, borderBottom: sec === s.id ? `2.5px solid ${C.verde}` : "2.5px solid transparent", marginBottom: -2, transition: "all .15s" }}>
              <div style={{ fontSize: 16 }}>{s.icon}</div>
              <div style={{ marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

          {sec === "tienda" && <>
            <Input label="Nombre de la tienda" value={cfg.nombreTienda} onChange={(v) => setC("nombreTienda", v)} />
            <Input label="Eslogan" value={cfg.eslogan} onChange={(v) => setC("eslogan", v)} placeholder="Ej: Artesanías con alma de campo" />
            <Input label="WhatsApp (código de país + número, sin +)" value={cfg.whatsapp} onChange={(v) => setC("whatsapp", v)} placeholder="5491112345678" hint="Ej: Argentina 54 + 9 + número sin el 0 ni el 15" />
            <Input label="Símbolo de moneda" value={cfg.moneda} onChange={(v) => setC("moneda", v)} placeholder="$" />
            <Input label="Letras del logo (2-3 letras)" value={cfg.logoTexto} onChange={(v) => setC("logoTexto", v)} placeholder="LUC" />
            <Input label="Texto del banner animado" value={cfg.bannerTexto} onChange={(v) => setC("bannerTexto", v)} placeholder="🧉 ENVÍOS A TODO EL PAÍS · MATES ARTESANALES ·" />
            <Input label="Instagram (opcional)" value={cfg.instagram || ""} onChange={(v) => setC("instagram", v)} placeholder="@laultimacebada" />
            <Input label="Facebook (opcional)" value={cfg.facebook || ""} onChange={(v) => setC("facebook", v)} placeholder="La Ultima Cebada" />
          </>}

          {sec === "hero" && <>
            <div style={{ background: C.cremaDark, borderRadius: 12, padding: 14, fontSize: 13, color: C.textoMed, lineHeight: 1.65, border: `1px solid ${C.beige}` }}>
              💡 <strong>Cómo agregar tu foto de portada:</strong><br />
              1. Subí tu imagen a <a href="https://imgur.com" target="_blank" style={{ color: C.verde }}>imgur.com</a> (gratis)<br />
              2. Hacé clic derecho en la imagen → "Copiar dirección de imagen"<br />
              3. Pegá el link acá abajo
            </div>
            <Input label="URL de imagen del hero" value={cfg.heroImagenURL || ""} onChange={(v) => setC("heroImagenURL", v)} placeholder="https://i.imgur.com/tuimagen.jpg" hint="Dejá vacío para mostrar el fondo verde artesanal por defecto." />
            {cfg.heroImagenURL && (
              <div style={{ borderRadius: 12, overflow: "hidden", height: 140, border: `1px solid ${C.beige}` }}>
                <img src={cfg.heroImagenURL} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
          </>}

          {sec === "categorias" && <>
            <p style={{ fontSize: 13, color: C.textoSub, lineHeight: 1.6 }}>Cada categoría es una sección del menú. Ej: "Mates", "Bombillas", "Accesorios".</p>
            {catKeys.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", color: C.beigeOsc, fontSize: 13 }}>Todavía no hay categorías. ¡Agregá la primera!</div>}
            {catKeys.map((k) => (
              <div key={k} style={{ display: "flex", gap: 8, background: C.cremaDark, borderRadius: 12, padding: 10, alignItems: "center" }}>
                <input value={cats[k].nombre} onChange={(e) => setCatNombre(k, e.target.value)} placeholder="Nombre de la categoría"
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.beige}`, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" }} />
                <button onClick={() => { setCatKey(k); setSec("productos"); }}
                  style={{ padding: "7px 12px", borderRadius: 8, background: C.verde, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>Productos</button>
                <button onClick={() => delCat(k)} style={{ padding: "7px 10px", borderRadius: 8, background: "#fff0ec", color: "#c0392b", border: "1px solid #fecaca", cursor: "pointer", fontSize: 13 }}>🗑️</button>
              </div>
            ))}
            <button onClick={addCat} style={{ width: "100%", padding: 11, border: `2px dashed ${C.beigeOsc}`, borderRadius: 12, background: "none", color: C.textoSub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ Nueva categoría</button>
          </>}

          {sec === "productos" && <>
            {catKeys.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.beigeOsc }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                <p style={{ fontWeight: 600, color: C.textoSub }}>Primero creá una categoría</p>
                <button onClick={() => setSec("categorias")} style={{ marginTop: 12, padding: "8px 18px", borderRadius: 10, background: C.verde, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>Ir a Categorías →</button>
              </div>
            ) : <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {catKeys.map((k) => (
                  <button key={k} onClick={() => setCatKey(k)}
                    style={{ padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, background: catKey === k ? C.verde : C.cremaDark, color: catKey === k ? "#fff" : C.textoMed, transition: "all .15s" }}>
                    {cats[k].nombre || "Sin nombre"}
                  </button>
                ))}
              </div>

              {catKey && cat && <>
                {Object.keys(cat.productos || {}).length === 0 && <p style={{ fontSize: 13, color: C.textoSub, textAlign: "center", padding: "12px 0" }}>Esta categoría no tiene productos aún.</p>}
                {Object.entries(cat.productos || {}).map(([pk, prod]) => (
                  <div key={pk} style={{ background: C.cremaDark, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={prod.nombre} onChange={(e) => setProd(pk, "nombre", e.target.value)} placeholder="Nombre del producto"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.beige}`, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" }} />
                      <button onClick={() => delProd(pk)} style={{ padding: "7px 10px", borderRadius: 8, background: "#fff0ec", color: "#c0392b", border: "1px solid #fecaca", cursor: "pointer" }}>🗑️</button>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={prod.precio} onChange={(e) => setProd(pk, "precio", e.target.value)} placeholder="Precio"
                        style={{ width: 120, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.beige}`, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" }} />
                      <input value={prod.descripcion} onChange={(e) => setProd(pk, "descripcion", e.target.value)} placeholder="Descripción breve"
                        style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.beige}`, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" }} />
                    </div>
                    <input value={prod.imagenURL} onChange={(e) => setProd(pk, "imagenURL", e.target.value)} placeholder="URL de foto del producto (opcional)"
                      style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.beige}`, background: C.blanco, fontSize: 13, color: C.texto, fontFamily: "inherit", outline: "none" }} />
                  </div>
                ))}
                <button onClick={addProd} style={{ width: "100%", padding: 11, border: `2px dashed ${C.beigeOsc}`, borderRadius: 12, background: "none", color: C.textoSub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  + Agregar producto en "{cat.nombre || "esta categoría"}"
                </button>
              </>}
            </>}
          </>}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.beige}`, display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 11, border: `1px solid ${C.beige}`, background: "none", color: C.textoMed, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: 10, borderRadius: 11, background: saving ? C.beigeOsc : `linear-gradient(135deg, ${C.verde}, ${C.verdeOsc})`, color: "#fff", fontWeight: 800, border: "none", cursor: saving ? "default" : "pointer", fontFamily: "inherit", fontSize: 15 }}>
            {saving ? "Guardando..." : "✓ Guardar para todos"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  MENÚ HAMBURGUESA
// ══════════════════════════════════════════════════════════════════
function MenuHamb({ cfg, cats, catKeys, onClose, onNav }) {
  const [subOpen, setSubOpen] = useState(false);

  const rowBase = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 24px", borderBottom: `1px solid ${C.cremaDark}`, cursor: "pointer", fontSize: 15, fontWeight: 500, color: C.texto, background: "none", border: "none", width: "100%", textAlign: "left", fontFamily: "inherit" };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,30,10,0.5)" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: C.blanco, width: "85%", maxWidth: 320, height: "100%", display: "flex", flexDirection: "column", animation: "slideInLeft .25s ease", boxShadow: "8px 0 40px rgba(20,40,10,0.2)" }}>

        {/* Logo area */}
        <div style={{ background: `linear-gradient(160deg, ${C.verdeOsc} 0%, ${C.verde} 100%)`, padding: "28px 22px 22px" }}>
          {/* Motivo decorativo */}
          <div style={{ position: "relative" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: `2px solid ${C.dorado}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: C.dorado, fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>
              {cfg.logoTexto || "LUC"}
            </div>
          </div>
          <p style={{ color: C.dorado, fontWeight: 900, fontSize: 18, margin: 0, fontFamily: "'Playfair Display', serif" }}>{cfg.nombreTienda || "La Ultima Cebada"}</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0", fontStyle: "italic" }}>{cfg.eslogan || ""}</p>
        </div>

        <nav style={{ flex: 1, overflowY: "auto" }}>
          <button style={{ ...rowBase, borderBottom: `1px solid ${C.cremaDark}`, fontWeight: 700 }} onClick={() => { onNav("inicio"); onClose(); }}>
            <span>Inicio</span>
          </button>

          <div>
            <button style={{ ...rowBase, fontWeight: 800, borderBottom: `1px solid ${C.cremaDark}` }} onClick={() => setSubOpen(!subOpen)}>
              <span>Productos</span>
              <span style={{ color: C.verde, fontSize: 20, transition: "transform .2s", transform: subOpen ? "rotate(90deg)" : "none", display: "inline-block" }}>›</span>
            </button>
            {subOpen && (
              <div style={{ background: C.cremaDark }}>
                <button style={{ ...rowBase, paddingLeft: 36, fontSize: 14, fontWeight: 700, color: C.verde, borderBottom: `1px solid ${C.beige}` }} onClick={() => { onNav("todos"); onClose(); }}>
                  Ver todos <span style={{ color: C.beigeOsc }}>›</span>
                </button>
                {catKeys.length === 0 && <p style={{ padding: "10px 36px", fontSize: 12, color: C.beigeOsc }}>Sin categorías aún</p>}
                {catKeys.map((k) => (
                  <button key={k} style={{ ...rowBase, paddingLeft: 36, fontSize: 14, borderBottom: `1px solid ${C.beige}` }} onClick={() => { onNav(k); onClose(); }}>
                    {cats[k].nombre || "Categoría"} <span style={{ color: C.beigeOsc }}>›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button style={{ ...rowBase, fontWeight: 700 }} onClick={() => { onNav("contacto"); onClose(); }}>Contacto</button>
        </nav>

        {/* Footer del menú */}
        {(cfg.instagram || cfg.facebook) && (
          <div style={{ padding: "16px 22px", borderTop: `1px solid ${C.beige}`, display: "flex", gap: 12 }}>
            {cfg.instagram && <a href={`https://instagram.com/${cfg.instagram?.replace("@","")}`} target="_blank" style={{ color: C.textoSub, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>📸 Instagram</a>}
            {cfg.facebook && <a href={`https://facebook.com/${cfg.facebook}`} target="_blank" style={{ color: C.textoSub, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>📘 Facebook</a>}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CARRITO
// ══════════════════════════════════════════════════════════════════
function Carrito({ items, moneda, whatsapp, onRemove, onQty, onClear, onClose }) {
  const total = items.reduce((s, i) => s + (Number(i.precio) || 0) * i.cantidad, 0);

  const enviar = () => {
    if (!items.length) return;
    let msg = `🧉 *Pedido — La Ultima Cebada*\n\n`;
    items.forEach((i) => { msg += `• ${i.nombre} x${i.cantidad} → ${moneda}${(Number(i.precio)*i.cantidad).toLocaleString()}\n`; });
    msg += `\n💰 *Total: ${moneda}${total.toLocaleString()}*\n\n¡Hola! Quiero hacer este pedido 😊`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,30,10,0.5)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: C.blanco, width: "100%", maxWidth: 380, height: "100%", display: "flex", flexDirection: "column", animation: "slideIn .25s ease", boxShadow: "-8px 0 40px rgba(20,40,10,0.2)" }}>

        <div style={{ background: `linear-gradient(135deg, ${C.verdeOsc}, ${C.verde})`, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: C.dorado, fontWeight: 900, fontSize: 18, fontFamily: "'Playfair Display', serif" }}>🛒 Mi pedido</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, color: "#fff", width: 30, height: 30, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0", color: C.beigeOsc }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🧉</div>
              <p style={{ fontWeight: 700, color: C.textoSub, fontSize: 15 }}>Tu carrito está vacío</p>
              <p style={{ fontSize: 13, marginTop: 6, color: C.beigeOsc }}>Agregá productos para hacer tu pedido</p>
            </div>
          ) : items.map((item) => (
            <div key={item.id} style={{ display: "flex", gap: 12, background: C.cremaDark, borderRadius: 14, padding: 12, alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: C.beige, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.imagenURL ? <img src={item.imagenURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => (e.target.style.display="none")} /> : <span style={{ fontSize: 22 }}>🧉</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, margin: 0, color: C.texto, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</p>
                <p style={{ color: C.textoSub, fontSize: 12, margin: "3px 0 0" }}>{moneda}{Number(item.precio).toLocaleString()} c/u</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => onQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${C.verde}`, background: "none", color: C.verde, fontWeight: 800, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontWeight: 800, fontSize: 14, minWidth: 20, textAlign: "center", color: C.texto }}>{item.cantidad}</span>
                <button onClick={() => onQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: "50%", background: C.verde, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <button onClick={() => onRemove(item.id)} style={{ color: "#fca5a5", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: "16px 18px", borderTop: `1.5px solid ${C.beige}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 19, marginBottom: 14, color: C.texto }}>
              <span>Total</span>
              <span style={{ color: C.verdeOsc }}>{moneda}{total.toLocaleString()}</span>
            </div>
            <button onClick={enviar}
              style={{ width: "100%", padding: "14px", borderRadius: 14, background: C.wsp, color: "#fff", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", boxShadow: "0 6px 24px rgba(37,211,102,0.35)" }}>
              💬 Pedir por WhatsApp
            </button>
            <button onClick={onClear} style={{ width: "100%", marginTop: 8, padding: 8, background: "none", border: "none", color: C.textoSub, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Vaciar carrito</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  TARJETA PRODUCTO
// ══════════════════════════════════════════════════════════════════
function Tarjeta({ prod, prodId, moneda, onAgregar }) {
  const [agregado, setAgregado] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: C.blanco, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.beige}`, boxShadow: hover ? `0 12px 36px rgba(30,60,10,0.18)` : `0 2px 10px rgba(30,60,10,0.07)`, transform: hover ? "translateY(-4px)" : "none", transition: "all .22s ease", display: "flex", flexDirection: "column" }}>
      {/* Imagen */}
      <div style={{ width: "100%", height: 190, background: `linear-gradient(135deg, ${C.cremaDark}, ${C.beige})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        {prod.imagenURL
          ? <img src={prod.imagenURL} alt={prod.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display="none"; }} />
          : <span style={{ fontSize: 52, opacity: 0.3 }}>🧉</span>}
      </div>
      {/* Info */}
      <div style={{ padding: "13px 14px 15px", flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 5px", color: C.texto, lineHeight: 1.3, fontFamily: "'Playfair Display', serif", flex: 1 }}>{prod.nombre || "Producto"}</p>
        {prod.descripcion && <p style={{ color: C.textoSub, fontSize: 12, margin: "0 0 10px", lineHeight: 1.45 }}>{prod.descripcion}</p>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <span style={{ fontWeight: 900, fontSize: 18, color: C.verdeOsc, fontFamily: "'Playfair Display', serif" }}>
            {moneda}{Number(prod.precio).toLocaleString() || "—"}
          </span>
          <button onClick={() => { onAgregar({ ...prod, id: prodId }); setAgregado(true); setTimeout(() => setAgregado(false), 1300); }}
            style={{ padding: "8px 14px", borderRadius: 10, background: agregado ? "#bbf7d0" : `linear-gradient(135deg, ${C.verde}, ${C.verdeOsc})`, color: agregado ? C.verdeOsc : "#fff", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }}>
            {agregado ? "✓ Listo" : "+ Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  APP PRINCIPAL
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const { data, guardar, fbOk, loading } = useFirebaseData();
  const [vista, setVista] = useState("inicio");
  const [carrito, setCarrito] = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showClave, setShowClave] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const cfg = data.config || DATA_DEMO.config;
  const cats = data.categorias || {};
  const catKeys = Object.keys(cats);
  const totalItems = carrito.reduce((s, i) => s + i.cantidad, 0);

  const agregar = (prod) => setCarrito((prev) => {
    const ex = prev.find((i) => i.id === prod.id);
    return ex ? prev.map((i) => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i) : [...prev, { ...prod, cantidad: 1 }];
  });
  const updateQty = (id, d) => setCarrito((p) => p.map((i) => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + d) } : i));
  const remover = (id) => setCarrito((p) => p.filter((i) => i.id !== id));

  // Productos para la vista actual
  let productos = [];
  let tituloVista = "";
  if (vista === "todos") {
    productos = catKeys.flatMap((k) => Object.entries(cats[k].productos || {}).map(([pk, p]) => ({ pk, catK: k, ...p })));
    tituloVista = "Todos los productos";
  } else if (vista !== "inicio" && vista !== "contacto") {
    const cat = cats[vista];
    if (cat) { productos = Object.entries(cat.productos || {}).map(([pk, p]) => ({ pk, catK: vista, ...p })); tituloVista = cat.nombre; }
  }
  const todosProd = catKeys.flatMap((k) => Object.entries(cats[k].productos || {}).map(([pk, p]) => ({ pk, catK: k, ...p })));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.crema, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🧉</div>
      <p style={{ color: C.textoSub, fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Cargando La Ultima Cebada...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.crema, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.cremaDark}}::-webkit-scrollbar-thumb{background:${C.beige};border-radius:99px}
        @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}
        @keyframes bannerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* BANNER */}
      {cfg.bannerTexto && (
        <div style={{ background: C.verdeOsc, color: C.dorado, overflow: "hidden", height: 32, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", animation: "bannerScroll 22s linear infinite", whiteSpace: "nowrap" }}>
            {[1,2,3,4].map((n) => <span key={n} style={{ padding: "0 40px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" }}>{cfg.bannerTexto}</span>)}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: C.blanco, borderBottom: `1px solid ${C.beige}`, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 16px rgba(20,50,10,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Hamburguesa */}
          <button onClick={() => setShowMenu(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
            {[1,2,3].map((n) => <div key={n} style={{ width: 22, height: 2.5, background: C.verdeOsc, borderRadius: 2 }} />)}
          </button>

          {/* Logo */}
          <button onClick={() => setVista("inicio")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.verdeOsc}, ${C.verde})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.dorado, fontFamily: "'Playfair Display', serif", boxShadow: `0 0 0 3px ${C.cremaDark}, 0 0 0 5px ${C.verde}30` }}>
              {cfg.logoTexto || "LUC"}
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 16, color: C.verdeOsc, margin: 0, lineHeight: 1 }}>{cfg.nombreTienda || "La Ultima Cebada"}</p>
              {cfg.eslogan && <p style={{ fontSize: 10, color: C.textoSub, margin: "2px 0 0", fontStyle: "italic" }}>{cfg.eslogan}</p>}
            </div>
          </button>

          {/* Acciones */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setShowClave(true)} title="Panel del vendedor"
              style={{ background: C.cremaDark, border: `1px solid ${C.beige}`, borderRadius: 10, padding: "7px 11px", fontSize: 13, cursor: "pointer", color: C.textoMed }}>⚙️</button>
            <button onClick={() => setShowCarrito(true)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.verdeOsc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && <span style={{ position: "absolute", top: 3, right: 3, background: C.verde, color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* ── INICIO ── */}
      {vista === "inicio" && <>
        {/* HERO */}
        <div style={{ position: "relative", height: "clamp(300px, 55vw, 520px)", overflow: "hidden" }}>
          {cfg.heroImagenURL
            ? <img src={cfg.heroImagenURL} alt="hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (
              <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${C.verdeOsc} 0%, ${C.verde} 45%, ${C.verdeMed} 100%)`, position: "relative", overflow: "hidden" }}>
                {/* Textura orgánica */}
                <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }} viewBox="0 0 600 500">
                  <defs>
                    <pattern id="leaf" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      <ellipse cx="40" cy="20" rx="12" ry="18" fill="none" stroke="#fff" strokeWidth="1" transform="rotate(20 40 20)"/>
                      <ellipse cx="20" cy="55" rx="10" ry="15" fill="none" stroke="#fff" strokeWidth="1" transform="rotate(-15 20 55)"/>
                      <ellipse cx="60" cy="58" rx="11" ry="16" fill="none" stroke="#fff" strokeWidth="1" transform="rotate(30 60 58)"/>
                    </pattern>
                  </defs>
                  <rect width="600" height="500" fill="url(#leaf)"/>
                </svg>
                {/* Círculo decorativo */}
                <div style={{ position: "absolute", right: "-80px", top: "-80px", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "60px solid rgba(255,255,255,0.04)" }} />
                <div style={{ position: "absolute", right: "60px", bottom: "-120px", width: 300, height: 300, borderRadius: "50%", background: "rgba(212,168,67,0.08)" }} />
              </div>
            )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(20,40,10,0.75) 0%, rgba(20,40,10,0.35) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px,5vw,60px)", animation: "fadeUp .7s ease" }}>
            <p style={{ color: C.dorado, fontSize: "clamp(10px,1.8vw,13px)", letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>Bienvenido a</p>
            <h1 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(30px,6vw,68px)", lineHeight: 1.08, marginBottom: 10, textShadow: "0 2px 30px rgba(0,0,0,0.35)", maxWidth: 620 }}>
              {cfg.nombreTienda || "La Ultima Cebada"}
            </h1>
            {cfg.eslogan && <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "clamp(14px,2vw,18px)", fontStyle: "italic", marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>{cfg.eslogan}</p>}
            {todosProd.length > 0 && (
              <button onClick={() => setVista("todos")}
                style={{ padding: "13px 30px", background: C.dorado, color: C.verdeOsc, borderRadius: 999, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 24px rgba(0,0,0,0.25)", letterSpacing: "0.02em" }}>
                Ver productos →
              </button>
            )}
          </div>
        </div>

        {/* ONBOARDING si no hay config */}
        {!cfg.nombreTienda && (
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
            <div style={{ background: C.blanco, borderRadius: 22, padding: "36px 30px", border: `2px dashed ${C.beige}`, textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🧉</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 26, color: C.verdeOsc, marginBottom: 12 }}>¡Configurá La Ultima Cebada!</h2>
              <p style={{ color: C.textoSub, lineHeight: 1.7, marginBottom: 24, fontSize: 15 }}>Tocá el botón para agregar el nombre, tus productos, precios y fotos. Los cambios se guardan automáticamente para todos los visitantes.</p>
              <button onClick={() => setShowClave(true)}
                style={{ padding: "14px 32px", background: `linear-gradient(135deg, ${C.verde}, ${C.verdeOsc})`, color: C.dorado, borderRadius: 14, fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: `0 6px 24px rgba(30,80,10,0.3)` }}>
                ⚙️ Configurar mi tienda
              </button>
            </div>
          </div>
        )}

        {/* DESTACADOS */}
        {todosProd.length > 0 && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 16px 64px" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", color: C.verdeOsc, marginBottom: 8 }}>Destacados</h2>
              <div style={{ width: 52, height: 3, background: C.dorado, borderRadius: 2, margin: "0 auto" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 16 }}>
              {todosProd.slice(0, 6).map(({ pk, catK, ...prod }) => <Tarjeta key={pk} prod={prod} prodId={pk} moneda={cfg.moneda} onAgregar={agregar} />)}
            </div>
            {todosProd.length > 6 && (
              <div style={{ textAlign: "center", marginTop: 28 }}>
                <button onClick={() => setVista("todos")} style={{ padding: "11px 26px", borderRadius: 12, border: `2px solid ${C.verde}`, background: "none", color: C.verde, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Ver todos los productos →</button>
              </div>
            )}
          </div>
        )}

        {/* FOOTER */}
        <footer style={{ background: C.verdeOsc, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "24px 20px", fontSize: 13 }}>
          <p style={{ color: C.dorado, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{cfg.nombreTienda || "La Ultima Cebada"}</p>
          {(cfg.instagram || cfg.facebook) && (
            <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10 }}>
              {cfg.instagram && <a href={`https://instagram.com/${cfg.instagram?.replace("@","")}`} target="_blank" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>📸 {cfg.instagram}</a>}
              {cfg.facebook && <a href={`https://facebook.com/${cfg.facebook}`} target="_blank" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", fontSize: 13 }}>📘 {cfg.facebook}</a>}
            </div>
          )}
          <p style={{ marginTop: 6, opacity: 0.4, fontSize: 11 }}>Hecho con 🧉 · {new Date().getFullYear()}</p>
        </footer>
      </>}

      {/* ── LISTADO ── */}
      {vista !== "inicio" && vista !== "contacto" && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 30 }}>
            <button onClick={() => setVista("inicio")} style={{ background: "none", border: "none", color: C.verde, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "inherit" }}>← Inicio</button>
            <span style={{ color: C.beige }}>›</span>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(20px,4vw,32px)", color: C.verdeOsc }}>{tituloVista}</h2>
          </div>
          {productos.length === 0
            ? <div style={{ textAlign: "center", padding: "80px 0", color: C.beigeOsc }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <p style={{ fontWeight: 600, color: C.textoSub }}>No hay productos en esta categoría</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>El vendedor aún no agregó productos acá</p>
              </div>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 16 }}>
                {productos.map(({ pk, catK, ...prod }) => <Tarjeta key={pk} prod={prod} prodId={pk} moneda={cfg.moneda} onAgregar={agregar} />)}
              </div>}
        </div>
      )}

      {/* ── CONTACTO ── */}
      {vista === "contacto" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>💬</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 34, marginBottom: 12, color: C.verdeOsc }}>Contacto</h2>
          <p style={{ color: C.textoSub, marginBottom: 28, lineHeight: 1.7, fontSize: 15 }}>¿Tenés dudas sobre un mate, una bombilla o el envío? ¡Escribinos por WhatsApp y te respondemos al toque!</p>
          {cfg.whatsapp
            ? <a href={`https://wa.me/${cfg.whatsapp}`} target="_blank"
                style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", background: C.wsp, color: "#fff", borderRadius: 16, fontWeight: 800, fontSize: 18, textDecoration: "none", fontFamily: "inherit", boxShadow: "0 6px 28px rgba(37,211,102,0.38)" }}>
                💬 Escribir por WhatsApp
              </a>
            : <p style={{ color: C.beigeOsc }}>Número de contacto no configurado aún.</p>}
          <button onClick={() => setVista("inicio")} style={{ display: "block", margin: "28px auto 0", background: "none", border: "none", color: C.verde, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>← Volver al inicio</button>
        </div>
      )}

      {/* ── OVERLAYS ── */}
      {showMenu && <MenuHamb cfg={cfg} cats={cats} catKeys={catKeys} onClose={() => setShowMenu(false)} onNav={setVista} />}
      {showCarrito && <Carrito items={carrito} moneda={cfg.moneda} whatsapp={cfg.whatsapp} onRemove={remover} onQty={updateQty} onClear={() => setCarrito([])} onClose={() => setShowCarrito(false)} />}
      {showClave && <ModalClave onSuccess={() => { setShowClave(false); setShowAdmin(true); }} onClose={() => setShowClave(false)} />}
      {showAdmin && <PanelAdmin data={data} onSave={guardar} onClose={() => setShowAdmin(false)} fbOk={fbOk} />}
    </div>
  );
}
