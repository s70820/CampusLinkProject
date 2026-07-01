package com.campuslink.campuslinkbackend.dto;

public class AttendanceCheckInRequest {
    private String qrPayload;

    public String getQrPayload() { return qrPayload; }
    public void setQrPayload(String qrPayload) { this.qrPayload = qrPayload; }
}
