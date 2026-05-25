import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyAjooz-RJ7TcDT7BGFnv9D89BXEqp2KnJ0",
  authDomain:        "laultimacebada-6b5a6.firebaseapp.com",
  databaseURL:       "https://laultimacebada-6b5a6-default-rtdb.firebaseio.com",
  projectId:         "laultimacebada-6b5a6",
  storageBucket:     "laultimacebada-6b5a6.firebasestorage.app",
  messagingSenderId: "1090191844554",
  appId:             "1:1090191844554:web:0e7107e341508e056ac033",
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(firebaseApp);

const CLAVE_VENDEDOR = "la12ultima34cebada56";

const C = {
  verdeOsc:  "#2D5016",
  verde:     "#3D6B1F",
  verdeMed:  "#4E8426",
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

const DATA_INICIAL = {
  config: {
    nombreTienda:  "La Ultima Cebada",
    eslogan:       "Artesanias con alma de campo",
    whatsapp:      "5491112345678",
    moneda:        "$",
    logoTexto:     "LUC",
    heroImagenURL: "",
    bannerTexto:   "Envios a todo el pais - Mates artesanales - Bombillas premium",
    instagram:     "",
    facebook:      "",
  },
  categorias: {},
};

function useFirebaseData() {
  const [data, setData] = useState(DATA_INICIAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storeRef = ref(db, "tienda");
    const unsub = onValue(storeRef, function(snap) {
      var val = snap.val();
      if (val) {
        setData(val);
      } else {
        set(ref(db, "tienda"), DATA_INICIAL);
      }
      setLoading(false);
    });
    return function() { unsub(); };
  }, []);

  const guardar = useCallback(async function(nuevaData) {
    setData(nuevaData);
    try {
      await set(ref(db, "tienda"), nuevaData);
    } catch (e) {
      console.error("Error guardando:", e);
    }
  }, []);

  return { data, guardar, loading };
}

function Input({ label, value, onChange, placeholder, hint }) {
  var [focus, setFocus] = useState(false);
  return (
    React.createElement("label", { style: { display: "block" } },
      label && React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: C.textoMed, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: 5 } }, label),
      React.createElement("input", {
        value: value,
        onChange: function(e) { onChange(e.target.value); },
        placeholder: placeholder || "",
        onFocus: function() { setFocus(true); },
        onBlur: function() { setFocus(false); },
        style: { width: "100%", padding: "10px 13px", borderRadius: 10, border: "1.5px solid " + (focus ? C.verde : C.beige), background: C.blanco, fontSize: 14, color: C.texto, outline: "none", fontFamily: "inherit", transition: "border-color .2s" }
      }),
      hint && React.createElement("span", { style: { fontSize: 11, color: C.textoSub, marginTop: 4, display: "block" } }, hint)
    )
  );
}

