const mysql = require('mysql');
const config = require('../config/config');

var pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    database: config.database,
    debug: false,
    stringifyObjects:true,
    useConnectionPooling: true
});
var pageSizeDefault = config.pageSize; 
var db = {}; 
db = {
	/**sql:sql语句
	 **resolve(e):查询结果
	**/
	query : function(sql){
		console.log(sql);
		return new Promise((resolve,reject)=>{
			pool.getConnection(function (err, conn) {
			    if (err) console.log("POOL ERR==> " + err);
			    resolve (conn);
			});
		}).then((conn)=>{
		    return new Promise((resolve,reject)=>{
		    	conn.query(sql,function(err,rows){
			        if (err) console.log("POOL SQL ERR==> ",err);
			        // console.log('sql result:',rows);
			        conn.release();
			        resolve(rows);
			    });
			});
		});
	},
	//断开连接
	end : function(){
		connection.end(function(err) {
		  // The connection is terminated now 
		  //console.log(err);
		});
	},
	/**table:表名
	 **params:关联json
	 **resolve(e):回调函数（rows）
	**/
	insertOne : function(table,params){
		if(!table)	return Promise.resolve(null);
		try{
			JSON.stringify(params);
		}catch(e){
			console.log(e);
			return Promise.resolve(null);
		}
		var sql = '';
		var sqlkey = new Array();
		var sqlvalue = new Array();
		sql += 'INSERT INTO ' + table +' (';
		for(var e in params){
			if(params.hasOwnProperty(e)){
				sqlkey.push(e);
				sqlvalue.push(params[e]);
			}
		}
		var sqlkeyStr  = sqlkey.join(',');
		var sqlvalueStr  = "'" + sqlvalue.join("','") + "'";
		sql += sqlkeyStr +') VALUES (' + sqlvalueStr + ')';
		//console.log(sql);
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **params:关联json的数组
	 **resolve回调函数（rows）
	**/
	//db.insertArray('cocheer',[{key:123,name:'abc'},{key:456,name:'def'},{key:789,name:'ghi'}]);
	insertArray : function(table,params){
		if(!table)	return Promise.resolve(null);
		if(Object.prototype.toString.call(params) !== '[object Array]')	return Promise.resolve(null);	
		var sqlvalue = new Array();
		var sqlvalueStrArray = new Array();
		for(var e in params){
			if(params.hasOwnProperty(e)){
				try{
					JSON.stringify(params[e]);
				}catch(err){
					console.log(err);
					return Promise.resolve(null);
				}
			}
			sqlvalue[e] = new Array();
			for(var el in params[e]){
				if(params[e].hasOwnProperty(el)){
					sqlvalue[e].push(params[e][el]);
				}
			}
			sqlvalueStrArray[e] = sqlvalue[e].join("','");
		}
		var sqlvalueStr = sqlvalueStrArray.join("'),('");
		var sql = '';
		var sqlkey = new Array();
		for(var e in params[0]){
			if(params[0].hasOwnProperty(e)){
				sqlkey.push(e);
			}
		}
		var sqlkeyStr  = sqlkey.join('`,`');
		sql += 'INSERT INTO ' + table +' (`';
		sql += sqlkeyStr +"`) VALUES ('" + sqlvalueStr + "')";
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	//不存在则创建，存在则删除再创建
	replaceOne : function(table,params){
		if(!table)	return Promise.resolve(null);
		try{
			JSON.stringify(params);
		}catch(e){
			console.log(e);
			return Promise.resolve(null);
		}
		var sql = '';
		var sqlkey = new Array();
		var sqlvalue = new Array();
		sql += 'REPLACE INTO ' + table +' (';
		for(var e in params){
			if(params.hasOwnProperty(e)){
				sqlkey.push(e);
				sqlvalue.push(params[e]);
			}
		}
		var sqlkeyStr  = sqlkey.join(',');
		var sqlvalueStr  = "'" + sqlvalue.join("','") + "'";
		sql += sqlkeyStr +') VALUES (' + sqlvalueStr + ')';
		//console.log(sql);
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **params:关联json的数组
	 **callback(e):回调函数（rows）
	**/
	replaceArray : function(table,params){
		if(!table)	return Promise.resolve(null);
		if(Object.prototype.toString.call(params) !== '[object Array]')	return Promise.resolve(null);	
		var sqlvalue = new Array();
		var sqlvalueStrArray = new Array();
		for(var e in params){
			if(params.hasOwnProperty(e)){
				try{
					JSON.stringify(params[e]);
				}catch(err){
					console.log(err);
					return Promise.resolve(null);
				}
			}
			sqlvalue[e] = new Array();
			for(var el in params[e]){
				if(params[e].hasOwnProperty(el)){
					sqlvalue[e].push(params[e][el]);
				}
			}
			sqlvalueStrArray[e] = sqlvalue[e].join("','");
		}
		var sqlvalueStr = sqlvalueStrArray.join("'),('");
		var sql = '';
		var sqlkey = new Array();
		for(var e in params[0]){
			if(params[0].hasOwnProperty(e)){
				sqlkey.push(e);
			}
		}
		var sqlkeyStr  = sqlkey.join(',');
		sql += 'REPLACE INTO ' + table +' (';
		sql += sqlkeyStr +") VALUES ('" + sqlvalueStr + "')";
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **condition:条件json
	 **callback(e):回调函数（rows）
	**/
	delete : function(table,conditions){
		if(!table)	return Promise.resolve(null);
		try{
			JSON.stringify(conditions);
		}catch(e){
			console.log(e);
			return Promise.resolve(null);
		}
		var sql = '';
		var sqlcondition = new Array();
		sql += 'DELETE FROM ' + table;
		for(var e in conditions){
			if(conditions.hasOwnProperty(e)){
				sqlcondition.push(e + "='" + conditions[e] +"'");
			}
		}
		var sqlconditionStr  = sqlcondition.join(' AND ');
		sql += ' WHERE ' + sqlconditionStr;
		//console.log(this.sql);
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **params:关联json
	 **condition:条件json
	 **callback(e):回调函数（rows）
	**/
	update : function(table,params,conditions){
		if(!table)	return Promise.resolve(null);
		var sql = '';
		var sqlparam = new Array();
		var sqlcondition = new Array();
		sql += 'UPDATE ' + table + ' SET ';
		for(var e in params){
			if(Object.prototype.toString.call(params) === "[object String]"){
				sqlparam.push(params);
				break;
			}
			if(params.hasOwnProperty(e)){
				sqlparam.push(e + "='" + params[e] +"'");
			}
		}
		var sqlparamStr = sqlparam.join(', ');
		sql += sqlparamStr;
		for(var e in conditions){
			if(conditions.hasOwnProperty(e)){
				sqlcondition.push(e + "='" + conditions[e] +"'");
			}
		}
		var sqlconditionStr  = sqlcondition.join(' AND ');
		sql += ' WHERE ' + sqlconditionStr;
		//console.log(sql);
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **keys:要查询的属性array/*
	 **condition:条件json
	 **callback(e):回调函数（rows）
	 **page:页码int
	 **pageSize:每页条数int
	 **order:排序方式
	**/
	queryArrayByPage : function(table,keys,conditions,page,pageSize,order){
		var sql = '';
		var sqlkey = new Array;
		var sqlcondition = new Array;
		var conditionsLength = 0;
		var orderby = ' ORDER BY ';
		if(!table)	return Promise.resolve(null);
		Object.prototype.toString.call(keys) === '[object Array]'?sqlkey = keys.join(','):sqlkey = keys;
		try{
			JSON.stringify(conditions);
		}catch(e){
			// return Promise.resolve(null);
		}
		//page不传时默认为1
		if(page === undefined || page === null) page = 1;
		if(!pageSize) pageSize = pageSizeDefault;
		sql += 'SELECT ' + sqlkey + ' FROM ' + table;
		for(var e in conditions){
			if(Object.prototype.toString.call(conditions) === "[object String]") break;
			if(conditions.hasOwnProperty(e)){
				conditionsLength ++;
				if(conditions[e] === '*') continue;
				// sqlcondition.push('`' + e + "` = '" + conditions[e] +"'");
				sqlcondition.push(e + " = '" + conditions[e] +"'");
		　　}
		}
		var sqlconditionStr = sqlcondition.join(' AND ');
		if (!sqlconditionStr){
			sqlconditionStr = 1;
		}
 		if(conditions != "*"){
			conditionsLength == 0 ? sql += ' WHERE ' + conditions:sql += ' WHERE ' + sqlconditionStr;
		}
		order? orderby += order:orderby = '';
		sql += orderby;
		//page为0时查询所有数据
		page == 0?true:sql += ' LIMIT ' + (page-1)*pageSize + ',' + pageSize;
		//console.log(sql);
		return new Promise((resolve,reject)=>{
			this.query(sql)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **keys:要查询的属性array/*
	 **condition:条件json
	 **callback(e):回调函数（rows）
	**/
	queryOne : function(table,keys,conditions,order){
		return new Promise((resolve,reject)=>{
			this.queryArrayByPage(table,keys,conditions,1,1,order)
				.then((val)=>{
					if(val[0])
						resolve(val[0]);
					else
						resolve(null);
				});
		});
	},
	/**table:表名
	 **keys:要查询的属性array/*
	 **condition:条件json
	 **callback(e):回调函数（rows）
	 **order:排序方式
	**/
	queryAll : function(table,keys,conditions,order){
		return new Promise((resolve,reject)=>{
			this.queryArrayByPage(table,keys,conditions,0,'',order)
				.then((val)=>{resolve(val);});
		});
	},
	/**table:表名
	 **condition:条件json
	 **callback(e):回调函数（rows）
	 **rows[0]['COUNT(*)']
	**/
	getCount : function(table,conditions){
		return new Promise((resolve,reject)=>{
			this.queryArrayByPage(table,'COUNT(*)',conditions,0)
				.then((val)=>{resolve(val[0]['COUNT(*)']);});
		});
	}
}	

module.exports = db;
// 测试查询
// db.query('Select * from song_info INNER JOIN album_info ON song_info.album_id = album_info.id').then((val)=>{console.log(val);});
// 测试insertOne
// db.insertOne('cocheer_collect',{openID:123}).then((val)=>{console.log(val);});
// 测试insertArray
// db.insertArray('cocheer_collect',[{openID:123,songID:'abc'},{openID:456,songID:'def'},{openID:789,songID:'ghi'}]).then((val)=>{console.log(val);});
// 测试replaceOne
// db.replaceOne('cocheer_collect',{openID:123}).then((val)=>{console.log(val);});
// 测试replaceArray
// db.replaceArray('cocheer_collect',[{openID:123,songID:'abc'},{openID:456,songID:'def'},{openID:789,songID:'ghi'}]).then((val)=>{console.log(val);});
// 测试delete
// db.delete('cocheer_collect',{openID:123}).then((val)=>{console.log(val);});
// 测试update
// db.update('cocheer_collect',{openID:999},{openID:456}).then((val)=>{console.log(val);});
// 测试queryArrayByPage
// db.queryArrayByPage('cocheer_collect','openID',{songID:'def'},1,2).then((val)=>{console.log(val);});
// 测试queryOne
// db.queryOne('cocheer_collect','openID',{songID:'def'}).then((val)=>{console.log(val);});
// 测试queryAll
// db.queryAll('cocheer_collect','openID',{songID:'def'}).then((val)=>{console.log(val);});
// 测试getCount
// db.getCount('cocheer_collect',{songID:'def'}).then((val)=>{console.log(val);});