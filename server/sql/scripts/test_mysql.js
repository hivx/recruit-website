// (function () {
//   const waitForFrappe = setInterval(() => {
//     if (typeof frappe !== "undefined" && frappe.session?.user && typeof root_element !== "undefined") {
//       clearInterval(waitForFrappe);
//       initAttendanceCalendar(root_element);
//     }
//   }, 300);

//   async function initAttendanceCalendar(root) {
//     const user = frappe.session.user;
//     const emp = await getEmployee(user);

//     const gridEl = root.querySelector("#att-cal-grid");
//     const labelEl = root.querySelector("#att-month-label");
//     const sumLeft = root.querySelector("#att-summary-left");
//     const sumRight = root.querySelector("#att-summary-right");

//     const prevBtn = root.querySelector("#att-prev-month");
//     const nextBtn = root.querySelector("#att-next-month");
//     const refreshBtn = root.querySelector("#att-refresh");

//     if (!emp) {
//       gridEl.innerHTML = "<p>Không tìm thấy nhân viên gắn với tài khoản này.</p>";
//       return;
//     }

//     let current = new Date();
//     let month = current.getMonth();
//     let year = current.getFullYear();

//     prevBtn.onclick = () => { month = month === 0 ? 11 : month - 1; if (month === 11) year--; render(); };
//     nextBtn.onclick = () => { month = month === 11 ? 0 : month + 1; if (month === 0) year++; render(); };
//     refreshBtn.onclick = () => render();

//     render();

//     async function render() {
//       await renderMonth(emp, year, month, gridEl, labelEl, sumLeft, sumRight);
//     }
//   }

//   async function getEmployee(user) {
//     let r = await frappe.db.get_value("Employee", { user_id: user }, ["name"]);
//     if (r.message?.name) return r.message;

//     r = await frappe.db.get_value("Employee", { user: user }, ["name"]);
//     return r.message || null;
//   }

//   async function renderMonth(emp, year, month, gridEl, labelEl, sumLeft, sumRight) {
//     labelEl.textContent = `Tháng ${month + 1} / ${year}`;
//     gridEl.innerHTML = "Đang tải...";

//     const start = new Date(year, month, 1);
//     const end = new Date(year, month + 1, 0);
//     const startStr = formatDate(start);
//     const endStr = formatDate(end);

//     const weekMap = await fetchShiftWeekOff(emp.name);
//     const [checkCtx, leaveMap] = await Promise.all([
//       fetchCheckin(emp.name, year, month),
//       fetchLeave(emp.name, startStr, endStr),
//     ]);

//     const { logsByDay, totalHours, daysWithLogs } = checkCtx;

//     gridEl.innerHTML = "";

//     const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
//     weekdays.forEach(d => {
//       let el = document.createElement("div");
//       el.className = "att-cal-weekday";
//       el.textContent = d;
//       gridEl.appendChild(el);
//     });

//     const first = new Date(year, month, 1);
//     const pad = (first.getDay() + 6) % 7;
//     for (let i = 0; i < pad; i++) {
//       let el = document.createElement("div");
//       el.className = "att-cal-cell att-cal-cell-empty";
//       gridEl.appendChild(el);
//     }

//     let work = 0, off = 0, logOK = 0, logMissing = 0, leaveOff = 0, leaveWork = 0;

//     for (let day = 1; day <= end.getDate(); day++) {
//       const dObj = new Date(year, month, day);
//       const key = formatDate(dObj);
//       const w = ((dObj.getDay() + 6) % 7) + 1;
//       const rule = weekMap[w];

//       const logs = logsByDay[key] || [];
//       const leave = leaveMap[key] || [];

//       const cell = document.createElement("div");
//       cell.className = "att-cal-cell";

//       const dateLabel = document.createElement("div");
//       dateLabel.className = "att-cal-date";
//       dateLabel.textContent = day;
//       cell.appendChild(dateLabel);

//       const meta = document.createElement("div");
//       meta.className = "att-cal-meta";

//       /* =========================
//          1. Nghỉ phép
//       ==========================*/
//       if (leave.length > 0) {
//         if (rule === "OFF") {
//           off++;
//           leaveOff++;
//           cell.classList.add("att-day-leave");
//           meta.innerHTML = `<span>Nghỉ phép (OFF)</span>`;
//         } else {
//           work++;
//           leaveWork++;
//           cell.classList.add("att-day-leave");
//           meta.innerHTML = `<span>Nghỉ phép</span>`;
//         }
//       }

