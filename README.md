# Ludo Matemático San Pío X — Online + Administrador

- Juego online con salas y Socket.IO.
- Administrador protegido con contraseña: `1234`.
- Las preguntas editadas por el administrador se envían al servidor y se sincronizan con todos los jugadores conectados.
- Las preguntas se guardan en `data/questions.json` durante la ejecución del servidor.

## Ejecutar

```bash
npm install
npm start
```

Abrir `http://localhost:3000`.

### Importante sobre Render
El archivo `data/questions.json` está en el sistema de archivos del servidor. En servicios con filesystem efímero, un reinicio/redeploy puede restaurar el archivo inicial. Para persistencia permanente conviene conectar una base de datos o almacenamiento persistente.


## Preguntas
- Se conservan las 24 preguntas de las cuatro áreas: 6 por área, una por casilla blanca.
- Las 4 preguntas de cada área que fueron creadas por los estudiantes están conservadas en sus respectivas casillas.
- Habilidad Matemática tiene un banco independiente de 4 preguntas editables; en el juego se selecciona una al azar.
- Administrador protegido con contraseña: `1234`.
- Los cambios se sincronizan con los jugadores conectados.

> Nota: en Render Free, el archivo `questions.json` se escribe durante la ejecución, pero el almacenamiento local no es permanente frente a todos los reinicios/redeploys. Para conservar cambios de forma permanente se debe conectar una base de datos o almacenamiento persistente.
