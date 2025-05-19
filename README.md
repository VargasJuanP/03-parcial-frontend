# Parcial 3

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

---

## Experimento con GrowthBook

Este proyecto utiliza **GrowthBook** para realizar un experimento A/B con el objetivo de evaluar cuál versión del mensaje de "Iniciar sesión" genera mayor interacción.

  * **Variante A:** El mensaje se muestra como un **link**.
  * **Variante B:** El mensaje de iniciar sesión se muestra como un **botón**.

![image](https://github.com/user-attachments/assets/6f6ab0e7-574f-41c3-b359-6b6846e27c43)

## Pruebas

Se han implementado **pruebas unitarias** utilizando `Vitest` y `@testing-library/react`. Las pruebas cubren los componentes clave de Register, Login, Post y CreatePost, las cuales se ejecutan automáticamente al hacer push en el branch main, para asegurar que los cambios no rompan la funcionalidad existente.

```bash
npm run test
```
