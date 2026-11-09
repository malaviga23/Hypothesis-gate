# Hypothesis Gate — Research Idea Validation & Mentor Collaboration Platform

> **A Complete College Mini Project in Full-Stack Web Development, Academic Validation, and Research Mentorship Systems.**

---

## 1. Project Overview

**Hypothesis Gate** is an innovative platform designed for college engineering and research students. It bridges the gap between raw project proposals and rigorous, publication-grade academic research by providing:
1. **Academic Literature Grounding:** Live search of peer-reviewed papers via the **OpenAlex API** with automatic inverted-index abstract reconstruction and keyword overlap comparisons.
2. **Explainable Evidence Validation:** A transparent **5-dimension rules-based scoring rubric** evaluating *Problem Clarity*, *Research Support*, *Potential Originality*, *Technical Feasibility*, and *Testability*.
3. **Project-Based Mentor Matching:** A weighted multi-parameter recommendation algorithm (Domain 30%, Skills 25%, Interests 20%, Experience 15%, Availability 10%) with capacity safeguards.
4. **Faculty Evaluation Console:** Formal review workflows where faculty mentors critique student ideas, request revisions, and approve proposals to advance.
5. **Hypothesis Laboratory:** A workspace to formulate falsifiable claims, record experimental procedures, benchmark numerical data (visualized with **Recharts**), and log empirical conclusions.
6. **Immutable Version Lineage:** Automated version snapshots on meaningful revisions with side-by-side diff comparisons.
7. **Official PDF Dossier Export:** Server-side PDF generation producing clean, table-formatted capstone dossiers with page numbering, literature citations, and mentor sign-offs.

---

## 2. Technology Stack

- **Frontend:**
  - React.js 18 + Vite
  - JavaScript (ES Modules)
  - Tailwind CSS (Frost-white, Charcoal, Brand Blue & Accent Violet palette)
  - React Router DOM v6
  - Lucide React Icons
  - Recharts (Quantitative experimental curves)
- **Backend:**
  - Node.js & Express.js
  - MySQL with `mysql2/promise` (Parameterized SQL queries, transactions)
  - JSON Web Tokens (JWT) & `bcryptjs`
  - PDFKit (Clean server-side streaming PDF generation)
- **External Integration:**
  - **OpenAlex REST API** (`https://api.openalex.org/works`) — 100% free academic literature search with graceful fallback.

---

## 3. Directory Structure

```text
hypothesis_gate/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js     # JWT register & login
│   │   │   ├── projectController.js  # Project CRUD & versioning
│   │   │   ├── researchController.js # OpenAlex search & comparison
│   │   │   ├── validationController.js# 5-dimension rubric execution
│   │   │   ├── mentorController.js   # Matching & review actions
│   │   │   ├── hypothesisController.js# Hypothesis & experiment lab
│   │   │   ├── versionController.js  # Version lineage & snapshot
│   │   │   └── reportController.js   # Dossier data & PDF streaming
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # Role verification (student/mentor)
│   │   ├── routes/                   # Clean Express routes
│   │   ├── services/
│   │   │   ├── openAlexService.js    # OpenAlex API & text similarity
│   │   │   ├── validationService.js  # Explainable 5-dimension rubric
│   │   │   ├── matchingService.js    # Weighted mentor matching algorithm
│   │   │   └── pdfService.js         # PDFKit report generator
│   │   └── server.js                 # Express app & route mounting
│   ├── database.sql                  # Complete normalized MySQL schema
│   ├── initDb.js                     # Interactive DB initialization & password prompt
│   ├── seed.js                       # Realistic demo students, faculty, and experiments
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/common/        # Navbar, Sidebar, WorkflowProgress, Card, Badge, Modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication & role state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Public landing page with demo quick-fills
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── student/              # 10 student workflow pages
│   │   │   └── mentor/               # 5 faculty mentor pages
│   │   ├── services/
│   │   │   └── api.js                # Centralized API client
│   │   ├── App.jsx                   # Role-protected routes
│   │   └── index.css                 # Tailwind directives
│   ├── vite.config.js                # Port 5173 + /api proxy to 5000
│   └── tailwind.config.js
└── package.json                      # Root workspace scripts
```

---

## 4. Database Setup & Windows Instructions

### Prerequisites
- Node.js installed (v18+)
- MySQL Server installed and running (e.g. the standard `MySQL80` Windows service on port 3306)

### Step 1: Initialize Database & Seed Demo Data
Open PowerShell or Command Prompt in the `hypothesis_gate` directory and run:

```bash
npm run db:init
```

1. When prompted:
   ```text
   Enter MySQL root password (press Enter if no password):
   ```
   **Type your MySQL root password directly into the terminal.**
2. The setup script will:
   - Connect to your existing MySQL installation.
   - Automatically create the database `hypothesis_gate`.
   - Execute all tables and indexes from `database.sql`.
   - Seed realistic demo accounts, sample projects, OpenAlex citations, and validation scores from `seed.js`.
   - Automatically write your verified password into `backend/.env`.

> **Note:** If connection fails, the script displays the exact error code (e.g. `ER_ACCESS_DENIED_ERROR` or `ECONNREFUSED`) along with troubleshooting tips.

---

### Step 2: Start the Backend Server
In the terminal, run:
```bash
npm run server
```
The backend API server will start at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

---

### Step 3: Start the Frontend Application
In a second terminal window, run:
```bash
npm run client
```
The React + Vite frontend will launch at: **`http://localhost:5173`**

---

## 5. Demo Credentials

The database comes pre-seeded with sample users for testing and project reviews:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@hypothesisgate.edu` | `student123` | **Aarav Sharma** (Healthcare AI & FL Project) |
| **Mentor 1** | `mentor@hypothesisgate.edu` | `mentor123` | **Dr. Sarah Jenkins** (AI & Biomedical Informatics) |
| **Mentor 2** | `aravind@hypothesisgate.edu` | `mentor123` | **Prof. Aravind Swaminathan** (Distributed Systems & Edge) |

*Tip: On the Login page and Landing page, one-click quick fill buttons automatically populate these credentials.*

---

## 6. End-to-End Workflow Stages

1. **Idea Submission:** Students formulate a problem statement, existing system limitations, proposed architecture, objectives, and initial hypotheses.
2. **Research Analysis:** The platform connects to the **OpenAlex API** to search real literature. A keyword overlap algorithm computes similarities, differences, and questions requiring further research.
3. **Evidence Validation:** An explainable 5-dimension rubric scores Problem Clarity, Research Support, Potential Originality, Technical Feasibility, and Testability.
4. **Mentor Matching:** Faculty advisors are recommended using a weighted matching algorithm:
   $$\text{Score} = 0.30 \times \text{Domain} + 0.25 \times \text{Skills} + 0.20 \times \text{Interests} + 0.15 \times \text{Experience} + 0.10 \times \text{Availability}$$
5. **Mentor Review:** Faculty mentors review student proposals, validation results, and literature citations. They can Approve, Request Revisions, or Reject with guidance notes.
6. **Hypothesis Lab:** Students formulate falsifiable hypotheses, log experimental procedures, and plot quantitative benchmarks using **Recharts**. Mentors can review individual experiment outcomes.
7. **Version History:** Any meaningful edit creates an immutable version snapshot with side-by-side comparison diffs.
8. **Final Dossier Export:** Generates an official, publication-formatted academic PDF report using PDFKit.
