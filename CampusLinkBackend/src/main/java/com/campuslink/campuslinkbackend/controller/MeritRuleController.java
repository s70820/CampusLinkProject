package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.CommitteeMemberDto;
import com.campuslink.campuslinkbackend.dto.MeritPreviewResponse;
import com.campuslink.campuslinkbackend.entity.MeritRule;
import com.campuslink.campuslinkbackend.service.MeritRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/merit-rules")
public class MeritRuleController {

    @Autowired
    private MeritRuleService meritRuleService;

    @GetMapping
    public List<MeritRule> getMeritRules(@RequestParam String level) {
        return meritRuleService.getRulesForLevel(level);
    }

    @PostMapping("/preview")
    public MeritPreviewResponse previewMerit(
            @RequestParam String level,
            @RequestBody List<CommitteeMemberDto> committeeMembers) {
        return meritRuleService.buildPreview(level, committeeMembers);
    }
}
