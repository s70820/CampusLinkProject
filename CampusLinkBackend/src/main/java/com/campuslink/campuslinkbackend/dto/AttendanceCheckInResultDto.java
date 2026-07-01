package com.campuslink.campuslinkbackend.dto;

import java.time.LocalDateTime;

public class AttendanceCheckInResultDto {
    private boolean success;
    private String message;
    private StudentAttendanceDto attendance;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public StudentAttendanceDto getAttendance() { return attendance; }
    public void setAttendance(StudentAttendanceDto attendance) { this.attendance = attendance; }

    public static AttendanceCheckInResultDto success(String message, StudentAttendanceDto attendance) {
        AttendanceCheckInResultDto dto = new AttendanceCheckInResultDto();
        dto.setSuccess(true);
        dto.setMessage(message);
        dto.setAttendance(attendance);
        return dto;
    }

    public static AttendanceCheckInResultDto failure(String message) {
        AttendanceCheckInResultDto dto = new AttendanceCheckInResultDto();
        dto.setSuccess(false);
        dto.setMessage(message);
        return dto;
    }
}
