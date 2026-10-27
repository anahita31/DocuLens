🛡️ DocuLens: AI-Powered Document Authentication and Regulatory Compliance Engine
Smart India Hackathon (SIH 2026) Submission | Team: Codexiaa
🚀 Overview

DocuLens is an AI-powered document authentication and regulatory compliance engine designed to reduce manual verification bottlenecks, detect potential document forgery, identify ghost faculty, and uncover data discrepancies during institutional inspections.

The platform streamlines institutional verification by analyzing documents, extracting relevant information, checking compliance with configured AICTE norms, and flagging potential violations for human review.

✨ Key Features
🔍 Automated Document Authentication: Processes PDFs, land deeds, and scanned certificates to identify suspicious seals, altered dates, duplicate documents, and potential signs of tampering.
👥 Ghost Faculty & Land Claim Detection: Cross-matches faculty names and relevant records to identify duplicate entries, overlapping faculty appointments, and potential land claim discrepancies.
🤖 Intelligent Parsing & Validation: Extracts information from tables and scanned documents, including room sizes, validity dates, and faculty details, and checks them against configured AICTE compliance rules.
📝 Official Notice & Audit Generation: Generates structured audit reports highlighting potential rule violations and helps prepare official notices for review.
⚖️ Reviewer Proof Visualizer: Highlights suspicious regions and compliance issues directly on document pages, helping reviewers locate evidence quickly.
🔐 Document Integrity Verification: Uses SHA-256 hashing to identify identical files and support document integrity checks.
📊 Compliance Dashboard: Provides reviewers with a centralized view of document status, risk scores, and potential compliance gaps.
🛠️ Tech Stack
Component	Technology
Frontend	React.js, Tailwind CSS
Backend	Python, FastAPI / Node.js REST APIs
Document Processing	PyMuPDF (fitz), PDF parsing libraries
OCR & Text Extraction	OCR tools and text extraction libraries
Security & Hashing	SHA-256
Matching & Analysis	Regular Expressions, Fuzzy Matching
Risk Assessment	Rule-Based Risk Scoring Engine
Database	SQL, SQLAlchemy
Dashboard	AICTE Compliance & Reviewer Dashboard
🔄 Application Workflow
Document Upload: Institutions upload relevant documents, such as land records, safety NOCs, faculty lists, and certificates, through the web interface.
PDF Parsing & Duplicate Detection: The system extracts document text and metadata and uses SHA-256 hashes to identify identical files.
Information Extraction: Relevant fields, including names, dates, document numbers, room dimensions, and faculty details, are extracted from text or OCR output.
Rule-Based Validation: Extracted information is checked against configured compliance rules and applicable regulatory requirements.
Fuzzy Matching & Anomaly Detection: The system identifies potential duplicate records, inconsistent details, suspicious changes, and overlapping appointments.
Risk Scoring: Potential compliance issues are assigned risk levels to help prioritize manual review.
Visual Review: Suspicious text or document regions are highlighted to help reviewers locate supporting evidence.
Audit Report Generation: The system generates a structured report containing detected issues, relevant evidence, and recommended follow-up actions.
🏗️ Project Structure
text
DocuLens/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
├── README.md
└── .gitignore


Note: This is a suggested project structure. Update it to match the actual files and folders in your repository.

🚀 Getting Started Locally
Prerequisites

Make sure the following tools are installed on your system:

Python 3.9 or later
Node.js and npm
Git
1. Clone the Repository
bash
git clone https://github.com/anahita31/DocuLens.git
cd DocuLens

2. Set Up the Backend

Navigate to the backend directory:

bash
cd backend


Create a Python virtual environment:

bash
python -m venv venv


Activate the virtual environment.

Windows:

bash
venv\Scripts\activate


Linux / macOS:

bash
source venv/bin/activate


Install the required dependencies:

bash
pip install -r requirements.txt


Start the backend using the command supported by your application:

bash
python app.py


If your application uses FastAPI with Uvicorn, the startup command may instead be uvicorn app:app --reload, depending on how the application is defined.

3. Set Up the Frontend

Open a new terminal in the project root and navigate to the frontend directory:

bash
cd frontend


Install the dependencies:

bash
npm install


Start the frontend development server:

bash
npm run dev


Open the local URL displayed in your terminal to access the application.

🔒 Security & Reliability
SHA-256 Hashing: Helps identify identical files and verify file integrity.
Input Validation: Validates uploaded files and extracted fields before processing.
Access Control: Supports restricting sensitive documents and review actions to authorized users when authentication is configured.
Evidence-Based Review: Connects detected anomalies to relevant document content wherever possible.
Human-in-the-Loop Verification: Flags potential violations for authorized reviewers instead of treating automated detections as definitive proof of fraud.

Important: SHA-256 hashing can identify identical files, but it cannot independently establish that a document is genuine. OCR, fuzzy matching, and rule-based checks can identify potential anomalies, but suspicious documents require appropriate human verification.

🎯 Expected Impact
Reduce manual document verification effort.
Improve consistency in institutional compliance reviews.
Identify duplicate records and potential discrepancies more efficiently.
Help reviewers locate suspicious document regions quickly.
Improve audit traceability and evidence-based decision-making.
🤖 Future Roadmap
Telegram Bot Integration for document status notifications and compliance alerts.
Secure cloud deployment on suitable government-grade infrastructure.
Advanced OCR support for multilingual and low-quality scanned documents.
Role-Based Access Control (RBAC) for institutions and reviewers.
Downloadable audit reports in PDF format.
Improved duplicate faculty and overlapping appointment detection.
Integration with authorized regulatory data sources, subject to access and approval.
Explainable AI for transparent risk assessments.
Automated document comparison and version tracking.
👥 Team Codexiaa

Meet the team behind DocuLens — AI-Powered Document Authentication and Regulatory Compliance Engine, developed for Smart India Hackathon (SIH) 2026.

S. No.	Team Member	Role
1	Ava Acharya	Team Lead, Project Coordinator & Backend Developer
2	Anahita Singh	AI/ML Developer
3	Ritul Kumari	Frontend Developer & UI/UX Designer
4	Mayukhi Sharma	Document Verification & Compliance Analyst

Team Name: Codexiaa
Project Name: DocuLens
Event: Smart India Hackathon (SIH) 2026

📄 License

This project was developed as a submission for Smart India Hackathon (SIH) 2026 by Team Codexiaa.

A license has not been specified yet. Add an appropriate open-source license, such as MIT, if permitted by your team and project requirements.

⭐ If you find this project useful, consider giving the repository a star!
