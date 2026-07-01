package com.campuslink.campuslinkbackend.constants;

public final class RegistrationStatus {

    private RegistrationStatus() {}

    public static final String ACTIVE = "ACTIVE";
    public static final String PENDING_PAYMENT = "PENDING_PAYMENT";
    public static final String PENDING_PAYMENT_VERIFICATION = "PENDING_PAYMENT_VERIFICATION";
    public static final String PAYMENT_APPROVED = "PAYMENT_APPROVED";
    public static final String PAYMENT_REJECTED = "PAYMENT_REJECTED";
    public static final String PENDING_TEAM = "PENDING_TEAM";
    public static final String PENDING_INVITE = "PENDING_INVITE";
    public static final String REJECTED = "REJECTED";
    public static final String CANCELLED = "CANCELLED";
}
