# Ludo Matemático · Colegio San Pío X — Internet

Versión en red de Ludo Matemático. La partida se sincroniza con Node.js + Socket.IO.

## Publicar en Internet con Render

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render elige **New → Web Service** y conecta el repositorio.
3. Usa:
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Render publicará una dirección `https://...onrender.com`.
5. Comparte esa dirección con los jugadores.

El archivo `render.yaml` ya contiene esta configuración.

## Cómo jugar

- Un jugador pulsa **Crear sala** y comparte el código.
- Los demás abren la misma dirección desde cualquier lugar con Internet y pulsan **Unirse**.
- Cuando estén todos los jugadores, el anfitrión inicia la partida.
- El servidor sincroniza turnos, dado, movimientos, capturas y preguntas.

## Prueba local

```bash
npm install
npm start
```

Luego abre `http://localhost:3000`.

## Importante

Render admite conexiones WebSocket desde Internet, necesarias para la sincronización en tiempo real. El plan gratuito es adecuado para pruebas, pero puede suspender temporalmente el servicio después de inactividad.
