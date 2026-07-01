package com.campuslink.campuslinkbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Entity
@Table(name = "programme_tentative")
public class ProgrammeTentative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnore
    private Programme programme;

    @Column(name = "time_slot", nullable = false)
    private String timeSlot;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String activity;

    @Column(name = "person_in_charge", nullable = false)
    private String personInCharge;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public String getActivity() { return activity; }
    public void setActivity(String activity) { this.activity = activity; }
    public String getPersonInCharge() { return personInCharge; }
    public void setPersonInCharge(String personInCharge) { this.personInCharge = personInCharge; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
