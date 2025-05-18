# Parcial 2

* Giuseppe Gomez
* Juan Padilla
* Juan Vargas

## Demo

Se tiene una demo del proyecto funcionando en el siguiente link:

**NOTA:** La ruta `/profile` da problemas al acceder de manera directa (problema del hosting gratuito), por lo que se debe acceder primero al inicio `/` y luego hacer click en el enlace de perfil que esta en la barra de navegación.

https://02-parcial-frontend.vercel.app/

## Local

Para correr el proyecto, se debe instalar las dependencias:

```bash
npm install
```

Luego, se debe configurar el archivo `.env` con las credenciales de la cuenta de Firebase.

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Se debe crear 2 aplicaciones en Firebase:

1. Authentication
2. Firestore

Luego, se debe correr el proyecto:

```bash
npm run dev
```
