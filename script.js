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
let currentLang = localStorage.getItem("appLang") || "lat";
let exam = { questions: [], answers: [], index: 0, left: EXAM_SECONDS, timerId: null };

const UI = {
  lat: {
    pageTitle:"Payvandchi va gazpayvandchi bilim sinovi",
    loginTitle:"Imtihon platformasi",
    loginSubtitle:"Payvandchi va gazpayvandchilar bilimini nazariy sinovdan o‘tkazish tizimi",
    adminPassword:"Admin parol", passwordPlaceholder:"Parolni kiriting", enter:"Kirish",
    platformBadge:"Temir yo‘l texnik nazorat platformasi",
    mainTitle:"Payvandchi va gazpayvandchilar bilimlarini sinovdan o‘tkazish platformasi",
    adminLabel:"Admin",
    mainSubtitle:"Nazariy test, vaqt nazorati, xodim ma’lumotlari, yuz rasmi va natijalar arxivi.",
    welderBtn:"Payvandchilar bilimini sinash", welderInfo:"Elektr payvandchi yo‘nalishi bo‘yicha 20 ta aralash test.",
    gasBtn:"Gazpayvandchilar bilimini sinash", gasInfo:"Gazpayvandchi yo‘nalishi bo‘yicha 20 ta aralash test.",
    resultsArchive:"Natijalar arxivi", resultsNote:"Natijalar ushbu brauzer xotirasida saqlanadi.",
    pdfExport:"PDF hisobot", csvExport:"CSV eksport", clearAll:"Hammasini o‘chirish",
    thTime:"Sana/vaqt", thPhoto:"Rasm", thFio:"F.I.Sh.", thCompany:"Korxona", thWorkshop:"Sex", thPosition:"Lavozim", thRole:"Rol", thScore:"Ball", thConclusion:"Xulosa", thAction:"Amal",
    home:"Bosh sahifa", registerTitle:"Ro‘yxatdan o‘tish",
    firstName:"Ism", lastName:"Familiya", middleName:"Otasining ismi", company:"Korxona", workshop:"Sex", position:"Lavozim", sectionName:"Uchastka nomi",
    companyPlaceholder:"Masalan: Andijon vagon deposi", workshopPlaceholder:"Masalan: AKP / payvandlash sexi", sectionPlaceholder:"Masalan: payvandlash uchastkasi",
    cameraRequest:"Kameraga ruxsat so‘rash", capture:"Yuzni rasmga olish", retake:"Qayta olish",
    cameraNote:"Yuz kameraga to‘g‘rilanadi va rasm olinadi. Kamera ishlamasa ham testga o‘tish mumkin, lekin natijada “rasm yo‘q” ko‘rinadi.",
    startExam:"Ro‘yxatdan o‘tish va testni boshlash", finishExam:"Testni tugatish", prev:"Oldingi", next:"Keyingisi", finish:"Tugatish",
    examFinished:"Test yakunlandi", noAnswersShown:"To‘g‘ri javoblar ko‘rsatilmaydi. Natija bosh sahifadagi arxivga saqlandi.", goHome:"Bosh sahifaga qaytish",
    noResults:"Hozircha natija yo‘q.", delete:"O‘chirish", noPhoto:"Rasm yo‘q", wrongPassword:"Parol noto‘g‘ri.",
    enterName:"Ism va familiyani kiriting.", unanswered:"ta savol belgilanmagan. Baribir tugatasizmi?",
    reportTitle:"KORXONADA ISHLOVCHI PAYVANDCHI VA GAZPAYVANDCHILAR IMTIHON NATIJASI",
    reportSub:"Rasmiy hisobot", order:"T/r", score:"Ball", conclusion:"Xulosa",
    didNotPass:"O‘tolmadingiz", satisfactory:"Qoniqarli", good:"Yaxshi", excellent:"A’lo",
    photoWarning:"Kamera ruxsati berilmadi yoki brauzer qo‘llab-quvvatlamaydi. Testni rasmsiz davom ettirish mumkin.",
    confirmDelete:"Ushbu natijani o‘chirasizmi?", confirmClear:"Barcha natijalarni o‘chirasizmi?", noExport:"Eksport qilish uchun natija yo‘q.",
    welder:"Payvandchi", gas:"Gazpayvandchi", question:"savol"
  },
  cyr: {
    pageTitle:"Пайвандчи ва газпайвандчи билим синови",
    loginTitle:"Имтиҳон платформаси",
    loginSubtitle:"Пайвандчи ва газпайвандчилар билимини назарий синовдан ўтказиш тизими",
    adminPassword:"Админ парол", passwordPlaceholder:"Паролни киритинг", enter:"Кириш",
    platformBadge:"Темир йўл техник назорат платформаси",
    mainTitle:"Пайвандчи ва газпайвандчилар билимларини синовдан ўтказиш платформаси",
    adminLabel:"Админ",
    mainSubtitle:"Назарий тест, вақт назорати, ходим маълумотлари, юз расми ва натижалар архиви.",
    welderBtn:"Пайвандчилар билимини синаш", welderInfo:"Электр пайвандчи йўналиши бўйича 20 та аралаш тест.",
    gasBtn:"Газпайвандчилар билимини синаш", gasInfo:"Газпайвандчи йўналиши бўйича 20 та аралаш тест.",
    resultsArchive:"Натижалар архиви", resultsNote:"Натижалар ушбу браузер хотирасида сақланади.",
    pdfExport:"PDF ҳисобот", csvExport:"CSV экспорт", clearAll:"Ҳаммасини ўчириш",
    thTime:"Сана/вақт", thPhoto:"Расм", thFio:"Ф.И.Ш.", thCompany:"Корхона", thWorkshop:"Цех", thPosition:"Лавозим", thRole:"Рол", thScore:"Балл", thConclusion:"Хулоса", thAction:"Амал",
    home:"Бош саҳифа", registerTitle:"Рўйхатдан ўтиш",
    firstName:"Исм", lastName:"Фамилия", middleName:"Отасининг исми", company:"Корхона", workshop:"Цех", position:"Лавозим", sectionName:"Участка номи",
    companyPlaceholder:"Масалан: Андижон вагон депоси", workshopPlaceholder:"Масалан: АКП / пайвандлаш цехи", sectionPlaceholder:"Масалан: пайвандлаш участкаси",
    cameraRequest:"Камерага рухсат сўраш", capture:"Юзни расмга олиш", retake:"Қайта олиш",
    cameraNote:"Юз камерага тўғриланади ва расм олинади. Камера ишламаса ҳам тестга ўтиш мумкин, лекин натижада “расм йўқ” кўринади.",
    startExam:"Рўйхатдан ўтиш ва тестни бошлаш", finishExam:"Тестни тугатиш", prev:"Олдинги", next:"Кейингиси", finish:"Тугатиш",
    examFinished:"Тест якунланди", noAnswersShown:"Тўғри жавоблар кўрсатилмайди. Натижа бош саҳифадаги архивга сақланди.", goHome:"Бош саҳифага қайтиш",
    noResults:"Ҳозирча натижа йўқ.", delete:"Ўчириш", noPhoto:"Расм йўқ", wrongPassword:"Парол нотўғри.",
    enterName:"Исм ва фамилияни киритинг.", unanswered:"та савол белгиланмаган. Барибир тугатасизми?",
    reportTitle:"КОРХОНАДА ИШЛОВЧИ ПАЙВАНДЧИ ВА ГАЗПАЙВАНДЧИЛАР ИМТИҲОН НАТИЖАСИ",
    reportSub:"Расмий ҳисобот", order:"Т/р", score:"Балл", conclusion:"Хулоса",
    didNotPass:"Ўтолмадингиз", satisfactory:"Қониқарли", good:"Яхши", excellent:"Аъло",
    photoWarning:"Камера рухсати берилмади ёки браузер қўллаб-қувватламайди. Тестни расмсиз давом эттириш мумкин.",
    confirmDelete:"Ушбу натижани ўчирасизми?", confirmClear:"Барча натижаларни ўчирасизми?", noExport:"Экспорт қилиш учун натижа йўқ.",
    welder:"Пайвандчи", gas:"Газпайвандчи", question:"савол"
  }
};

