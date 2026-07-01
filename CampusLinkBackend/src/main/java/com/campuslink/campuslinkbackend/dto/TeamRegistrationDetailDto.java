package com.campuslink.campuslinkbackend.dto;

import java.util.List;

public class TeamRegistrationDetailDto {
    private Long id;
    private Long programmeId;
    private String programmeTitle;
    private String teamName;
    private String status;
    private Integer minTeamSize;
    private Integer maxTeamSize;
    private long acceptedCount;
    private long pendingCount;
    private long rejectedCount;
    private List<TeamMemberResponseDto> members;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgrammeId() { return programmeId; }
    public void setProgrammeId(Long programmeId) { this.programmeId = programmeId; }
    public String getProgrammeTitle() { return programmeTitle; }
    public void setProgrammeTitle(String programmeTitle) { this.programmeTitle = programmeTitle; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getMinTeamSize() { return minTeamSize; }
    public void setMinTeamSize(Integer minTeamSize) { this.minTeamSize = minTeamSize; }
    public Integer getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(Integer maxTeamSize) { this.maxTeamSize = maxTeamSize; }
    public long getAcceptedCount() { return acceptedCount; }
    public void setAcceptedCount(long acceptedCount) { this.acceptedCount = acceptedCount; }
    public long getPendingCount() { return pendingCount; }
    public void setPendingCount(long pendingCount) { this.pendingCount = pendingCount; }
    public long getRejectedCount() { return rejectedCount; }
    public void setRejectedCount(long rejectedCount) { this.rejectedCount = rejectedCount; }
    public List<TeamMemberResponseDto> getMembers() { return members; }
    public void setMembers(List<TeamMemberResponseDto> members) { this.members = members; }
}
