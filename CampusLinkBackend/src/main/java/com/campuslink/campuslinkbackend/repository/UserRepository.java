/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.campuslink.campuslinkbackend.repository;

import com.campuslink.campuslinkbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByEmailIgnoreCase(String email);
    User findByMatricNumber(String matricNumber);
    User findByIcNumber(String icNumber);
    long countByRoleIgnoreCase(String role);
    java.util.List<User> findByRoleIgnoreCaseOrderByFullNameAsc(String role);
    boolean existsByRoleIgnoreCaseAndApprovalStatusIgnoreCaseAndClubNameIgnoreCase(
            String role, String approvalStatus, String clubName);
    User findByRoleIgnoreCaseAndApprovalStatusIgnoreCaseAndClubNameIgnoreCase(
            String role, String approvalStatus, String clubName);
}