function t(key){ return UI[currentLang][key] || UI.lat[key] || key; }

const cyrMap = {
  "O‘":"Ў","o‘":"ў","G‘":"Ғ","g‘":"ғ","SH":"Ш","Sh":"Ш","sh":"ш","CH":"Ч","Ch":"Ч","ch":"ч","YO":"Ё","Yo":"Ё","yo":"ё","YU":"Ю","Yu":"Ю","yu":"ю","YA":"Я","Ya":"Я","ya":"я",
  "A":"А","a":"а","B":"Б","b":"б","D":"Д","d":"д","E":"Э","e":"е","F":"Ф","f":"ф","G":"Г","g":"г","H":"Ҳ","h":"ҳ","I":"И","i":"и","J":"Ж","j":"ж",
  "K":"К","k":"к","L":"Л","l":"л","M":"М","m":"м","N":"Н","n":"н","O":"О","o":"о","P":"П","p":"п","Q":"Қ","q":"қ","R":"Р","r":"р",
  "S":"С","s":"с","T":"Т","t":"т","U":"У","u":"у","V":"В","v":"в","X":"Х","x":"х","Y":"Й","y":"й","Z":"З","z":"з","’":"ъ","'":"ъ"
};
function toCyr(text){
  if(!text) return "";
  let s = String(text);
  Object.keys(cyrMap).sort((a,b)=>b.length-a.length).forEach(k => s = s.split(k).join(cyrMap[k]));
  return s;
}
function tr(text){ return currentLang === "cyr" ? toCyr(text) : text; }

