-- phpMyAdmin SQL Dump
-- version 3.3.8.1
-- http://www.phpmyadmin.net
--
-- 主机: w.rdc.sae.sina.com.cn:3307
-- 生成日期: 2016 年 05 月 28 日 23:17
-- 服务器版本: 5.6.23
-- PHP 版本: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `app_htassist`
--

-- --------------------------------------------------------

--
-- 表的结构 `auth_data`
--

CREATE TABLE IF NOT EXISTS `auth_data` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `cookie` char(255) NOT NULL,
  `user_info` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cookie` (`cookie`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `auth_data`
--

INSERT INTO `auth_data` (`id`, `cookie`, `user_info`) VALUES
(1, 'JSESSIONID=lpPhXJkGm0P69Vq0hC19hQzrBqnyPwjvVrTyzTM1XKNLTk700GXT!651268100!461827421; path=/, SESSION_COOKIE=61711; path=/', NULL);

-- --------------------------------------------------------

--
-- 表的结构 `strategy_log`
--

CREATE TABLE IF NOT EXISTS `strategy_log` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `name` char(20) NOT NULL,
  `strategy_id` char(20) NOT NULL,
  `pid` int(4) NOT NULL,
  `round_num` int(4) DEFAULT NULL,
  `act` char(20) NOT NULL,
  `detail` text,
  `reason` text,
  `result` char(20) DEFAULT NULL,
  `created_time` datetime NOT NULL,
  `updated_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `strategy_id` (`strategy_id`,`pid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- 转存表中的数据 `strategy_log`
--


-- --------------------------------------------------------

--
-- 表的结构 `task_executor`
--

CREATE TABLE IF NOT EXISTS `task_executor` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `name` char(20) DEFAULT NULL,
  `strategy_id` char(40) DEFAULT NULL,
  `time_interval` float DEFAULT NULL,
  `round_num` int(4) DEFAULT NULL,
  `parameters` text,
  `status` int(2) NOT NULL,
  `created_time` datetime NOT NULL,
  `updated_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `strategy_id` (`strategy_id`),
  KEY `status` (`status`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9 ;

--
-- 转存表中的数据 `task_executor`
--

INSERT INTO `task_executor` (`id`, `name`, `strategy_id`, `time_interval`, `round_num`, `parameters`, `status`, `created_time`, `updated_time`) VALUES
(1, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:45:17', '2016-05-11 10:45:23'),
(2, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:46:44', '2016-05-11 10:46:44'),
(3, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:46:44', '2016-05-11 10:46:44'),
(4, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),
(5, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),
(6, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),
(7, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47'),
(8, NULL, NULL, NULL, NULL, NULL, 0, '2016-05-11 10:49:47', '2016-05-11 10:49:47');
