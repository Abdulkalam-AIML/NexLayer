# NexLayer

NexLayer is a modern, futuristic website and student support platform built with React, Tailwind CSS, and Firebase.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173` (or the port shown in terminal).

## 🛠 Firebase Setup

This project uses Firebase for Authentication and Firestore Database.

1.  **Create a Firebase Project** at [console.firebase.google.com](https://console.firebase.google.com/).
2.  **Enable Authentication:**
    - Go to Build > Authentication.
    - Enable **Email/Password** provider.
    - Add your first user (this will be the CEO/Admin).
3.  **Enable Firestore Database:**
    - Go to Build > Firestore Database.
    - Create a database (Start in **Test Mode** for development).
4.  **Set User Role (Crucial for Dashboard):**
    - Go to your Firestore Database.
    - Create a collection named `users`.
    - Add a document where the **Document ID** is the `UID` of the user you created in Auth.
    - Add fields:
        - `email`: (matches the user email)
        - `role`: "CEO" (or "Member")
        - `name`: "Your Name"

## 📂 Project Structure

- `src/components`: Reusable UI components (LoadingScreen, ServiceModal).
- `src/sections`: Landing page sections (Hero, About, Services, Team, Pricing, Contact).
- `src/pages`: Main pages (Home, Login, Dashboard).
- `src/lib`: Firebase configuration.
- `src/assets`: Images and static assets.

## 🎨 Customization

- **Tailwind Config:** `tailwind.config.js` contains the custom neon colors and fonts.
- **Global Styles:** `src/index.css` contains glassmorphism and animation utilities.

## 📦 Build

To create a production build:

```bash
npm run build
```
