"use strict";

const Moment = require('moment');
const config = require('../config/config');
const mysql = require('./mysql.lib');
const Type = require('./type.lib');

//专辑类
class Album {

    constructor(name = '', icon = '', intro = '', category = '', issue_date = '',
    	upload_user_id = null, upload_user_name = '', upload_user_type='', min_age = 0, max_age = 0) 
    {
        this.album_name = name;
        this.album_icon = icon;
        this.album_intro = intro;
        this.album_category = category;
        this.issue_date = issue_date;
        this.upload_user_id = upload_user_id;
        this.upload_user_name = upload_user_name;
        this.upload_user_type = upload_user_type;
        this.album_min_age = min_age;
        this.album_max_age = max_age;
        this.album_order_extra = upload_user_type == 'client'? 99 : 0 ;
    }

    //往数据库创建新的专辑
	createAlbumInDb() {
		let data = {};
		if(this.album_name){ data.album_name = this.album_name; }
		if(this.album_intro){ data.album_intro = this.album_intro; }
		if(this.album_icon){ data.album_icon = this.album_icon; }
		if(this.songs_count){ data.songs_count = this.songs_count; }
		if(this.album_hits){ data.album_hits = this.album_hits; }
		if(this.singer_id){ data.singer_id = this.singer_id; }
		if(this.singer_name){ data.singer_name = this.singer_name; }
		if(this.album_category){ data.album_category = this.album_category; }
		if(this.album_min_age){ data.album_min_age = this.album_min_age; }
		if(this.album_max_age){ data.album_max_age = this.album_max_age; }
		if(this.album_order_extra){ data.album_order_extra = this.album_order_extra; }
		if(this.issue_date){ data.issue_date = this.issue_date; }
		if(this.upload_user_id){ data.upload_user_id = this.upload_user_id; }
		if(this.upload_user_name){ data.upload_user_name = this.upload_user_name; }
		if(this.upload_user_type){ data.upload_user_type = this.upload_user_type; }
		return new Promise((resolve,reject) => {
			//获取到最高排序序号
			mysql.queryOne(config.table_album, 'album_order', "*", "album_order DESC").then((val) => {
				if(!val){
					return Promise.resolve(-99);
				}else if(val.album_order || val.album_order === 0){
					return Promise.resolve(val.album_order);
				}
			}).then((val) => {
				//将排序序号+100然后插入到专辑信息表
				data.album_order = parseInt(val) + 100;
				return Promise.resolve(mysql.insertOne(config.table_album, data));
			}).then((val) => {
				if(val.affectedRows > 0){
					let typeData = {
						album_id : val.insertId,
						type_name : Type.getTypeName(this.album_category)
					};
					//插入到类型信息表
					resolve(mysql.insertOne(config.table_type, typeData));
				}else{
					resolve('album save failed');
				}
			}).catch(function(err){
		    	//异常在这里处理
		    });
		})
	}

	//通过id从数据库删除专辑(logic是否逻辑删除)
	static deleteAlbumInDb(id, logic = true) {
		let data = {
			id : id
		};
		return new Promise((resolve) => {
			if(Boolean(logic)){
				let params = {
					album_delete : 1,
					update_time : Moment().format('YYYY-MM-DD HH:mm:ss')
				}
				mysql.update(config.table_album, params, data).then(
					(val) => { resolve(val); }
				);
			}else{
				mysql.delete(config.table_album, data).then(
					(val) => { resolve(val); }
				);
			}
		})
	}

	/**修改专辑信息
	 * data (json格式专辑信息)
	 */
	modifyAlbum(data) {
		try{
			JSON.stringify(data);
		}catch(e){
			return e;
		}
		if(data.id){ this.id = data.id; }
		if(data.album_name){ this.album_name = data.album_name; }
		if(data.album_intro){ this.album_intro = data.album_intro; }
		if(data.album_icon){ this.album_icon = data.album_icon; }
		if(data.songs_count){ this.songs_count = data.songs_count; }
		if(data.album_hits){ this.album_hits = data.album_hits; }
		if(data.singer_id){ this.singer_id = data.singer_id; }
		if(data.singer_name){ this.singer_name = data.singer_name; }
		if(data.album_category){ this.album_category = data.album_category; }
		if(data.album_min_age){ this.album_min_age = data.album_min_age; }
		if(data.album_max_age){ this.album_max_age = data.album_max_age; }
		if(data.album_order){ this.album_order = data.album_order; }
		if(data.issue_date){ this.issue_date = data.issue_date; }
		return this;
	}

