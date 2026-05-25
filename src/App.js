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
