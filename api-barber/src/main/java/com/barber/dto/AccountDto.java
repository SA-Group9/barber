package com.barber.dto;

import lombok.Data;

@Data
public class AccountDto {
    private Integer accountId;
    private String firstName;
    private String lastName;
    private String telNumber;
    private Boolean login;
    private Boolean queuing;
    private String role;
    private String password;
    private String oldPassword;
    private String newPassword;
    private String confirmNewPassword;
}