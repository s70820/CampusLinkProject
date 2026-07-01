package com.campuslink.campuslinkbackend.config;

import com.campuslink.campuslinkbackend.util.AdvisorSignatureImageWriter;
import com.campuslink.campuslinkbackend.util.ClubAdvisorDefaults;
import com.campuslink.campuslinkbackend.util.ClubOrganizerFormPdfWriter;
import com.campuslink.campuslinkbackend.util.DemoPdfWriter;
import com.campuslink.campuslinkbackend.util.FacultyEndorsementLetterPdfWriter;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Creates CampusLink-branded demo PDFs under uploads/demo-docs for seeded review data.
 */
@Component
@Profile("!kerocket")
@Order(2)
public class DemoDocumentBootstrap implements ApplicationRunner {

    private static final String SUBDIR = "demo-docs";

    private final UploadProperties uploadProperties;

    public DemoDocumentBootstrap(UploadProperties uploadProperties) {
        this.uploadProperties = uploadProperties;
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        Path dir = uploadProperties.rootPath().resolve(SUBDIR);
        Files.createDirectories(dir);

        Files.write(
                dir.resolve("faculty-endorsement-letter.pdf"),
                FacultyEndorsementLetterPdfWriter.buildDemoLetter());
        Files.write(
                dir.resolve("faculty-endorsement-letter-amirul.pdf"),
                FacultyEndorsementLetterPdfWriter.buildDemoLetterForAmirul());

        writeIfMissing(dir.resolve("mpp-appointment-certificate.pdf"),
                "MPP Appointment Certificate",
                List.of(
                        "Majlis Perwakilan Pelajar (MPP)",
                        "Universiti Malaysia Terengganu",
                        "",
                        "Certificate of Appointment",
                        "Appointee: Muhammad Amirul (Demo)",
                        "Role: MPP Reviewer — CampusLink+",
                        "Term: 2025/2026 Academic Session",
                        "Issued: June 2026"));

        // Always refresh so seeded role-request demos show the formatted advisor-signed form.
        Files.write(
                dir.resolve("umt-club-organizer-approval-form.pdf"),
                ClubOrganizerFormPdfWriter.buildBlankTemplate());

        writeIfMissing(dir.resolve("mystar-application-form.pdf"),
                "MyStar Application Form",
                List.of(
                        "Co-curricular Programme Application",
                        "MyStar / CampusLink+ Submission",
                        "",
                        "Programme details, committee list, and merit",
                        "allocation as submitted by the organizer.",
                        "Demo PDF for MPP / HEPA programme review"));

        writeIfMissing(dir.resolve("advisor-signed-form.pdf"),
                "Advisor Signed Form",
                List.of(
                        "Club Advisor Verification",
                        "Universiti Malaysia Terengganu",
                        "",
                        "I confirm the programme details and committee",
                        "list are accurate and support this application.",
                        "Advisor signature: Demo Advisor",
                        "Date: June 2026"));

        Path signatureDir = uploadProperties.rootPath().resolve(ClubAdvisorDefaults.SIGNATURE_DIR);
        Files.createDirectories(signatureDir);
        for (ClubAdvisorDefaults.Advisor advisor : ClubAdvisorDefaults.allDemoAdvisors()) {
            Path signaturePath = signatureDir.resolve(advisor.signatureFile());
            if (!Files.exists(signaturePath) || Files.size(signaturePath) == 0) {
                Files.write(signaturePath, AdvisorSignatureImageWriter.build(advisor.name()));
            }
        }
    }

    private void writeIfMissing(Path target, String title, List<String> body) throws IOException {
        if (Files.exists(target) && Files.size(target) > 0) {
            return;
        }
        Files.write(target, DemoPdfWriter.build(title, body));
    }
}
