src/main/java/com/mockiq/
│
├── config/
│   ├── SecurityConfig.java
│   ├── RedisConfig.java
│   ├── CloudinaryConfig.java
│   ├── GeminiConfig.java
│   └── CorsConfig.java
│
├── entity/
│   ├── User.java
│   ├── Resume.java
│   ├── Interview.java
│   ├── InterviewQuestion.java
│   ├── InterviewResponse.java
│   ├── SkillGap.java
│   └── Roadmap.java
│
├── dto/
│   ├── request/
│   │   ├── RegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── InterviewStartRequest.java
│   │   └── InterviewAnswerRequest.java
│   └── response/
│       ├── AuthResponse.java
│       ├── ResumeAnalysisResponse.java
│       ├── ATSScoreResponse.java
│       ├── InterviewSessionResponse.java
│       ├── QuestionResponse.java
│       ├── FeedbackResponse.java
│       ├── SkillGapResponse.java
│       ├── RoadmapResponse.java
│       └── DashboardResponse.java
│
├── repository/
│   ├── UserRepository.java
│   ├── ResumeRepository.java
│   ├── InterviewRepository.java
│   ├── InterviewQuestionRepository.java
│   ├── InterviewResponseRepository.java
│   ├── SkillGapRepository.java
│   └── RoadmapRepository.java
│
├── service/
│   ├── AuthService.java
│   ├── ResumeService.java
│   ├── ATSService.java
│   ├── InterviewService.java
│   ├── SkillGapService.java
│   ├── RoadmapService.java
│   ├── DashboardService.java
│   └── FileStorageService.java
│
├── ai/
│   ├── GeminiClient.java
│   ├── AIPromptBuilder.java
│   ├── ResumeParserAI.java
│   ├── InterviewQuestionGeneratorAI.java
│   ├── FeedbackGeneratorAI.java
│   └── SkillGapAnalyzerAI.java
│
├── controller/
│   ├── AuthController.java
│   ├── ResumeController.java
│   ├── InterviewController.java
│   ├── SkillGapController.java
│   ├── RoadmapController.java
│   └── DashboardController.java
│
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── JwtAuthEntryPoint.java
│
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── AIServiceException.java
│   ├── FileProcessingException.java
│   └── InvalidTokenException.java
│
├── cache/
│   ├── CacheKeyConstants.java
│   └── CacheService.java
│
└── util/
    ├── ResumeTextExtractor.java
    └── PaginationUtils.java