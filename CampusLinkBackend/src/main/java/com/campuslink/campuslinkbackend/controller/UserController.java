/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.campuslink.campuslinkbackend.controller;

import com.campuslink.campuslinkbackend.entity.User;
import com.campuslink.campuslinkbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@RequestMapping("/api")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping(value = {"/register", "/users/register"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public User registerUser(@RequestBody User user) {
        try {
            if (user.getRole() != null
                    && !user.getRole().equalsIgnoreCase("STUDENT")
                    && !user.getRole().isBlank()) {
                throw new IllegalArgumentException(
                        "Please register as a student. MPP and organizer access is granted through Role Request after sign-in.");
            }
            user.setRole("STUDENT");
            user.setApprovalStatus("APPROVED");
            return userService.registerUser(user);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, ex.getMessage(), ex);
        }
    }

    @GetMapping("/users/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        return user;
    }
}