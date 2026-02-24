/**
 * Seed script for crm_db – fills all major tables with realistic dummy data.
 * Safe to re-run: uses ON CONFLICT DO NOTHING / DO UPDATE throughout.
 *
 * Run:  node server/seed-crm.mjs
 */

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  host: 'localhost', port: 5432,
  user: 'postgres', password: '0000',
  database: 'crm_db',
});
await client.connect();
console.log('Connected to crm_db');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const q  = (sql, vals) => client.query(sql, vals);
const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rndInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad   = (n) => String(n).padStart(2, '0');

/** Returns a Date shifted `months` months back from today */
const monthsAgo = (months, day = 1) => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return d.toISOString().split('T')[0];
};
/** Random date between two ISO strings */
const rndDate = (from, to) => {
  const f = new Date(from).getTime();
  const t = new Date(to).getTime();
  return new Date(f + Math.random() * (t - f)).toISOString().split('T')[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. edu_centers
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[1/9] edu_centers');
await q(`
  INSERT INTO edu_centers (center_name, center_code, email, phone, address, city, principal_name)
  VALUES
    ('EduFlow Academy',       'EFA001', 'info@eduflow.com',       '+1-555-0101', '100 Learning Ave', 'New York',     'Dr. Sarah Mitchell'),
    ('Bright Minds Institute','BMI002', 'contact@brightminds.com','+1-555-0202', '200 Scholar Blvd', 'Los Angeles',  'Prof. James Carter'),
    ('Global Learning Hub',  'GLH003', 'hello@globallearn.com',  '+1-555-0303', '300 Knowledge St',  'Chicago',      'Ms. Linda Tran')
  ON CONFLICT (center_code) DO NOTHING
`);
const centers = (await q('SELECT center_id FROM edu_centers ORDER BY center_id')).rows.map(r => r.center_id);
console.log(`  → ${centers.length} centers`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. teachers
// ─────────────────────────────────────────────────────────────────────────────
console.log('[2/9] teachers');
const teacherData = [
  ['T001','Alice','Johnson', 'alice@eduflow.com',   '+1-555-1001','1985-03-14','Female','B.Ed, M.A. English',   'English',  centers[0]],
  ['T002','Robert','Smith',  'robert@eduflow.com',  '+1-555-1002','1978-07-22','Male',  'Ph.D Mathematics',      'Math',     centers[0]],
  ['T003','Maria','Garcia',  'maria@eduflow.com',   '+1-555-1003','1990-11-05','Female','M.Sc Science',          'Science',  centers[0]],
  ['T004','David','Lee',     'david@brightminds.com','+1-555-1004','1982-01-30','Male',  'B.Ed, M.A. History',   'History',  centers[1]],
  ['T005','Emily','Chen',    'emily@brightminds.com','+1-555-1005','1993-06-18','Female','M.A. Literature',      'English',  centers[1]],
  ['T006','Omar','Hassan',   'omar@global.com',     '+1-555-1006','1980-09-12','Male',  'Ph.D Physics',          'Physics',  centers[2]],
];
for (const [eid, fn, ln, email, phone, dob, gender, qual, spec, cid] of teacherData) {
  await q(`
    INSERT INTO teachers (center_id, employee_id, first_name, last_name, email, phone,
                          date_of_birth, gender, qualification, specialization, status, roles, username, password_hash)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8::teacher_gender,$9,$10,'Active','["Teacher"]',$11,'placeholder')
    ON CONFLICT (employee_id) DO NOTHING
  `, [cid, eid, fn, ln, email, phone, dob, gender, qual, spec, eid.toLowerCase()]);
}
const teachers = (await q('SELECT teacher_id, center_id FROM teachers ORDER BY teacher_id')).rows;
console.log(`  → ${teachers.length} teachers`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. classes
// ─────────────────────────────────────────────────────────────────────────────
console.log('[3/9] classes');
const classData = [
  ['Advanced English B2', 'ENG-B2-01', 2, 'A', 25, teachers[0].teacher_id, '101', teachers[0].center_id, 320.00, 'Monthly'],
  ['Mathematics Grade 10', 'MATH-10-A', 3, 'A', 30, teachers[1].teacher_id, '102', teachers[1].center_id, 280.00, 'Monthly'],
  ['Science Fundamentals', 'SCI-F-01',  2, 'B', 28, teachers[2].teacher_id, '103', teachers[2].center_id, 300.00, 'Monthly'],
  ['History & Culture',    'HIS-C-01',  3, 'A', 22, teachers[3].teacher_id, '201', teachers[3].center_id, 250.00, 'Monthly'],
  ['English Literature',   'ENG-LIT-B', 2, 'B', 24, teachers[4].teacher_id, '202', teachers[4].center_id, 310.00, 'Monthly'],
  ['Physics Advanced',     'PHY-ADV-1', 4, 'A', 20, teachers[5].teacher_id, '301', teachers[5].center_id, 350.00, 'Monthly'],
  ['IELTS Preparation',    'IELTS-01',  3, 'C', 18, teachers[0].teacher_id, '104', teachers[0].center_id, 450.00, 'Monthly'],
  ['Beginner English A1',  'ENG-A1-01', 1, 'A', 30, teachers[0].teacher_id, '105', teachers[0].center_id, 200.00, 'Monthly'],
];
for (const [name, code, level, sec, cap, tid, room, cid, amount, freq] of classData) {
  await q(`
    INSERT INTO classes (center_id, class_name, class_code, level, section, capacity,
                         teacher_id, room_number, payment_amount, payment_frequency)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::payment_frequency)
    ON CONFLICT (class_code) DO NOTHING
  `, [cid, name, code, level, sec, cap, tid, room, amount, freq]);
}
const classes = (await q('SELECT class_id, center_id, teacher_id, payment_amount FROM classes ORDER BY class_id')).rows;
console.log(`  → ${classes.length} classes`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. subjects
// ─────────────────────────────────────────────────────────────────────────────
console.log('[4/9] subjects');
for (const cls of classes) {
  const subs = ['Core Module','Speaking Skills','Writing Skills','Reading Comprehension'];
  for (let i = 0; i < subs.length; i++) {
    await q(`
      INSERT INTO subjects (class_id, subject_name, subject_code, teacher_id, total_marks, passing_marks)
      VALUES ($1,$2,$3,$4,100,40)
      ON CONFLICT DO NOTHING
    `, [cls.class_id, subs[i], `SUB-${cls.class_id}-${i+1}`, cls.teacher_id]);
  }
}
console.log('  → subjects inserted');

// ─────────────────────────────────────────────────────────────────────────────
// 5. students  (90 students spread across classes)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[5/9] students');
const firstNames = ['Emma','Liam','Olivia','Noah','Ava','Elijah','Sophia','James','Isabella','William',
                    'Mia','Benjamin','Charlotte','Lucas','Amelia','Henry','Harper','Alexander','Evelyn',
                    'Mason','Abigail','Ethan','Emily','Daniel','Elizabeth','Michael','Mila','Owen','Ella',
                    'Sebastian','Scarlett','Aiden','Victoria','Carter','Luna','Jayden','Grace','Julian',
                    'Chloe','Levi','Penelope','Isaac','Layla','Anthony','Riley','Dylan','Zoey','Lincoln'];
const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Taylor',
                    'Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Young','Robinson',
                    'Lewis','Walker','Hall','Allen','Scott','Green','Baker','Adams','Nelson','Hill','Ramirez'];
const statuses   = ['Active','Active','Active','Active','Active','Active','Inactive','Graduated','Removed'];

let studentCount = 0;
for (let i = 0; i < 90; i++) {
  const fn  = firstNames[i % firstNames.length];
  const ln  = lastNames[i % lastNames.length];
  const cls = classes[i % classes.length];
  const status = i < 72 ? 'Active' : rnd(['Inactive','Graduated','Removed']);
  const dob = `${rndInt(1995,2008)}-${pad(rndInt(1,12))}-${pad(rndInt(1,28))}`;
  const enr = `ENR-${String(i+1).padStart(4,'0')}`;
  const createdAt = monthsAgo(rndInt(0,8), rndInt(1,28));

  await q(`
    INSERT INTO students (center_id, enrollment_number, first_name, last_name,
                          username, email, phone, date_of_birth, gender, status,
                          teacher_id, class_id, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::student_gender,$10::student_status,$11,$12,$13)
    ON CONFLICT (enrollment_number) DO NOTHING
  `, [
    cls.center_id, enr, fn, ln,
    `${fn.toLowerCase()}.${ln.toLowerCase()}${i}`,
    `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@student.com`,
    `+1-555-${String(2000+i).padStart(4,'0')}`,
    dob, rnd(['Male','Female']), status,
    cls.teacher_id, cls.class_id, createdAt,
  ]);
  studentCount++;
}
const students = (await q('SELECT student_id, class_id FROM students ORDER BY student_id')).rows;
console.log(`  → ${students.length} students`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. payments  (spread over last 8 months to fill charts)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[6/9] payments');
let payCount = 0;
const activeStudents = (await q(`SELECT s.student_id, s.center_id, c.payment_amount
  FROM students s JOIN classes c ON c.class_id = s.class_id WHERE s.status = 'Active'`)).rows;

const payMethods = ['Cash','Credit Card','Bank Transfer','Check','Digital Wallet'];
let receiptN = 1000;

for (const s of activeStudents) {
  const months = rndInt(3, 8); // each student has 3-8 months of payment history
  for (let m = 0; m < months; m++) {
    const payDate = monthsAgo(m, rndInt(1, 28));
    await q(`
      INSERT INTO payments (student_id, center_id, payment_date, amount, currency,
                            payment_method, receipt_number, payment_status, payment_type)
      VALUES ($1,$2,$3,$4,'USD',$5::payment_method,$6,'Completed','Monthly Tuition')
      ON CONFLICT (receipt_number) DO NOTHING
    `, [
      s.student_id, s.center_id, payDate,
      Number(s.payment_amount),
      rnd(payMethods),
      `RCP-${String(receiptN++).padStart(6,'0')}`,
    ]);
    payCount++;
  }
}
console.log(`  → ${payCount} payments`);

// ─────────────────────────────────────────────────────────────────────────────
// 7. debts  (about 20% of active students have an open debt)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[7/9] debts');
let debtCount = 0;
const debtStudents = activeStudents.filter((_, i) => i % 5 === 0);
for (const s of debtStudents) {
  const amount = rndInt(1,3) * Number(s.payment_amount);
  const paid   = rndInt(0,1) * Number(s.payment_amount);
  const balance = amount - paid;
  const debtDate = monthsAgo(rndInt(1,4), rndInt(1,28));
  const dueDate  = monthsAgo(0, rndInt(1,15));
  await q(`
    INSERT INTO debts (student_id, center_id, debt_amount, debt_date, due_date,
                       amount_paid, balance, remarks)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'Overdue monthly tuition')
  `, [s.student_id, s.center_id, amount, debtDate, dueDate, paid, balance]);
  debtCount++;
}
console.log(`  → ${debtCount} debts`);

// ─────────────────────────────────────────────────────────────────────────────
// 8. assignments  (2 per class)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[8/9] assignments');
const assignTitles = ['Mid-term Essay','Vocabulary Quiz','Grammar Worksheet',
                      'Reading Comprehension Test','Speaking Practice Report','Final Project'];
for (const cls of classes) {
  for (let a = 0; a < 2; a++) {
    const dueDate = monthsAgo(-1 * rndInt(0,2), rndInt(5,25)); // upcoming
    await q(`
      INSERT INTO assignments (class_id, assignment_title, description, due_date, status)
      VALUES ($1,$2,'Complete all exercises and submit by the due date.',$3,'Pending')
    `, [cls.class_id, assignTitles[a % assignTitles.length], dueDate]);
  }
}
console.log('  → assignments inserted');

// ─────────────────────────────────────────────────────────────────────────────
// 9. tests  (2 active tests with future start dates)
// ─────────────────────────────────────────────────────────────────────────────
console.log('[9/9] tests');
const center1 = centers[0];
const su = (await q(`SELECT superuser_id FROM superusers LIMIT 1`)).rows[0];
const suId = su?.superuser_id ?? 1;

const testRows = [
  ['B2 Speaking Mock Exam',      'essay',           'Speak for 2 minutes on the given topic.',   60, 40, 60, center1],
  ['IELTS Reading Practice',     'reading_passage', 'Read the passage and answer questions.',    80, 56, 50, center1],
  ['Grammar MCQ Test',           'multiple_choice', 'Choose the correct answer for each item.',  50, 35, 30, center1],
  ['Advanced Vocabulary Quiz',   'short_answer',    'Write the correct word for each definition.',40, 28, 20, center1],
];

for (let i = 0; i < testRows.length; i++) {
  const [name, type, desc, total, passing, dur, cid] = testRows[i];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + (i === 0 ? 0 : i * 2)); // today + 0/2/4/6 days
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  await q(`
    INSERT INTO tests (center_id, test_name, test_type, description, total_marks,
                       passing_marks, duration_minutes, is_active, start_date, end_date,
                       created_by, created_by_type, test_data)
    VALUES ($1,$2,$3::test_type,$4,$5,$6,$7,TRUE,$8,$9,$10,'superuser','{}')
  `, [cid, name, type, desc, total, passing, dur,
      startDate.toISOString(), endDate.toISOString(), suId]);
}
console.log('  → tests inserted');

// ─────────────────────────────────────────────────────────────────────────────
// Update class total_students counts
// ─────────────────────────────────────────────────────────────────────────────
await q(`
  UPDATE classes c
  SET total_students = (
    SELECT COUNT(*) FROM students s
    WHERE s.class_id = c.class_id AND s.status = 'Active'
  )
`);

await client.end();

console.log('\n✓ Seed complete! crm_db is now populated.');
console.log('  Restart the server and refresh the dashboard to see live data.');
