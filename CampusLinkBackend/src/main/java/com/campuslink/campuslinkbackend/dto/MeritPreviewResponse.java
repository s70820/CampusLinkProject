package com.campuslink.campuslinkbackend.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class MeritPreviewResponse {

    private String programmeLevel;
    private Map<String, Integer> rules;
    private List<MeritLineItem> breakdown = new ArrayList<>();
    private int totalMerit;

    public String getProgrammeLevel() { return programmeLevel; }
    public void setProgrammeLevel(String programmeLevel) { this.programmeLevel = programmeLevel; }
    public Map<String, Integer> getRules() { return rules; }
    public void setRules(Map<String, Integer> rules) { this.rules = rules; }
    public List<MeritLineItem> getBreakdown() { return breakdown; }
    public void setBreakdown(List<MeritLineItem> breakdown) { this.breakdown = breakdown; }
    public int getTotalMerit() { return totalMerit; }
    public void setTotalMerit(int totalMerit) { this.totalMerit = totalMerit; }

    public static class MeritLineItem {
        private String positionLabel;
        private String matricNumber;
        private String meritRoleType;
        private int meritPoints;

        public String getPositionLabel() { return positionLabel; }
        public void setPositionLabel(String positionLabel) { this.positionLabel = positionLabel; }
        public String getMatricNumber() { return matricNumber; }
        public void setMatricNumber(String matricNumber) { this.matricNumber = matricNumber; }
        public String getMeritRoleType() { return meritRoleType; }
        public void setMeritRoleType(String meritRoleType) { this.meritRoleType = meritRoleType; }
        public int getMeritPoints() { return meritPoints; }
        public void setMeritPoints(int meritPoints) { this.meritPoints = meritPoints; }
    }
}
