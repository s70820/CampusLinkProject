package com.campuslink.campuslinkbackend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_registry")
public class StudentRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "matric_number", unique = true, nullable = false)
    private String matricNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String faculty;

    @Column(name = "study_level", nullable = false)
    private String studyLevel = "Degree";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMatricNumber() { return matricNumber; }
    public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }
    public String getStudyLevel() { return studyLevel; }
    public void setStudyLevel(String studyLevel) { this.studyLevel = studyLevel; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
