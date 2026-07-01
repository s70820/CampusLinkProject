package com.campuslink.campuslinkbackend.dto;

import com.campuslink.campuslinkbackend.entity.Programme;
import java.util.ArrayList;
import java.util.List;

public class ProgrammeDraftRequest extends Programme {

    private List<CommitteeMemberDto> committeeMembers = new ArrayList<>();
    private List<Integer> sdgNumbers = new ArrayList<>();
    private List<ProgrammeCustomFieldDto> customRegistrationFields = new ArrayList<>();
    private List<BudgetLineDto> budgetLines = new ArrayList<>();
    private List<TentativeItemDto> tentativeSchedule = new ArrayList<>();
    private List<SpeakerDto> speakers = new ArrayList<>();
    private AdvisorAssignRequest advisor;

    public List<CommitteeMemberDto> getCommitteeMembers() { return committeeMembers; }
    public void setCommitteeMembers(List<CommitteeMemberDto> committeeMembers) { this.committeeMembers = committeeMembers; }
    public List<Integer> getSdgNumbers() { return sdgNumbers; }
    public void setSdgNumbers(List<Integer> sdgNumbers) { this.sdgNumbers = sdgNumbers; }
    public List<ProgrammeCustomFieldDto> getCustomRegistrationFields() { return customRegistrationFields; }
    public void setCustomRegistrationFields(List<ProgrammeCustomFieldDto> customRegistrationFields) {
        this.customRegistrationFields = customRegistrationFields;
    }
    public AdvisorAssignRequest getAdvisor() { return advisor; }
    public void setAdvisor(AdvisorAssignRequest advisor) { this.advisor = advisor; }
    public List<BudgetLineDto> getBudgetLines() { return budgetLines; }
    public void setBudgetLines(List<BudgetLineDto> budgetLines) { this.budgetLines = budgetLines; }
    public List<TentativeItemDto> getTentativeSchedule() { return tentativeSchedule; }
    public void setTentativeSchedule(List<TentativeItemDto> tentativeSchedule) {
        this.tentativeSchedule = tentativeSchedule;
    }
    public List<SpeakerDto> getSpeakers() { return speakers; }
    public void setSpeakers(List<SpeakerDto> speakers) { this.speakers = speakers; }
}
