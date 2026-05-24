users
  id BIGINT PK AUTO_INCREMENT
  email VARCHAR(255) UNIQUE NOT NULL
  password_hash VARCHAR(255) NOT NULL
  full_name VARCHAR(100)
  target_role VARCHAR(100)
  experience_level ENUM('JUNIOR','MID','SENIOR')
  tech_stack JSON
  role ENUM('USER','ADMIN') DEFAULT 'USER'
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP

resumes
  id BIGINT PK
  user_id BIGINT FK → users.id
  file_url VARCHAR(500)
  file_name VARCHAR(255)
  raw_text LONGTEXT
  parsed_data JSON
  ats_score INT
  job_description TEXT
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP

interviews
  id BIGINT PK
  user_id BIGINT FK → users.id
  target_role VARCHAR(100)
  difficulty ENUM('EASY','MEDIUM','HARD')
  status ENUM('PENDING','IN_PROGRESS','COMPLETED')
  overall_score DECIMAL(4,2)
  duration_minutes INT
  created_at TIMESTAMP
  updated_at TIMESTAMP

interview_questions
  id BIGINT PK
  interview_id BIGINT FK → interviews.id
  question_text TEXT NOT NULL
  expected_answer TEXT
  category ENUM('TECHNICAL','BEHAVIORAL','SITUATIONAL','HR')
  sequence_no INT
  created_at TIMESTAMP

interview_responses
  id BIGINT PK
  question_id BIGINT FK → interview_questions.id
  user_id BIGINT FK → users.id
  answer_text LONGTEXT
  ai_feedback TEXT
  clarity_score INT
  relevance_score INT
  depth_score INT
  improvement_tips TEXT
  created_at TIMESTAMP

skill_gaps
  id BIGINT PK
  user_id BIGINT FK → users.id
  resume_id BIGINT FK → resumes.id
  current_skills JSON
  required_skills JSON
  gap_skills JSON
  proficiency_map JSON
  target_role VARCHAR(100)
  created_at TIMESTAMP

roadmaps
  id BIGINT PK
  user_id BIGINT FK → users.id
  target_role VARCHAR(100)
  weeks_to_goal INT
  milestones JSON
  completion_percentage DECIMAL(5,2)
  is_active BOOLEAN DEFAULT TRUE
  created_at TIMESTAMP
  updated_at TIMESTAMP