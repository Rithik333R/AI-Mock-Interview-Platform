package com.mockiq.backend.service;

import com.mockiq.backend.ai.InterviewFeedbackAI;
import com.mockiq.backend.ai.InterviewFeedbackAI.FeedbackResult;
import com.mockiq.backend.ai.InterviewQuestionGeneratorAI;
import com.mockiq.backend.ai.InterviewQuestionGeneratorAI.GeneratedQuestion;
import com.mockiq.backend.dto.request.StartInterviewRequest;
import com.mockiq.backend.dto.request.SubmitAnswerRequest;
import com.mockiq.backend.dto.response.InterviewQuestionResponse;
import com.mockiq.backend.dto.response.InterviewSessionResponse;
import com.mockiq.backend.entity.Interview;
import com.mockiq.backend.entity.InterviewQuestion;
import com.mockiq.backend.entity.InterviewResponse;
import com.mockiq.backend.entity.User;
import com.mockiq.backend.entity.Interview.InterviewStatus;
import com.mockiq.backend.exception.BadRequestException;
import com.mockiq.backend.exception.ResourceNotFoundException;
import com.mockiq.backend.repository.InterviewQuestionRepository;
import com.mockiq.backend.repository.InterviewRepository;
import com.mockiq.backend.repository.InterviewResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * InterviewService — the full interview lifecycle in one place.
 *
 * Methods:
 *   startInterview()   → create session + generate 5 AI questions
 *   submitAnswer()     → save answer + get AI feedback
 *   completeInterview()-> compute overall score, mark COMPLETED
 *   getReport()        → full session with all Q&A and feedback
 *   getMyInterviews()  → history list (no questions loaded)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewResponseRepository responseRepository;
    private final InterviewQuestionGeneratorAI questionGeneratorAI;
    private final InterviewFeedbackAI feedbackAI;
    private final UserService userService;

    /**
     * Start a new interview session.
     *
     * 1. Create an Interview entity (status = IN_PROGRESS)
     * 2. Call Gemini to generate 5 questions
     * 3. Save questions linked to the interview
     * 4. Return the session with all questions (no answers yet)
     */
    @Transactional
    public InterviewSessionResponse startInterview(StartInterviewRequest request) {

        User currentUser = userService.getCurrentUser();

        // 1. Create interview session
        Interview interview = Interview.builder()
                .user(currentUser)
                .targetRole(request.getTargetRole().trim())
                .difficulty(request.getDifficulty())
                .status(InterviewStatus.IN_PROGRESS)
                .build();

        Interview saved = interviewRepository.save(interview);

        log.info(
                "Interview session created: id={}, role={}, difficulty={}",
                saved.getId(),
                saved.getTargetRole(),
                saved.getDifficulty()
        );

        // 2. Generate questions using Gemini
        List<GeneratedQuestion> generatedQuestions =
                questionGeneratorAI.generateQuestions(
                        request.getTargetRole(),
                        request.getDifficulty()
                );

        // 3. Save generated questions
        for (GeneratedQuestion generatedQuestion : generatedQuestions) {

            InterviewQuestion question = InterviewQuestion.builder()
                    .interview(saved)
                    .questionText(generatedQuestion.questionText())
                    .expectedAnswer(generatedQuestion.expectedAnswer())
                    .category(generatedQuestion.category())
                    .sequenceNumber(generatedQuestion.sequenceNumber())
                    .build();

            questionRepository.save(question);
        }

        // 4. Load saved questions
        List<InterviewQuestion> questions =
                questionRepository.findByInterviewOrderBySequenceNumberAsc(saved);

        List<InterviewQuestionResponse> questionResponses =
                questions.stream()
                        .map(InterviewQuestionResponse::fromEntity)
                        .toList();

        log.info("Interview started with {} questions", questions.size());

        return InterviewSessionResponse.fromEntityWithQuestions(
                saved,
                questionResponses
        );
    }

    /**
     * Submit an answer and get AI feedback.
     */
    @Transactional
    public InterviewQuestionResponse submitAnswer(
            Long interviewId,
            SubmitAnswerRequest request
    ) {

        User currentUser = userService.getCurrentUser();

        // 1. Validate interview
        Interview interview = interviewRepository
                .findByIdAndUser(interviewId, currentUser)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Interview",
                                "id",
                                interviewId
                        )
                );

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException(
                    "This interview session is already completed. " +
                            "You cannot submit new answers."
            );
        }

        // 2. Validate question
        InterviewQuestion question = questionRepository
                .findByIdAndInterview(request.getQuestionId(), interview)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Question",
                                "id",
                                request.getQuestionId()
                        )
                );

        // 3. Prevent duplicate answer
        if (responseRepository.existsByQuestion(question)) {
            throw new BadRequestException(
                    "You have already answered this question. " +
                            "Each question can only be answered once."
            );
        }

        // 4. Call AI feedback service
        log.info(
                "Getting AI feedback — interviewId={}, questionId={}",
                interviewId,
                question.getId()
        );

        FeedbackResult feedback = feedbackAI.evaluateAnswer(
                question.getQuestionText(),
                question.getExpectedAnswer(),
                request.getAnswerText()
        );

        // 5. Save ENTITY response
        InterviewResponse response = InterviewResponse.builder()
                .question(question)
                .answerText(request.getAnswerText())
                .aiFeedback(feedback.aiFeedback())
                .clarityScore(feedback.clarityScore())
                .relevanceScore(feedback.relevanceScore())
                .depthScore(feedback.depthScore())
                .overallScore(feedback.overallScore())
                .improvementTips(feedback.improvementTips())
                .build();

        responseRepository.save(response);

        question.setResponse(response);

        log.info(
                "Answer saved successfully — overallScore={}",
                feedback.overallScore()
        );

        return InterviewQuestionResponse.fromEntity(question);
    }

    /**
     * Complete interview session.
     */
    @Transactional
    public InterviewSessionResponse completeInterview(Long interviewId) {

        User currentUser = userService.getCurrentUser();

        Interview interview = interviewRepository
                .findByIdAndUser(interviewId, currentUser)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Interview",
                                "id",
                                interviewId
                        )
                );

        if (interview.getStatus() == InterviewStatus.COMPLETED) {
            throw new BadRequestException(
                    "This interview session is already completed."
            );
        }

        // Fetch questions
        List<InterviewQuestion> questions =
                questionRepository.findByInterviewOrderBySequenceNumberAsc(interview);

        // Compute average score
        double averageScore = questions.stream()
                .mapToDouble(question ->
                        question.getResponse() == null
                                ? 0.0
                                : question.getResponse().getOverallScore()
                )
                .average()
                .orElse(0.0);

        // Round to 1 decimal place
        double roundedScore =
                Math.round(averageScore * 10.0) / 10.0;

        interview.setStatus(InterviewStatus.COMPLETED);
        interview.setOverallScore(roundedScore);

        interviewRepository.save(interview);

        log.info(
                "Interview completed: id={}, overallScore={}",
                interviewId,
                roundedScore
        );

        return InterviewSessionResponse.fromEntity(interview);
    }

    /**
     * Full interview report.
     */
    @Transactional(readOnly = true)
    public InterviewSessionResponse getReport(Long interviewId) {

        User currentUser = userService.getCurrentUser();

        Interview interview = interviewRepository
                .findByIdAndUser(interviewId, currentUser)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Interview",
                                "id",
                                interviewId
                        )
                );

        List<InterviewQuestion> questions =
                questionRepository.findByInterviewOrderBySequenceNumberAsc(interview);

        List<InterviewQuestionResponse> questionResponses =
                questions.stream()
                        .map(InterviewQuestionResponse::fromEntity)
                        .toList();

        return InterviewSessionResponse.fromEntityWithQuestions(
                interview,
                questionResponses
        );
    }

    /**
     * Interview history list.
     */
    @Transactional(readOnly = true)
    public List<InterviewSessionResponse> getMyInterviews() {

        User currentUser = userService.getCurrentUser();

        return interviewRepository
                .findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(InterviewSessionResponse::fromEntity)
                .toList();
    }
}