"use strict";

const config = require('../config/config');

//音乐类别类
class Type {

    constructor() {

    }

    //获取类型名
    static getTypeName(code) {
    	let typeCode = parseInt(code);
    	if(!typeCode) return null;
    	let codeName;
    	switch(typeCode){
    		case 1:
    			codeName = "欢乐儿歌";
    			break;
    		case 2:
    			codeName = "国学经典";
    			break;
    		case 3:
    			codeName = "童话故事";
    			break;
    		case 4:
    			codeName = "英语启蒙";
    			break;
    		default:
    			codeName = null;
    			break;
    	}
    	return codeName;
    }

    //获取所有类型
    static getAllType(){
    	let typeInfo = [{
    		code : 1,
    		name : "欢乐儿歌"
    	},{
    		code : 2,
    		name : "国学经典"
    	},{
    		code : 3,
    		name : "童话故事"
    	},{
    		code : 4,
    		name : "英语启蒙"
    	},];
    	return typeInfo;
    }
}

module.exports = Type;