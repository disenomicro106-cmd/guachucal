# GUACHUCAL TURISMO V5

Esta versión conserva la estructura y la información del proyecto y corrige la vista desktop y móvil.

## Cambios principales
- Desktop: tarjetas más pequeñas y colocadas más abajo para no tapar el título/descripción.
- Máscara lateral suave: las tarjetas desaparecen gradualmente en los bordes.
- Carrusel infinito real: al pasar la última, la primera entra desde el lado correspondiente sin regresar todo el carrusel.
- Arrastre con mouse, touch/swipe y flechas.
- Efecto 3D al pasar el mouse.
- WebGL/Three.js con shader de agua/cristal visible que sigue el mouse.
- Menú móvil corregido: botón MENU/CERRAR y panel de pantalla completa desde la derecha.
- Las categorías llevan siempre al hero superior, incluso si estabas en el footer.
- EXPLORAR LUGAR abre una vista individual con una segunda imagen editable (`detailImage`).
- Se conservan las 3 imágenes de referencia en `assets/referencias/`.
- Productos locales ahora tienen 5 tarjetas: Queso al vino, Queso de ron con pasas, Queso saborizado, Queso de arándanos y Queso o producto artesanal.

## Cambiar imágenes
En `content.js`, cambia `image` y `detailImage` por tus archivos locales.
Ejemplo:
`image:"assets/laguna-bolsa.jpg"`
`detailImage:"assets/detalle-laguna-bolsa.jpg"`

## Contacto
Al principio de `content.js` cambia `email`, `phoneDisplay` y `whatsapp`.

## Logo
Reemplaza `assets/logo.png`.

## Nota
Las fotografías que vienen en `content.js` son imágenes de referencia remotas para que la web no aparezca vacía. Puedes sustituirlas por tus fotografías definitivas.


## V5 - cambios
- Flechas, arrastre (mouse/dedo) y rueda mueven las tarjetas; la primera tarjeta (izquierda en escritorio/laptop, arriba en celular) es siempre la activa y su imagen es el fondo.
- Un clic en una tarjeta la pone de primera y cambia el fondo; doble clic entra a la tarjeta (igual que EXPLORAR LUGAR).
- Vista individual: boton X redondo para cerrar y boton "¡GO!" que abre WhatsApp (318 407 3233) con el nombre del lugar.
- WhatsApp y telefono de CONTACTO actualizados en content.js.
- Celular: tarjetas en columna vertical a la derecha, se deslizan arriba/abajo.
- Laptop: mismo diseno de escritorio con fuentes y tarjetas mas pequenas.
