# Database Schema for HCMUT_TutorSupportSystem (Supabase Project)

## public.users
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, updatable |
| full_name | text | updatable |
| email | text | unique, updatable |
| role | text | updatable, check: role IN ('student','tutor','admin') |

## public.students
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, default: gen_random_uuid(), updatable |
| user_id | uuid | foreign key → public.users.id, nullable, updatable |
| student_code | text | unique, updatable |
| major | text | updatable |
| faculty | text | default: 'Computer Science and Engineering', updatable |
| created_at | timestamptz | default: now(), nullable, updatable |
| updated_at | timestamptz | default: now(), nullable, updatable |

## public.tutors
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, updatable |
| user_id | uuid | foreign key → public.users.id, nullable, updatable |
| salary | numeric | updatable |
| bio | text | updatable |
| ... (additional columns omitted for brevity) |

## public.schedules
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | primary key, identity ALWAYS, updatable |
| class_id | bigint | foreign key → public.classes.id, updatable |
| day | text | updatable |
| period | text | updatable |
| weeks | text | nullable, updatable |
| room | text | nullable, updatable |
| created_at | timestamptz | default: now(), updatable |

## public.student_classes
| Column | Type | Constraints |
|--------|------|-------------|
| id | bigint | primary key, identity ALWAYS, updatable |
| student_id | uuid | foreign key → public.students.id, nullable, updatable |
| class_id | bigint | foreign key → public.classes.id, nullable, updatable |
| enrolled_at | timestamptz | default: now(), nullable, updatable |

*All tables are in the `public` schema and have Row‑Level Security disabled.*
