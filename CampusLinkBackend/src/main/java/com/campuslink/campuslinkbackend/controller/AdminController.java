package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.dto.UserOverviewDto;
import com.campuslink.campuslinkbackend.dto.UserSummaryDto;
import com.campuslink.campuslinkbackend.dto.RoleRequestDto;
import com.campuslink.campuslinkbackend.service.AdminUserService;
import com.campuslink.campuslinkbackend.service.RoleRequestService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminUserService adminUserService;
    private final RoleRequestService roleRequestService;

    public AdminController(AdminUserService adminUserService, RoleRequestService roleRequestService) {
        this.adminUserService = adminUserService;
        this.roleRequestService = roleRequestService;
    }

    @GetMapping("/users/overview")
    public UserOverviewDto userOverview(@RequestParam Long requesterId) {
        return adminUserService.getOverview(requesterId);
    }

    @GetMapping("/users")
    public List<UserSummaryDto> listUsers(
            @RequestParam Long requesterId,
            @RequestParam(required = false) String role) {
        return adminUserService.listUsers(requesterId, role);
    }

    @PostMapping("/users/{userId}/revoke-role")
    public RoleRequestDto revokeUserRole(
            @PathVariable Long userId,
            @RequestParam Long reviewerId,
            @RequestBody Map<String, String> body) {
        String reviewNotes = body != null ? body.get("reviewNotes") : null;
        return roleRequestService.revokeUserRole(userId, reviewerId, reviewNotes);
    }

    @PostMapping("/users/{userId}/remove")
    public Map<String, String> removeUser(
            @PathVariable Long userId,
            @RequestParam Long reviewerId,
            @RequestBody Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        adminUserService.removeUser(reviewerId, userId, reason);
        return Map.of("message", "User account removed successfully.");
    }
}