//       /* =========================
//          2. Ngày OFF
//       ==========================*/
//       else if (rule === "OFF") {
//         off++;
//         cell.classList.add("att-day-off");
//         meta.innerHTML = `<span>Ngày nghỉ</span>`;
//       }

//       /* =========================
//          3. Có log (đủ hoặc thiếu)
//       ==========================*/
//       else if (logs.length > 0) {
//         work++;
//         logOK++;

//         const IN = logs.find(l => l.log_type === "IN");
//         const OUT = [...logs].reverse().find(l => l.log_type === "OUT");

//         let inTxt = IN ? formatTime(IN.time) : "—";
//         let outTxt = OUT ? formatTime(OUT.time) : "—";

//         if (IN && OUT) cell.classList.add("att-day-full");
//         else cell.classList.add("att-day-partial");

//         meta.innerHTML = `
//           <span>IN: ${inTxt}</span>
//           <span>OUT: ${outTxt}</span>
//         `;
//       }

//       /* =========================
//          4. Không có log (mà phải đi làm)
//       ==========================*/
//       else {
//         work++;
//         logMissing++;
//         cell.classList.add("att-day-no-log");
//         meta.innerHTML = `
//           <span>IN: —</span>
//           <span>OUT: —</span>
//         `;
//       }

//       cell.appendChild(meta);
//       gridEl.appendChild(cell);
//     }

//     sumLeft.textContent = `Lịch: phải đi làm ${work} ngày • được nghỉ ${off} ngày`;
//     sumRight.textContent = `Đi làm có chấm công: ${logOK} • Không chấm công: ${logMissing} • Nghỉ OFF: ${leaveOff} • Nghỉ phép: ${leaveWork} • Giờ: ${totalHours.toFixed(1)}h • Có log: ${daysWithLogs}`;
//   }

//   async function fetchShiftWeekOff(employee) {
//     const list = await frappe.db.get_list("Shift Schedule Assignment", {
//       fields: ["shift_schedule"],
//       filters: { employee: employee, shift_status: "Active" },
//       limit: 1
//     });

//     const scheduleName = list[0]?.shift_schedule;
//     const schedule = await frappe.db.get_doc("Shift Schedule", scheduleName);

//     const out = {};
//     const map = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:7 };

//     schedule.repeat_on_days.forEach(r => {
//       const w = map[r.day];
//       if (w) out[w] = "WORK";
//     });

//     for (let i = 1; i <= 7; i++) if (!out[i]) out[i] = "OFF";
//     return out;
//   }

//   async function fetchCheckin(emp, year, month) {
//     const startStr = formatDateKey(new Date(year, month, 1));
//     const nextStr  = formatDateKey(new Date(year, month + 1, 1));

//     const logs = await frappe.db.get_list("Employee Checkin", {
//       fields: ["name", "time", "log_type"],
//       filters: [
//         ["employee", "=", emp],
//         ["time", ">=", startStr],
//         ["time", "<", nextStr]
//       ],
//       order_by: "time asc",
//       limit: 1000
//     });

//     const byDay = {};
//     let totalHours = 0;
//     let daysWithLogs = 0;

//     (logs || []).forEach(l => {
//       const dKey = formatDateKey(new Date(l.time));   // ★ giữ nguyên logic gốc
//       if (!byDay[dKey]) byDay[dKey] = [];
//       byDay[dKey].push(l);
//     });

//     Object.keys(byDay).forEach(dKey => {
//       const arr = byDay[dKey];
//       if (!arr.length) return;

//       daysWithLogs++;

//       const firstIn = arr.find(l => l.log_type === "IN");
//       const lastOut = [...arr].reverse().find(l => l.log_type === "OUT");

//       if (firstIn && lastOut) {
//         const diff = new Date(lastOut.time) - new Date(firstIn.time);
//         if (diff > 0) totalHours += diff / 3600000;
//       }
//     });

//     return { logsByDay: byDay, totalHours, daysWithLogs };
//   }

//   function formatDateKey(dateObj) {
//     const y = dateObj.getFullYear();
//     const m = String(dateObj.getMonth() + 1).padStart(2, "0");
//     const d = String(dateObj.getDate()).padStart(2, "0");
//     return `${y}-${m}-${d}`;
//   }

//   async function fetchLeave(emp, start, end) {
//     const list = await frappe.db.get_list("Leave Application", {
//       fields: ["from_date", "to_date"],
//       filters: {
//         employee: emp,
//         docstatus: 1,
//         from_date: ["<=", end],
//         to_date: [">=", start]
//       }
//     });

