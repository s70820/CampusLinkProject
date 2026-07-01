package com.campuslink.campuslinkbackend.service;

import com.campuslink.campuslinkbackend.constants.MeritRoleType;
import com.campuslink.campuslinkbackend.dto.CommitteeMemberDto;
import com.campuslink.campuslinkbackend.dto.MeritPreviewResponse;
import com.campuslink.campuslinkbackend.entity.MeritRule;
import com.campuslink.campuslinkbackend.repository.MeritRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MeritRuleService {

    @Autowired
    private MeritRuleRepository meritRuleRepository;

    public List<MeritRule> getRulesForLevel(String programmeLevel) {
        return meritRuleRepository.findByProgrammeLevel(programmeLevel);
    }

    public Map<String, Integer> getRuleMap(String programmeLevel) {
        return getRulesForLevel(programmeLevel).stream()
                .collect(Collectors.toMap(MeritRule::getRoleType, MeritRule::getMeritPoints));
    }

    public int getMeritPoints(String programmeLevel, String roleType) {
        return meritRuleRepository.findByProgrammeLevelAndRoleType(programmeLevel, roleType)
                .map(MeritRule::getMeritPoints)
                .orElse(0);
    }

    public MeritPreviewResponse buildPreview(String programmeLevel, List<CommitteeMemberDto> members) {
        Map<String, Integer> allRules = getRuleMap(programmeLevel);
        Map<String, Integer> creationRules = filterCreationPreviewRules(allRules);

        MeritPreviewResponse response = new MeritPreviewResponse();
        response.setProgrammeLevel(programmeLevel);
        response.setRules(creationRules);

        int total = 0;
        if (members != null) {
            for (CommitteeMemberDto member : members) {
                if (member.getMatricNumber() == null || member.getMatricNumber().isBlank()) {
                    continue;
                }

                String meritRole = com.campuslink.campuslinkbackend.constants.CommitteeRole
                        .meritRoleTypeFor(member.getCommitteeRole());
                int points = allRules.getOrDefault(meritRole, 0);

                MeritPreviewResponse.MeritLineItem item = new MeritPreviewResponse.MeritLineItem();
                item.setPositionLabel(resolveDisplayLabel(member));
                item.setMatricNumber(member.getMatricNumber());
                item.setMeritRoleType(meritRole);
                item.setMeritPoints(points);
                response.getBreakdown().add(item);
                total += points;
            }
        }

        response.setTotalMerit(total);
        return response;
    }

    private Map<String, Integer> filterCreationPreviewRules(Map<String, Integer> allRules) {
        Map<String, Integer> filtered = new LinkedHashMap<>();
        for (String roleType : List.of(
                MeritRoleType.DIRECTOR,
                MeritRoleType.MT,
                MeritRoleType.AJK,
                MeritRoleType.SPECIAL_CONTRIBUTION
        )) {
            if (allRules.containsKey(roleType)) {
                filtered.put(roleType, allRules.get(roleType));
            }
        }
        return filtered;
    }

    private String resolveDisplayLabel(CommitteeMemberDto member) {
        if (member.getContributionDescription() != null && !member.getContributionDescription().isBlank()) {
            return "Special Contribution — " + member.getContributionDescription();
        }
        if (member.getPositionLabel() != null && !member.getPositionLabel().isBlank()) {
            return member.getPositionLabel();
        }
        String role = member.getCommitteeRole();
        if (com.campuslink.campuslinkbackend.constants.CommitteeRole.PENGARAH_PROGRAM.equals(role)) {
            return "Programme Director (Pengarah Program)";
        }
        if (com.campuslink.campuslinkbackend.constants.CommitteeRole.MT_PROGRAM.equals(role)) {
            return "MT Programme (Majlis Tertinggi Program)";
        }
        if (com.campuslink.campuslinkbackend.constants.CommitteeRole.AJK_PROGRAM.equals(role)) {
            return "AJK Programme";
        }
        if (com.campuslink.campuslinkbackend.constants.CommitteeRole.SPECIAL_CONTRIBUTION.equals(role)) {
            return "Special Contribution (Sumbangan Khas)";
        }
        return role;
    }
}
