"use strict";

const Moment = require('moment');
const config = require('../config/config');
const mysql = require('./mysql.lib');
const Type = require('./type.lib');

//歌曲类
class Song {

    constructor(name = '', icon = '', path = '', intro = '', lyric = '', album_id = '', album_name = '',
        duration = '', size = '', user_id = '', user_name = '', user_type = '') {
        this.song_name = name;
        this.song_icon = icon;
        this.song_intro = intro;
        this.song_lyric = lyric;
        this.song_path_middle = path;
        this.album_id = album_id;
        this.album_name = album_name;
        this.song_duration = duration;
        this.song_size_middle = size;
        this.upload_user_id = user_id;
        this.upload_user_name = user_name;
        this.upload_user_type = user_type;
    }

    //往数据库创建新的歌曲
    createSongInDb() {
        let data = {};
        if (this.album_id) { data.album_id = this.album_id; }
        if (this.album_name) { data.album_name = this.album_name; }
        if (this.singer_id) { data.singer_id = this.singer_id; }
        if (this.singer_name) { data.singer_name = this.singer_name; }
        if (this.song_name) { data.song_name = this.song_name; }
        if (this.song_intro) { data.song_intro = this.song_intro; }
        if (this.song_icon) { data.song_icon = this.song_icon; }
        if (this.song_lyric) { data.song_lyric = this.song_lyric; }
        if (this.song_duration) { data.song_duration = this.song_duration; }
        if (this.song_path_middle) { data.song_path_middle = this.song_path_middle; }
        if (this.song_size_middle) { data.song_size_middle = this.song_size_middle; }
        if (this.upload_user_id) { data.upload_user_id = this.upload_user_id; }
        if (this.upload_user_name) { data.upload_user_name = this.upload_user_name; }
        if (this.upload_user_type) { data.upload_user_type = this.upload_user_type; }
        return new Promise((resolve, reject) => {
            //获取到最高排序序号
            mysql.queryOne(config.table_song, 'song_order', "*", "song_order DESC").then((val) => {
                if (!val) {
                    return Promise.resolve(-99);
                } else if (val.song_order === 0 || val.song_order) {
                    return Promise.resolve(val.song_order);
                }
            }).then((val) => {
                //将排序序号+100然后插入到歌曲信息表
                data.song_order = parseInt(val) + 100;
                return Promise.resolve(mysql.insertOne(config.table_song, data));
            }).then((val) => {
                //插入到歌曲信息表
                if (val.affectedRows > 0) {
                    let params = 'songs_count = songs_count + 1';
                    let conditions = {
                        id: data.album_id
                    };
                    return Promise.resolve(mysql.update(config.table_album, params, conditions));
                } else {
                    resolve('song save failed');
                }
            }).then(val => {
                if (val.affectedRows > 0) {
                    resolve(val);
                } else {
                    resolve('album songs_count add 1 failed');
                }
            }).catch(function(err) {
                //异常在这里处理
            });
        })
    }

    //通过id从数据库删除歌曲(logic是否逻辑删除)
    static deleteSongInDb(id, logic = true) {
        let data = {
            id: id
        };
        return new Promise((resolve, reject) => {
            resolve(mysql.queryOne(config.table_song, ['album_id', 'song_delete'], data));
        }).then(val => {
            if (val && !val['song_delete']) {
                let params = {
                    song_delete: 1,
                    update_time: Moment().format('YYYY-MM-DD HH:mm:ss')
                }
        		if (Boolean(logic)) {
                	mysql.update(config.table_song, params, data);
            	}else{
            		mysql.delete(config.table_song, data);
            	}
                return Promise.resolve(val['album_id']);
            } else {
                return Promise.reject('has deleted');
            }
            //专辑中歌曲数目减一
        }).then(val => {
            let params = 'songs_count = songs_count - 1';
            let conditions = {
                id: val
            };
            return new Promise((resolve) => {
                resolve(mysql.update(config.table_album, params, conditions));
            });
        }).catch(e => {
            return Promise.resolve(e);
        });
    }

    /**修改歌曲信息
     * data (json格式歌曲信息)
     */
    modifySong(data) {
        try {
            JSON.stringify(data);
        } catch (e) {
            return e;
        }
        if (data.id) { this.id = data.id; }
        if (data.album_id) { this.album_id = data.album_id; }
        if (data.album_name) { this.album_name = data.album_name; }
        if (data.singer_id) { this.singer_id = data.singer_id; }
        if (data.singer_name) { this.singer_name = data.singer_name; }
        if (data.song_name) { this.song_name = data.song_name; }
        if (data.song_intro) { this.song_intro = data.song_intro; }
        if (data.song_icon) { this.song_icon = data.song_icon; }
        if (data.song_lyric) { this.song_lyric = data.song_lyric; }
        if (data.song_duration) { this.song_duration = data.song_duration; }
        /*if(data.song_hits) { this.song_hits = data.song_hits; }
        if(data.song_like) { this.song_like = data.song_like; }*/
        if (data.song_path_middle) { this.song_path_middle = data.song_path_middle; }
        if (data.song_size_middle) { this.song_size_middle = data.song_size_middle; }
        if (data.song_order) { this.song_order = data.song_order; }
        if (data.upload_user) { this.upload_user = asdad.upload_user; }
        return this;
    }

