# 🚀 Deployment Plan: Backend on Render with Neon DB

> **Context**: Deploying a Node.js + Express backend to Render.com.  
> Using **Neon** for Serverless Postgres.  
> Using **Prisma** for ORM with `@prisma/adapter-pg`.

---

## 🏗️ The Build & Deploy Strategy

Render works by connecting to your GitHub repository and running specific commands to build and start your application.

For a Prisma + TypeScript backend, the deployment lifecycle needs to do three things:

1. **Install Dependencies** (and generate Prisma Client via `postinstall`).
2. **Build TypeScript** (compile `src/` to `dist/`).
3. **Migrate the Database** (apply schema changes to Neon DB).
4. **Start the Server**.

---

## 🛠️ Step 1: Render Configuration

When you create a **New Web Service** on Render and connect your repository, configure it with these settings:

| Setting           | Value                                                      | Explanation                                                                                                   |
| :---------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Environment**   | `Node`                                                     | Tells Render this is a Node.js app                                                                            |
| **Build Command** | `npm ci && npm run build && npm run prisma:migrate:deploy` | Installs dependencies cleanly (`npm ci`), builds the TS code, and safely applies pending database migrations. |
| **Start Command** | `npm run start:prod`                                       | Starts the compiled JavaScript code from the `dist/` folder.                                                  |

> [!TIP]
> **Why `prisma migrate deploy` instead of `prisma migrate dev`?**
> `prisma migrate dev` is strictly for local development—it creates migration files and can reset the database if drift is detected.
> `prisma migrate deploy` only applies existing migration files to your production database without resetting it.

---

## 🔑 Step 2: Environment Variables

Render needs all the environment variables your app uses. In your Render Web Service dashboard, go to the **Environment** tab and add these:

| Key                            | Example Value / Where to get it                                                                        |
| :----------------------------- | :----------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                     | `production`                                                                                           |
| `PORT`                         | `10000` (Render sets this automatically, but good to define if your config requires it)                |
| `DATABASE_URL`                 | From Neon Console (e.g., `postgresql://user:pass@ep-name.region.aws.neon.tech/dbname?sslmode=require`) |
| `SESSION_SECRET`               | A long, secure random string (e.g., generated via `openssl rand -base64 32`)                           |
| `SESSION_EXPIRES_IN`           | `7d`                                                                                                   |
| `GOOGLE_CLIENT_ID`             | From Google Cloud Console                                                                              |
| `GOOGLE_CLIENT_SECRET`         | From Google Cloud Console                                                                              |
| `BASE_PATH`                    | `/api`                                                                                                 |
| `BACKEND_ORIGIN`               | `https://your-app-name.onrender.com`                                                                   |
| `FRONTEND_ORIGIN`              | URL of your deployed frontend (e.g., `https://your-fe.vercel.app`)                                     |
| `BACKEND_GOOGLE_CALLBACK_URL`  | `<backend_origin>/api/auth/google/callback`                                                            |
| `FRONTEND_GOOGLE_CALLBACK_URL` | `<frontend_origin>/login`                                                                              |

> [!WARNING]
> Ensure your Neon `DATABASE_URL` includes `?sslmode=require`. Neon requires SSL connections.

---

## ⚙️ Step 3: Package.json Verification

Your `package.json` already has the correct scripts to support this deployment:

```json
"scripts": {
    "postinstall": "prisma generate", // Runs automatically after npm ci
    "start:prod": "cross-env NODE_ENV=production node dist/index.js", // Your start command
    "build": "rimraf dist && tsc", // Your build command
    "prisma:migrate:deploy": "prisma migrate deploy" // Safe production migration
}
```

The `postinstall` script is crucial here. When Render runs `npm ci`, it will automatically trigger `npm run postinstall`, which runs `prisma generate`. This ensures the Prisma Client is built specifically for the deployment environment's OS.

---

## 🔄 Step 4: The Deployment Workflow

Once configured, here is what happens every time you push to the `main` branch:

1. **Push**: You push code to GitHub.
2. **Trigger**: Render detects the push and spins up a build server.
3. **Build**:
    - `npm ci` installs packages.
    - `postinstall` generates Prisma client.
    - `npm run build` compiles TS to JS.
    - `npm run prisma:migrate:deploy` connects to Neon and applies any new migrations found in your `prisma/migrations` folder.
4. **Deploy**: Render replaces the old server container with the new one.
5. **Start**: `npm run start:prod` boots up the server.

---

## 📝 Pre-Deployment Checklist

- [ ] Ensure all local migrations are created and committed (`prisma/migrations` folder must be in Git).
- [ ] Update your Google OAuth Authorized Redirect URIs in Google Cloud Console to include the new Render domain (`https://your-app-name.onrender.com/api/auth/google/callback`).
- [ ] Update your Frontend API base URL to point to the Render domain instead of `localhost:8000`.
- [ ] (If using frontend cookies) Ensure your FE and BE domains are correctly configured for cross-origin cookies. Since they will likely be on different domains (e.g., Render vs Vercel), your cookie settings might need adjusting:
    - `sameSite: "none"`
    - `secure: true` (Render provides HTTPS, so this is fine)
    - **Note**: Third-party cookies (sameSite: "none") are being phased out by some browsers. The most robust setup for production is hosting FE and BE on the same domain (or a subdomain, e.g., `api.yourdomain.com` and `yourdomain.com`).
