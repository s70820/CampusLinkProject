package com.campuslink.campuslinkbackend.dto;

public class CertificateBulkIssueResultDto {
    private int issuedCount;
    private int skippedCount;
    private int totalEligible;

    public int getIssuedCount() { return issuedCount; }
    public void setIssuedCount(int issuedCount) { this.issuedCount = issuedCount; }
    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }
    public int getTotalEligible() { return totalEligible; }
    public void setTotalEligible(int totalEligible) { this.totalEligible = totalEligible; }
}
