const categories = [
  { id:1,  salary:350000,  userShare:17500,  stateShare:52500,  total:70000  },
  { id:2,  salary:455000,  userShare:22750,  stateShare:68250,  total:91000  },
  { id:3,  salary:560000,  userShare:28000,  stateShare:84000,  total:112000 },
  { id:4,  salary:665000,  userShare:33250,  stateShare:99750,  total:133000 },
  { id:5,  salary:770000,  userShare:38500,  stateShare:115500, total:154000 },
  { id:6,  salary:875000,  userShare:43750,  stateShare:131250, total:175000 },
  { id:7,  salary:980000,  userShare:49000,  stateShare:147000, total:196000 },
  { id:8,  salary:1085000, userShare:54250,  stateShare:162750, total:217000 },
  { id:9,  salary:1190000, userShare:59500,  stateShare:178500, total:238000 },
  { id:10, salary:1295000, userShare:64750,  stateShare:194250, total:259000 },
  { id:11, salary:1400000, userShare:70000,  stateShare:210000, total:280000 },
  { id:12, salary:1505000, userShare:75250,  stateShare:225750, total:301000 },
  { id:13, salary:1610000, userShare:80500,  stateShare:241500, total:322000 },
  { id:14, salary:1715000, userShare:85750,  stateShare:257250, total:343000 },
  { id:15, salary:1750000, userShare:87500,  stateShare:262500, total:350000 }
];

const PURCHASE_PERCENTAGE    = 0.17;
const MIN_PENSION            = 350000;
const MAX_PENSION_PERCENTAGE = 0.8;
const DAYS_PER_MONTH         = 30;
const MONTHS_PER_YEAR        = 12;
const DAYS_PER_YEAR          = DAYS_PER_MONTH * MONTHS_PER_YEAR;
const MAX_PURCHASE_MONTHS    = 60;

function calculateExactAge(birthYear, birthMonth, birthDay, targetYear, targetMonth, targetDay) {
  const birthDate  = new Date(birthYear,  birthMonth  - 1, birthDay);
  const targetDate = new Date(targetYear, targetMonth - 1, targetDay);
  let years  = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth()    - birthDate.getMonth();
  let days   = targetDate.getDate()     - birthDate.getDate();
  if (days < 0) {
    months--;
    days += new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
  }
  if (months < 0) { years--; months += 12; }
  return { years, months, days };
}

function addYearsToDate(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addDaysToDate(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysToYMD(totalDays) {
  const years  = Math.floor(totalDays / DAYS_PER_YEAR);
  const rem    = totalDays % DAYS_PER_YEAR;
  const months = Math.floor(rem / DAYS_PER_MONTH);
  const days   = rem % DAYS_PER_MONTH;
  return { years, months, days };
}

function formatDuration(years, months, days) {
  const parts = [];
  if (years  > 0) parts.push(`${years} سنة`);
  if (months > 0) parts.push(`${months} شهر`);
  if (days   > 0) parts.push(`${days} يوم`);
  if (parts.length === 0) return '0 يوم';
  return parts.join(' و ');
}

function generatePensionTable(totalFields, prevCategory, prevYears) {
  const table           = [];
  const category15Count = 6;

  if (prevCategory && prevCategory >= 1 && prevCategory <= 14) {
    // عدد تكرار prevCategory = totalFields - عدد فئات التدرج بعده - 6
    const stepsAfter = 14 - prevCategory;
    const repeatPrev = totalFields - stepsAfter - category15Count;
    for (let i = 0; i < repeatPrev; i++)       table.push(prevCategory);
    for (let c = prevCategory + 1; c <= 14; c++) table.push(c);
    for (let i = 0; i < category15Count; i++)    table.push(15);
  } else {
    const middle = [2,3,4,5,6,7,8,9,10,11,12,13,14];
    if (totalFields <= middle.length + category15Count) {
      const startIndex = middle.length - (totalFields - category15Count);
      for (let i = startIndex; i < middle.length; i++) table.push(middle[i]);
    } else {
      const cat1 = totalFields - middle.length - category15Count;
      for (let i = 0; i < cat1;          i++) table.push(1);
      for (let i = 0; i < middle.length; i++) table.push(middle[i]);
    }
    for (let i = 0; i < category15Count; i++) table.push(15);
  }

  return table;
}

function calculateAverageSalary(table) {
  const last5 = table.slice(-5);
  if (last5.length === 0) return 0;
  if (last5.every(c => c === last5[0])) return categories[last5[0] - 1].salary;
  return Math.floor(last5.reduce((acc, c) => acc + categories[c - 1].salary, 0) / last5.length);
}

function calculatePension(avg, months) {
  const raw        = (avg * 0.025 * months) / MONTHS_PER_YEAR;
  const maxAllowed = Math.floor(avg * MAX_PENSION_PERCENTAGE);
  return Math.min(Math.max(Math.floor(raw), MIN_PENSION), maxAllowed);
}

function formatTableRows(table, joinDate, by, bm, bd) {
  let rows = '';
  let currentDate = new Date(joinDate);
  for (let i = 0; i < table.length; i++) {
    const cat     = categories[table[i] - 1];
    const age     = calculateExactAge(by, bm, bd, currentDate.getFullYear(), currentDate.getMonth()+1, currentDate.getDate());
    const ageText = `${age.years} سنة و ${age.months} شهر و ${age.days} يوم`;
    const isLast6 = i >= table.length - 6;
    rows += `<tr${isLast6 ? ' class="top-rows"' : ''}>
  <td>${ageText}</td>
  <td>${table[i]}</td>
  <td>${cat.salary.toLocaleString('en-US')}</td>
  <td class="citizen-cell">${cat.userShare.toLocaleString('en-US')}</td>
  <td>${cat.stateShare.toLocaleString('en-US')}</td>
  <td>${cat.total.toLocaleString('en-US')}</td>
</tr>`;
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }
  return rows;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m])
  );
}

