-- Run before campuslink-full-demo.sql on Kerocket MySQL.
-- Kerocket's app connects to schema "app" (see DATABASE_URL / MYSQLDATABASE).

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

CREATE DATABASE IF NOT EXISTS `app`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `app`;
