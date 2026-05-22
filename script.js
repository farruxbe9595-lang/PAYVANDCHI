const ADMIN_PASSWORD = "17011995";
const EXAM_SECONDS = 15 * 60;
const QUESTIONS_PER_EXAM = 20;
const ROLE_QUESTIONS = 14;

const $ = (id) => document.getElementById(id);
const screens = ["loginScreen","homeScreen","registerScreen","examScreen","resultScreen"];
let selectedRole = null;
let worker = null;
let stream = null;
let photoData = "";
let exam = { questions: [], answers: [], index: 0, left: EXAM_SECONDS, timerId: null };

function showScreen(id){
  screens.forEach(s => $(s).classList.toggle("active", s === id));
  if(id === "homeScreen") renderResults();
}

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function sample(arr, n){ return shuffle(arr).slice(0, n); }

function prepareQuestion(q){
  const options = q.options.map((text, idx) => ({ text, original: idx }));
  const shuffled = shuffle(options);
  return {
    id: q.id,
    category: q.category,
    stage: q.stage,
    question: q.question,
    options: shuffled.map(o => o.text),
    correct: shuffled.findIndex(o => o.original === q.answer)
  };
}

function buildExam(role){
  const roleBank = QUESTION_BANK[role];
  const easy = roleBank.filter(q => q.stage <= 2);
  const hard = roleBank.filter(q => q.stage >= 3);
  const pickedRole = [...sample(easy, 7), ...sample(hard, 7)];
  const common = [
    ...sample(QUESTION_BANK.labor, 2),
    ...sample(QUESTION_BANK.fire, 2),
    ...sample(QUESTION_BANK.electric, 2)
  ];
  return shuffle([...pickedRole, ...common].map(prepareQuestion));
}

function saveResult(result){
  const list = JSON.parse(localStorage.getItem("examResults") || "[]");
  list.unshift(result);
  localStorage.setItem("examResults", JSON.stringify(list));
}

function getResults(){
  return JSON.parse(localStorage.getItem("examResults") || "[]");
}

function renderResults(){
  const body = $("resultsBody");
  const data = getResults();
  if(!data.length){
    body.innerHTML = `<tr><td colspan="9" class="muted">Hozircha natija yo‘q.</td></tr>`;
    return;
  }
  body.innerHTML = data.map((r, idx) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.photo ? `<img class="avatar" src="${r.photo}" alt="rasm">` : "Rasm yo‘q"}</td>
      <td><b>${r.lastName} ${r.firstName}</b></td>
      <td>${r.company || "-"}</td>
      <td>${r.position}</td>
      <td>${r.sectionName || "-"}</td>
      <td>${r.roleLabel}</td>
      <td><b>${r.score}/${r.total}</b> (${r.percent}%)</td>
      <td><button class="danger-btn" onclick="deleteResult(${idx})">O‘chirish</button></td>
    </tr>
  `).join("");
}

window.deleteResult = function(index){
  const list = getResults();
  if(!confirm("Ushbu natijani o‘chirasizmi?")) return;
  list.splice(index, 1);
  localStorage.setItem("examResults", JSON.stringify(list));
  renderResults();
}

function exportCSV(){
  const rows = getResults();
  if(!rows.length){ alert("Eksport qilish uchun natija yo‘q."); return; }
  const header = ["Sana","Ism","Familiya","Korxona","Lavozim","Uchastka","Rol","Ball","Foiz"];
  const lines = [header.join(";")];
  rows.forEach(r => lines.push([r.date,r.firstName,r.lastName,r.company,r.position,r.sectionName,r.roleLabel,`${r.score}/${r.total}`,`${r.percent}%`].map(v => `"${String(v||"").replaceAll('"','""')}"`).join(";")));
  const blob = new Blob(["\ufeff" + lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "imtihon_natijalari.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function setRole(role){
  selectedRole = role;
  const label = role === "welder" ? "Payvandchi" : "Gazpayvandchi";
  $("selectedRoleBadge").textContent = label;
  $("position").value = label;
  $("registerError").textContent = "";
  showScreen("registerScreen");
}

async function requestCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    $("cameraVideo").srcObject = stream;
    $("cameraVideo").style.display = "block";
    $("photoPreview").style.display = "none";
    $("captureBtn").disabled = false;
  }catch(e){
    alert("Kamera ruxsati berilmadi yoki brauzer qo‘llab-quvvatlamaydi. Testni rasmsiz davom ettirish mumkin.");
  }
}

function capturePhoto(){
  const video = $("cameraVideo");
  const canvas = $("photoCanvas");
  if(!video.videoWidth) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);
  photoData = canvas.toDataURL("image/jpeg", .86);
  $("photoPreview").src = photoData;
  $("photoPreview").style.display = "block";
  video.style.display = "none";
  $("retakeBtn").classList.remove("hidden");
}

