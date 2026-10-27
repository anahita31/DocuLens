
# 🛡️ DocuLens
### AI-Powered Document Authentication and Regulatory Compliance Engine

> **Smart India Hackathon (SIH 2026) Submission** | Team Codexiaa

---

## 🚀 Overview

**DocuLens** is an AI-powered document verification and regulatory compliance system designed to simplify institutional inspections. It helps reviewers analyze uploaded PDF documents, identify duplicate files, extract relevant information, detect inconsistencies, and prioritize applications for further review.

The system combines PDF processing, document metadata inspection, SHA-256 hashing, consistency checks, regulatory rule retrieval, and risk scoring to support evidence-based compliance decisions.

## ✨ Key Features

- 🔍 **PDF Document Verification:** Accepts PDF uploads and processes them through a document verification pipeline.
- 🔐 **SHA-256 File Integrity Checks:** Generates file hashes to identify identical documents and detect duplicate submissions.
- 📄 **Metadata Inspection:** Examines available PDF metadata for potential anomalies.
- 🤖 **Text Extraction & Field Parsing:** Extracts document text and relevant fields for further analysis.
- 🔎 **Consistency Checking:** Compares extracted information with declared institutional details to identify discrepancies.
- ⚖️ **Risk Scoring:** Assigns risk scores and flags potential issues for human review.
- 📚 **AICTE Regulatory Rule Querying:** Provides a regulatory question-answering endpoint using the configured APH rule knowledge base.
- 📋 **Application Tracking:** Stores application information, uploaded document records, statuses, and audit logs.
- 📝 **Audit Trail:** Records important application and document verification events.

> **Note:** Automated checks identify potential anomalies; they do not independently prove that a document is forged or fraudulent. Final decisions require appropriate human verification.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React-based frontend project |
| Backend API | Python, FastAPI |
| Database Layer | SQLAlchemy |
| Database | SQLite database file included in the repository |
| PDF Processing | pypdf |
| File Integrity | SHA-256 hashing |
| Matching & Validation | RapidFuzz, rule-based consistency checks |
| Data Validation | Pydantic |
| API Server | Uvicorn |
| File Uploads | FastAPI UploadFile and python-multipart |

---

## 🔄 Application Workflow

1. **Document Upload:** The institution submits a PDF along with an application code and relevant declared information.
2. **Input Validation:** The backend checks that the uploaded file is not empty, exceeds no configured size limit, and has a PDF signature.
3. **Duplicate Detection:** The system computes a SHA-256 hash and checks for previously submitted identical files.
4. **Metadata Inspection:** Available PDF metadata is inspected for potential anomalies.
5. **Text Extraction:** The document processing module extracts text and attempts to parse relevant fields.
6. **Consistency Checks:** Extracted information is compared with declared institutional information.
7. **Risk Assessment:** Detected issues are evaluated by the risk scoring module.
8. **Database Storage:** Application details, document records, statuses, and audit events are stored.
9. **Regulatory Queries:** Users can submit questions to the configured APH regulatory rule knowledge base.
10. **Human Review:** Flagged applications can be examined by authorized reviewers before any final decision.

---

## 🏗️ Project Structure

The repository contains the following top-level files and directories:

```text
DocuLens/
├── main.py
├── database.py
├── requirements.txt
├── aicte_verification.db
├── services/
│   ├── cross_checker.py
│   ├── forensics.py
│   ├── llm_rag_engine.py
│   ├── ocr_engine.py
│   └── risk_calculator.py
├── doculens-frontend-main/
│   └── ...
└── README.md
```

The frontend directory's internal structure should be documented according to its actual files.

---

## 🚀 Getting Started Locally

### Prerequisites

Install the following:

- Python 3.9 or later
- Git
- Node.js and npm for frontend development

### 1. Clone the Repository

```bash
git clone https://github.com/anahita31/DocuLens.git
cd DocuLens
```

### 2. Set Up the Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate it.

**Windows:**

```bash
venv\Scripts\activate
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### 3. Start the Backend Server

Run the following command from the repository root:

```bash
uvicorn main:app --reload
```

The API should be available at:

- **API base URL:** http://127.0.0.1:8000
- **Interactive API documentation:** http://127.0.0.1:8000/docs
- **Health check:** http://127.0.0.1:8000/health

### 4. Run the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd doculens-frontend-main
```

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

These commands assume the frontend directory contains a `package.json` with a `dev` script. Use the scripts defined in that file if they differ.

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Checks backend availability |
| POST | `/api/upload-and-verify` | Uploads and verifies a PDF |
| POST | `/api/query-aph-rule` | Queries the APH regulatory knowledge base |
| GET | `/api/application/{application_code}` | Retrieves application details and audit history |
| GET | `/api/applications` | Lists stored applications |
| POST | `/api/register` | Accepts institution registration information |

For request parameters, response schemas, and testing, open the interactive API documentation at `/docs` after starting the backend.

---

## 🔒 Security & Reliability

- **File Size Validation:** Limits PDF uploads using the configured `MAX_UPLOAD_MB` setting.
- **PDF Signature Validation:** Rejects uploads that do not have a PDF file signature.
- **SHA-256 Hashing:** Supports exact-file duplicate detection.
- **Structured Validation:** Uses Pydantic models and request validation.
- **Audit Logging:** Records important verification and application events.
- **Human-in-the-Loop Review:** Keeps flagged cases available for further review rather than automatically treating them as confirmed fraud.

**Security considerations:**

- The current backend code does not implement authentication for protected API access. Do not expose it publicly without adding appropriate authentication and authorization.
- Configure CORS with trusted frontend origins before deployment.
- Protect institutional records and database files from unauthorized access.
- Keep dependencies updated and avoid committing sensitive data.

---

## 🎯 Expected Impact

- Reduce repetitive manual document checking.
- Improve consistency in institutional compliance workflows.
- Identify duplicate submissions and potential data discrepancies.
- Help reviewers prioritize documents requiring further examination.
- Maintain a traceable record of verification activities.

---

## 🤖 Future Roadmap

- [ ] Improved OCR support for low-quality scanned documents.
- [ ] Enhanced document comparison and suspicious-region visualization.
- [ ] Advanced faculty and land-record cross-matching.
- [ ] Reviewer dashboard with detailed risk summaries.
- [ ] Downloadable audit reports in PDF format.
- [ ] Role-based access control and secure authentication.
- [ ] Telegram notifications for document status updates.
- [ ] Secure cloud deployment.
- [ ] Integration with authorized regulatory data sources.
- [ ] Expanded testing and validation of document verification rules.

---

## 👥 Team Codexiaa

Developed for **Smart India Hackathon (SIH 2026)**.

| S. No. | Team Member | Role |
|---:|---|---|
| 1 | Ava Acharya | Team Lead, Project Coordinator & Backend Developer |
| 2 | Anahita Singh | AI/ML Developer |
| 3 | Ritul Kumari | Frontend Developer & UI/UX Designer |
| 4 | Mayukhi Sharma | Document Verification & Compliance Analyst |

**Team Name:** Codexiaa  
**Project Name:** DocuLens  
**Event:** Smart India Hackathon (SIH) 2026

---

## 📄 License

This project was developed as a submission for **Smart India Hackathon (SIH 2026)** by Team Codexiaa.

Add an appropriate license file if you intend to distribute the project as open-source software.

---

⭐ If you find this project useful, consider giving the repository a star!
