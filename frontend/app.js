const API = "http://localhost:3000/api";

/* ================= AUTH ================= */
const user = JSON.parse(localStorage.getItem("user"));
if (!user) location.href = "login.html";

function logout() {
  localStorage.removeItem("user");
  location.href = "login.html";
}

/* ================= DARK MODE ================= */
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
}
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

/* ================= MODAL ================= */
function showModal(title, body) {
  document.getElementById("modal-title").innerText = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("app-modal").classList.remove("hidden");
}
function hideModal() {
  document.getElementById("app-modal").classList.add("hidden");
}

/* ================= HELPERS ================= */
const genId = () => Math.floor(100000 + Math.random() * 900000);

function animateCounter(el, target) {
  if (!el) return;
  let c = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  function tick() {
    c += step;
    if (c >= target) el.innerText = target;
    else {
      el.innerText = c;
      requestAnimationFrame(tick);
    }
  }
  tick();
}

async function apiGet(path) {
  const res = await fetch(`${API}/${path}`);
  const json = await res.json();
  return json.data;
}

async function apiPost(path, body) {
  await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

async function apiPut(path, body) {
  await fetch(`${API}/${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

/* ================= STATS ================= */
async function loadStats() {
  const patients = await apiGet("patients");
  const doctors = await apiGet("doctors");
  const apps = await apiGet("appointments");

  const today = new Date().toISOString().slice(0, 10);

  animateCounter(
    document.getElementById("statPatients"),
    patients.filter(p => p.status !== "Discharged").length
  );
  animateCounter(document.getElementById("statDoctors"), doctors.length);
  animateCounter(
    document.getElementById("statPending"),
    apps.filter(a => a.status === "Pending").length
  );
  animateCounter(
    document.getElementById("statToday"),
    apps.filter(a => a.date === today).length
  );
}

/* ================= NAV ================= */
async function showSection(s) {
  await loadStats();

  if (s === "patients") await renderPatients();
  if (s === "doctors") await renderDoctors();
  if (s === "appointments") await renderBook();
  if (s === "resolve") await renderResolve();
  if (s === "completed") await renderCompleted();
}

/* ================= PATIENTS ================= */
async function renderPatients() {
  document.getElementById("content-title").innerText = "Active Patients";
  const patients = (await apiGet("patients")).filter(p => p.status !== "Discharged");

  document.getElementById("content-body").innerHTML = `
    <button class="btn-primary mb-6" onclick="openPatientForm()">+ Register Patient</button>
    <div class="grid md:grid-cols-3 gap-6">
      ${patients.map(p => `
        <div class="card">
          <h3 class="font-bold">${p.name}</h3>
          <p>ID: ${p.id}</p>
          <p>Disease: ${p.disease}</p>
          <span class="font-semibold">${p.priority}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function openPatientForm() {
  showModal("🧍‍♂️ Register New Patient", `
    <form onsubmit="savePatient(event)" class="space-y-4 bg-blue-50 p-4 rounded-xl">
      <input placeholder="👤 Patient Name" required>
      <input type="number" placeholder="🎂 Age" required>
      <input placeholder="⚧ Gender" required>
      <input placeholder="🦠 Disease" required>
      <input placeholder="📞 Contact" required>
      <button class="btn-primary w-full">➕ Add Patient</button>
    </form>
  `);
}

async function savePatient(e) {
  e.preventDefault();
  const f = e.target;
  const disease = f[3].value;

  await apiPost("patients", {
    id: genId(),
    name: f[0].value,
    age: f[1].value,
    gender: f[2].value,
    disease,
    contact: f[4].value,
    priority: disease.toLowerCase().includes("fever") ? "High" : "Normal",
    status: "Registered"
  });

  hideModal();
  await showSection("patients");
}

/* ================= DOCTORS ================= */
async function renderDoctors() {
  document.getElementById("content-title").innerText = "Doctors";
  const doctors = await apiGet("doctors");

  document.getElementById("content-body").innerHTML = `
    <button class="btn-primary mb-6" onclick="openDoctorForm()">+ Add Doctor</button>
    <div class="grid md:grid-cols-3 gap-6">
      ${doctors.map(d => `
        <div class="card">
          <h3 class="font-bold">Dr. ${d.name}</h3>
          <p>${d.specialization}</p>
          <p>${d.availability}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function openDoctorForm() {
  showModal("🧑‍⚕️ Add Doctor", `
    <form onsubmit="saveDoctor(event)" class="space-y-4 bg-green-50 p-4 rounded-xl">
      <input placeholder="👨‍⚕️ Doctor Name" required>
      <input placeholder="🧠 Specialization" required>
      <input placeholder="⏰ Availability" required>
      <input placeholder="📞 Contact" required>
      <button class="btn-primary w-full">➕ Add Doctor</button>
    </form>
  `);
}

async function saveDoctor(e) {
  e.preventDefault();
  const f = e.target;

  await apiPost("doctors", {
    name: f[0].value,
    specialization: f[1].value,
    availability: f[2].value,
    contact: f[3].value
  });

  hideModal();
  await showSection("doctors");
}

/* ================= BOOK APPOINTMENT ================= */
async function renderBook() {
  document.getElementById("content-title").innerText = "📅 Book Appointment";

  const patients = (await apiGet("patients"))
    .filter(p => p.status !== "Discharged");

  const doctors = await apiGet("doctors");

  document.getElementById("content-body").innerHTML = `
    <div class="max-w-xl mx-auto p-1 rounded-3xl
                bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

      <div class="glass-card p-8 rounded-3xl">

        <h2 class="text-center text-3xl font-extrabold
                   bg-gradient-to-r from-indigo-400 to-pink-400
                   bg-clip-text text-transparent mb-6">
          🏥 Appointment Booking
        </h2>

        <form onsubmit="bookAppointment(event)" class="space-y-5">

          <!-- Patient -->
          <div class="input-group">
            <span class="input-icon">🧍</span>
            <select name="patient_id" required>
              <option value="">Select Patient</option>
              ${patients.map(p => `
                <option value="${p.id}">
                  ${p.priority === "Emergency" ? "🚨 " : ""}
                  ${p.name} (ID: ${p.id})
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Doctor -->
          <div class="input-group">
            <span class="input-icon">🧑‍⚕️</span>
            <select name="doctor_id" required>
              <option value="">Select Doctor</option>
              ${doctors.map(d => `
                <option value="${d.id}">
                  Dr. ${d.name} — ${d.specialization}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Date -->
          <div class="input-group">
            <span class="input-icon">📅</span>
            <input type="date" name="date" required />
          </div>

          <!-- Time -->
          <div class="input-group">
            <span class="input-icon">⏰</span>
            <input type="time" name="time" required />
          </div>

          <button
            type="submit"
            class="w-full mt-4 py-4 rounded-2xl text-lg font-extrabold
                   text-white bg-gradient-to-r from-indigo-600 to-pink-600
                   hover:scale-105 transition-all duration-300
                   shadow-[0_0_30px_rgba(236,72,153,0.8)]">
            ✅ Confirm Appointment
          </button>

        </form>
      </div>
    </div>
  `;
}


async function bookAppointment(e) {
  e.preventDefault();
  const f = e.target;

  await apiPost("appointments", {
    patient_id: f.patient_id.value,
    doctor_id: f.doctor_id.value,
    date: f.date.value,
    time: f.time.value,
    status: "Pending"
  });

  await showSection("resolve");
  await loadCharts(); 
}



/* ================= RESOLVE ================= */
async function renderResolve() {
  document.getElementById("content-title").innerText = "Resolve Appointments";
  const apps = (await apiGet("appointments")).filter(a => a.status === "Pending");

  document.getElementById("content-body").innerHTML = `
    <div class="grid md:grid-cols-2 gap-6">
      ${apps.map(a => `
        <div class="card">
          <p>Patient ID: ${a.patient_id}</p>
          <p>Doctor ID: ${a.doctor_id}</p>
          <p>${a.date} ${a.time}</p>
          <button class="btn-danger" onclick="openResolveForm(${a.id})">Resolve</button>
        </div>
      `).join("")}
    </div>
  `;
}

function openResolveForm(id) {
  showModal("🩺 Resolve Appointment", `
    <form onsubmit="resolveAppointment(event, ${id})"
      class="space-y-5">

      <!-- Diagnosis -->
      <div>
        <label class="block mb-1 text-sm font-semibold text-cyan-300">
          🦠 Diagnosis
        </label>
        <textarea
          name="diagnosis"
          required
          placeholder="Enter diagnosis here..."
          class="w-full h-24 p-3 rounded-xl
                 bg-slate-900 text-white
                 border border-cyan-400/50
                 focus:border-cyan-400
                 focus:ring-2 focus:ring-cyan-400/40
                 outline-none transition"></textarea>
      </div>

      <!-- Treatment -->
      <div>
        <label class="block mb-1 text-sm font-semibold text-emerald-300">
          💊 Treatment / Prescription
        </label>
        <textarea
          name="treatment"
          required
          placeholder="Enter treatment / medicines..."
          class="w-full h-24 p-3 rounded-xl
                 bg-slate-900 text-white
                 border border-emerald-400/50
                 focus:border-emerald-400
                 focus:ring-2 focus:ring-emerald-400/40
                 outline-none transition"></textarea>
      </div>

      <button
        class="w-full py-3 rounded-xl font-bold text-white
               bg-gradient-to-r from-red-500 to-rose-600
               hover:scale-105 hover:shadow-xl transition">
        ✅ Resolve & Discharge
      </button>
    </form>
  `);
}


async function resolveAppointment(e, id) {
  e.preventDefault();
  const f = e.target;

  await apiPut(`appointments/${id}`, {
    diagnosis: f.diagnosis.value,
    treatment: f.treatment.value
  });

  hideModal();
  await showSection("completed");
}

/* ================= COMPLETED ================= */
async function renderCompleted() {
  document.getElementById("content-title").innerText = "Completed Appointments";
  const apps = (await apiGet("appointments")).filter(a => a.status === "Completed");

  const patients = await apiGet("patients");
  const doctors = await apiGet("doctors");

  const pMap = {};
  patients.forEach(p => pMap[p.id] = p.name);

  const dMap = {};
  doctors.forEach(d => dMap[d.id] = d.name);

  document.getElementById("content-body").innerHTML = `
    <div class="grid md:grid-cols-3 gap-6">
      ${apps.map(a => `
        <div class="card">
          <p>Patient: ${pMap[a.patient_id] || "N/A"}</p>
          <p>Doctor: Dr. ${dMap[a.doctor_id] || "N/A"}</p>
          <span class="badge badge-normal">Completed</span>
        </div>
      `).join("")}
    </div>
  `;
}

/* ================= INITIAL LOAD ================= */
document.addEventListener("DOMContentLoaded", async () => {
  await showSection("patients");
  await loadCharts();   // 📊 charts load on dashboard open
});


let appointmentsChart, statusChart;

async function loadCharts() {
  const apps = await apiGet("appointments");

  /* ========= LINE CHART ========= */
  const dateMap = {};
  apps.forEach(a => {
    dateMap[a.date] = (dateMap[a.date] || 0) + 1;
  });

  const dates = Object.keys(dateMap).sort();
  const counts = dates.map(d => dateMap[d]);

  if (appointmentsChart) appointmentsChart.destroy();

  appointmentsChart = new Chart(
    document.getElementById("appointmentsChart"),
    {
      type: "line",
      data: {
        labels: dates,
        datasets: [{
          label: "Appointments",
          data: counts,
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34,211,238,0.25)",
          tension: 0.4,
          fill: true
        }]
      },
     options: {
  responsive: true,
  maintainAspectRatio: false, // 🔥 IMPORTANT
  plugins: {
    legend: { display: false }
  },
  scales: {
    x: { ticks: { color: "#e5e7eb" } },
    y: { ticks: { color: "#e5e7eb" } }
  }
}

    }
  );

  /* ========= DOUGHNUT ========= */
  const pending = apps.filter(a => a.status === "Pending").length;
  const completed = apps.filter(a => a.status === "Completed").length;

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(
    document.getElementById("statusChart"),
    {
      type: "doughnut",
      data: {
        labels: ["Pending", "Completed"],
        datasets: [{
          data: [pending, completed],
          backgroundColor: ["#f59e0b", "#22c55e"],
          borderWidth: 0
        }]
      },
     options: {
  responsive: true,
  maintainAspectRatio: false, // 🔥 IMPORTANT
  plugins: {
    legend: {
      labels: { color: "#e5e7eb" }
    }
  }
}

    }
  );
}