function applyLang(){
  document.documentElement.lang = currentLang === "cyr" ? "uz-Cyrl" : "uz-Latn";
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-placeholder]").forEach(el => el.placeholder = t(el.dataset.placeholder));
  document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.lang === currentLang));
  document.title = t("pageTitle");
  if(selectedRole) {
    $("selectedRoleBadge").textContent = selectedRole === "welder" ? t("welder") : t("gas");
    $("position").value = selectedRole === "welder" ? t("welder") : t("gas");
  }
  if(document.getElementById("resultsBody")) renderResults();
  if($("examScreen").classList.contains("active") && exam.questions.length) renderQuestion();
}

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

function getConclusion(score){
  if(score < 12) return { text: t("didNotPass"), code:"fail" };
  if(score <= 15) return { text: t("satisfactory"), code:"satisfactory" };
  if(score <= 17) return { text: t("good"), code:"good" };
  return { text: t("excellent"), code:"excellent" };
}

function saveResult(result){
  const list = JSON.parse(localStorage.getItem("examResults") || "[]");
  list.unshift(result);
  localStorage.setItem("examResults", JSON.stringify(list));
}
function getResults(){ return JSON.parse(localStorage.getItem("examResults") || "[]"); }

function fio(r){
  return [r.lastName, r.firstName, r.middleName].filter(Boolean).join(" ");
}

function renderResults(){
  const body = $("resultsBody");
  if(!body) return;
  const data = getResults();
  if(!data.length){
    body.innerHTML = `<tr><td colspan="10" class="muted">${t("noResults")}</td></tr>`;
    return;
  }
  body.innerHTML = data.map((r, idx) => {
    const conclusion = getConclusion(Number(r.score));
    return `
    <tr>
      <td>${r.date}</td>
      <td>${r.photo ? `<img class="avatar" src="${r.photo}" alt="rasm">` : t("noPhoto")}</td>
      <td><b>${tr(fio(r))}</b></td>
      <td>${tr(r.company || "-")}</td>
      <td>${tr(r.workshop || "-")}</td>
      <td>${tr(r.position || "-")}</td>
      <td>${tr(r.roleLabel || "-")}</td>
      <td><b>${r.score}/${r.total}</b> (${r.percent}%)</td>
      <td><b>${conclusion.text}</b></td>
      <td><button class="danger-btn" onclick="deleteResult(${idx})">${t("delete")}</button></td>
    </tr>`;
  }).join("");
}