    /**
     * 往数据库修改歌曲信息
     */
    updateSongInDb() {
        if (!this.id) return Promise.resolve('not found id');
        let id = this.id;
        let data = {};
        if (this.id) { data.id = this.id; }
        if (this.album_id) { data.album_id = this.album_id; }
        if (this.album_name) { data.album_name = this.album_name; }
        if (this.singer_id) { data.singer_id = this.singer_id; }
        if (this.singer_name) { data.singer_name = this.singer_name; }
        if (this.song_name) { data.song_name = this.song_name; }
        if (this.song_intro) { data.song_intro = this.song_intro; }
        if (this.song_icon) { data.song_icon = this.song_icon; }
        if (this.song_lyric) { data.song_lyric = this.song_lyric; }
        if (this.song_duration) { data.song_duration = this.song_duration; }
        /*if(this.song_hits) { data.song_hits = this.song_hits; }
        if(this.song_like) { data.song_like = this.song_like; }*/
        if (this.song_path_middle) { data.song_path_middle = this.song_path_middle; }
        if (this.song_size_middle) { data.song_size_middle = this.song_size_middle; }
        if (this.upload_user) { data.upload_user = this.upload_user; }
        data.update_time = Moment().format('YYYY-MM-DD HH:mm:ss');
        return new Promise((resolve) => {
            let condition = {
                id: data.id
            };
            mysql.update(config.table_song, data, condition).then(
                (val) => { resolve(val); }
            );
        });
    }

    /*
     *获取歌曲列表
     */
    static getSongList(id, username, type, role, page = 1, pageSize = config.pageSize) {
        let condition;
        switch (type) {
            case 'administrator':
                if(username === role){
                    condition = {
                        album_id: id
                    };
                }else{
                    condition = {
                        album_id: id,
                        upload_user_name: role,
                        song_delete: '0'
                    };
                }
                break;
            case 'client':
                condition = "album_id = " + id + " and song_delete = 0 and (upload_user_name = '" + username + "' or upload_user_type = 'administrator')";
                break;
            case 'anchor':
                condition = {
                    album_id: id,
                    upload_user_name: username,
                    song_delete: '0'
                };
                break;
            default:
                break;
        }
        return new Promise((resolve) => {
            resolve(mysql.queryArrayByPage(config.table_song, "*", condition, page, pageSize, "song_order_extra desc, song_order desc"))
        }).then((val) => {
            return new Promise((resolve) => {
                resolve([val, mysql.getCount(config.table_song, condition)]);
            });
        }).then(val => {
            let list = val[0];
            return new Promise((resolve) => {
                val[1].then(val => {
                    let data = {
                        total_num: val,
                        list: list
                    }
                    resolve(data);
                })
            });
        });
    }

    //获取歌曲详情
    static getSongInfo(id) {
    	return new Promise((resolve) => {
			let table = config.table_song +  ' left join ' + config.table_singer + ' on ' + 
				config.table_song + '.singer_id = ' + config.table_singer + '.id' +
                ' left join ' + config.table_album + ' on ' + config.table_album + '.id = ' + 
                config.table_song + '.album_id' + ' left join ' + config.table_type + ' on ' + 
				config.table_type + '.album_id = ' + config.table_album + '.id';
            let keys = `*, ${config.table_song}.singer_id AS song_singer_id, ${config.table_song}.singer_name AS song_singer_name`
			resolve(mysql.queryOne(table, keys, {'song_info.id': id}));
		})
    }

    //获取歌曲详简单信息（查询速度快）
    static getSongBasicInfo(id) {
        return new Promise((resolve) => {
            resolve(mysql.queryOne(config.table_song, '*', {id: id}));
        })
    }

    //搜索歌曲
    static searchSong(content, username, type, role, page, pageSize) {
        let condition =  "(`song_name` like '%" + content + 
                    "%' or `album_name` like '%" + content + 
                    "%' or `song_intro` like '%" + content +
                    "%' or `song_lyric` like '%" + content + "%')";
        switch (type) {
            case 'administrator':
                if(username !== role){
                    condition += " and `upload_user_name` = '" + role + "' and song_delete = 0";
                }
                break;
            case 'client':
                condition += " and song_delete = 0 and (upload_user_name = '" + username + "' or upload_user_type = 'administrator')";
                break;
            case 'anchor':
                condition += " and `upload_user_name` = '" + role + "' and song_delete = 0";
                break;
            default:
                break;
        };
        return new Promise((resolve) => {
            resolve(mysql.queryArrayByPage(config.table_song, "*", condition, page, pageSize, "song_order_extra desc, song_order desc"))
        }).then((val) => {
            return new Promise((resolve) => {
                resolve([val, mysql.getCount(config.table_song, condition)]);
            });
        }).then(val => {
            let list = val[0];
            return new Promise((resolve) => {
                val[1].then(val => {
                    let data = {
                        total_num: val,
                        list: list
                    }
                    resolve(data);
                })
            });
        });
    }
}

module.exports = Song;

// var a = new Song("a");a.createSongInDb().then((val) => {console.log(val);});
// Song.deleteSongInDb(5);
// Song.getSongBasicInfo(5).then((val) => {console.log(val);});
