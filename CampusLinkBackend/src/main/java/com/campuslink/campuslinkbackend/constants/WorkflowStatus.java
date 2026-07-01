package com.campuslink.campuslinkbackend.constants;

public final class WorkflowStatus {

    private WorkflowStatus() {
    }

    public static final String DRAFT = "DRAFT";
    public static final String PENDING_ADVISOR_APPROVAL = "PENDING_ADVISOR_APPROVAL";
    public static final String ADVISOR_APPROVED = "ADVISOR_APPROVED";
    public static final String PENDING_MPP_REVIEW = "PENDING_MPP_REVIEW";
    public static final String PENDING_HEPA = "PENDING_HEPA";
    public static final String APPROVED = "APPROVED";
    public static final String COMPLETED = "COMPLETED";
    public static final String CANCELLED = "CANCELLED";
    public static final String REJECTED = "REJECTED";
    public static final String ARCHIVED = "ARCHIVED";

    // Legacy alias kept for backward compatibility
    public static final String PENDING_MPP = PENDING_MPP_REVIEW;
}
