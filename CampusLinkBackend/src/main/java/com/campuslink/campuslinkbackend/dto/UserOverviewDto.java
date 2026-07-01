package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;

public class UserOverviewDto {
    private long totalUsers;
    private long students;
    private long organizers;
    private long mpp;
    private long hepa;
    private List<UserSummaryDto> recentUsers = new ArrayList<>();

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getStudents() { return students; }
    public void setStudents(long students) { this.students = students; }
    public long getOrganizers() { return organizers; }
    public void setOrganizers(long organizers) { this.organizers = organizers; }
    public long getMpp() { return mpp; }
    public void setMpp(long mpp) { this.mpp = mpp; }
    public long getHepa() { return hepa; }
    public void setHepa(long hepa) { this.hepa = hepa; }
    public List<UserSummaryDto> getRecentUsers() { return recentUsers; }
    public void setRecentUsers(List<UserSummaryDto> recentUsers) { this.recentUsers = recentUsers; }
}
