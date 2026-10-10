# School Design - Day 6

## Tables

**students**
- id: INTEGER PRIMARY KEY - uniquely identifies each student
- name: TEXT NOT NULL - student full name
- email: TEXT NOT NULL UNIQUE - must be unique

**courses**
- id: INTEGER PRIMARY KEY - uniquely identifies each course
- title: TEXT NOT NULL - e.g. "Introduction to Databases"
- code: TEXT NOT NULL UNIQUE - e.g. CS101

**enrolments**
- id: INTEGER PRIMARY KEY
- student_id: INTEGER NOT NULL, FOREIGN KEY -> students(id)
- course_id: INTEGER NOT NULL, FOREIGN KEY -> courses(id)
- grade: TEXT - can be NULL
- enrolled_at: date with default
- UNIQUE(student_id, course_id) - prevents duplicate enrolment

## Relationships

1.  students -> enrolments is one-to-many: one student can have many enrolments.
2.  courses -> enrolments is one-to-many: one course can have many enrolments.
3.  students <-> courses is many-to-many: one student can take many courses, and one course can have many students.

A join table (enrolments) is needed because SQL cannot store a list in one column. We store pairs of (student_id, course_id).

## Index

I would add:
CREATE INDEX idx_enrolments_student_id ON enrolments(student_id);

Reason: Most queries are "find all courses for a student". Without index SQLite scans whole table. With index it is much faster.

## SQL vs NoSQL for this system

For this school system I would choose SQL. Data is structured and relational with constraints like UNIQUE email and preventing duplicate enrolments. SQL gives ACID, foreign keys, and easy JOINs. NoSQL is better for unstructured data, but here integrity is more important, so SQL is right.
