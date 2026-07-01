package com.campuslink.campuslinkbackend.scheduler;

import com.campuslink.campuslinkbackend.service.MeritAwardService;
import com.campuslink.campuslinkbackend.service.ProgrammeWorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ProgrammeExpiryScheduler {

    @Autowired
    private ProgrammeWorkflowService programmeWorkflowService;

    @Autowired
    private MeritAwardService meritAwardService;

    @Scheduled(cron = "0 0 2 * * *")
    public void runExpiryJobs() {
        programmeWorkflowService.sendDraftExpiryWarnings();
        programmeWorkflowService.purgeExpiredDrafts();
        programmeWorkflowService.archiveExpiredDrafts();
        programmeWorkflowService.deleteExpiredArchives();
        meritAwardService.processDueMeritAwards();
    }
}
