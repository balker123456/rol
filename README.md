# Hoja de Artífice → Roll20 · Instalación

Dos archivos hacen el trabajo:

| Archivo | Qué es |
|---|---|
| `hoja_artifice.html` | La hoja interactiva. Se abre en Chrome como cualquier página; guarda lo que escribes en el propio navegador y exporta/importa un JSON de respaldo. |
| `puente_roll20.user.js` | El "Beyond20 casero": un userscript de Tampermonkey que corre en la pestaña de la hoja y en la de Roll20 y traslada cada tirada al chat de la partida. |

## 1. Instalar Tampermonkey (una sola vez)

1. Chrome → Chrome Web Store → **Tampermonkey** → *Añadir a Chrome*.
2. Abre `chrome://extensions`, activa el interruptor **Modo de desarrollador** (arriba a la derecha). Tampermonkey lo exige desde Chrome 120 para poder ejecutar scripts; si no lo activas, el script se instala pero no corre.
3. En esa misma página, entra en *Detalles* de Tampermonkey y activa **Permitir el acceso a las URL de archivo**. Sin esto, el script no ve la hoja cuando la abres desde tu disco (`file:///…`).

## 2. Instalar el userscript

Arrastra `puente_roll20.user.js` a una pestaña de Chrome, o abre el panel de Tampermonkey → *Utilidades* → *Importar desde archivo*. Tampermonkey muestra el código y pide confirmación: **Instalar**.

## 3. Usar en partida

1. Abre `hoja_artifice.html` en una pestaña (doble clic en el archivo). En la barra negra debe decir **Script: activo**. Si dice *no detectado*, revisa el paso 1.3.
2. Abre la partida de Roll20 en otra pestaña (la de jugar, `app.roll20.net/editor/…`, no la página de la campaña). En unos segundos la hoja pasa a **Roll20: conectado**.
3. Pulsa cualquier botón *Tirar*, *Atacar* o *Lanzar*. El comando aparece en el chat de Roll20 como una tirada real de Roll20, con plantilla y el nombre del personaje. El registro al pie de la hoja confirma cada envío.

Modo *Ventaja/Desventaja* y *Susurrar al DM* están en la barra superior y afectan a todas las tiradas siguientes.

Si no hay conexión, el botón copia el comando al portapapeles: pégalo en el chat de Roll20 con Ctrl+V y sale igual.

## Camino recomendado: GitHub Pages (repo balker123456/rol)

1. El repositorio público es `github.com/balker123456/rol`, con `hoja_artifice.html`, `puente_roll20.user.js` e `index.html` (redirige a la hoja) en la rama `main`.
2. GitHub Pages está activo desde `main / (root)`. La hoja queda en **https://balker123456.github.io/rol/** (o `https://balker123456.github.io/rol/hoja_artifice.html`).
3. Instala el script abriendo en Chrome `https://raw.githubusercontent.com/balker123456/rol/main/puente_roll20.user.js`: Tampermonkey lo detecta y ofrece *Instalar*. El script trae `@updateURL`, así que cada vez que subas una versión nueva al repo (subiendo el número de `@version`), Tampermonkey se actualiza solo.
4. Con este camino no necesitas el paso 1.3 (acceso a URL de archivo). Sí sigues necesitando Tampermonkey con el *Modo de desarrollador* activado.

Los datos del personaje (nombre, PG, espacios gastados) viven en el navegador, no en el archivo publicado; para pasarlos a otro dispositivo usa *Exportar/Importar JSON*.

Si lo alojas en otro dominio, edita la línea `// @match` del script en Tampermonkey y añade la URL.

## Si un día deja de funcionar

Roll20 cambia su interfaz de tanto en tanto (a Beyond20 le pasa lo mismo). Lo único que hay que revisar son las dos listas `SELECTORES_TEXTAREA` y `SELECTORES_BOTON` al inicio de `puente_roll20.user.js`: en la partida, clic derecho sobre el cuadro de chat → *Inspeccionar*, y anotar el `id` o clase del `textarea` y del botón *Send*.

## El personaje ya viene cargado

La hoja abre con el Artífice Armero (Guardián) goblin de nivel 10 que definimos: compra de puntos FUE 8 · DES 12 · CON 16 · INT 20 · SAB 12 · CAR 11, trasfondo Constructor naval (Historia y Percepción), placas y escudo (CA 23 con Defensa mejorada en el escudo y Capa de protección; el Yelmo de la Consciencia y las Botas aladas van en la armadura y un homúnculo acompaña), 83 PG, Guanteletes de Trueno +11 / 1d8+7, 10 conjuros preparados más los 6 de Armero, 8 infusiones (6 activas), y los recursos con usos (Campo Defensivo, Furia de los Pequeños). Se llama Yako. `personaje_armero_goblin_nv10.json` es el mismo personaje para *Importar JSON* si alguna vez borras la hoja.

Dos cosas dependen de tu DM y conviene confirmarlas: que acepte **escudo con los Guanteletes de Trueno** (si no, CA 21: mueve Defensa mejorada a la pechera) y el oro para la **armadura de placas** (1.500 po).

## Lo que la hoja calcula sola (reglas 5e de Artífice, 2014)

Bono de competencia por nivel · modificadores · salvaciones (CON e INT marcadas por defecto) · habilidades con competencia y pericia · percepción pasiva · iniciativa · CD de salvación de conjuros y ataque de conjuro con INT · conjuros preparados (INT + mitad del nivel) · trucos conocidos · espacios de conjuro por nivel (tabla de lanzador de mitad de progresión, con espacios desde nivel 1) · infusiones conocidas y objetos infundidos · usos de Destello de genio (desde nivel 7) · dados de golpe d8. El *Descanso largo* restaura PG, espacios, Destello y la mitad de los dados de golpe.

Los rasgos de la especialidad, la raza y el trasfondo van en el cuadro de texto libre. En Conjuros, la casilla de la izquierda marca cuáles están preparados hoy y el contador avisa en rojo si te pasas del máximo; el botón ∞ marca un conjuro como «siempre preparado» (no cuenta), y «Mostrar solo preparados» filtra la lista para la partida.
