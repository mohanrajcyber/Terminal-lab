# EduShell OS — Cyber Security Learning Platform

**Created by [Mohan Raj](https://github.com/mohanrajcyber)** — Cyber Security Analyst / AI·ML

A full browser-based desktop OS simulator for college students. Learn Linux & Windows commands, cyber security tools, CTF challenges, and interactive games — no install required.

**Live demo:** After GitHub Pages setup → `https://mohanrajcyber.github.io/Terminal-lab/`

---

## Quick Start (Students)

1. Open in **Chrome, Edge, or Firefox** (phone or computer)
2. Or run locally:

```bash
python -m http.server 8080
# Visit http://localhost:8080
```

3. Wait for **4-second boot splash**, then explore the desktop!

> **Mobile:** Works on phone — tap icons, terminal opens at bottom. Rotate to landscape for more space.

---

## Features

### Desktop OS
- Boot splash with animated intro
- Desktop icons by category (Security, Learning, Games, System…)
- Floating terminal windows (drag, resize, minimize)
- Start Menu, taskbar, notifications, themes & wallpapers
- Settings, File Manager, Recycle Bin

### Terminal
- **Linux (bash)** and **Windows (CMD)** modes
- 40+ commands + virtual filesystem
- History (↑↓), Tab autocomplete, Ctrl+L, Ctrl+C

### Security Tools (Simulated — safe for learning)
- Web Hunter, Msg Guard, Hash Checker, Email Scanner
- Pass Shield, IP Lookup, Port Scanner, SQL/XSS Tester
- USB Scanner, Ransomware Sim, Firewall, Dark Web Check
- Report Export

### Student Learning
- Learn OS tutorials, Flashcards, Command of the Day
- Cheat Sheet, Practice Mode, **Quiz Game**
- **CTF Lab** — 6 capture-the-flag challenges
- **My Progress** — track tools, scores, level
- **Leaderboard** — local top scores
- **Help Guide** — press `?` anytime
- **Security Demos** — phishing & dark web awareness

### EduBot AI Chat
- **Offline mode (default)** — works for ALL students, no API key
- Tamil + English natural conversation
- Cyber security tutor personality
- Optional **Groq API** (free) — enter key in Settings only
- Optional **Ollama local** — run on your PC

```
chat          → start EduBot conversation
exit          → leave chat (inside chat mode)
```

**Settings → EduBot AI Mode:**
| Mode | Who needs it |
|------|-------------|
| Offline | All students (GitHub Pages) |
| Groq API | You — free key at console.groq.com |
| Ollama | Local PC with Ollama installed |

> ⚠ **Never put API keys in GitHub!** Use Settings UI — saved in browser only.

---

### Fun & Games
- Opens in **dedicated game terminal**
- Snake, Hangman, Typing Test, Matrix Rain, Clock, Timer

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `?` | Open Help Guide |
| `Enter` | Run command |
| `↑` / `↓` | Command history |
| `Tab` | Autocomplete |
| `Ctrl+L` | Clear screen |
| `Ctrl+C` | Cancel / quit game |
| `F11` | Fullscreen |

---

## CTF Lab (Capture The Flag)

Type `ctf` in terminal or click **CTF Lab** icon.

| # | Challenge | Hint |
|---|-----------|------|
| 1 | Hidden Flag File | `cat secret.txt` |
| 2 | Base64 Decode | `base64 decode ...` |
| 3 | Phishing Detective | Which email is fake? |
| 4 | Firewall Defender | `firewall block 445` |
| 5 | Hash Master | `hashcheck cyber` |
| 6 | Linux Navigator | Answer: `ls` |

Submit flags like: `EDU{hidden_flag_2024}`

---

## For Teachers

### Recommended 6-Week Syllabus

| Week | Topic | EduShell Activities |
|------|-------|---------------------|
| 1 | Linux basics | `learn`, `practice`, `ls cd cat mkdir` |
| 2 | Windows CMD | Switch mode, `dir type md` |
| 3 | Files & scripting | File Manager, `run`, `tree grep` |
| 4 | Cyber security intro | Security Demos, Web Hunter, Msg Guard |
| 5 | Hands-on security | USB scan, Firewall, Pass Shield, CTF 1-3 |
| 6 | Assessment | Quiz Game, CTF 4-6, Leaderboard review |

### Lab Exercises
1. Create folder structure in File Manager, delete to Recycle Bin, restore
2. Scan a sample URL with Web Hunter — export report
3. Complete all 6 CTF flags
4. Score 80%+ on Quiz Game
5. Watch Security Demos — identify 3 phishing red flags

### Assessment Ideas
- Progress tracker level (Beginner → Expert)
- CTF flags captured (6 total)
- Quiz best score %
- Written: explain phishing vs legitimate email

### Classroom Tips
- Share GitHub Pages link — students need only a browser
- Works on mobile for homework
- All data is **local** (localStorage) — no server needed
- Tools are **simulated** — safe for classroom

---

## GitHub Pages Deploy

1. Push repo to GitHub (`main` branch)
2. Go to **Settings → Pages → Source: GitHub Actions**
3. Push triggers auto-deploy via `.github/workflows/pages.yml`
4. Share URL with students

---

## Project Structure

```
Terminal/
├── index.html              # Main app
├── favicon.svg
├── css/terminal.css        # All styles + mobile
├── js/
│   ├── main.js             # Core orchestration
│   ├── boot.js             # Boot splash
│   ├── games.js            # Game logic
│   ├── game-terminal.js    # Game windows
│   ├── ctf.js              # CTF challenges
│   ├── progress.js         # Student progress
│   ├── leaderboard.js      # Scores
│   ├── tutorial.js         # First-time tour + help
│   ├── security-demos.js   # Phishing/dark web demos
│   ├── os-apps.js          # Settings, File Manager…
│   ├── features/           # Tool commands & registry
│   └── commands/           # Linux & Windows shells
└── .github/workflows/      # GitHub Pages CI
```

---

## Extending (For Advanced Students)

Add custom commands in `js/features/commands.js` and register in `js/features/registry.js`.

---

## Credits

**Mohan Raj** — Cyber Security Analyst / AI·ML  
Built for educational use in colleges and cyber security training.

## License

Free for educational use. © Mohan Raj
