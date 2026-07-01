package com.campuslink.campuslinkbackend.constants;

public final class CommitteeRole {

    private CommitteeRole() {
    }

    public static final String PENGARAH_PROGRAM = "PENGARAH_PROGRAM";
    public static final String MT_PROGRAM = "MT_PROGRAM";
    public static final String AJK_PROGRAM = "AJK_PROGRAM";
    public static final String SPECIAL_CONTRIBUTION = "SPECIAL_CONTRIBUTION";

    public static String meritRoleTypeFor(String committeeRole) {
        if (PENGARAH_PROGRAM.equals(committeeRole)) {
            return MeritRoleType.DIRECTOR;
        }
        if (AJK_PROGRAM.equals(committeeRole)) {
            return MeritRoleType.AJK;
        }
        if (SPECIAL_CONTRIBUTION.equals(committeeRole)) {
            return MeritRoleType.SPECIAL_CONTRIBUTION;
        }
        return MeritRoleType.MT;
    }
}
