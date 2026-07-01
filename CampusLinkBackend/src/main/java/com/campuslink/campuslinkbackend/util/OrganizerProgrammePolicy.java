package com.campuslink.campuslinkbackend.util;

import com.campuslink.campuslinkbackend.constants.WorkflowStatus;
import com.campuslink.campuslinkbackend.entity.Programme;

public final class OrganizerProgrammePolicy {

    private OrganizerProgrammePolicy() {
    }

    public static boolean isOperational(Programme programme) {
        if (programme == null || programme.getStatus() == null) {
            return false;
        }
        String status = programme.getStatus().trim().toUpperCase();
        return WorkflowStatus.APPROVED.equalsIgnoreCase(status)
                || WorkflowStatus.COMPLETED.equalsIgnoreCase(status);
    }
}
