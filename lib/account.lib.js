"use strict";

const config = require('../config/config');
const mysql = require('./mysql.lib');
const crypto = require('crypto');

//账号类
class Account {

    constructor(username = '', password = '', type = 'client', true_name = '', email = '', tel = 0) {
        this.username = username.toString().trim();
        this.password = password ? crypto.createHash('md5').update(password.toString()).digest('hex') : '';
        this.type = type;
        this.true_name = true_name;
        this.email = email;
        this.tel = tel;
    }

    //往数据库创建新的账号
    createAccountInDb() {
        let data = {};
        if (this.username) { data.username = this.username; }
        if (this.password) { data.password = this.password; }
        if (this.type) { data.type = this.type; }
        if (this.true_name) { data.true_name = this.true_name; }
        if (this.email) { data.email = this.email; }
        if (this.tel) { data.tel = this.tel; }
        if (this.singer_id) { data.singer_id = this.singer_id; }
        return mysql.insertOne(config.table_admin, data);
    }

    //通过id从数据库删除账号
    static deleteAccountInDb(id) {
        let data = {
            id: id
        };
        return new Promise((resolve) => {
            mysql.delete(config.table_admin, data).then(
                (val) => { resolve(val); }
            );
        })
    }

    //判断账户名和密码是否存在
    static isExist(name, pwd = null) {
        let data = {
            username: name
        };
        if (pwd) {
            data.password = crypto.createHash('md5').update(pwd.toString()).digest('hex');
        }
        return new Promise((resolve) => {
            mysql.queryOne(config.table_admin, "*", data).then(
                (val) => { resolve(val); }
            );
        })
    }

    /**修改账号信息
     * data (json格式账号信息)
     */
    modifyAccount(data) {
        try {
            JSON.stringify(data);
        } catch (e) {
            return e;
        }
        if (data.id) { this.id = data.id; }
        if (data.username) { this.username = data.username; }
        if (data.password) { this.password = crypto.createHash('md5').update(data.password.toString().trim()).digest('hex'); }
        if (data.type) { this.type = data.type; }
        if (data.true_name) { this.true_name = data.true_name; }
        if (data.email) { this.email = data.email; }
        if (data.tel) { this.tel = data.tel; }
        if (data.singer_id) { this.singer_id = data.singer_id; }
        return this;
    }

    /**
     * 往数据库修改账号信息
     */
    updateAccountInDb() {
        if (!this.id) return Promise.resolve('not found id');
        let data = {};
        if (this.id) { data.id = this.id; }
        if (this.username) { data.username = this.username; }
        if (this.password) { data.password = this.password; }
        if (this.type) { data.type = this.type; }
        if (this.true_name) { data.true_name = this.true_name; }
        if (this.email) { data.email = this.email; }
        if (this.tel) { data.tel = this.tel; }
        if (this.singer_id) { data.singer_id = this.singer_id; }
        return new Promise((resolve) => {
            let condition = {
                id: data.id
            };
            mysql.update(config.table_admin, data, condition).then(
                (val) => { resolve(val); }
            );
        });
    }

    //获取帐号名列表
    static getAccountNameList() {
        return new Promise((resolve) => {
            let cond = {
                admin_delete: 0
            };
            mysql.queryAll(config.table_admin, "username", cond).then(
                (val) => { resolve(val); }
            );
        })
    }

    //获取帐号详情列表
    static getAccountList() {
        return new Promise((resolve) => {
            mysql.queryAll(config.table_admin, "*", "*").then(
                (val) => { resolve(val); }
            );
        })
    }

    //获取单个帐号详情
    static getAccountInfo(id) {
        return new Promise((resolve) => {
            mysql.queryOne(config.table_admin, "*", { id: id }).then(
                (val) => { resolve(val); }
            );
        })
    }

    //删除账号
    static deleteAccountInDb(id, logic = true) {
        let data = {
            id: id
        };
        return new Promise((resolve) => {
            if (Boolean(logic)) {
                let params = {
                    admin_delete: 1
                }
                mysql.update(config.table_admin, params, data).then(
                    (val) => { resolve(val); }
                );
            } else {
                mysql.delete(config.table_admin, data).then(
                    (val) => { resolve(val); }
                );
            }
        })
    }

    //恢复逻辑删除的账号
    static recoverAccountInDb(id) {
        let data = {
            id: id
        };
        return new Promise((resolve) => {
            let params = {
                admin_delete: 0
            }
            mysql.update(config.table_admin, params, data).then(
                (val) => { resolve(val); }
            );
        })
    }
}

module.exports = Account;
// new Account('cocheer','www.cocheer.net','administrator').createAccountInDb();
// new Account('testclient5','testclient5','client').createAccountInDb().then(val => {console.log(val);});
// cocheer/www.cocheer.net
// Account.getAccountNameList().then(a=>console.log(a))
// Account.getAccountInfo(1).then(a=>console.log(a))
