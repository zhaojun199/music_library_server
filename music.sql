/*这里用的是ESC下边的反引号*/
/*DROP database `music_admin`;*/
CREATE DATABASE IF NOT EXISTS `music_admin`;
USE `music_admin`;

/*歌手信息表*/
DROP TABLE IF EXISTS `singer_info`;
CREATE TABLE `singer_info`(
	`id` int unsigned auto_increment key,
	`singer_name` varchar(50) not null,
	`c_index` varchar(10) not null,
	`singer_icon` text not null,
	`singer_sex` enum("男","女","保密") not null default "保密",
	`singer_birthday` timestamp not null,
	`singer_intro` text not null,
	`create_time` timestamp default current_timestamp,
	`singer_uploader_name` varchar(50) not null,
	`singer_delete` tinyint(1) default 0
)charset='utf8';

/*管理员表*/
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`(
	`id` int unsigned auto_increment key,
	`username` varchar(20) not null,
	`password` char(32) not null,
	`type` enum("administrator","anchor","client") not null default "client",
	-- 歌手名字或者客户名字
	`true_name` varchar(50) not null,
	`singer_id` int unsigned,
	`email` varchar(50) not null,
	`tel` int not null,
	`create_time` timestamp default current_timestamp,
  	UNIQUE KEY `username` (`username`),
  	`admin_delete` tinyint(1) default 0,
  	constraint `fk_admin_singer_id` foreign key (`singer_id`) references `singer_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';

/*专辑信息表*/
DROP TABLE IF EXISTS `album_info`;
CREATE TABLE `album_info`(
	`id` bigint unsigned auto_increment key,
	`album_name` varchar(50) not null,
	`album_intro` text not null,
	`album_icon` text not null,
	`songs_count` int not null,
	`album_hits` bigint default 0,
	`singer_id` int unsigned,
	`singer_name` varchar(50) not null,
	`album_category` int not null,
	`album_likes` bigint default 0,
	`album_min_age` int not null,
	`album_max_age` int not null,
	`album_order` bigint not null,
	`album_order_extra` bigint not null,
	`upload_user_id` int unsigned,
	`upload_user_name` varchar(50) not null,
	`upload_user_type` enum("administrator","anchor","client") not null default "client",
	`pay_status` enum("free","charge","all_charge") not null default "free",
	`issue_date` timestamp not null,
	`update_time` timestamp default current_timestamp ON UPDATE CURRENT_TIMESTAMP,
	`create_time` timestamp default current_timestamp,
	`album_delete` tinyint(1) default 0,
	constraint `fk_album_singer_id` foreign key (`singer_id`) references `singer_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	constraint `fk_album_admin_id` foreign key (`upload_user_id`) references `admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';

/*歌曲信息表*/
DROP TABLE IF EXISTS `song_info`;
CREATE TABLE `song_info`(
	`id` bigint unsigned auto_increment key,
	`album_id` bigint unsigned,
	`album_name` varchar(50) not null,
	`singer_id` int unsigned,
	`singer_name` varchar(50) not null,
	`song_name` varchar(50) not null,
	`song_icon` text not null,
	`song_intro` text not null,
	`song_lyric` text not null,
	`song_duration` int,
	`song_hits` bigint default 0,
	`song_likes` bigint default 0,
	`song_path_low` text not null,
	`song_size_low` int not null,
	`song_path_middle` text not null,
	`song_size_middle` int not null,
	`song_path_high` text not null,
	`song_size_high` int not null,
	`song_order` bigint not null,
	`song_order_extra` bigint not null,
	`upload_user_id` int unsigned,
	`upload_user_name` varchar(50) not null,
	`upload_user_type` enum("administrator","anchor","client") not null default "client",
	`update_time` timestamp default current_timestamp ON UPDATE CURRENT_TIMESTAMP,
	`create_time` timestamp default current_timestamp,
	`song_delete` tinyint(1) default 0,
	INDEX `album_id` (`album_id`),
	constraint `fk_song_album_id` foreign key (`album_id`) references `album_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	constraint `fk_song_singer_id` foreign key (`singer_id`) references `singer_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	constraint `fk_song_admin_id` foreign key (`upload_user_id`) references `admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';

/*类型信息表*/
DROP TABLE IF EXISTS `type_info`;
CREATE TABLE `type_info`(
	`id` int unsigned auto_increment key,
	`album_id` bigint unsigned,
	`type_name` varchar(50) not null,
	`category_intro` text not null,
	`create_time` timestamp default current_timestamp,
	constraint `fk_type_album_id` foreign key (`album_id`) references `album_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';

/*专辑点赞表*/
DROP TABLE IF EXISTS `album_like`;
CREATE TABLE `album_like`(
	`id` bigint unsigned auto_increment key,
	`album_id` bigint unsigned,
	`user_id` varchar(50) not null,
	`create_time` timestamp default current_timestamp,
	UNIQUE INDEX `unique_album_like` (`album_id`,`user_id`),
	constraint `fk_like_album_id` foreign key (`album_id`) references `album_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';

/*歌曲点赞表*/
DROP TABLE IF EXISTS `song_like`;
CREATE TABLE `song_like`(
	`id` bigint unsigned auto_increment key,
	`song_id` bigint unsigned,
	`user_id` varchar(50) not null,
	`create_time` timestamp default current_timestamp,
	UNIQUE INDEX `unique_album_like` (`song_id`,`user_id`),
	constraint `fk_like_song_id` foreign key (`song_id`) references `song_info` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
)charset='utf8';
/*ALTER TABLE `album_info` ADD `upload_user_id` INT UNSIGNED NOT NULL AFTER `update_time`;
ALTER TABLE `album_info` ADD constraint `fk_album_admin_id` foreign key (`upload_user_id`) references `admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
Select * from album_info INNER JOIN song_info ON song_info.album_id = album_info.id*/