const maleRules = {
  15:[{type:'اقرب راتب',fields:31,required:31,retirementAge:46},{type:'اعلى راتب',fields:33,required:33,retirementAge:48}],
  16:[{type:'اقرب راتب',fields:31,required:31,retirementAge:47},{type:'اعلى راتب',fields:33,required:33,retirementAge:49}],
  17:[{type:'اقرب راتب',fields:31,required:31,retirementAge:48},{type:'اعلى راتب',fields:33,required:33,retirementAge:50}],
  18:[{type:'اقرب راتب',fields:31,required:31,retirementAge:49},{type:'اعلى راتب',fields:33,required:33,retirementAge:51}],
  19:[{type:'اقرب راتب',fields:31,required:31,retirementAge:50},{type:'اعلى راتب',fields:33,required:33,retirementAge:52}],
  20:[{type:'اقرب راتب',fields:31,required:31,retirementAge:51},{type:'اعلى راتب',fields:33,required:33,retirementAge:53}],
  21:[{type:'اقرب راتب (مع شراء)',fields:30,required:31,retirementAge:51},{type:'بدون شراء',fields:31,required:31,retirementAge:52},{type:'اعلى راتب',fields:33,required:33,retirementAge:54}],
  22:[{type:'اقرب راتب (مع شراء)',fields:29,required:31,retirementAge:51},{type:'بدون شراء',fields:31,required:31,retirementAge:53},{type:'اعلى راتب',fields:33,required:33,retirementAge:55}],
  23:[{type:'اقرب راتب (مع شراء)',fields:28,required:31,retirementAge:51},{type:'بدون شراء',fields:31,required:31,retirementAge:54},{type:'اعلى راتب',fields:33,required:33,retirementAge:56}],
  24:[{type:'اقرب راتب (مع شراء)',fields:27,required:31,retirementAge:51},{type:'بدون شراء',fields:31,required:31,retirementAge:55},{type:'اعلى راتب',fields:33,required:33,retirementAge:57}],
  25:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:51},{type:'بدون شراء',fields:31,required:31,retirementAge:56},{type:'اعلى راتب',fields:33,required:33,retirementAge:58}],
  26:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:52},{type:'بدون شراء',fields:31,required:31,retirementAge:57},{type:'اعلى راتب',fields:33,required:33,retirementAge:59}],
  27:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:53},{type:'بدون شراء',fields:31,required:31,retirementAge:58},{type:'اعلى راتب',fields:33,required:33,retirementAge:60}],
  28:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:54},{type:'بدون شراء',fields:31,required:31,retirementAge:59},{type:'اعلى راتب',fields:33,required:33,retirementAge:61}],
  29:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:55},{type:'بدون شراء',fields:31,required:31,retirementAge:60},{type:'اعلى راتب',fields:33,required:33,retirementAge:62}],
  30:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:56},{type:'بدون شراء',fields:31,required:31,retirementAge:61},{type:'اعلى راتب',fields:33,required:33,retirementAge:63}],
  31:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:57},{type:'بدون شراء',fields:31,required:31,retirementAge:62},{type:'اعلى راتب',fields:33,required:33,retirementAge:64}],
  32:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:58},{type:'بدون شراء',fields:31,required:31,retirementAge:63},{type:'اعلى راتب',fields:33,required:33,retirementAge:65}],
  33:[{type:'اقرب راتب (مع شراء)',fields:26,required:31,retirementAge:59},{type:'بدون شراء',fields:31,required:31,retirementAge:64},{type:'اعلى راتب',fields:33,required:33,retirementAge:66}],
  34:[{type:'بدون شراء',fields:27,required:27,retirementAge:61},{type:'اعلى راتب',fields:30,required:30,retirementAge:64}],
  35:[{type:'بدون شراء',fields:26,required:26,retirementAge:61},{type:'اعلى راتب',fields:29,required:29,retirementAge:64}],
  36:[{type:'بدون شراء',fields:25,required:25,retirementAge:61},{type:'اعلى راتب',fields:28,required:28,retirementAge:64}],
  37:[{type:'بدون شراء',fields:24,required:24,retirementAge:61},{type:'اعلى راتب',fields:27,required:27,retirementAge:64}],
  38:[{type:'بدون شراء',fields:23,required:23,retirementAge:61},{type:'اعلى راتب',fields:26,required:26,retirementAge:64}],
  39:[{type:'بدون شراء',fields:22,required:22,retirementAge:61},{type:'اعلى راتب',fields:25,required:25,retirementAge:64}],
  40:[{type:'اقرب راتب',fields:21,required:21,retirementAge:61},{type:'اعلى راتب',fields:24,required:24,retirementAge:64}],
  41:[{type:'اقرب راتب (مع شراء)',fields:20,required:21,retirementAge:61},{type:'بدون شراء',fields:21,required:21,retirementAge:62},{type:'اعلى راتب',fields:23,required:23,retirementAge:64}],
  42:[{type:'اقرب راتب (مع شراء)',fields:19,required:21,retirementAge:61},{type:'بدون شراء',fields:21,required:21,retirementAge:63},{type:'اعلى راتب',fields:23,required:23,retirementAge:64}],
  43:[{type:'اقرب راتب (مع شراء)',fields:18,required:21,retirementAge:61},{type:'بدون شراء',fields:21,required:21,retirementAge:64},{type:'اعلى راتب',fields:24,required:24,retirementAge:67}],
  44:[{type:'اقرب راتب (مع شراء)',fields:17,required:21,retirementAge:61},{type:'بدون شراء',fields:20,required:20,retirementAge:64}],
  45:[{type:'اقرب راتب (مع شراء)',fields:16,required:21,retirementAge:61},{type:'بدون شراء',fields:19,required:19,retirementAge:64}],
  46:[{type:'بدون شراء',fields:18,required:18,retirementAge:64}],
  47:[{type:'بدون شراء',fields:17,required:17,retirementAge:64}],
  48:[{type:'بدون شراء',fields:16,required:16,retirementAge:64}],
  49:[{type:'اقرب راتب (مع شراء)',fields:15,required:16,retirementAge:64},{type:'بدون شراء',fields:16,required:16,retirementAge:65}]
};

