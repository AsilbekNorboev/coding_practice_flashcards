# CodePath Flashcards

Currently this web application has these abilities:
- Pick a number of questions to do, having the option to choose, ranging from any unit and difficulty
- Python syntax highlighting for quick coding in the website, and indenting using CodeMirror
- Hints & Solutions: Toggleable hints and model solutions.
- Navigation Controls: Prev/Next buttons and card index.
- Copied the Codepath Styling for easier reading and understanding
- implemented the SM-2 Algorithm so cards you struggle with reappear sooner, while the ones you know well get pushed farther out.
- Added Analytics: Review Quality Distribution, # of Reviews in the Last 7 days, and Per-Unit Progress(attempted/not attempted per unit). All of these are visual charts
## WIP(WORK IN PROGRESS)

Stuff I am working on
- add a daily tracker, to keep track of what days I worked on learning
- also track which questions i have done, so add a button 'completed', which adds to this list(keep count how many times i have done it also)

What ChatGPT recommended:

Persist State in LocalStorage
• Save your userCode, review dates, and performance metrics in localStorage so your progress carries over between visits.

Interactive Test Cases
• Let you run your code against pre-defined test cases right in the browser. You could use a lightweight Python interpreter in JS (like Pyodide) or send snippets to a backend.

Gamification Elements
• Give yourself points, badges, or “streak” counters for daily practice.
• Leaderboards (even if it’s just you vs. you) can be surprisingly motivating.

Theming & Accessibility
• Dark mode, adjustable font sizes, and high-contrast themes to reduce eye strain during long study sessions.
• Keyboard shortcuts for “next,” “hint,” and “show solution” to keep your hands on the keys.

Audio Narration
• Use the Web Speech API to read the question prompt aloud—great for auditory learners.


## 🚀 Quick Start

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd flashcards-vite
   ```

2. **Install dependencies**

   ```bash
   npm install
   # If using CodeMirror features:
   npm install @uiw/react-codemirror @codemirror/lang-python react-markdown
   ```

3. **Configure Tailwind**

   * Ensure `tailwind.config.cjs` at project root:

     ```js
     /** @type {import('tailwindcss').Config} */
     module.exports = {
       content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
       theme: { extend: {} },
       plugins: [],
     }
     ```
   * Ensure `postcss.config.cjs` at project root:

     ```js
     module.exports = {
       plugins: {
         '@tailwindcss/postcss': {},
         autoprefixer: {},
       },
     }
     ```

4. **CSS Entry** (`src/index.css`)

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   html, body, #root { height: 100%; margin: 0; padding: 0; }
   body { display: grid; place-items: center; background-color: #f3f4f6; }
   ```

5. **React Entry** (`src/main.jsx`)

   ```jsx
   import './index.css';
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import App from './App';

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode><App /></React.StrictMode>
   );
   ```

6. **Run Dev Server**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173` in your browser.

---

## 🗂️ Project Structure

```
flashcards-vite/
├─ index.html                 # Root HTML
├─ package.json
├─ tailwind.config.cjs        # Tailwind setup
├─ postcss.config.cjs         # PostCSS setup
├─ src/
│  ├─ index.css               # Tailwind directives & resets
│  ├─ main.jsx                # React entry import index.css + App
│  ├─ App.jsx                 # Deck state & renders ConfigForm or Flashcard
│  ├─ data/
│  │   └─ flashcards.json     # Array of card objects with questionText, hints[], solutionCode
│  ├─ components/
│  │   ├─ ConfigForm.jsx      # Setup form (count, units, difficulty)
│  │   └─ Flashcard.jsx       # Renders question, hints, CodeMirror editor, solution, nav
└─ README.md                  # This file
```

---

## 🔧 Adding Flashcards

Edit `src/data/flashcards.json`. Each card object:

````jsonc
{
  "id": 1,
  "unit": "Topic Name",
  "difficulty": "standard" | "advanced",
  "questionText": "Your question text here.",
  "hints": ["Hint 1","Hint 2",...],
  "solutionCode": "```python\n# Your solution code block\n```"
}
````

---

## 🎨 Customization

* **Styling:** If Tailwind isn’t picking up, fallback inline styles are in `Flashcard.jsx`.
* **Code Editor:** CodeMirror is configured for Python. Add extensions or themes via `extensions` prop.
* **State Persistence:** Enhance by saving `userCode` or progress to `localStorage`.
* **Additional Features:** Implement code execution sandbox, scoring summary, or deck import/export.

---

## 🤝 Contributing

1. Fork and clone the repo.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit and push: `git commit -am 'Add YourFeature' && git push origin feature/YourFeature`.
4. Open a Pull Request.

---
