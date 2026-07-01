package com.campuslink.campuslinkbackend.dto;

import com.campuslink.campuslinkbackend.entity.Programme;

public class ProgrammeWorkflowResponse {

    private Long id;
    private String title;
    private String status;
    private String mppStatus;

    public static ProgrammeWorkflowResponse from(Programme programme) {
        ProgrammeWorkflowResponse response = new ProgrammeWorkflowResponse();
        if (programme == null) {
            return response;
        }
        response.setId(programme.getId());
        response.setTitle(programme.getTitle());
        response.setStatus(programme.getStatus());
        response.setMppStatus(programme.getMppStatus());
        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getMppStatus() { return mppStatus; }
    public void setMppStatus(String mppStatus) { this.mppStatus = mppStatus; }
}