const femaleRules = {
  15:[{type:'اقرب راتب',fields:25,required:25,retirementAge:40,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:45,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:47,exact:true}],
  16:[{type:'اقرب راتب',fields:25,required:25,retirementAge:41,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:46,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:48,exact:true}],
  17:[{type:'اقرب راتب',fields:25,required:25,retirementAge:42,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:47,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:49,exact:true}],
  18:[{type:'اقرب راتب',fields:25,required:25,retirementAge:43,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:48,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:50,exact:true}],
  19:[{type:'اقرب راتب',fields:25,required:25,retirementAge:44,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:49,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:51,exact:true}],
  20:[{type:'اقرب راتب',fields:25,required:25,retirementAge:45,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:50,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:52,exact:true}],
  21:[{type:'اقرب راتب',fields:25,required:25,retirementAge:46,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:51,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:53,exact:true}],
  22:[{type:'اقرب راتب',fields:25,required:25,retirementAge:47,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:52,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:54,exact:true}],
  23:[{type:'اقرب راتب',fields:25,required:25,retirementAge:48,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:53,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:55,exact:true}],
  24:[{type:'اقرب راتب',fields:25,required:25,retirementAge:49,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:54,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:56,exact:true}],
  25:[{type:'اقرب راتب',fields:25,required:25,retirementAge:50,exact:true},{type:'اعلى راتب متوسط',fields:30,required:30,retirementAge:55,exact:true},{type:'اعلى راتب كامل',fields:32,required:32,retirementAge:57,exact:true}],
  26:[{type:'اقرب راتب (مع شراء)',fields:25,required:26,retirementAge:51},{type:'اقرب راتب (بدون شراء)',fields:26,required:26,retirementAge:52},{type:'اعلى راتب',fields:28,required:28,retirementAge:54}],
  27:[{type:'اقرب راتب (مع شراء)',fields:24,required:26,retirementAge:51},{type:'اقرب راتب (بدون شراء)',fields:26,required:26,retirementAge:53},{type:'اعلى راتب',fields:28,required:28,retirementAge:55}],
  28:[{type:'اقرب راتب (مع شراء)',fields:23,required:26,retirementAge:51},{type:'اقرب راتب (بدون شراء)',fields:26,required:26,retirementAge:54},{type:'اعلى راتب',fields:28,required:28,retirementAge:56}],
  29:[{type:'اقرب راتب (مع شراء)',fields:22,required:26,retirementAge:51},{type:'اقرب راتب (بدون شراء)',fields:26,required:26,retirementAge:55},{type:'اعلى راتب',fields:28,required:28,retirementAge:57}],
  30:[{type:'اقرب راتب (مع شراء)',fields:21,required:26,retirementAge:51},{type:'اقرب راتب (بدون شراء)',fields:26,required:26,retirementAge:56},{type:'اعلى راتب',fields:28,required:28,retirementAge:58}],
  31:[{type:'اقرب راتب (مع شراء)',fields:21,required:25,retirementAge:52},{type:'اقرب راتب (بدون شراء)',fields:25,required:25,retirementAge:56},{type:'اعلى راتب',fields:27,required:27,retirementAge:58}],
  32:[{type:'اقرب راتب (مع شراء)',fields:21,required:24,retirementAge:53},{type:'اقرب راتب (بدون شراء)',fields:24,required:24,retirementAge:56},{type:'اعلى راتب',fields:26,required:26,retirementAge:58}],
  33:[{type:'اقرب راتب (بدون شراء)',fields:21,required:21,retirementAge:54},{type:'اعلى راتب',fields:23,required:23,retirementAge:56}],
  34:[{type:'اقرب راتب (بدون شراء)',fields:22,required:22,retirementAge:56},{type:'اعلى راتب',fields:24,required:24,retirementAge:58}],
  35:[{type:'اقرب راتب (بدون شراء)',fields:21,required:21,retirementAge:56},{type:'اعلى راتب',fields:23,required:23,retirementAge:58}],
  36:[{type:'اقرب راتب (مع شراء)',fields:20,required:21,retirementAge:56},{type:'اقرب راتب (بدون شراء)',fields:21,required:21,retirementAge:57},{type:'اعلى راتب',fields:23,required:23,retirementAge:59}],
  37:[{type:'اقرب راتب (مع شراء)',fields:19,required:21,retirementAge:56},{type:'اقرب راتب (بدون شراء)',fields:21,required:21,retirementAge:58},{type:'اعلى راتب',fields:23,required:23,retirementAge:60}],
  38:[{type:'اقرب راتب (مع شراء)',fields:18,required:21,retirementAge:56},{type:'اقرب راتب (بدون شراء)',fields:21,required:21,retirementAge:59},{type:'اعلى راتب',fields:23,required:23,retirementAge:61}],
  39:[{type:'اقرب راتب (مع شراء)',fields:17,required:21,retirementAge:56},{type:'اقرب راتب (بدون شراء)',fields:20,required:20,retirementAge:59},{type:'اعلى راتب',fields:22,required:22,retirementAge:61}],
  40:[{type:'اقرب راتب (مع شراء)',fields:16,required:21,retirementAge:56},{type:'اقرب راتب (بدون شراء)',fields:19,required:19,retirementAge:59},{type:'اعلى راتب',fields:21,required:21,retirementAge:61}],
  41:[{type:'اقرب راتب (بدون شراء)',fields:18,required:18,retirementAge:59},{type:'اعلى راتب',fields:20,required:20,retirementAge:61}],
  42:[{type:'اقرب راتب (بدون شراء)',fields:17,required:17,retirementAge:59},{type:'اعلى راتب',fields:19,required:19,retirementAge:61}],
  43:[{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:59},{type:'اعلى راتب',fields:18,required:18,retirementAge:61}],
  44:[{type:'اقرب راتب (مع شراء)',fields:15,required:16,retirementAge:59},{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:60}],
  45:[{type:'اقرب راتب (مع شراء)',fields:14,required:16,retirementAge:59},{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:61}],
  46:[{type:'اقرب راتب (مع شراء)',fields:13,required:16,retirementAge:59},{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:62}],
  47:[{type:'اقرب راتب (مع شراء)',fields:12,required:16,retirementAge:59},{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:63}],
  48:[{type:'اقرب راتب (مع شراء)',fields:11,required:16,retirementAge:59},{type:'اقرب راتب (بدون شراء)',fields:16,required:16,retirementAge:64}],
  49:[{type:'اقرب راتب (مع شراء)',fields:11,required:16,retirementAge:60}]
};