function ModalClave({ onSuccess, onClose }) {
  var [clave, setClave] = useState("");
  var [error, setError] = useState(false);
  var [shake, setShake] = useState(false);
  var inputRef = useRef(null);

  function verificar() {
    if (clave === CLAVE_VENDEDOR) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setClave("");
      setTimeout(function() { setShake(false); }, 500);
      setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 50);
    }
  }

  return (
    React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,30,10,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 } },
      React.createElement("style", null, "@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}"),
      React.createElement("div", { style: { background: C.blanco, borderRadius: 22, width: "100%", maxWidth: 340, overflow: "hidden", boxShadow: "0 32px 80px rgba(20,40,10,0.4)" } },
        React.createElement("div", { style: { background: "linear-gradient(135deg," + C.verdeOsc + "," + C.verde + ")", padding: "28px 24px 22px", textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "🔒"),
          React.createElement("p", { style: { color: C.dorado, fontWeight: 900, fontSize: 18, margin: 0 } }, "Area del vendedor"),
          React.createElement("p", { style: { color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 6 } }, "Ingresa tu contrasena")
        ),
        React.createElement("div", { style: { padding: "22px 22px 18px", display: "flex", flexDirection: "column", gap: 12 } },
          React.createElement("div", { style: { animation: shake ? "shake .45s ease" : "none" } },
            React.createElement("input", {
              ref: inputRef,
              type: "password",
              value: clave,
              autoFocus: true,
              onChange: function(e) { setClave(e.target.value); setError(false); },
              onKeyDown: function(e) { if (e.key === "Enter") verificar(); },
              placeholder: "Contrasena",
              style: { width: "100%", padding: "11px 14px", borderRadius: 11, border: "2px solid " + (error ? "#f87171" : C.beige), background: error ? "#fff5f5" : C.blanco, fontSize: 15, color: C.texto, outline: "none", fontFamily: "inherit" }
            }),
            error && React.createElement("p", { style: { color: "#ef4444", fontSize: 12, marginTop: 5, fontWeight: 600 } }, "Contrasena incorrecta")
          ),
          React.createElement("button", { onClick: verificar, style: { width: "100%", padding: 12, borderRadius: 11, background: "linear-gradient(135deg," + C.verde + "," + C.verdeOsc + ")", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" } }, "Ingresar"),
          React.createElement("button", { onClick: onClose, style: { width: "100%", padding: 8, background: "none", border: "none", color: C.textoSub, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar")
        )
      )
    )
  );
}

function PanelAdmin({ data, onSave, onClose }) {
  var [draft, setDraft] = useState(JSON.parse(JSON.stringify(data)));
  var [sec, setSec] = useState("tienda");
  var [catKey, setCatKey] = useState(null);
  var [saving, setSaving] = useState(false);

  var cfg = draft.config;
  var cats = draft.categorias || {};
  var catKeys = Object.keys(cats);
  var cat = catKey ? cats[catKey] : null;

  function setC(k, v) { setDraft(function(d) { return Object.assign({}, d, { config: Object.assign({}, d.config, { [k]: v }) }); }); }

  function addCat() {
    var key = "cat_" + Date.now();
    setDraft(function(d) { return Object.assign({}, d, { categorias: Object.assign({}, d.categorias, { [key]: { nombre: "", productos: {} } }) }); });
    setCatKey(key);
    setSec("productos");
  }

  function delCat(k) {
    var c = Object.assign({}, cats);
    delete c[k];
    setDraft(function(d) { return Object.assign({}, d, { categorias: c }); });
    if (catKey === k) setCatKey(null);
  }

  function setCatNombre(k, v) {
    setDraft(function(d) { return Object.assign({}, d, { categorias: Object.assign({}, d.categorias, { [k]: Object.assign({}, d.categorias[k], { nombre: v }) }) }); });
  }

  function addProd() {
    if (!catKey) return;
    var key = "p_" + Date.now();
    var catActual = cats[catKey] || { nombre: "", productos: {} };
    setDraft(function(d) {
      return Object.assign({}, d, {
        categorias: Object.assign({}, d.categorias, {
          [catKey]: Object.assign({}, catActual, {
            productos: Object.assign({}, catActual.productos || {}, { [key]: { nombre: "", precio: "", descripcion: "", imagenURL: "" } })
          })
        })
      });
    });
  }

  function delProd(pk) {
    var prods = Object.assign({}, cat.productos || {});
    delete prods[pk];
    setDraft(function(d) { return Object.assign({}, d, { categorias: Object.assign({}, d.categorias, { [catKey]: Object.assign({}, cat, { productos: prods }) }) }); });
  }

  function setProd(pk, field, val) {
    setDraft(function(d) {
      return Object.assign({}, d, {
        categorias: Object.assign({}, d.categorias, {
          [catKey]: Object.assign({}, d.categorias[catKey], {
            productos: Object.assign({}, d.categorias[catKey].productos, {
              [pk]: Object.assign({}, d.categorias[catKey].productos[pk], { [field]: val })
            })
          })
        })
      });
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    onClose();
  }

  var secs = [
    { id: "tienda", icon: "🏪", label: "Tienda" },
    { id: "hero", icon: "🖼", label: "Hero" },
    { id: "categorias", icon: "📂", label: "Categorias" },
    { id: "productos", icon: "🧉", label: "Productos" },
  ];

  return (
    React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 70, background: "rgba(20,30,10,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 } },
      React.createElement("div", { style: { background: C.blanco, borderRadius: 22, width: "100%", maxWidth: 640, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(20,40,10,0.35)", overflow: "hidden" } },
        React.createElement("div", { style: { background: "linear-gradient(135deg," + C.verdeOsc + "," + C.verde + ")", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" } },
          React.createElement("div", null,
            React.createElement("p", { style: { color: C.dorado, fontWeight: 900, fontSize: 16, margin: 0 } }, "Panel del vendedor"),
            React.createElement("p", { style: { color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "3px 0 0" } }, "Los cambios se guardan para todos")
          ),
          React.createElement("button", { onClick: onClose, style: { background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, color: "#fff", width: 30, height: 30, cursor: "pointer", fontSize: 16 } }, "x")
        ),
        React.createElement("div", { style: { display: "flex", background: C.cremaDark, borderBottom: "2px solid " + C.beige } },
          secs.map(function(s) {
            return React.createElement("button", { key: s.id, onClick: function() { setSec(s.id); }, style: { flex: 1, padding: "11px 4px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, background: sec === s.id ? C.blanco : "transparent", color: sec === s.id ? C.verdeOsc : C.textoSub, borderBottom: sec === s.id ? "2.5px solid " + C.verde : "2.5px solid transparent", marginBottom: -2 } },
              React.createElement("div", { style: { fontSize: 16 } }, s.icon),
              React.createElement("div", { style: { marginTop: 2 } }, s.label)
            );
          })
        ),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 } },
          sec === "tienda" && React.createElement(React.Fragment, null,
            React.createElement(Input, { label: "Nombre de la tienda", value: cfg.nombreTienda, onChange: function(v) { setC("nombreTienda", v); } }),
            React.createElement(Input, { label: "Eslogan", value: cfg.eslogan, onChange: function(v) { setC("eslogan", v); } }),
            React.createElement(Input, { label: "WhatsApp (codigo pais + numero, sin +)", value: cfg.whatsapp, onChange: function(v) { setC("whatsapp", v); }, hint: "Ej Argentina: 5491112345678" }),
            React.createElement(Input, { label: "Simbolo de moneda", value: cfg.moneda, onChange: function(v) { setC("moneda", v); }, placeholder: "$" }),
            React.createElement(Input, { label: "Letras del logo (2-3 letras)", value: cfg.logoTexto, onChange: function(v) { setC("logoTexto", v); }, placeholder: "LUC" }),
            React.createElement(Input, { label: "Texto del banner animado", value: cfg.bannerTexto, onChange: function(v) { setC("bannerTexto", v); } }),
            React.createElement(Input, { label: "Instagram (opcional)", value: cfg.instagram || "", onChange: function(v) { setC("instagram", v); }, placeholder: "@laultimacebada" }),
            React.createElement(Input, { label: "Facebook (opcional)", value: cfg.facebook || "", onChange: function(v) { setC("facebook", v); } })
          ),
          sec === "hero" && React.createElement(React.Fragment, null,
            React.createElement("div", { style: { background: C.cremaDark, borderRadius: 12, padding: 14, fontSize: 13, color: C.textoMed, lineHeight: 1.65, border: "1px solid " + C.beige } },
              "Como agregar tu foto: Subi tu imagen a imgur.com, clic derecho en la imagen, copia la direccion y pegala abajo."
            ),
            React.createElement(Input, { label: "URL de imagen del hero", value: cfg.heroImagenURL || "", onChange: function(v) { setC("heroImagenURL", v); }, placeholder: "https://i.imgur.com/tuimagen.jpg", hint: "Deja vacio para fondo verde por defecto." })
          ),
          sec === "categorias" && React.createElement(React.Fragment, null,
            React.createElement("p", { style: { fontSize: 13, color: C.textoSub } }, "Cada categoria es una seccion del menu."),
            catKeys.length === 0 && React.createElement("div", { style: { textAlign: "center", padding: "20px 0", color: C.beigeOsc, fontSize: 13 } }, "Agrega tu primera categoria!"),
            catKeys.map(function(k) {
              return React.createElement("div", { key: k, style: { display: "flex", gap: 8, background: C.cremaDark, borderRadius: 12, padding: 10, alignItems: "center" } },
                React.createElement("input", { value: cats[k].nombre, onChange: function(e) { setCatNombre(k, e.target.value); }, placeholder: "Nombre de la categoria", style: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + C.beige, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" } }),
                React.createElement("button", { onClick: function() { setCatKey(k); setSec("productos"); }, style: { padding: "7px 12px", borderRadius: 8, background: C.verde, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" } }, "Productos"),
                React.createElement("button", { onClick: function() { delCat(k); }, style: { padding: "7px 10px", borderRadius: 8, background: "#fff0ec", color: "#c0392b", border: "1px solid #fecaca", cursor: "pointer" } }, "X")
              );
            }),
            React.createElement("button", { onClick: addCat, style: { width: "100%", padding: 11, border: "2px dashed " + C.beigeOsc, borderRadius: 12, background: "none", color: C.textoSub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Nueva categoria")
          ),
          sec === "productos" && React.createElement(React.Fragment, null,
            catKeys.length === 0
              ? React.createElement("div", { style: { textAlign: "center", padding: "32px 0", color: C.beigeOsc } },
                  React.createElement("p", { style: { fontWeight: 600, color: C.textoSub } }, "Primero crea una categoria"),
                  React.createElement("button", { onClick: function() { setSec("categorias"); }, style: { marginTop: 12, padding: "8px 18px", borderRadius: 10, background: C.verde, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" } }, "Ir a Categorias")
                )
              : React.createElement(React.Fragment, null,
                  React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                    catKeys.map(function(k) {
                      return React.createElement("button", { key: k, onClick: function() { setCatKey(k); }, style: { padding: "6px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 700, background: catKey === k ? C.verde : C.cremaDark, color: catKey === k ? "#fff" : C.textoMed } }, cats[k].nombre || "Sin nombre");
                    })
                  ),
                  catKey && cat && React.createElement(React.Fragment, null,
                    Object.keys(cat.productos || {}).length === 0 && React.createElement("p", { style: { fontSize: 13, color: C.textoSub, textAlign: "center", padding: "12px 0" } }, "Esta categoria no tiene productos."),
                    Object.entries(cat.productos || {}).map(function(entry) {
                      var pk = entry[0]; var prod = entry[1];
                      return React.createElement("div", { key: pk, style: { background: C.cremaDark, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 } },
                        React.createElement("div", { style: { display: "flex", gap: 8 } },
                          React.createElement("input", { value: prod.nombre, onChange: function(e) { setProd(pk, "nombre", e.target.value); }, placeholder: "Nombre del producto", style: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + C.beige, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" } }),
                          React.createElement("button", { onClick: function() { delProd(pk); }, style: { padding: "7px 10px", borderRadius: 8, background: "#fff0ec", color: "#c0392b", border: "1px solid #fecaca", cursor: "pointer" } }, "X")
                        ),
                        React.createElement("div", { style: { display: "flex", gap: 8 } },
                          React.createElement("input", { value: prod.precio, onChange: function(e) { setProd(pk, "precio", e.target.value); }, placeholder: "Precio", style: { width: 120, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + C.beige, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" } }),
                          React.createElement("input", { value: prod.descripcion, onChange: function(e) { setProd(pk, "descripcion", e.target.value); }, placeholder: "Descripcion breve", style: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + C.beige, background: C.blanco, fontSize: 14, color: C.texto, fontFamily: "inherit", outline: "none" } })
                        ),
                        React.createElement("input", { value: prod.imagenURL, onChange: function(e) { setProd(pk, "imagenURL", e.target.value); }, placeholder: "URL de foto del producto (opcional)", style: { padding: "8px 12px", borderRadius: 8, border: "1.5px solid " + C.beige, background: C.blanco, fontSize: 13, color: C.texto, fontFamily: "inherit", outline: "none" } })
                      );
                    }),
                    React.createElement("button", { onClick: addProd, style: { width: "100%", padding: 11, border: "2px dashed " + C.beigeOsc, borderRadius: 12, background: "none", color: C.textoSub, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Agregar producto")
                  )
              )
          )
        ),
        React.createElement("div", { style: { padding: "14px 22px", borderTop: "1px solid " + C.beige, display: "flex", gap: 10 } },
          React.createElement("button", { onClick: onClose, style: { flex: 1, padding: 10, borderRadius: 11, border: "1px solid " + C.beige, background: "none", color: C.textoMed, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar"),
          React.createElement("button", { onClick: handleSave, disabled: saving, style: { flex: 2, padding: 10, borderRadius: 11, background: saving ? C.beigeOsc : "linear-gradient(135deg," + C.verde + "," + C.verdeOsc + ")", color: "#fff", fontWeight: 800, border: "none", cursor: saving ? "default" : "pointer", fontFamily: "inherit", fontSize: 15 } }, saving ? "Guardando..." : "Guardar para todos")
        )
      )
    )
  );
}

function MenuHamb({ cfg, cats, catKeys, onClose, onNav }) {
  var [subOpen, setSubOpen] = useState(false);
  var rowBase = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 24px", borderBottom: "1px solid " + C.cremaDark, cursor: "pointer", fontSize: 15, fontWeight: 500, color: C.texto, background: "none", border: "none", width: "100%", textAlign: "left", fontFamily: "inherit" };

  return (
    React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,30,10,0.5)" } },
      React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: C.blanco, width: "85%", maxWidth: 320, height: "100%", display: "flex", flexDirection: "column", animation: "slideInLeft .25s ease", boxShadow: "8px 0 40px rgba(20,40,10,0.2)" } },
        React.createElement("div", { style: { background: "linear-gradient(160deg," + C.verdeOsc + " 0%," + C.verde + " 100%)", padding: "28px 22px 22px" } },
          React.createElement("div", { style: { width: 52, height: 52, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid " + C.dorado, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: C.dorado, marginBottom: 12 } }, cfg.logoTexto || "LUC"),
          React.createElement("p", { style: { color: C.dorado, fontWeight: 900, fontSize: 18, margin: 0 } }, cfg.nombreTienda || "La Ultima Cebada"),
          cfg.eslogan && React.createElement("p", { style: { color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0", fontStyle: "italic" } }, cfg.eslogan)
        ),
        React.createElement("nav", { style: { flex: 1, overflowY: "auto" } },
          React.createElement("button", { style: Object.assign({}, rowBase, { fontWeight: 700, borderBottom: "1px solid " + C.cremaDark }), onClick: function() { onNav("inicio"); onClose(); } }, "Inicio"),
          React.createElement("div", null,
            React.createElement("button", { style: Object.assign({}, rowBase, { fontWeight: 800, borderBottom: "1px solid " + C.cremaDark }), onClick: function() { setSubOpen(!subOpen); } },
              React.createElement("span", null, "Productos"),
              React.createElement("span", { style: { color: C.verde, fontSize: 20, display: "inline-block", transform: subOpen ? "rotate(90deg)" : "none" } }, ">")
            ),
            subOpen && React.createElement("div", { style: { background: C.cremaDark } },
              React.createElement("button", { style: Object.assign({}, rowBase, { paddingLeft: 36, fontSize: 14, fontWeight: 700, color: C.verde, borderBottom: "1px solid " + C.beige }), onClick: function() { onNav("todos"); onClose(); } }, "Ver todos"),
              catKeys.length === 0 && React.createElement("p", { style: { padding: "10px 36px", fontSize: 12, color: C.beigeOsc } }, "Sin categorias aun"),
              catKeys.map(function(k) {
                return React.createElement("button", { key: k, style: Object.assign({}, rowBase, { paddingLeft: 36, fontSize: 14, borderBottom: "1px solid " + C.beige }), onClick: function() { onNav(k); onClose(); } }, cats[k].nombre || "Categoria");
              })
            )
          ),
          React.createElement("button", { style: Object.assign({}, rowBase, { fontWeight: 700 }), onClick: function() { onNav("contacto"); onClose(); } }, "Contacto")
        )
      )
    )
  );
}

function Carrito({ items, moneda, whatsapp, onRemove, onQty, onClear, onClose }) {
  var total = items.reduce(function(s, i) { return s + (Number(i.precio) || 0) * i.cantidad; }, 0);

  function enviar() {
    if (!items.length) return;
    var msg = "Pedido - La Ultima Cebada\n\n";
    items.forEach(function(i) { msg += "- " + i.nombre + " x" + i.cantidad + " = " + moneda + (Number(i.precio) * i.cantidad).toLocaleString() + "\n"; });
    msg += "\nTotal: " + moneda + total.toLocaleString() + "\n\nHola! Quiero hacer este pedido";
    window.open("https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(msg), "_blank");
  }

  return (
    React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 50, background: "rgba(20,30,10,0.5)", display: "flex", justifyContent: "flex-end" } },
      React.createElement("div", { onClick: function(e) { e.stopPropagation(); }, style: { background: C.blanco, width: "100%", maxWidth: 380, height: "100%", display: "flex", flexDirection: "column", animation: "slideIn .25s ease", boxShadow: "-8px 0 40px rgba(20,40,10,0.2)" } },
        React.createElement("div", { style: { background: "linear-gradient(135deg," + C.verdeOsc + "," + C.verde + ")", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" } },
          React.createElement("span", { style: { color: C.dorado, fontWeight: 900, fontSize: 18 } }, "Mi pedido"),
          React.createElement("button", { onClick: onClose, style: { background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8, color: "#fff", width: 30, height: 30, cursor: "pointer", fontSize: 16 } }, "x")
        ),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 } },
          items.length === 0
            ? React.createElement("div", { style: { textAlign: "center", padding: "64px 0", color: C.beigeOsc } },
                React.createElement("div", { style: { fontSize: 56, marginBottom: 12 } }, "🧉"),
                React.createElement("p", { style: { fontWeight: 700, color: C.textoSub } }, "Tu carrito esta vacio")
              )
            : items.map(function(item) {
                return React.createElement("div", { key: item.id, style: { display: "flex", gap: 12, background: C.cremaDark, borderRadius: 14, padding: 12, alignItems: "center" } },
                  React.createElement("div", { style: { width: 52, height: 52, borderRadius: 10, background: C.beige, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" } },
                    item.imagenURL
                      ? React.createElement("img", { src: item.imagenURL, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" }, onError: function(e) { e.target.style.display = "none"; } })
                      : React.createElement("span", { style: { fontSize: 22 } }, "🧉")
                  ),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("p", { style: { fontWeight: 700, fontSize: 13, margin: 0, color: C.texto, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, item.nombre),
                    React.createElement("p", { style: { color: C.textoSub, fontSize: 12, margin: "3px 0 0" } }, moneda + Number(item.precio).toLocaleString() + " c/u")
                  ),
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
                    React.createElement("button", { onClick: function() { onQty(item.id, -1); }, style: { width: 28, height: 28, borderRadius: "50%", border: "1.5px solid " + C.verde, background: "none", color: C.verde, fontWeight: 800, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" } }, "-"),
                    React.createElement("span", { style: { fontWeight: 800, fontSize: 14, minWidth: 20, textAlign: "center" } }, item.cantidad),
                    React.createElement("button", { onClick: function() { onQty(item.id, 1); }, style: { width: 28, height: 28, borderRadius: "50%", background: C.verde, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" } }, "+")
                  ),
                  React.createElement("button", { onClick: function() { onRemove(item.id); }, style: { color: "#fca5a5", background: "none", border: "none", cursor: "pointer", fontSize: 16 } }, "x")
                );
              })
        ),
        items.length > 0 && React.createElement("div", { style: { padding: "16px 18px", borderTop: "1.5px solid " + C.beige } },
          React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 19, marginBottom: 14, color: C.texto } },
            React.createElement("span", null, "Total"),
            React.createElement("span", { style: { color: C.verdeOsc } }, moneda + total.toLocaleString())
          ),
          React.createElement("button", { onClick: enviar, style: { width: "100%", padding: "14px", borderRadius: 14, background: C.wsp, color: "#fff", fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit" } }, "Pedir por WhatsApp"),
          React.createElement("button", { onClick: onClear, style: { width: "100%", marginTop: 8, padding: 8, background: "none", border: "none", color: C.textoSub, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Vaciar carrito")
        )
      )
    )
  );
}

function Tarjeta({ prod, prodId, moneda, onAgregar }) {
  var [agregado, setAgregado] = useState(false);
  var [hover, setHover] = useState(false);

  return (
    React.createElement("div", {
      onMouseEnter: function() { setHover(true); },
      onMouseLeave: function() { setHover(false); },
      style: { background: C.blanco, borderRadius: 18, overflow: "hidden", border: "1px solid " + C.beige, boxShadow: hover ? "0 12px 36px rgba(30,60,10,0.18)" : "0 2px 10px rgba(30,60,10,0.07)", transform: hover ? "translateY(-4px)" : "none", transition: "all .22s ease", display: "flex", flexDirection: "column" }
    },
      React.createElement("div", { style: { width: "100%", height: 190, background: "linear-gradient(135deg," + C.cremaDark + "," + C.beige + ")", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 } },
        prod.imagenURL
          ? React.createElement("img", { src: prod.imagenURL, alt: prod.nombre, style: { width: "100%", height: "100%", objectFit: "cover" }, onError: function(e) { e.target.style.display = "none"; } })
          : React.createElement("span", { style: { fontSize: 52, opacity: 0.3 } }, "🧉")
      ),
      React.createElement("div", { style: { padding: "13px 14px 15px", flex: 1, display: "flex", flexDirection: "column" } },
        React.createElement("p", { style: { fontWeight: 700, fontSize: 14, margin: "0 0 5px", color: C.texto, lineHeight: 1.3, flex: 1 } }, prod.nombre || "Producto"),
        prod.descripcion && React.createElement("p", { style: { color: C.textoSub, fontSize: 12, margin: "0 0 10px", lineHeight: 1.45 } }, prod.descripcion),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" } },
          React.createElement("span", { style: { fontWeight: 900, fontSize: 18, color: C.verdeOsc } }, moneda + (Number(prod.precio).toLocaleString() || "-")),
          React.createElement("button", {
            onClick: function() { onAgregar(Object.assign({}, prod, { id: prodId })); setAgregado(true); setTimeout(function() { setAgregado(false); }, 1300); },
            style: { padding: "8px 14px", borderRadius: 10, background: agregado ? "#bbf7d0" : "linear-gradient(135deg," + C.verde + "," + C.verdeOsc + ")", color: agregado ? C.verdeOsc : "#fff", fontWeight: 700, fontSize: 12, border: "none", cursor: "pointer", transition: "all .2s", fontFamily: "inherit" }
          }, agregado ? "Agregado" : "+ Agregar")
        )
      )
    )
  );
}

export default function App() {
  var firebaseData = useFirebaseData();
  var data = firebaseData.data;
  var guardar = firebaseData.guardar;
  var loading = firebaseData.loading;

  var [vista, setVista] = useState("inicio");
  var [carrito, setCarrito] = useState([]);
  var [showCarrito, setShowCarrito] = useState(false);
  var [showMenu, setShowMenu] = useState(false);
  var [showClave, setShowClave] = useState(false);
  var [showAdmin, setShowAdmin] = useState(false);

  var cfg = data.config || DATA_INICIAL.config;
  var cats = data.categorias || {};
  var catKeys = Object.keys(cats);
  var totalItems = carrito.reduce(function(s, i) { return s + i.cantidad; }, 0);

  function agregar(prod) {
    setCarrito(function(prev) {
      var ex = prev.find(function(i) { return i.id === prod.id; });
      if (ex) return prev.map(function(i) { return i.id === prod.id ? Object.assign({}, i, { cantidad: i.cantidad + 1 }) : i; });
      return prev.concat([Object.assign({}, prod, { cantidad: 1 })]);
    });
  }
  function updateQty(id, d) { setCarrito(function(p) { return p.map(function(i) { return i.id === id ? Object.assign({}, i, { cantidad: Math.max(1, i.cantidad + d) }) : i; }); }); }
  function remover(id) { setCarrito(function(p) { return p.filter(function(i) { return i.id !== id; }); }); }

  var productos = [];
  var tituloVista = "";
  if (vista === "todos") {
    productos = catKeys.reduce(function(acc, k) { return acc.concat(Object.entries(cats[k].productos || {}).map(function(e) { return Object.assign({ pk: e[0] }, e[1]); })); }, []);
    tituloVista = "Todos los productos";
  } else if (vista !== "inicio" && vista !== "contacto") {
    var catActual = cats[vista];
    if (catActual) { productos = Object.entries(catActual.productos || {}).map(function(e) { return Object.assign({ pk: e[0] }, e[1]); }); tituloVista = catActual.nombre; }
  }
  var todosProd = catKeys.reduce(function(acc, k) { return acc.concat(Object.entries(cats[k].productos || {}).map(function(e) { return Object.assign({ pk: e[0] }, e[1]); })); }, []);

  if (loading) {
    return React.createElement("div", { style: { minHeight: "100vh", background: C.crema, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 } },
      React.createElement("div", { style: { fontSize: 48 } }, "🧉"),
      React.createElement("p", { style: { color: C.textoSub, fontSize: 18 } }, "Cargando La Ultima Cebada...")
    );
  }

  return React.createElement("div", { style: { minHeight: "100vh", background: C.crema, fontFamily: "sans-serif" } },
    React.createElement("style", null, "@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:translateX(0)}}@keyframes bannerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0}"),

    cfg.bannerTexto && React.createElement("div", { style: { background: C.verdeOsc, color: C.dorado, overflow: "hidden", height: 32, display: "flex", alignItems: "center" } },
      React.createElement("div", { style: { display: "flex", animation: "bannerScroll 22s linear infinite", whiteSpace: "nowrap" } },
        [1,2,3,4].map(function(n) { return React.createElement("span", { key: n, style: { padding: "0 40px", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em" } }, cfg.bannerTexto); })
      )
    ),

    React.createElement("header", { style: { background: C.blanco, borderBottom: "1px solid " + C.beige, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 16px rgba(20,50,10,0.07)" } },
      React.createElement("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "0 16px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" } },
        React.createElement("button", { onClick: function() { setShowMenu(true); }, style: { background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5 } },
          [1,2,3].map(function(n) { return React.createElement("div", { key: n, style: { width: 22, height: 2.5, background: C.verdeOsc, borderRadius: 2 } }); })
        ),
        React.createElement("button", { onClick: function() { setVista("inicio"); }, style: { background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("div", { style: { width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg," + C.verdeOsc + "," + C.verde + ")", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: C.dorado } }, cfg.logoTexto || "LUC"),
          React.createElement("div", { style: { textAlign: "left" } },
            React.createElement("p", { style: { fontWeight: 900, fontSize: 16, color: C.verdeOsc, margin: 0 } }, cfg.nombreTienda || "La Ultima Cebada"),
            cfg.eslogan && React.createElement("p", { style: { fontSize: 10, color: C.textoSub, margin: "2px 0 0", fontStyle: "italic" } }, cfg.eslogan)
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center" } },
          React.createElement("button", { onClick: function() { setShowClave(true); }, style: { background: C.cremaDark, border: "1px solid " + C.beige, borderRadius: 10, padding: "7px 11px", fontSize: 13, cursor: "pointer", color: C.textoMed } }, "Config"),
          React.createElement("button", { onClick: function() { setShowCarrito(true); }, style: { position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 } },
            React.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: C.verdeOsc, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
              React.createElement("circle", { cx: 9, cy: 21, r: 1 }),
              React.createElement("circle", { cx: 20, cy: 21, r: 1 }),
              React.createElement("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
            ),
            totalItems > 0 && React.createElement("span", { style: { position: "absolute", top: 3, right: 3, background: C.verde, color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" } }, totalItems)
          )
        )
      )
    ),

    vista === "inicio" && React.createElement(React.Fragment, null,
      React.createElement("div", { style: { position: "relative", height: "clamp(300px,55vw,520px)", overflow: "hidden" } },
        cfg.heroImagenURL
          ? React.createElement("img", { src: cfg.heroImagenURL, alt: "hero", style: { width: "100%", height: "100%", objectFit: "cover" } })
          : React.createElement("div", { style: { width: "100%", height: "100%", background: "linear-gradient(160deg," + C.verdeOsc + " 0%," + C.verde + " 45%," + C.verdeMed + " 100%)" } }),
        React.createElement("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(20,40,10,0.75) 0%,rgba(20,40,10,0.35) 60%,transparent 100%)" } }),
        React.createElement("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "clamp(24px,5vw,60px)", animation: "fadeUp .7s ease" } },
          React.createElement("p", { style: { color: C.dorado, fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 } }, "Bienvenido a"),
          React.createElement("h1", { style: { color: "#fff", fontWeight: 900, fontSize: "clamp(30px,6vw,68px)", lineHeight: 1.08, marginBottom: 10, textShadow: "0 2px 30px rgba(0,0,0,0.35)", maxWidth: 620 } }, cfg.nombreTienda || "La Ultima Cebada"),
          cfg.eslogan && React.createElement("p", { style: { color: "rgba(255,255,255,0.75)", fontSize: "clamp(14px,2vw,18px)", fontStyle: "italic", marginBottom: 24 } }, cfg.eslogan),
          todosProd.length > 0 && React.createElement("button", { onClick: function() { setVista("todos"); }, style: { padding: "13px 30px", background: C.dorado, color: C.verdeOsc, borderRadius: 999, fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" } }, "Ver productos")
        )
      ),
      catKeys.length === 0 && React.createElement("div", { style: { maxWidth: 560, margin: "0 auto", padding: "48px 20px" } },
        React.createElement("div", { style: { background: C.blanco, borderRadius: 22, padding: "36px 30px", border: "2px dashed " + C.beige, textAlign: "center" } },
          React.createElement("div", { style: { fontSize: 52, marginBottom: 16 } }, "🧉"),
          React.createElement("h2", { style: { fontWeight: 900, fontSize: 26, color: C.verdeOsc, marginBottom: 12 } }, "Configura La Ultima Cebada!"),
          React.createElement("p", { style: { color: C.textoSub, lineHeight: 1.7, marginBottom: 24, fontSize: 15 } }, "Toca el boton para agregar tus productos, precios y fotos."),
          React.createElement("button", { onClick: function() { setShowClave(true); }, style: { padding: "14px 32px", background: "linear-gradient(135deg," + C.verde + "," + C.verdeOsc + ")", color: C.dorado, borderRadius: 14, fontWeight: 800, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit" } }, "Configurar mi tienda")
        )
      ),
      todosProd.length > 0 && React.createElement("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "48px 16px 64px" } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: 36 } },
          React.createElement("h2", { style: { fontWeight: 900, fontSize: "clamp(26px,4vw,38px)", color: C.verdeOsc, marginBottom: 8 } }, "Destacados"),
          React.createElement("div", { style: { width: 52, height: 3, background: C.dorado, borderRadius: 2, margin: "0 auto" } })
        ),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 16 } },
          todosProd.slice(0, 6).map(function(prod) { return React.createElement(Tarjeta, { key: prod.pk, prod: prod, prodId: prod.pk, moneda: cfg.moneda, onAgregar: agregar }); })
        )
      ),
      React.createElement("footer", { style: { background: C.verdeOsc, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "24px 20px", fontSize: 13 } },
        React.createElement("p", { style: { color: C.dorado, fontWeight: 700, fontSize: 16, marginBottom: 6 } }, cfg.nombreTienda || "La Ultima Cebada"),
        React.createElement("p", { style: { marginTop: 6, opacity: 0.4, fontSize: 11 } }, "Hecho con amor y mate")
      )
    ),

    vista !== "inicio" && vista !== "contacto" && React.createElement("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "32px 16px 64px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 30 } },
        React.createElement("button", { onClick: function() { setVista("inicio"); }, style: { background: "none", border: "none", color: C.verde, fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "inherit" } }, "Inicio"),
        React.createElement("span", { style: { color: C.beige } }, ">"),
        React.createElement("h2", { style: { fontWeight: 900, fontSize: "clamp(20px,4vw,32px)", color: C.verdeOsc } }, tituloVista)
      ),
      productos.length === 0
        ? React.createElement("div", { style: { textAlign: "center", padding: "80px 0", color: C.beigeOsc } },
            React.createElement("div", { style: { fontSize: 48, marginBottom: 12 } }, "📦"),
            React.createElement("p", { style: { fontWeight: 600, color: C.textoSub } }, "No hay productos en esta categoria aun")
          )
        : React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 16 } },
            productos.map(function(prod) { return React.createElement(Tarjeta, { key: prod.pk, prod: prod, prodId: prod.pk, moneda: cfg.moneda, onAgregar: agregar }); })
          )
    ),

    vista === "contacto" && React.createElement("div", { style: { maxWidth: 480, margin: "0 auto", padding: "64px 24px", textAlign: "center" } },
      React.createElement("div", { style: { fontSize: 56, marginBottom: 16 } }, "💬"),
      React.createElement("h2", { style: { fontWeight: 900, fontSize: 34, marginBottom: 12, color: C.verdeOsc } }, "Contacto"),
      React.createElement("p", { style: { color: C.textoSub, marginBottom: 28, lineHeight: 1.7, fontSize: 15 } }, "Escribinos por WhatsApp y te respondemos!"),
      cfg.whatsapp
        ? React.createElement("a", { href: "https://wa.me/" + cfg.whatsapp, target: "_blank", rel: "noreferrer", style: { display: "inline-flex", alignItems: "center", gap: 10, padding: "15px 32px", background: C.wsp, color: "#fff", borderRadius: 16, fontWeight: 800, fontSize: 18, textDecoration: "none", fontFamily: "inherit" } }, "Escribir por WhatsApp")
        : React.createElement("p", { style: { color: C.beigeOsc } }, "Numero no configurado aun."),
      React.createElement("button", { onClick: function() { setVista("inicio"); }, style: { display: "block", margin: "28px auto 0", background: "none", border: "none", color: C.verde, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 } }, "Volver")
    ),

    showMenu && React.createElement(MenuHamb, { cfg: cfg, cats: cats, catKeys: catKeys, onClose: function() { setShowMenu(false); }, onNav: setVista }),
    showCarrito && React.createElement(Carrito, { items: carrito, moneda: cfg.moneda, whatsapp: cfg.whatsapp, onRemove: remover, onQty: updateQty, onClear: function() { setCarrito([]); }, onClose: function() { setShowCarrito(false); } }),
    showClave && React.createElement(ModalClave, { onSuccess: function() { setShowClave(false); setShowAdmin(true); }, onClose: function() { setShowClave(false); } }),
    showAdmin && React.createElement(PanelAdmin, { data: data, onSave: guardar, onClose: function() { setShowAdmin(false); } })
  );
}
