# 🎓 EduFly — AI-Enhanced LMS Prototype

EduFly is a cutting-edge Learning Management System prototype that integrates AI-powered content generation. Built with Next.js, Prisma, and Gemini AI, it enables educators to create rich, interactive lessons enhanced by smart automation — all while staying developer-friendly and fast.

---

## ✨ Key Features

- 🧠 **AI Integration**: Auto-generate lesson content using Gemini AI.
- 📖 **Lesson Builder**: Create structured lessons with metadata and Markdown support.
- 📊 **Dashboard UI**: A responsive, modern dashboard using Shadcn UI + TailwindCSS.
- 📤 **File Uploads**: Upload images or media via UploadThing + Cloudflare R2.
- 🔒 **Pluggable Auth**: Plug-and-play auth system with GitHub/Google OAuth support.

---

## 📸 Preview
![Edufly Branding](https://github.com/yas1nshah/edufly/raw/master/app/opengraph-image.jpg)

---

## ⚙️ Tech Stack

- **Frontend**: Next.js App Router, TailwindCSS, Shadcn UI
- **Backend**: Prisma + MySQL
- **AI**: Gemini API (Google Generative AI)
- **Storage**: Cloudflare R2 via UploadThing
- **Auth**: Better Auth (custom, Clerk-style)

---

## 🧪 .env Example

Here’s the required `.env` configuration for development:

```env
# Gemini AI
GEMINI_API_KEY=

# MySQL DB
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# R2 Cloudflare
R2_ENDPOINT=
R2_BUCKET=
R2_ACCESS_KEY=
R2_SECRET_KEY=
R2_PUBLIC_HOST=
````

---

## 🛠 Getting Started

Clone the repo and run the following:

```bash
git clone https://github.com/yas1nshah/edufly.git
cd edufly
npm install
```

Push the DB schema:

```bash
npx prisma db push dev
```

Start the dev server:

```bash
npm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧱 Project Structure

```
app/             → App Router pages & layouts
components/      → Reusable UI components
lib/             → Utility functions ( R2, etc.)
prisma/          → Prisma schema
public/          → Static files (images, previews)
```

---

## 🧠 AI Usage

EduFly uses Gemini AI for:

* Generating lesson outlines and summaries
* Answer suggestions (in-progress)

Implemented in: `lib/ai/gemini.ts`

---

## 📦 R2 Integration

File uploads (images/media) are securely handled via Pre-Signed URLs and stored in your Cloudflare R2 bucket.

---

## 📌 TODO / WIP

* ✅ AI lesson generation
* ✅ Quizzes via AI
* ⏳ Class/course grouping
* ⏳ User + role-based access system

---

## 🤝 Contributing

Pull requests and contributions are welcome!

1. Fork this repo
2. Create a new branch
3. Commit your changes
4. Open a PR with a clear description

---

## 🔒 License

MIT © 2025 [Yasin Shah](https://github.com/yas1nshah)

---

## 🌐 Follow the Creator

* GitHub: [@yas1nshah](https://github.com/yas1nshah)
* Twitter: [@yas1nshah](https://twitter.com/yas1nshah)
* Company: [Uraan Studios](https://uraanstudios.com)

> Built with ❤️ by Uraan Studios to modernize education through AI.

```
