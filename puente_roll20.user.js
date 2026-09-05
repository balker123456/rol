// ==UserScript==
// @name         Puente Hoja DnD → Roll20
// @namespace    hoja-dnd-roll20
// @version      1.1.0
// @description  Lleva al chat de Roll20 las tiradas que se disparan desde la hoja interactiva (hoja_artifice.html). Funciona como Beyond20: escribe en el chat de la partida y pulsa Enviar.
// @author       Claudio Flores
// @homepageURL  https://github.com/balker123456/hoja-artifice
// @updateURL    https://raw.githubusercontent.com/balker123456/hoja-artifice/main/puente_roll20.user.js
// @downloadURL  https://raw.githubusercontent.com/balker123456/hoja-artifice/main/puente_roll20.user.js
// @match        https://app.roll20.net/editor/*
// @match        https://app.roll20.net/editor
// @match        https://balker123456.github.io/*
// @match        https://*.github.io/*
// @match        file:///*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// @run-at       document-idle
// @noframes
// ==/UserScript==

/*
  Cómo funciona (dos pestañas, un mismo script):
  - En la pestaña de la HOJA: escucha los mensajes que la página emite con window.postMessage
    y los deja en el almacén compartido de Tampermonkey (GM_setValue), que es visible desde
    cualquier otra pestaña donde corra este mismo script, aunque sea de otro dominio.
  - En la pestaña de ROLL20: escucha ese almacén (GM_addValueChangeListener), escribe el comando
    en el cuadro de chat y pulsa el botón Enviar. Roll20 hace la tirada real.
  - Roll20 emite un "latido" cada 2 s para que la hoja sepa si la partida está abierta.

  Si un día Roll20 cambia su interfaz, lo único que hay que revisar son los SELECTORES de abajo.
*/

(function () {
  'use strict';

  // ---------- Selectores del chat de Roll20 (lo único que suele romperse) ----------
  const SELECTORES_TEXTAREA = ['#textchat-input textarea', '#textchat-input .ui-autocomplete-input', 'div[id^="textchat"] textarea'];
  const SELECTORES_BOTON    = ['#chatSendBtn', '#textchat-input .btn', '#textchat-input button'];

  const CLAVE_TIRADA    = 'hd_tirada';
  const CLAVE_RESULTADO = 'hd_resultado';
  const CLAVE_LATIDO    = 'hd_latido';

  const esRoll20 = location.hostname === 'app.roll20.net' || !!document.querySelector('#textchat-input');
  const esHoja   = !esRoll20 && !!document.querySelector('meta[name="hoja-dnd-roll20"]');

  if (!esRoll20 && !esHoja) return; // cualquier otra página: no hacemos nada

  const buscar = lista => { for (const s of lista) { const el = document.querySelector(s); if (el) return el; } return null; };

  // =====================================================================
  //  LADO ROLL20
  // =====================================================================
  if (esRoll20) {
    function enviarAlChat(texto) {
      const ta  = buscar(SELECTORES_TEXTAREA);
      const btn = buscar(SELECTORES_BOTON);
      if (!ta)  return { ok: false, error: 'No encontré el cuadro de chat de Roll20. ¿Está abierta la partida (no la página de la campaña)?' };
      if (!btn) return { ok: false, error: 'Encontré el chat pero no el botón Enviar; hay que actualizar los selectores del script.' };
      const borrador = ta.value;             // lo que el jugador estuviera escribiendo
      ta.value = texto;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      btn.click();
      // Si Roll20 no vació el cuadro, es que no lo envió
      const noSalio = ta.value === texto;
      if (noSalio) ta.value = borrador;
      else if (borrador) setTimeout(() => { if (!ta.value) ta.value = borrador; }, 50);
      return noSalio ? { ok: false, error: 'Roll20 no aceptó el texto (¿el chat estaba deshabilitado?).' } : { ok: true };
    }

    let ultimoId = null;
    GM_addValueChangeListener(CLAVE_TIRADA, (nombre, viejo, nuevo, remoto) => {
      if (!remoto || !nuevo) return;
      let t; try { t = JSON.parse(nuevo); } catch (e) { return; }
      if (!t || !t.id || t.id === ultimoId || typeof t.comando !== 'string') return;
      ultimoId = t.id;
      const r = enviarAlChat(t.comando);
      GM_setValue(CLAVE_RESULTADO, JSON.stringify({ id: t.id, ok: r.ok, error: r.error || '', t: Date.now() }));
    });

    // Latido: la hoja lo usa para pintar "Roll20: conectado". Solo late si el chat está a la vista.
    setInterval(() => { if (buscar(SELECTORES_TEXTAREA)) GM_setValue(CLAVE_LATIDO, Date.now()); }, 2000);
    return;
  }

  // =====================================================================
  //  LADO HOJA
  // =====================================================================
  const aLaPagina = obj => window.postMessage(Object.assign({ canal: 'hoja-dnd' }, obj), '*');

  window.addEventListener('message', ev => {
    const d = ev.data;
    if (!d || d.canal !== 'hoja-dnd') return;
    if (d.tipo === 'hoja-lista') { aLaPagina({ tipo: 'script-listo' }); latir(); return; }
    if (d.tipo === 'tirada' && typeof d.comando === 'string' && d.id) {
      GM_setValue(CLAVE_TIRADA, JSON.stringify({ id: d.id, comando: d.comando, t: Date.now() }));
    }
  });

  GM_addValueChangeListener(CLAVE_RESULTADO, (nombre, viejo, nuevo, remoto) => {
    if (!remoto || !nuevo) return;
    let r; try { r = JSON.parse(nuevo); } catch (e) { return; }
    aLaPagina({ tipo: 'resultado', id: r.id, ok: !!r.ok, error: r.error || '' });
  });

  function latir() {
    const t = Number(GM_getValue(CLAVE_LATIDO, 0)) || 0;
    aLaPagina({ tipo: 'latido', t });
  }
  GM_addValueChangeListener(CLAVE_LATIDO, (n, v, nuevo, remoto) => { if (remoto) aLaPagina({ tipo: 'latido', t: Number(nuevo) || Date.now() }); });
  setInterval(latir, 2000);

  aLaPagina({ tipo: 'script-listo' });
  latir();
})();