const scenarioColors = [
  { border:'#1a3a6b', header:'linear-gradient(135deg,#1a3a6b,#2a5298)', text:'#fff' },
  { border:'#c8972a', header:'linear-gradient(135deg,#a06010,#c8972a)', text:'#fff' },
  { border:'#17a2b8', header:'linear-gradient(135deg,#0c5460,#1cbfd8)', text:'#fff' }
];

document.getElementById('pensionForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const name   = document.getElementById('memberName').value || 'المنتسب';
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const by = parseInt(document.getElementById('birthYear').value);
  const bm = parseInt(document.getElementById('birthMonth').value);
  const bd = parseInt(document.getElementById('birthDay').value);
  const jy = parseInt(document.getElementById('joinYear').value);
  const jm = parseInt(document.getElementById('joinMonth').value);
  const jd = parseInt(document.getElementById('joinDay').value);

  const joinDate      = new Date(jy, jm - 1, jd);

  const hasPrev    = document.getElementById('hasPrevService').checked;
  const prevCat    = hasPrev ? Math.min(15, Math.max(1, parseInt(document.getElementById('prevCategory').value) || 1)) : 0;
  const hasPrevWork  = document.getElementById('hasPrevWork').checked;
  const prevWorkYrs  = hasPrevWork ? Math.max(0, parseInt(document.getElementById('prevWorkYears').value)  || 0) : 0;
  const prevWorkMths = hasPrevWork ? Math.min(11, Math.max(0, parseInt(document.getElementById('prevWorkMonths').value) || 0)) : 0;
  // إجمالي الخدمة السابقة بالأشهر
  const prevWorkTotalMonths = (prevWorkYrs * 12) + prevWorkMths;
  // تحريك تاريخ الانتساب للخلف بمقدار الخدمة السابقة
  const effectiveJoinDate = new Date(joinDate);
  effectiveJoinDate.setMonth(effectiveJoinDate.getMonth() - prevWorkTotalMonths);
  const effectiveJY = effectiveJoinDate.getFullYear();
  const effectiveJM = effectiveJoinDate.getMonth() + 1;
  const effectiveJD = effectiveJoinDate.getDate();
  // عمر الانتساب الفعلي (بعد الخدمة السابقة)
  const effectiveJoin     = calculateExactAge(by, bm, bd, effectiveJY, effectiveJM, effectiveJD);
  const startAgeYearsEff  = effectiveJoin.years;
  

  const today         = new Date();
  const now           = calculateExactAge(by, bm, bd, today.getFullYear(), today.getMonth()+1, today.getDate());
  const join          = calculateExactAge(by, bm, bd, jy, jm, jd);
  // نستخدم عمر الانتساب الفعلي (مع الخدمة السابقة) لتحديد الخطة
  const startAgeYears = hasPrevWork ? startAgeYearsEff : join.years;

  if (startAgeYears < 15 || startAgeYears > 49) {
    document.getElementById('result').innerHTML =
      `<div class="error-box"><h3>⚠️ عمر غير مدعوم</h3><p>عمر الانتساب: ${startAgeYears} سنة</p></div>`;
    return;
  }

  const rules = gender === 'male' ? maleRules : femaleRules;
  const plan  = rules[startAgeYears];

  if (!plan) {
    document.getElementById('result').innerHTML =
      `<div class="error-box"><h3>⚠️ لا توجد خطة</h3><p>لا توجد خطط لهذا العمر</p></div>`;
    return;
  }

  let html = `
<div class="info-card">
  <h3>👤 معلومات المشترك</h3>
  <div class="info-grid">
    <div class="info-row"><span class="info-label">الاسم:</span><span class="info-value">${escapeHtml(name)}</span></div>
    <div class="info-row"><span class="info-label">الجنس:</span><span class="info-value">${gender==='male'?'👨 رجل':'👩 امرأة'}</span></div>
    <div class="info-row"><span class="info-label">تاريخ الميلاد:</span><span class="info-value">${by}/${bm}/${bd}</span></div>
    <div class="info-row"><span class="info-label">تاريخ الانتساب:</span><span class="info-value">${jy}/${jm}/${jd}</span></div>
    <div class="info-row"><span class="info-label">العمر الحالي:</span><span class="info-value">${now.years} سنة و ${now.months} شهر و ${now.days} يوم</span></div>
    <div class="info-row"><span class="info-label">عمر الانتساب:</span><span class="info-value">${hasPrevWork ? (effectiveJoin.years + ' سنة و ' + effectiveJoin.months + ' شهر و ' + effectiveJoin.days + ' يوم') : (join.years + ' سنة و ' + join.months + ' شهر و ' + join.days + ' يوم')}</span></div>
    ${hasPrev ? `<div class="info-row"><span class="info-label">فئة قديمة:</span><span class="info-value">فئة ${prevCat}</span></div>` : ''}
    ${hasPrevWork ? `<div class="info-row"><span class="info-label">خدمة سابقة:</span><span class="info-value">${prevWorkYrs > 0 ? prevWorkYrs + ' سنة' : ''}${prevWorkYrs > 0 && prevWorkMths > 0 ? ' و ' : ''}${prevWorkMths > 0 ? prevWorkMths + ' شهر' : ''}</span></div>` : ''}
  </div>
</div>`;

  const icons = ['📋','💰','🏆'];

  plan.forEach((p, idx) => {
    const sub             = p.exact ? 0 : 1;
    const fullTable       = generatePensionTable(p.fields + (p.exact ? 1 : 0), hasPrev ? prevCat : 0);
    const table           = fullTable;
    const avg             = calculateAverageSalary(fullTable);
    const displayFields   = p.fields - sub;
    const displayRequired = p.required - sub;
    // تاريخ بداية الجدول = تاريخ الانتساب الفعلي (مع الخدمة السابقة)
    const adjustedJoinDate = hasPrevWork ? effectiveJoinDate : joinDate;
    const pens            = calculatePension(avg, (p.required - sub) * MONTHS_PER_YEAR);
    const maxP            = Math.floor(avg * MAX_PENSION_PERCENTAGE);
    const endDate         = addDaysToDate(addYearsToDate(adjustedJoinDate, displayFields), 1);
    const endAge          = calculateExactAge(by, bm, bd, endDate.getFullYear(), endDate.getMonth()+1, endDate.getDate());
    const missingDays     = Math.max(0, (displayRequired - displayFields) * DAYS_PER_YEAR);
    const rows            = formatTableRows(table, adjustedJoinDate, by, bm, bd);
    const sc              = scenarioColors[idx % scenarioColors.length];

    html += `
<div class="scenario-wrap">
  <div class="scenario-header" style="background:${sc.header};color:${sc.text};">
    <span>${icons[idx]}</span>
    <span>${p.type}</span>
    <span class="badge">خطة ${idx+1}</span>
  </div>
  <div class="scenario-meta" style="border-color:${sc.border};background:#fafcff;">
    <div class="meta-item"><span class="lbl">الخدمة الفعلية: </span><span class="val">${displayFields} سنة</span></div>
    <div class="meta-item"><span class="lbl">الخدمة المطلوبة: </span><span class="val">${displayRequired} سنة</span></div>
    <div class="meta-item"><span class="lbl">عمر بداية الجدول: </span><span class="val">${(() => { const s = calculateExactAge(by, bm, bd, adjustedJoinDate.getFullYear(), adjustedJoinDate.getMonth()+1, adjustedJoinDate.getDate()); return s.years + ' سنة و ' + s.months + ' شهر و ' + s.days + ' يوم'; })()}</span></div>
    <div class="meta-item"><span class="lbl">عمر نهاية الخدمة: </span><span class="val">${endAge.years} سنة و ${endAge.months} شهر و ${endAge.days} يوم</span></div>
  </div>
  <div class="scenario-card" style="border-color:${sc.border};">
    <div class="table-title">الجدول التقاعدي — ${displayFields} سنة خدمة</div>
    <table>
      <thead><tr>
        <th>العمر</th><th>الفئة</th><th>أجر الفئة</th>
        <th style="background:linear-gradient(135deg,#a06010,#c8972a);">اشتراك المواطن</th>
        <th>مساهمة الدولة</th><th>المجموع</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

    if (p.type.includes('مع شراء') && missingDays > 0) {
      const maxMissingMonths = Math.min(missingDays / DAYS_PER_MONTH, MAX_PURCHASE_MONTHS);
      const totalPrice       = Math.floor(maxMissingMonths * avg * PURCHASE_PERCENTAGE);
      const dur              = daysToYMD(maxMissingMonths * DAYS_PER_MONTH);
      html += `
<div class="purchase-box">
  <div><span class="missing-period">⏳ ${formatDuration(dur.years, dur.months, dur.days)}</span></div>
  <p><strong>تفاصيل الشراء — المدة الناقصة</strong></p>
  <div class="total-price">${totalPrice.toLocaleString('en-US')} دينار<small>إجمالي كلفة شراء المدة الناقصة</small></div>
</div>`;
    }

    html += `
<div class="pension-box">
  <p>💵 الراتب التقاعدي المحسوب</p>
  <span class="pension-amount">${pens.toLocaleString('en-US')} دينار</span>
  <p class="pension-max">الحد الأقصى المسموح به: ${maxP.toLocaleString('en-US')} دينار</p>
</div>
  </div>
</div>`;
  });

  html += `
<div class="export-buttons">
  <button class="export-btn" onclick="exportHTML()">💾 تصدير بصيغة HTML</button>
  <button class="export-btn export-btn-print" onclick="exportPDF()">📄 تصدير بصيغة PDF</button>
</div>`;

  document.getElementById('result').innerHTML = html;
  window.lastResults = { name, gender, by, bm, bd, jy, jm, jd, plan, html, hasPrev, prevCat, hasPrevWork, prevWorkYrs, prevWorkMths };
});


window.exportHTML = function() {
  const d = window.lastResults;
  if (!d) return;
  const name       = d.name || 'المنتسب';
  const reportDate = new Date().toLocaleDateString('ar-IQ');

  const page = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1100">
<title>${escapeHtml(name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
:root{--primary:#1a3a6b;--primary-light:#2a5298;--accent:#c8972a;--accent-light:#e8b84b;--bg:#f0f4fa;--card:#fff;--border:#d0dce8;--text:#1a2840;--text-muted:#5a7090;--highlight:#1a3a6b;--highlight-bg:#fdf8dc;--row-alt:#f5f8fd;--row-citizen:#fff8e6;--row-citizen-border:#e8b84b;--shadow:0 4px 24px rgba(26,58,107,0.10);}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Cairo',Arial,sans-serif;background:var(--bg);direction:rtl;color:var(--text);}
.header{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 60%,#1e5799 100%);padding:28px 20px 22px;text-align:center;}
.header h1{color:#fff;font-size:26px;font-weight:900;}
.header-sub{color:var(--accent-light);font-size:13px;margin-top:6px;font-weight:600;}
.report-date{text-align:right;padding:10px 28px 0;font-size:12px;color:var(--text-muted);}
.container{max-width:1100px;margin:0 auto;padding:28px 18px 40px;}
.result-box{background:var(--card);border-radius:18px;border:1.5px solid var(--border);box-shadow:var(--shadow);padding:28px;}
.info-card{background:linear-gradient(135deg,#e8f0fb,#f4f8ff);border:1.5px solid #b8cce8;border-right:5px solid var(--primary);border-radius:13px;padding:18px 20px;margin-bottom:22px;}
.info-card h3{color:var(--primary);font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid #c5d8ee;padding-bottom:8px;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;}
.info-row{display:flex;align-items:center;gap:8px;font-size:14px;}
.info-label{color:var(--text-muted);font-weight:600;}
.info-value{color:var(--text);font-weight:700;}
.scenario-wrap{margin-top:28px;}
.scenario-header{border-radius:12px 12px 0 0;padding:14px 20px;display:flex;align-items:center;gap:10px;font-size:17px;font-weight:800;}
.scenario-header .badge{background:rgba(255,255,255,0.25);border-radius:20px;padding:3px 12px;font-size:12px;font-weight:700;}
.scenario-meta{border:1.5px solid;border-top:none;padding:14px 20px;display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;}
.meta-item{font-size:13px;}
.meta-item .lbl{color:var(--text-muted);font-weight:600;}
.meta-item .val{font-weight:700;}
.scenario-card{border:1.5px solid;border-top:none;border-radius:0 0 14px 14px;padding:0 20px 22px;margin-bottom:32px;background:#fff;overflow-x:auto;}
.table-title{font-size:16px;font-weight:800;padding:18px 0 10px;color:var(--primary);}
table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;border:2px solid #b8cce8;min-width:480px;}
th{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-light) 100%);color:#fff;padding:13px 10px;font-size:14px;font-weight:700;border-bottom:2px solid var(--accent);text-align:center;}
td{padding:11px 10px;font-size:14px;border-bottom:2px solid #dbe6f5;border-left:2px solid #c8d8ee;text-align:center;}
tr:nth-child(even) td{background:var(--row-alt);}
tr:nth-child(odd) td{background:#fff;}
tr.top-rows td{background:var(--highlight-bg)!important;color:var(--highlight);font-weight:600;}
.citizen-cell{background:var(--row-citizen)!important;color:#7a4e00!important;font-weight:700!important;}
.purchase-box{background:linear-gradient(135deg,#fff8e6,#fff0cc);border:2px solid var(--accent);border-radius:12px;padding:14px 18px;margin:14px auto;max-width:500px;text-align:center;}
.purchase-box p{margin:4px 0;font-size:13px;color:#7a4e00;}
.missing-period{display:inline-block;background:#fff;border:1.5px solid var(--accent);border-radius:20px;padding:3px 14px;font-size:14px;font-weight:700;color:#7a4e00;margin-bottom:8px;}
.total-price{background:linear-gradient(135deg,var(--accent),var(--accent-light));color:#fff;padding:8px 14px;border-radius:9px;font-size:15px;font-weight:800;margin-top:6px;}
.total-price small{font-size:11px;display:block;opacity:0.88;}
.pension-box{background:linear-gradient(135deg,#e8f4ff,#d0e8fa);border:2px solid var(--primary);border-radius:12px;padding:14px 18px;margin:14px auto;max-width:500px;text-align:center;}
.pension-box p{font-size:13px;color:var(--text-muted);margin:3px 0;font-weight:600;}
.pension-amount{display:block;font-size:26px;font-weight:900;color:var(--primary);margin:6px 0 4px;}
.pension-max{font-size:12px!important;color:var(--text-muted)!important;}
.export-buttons,button{display:none!important;}
@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}@page{size:A4;margin:12mm 10mm;}}
</style>
</head>
<body>
<div class="header">
  <h1>🏛️ حاسبة التقاعد الاجتماعي العراقي</h1>
  <div class="header-sub">استناداً إلى قانون الضمان الاجتماعي العراقي</div>
</div>
<div class="report-date">تاريخ التقرير: ${reportDate}</div>
<div class="container"><div class="result-box">${d.html}</div></div>
</body></html>`;

  const blob = new Blob([page], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `${name}.html` });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};


window.exportPDF = function() {
  const d = window.lastResults;
  if (!d) return;
  const name = d.name || 'المنتسب';
  const btn  = document.querySelector('.export-btn-print');
  btn.textContent = '⏳ جاري إنشاء PDF...';
  btn.disabled    = true;

  function loadScript(src, cb) {
    if (document.querySelector(`script[src="${src}"]`)) { cb(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = cb;
    document.head.appendChild(s);
  }

  function r(text) {
    // إضافة مسافة بين الأرقام والكلمات العربية قبل العكس
    return String(text)
      .replace(/(\d)([^\d\s,.])/g, '$1 $2')
      .replace(/([^\d\s,.])(\d)/g, '$1 $2')
      .split(' ')
      .filter(w => w.length > 0)
      .reverse()
      .join(' ');
  }

  function loadFont(key, url, cb) {
    const cached = localStorage.getItem(key);
    if (cached) { cb(cached); return; }
    fetch(url, { mode: 'cors' })
      .then(res => { if (!res.ok) throw new Error(); return res.arrayBuffer(); })
      .then(buf => {
        const bytes = new Uint8Array(buf);
        let bin = '';
        for (let i = 0; i < bytes.length; i += 8192)
          bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
        const b64 = btoa(bin);
        try { localStorage.setItem(key, b64); } catch(e) {}
        cb(b64);
      })
      .catch(() => {
        btn.textContent = '📄 تصدير بصيغة PDF';
        btn.disabled = false;
        alert('فشل تحميل الخط العربي، تأكد من الاتصال بالإنترنت');
      });
  }

  loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js', function() {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.min.js', function() {
      loadFont('amiri-regular', 'Amiri-Regular.ttf', function(reg) {
        loadFont('amiri-bold', 'Amiri-Bold.ttf', function(bold) {

          pdfMake.vfs['Amiri-Regular.ttf'] = reg;
          pdfMake.vfs['Amiri-Bold.ttf']    = bold;
          pdfMake.fonts = { Amiri: { normal:'Amiri-Regular.ttf', bold:'Amiri-Bold.ttf', italics:'Amiri-Regular.ttf', bolditalics:'Amiri-Bold.ttf' } };

          const { by, bm, bd, jy, jm, jd, hasPrev, prevCat, hasPrevWork, prevWorkYrs, prevWorkMths } = d;
          const prevWorkTotalMonthsPDF = ((prevWorkYrs||0)*12 + (prevWorkMths||0));
          const effJoinDate = new Date(jy, jm-1, jd);
          effJoinDate.setMonth(effJoinDate.getMonth() - prevWorkTotalMonthsPDF);
          const effJoin = calculateExactAge(by, bm, bd, effJoinDate.getFullYear(), effJoinDate.getMonth()+1, effJoinDate.getDate());
          const startAgeYearsPDF = hasPrevWork ? effJoin.years : join.years;
          const joinDate   = new Date(jy, jm - 1, jd);
          const today      = new Date();
          const now        = calculateExactAge(by, bm, bd, today.getFullYear(), today.getMonth()+1, today.getDate());
          const join       = calculateExactAge(by, bm, bd, jy, jm, jd);
          const reportDate = today.toLocaleDateString('ar-IQ');

          const C = { primary:'#1a3a6b', accent:'#c8972a', highlight:'#fdf8dc', citizen:'#fff8e6', rowAlt:'#f5f8fd', white:'#ffffff', muted:'#5a7090' };
          const planColors = ['#1a3a6b', '#a06010', '#0c5460'];
          const content = [];

          content.push({ table:{ widths:['*'], body:[[{ text:r('حاسبة التقاعد الاجتماعي العراقي'), fontSize:18, bold:true, color:C.white, alignment:'center', margin:[0,8,0,4] }]] }, layout:{ fillColor:()=>C.primary }, margin:[0,0,0,4] });
          content.push({ text:r('استناداً إلى قانون الضمان الاجتماعي العراقي'), fontSize:10, color:C.accent, alignment:'center', margin:[0,0,0,2] });
          content.push({ text:r(`تاريخ التقرير: ${reportDate}`), fontSize:9, color:C.muted, alignment:'right', margin:[0,0,0,10] });

          content.push({
            table:{ widths:['*','*'], body:[
              [{ text:r('معلومات المشترك'), colSpan:2, bold:true, fontSize:12, color:C.primary, alignment:'right', margin:[0,4,4,4] },{}],
              [{ text:r(`الاسم: ${name}`), fontSize:10, alignment:'right', margin:[0,2,4,2] }, { text:r(`الجنس: ${d.gender==='male'?'رجل':'امرأة'}`), fontSize:10, alignment:'right', margin:[0,2,4,2] }],
              [{ text:r(`تاريخ الميلاد: ${by}/${bm}/${bd}`), fontSize:10, alignment:'right', margin:[0,2,4,2] }, { text:r(`تاريخ الانتساب: ${jy}/${jm}/${jd}`), fontSize:10, alignment:'right', margin:[0,2,4,2] }],
              [{ text:r(`العمر الحالي: ${now.years}‏ سنة‏ و‏ ${now.months}‏ شهر‏ و‏ ${now.days}‏ يوم`), fontSize:10, alignment:'right', margin:[0,2,4,2] }, { text:r(`عمر الانتساب: ${join.years}‏ سنة‏ و‏ ${join.months}‏ شهر‏ و‏ ${join.days}‏ يوم`), fontSize:10, alignment:'right', margin:[0,2,4,2] }],
              ...(hasPrev ? [[{ text:r(`فئة قديمة: فئة‏ ${prevCat}`), colSpan:2, fontSize:10, alignment:'right', margin:[0,2,4,2] },{}]] : []),
              ...(hasPrevWork ? [[{ text:r(`خدمة سابقة: ${{prevWorkYrs}}‏ سنة`), colSpan:2, fontSize:10, alignment:'right', margin:[0,2,4,2] },{}]] : []),
            ]},
            layout:{ fillColor:(row)=>row===0?'#e8f0fb':C.white, hLineColor:()=>'#b8cce8', vLineColor:()=>'#b8cce8' },
            margin:[0,0,0,16]
          });

          d.plan.forEach((p, idx) => {
            const sub             = p.exact ? 0 : 1;
            const fullTable       = generatePensionTable(p.fields + (p.exact ? 1 : 0), hasPrev ? prevCat : 0);
            const table           = fullTable;
            const avg             = calculateAverageSalary(fullTable);
            const displayFields   = p.fields - sub;
            const displayRequired = p.required - sub;
            const adjJoinDate     = hasPrevWork ? effJoinDate : joinDate;
            const pens            = calculatePension(avg, (p.required - sub) * MONTHS_PER_YEAR);
            const maxP            = Math.floor(avg * MAX_PENSION_PERCENTAGE);
            const endDate         = addDaysToDate(addYearsToDate(adjJoinDate, displayFields), 1);
            const endAge          = calculateExactAge(by, bm, bd, endDate.getFullYear(), endDate.getMonth()+1, endDate.getDate());
            const missingDays     = Math.max(0, (displayRequired - displayFields) * DAYS_PER_YEAR);
            const pc              = planColors[idx % planColors.length];

            content.push({ table:{ widths:['*'], body:[[{ text:r(`خطة ${idx+1}: ${p.type}`), fontSize:12, bold:true, color:C.white, alignment:'right', margin:[0,5,6,5] }]] }, layout:{ fillColor:()=>pc }, margin:[0,0,0,0] });
            content.push({ table:{ widths:['*','*'], body:[
              [{ text:r(`الخدمة الفعلية: ${displayFields}‏ سنة`), fontSize:10, alignment:'right', margin:[0,3,4,3] }, { text:r(`الخدمة المطلوبة: ${displayRequired}‏ سنة`), fontSize:10, alignment:'right', margin:[0,3,4,3] }],
              [{ text:r(`عمر بداية الجدول: ${join.years}‏ سنة‏ و‏ ${join.months}‏ شهر‏ و‏ ${join.days}‏ يوم`), fontSize:9, alignment:'right', margin:[0,3,4,3] }, { text:r(`عمر نهاية الخدمة: ${endAge.years}‏ سنة‏ و‏ ${endAge.months}‏ شهر‏ و‏ ${endAge.days}‏ يوم`), fontSize:9, alignment:'right', margin:[0,3,4,3] }]
            ]}, layout:{ fillColor:()=>'#fafcff', hLineColor:()=>pc, vLineColor:()=>pc }, margin:[0,0,0,0] });

            const tableBody = [[
              { text:r('المجموع'),        bold:true, color:C.white, alignment:'right', fontSize:13, margin:[0,4,2,4] },
              { text:r('مساهمة الدولة'),  bold:true, color:C.white, alignment:'right', fontSize:13, margin:[0,4,2,4] },
              { text:r('اشتراك المواطن'), bold:true, color:C.white, alignment:'right', fontSize:13, margin:[0,4,2,4] },
              { text:r('أجر الفئة'),      bold:true, color:C.white, alignment:'right', fontSize:13, margin:[0,4,2,4] },
              { text:r('الفئة'),          bold:true, color:C.white, alignment:'center', fontSize:13, margin:[0,4,0,4] },
              { text:r('العمر'),          bold:true, color:C.white, alignment:'right', fontSize:13, margin:[0,4,2,4] },
            ]];

            let currentDate = new Date(adjJoinDate);
            for (let i = 0; i < table.length; i++) {
              const cat     = categories[table[i] - 1];
              const age     = calculateExactAge(by, bm, bd, currentDate.getFullYear(), currentDate.getMonth()+1, currentDate.getDate());
              const isLast6 = i >= table.length - 6;
              tableBody.push([
                { text:cat.total.toLocaleString('en-US'),      fontSize:11, alignment:'right', bold:isLast6 },
                { text:cat.stateShare.toLocaleString('en-US'), fontSize:11, alignment:'right' },
                { text:cat.userShare.toLocaleString('en-US'),  fontSize:11, alignment:'right', bold:true },
                { text:cat.salary.toLocaleString('en-US'),     fontSize:11, alignment:'right' },
                { text:String(table[i]),                       fontSize:11, alignment:'center' },
                { text:r(`${age.years}‏ سنة‏ و‏ ${age.months}‏ شهر‏ و‏ ${age.days}‏ يوم`), fontSize:11, alignment:'right', bold:isLast6 },
              ]);
              currentDate.setFullYear(currentDate.getFullYear() + 1);
            }

            content.push({ table:{ widths:[79,91,91,69,59,113], body:tableBody }, layout:{
              fillColor:(row,node,col)=>{ if(row===0)return pc; if(row>=tableBody.length-6)return C.highlight; if(col===2)return C.citizen; return row%2===0?C.white:C.rowAlt; },
              hLineColor:()=>'#b8cce8', vLineColor:()=>'#b8cce8'
            }, margin:[0,0,0,6] });

            if (p.type.includes('مع شراء') && missingDays > 0) {
              const maxMissingMonths = Math.min(missingDays / DAYS_PER_MONTH, MAX_PURCHASE_MONTHS);
              const totalPrice       = Math.floor(maxMissingMonths * avg * PURCHASE_PERCENTAGE);
              const dur              = daysToYMD(maxMissingMonths * DAYS_PER_MONTH);
              content.push({ table:{ widths:['*'], body:[[{ stack:[
                { text:r(`مدة الشراء: ${formatDuration(dur.years,dur.months,dur.days)}`), fontSize:10, bold:true, color:'#7a4e00', alignment:'center' },
                { text:r(`إجمالي كلفة شراء المدة الناقصة: ${totalPrice.toLocaleString('en-US')}‏ دينار`), fontSize:11, bold:true, color:'#7a4e00', alignment:'center', margin:[0,4,0,0] }
              ], margin:[0,6,0,6] }]] }, layout:{ fillColor:()=>'#fff8e6', hLineColor:()=>C.accent, vLineColor:()=>C.accent }, margin:[40,0,40,6] });
            }

            content.push({ table:{ widths:['*'], body:[[{ stack:[
              { text:r('الراتب التقاعدي المحسوب'), fontSize:10, color:C.muted, alignment:'center' },
              { text:r(`${pens.toLocaleString('en-US')}‏ دينار`), fontSize:18, bold:true, color:C.primary, alignment:'center', margin:[0,4,0,4] },
              { text:r(`الحد الأقصى المسموح به: ${maxP.toLocaleString('en-US')}‏ دينار`), fontSize:9, color:C.muted, alignment:'center' }
            ], margin:[0,8,0,8] }]] }, layout:{ fillColor:()=>'#e8f4ff', hLineColor:()=>C.primary, vLineColor:()=>C.primary }, margin:[40,0,40,20] });
          });

          pdfMake.createPdf({
            pageSize:'A4', pageOrientation:'portrait', pageMargins:[20,20,20,20], pageDirection:'rtl',
            content,
            defaultStyle:{ font:'Amiri', alignment:'right', direction:'rtl' },
            footer:(currentPage,pageCount)=>({
              table:{ widths:['*','*'], body:[[
                { text:r('حاسبة التقاعد الاجتماعي العراقي'), fontSize:7, color:C.white, margin:[6,3,0,3] },
                { text:r(`صفحة ${currentPage} من ${pageCount}`), fontSize:7, color:C.white, alignment:'right', margin:[0,3,6,3] }
              ]] },
              layout:{ fillColor:()=>C.primary, hLineWidth:()=>0, vLineWidth:()=>0 },
              margin:[20,0,20,0]
            })
          }).download(`${name}.pdf`);

          btn.textContent = '📄 تصدير بصيغة PDF';
          btn.disabled    = false;
        });
      });
    });
  });
};
