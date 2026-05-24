package com.mockiq.backend.service;

import com.mockiq.backend.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ResumeParserService — extracts plain text from PDF and DOCX files.
 *
 * Why extract text locally instead of sending the file to AI directly?
 *   1. Cost — sending raw binary to AI APIs costs more tokens
 *   2. Control — we own the extracted text and can store/reuse it
 *   3. Speed — text extraction is fast; AI calls are slow
 *   4. Privacy — we only send the text portion, not embedded images
 *
 * Supported formats:
 *   PDF  → Apache PDFBox 3.x
 *   DOCX → Apache POI (XWPFDocument)
 *   DOC  → not supported (old binary format, rarely used for CVs)
 */
@Slf4j
@Service
public class ResumeParserService {

    /**
     * Extract text from the uploaded file.
     * Detects format by content type and delegates to the right parser.
     *
     * @param file MultipartFile from the HTTP request
     * @return extracted plain text (trimmed)
     */
    public String extractText(MultipartFile file) {
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new BadRequestException("Cannot determine file type");
        }

        try {
            return switch (contentType) {
                case "application/pdf" ->
                        extractFromPdf(file.getInputStream());

                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ->
                        extractFromDocx(file.getInputStream());

                case "application/msword" ->
                        throw new BadRequestException(
                                "Old .doc format is not supported. Please convert to .docx or .pdf");

                default ->
                        throw new BadRequestException(
                                "Unsupported file type: " + contentType);
            };
        } catch (IOException e) {
            log.error("Failed to parse resume file: {}", e.getMessage(), e);
            throw new BadRequestException(
                    "Failed to read file content. Please ensure the file is not corrupted.");
        }
    }

    /**
     * Extract text from a PDF using PDFBox.
     *
     * PDFTextStripper reads all text content from every page.
     * It preserves line breaks but strips formatting (bold, tables etc.)
     * which is fine — we only need the raw text for AI analysis.
     */
    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = Loader.loadPDF(inputStream.readAllBytes())) {

            if (document.isEncrypted()) {
                throw new BadRequestException(
                        "Encrypted/password-protected PDFs are not supported. " +
                                "Please remove the password and try again.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // reads text in visual order

            String text = stripper.getText(document);
            log.debug("PDF parsed — extracted {} characters", text.length());
            return cleanText(text);
        }
    }

    /**
     * Extract text from a DOCX using Apache POI.
     *
     * XWPFDocument reads the Open XML format (.docx).
     * We extract all paragraphs and join them with newlines.
     *
     * Note: Tables in DOCX are not captured this way.
     * For Phase 0-3 this is acceptable — AI can still read
     * the key content from paragraphs.
     */
    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {

            List<XWPFParagraph> paragraphs = document.getParagraphs();

            String text = paragraphs.stream()
                    .map(XWPFParagraph::getText)
                    .filter(t -> t != null && !t.isBlank())
                    .collect(Collectors.joining("\n"));

            log.debug("DOCX parsed — extracted {} characters", text.length());
            return cleanText(text);
        }
    }

    /**
     * Clean up extracted text.
     * - Collapse multiple blank lines into one
     * - Trim leading/trailing whitespace
     * - Normalise line endings
     */
    private String cleanText(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw
                .replaceAll("\r\n", "\n")       // normalise Windows line endings
                .replaceAll("\r", "\n")          // normalise old Mac line endings
                .replaceAll("\n{3,}", "\n\n")    // collapse 3+ blank lines to 2
                .trim();
    }
}