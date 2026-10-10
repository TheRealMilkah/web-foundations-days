PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE
);

CREATE TABLE enrolments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  grade TEXT,
  enrolled_at TEXT NOT NULL DEFAULT (date('now')),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE (student_id, course_id)
);

INSERT INTO students (name, email) VALUES
('Milkah Kerubo', 'milkah@example.com'),
('John Otieno', 'john.otieno@example.com'),
('Aisha Mohammed', 'aisha@example.com'),
('Brian Kimani', 'brian@example.com');

INSERT INTO courses (title, code) VALUES
('Introduction to Databases', 'CS101'),
('Web Development Basics', 'CS102'),
('Data Structures', 'CS201');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'B+'),
(2, 3, NULL),
(3, 1, 'A-'),
(3, 2, 'A'),
(3, 3, 'B');

SELECT c.title, c.code, e.grade
FROM courses c
JOIN enrolments e ON e.course_id = c.id
JOIN students s ON s.id = e.student_id
WHERE s.name = 'Milkah Kerubo';

SELECT s.name, s.email, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.id
JOIN courses c ON c.id = e.course_id
WHERE c.title = 'Introduction to Databases';

SELECT c.title, COUNT(e.student_id) AS num_students
FROM courses c
LEFT JOIN enrolments e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY num_students DESC;

SELECT s.name, s.email
FROM students s
LEFT JOIN enrolments e ON e.student_id = s.id
WHERE e.id IS NULL;

UPDATE enrolments SET grade = 'A' WHERE student_id = 2 AND course_id = 3;
