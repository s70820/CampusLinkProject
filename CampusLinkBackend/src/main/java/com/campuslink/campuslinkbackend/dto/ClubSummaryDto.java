package com.campuslink.campuslinkbackend.dto;

public class ClubSummaryDto {
    private Long id;
    private String name;
    private boolean hasSecretary;
    private String secretaryName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public boolean isHasSecretary() { return hasSecretary; }
    public void setHasSecretary(boolean hasSecretary) { this.hasSecretary = hasSecretary; }
    public String getSecretaryName() { return secretaryName; }
    public void setSecretaryName(String secretaryName) { this.secretaryName = secretaryName; }
}
