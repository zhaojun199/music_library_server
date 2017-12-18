"use strict";

const config = require('../config/config');

//响应类
class Response {

    constructor() {

    }

    static print(code, message, data) {
    	let resCode = parseInt(code);
    	if(!resCode)
            resCode = 0;
    	let codeName;
    	switch(resCode){
            case 0:
                codeName = "成功";
                break;
    		case 1:
    			codeName = "参数错误";
    			break;
    		case 2:
    			codeName = "数据库错误";
    			break;
    		case 3:
    			codeName = "限制错误";
    			break;
    		case 4:
    			codeName = "重复性错误";
    			break;
    		default:
    			codeName = "未知错误";
    			break;
    	}
        let exporting = {
            status: code,
            cause: codeName,
            message: message,
            data: data
        }
    	return exporting;
    }

}

module.exports = Response;