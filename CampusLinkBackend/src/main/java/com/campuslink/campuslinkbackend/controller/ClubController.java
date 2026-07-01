package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.ClubSummaryDto;
import com.campuslink.campuslinkbackend.service.ClubSecretaryService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubSecretaryService clubSecretaryService;

    public ClubController(ClubSecretaryService clubSecretaryService) {
        this.clubSecretaryService = clubSecretaryService;
    }

    @GetMapping
    public List<ClubSummaryDto> listClubs() {
        return clubSecretaryService.listActiveClubs();
    }
}
