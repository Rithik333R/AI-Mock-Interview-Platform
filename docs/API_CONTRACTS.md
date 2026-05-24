Auth
  POST /api/v1/auth/register
  POST /api/v1/auth/login
  POST /api/v1/auth/refresh-token
  POST /api/v1/auth/logout

Resume
  POST   /api/v1/resumes/upload          (multipart/form-data)
  GET    /api/v1/resumes                 (user's resumes)
  GET    /api/v1/resumes/{id}
  DELETE /api/v1/resumes/{id}
  POST   /api/v1/resumes/{id}/ats-score  (body: job description text)

Interview
  POST /api/v1/interviews/start          (role, difficulty)
  GET  /api/v1/interviews/{id}
  GET  /api/v1/interviews                (user's history)
  POST /api/v1/interviews/{id}/answer    (questionId, answerText)
  POST /api/v1/interviews/{id}/complete
  GET  /api/v1/interviews/{id}/report

Skill Gap
  POST /api/v1/skill-gaps/analyze        (resumeId, targetRole)
  GET  /api/v1/skill-gaps/latest
  GET  /api/v1/skill-gaps/{id}

Roadmap
  POST /api/v1/roadmaps/generate         (skillGapId)
  GET  /api/v1/roadmaps/active
  PATCH /api/v1/roadmaps/{id}/milestone/{milestoneId}/complete

Dashboard
  GET /api/v1/dashboard                  (aggregated stats)
  GET /api/v1/dashboard/interview-trends
  GET /api/v1/dashboard/skill-progress