	/**
	 * 往数据库修改专辑信息
	 */
	updateAlbumInDb() {
		if(!this.id) return Promise.resolve('not found id');
		let data = {};
		if(this.id){ data.id = this.id; }
		if(this.album_name){ data.album_name = this.album_name; }
		if(this.album_intro){ data.album_intro = this.album_intro; }
		if(this.album_icon){ data.album_icon = this.album_icon; }
		if(this.songs_count){ data.songs_count = this.songs_count; }
		if(this.album_hits){ data.album_hits = this.album_hits; }
		if(this.singer_id){ data.singer_id = this.singer_id; }
		if(this.singer_name){ data.singer_name = this.singer_name; }
		if(this.album_category){ data.album_category = this.album_category; }
		if(this.album_min_age){ data.album_min_age = this.album_min_age; }
		if(this.album_max_age){ data.album_max_age = this.album_max_age; }
		if(this.album_order){ data.album_order = this.album_order; }
		if(this.issue_date){ data.issue_date = this.issue_date; }
        data.update_time = Moment().format('YYYY-MM-DD HH:mm:ss');
		return new Promise((resolve) => {
			let condition = {
				id : data.id
			};
			mysql.update(config.table_album, data, condition).then(
				(val) => { resolve(val); }
			);
		});
	}

	//获取专辑列表
	static getAlbumlist(username, type, role, page = 1, pageSize = config.pageSize) {
		let condition;
		switch(type){
			case 'administrator':
				if(username === role){
					condition = '*';
				}else{
					condition = {
						upload_user_name: role,
						album_delete: '0'
					}
				}
				break;
			case 'client':
				condition = "album_delete = 0 and (upload_user_name = '" + username + "' or upload_user_type = 'anchor' or upload_user_type = 'administrator')";
				break;
			case 'anchor':
				condition = {
					upload_user_name: username,
					album_delete: '0'
				};
				break;
			default:
				break;
		}
		return new Promise((resolve) => {
			resolve(mysql.queryArrayByPage(config.table_album, "*", condition, page,  pageSize, "album_order_extra desc, album_order desc"))
		}).then((val) => {
			return new Promise((resolve) => {
				resolve([val,mysql.getCount(config.table_album, condition)]);
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

	//获取专辑信息
	static getAlbumInfo(id) {
		return new Promise((resolve) => {
			let table = config.table_album + ' left join ' + config.table_singer + ' on ' + 
			config.table_album + '.singer_id = ' + config.table_singer + '.id' + 
			' left join ' + config.table_type + ' on ' + config.table_album + '.id = ' + 
			config.table_type + '.album_id';
			resolve(mysql.queryOne(table, '*', {'album_info.id': id}));
		})
	}

	//搜索专辑
	static searchAlbum(content, username, type, role, page, pageSize) {
        let condition =  "(`album_name` like '%" + content + 
                    "%' or `album_intro` like '%" + content + "%')";
        switch (type) {
            case 'administrator':
                if(username !== role){
                    condition += " and `upload_user_name` = '" + role + "' and album_delete = 0";
                }
                break;
            case 'client':
                condition += " and album_delete = 0 and (upload_user_name = '" + username + "' or upload_user_type = 'administrator')";
                break;
            case 'anchor':
                condition += " and `upload_user_name` = '" + role + "' and album_delete = 0";
                break;
            default:
                break;
        };
        return new Promise((resolve) => {
            resolve(mysql.queryArrayByPage(config.table_album, "*", condition, page, pageSize, "album_order_extra desc, album_order desc"))
        }).then((val) => {
            return new Promise((resolve) => {
                resolve([val, mysql.getCount(config.table_album, condition)]);
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

module.exports = Album;
// Album.getAlbumInfo(71).then(a=>console.log(a));
// var a = new Album('娃哈哈','测试地址','测试说明',2);
// var a = new Album('娃哈哈','测试地址','测试说明',3).deleteAlbumInDb(10).then((val)=>{console.log(val);});
// a.createAlbumInDb().then((val)=>{console.log(val);});
// console.log(a);
// a.modifyAlbum({id:1});
// a.updateAlbumInDb();
// Album.getAlbumlist('cocheer', 'client').then(val => console.log(val));
// Album.deleteAlbumInDb(0).then(val => console.log(val));