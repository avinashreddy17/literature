# 🚀 Literature Game - Deployment Guide

This guide provides instructions for building and deploying the Literature game to a production environment. The application is designed to be hosted on platforms that support Node.js, such as Heroku, Render, Railway, or any VPS.

## 🎯 **Prerequisites**

- Node.js (v18 or higher)
- npm (v8 or higher)
- A hosting provider that supports Node.js applications

## 🛠️ **Build for Production**

To create a production-ready build of the entire application (client and server), run the following command from the **root directory** of the project:

```bash
npm install
npm run build
```

This command will:
1.  **Install all dependencies** for the client, server, and shared packages.
2.  **Build the `shared` package**, creating the compiled JavaScript and type definitions.
3.  **Build the `client` package**, creating an optimized static build in `client/dist`.
4.  **Build the `server` package**, creating a compiled JavaScript application in `server/dist`.

After the build is complete, the `server/dist` directory will contain the self-sufficient production server, and `client/dist` will contain the static frontend assets that the server will serve.

## ⚙️ **Environment Variables**

The server requires the following environment variables to be set in your hosting provider's dashboard:

| Variable           | Description                                                                                             | Example Value                  |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `NODE_ENV`         | Sets the environment to production mode. This is **critical** for enabling production features.           | `production`                   |
| `PORT`             | The port your server should listen on. Most hosting providers set this automatically.                     | `10000` (or set by provider)   |
| `CLIENT_URL` | The full URL of your deployed frontend application. This is used for CORS configuration. | `https://literature-game.onrender.com` |

**Note**: The server code has been updated to use `https://your-production-url.com` as a placeholder. You must replace this with your actual frontend URL in `server/src/server.ts` or, even better, use the `CLIENT_URL` environment variable to set it dynamically.

## 🚀 **Running in Production**

The command to start the server in production is:

```bash
npm start --workspace=server
```

Your hosting provider will typically need this command for its "Start Command" or "Web Service Command" configuration.

### **Example (Render.com)**

-   **Build Command**: `npm install && npm run build`
-   **Start Command**: `npm start --workspace=server`
-   **Environment Variables**:
    -   `NODE_ENV`: `production`
    -   `CLIENT_URL`: `https://your-render-app-name.onrender.com`

## 📝 **Deployment Summary**

1.  **Push your code** to a GitHub repository.
2.  **Connect your repository** to your chosen hosting provider (e.g., Render, Railway).
3.  **Configure the build and start commands** as specified above.
4.  **Set the required environment variables** in your provider's settings.
5.  **Trigger a deployment**. The provider will clone your repo, run the build, and then start the server.

The server is configured to serve the client's static files, so you only need to deploy the server application. The client is bundled with it.

## 🩺 **Verifying Deployment**

-   Navigate to your application's public URL. You should see the Literature game's welcome screen.
-   Check the server logs on your hosting provider for any errors.
-   Use the `/health` endpoint (e.g., `https://your-app.com/health`) to ensure the server is running correctly.

Your Literature game is now fully prepared for deployment to any modern Node.js hosting platform! 