"use strict";

const Moment = require('moment');
const pinyin = require('pinyin');
const config = require('../config/config');
const mysql = require('./mysql.lib');

//歌手类
class Singer {

    constructor(name = '', icon = '', sex = '', birthday = '', intro = '', uploader = '') {
        this.singer_name = name.toString().trim();
        this.singer_icon = icon;
        this.singer_sex = sex;
        this.singer_birthday = birthday;
        this.singer_intro = intro;
        this.singer_uploader_name = uploader;
    }

    //往数据库创建新的歌手
    createSingerInDb() {
        let data = {};
        if (this.singer_name) { data.singer_name = this.singer_name; }
        if (this.singer_icon) { data.singer_icon = this.singer_icon; }
        if (this.singer_sex) { data.singer_sex = this.singer_sex; }
        if (this.singer_birthday) { data.singer_birthday = this.singer_birthday; }
        if (this.singer_intro) { data.singer_intro = this.singer_intro; }
        if (this.singer_uploader_name) { data.singer_uploader_name = this.singer_uploader_name; }
        return mysql.insertOne(config.table_singer, data);
    }

    //通过id从数据库删除歌手(logic是否逻辑删除)
    static deleteSingerInDb(id, logic = true) {
        let data = {
            id: id
        };
        return new Promise((resolve) => {
            if (Boolean(logic)) {
                let params = {
                    singer_delete: 1
                }
                mysql.update(config.table_singer, params, data).then(
                    (val) => { resolve(val); }
                );
            } else {
                mysql.delete(config.table_singer, data).then(
                    (val) => { resolve(val); }
                );
            }
        })
    }

    /**修改歌手信息
     * data (json格式歌手信息)
     */
    modifySinger(data) {
        try {
            JSON.stringify(data);
        } catch (e) {
            return e;
        }
        if (data.id) { this.id = data.id; }
        if (data.singer_name) { this.singer_name = data.singer_name; }
        if (data.singer_icon) { this.singer_icon = data.singer_icon; }
        if (data.singer_sex) { this.singer_sex = data.singer_sex; }
        if (data.singer_birthday) { this.singer_birthday = data.singer_birthday; }
        if (data.singer_intro) { this.singer_intro = data.singer_intro; }
        if (data.singer_uploader_name) { this.singer_uploader_name = data.singer_uploader_name; }
        return this;
    }

    /**
     * 往数据库修改歌手信息
     */
    updateSingerInDb() {
        if (!this.id) return Promise.resolve('not found id');
        let data = {};
        if (this.id) { data.id = this.id; }
        if (this.singer_name) {
            data.singer_name = this.singer_name;
            data.c_index = pinyin(this.singer_name, {
                style: pinyin.STYLE_FIRST_LETTER
            })[0][0][0].toUpperCase();
        }
        if (this.singer_icon) { data.singer_icon = this.singer_icon; }
        if (this.singer_sex) { data.singer_sex = this.singer_sex; }
        if (this.singer_birthday) { data.singer_birthday = Moment(this.singer_birthday).format('YYYY-MM-DD HH:mm:ss'); }
        if (this.singer_intro) { data.singer_intro = this.singer_intro; }
        if (this.singer_uploader_name) { data.singer_uploader_name = this.singer_uploader_name; }
        return new Promise((resolve) => {
            let condition = {
                id: data.id
            };
            mysql.update(config.table_singer, data, condition).then(
                (val) => { resolve(val); }
            );
        });
    }

    //获取歌手名列表
    static getSingerNameList() {
        return new Promise((resolve) => {
            mysql.queryAll(config.table_singer, ["id", "singer_name", "singer_icon"], "singer_delete = 0").then(
                    (val) => { resolve(val); }
                )
                //对歌手进行首字母排序
        }).then(val => {
            let arr = new Array();
            val.forEach((item, index) => {
                item.c_index = pinyin(item.singer_name, {
                    style: pinyin.STYLE_FIRST_LETTER
                })[0][0][0].toUpperCase();
                let flag = false;
                for (let it of arr) {
                    if (it[0]['c_index'] === item.c_index) {
                        it.push(item);
                        flag = true;
                    }
                }
                if (!flag) {
                    arr.push([item]);
                }
            })
            let sortIndex = (a, b) => {
                return a[0]['c_index'].charCodeAt() - b[0]['c_index'].charCodeAt();
            }
            arr.sort(sortIndex);
            return Promise.resolve(arr);
        })
    }

    //获取歌手列表
    static getSingerList(username, type, role, page = 1, pageSize = config.pageSize) {
        let condition;
        switch (type) {
            case 'administrator':
                if (username === role) {
                    condition = {
                        singer_delete: '0'
                    }
                } else {
                    condition = {
                        singer_uploader_name: role,
                        singer_delete: '0'
                    }
                }
                break;
            case 'client':
                condition = {
                    singer_uploader_name: username,
                    singer_delete: '0'
                };
                break;
            case 'anchor':
                condition = {
                    singer_uploader_name: username,
                    singer_delete: '0'
                };
                break;
            default:
                condition = {
                    singer_uploader_name: username,
                    singer_delete: '0'
                };
                break;
        }
        return new Promise((resolve) => {
            resolve(mysql.queryArrayByPage(config.table_singer, "*", condition, page, pageSize, "create_time desc"))
        }).then((val) => {
            return new Promise((resolve) => {
                resolve([val, mysql.getCount(config.table_singer, condition)]);
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

    //获取歌手信息
    static getSingerInfo(id) {
        return new Promise((resolve) => {
            mysql.queryOne(config.table_singer, "*", { id: id }).then(
                (val) => { resolve(val); }
            );
        })
    }

    //搜索歌手
    static searchSinger(content, username, type, role, page, pageSize) {
        let condition = "(`singer_name` like '%" + content +
            "%' or `singer_intro` like '%" + content + "%')";
        switch (type) {
            case 'administrator':
                if (username !== role) {
                    condition += " and `singer_uploader_name` = '" + role + "' and singer_delete = 0";
                } else {
                    condition += " and singer_delete = 0";
                }
                break;
            case 'client':
                condition += " and singer_delete = 0 and (singer_uploader_name = '" + username + "')";
                break;
            case 'anchor':
                condition += " and `singer_uploader_name` = '" + role + "' and singer_delete = 0";
                break;
            default:
                break;
        };
        return new Promise((resolve) => {
            resolve(mysql.queryArrayByPage(config.table_singer, "*", condition, page, pageSize, "create_time desc"))
        }).then((val) => {
            return new Promise((resolve) => {
                resolve([val, mysql.getCount(config.table_singer, condition)]);
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

module.exports = Singer;
// Singer.getSingerNameList().then(a => console.log(a))
// Singer.getSingerList('testanchor3','anchor','testanchor3').then(a => console.log(a))