//     const out = {};
//     list.forEach(l => {
//       const from = new Date(l.from_date);
//       const to = new Date(l.to_date);
//       for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
//         const key = formatDate(d);
//         if (!out[key]) out[key] = [];
//         out[key].push(l);
//       }
//     });
//     return out;
//   }

//   function formatDate(d) {
//     return d.toISOString().slice(0, 10);
//   }

//   function formatTime(t) {
//     return new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
//   }

// })();

// .att-calendar-wrapper {
//   max-width: 900px;
//   margin: 16px auto;
//   padding: 16px;
//   border-radius: 12px;
//   background: #ffffff;
//   box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
//   font-family: system-ui, sans-serif;
// }

// /* HEADER */
// .att-cal-header {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// }

// .att-cal-actions {
//   display: flex;
//   gap: 8px;
// }

// .att-cal-actions button {
//   border: 1px solid #e5e7eb;
//   background: #f9fafb;
//   padding: 5px 10px;
//   border-radius: 6px;
//   cursor: pointer;
// }
// .att-cal-actions button:hover {
//   background: #e5e7eb;
// }

// /* LEGEND */
// .att-cal-legend {
//   display: flex;
//   gap: 12px;
//   margin: 12px 0;
//   flex-wrap: wrap;
// }

// .att-badge {
//   width: 14px;
//   height: 14px;
//   border-radius: 4px;
//   display: inline-block;
// }

// .att-badge-work { background: #dcfce7; border: 1px solid #86efac; }
// .att-badge-missing { background: #fecaca; border: 1px solid #ef4444; }
// .att-badge-off { background: #f3f4f6; border: 1px solid #d1d5db; }
// .att-badge-leave { background: #ede9fe; border: 1px solid #ddd6fe; }

// /* GRID */
// .att-cal-grid {
//   display: grid;
//   grid-template-columns: repeat(7, 1fr);
//   gap: 6px;
// }

// .att-cal-weekday {
//   text-align: center;
//   font-size: 0.8rem;
//   font-weight: 600;
//   color: #6b7280;
// }

// /* CELL */
// .att-cal-cell {
//   min-height: 88px;
//   padding: 4px 6px;
//   border: 1px solid #e5e7eb;
//   border-radius: 8px;
//   background: #fafafa;
//   font-size: 0.8rem;
// }

// .att-cal-cell-empty {
//   background: transparent;
//   border: none;
// }

// .att-cal-date {
//   font-weight: 600;
// }

// /* STATES */
// .att-day-off {
//   background: #f3f4f6;
//   border-color: #e5e7eb;
// }

// .att-day-leave {
//   background: #ede9fe;
//   border-color: #ddd6fe;
// }

// /* FULL LOG */
// .att-day-full {
//   background: #dcfce7;
//   border-color: #86efac;
// }

// /* PARTIAL LOG */
// .att-day-partial {
//   background: #fee2e2;
//   border-color: #fecaca;
// }

// /* NGÀY PHẢI LÀM NHƯNG KHÔNG LOG → ĐỎ */
// .att-day-no-log {
//   background: #fee2e2 !important;
//   border: 1px solid #ef4444 !important;
// }

// .att-day-no-log .att-cal-date {
//   color: #b91c1c !important;
//   font-weight: 700;
// }

// /* FOOTER */
// .att-cal-footer {
//   margin-top: 14px;
//   font-size: 0.85rem;
//   display: flex;
//   justify-content: space-between;
// }

// <div class="att-calendar-wrapper">

//   <div class="att-cal-header">
//     <div class="att-cal-title" id="att-month-label">Chấm công theo tháng</div>

//     <div class="att-cal-actions">
//       <button id="att-refresh" title="Tải lại dữ liệu">🔄</button>
//       <button id="att-prev-month">&laquo; Tháng trước</button>
//       <button id="att-next-month">Tháng sau &raquo;</button>
//     </div>
//   </div>

//   <div class="att-cal-legend">
//     <span><span class="att-badge att-badge-work"></span> Có đi làm</span>
//     <span><span class="att-badge att-badge-missing"></span> Không đi làm</span>
//     <span><span class="att-badge att-badge-off"></span> Ngày nghỉ</span>
//     <span><span class="att-badge att-badge-leave"></span> Nghỉ phép</span>
//   </div>

//   <div class="att-cal-grid" id="att-cal-grid"></div>

//   <div class="att-cal-footer">
//     <div id="att-summary-left"></div>
//     <div id="att-summary-right"></div>
//   </div>

// </div>
// **/