window.deleteResult = function(index){
  const list = getResults();
  if(!confirm(t("confirmDelete"))) return;
  list.splice(index, 1);
  localStorage.setItem("examResults", JSON.stringify(list));
  renderResults();
}

function exportCSV(){
  const rows = getResults();
  if(!rows.length){ alert(t("noExport")); return; }
  const header = [t("order"),t("thTime"),t("firstName"),t("lastName"),t("middleName"),t("thCompany"),t("thWorkshop"),t("thPosition"),t("thRole"),t("score"),t("conclusion")];
  const lines = [header.join(";")];
  rows.slice().reverse().forEach((r, i) => {
    const conclusion = getConclusion(Number(r.score)).text;
    lines.push([i+1,r.date,r.firstName,r.lastName,r.middleName,r.company,r.workshop,r.position,r.roleLabel,`${r.score}/${r.total}`,conclusion]
      .map(v => `"${tr(String(v||"")).replaceAll('"','""')}"`).join(";"));
  });
  const blob = new Blob(["\ufeff" + lines.join("\n")], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = currentLang === "cyr" ? "imtihon_natijalari_krill.csv" : "imtihon_natijalari_lotin.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportPDF(){
  const rows = getResults();
  if(!rows.length){ alert(t("noExport")); return; }
  const reportRows = rows.slice().reverse().map((r,i)=>{
    const c = getConclusion(Number(r.score)).text;
    return `<tr>
      <td>${i+1}</td>
      <td>${tr(r.lastName || "")}</td>
      <td>${tr(r.firstName || "")}</td>
      <td>${tr(r.middleName || "")}</td>
      <td>${tr(r.workshop || "-")}</td>
      <td>${tr(r.position || "-")}</td>
      <td>${r.score}/${r.total}</td>
      <td>${c}</td>
    </tr>`;
  }).join("");
  const today = new Date().toLocaleDateString("uz-UZ");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t("reportTitle")}</title>
  <style>
    @page{size:A4;margin:15mm}
    body{font-family:"Times New Roman",serif;color:#111;margin:0}
    .top{text-align:center;margin-bottom:16px}
    h1{font-size:16pt;text-transform:uppercase;margin:0 0 8px;font-weight:bold}
    .meta{font-size:12pt;margin:4px 0}
    table{width:100%;border-collapse:collapse;font-size:11pt;margin-top:12px}
    th,td{border:1px solid #111;padding:6px;text-align:center;vertical-align:middle}
    th{font-weight:bold;background:#f2f2f2}
    .sign{display:flex;justify-content:space-between;margin-top:34px;font-size:12pt}
    .note{font-size:11pt;margin-top:14px;line-height:1.5}
    .print{position:fixed;right:20px;top:20px;padding:10px 16px;border:0;background:#0b63ce;color:white;border-radius:8px;font-weight:bold}
    @media print{.print{display:none}}
  </style></head><body>
    <button class="print" onclick="window.print()">${t("pdfExport")}</button>
    <div class="top">
      <h1>${t("reportTitle")}</h1>
      <div class="meta">${t("reportSub")}</div>
      <div class="meta">${tr("Sana")}: ${today}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>${t("order")}</th>
          <th>${t("lastName")}</th>
          <th>${t("firstName")}</th>
          <th>${t("middleName")}</th>
          <th>${t("workshop")}</th>
          <th>${t("position")}</th>
          <th>${t("score")}</th>
          <th>${t("conclusion")}</th>
        </tr>
      </thead>
      <tbody>${reportRows}</tbody>
    </table>
    <div class="note">
      ${tr("Baholash mezoni")}: 12 balldan past — ${t("didNotPass")}; 12–15 ball — ${t("satisfactory")}; 16–17 ball — ${t("good")}; 18–20 ball — ${t("excellent")}.
    </div>
    <div class="sign">
      <div>${tr("Mas’ul")}: ____________________</div>
      <div>${tr("ICHTB boshlig‘i")}: F.B. G‘aniyev</div>
    </div>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function setRole(role){
  selectedRole = role;
  $("selectedRoleBadge").textContent = role === "welder" ? t("welder") : t("gas");
  $("position").value = role === "welder" ? t("welder") : t("gas");
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
    alert(t("photoWarning"));
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
    $("registerError").textContent = t("enterName");
    return;
  }
  worker = {
    firstName,
    lastName,
    middleName: $("middleName").value.trim(),
    company: $("company").value.trim(),
    workshop: $("workshop").value.trim(),
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
  $("examRoleTitle").textContent = `${tr(worker.roleLabel)} testi`;
  $("workerInfo").textContent = `${tr(fio(worker))} • ${tr(worker.company || "Korxona ko‘rsatilmagan")}`;
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
  $("questionCategory").textContent = tr(q.category);
  $("questionNumber").textContent = `${exam.index + 1}-${t("question")}`;
  $("questionText").textContent = tr(q.question);
  $("progressText").textContent = `${exam.index + 1} / ${exam.questions.length}`;
  $("progressFill").style.width = `${((exam.index + 1) / exam.questions.length) * 100}%`;
  $("prevBtn").disabled = exam.index === 0;
  $("nextBtn").classList.toggle("hidden", exam.index === exam.questions.length - 1);
  $("finishBtn").classList.toggle("hidden", exam.index !== exam.questions.length - 1);
  $("optionsBox").innerHTML = q.options.map((opt, idx) => `
    <div class="option ${exam.answers[exam.index] === idx ? "selected" : ""}" data-idx="${idx}">
      <span class="letter">${["A","B","C","D"][idx]}</span>
      <span>${tr(opt)}</span>
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
    if(!confirm(`${left} ${t("unanswered")}`)) return;
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
  const c = getConclusion(score);
  $("finalPhoto").src = worker.photo || "";
  $("finalPhoto").style.display = worker.photo ? "block" : "none";
  $("finalName").textContent = tr(fio(worker));
  $("finalMeta").textContent = `${tr(worker.company || "-")} • ${tr(worker.workshop || "-")} • ${tr(worker.position)} • ${tr(worker.sectionName || "-")}`;
  $("finalScore").textContent = `${score}/${exam.questions.length} — ${percent}%`;
  $("finalConclusion").textContent = c.text;
  showScreen("resultScreen");
}

$("loginBtn").addEventListener("click", () => {
  if($("adminPassword").value === ADMIN_PASSWORD){
    $("loginError").textContent = "";
    showScreen("homeScreen");
  }else{
    $("loginError").textContent = t("wrongPassword");
  }
});
$("adminPassword").addEventListener("keydown", e => { if(e.key === "Enter") $("loginBtn").click(); });
$("togglePassword").addEventListener("click", () => {
  $("adminPassword").type = $("adminPassword").type === "password" ? "text" : "password";
});
document.querySelectorAll(".role-card").forEach(btn => btn.addEventListener("click", () => setRole(btn.dataset.role)));
document.querySelectorAll(".lang-btn").forEach(btn => btn.addEventListener("click", () => {
  currentLang = btn.dataset.lang;
  localStorage.setItem("appLang", currentLang);
  applyLang();
}));
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
$("exportPdfBtn").addEventListener("click", exportPDF);
$("clearAllBtn").addEventListener("click", () => {
  if(confirm(t("confirmClear"))){
    localStorage.removeItem("examResults");
    renderResults();
  }
});
applyLang();
showScreen("loginScreen");