function stopCamera(){
  if(stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
}

function startExam(){
  const firstName = $("firstName").value.trim();
  const lastName = $("lastName").value.trim();
  if(!firstName || !lastName){
    $("registerError").textContent = "Ism va familiyani kiriting.";
    return;
  }
  worker = {
    firstName,
    lastName,
    company: $("company").value.trim(),
    position: $("position").value.trim(),
    sectionName: $("sectionName").value.trim(),
    role: selectedRole,
    roleLabel: selectedRole === "welder" ? "Payvandchi" : "Gazpayvandchi",
    photo: photoData
  };
  stopCamera();
  exam.questions = buildExam(selectedRole);
  exam.answers = Array(exam.questions.length).fill(null);
  exam.index = 0;
  exam.left = EXAM_SECONDS;
  $("examRoleTitle").textContent = `${worker.roleLabel} testi`;
  $("workerInfo").textContent = `${worker.lastName} ${worker.firstName} • ${worker.company || "Korxona ko‘rsatilmagan"}`;
  showScreen("examScreen");
  renderQuestion();
  startTimer();
}

function startTimer(){
  clearInterval(exam.timerId);
  updateTimer();
  exam.timerId = setInterval(() => {
    exam.left--;
    updateTimer();
    if(exam.left <= 0) finishExam(true);
  }, 1000);
}

function updateTimer(){
  const m = Math.floor(exam.left / 60).toString().padStart(2,"0");
  const s = (exam.left % 60).toString().padStart(2,"0");
  $("timer").textContent = `${m}:${s}`;
}

function renderQuestion(){
  const q = exam.questions[exam.index];
  $("questionCategory").textContent = q.category;
  $("questionNumber").textContent = `${exam.index + 1}-savol`;
  $("questionText").textContent = q.question;
  $("progressText").textContent = `${exam.index + 1} / ${exam.questions.length}`;
  $("progressFill").style.width = `${((exam.index + 1) / exam.questions.length) * 100}%`;
  $("prevBtn").disabled = exam.index === 0;
  $("nextBtn").classList.toggle("hidden", exam.index === exam.questions.length - 1);
  $("finishBtn").classList.toggle("hidden", exam.index !== exam.questions.length - 1);
  $("optionsBox").innerHTML = q.options.map((opt, idx) => `
    <div class="option ${exam.answers[exam.index] === idx ? "selected" : ""}" data-idx="${idx}">
      <span class="letter">${["A","B","C","D"][idx]}</span>
      <span>${opt}</span>
    </div>
  `).join("");
  document.querySelectorAll(".option").forEach(el => {
    el.addEventListener("click", () => {
      exam.answers[exam.index] = Number(el.dataset.idx);
      renderQuestion();
    });
  });
}

function finishExam(auto=false){
  if(!auto && exam.answers.some(a => a === null)){
    const left = exam.answers.filter(a => a === null).length;
    if(!confirm(`${left} ta savol belgilanmagan. Baribir tugatasizmi?`)) return;
  }
  clearInterval(exam.timerId);
  let score = 0;
  exam.questions.forEach((q, i) => { if(exam.answers[i] === q.correct) score++; });
  const percent = Math.round(score / exam.questions.length * 100);
  const now = new Date();
  const result = {
    ...worker,
    date: now.toLocaleString("uz-UZ"),
    score,
    total: exam.questions.length,
    percent,
    durationLeft: exam.left
  };
  saveResult(result);
  $("finalPhoto").src = worker.photo || "";
  $("finalPhoto").style.display = worker.photo ? "block" : "none";
  $("finalName").textContent = `${worker.lastName} ${worker.firstName}`;
  $("finalMeta").textContent = `${worker.company || "-"} • ${worker.position} • ${worker.sectionName || "-"}`;
  $("finalScore").textContent = `${score}/${exam.questions.length} — ${percent}%`;
  showScreen("resultScreen");
}

$("loginBtn").addEventListener("click", () => {
  if($("adminPassword").value === ADMIN_PASSWORD){
    $("loginError").textContent = "";
    showScreen("homeScreen");
  }else{
    $("loginError").textContent = "Parol noto‘g‘ri.";
  }
});
$("adminPassword").addEventListener("keydown", e => { if(e.key === "Enter") $("loginBtn").click(); });
$("togglePassword").addEventListener("click", () => {
  $("adminPassword").type = $("adminPassword").type === "password" ? "text" : "password";
});
document.querySelectorAll(".role-card").forEach(btn => btn.addEventListener("click", () => setRole(btn.dataset.role)));
$("backHome1").addEventListener("click", () => { stopCamera(); showScreen("homeScreen"); });
$("requestCameraBtn").addEventListener("click", requestCamera);
$("captureBtn").addEventListener("click", capturePhoto);
$("retakeBtn").addEventListener("click", () => { photoData = ""; requestCamera(); });
$("startExamBtn").addEventListener("click", startExam);
$("prevBtn").addEventListener("click", () => { if(exam.index>0){ exam.index--; renderQuestion(); }});
$("nextBtn").addEventListener("click", () => { if(exam.index<exam.questions.length-1){ exam.index++; renderQuestion(); }});
$("finishBtn").addEventListener("click", () => finishExam(false));
$("finishBtnSide").addEventListener("click", () => finishExam(false));
$("goHomeBtn").addEventListener("click", () => showScreen("homeScreen"));
$("exportBtn").addEventListener("click", exportCSV);
$("clearAllBtn").addEventListener("click", () => {
  if(confirm("Barcha natijalarni o‘chirasizmi?")){
    localStorage.removeItem("examResults");
    renderResults();
  }
});
showScreen("loginScreen");
