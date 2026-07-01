package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.ProgrammeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProgrammeDocumentRepository extends JpaRepository<ProgrammeDocument, Long> {
    List<ProgrammeDocument> findByProgrammeId(Long programmeId);
    Optional<ProgrammeDocument> findByProgrammeIdAndDocumentType(Long programmeId, String documentType);
    List<ProgrammeDocument> findAllByProgrammeIdAndDocumentType(Long programmeId, String documentType);
}
