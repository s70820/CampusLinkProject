package com.campuslink.campuslinkbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;

@Entity
@Table(name = "programme_sdg")
public class ProgrammeSdg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "programme_id", nullable = false)
    @JsonIgnore
    private Programme programme;

    @Column(name = "sdg_number", nullable = false)
    private Integer sdgNumber;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Programme getProgramme() { return programme; }
    public void setProgramme(Programme programme) { this.programme = programme; }
    public Integer getSdgNumber() { return sdgNumber; }
    public void setSdgNumber(Integer sdgNumber) { this.sdgNumber = sdgNumber; }
}
