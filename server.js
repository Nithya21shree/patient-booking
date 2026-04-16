const express = require('express');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

/* 🔥 IMPORTANT: Serve all HTML/CSS/JS files, but ignore dotfiles like .env */
app.use(express.static(__dirname, { dotfiles: 'ignore' }));

/* Load Excel dataset */
const workbook = xlsx.readFile('hospital_demo_manual.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const hospitals = xlsx.utils.sheet_to_json(sheet);

/* Normalize department names */
function normalizeDept(dept) {
  if (!dept) return "";
  const d = dept.toLowerCase().trim();

  if (["gynecology","gynaecology","obstetrics & gynecology","obstetrics"].includes(d)) return "gynaecology";
  if (["ortho","orthopaedics","orthopedics"].includes(d)) return "orthopaedics";
  if (["ent","ear nose throat"].includes(d)) return "ent";
  if (["general medicine","general"].includes(d)) return "general medicine";
  if (["pediatrics","paediatrics"].includes(d)) return "pediatrics";
  if (["dermatology","skin"].includes(d)) return "dermatology";
  if (["cardiology","heart"].includes(d)) return "cardiology";
  if (["neurology","brain"].includes(d)) return "neurology";
  if (["urology","urinary"].includes(d)) return "urology";
  if (["gastroenterology","gastro"].includes(d)) return "gastroenterology";
  if (["oncology","cancer"].includes(d)) return "oncology";
  if (["pulmonology","lungs"].includes(d)) return "pulmonology";
  if (["ophthalmology","eye"].includes(d)) return "ophthalmology";
  if (["psychiatry","mental health"].includes(d)) return "psychiatry";
  if (["neonatology","newborn"].includes(d)) return "neonatology";
  if (["dental","dentistry","dental care"].includes(d)) return "dental care";
  if (["physician","general physician"].includes(d)) return "physician";
  if (["emergency","casualty"].includes(d)) return "emergency";

  return d;
}

/* 🔥 DEFAULT ROUTE (VERY IMPORTANT) */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // first page
});

/* API endpoint */
app.get('/api/hospitals', (req, res) => {
    const dept = req.query.department;

    if (dept) {
        const filtered = hospitals.filter(h =>
            normalizeDept(h.department) === normalizeDept(dept)
        );
        res.json(filtered);
    } else {
        res.json(hospitals);
    }
});

/* Serve Firebase config from env */
app.get('/config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.send(`window.firebaseConfig = ${JSON.stringify({
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
    })};`);
});

/* Start server */
app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});