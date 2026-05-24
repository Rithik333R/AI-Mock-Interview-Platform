package com.mockiq.backend.repository;

import com.mockiq.backend.entity.Interview;
import com.mockiq.backend.entity.InterviewQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * InterviewQuestionRepository — data access for interview questions.
 */
@Repository
public interface InterviewQuestionRepository
        extends JpaRepository<InterviewQuestion, Long> {

    /**
     * All questions for a session, in display order.
     */
    List<InterviewQuestion> findByInterviewOrderBySequenceNumberAsc(
            Interview interview);

    /**
     * Find a specific question within a specific interview.
     * Used when submitting an answer — validates the question
     * belongs to the right session.
     */
    Optional<InterviewQuestion> findByIdAndInterview(Long id, Interview interview);
}