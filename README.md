# 🚀 AI Social Media Content Studio

A full-stack AI-powered platform to **create, manage, and schedule social media content** across multiple platforms — all in one place.

Built with **React, Node.js, MongoDB**, and **free AI APIs (OpenRouter / Hugging Face)**.

---

## ✨ Features

### 🧠 AI Content Generation

* Generate captions, posts, and scripts
* Platform-specific outputs (Instagram, LinkedIn, YouTube, etc.)
* Smart response modes:

  * Chat mode → natural conversation
  * Content mode → structured output

---

### 🤖 AI Chatbot

* Context-aware assistant
* Chat history support
* Clickable conversations
* Delete individual or all chats

---

### 🎨 Image & Thumbnail Generator

* Generate images in multiple ratios:

  * Reels (9:16)
  * Square (1:1)
  * Landscape (16:9)
  * YouTube Thumbnails
* Gallery with:

  * Drag & drop reordering
  * Filters (All / Reels / Thumbnails etc.)
  * Favorites system
  * Hover preview + full-screen modal
  * Download support

---

### 🗂️ Smart Image Management

* Single source of truth architecture
* Consistent ordering across filters
* Cloud upload support (Cloudinary)
* No local storage limitations

---

### 📅 Scheduler

* Schedule posts for future publishing
* Draft system (save & reuse content)
* Dashboard pipeline view

---

### 📊 Dashboard Analytics

* Total posts, scheduled posts, engagement
* Clean UI with dark/light mode support

---

### 👤 Authentication & Profile

* Sign up / login
* Avatar upload
* Edit display name

---

### 🎬 Multi-Platform Support

* Instagram
* LinkedIn
* Twitter / X
* YouTube (title, description, thumbnail support)

---

## 🧱 Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS

**Backend**

* Node.js + Express
* MongoDB (Atlas / Local)

**AI**

* OpenRouter (free LLMs)
* Hugging Face APIs

**Media Storage**

* Cloudinary

---

## ⚙️ Setup

### 1. Clone repo

```bash
git clone <your-repo-url>
cd studio
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 3. Backend

```bash
cd backend
npm install
npm run dev
```

---

### 4. Environment Variables

Configure:

* MongoDB URI
* OpenRouter API key
* Hugging Face API key
* Cloudinary credentials

---

## 🧠 Key Engineering Highlights

* Clean MVC backend architecture
* AI provider abstraction (easy swap)
* Single source of truth state management (no UI desync bugs)
* Advanced UX (modal system, drag-drop, filters)
* Scalable multi-platform content system

---

## 📸 Screenshots

*Add your UI screenshots here*

---

## 🚧 Future Improvements

* Auto-posting to social platforms
* AI-powered analytics insights
* Collaboration features
* Mobile optimization

---

## 👨‍💻 Author

Divyansh Chandrakar
B.Tech CSE | AI + Full Stack Developer

---

## ⭐ If you like this project

Give it a star and feel free to contribute!
