const express = require('express');
const router = express.Router();
const multiparty = require('multiparty');
const fs = require('fs');
const uuid = require('node-uuid');
const config = require('../../config/config');
const Type = require('../../lib/type.lib');
const Account = require('../../lib/account.lib');
const Album = require('../../lib/album.lib');
const Song = require('../../lib/song.lib');
const Singer = require('../../lib/singer.lib');
const Response = require('../../lib/response.lib');

//allow custom header and CORS
router.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
        //让options请求快速返回
    } else {
        next();
    }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

//登录
router.post('/login', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.body.username || !req.body.password) {
        res.send(Response.print(config.error_1, "参数不完整", req.body));
        return;
    }
    Account.isExist(req.body.username, req.body.password).then(val => {
        if (val) {
            res.send(Response.print(config.error_0, "登录成功", val));
        } else {
            res.send(Response.print(config.error_2, "账号或密码错误", val));
        }
    })
});

//获取账户名列表
router.get('/account/list/name', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    Account.getAccountNameList().then(val => {
        if (val) {
            let list = new Array();
            for (let value of val) {
                list.push(value.username);
            }
            res.send(Response.print(config.error_0, "获取账户名成功", list));
        } else {
            res.send(Response.print(config.error_2, "获取账户名失败", val));
        }
    })
});

//获取账户详情列表
router.get('/account/list/all', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    Account.getAccountList().then(val => {
        if (val) {
            for(key of val){
                delete key.password;
            }
            res.send(Response.print(config.error_0, "获取账户列表成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取账户列表失败", val));
        }
    })
});

//创建帐号
router.post('/account/create', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.body.username || !req.body.password || !req.body.true_name) {
        res.send(Response.print(config.error_1, "参数不完整", req.body));
        return;
    }
    Account.isExist(req.body.username).then(val => {
        if (val) {
            res.send(Response.print(config.error_4, "账号已存在", val));
        } else {
            let accountObj = new Account(req.body.username, req.body.password,
                req.body.type, req.body.true_name, req.body.email, req.body.tel);
            switch (req.body.type) {
                case 'anchor':
                    //对于主播型帐号，会自动创建一个歌手
                    let singerObj = new Singer(req.body.true_name).modifySinger({ singer_uploader_name: req.body.username });
                    singerObj.createSingerInDb().then(val => {
                        if (val) {
                            let extra = {
                                singer_id: val.insertId
                            };
                            accountObj.modifyAccount(extra).createAccountInDb().then(val => {
                                if (val) {
                                    res.send(Response.print(config.error_0, "创建帐号成功", val));
                                } else {
                                    res.send(Response.print(config.error_2, "创建帐号失败", req.body));
                                }
                            })
                        }else{
                            res.send(Response.print(config.error_2, "创建歌手失败", req.body));
                        }
                    })
                    break;
                default:
                    accountObj.createAccountInDb().then(val => {
                        if (val) {
                            res.send(Response.print(config.error_0, "创建帐号成功", val));
                        } else {
                            res.send(Response.print(config.error_2, "创建帐号失败", req.body));
                        }
                    })
                    break;
            }
        }
    })
});

//获取账号信息
router.get('/account/show', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    Account.getAccountInfo(req.query.id).then(val => {
        if (val) {
            res.send(Response.print(config.error_0, "获取账号信息成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取账号信息失败", val));
        }
    })
});

//修改账号
router.get('/account/modify', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let data = req.query;
    if (!data.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    let accountObj = new Account();
    accountObj.modifyAccount(data);
    accountObj.updateAccountInDb().then((val) => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "修改账号成功", val));
        } else {
            res.send(Response.print(config.error_2, "修改账号失败", val));
        }
    });
});

//逻辑删除账号
router.get('/account/delete/logic', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Account.deleteAccountInDb(req.query.id).then(val => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "删除专辑成功", val));
        } else {
            res.send(Response.print(config.error_2, "删除专辑失败", val));
        }
    })
});

//还原逻辑删除的账号
router.get('/account/recover', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Account.recoverAccountInDb(req.query.id).then(val => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "恢复专辑成功", val));
        } else {
            res.send(Response.print(config.error_2, "恢复专辑失败", val));
        }
    })
});

//获取分类列表
router.get('/type', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let categoryInfo = Type.getAllType();
    res.send(Response.print(config.error_0, "获取分类成功", categoryInfo));
});

//获取专辑列表
router.get('/album/list', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let type = req.query.type || 'client';
    let role = req.query.role || req.query.username;
    Album.getAlbumlist(req.query.username, type, role, req.query.page, req.query.pageSize).then(val => {
        if (Object.prototype.toString.call(val.list) === '[object Array]') {
            res.send(Response.print(config.error_0, "获取专辑列表成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取专辑列表失败", val));
        }
    })
});

//获取专辑信息
router.get('/album/show', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Album.getAlbumInfo(req.query.id).then(val => {
        if (val) {
            let data = {
                album: val,
                type: Type.getAllType()
            }
            data.album.category_name = Type.getTypeName(data.album.album_category);
            res.send(Response.print(config.error_0, "获取专辑信息成功", data));
        } else {
            res.send(Response.print(config.error_2, "获取专辑信息失败", val));
        }
    })
});

//创建专辑
router.post('/album/create', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    //生成multiparty对象，并配置上传目标路径
    let form = new multiparty.Form({
        uploadDir: config.album_icon_path,
        maxFilesSize: config.album_icon_size
    });
    //上传完成后处理
    try {
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log('parse error: ' + err);
                let output = Response.print(config.error_1, "参数解析错误", err);
                res.send(output);
            } else {
                let album_name = fields.album_name[0],
                    album_icon = files.file[0].originalFilename,
                    album_intro = fields.album_intro[0],
                    album_category = fields.album_category[0],
                    issue_date = fields.issue_date[0],
                    upload_user_id = fields.upload_user_id[0],
                    upload_user_name = fields.upload_user_name[0],
                    upload_type = fields.upload_type[0],
                    min_age = fields.min_age[0],
                    max_age = fields.max_age[0],
                    exte = album_icon.split('.').pop().toLowerCase();
                if (exte) {
                    if (exte != 'png' && exte != 'jpg' && exte != 'jpeg' && exte != 'gif' && exte != 'bmp') {
                        let output = Response.print(config.error_3, "专辑icon非图片", exte);
                        res.send(output);
                        return false;
                    }
                    if (!album_name || !album_category) {
                        let output = Response.print(config.error_1, "参数不完整");
                        res.send(output);
                        return false;
                    }
                    let path = files.file[0].path;
                    let iconName = uuid.v1() + '.' + exte;
                    let dstPathIcon = config.album_icon_path + iconName;
                    let virtualPathIcon = config.album_icon_path_v + iconName;
                    //重命名为真实文件名
                    fs.rename(path, dstPathIcon, function(err) {
                        if (err) {
                            let output = Response.print(config.error_x, "图片重命名错误", err);
                            res.send(output);
                        } else {
                            album_icon = virtualPathIcon;
                            let albumObj = new Album(album_name, album_icon, album_intro, album_category, issue_date,
                                upload_user_id, upload_user_name, upload_type, min_age, max_age);
                            albumObj.createAlbumInDb().then((val) => {
                                if (val.affectedRows > 0) {
                                    let output = Response.print(config.error_0, "专辑新建成功", val);
                                    res.send(output);
                                } else {
                                    let output = Response.print(config.error_2, "专辑新建失败", val);
                                    res.send(output);
                                }
                            })
                        }
                    });
                } else {
                    let output = Response.print(config.error_3, "上传非图片文件", album_icon);
                    res.send(output);
                }
            }
        })
    } catch (e) {
        console.log('set err:', e);
        let output = Response.print(config.error_x, "", err);
        res.send(output);
    }
});

//修改专辑
router.get('/album/modify', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let data = req.query;
    if (!data.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    let albumObj = new Album();
    albumObj.modifyAlbum(data);
    albumObj.updateAlbumInDb().then((val) => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "修改专辑成功", val));
        } else {
            res.send(Response.print(config.error_2, "修改专辑失败", val));
        }
    });
});

//修改专辑图片
router.post('/album/modify/icon', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let form = new multiparty.Form({
        uploadDir: config.album_icon_path,
        maxFilesSize: config.album_icon_size
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('parse error: ' + err);
            let output = Response.print(config.error_1, "参数解析错误", err);
            res.send(output);
        } else {
            if (!fields.id || !fields.id[0]) {
                res.send(Response.print(config.error_1, "参数album_id未传入", fields));
                return false;
            }
            let id = fields.id[0],
                album_icon = files.icon[0].originalFilename,
                exte = album_icon.split('.').pop().toLowerCase();
            if (exte) {
                if (exte != 'png' && exte != 'jpg' && exte != 'jpeg' && exte != 'gif' && exte != 'bmp') {
                    let output = Response.print(config.error_3, "专辑icon非图片", exte);
                    res.send(output);
                    return false;
                }
                let path = files.icon[0].path;
                let newName = uuid.v1() + '.' + exte;
                let dstPath = config.album_icon_path + newName;
                let virtualPath = config.album_icon_path_v + newName;
                //重命名为真实文件名
                fs.rename(path, dstPath, function(err) {
                    if (err) {
                        let output = Response.print(config.error_x, "图片重命名错误", err);
                        res.send(output);
                    } else {
                        let data = {
                            id: id,
                            album_icon: virtualPath
                        };
                        let albumObj = new Album();
                        albumObj.modifyAlbum(data).updateAlbumInDb().then((val) => {
                            if (val.affectedRows > 0) {
                                let output = Response.print(config.error_0, "专辑图片修改成功", val);
                                res.send(output);
                            } else {
                                let output = Response.print(config.error_2, "专辑图片修改失败", val);
                                res.send(output);
                            }
                        })
                    }
                });
            } else {
                let output = Response.print(config.error_3, "上传非图片文件", album_icon);
                res.send(output);
            }
        }
    });
});

//逻辑删除专辑
router.get('/album/delete/logic', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Album.deleteAlbumInDb(req.query.id).then(val => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "删除专辑成功", val));
        } else {
            res.send(Response.print(config.error_2, "删除专辑失败", val));
        }
    })
});

//创建歌曲
router.post('/song/create', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    //生成multiparty对象，并配置上传目标路径
    let form = new multiparty.Form({
        uploadDir: config.song_icon_path,
        maxFilesSize: config.song_icon_size
    });
    //上传完成后处理
    try {
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log('parse error: ' + err);
                let output = Response.print(config.error_1, "参数解析错误", err);
                res.send(output);
            } else {
                let songDetail = {
                        song_name: fields.song_name[0],
                        song_icon: files.icon[0].originalFilename,
                        song_path_middle: files.audio[0].originalFilename,
                        singer_name: fields.singer_name[0],
                        singer_id: fields.singer_id[0],
                        song_intro: fields.song_intro[0],
                        song_lyric: fields.song_lyric[0],
                        album_id: fields.album_id[0],
                        album_name: fields.album_name[0],
                        song_duration: fields.song_duration[0],
                        song_size_middle: files.audio[0].size,
                        upload_user_id: fields.upload_user_id[0],
                        upload_user_name: fields.upload_user_name[0],
                        upload_type: fields.upload_type[0],
                    },
                    exteIcon = songDetail.song_icon.split('.').pop().toLowerCase();
                exteAudio = songDetail.song_path_middle.split('.').pop().toLowerCase();
                if (exteIcon) {
                    if (exteIcon != 'png' && exteIcon != 'jpg' && exteIcon != 'jpeg' && exteIcon != 'gif' && exteIcon != 'bmp') {
                        let output = Response.print(config.error_3, "专辑icon非图片", exteIcon);
                        res.send(output);
                        return false;
                    }
                    if (exteAudio != 'mp3' && exteAudio != 'wav') {
                        let output = Response.print(config.error_3, "专辑文件非音频", exteAudio);
                        res.send(output);
                        return false;
                    }
                    if (!songDetail.song_name) {
                        let output = Response.print(config.error_1, "参数不完整");
                        res.send(output);
                        return false;
                    }
                    let pathIcon = files.icon[0].path;
                    let iconName = uuid.v1() + '.' + exteIcon;
                    let dstPathIcon = config.song_icon_path + iconName;
                    let virtualPathIcon = config.song_icon_path_v + iconName;
                    //重命名icon为真实文件名
                    fs.rename(pathIcon, dstPathIcon, function(err) {
                        if (err) {
                            let output = Response.print(config.error_x, "图片重命名错误", err);
                            res.send(output);
                            return;
                        }
                        songDetail.song_icon = virtualPathIcon;
                        let pathAudio = files.audio[0].path;
                        let audioName = uuid.v1() + '.' + exteAudio;
                        let dstPathAudio = config.song_audio_path + audioName;
                        let virtualPathAudio = config.song_audio_path_v + audioName;
                        //重命名audio为真实文件名
                        fs.rename(pathAudio, dstPathAudio, function(err) {
                            songDetail.song_path_middle = virtualPathAudio;
                            let songObj = new Song(songDetail.song_name, songDetail.song_icon, songDetail.song_path_middle,
                                songDetail.song_intro, songDetail.song_lyric, songDetail.album_id, songDetail.album_name,
                                songDetail.song_duration, songDetail.song_size_middle, songDetail.upload_user_id,
                                songDetail.upload_user_name, songDetail.upload_type);
                            let singerInfo = {
                                singer_name: songDetail.singer_name,
                                singer_id: songDetail.singer_id
                            };
                            songObj.modifySong(singerInfo).createSongInDb().then((val) => {
                                if (val.affectedRows > 0) {
                                    let output = Response.print(config.error_0, "歌曲新建成功", val);
                                    res.send(output);
                                } else {
                                    let output = Response.print(config.error_2, "歌曲新建失败", val);
                                    res.send(output);
                                }
                            })
                        });
                    });
                } else {
                    let output = Response.print(config.error_3, "上传非图片文件", songDetail.song_icon);
                    res.send(output);
                }
            }
        })
    } catch (e) {
        console.log('set err:', e);
        let output = Response.print(config.error_x, "", err);
        res.send(output);
    }
});

//获取歌曲列表
router.get('/song/list', function(req, res, next) {
    let data = req.query;
    if (!data.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    let type = data.type || 'client';
    let role = data.role || data.username;
    Song.getSongList(data.id, data.username, type, role, data.page, data.pageSize).then(val => {
        if (Object.prototype.toString.call(val.list) === '[object Array]') {
            res.send(Response.print(config.error_0, "获取歌曲列表成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取歌曲列表失败", val));
        }
    })
});

//获取歌曲信息
router.get('/song/show', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Song.getSongInfo(req.query.id).then(val => {
        if (val) {
            res.send(Response.print(config.error_0, "获取歌曲信息成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取歌曲信息失败", val));
        }
    })
});

//修改歌曲
router.get('/song/modify', function(req, res, next) {
    let data = req.query;
    if (!data.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    let songObj = new Song();
    songObj.modifySong(data).updateSongInDb().then((val) => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "修改歌曲成功", val));
        } else {
            res.send(Response.print(config.error_2, "修改歌曲失败", val));
        }
    });
});

//修改歌曲图片
router.post('/song/modify/icon', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let form = new multiparty.Form({
        uploadDir: config.song_icon_path,
        maxFilesSize: config.song_icon_size
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('parse error: ' + err);
            let output = Response.print(config.error_1, "参数解析错误", err);
            res.send(output);
        } else {
            if (!fields.id || !fields.id[0]) {
                res.send(Response.print(config.error_1, "参数id未传入", fields));
                return false;
            }
            let id = fields.id[0],
                song_icon = files.icon[0].originalFilename,
                exte = song_icon.split('.').pop().toLowerCase();
            if (exte) {
                if (exte != 'png' && exte != 'jpg' && exte != 'jpeg' && exte != 'gif' && exte != 'bmp') {
                    let output = Response.print(config.error_3, "歌曲icon非图片", exte);
                    res.send(output);
                    return false;
                }
                let path = files.icon[0].path;
                let newName = uuid.v1() + '.' + exte;
                let dstPath = config.song_icon_path + newName;
                let virtualPath = config.song_icon_path_v + newName;
                //重命名为真实文件名
                fs.rename(path, dstPath, function(err) {
                    if (err) {
                        let output = Response.print(config.error_x, "图片重命名错误", err);
                        res.send(output);
                    } else {
                        let data = {
                            id: id,
                            song_icon: virtualPath
                        };
                        let songObj = new Song();
                        songObj.modifySong(data).updateSongInDb().then((val) => {
                            if (val.affectedRows > 0) {
                                let output = Response.print(config.error_0, "歌曲图片修改成功", val);
                                res.send(output);
                            } else {
                                let output = Response.print(config.error_2, "歌曲图片修改失败", val);
                                res.send(output);
                            }
                        })
                    }
                });
            } else {
                let output = Response.print(config.error_3, "上传非图片文件", song_icon);
                res.send(output);
            }
        }
    });
});

//修改歌曲音频
router.post('/song/modify/audio', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let form = new multiparty.Form({
        uploadDir: config.song_audio_path,
        maxFilesSize: config.song_audio_size
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('parse error: ' + err);
            let output = Response.print(config.error_1, "参数解析错误", err);
            res.send(output);
        } else {
            if (!fields.id || !fields.id[0]) {
                res.send(Response.print(config.error_1, "参数id未传入", fields));
                return false;
            }
            let id = fields.id[0],
                song_audio = files.audio[0].originalFilename,
                exte = song_audio.split('.').pop().toLowerCase();
            if (exte) {
                if (exte != 'mp3' && exte != 'wav') {
                    let output = Response.print(config.error_3, "上传文件非音频", exte);
                    res.send(output);
                    return false;
                }
                let path = files.audio[0].path;
                let newName = uuid.v1() + '.' + exte;
                let dstPath = config.song_audio_path + newName;
                let virtualPath = config.song_audio_path_v + newName;
                //重命名为真实文件名
                fs.rename(path, dstPath, function(err) {
                    if (err) {
                        let output = Response.print(config.error_x, "音频重命名错误", err);
                        res.send(output);
                    } else {
                        let data = {
                            id: id,
                            song_path_middle: virtualPath,
                            song_size_middle: files.audio[0].size
                        };
                        //删除原音频
                        Song.getSongBasicInfo(id).then((val) => {
                            if (val.song_path_middle) {
                                fs.unlink(config.song_audio_path + val.song_path_middle.split('/')[2]);
                            }
                        });
                        // console.log(data);
                        let songObj = new Song();
                        songObj.modifySong(data).updateSongInDb().then((val) => {
                            if (val.affectedRows > 0) {
                                let output = Response.print(config.error_0, "歌曲音频修改成功", val);
                                res.send(output);
                            } else {
                                let output = Response.print(config.error_2, "歌曲音频修改失败", val);
                                res.send(output);
                            }
                        })
                    }
                });
            } else {
                let output = Response.print(config.error_3, "上传非音频文件", song_audio);
                res.send(output);
            }
        }
    });
});

//逻辑删除歌曲
router.get('/song/delete/logic', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Song.deleteSongInDb(req.query.id).then(val => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "删除歌曲成功", val));
        } else {
            res.send(Response.print(config.error_2, "删除歌曲失败", val));
        }
    })
});

//获取歌手列表
router.get('/singer/list', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let type = req.query.type || 'client';
    let role = req.query.role || req.query.username;
    Singer.getSingerList(req.query.username, type, role, req.query.page, req.query.pageSize).then(val => {
        if (Object.prototype.toString.call(val.list) === '[object Array]') {
            res.send(Response.print(config.error_0, "获取歌手列表成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取歌手列表失败", val));
        }
    })
});

//获取歌手名字列表
router.get('/singer/name/list', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    Singer.getSingerNameList().then(val => {
        if (Object.prototype.toString.call(val) === '[object Array]') {
            res.send(Response.print(config.error_0, "获取歌手列表成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取歌手列表失败", val));
        }
    })
});

//获取歌手信息
router.get('/singer/show', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Singer.getSingerInfo(req.query.id).then(val => {
        if (val) {
            res.send(Response.print(config.error_0, "获取歌手信息成功", val));
        } else {
            res.send(Response.print(config.error_2, "获取歌手信息失败", val));
        }
    })
});

//创建歌手
router.post('/singer/create', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    //生成multiparty对象，并配置上传目标路径
    let form = new multiparty.Form({
        uploadDir: config.singer_icon_path,
        maxFilesSize: config.singer_icon_size
    });
    //上传完成后处理
    try {
        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log('parse error: ' + err);
                let output = Response.print(config.error_1, "参数解析错误", err);
                res.send(output);
            } else {
                let singer_name = fields.singer_name[0],
                    singer_icon = files.file[0].originalFilename,
                    singer_intro = fields.singer_intro[0],
                    singer_sex = fields.singer_sex[0],
                    singer_birthday = fields.singer_birthday[0],
                    singer_uploader_name = fields.singer_uploader_name[0]
                    exte = singer_icon.split('.').pop().toLowerCase();
                if (exte) {
                    if (exte != 'png' && exte != 'jpg' && exte != 'jpeg' && exte != 'gif' && exte != 'bmp') {
                        let output = Response.print(config.error_3, "歌手icon非图片", exte);
                        res.send(output);
                        return false;
                    }
                    if (!singer_name) {
                        let output = Response.print(config.error_1, "参数不完整");
                        res.send(output);
                        return false;
                    }
                    let path = files.file[0].path;
                    let iconName = uuid.v1() + '.' + exte;
                    let dstPathIcon = config.singer_icon_path + iconName;
                    let virtualPathIcon = config.singer_icon_path_v + iconName;
                    //重命名为真实文件名
                    fs.rename(path, dstPathIcon, function(err) {
                        if (err) {
                            let output = Response.print(config.error_x, "图片重命名错误", err);
                            res.send(output);
                        } else {
                            singer_icon = virtualPathIcon;
                            let singerObj = new Singer(singer_name, singer_icon, singer_sex, singer_birthday,
                                singer_intro, singer_uploader_name);
                            singerObj.createSingerInDb().then((val) => {
                                if (val.affectedRows > 0) {
                                    let output = Response.print(config.error_0, "歌手新建成功", val);
                                    res.send(output);
                                } else {
                                    let output = Response.print(config.error_2, "歌手新建失败", val);
                                    res.send(output);
                                }
                            })
                        }
                    });
                } else {
                    let output = Response.print(config.error_3, "上传非图片文件", singer_icon);
                    res.send(output);
                }
            }
        })
    } catch (e) {
        console.log('set err:', e);
        let output = Response.print(config.error_x, "", err);
        res.send(output);
    }
});

//修改歌手信息
router.get('/singer/modify', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let data = req.query;
    if (!data.id) {
        res.send(Response.print(config.error_1, "参数id未传入", data));
        return false;
    }
    let singerObj = new Singer();
    singerObj.modifySinger(data);
    singerObj.updateSingerInDb().then((val) => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "修改歌手成功", val));
        } else {
            res.send(Response.print(config.error_2, "修改歌手失败", val));
        }
    });
});

//修改歌手图片
router.post('/singer/modify/icon', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    let form = new multiparty.Form({
        uploadDir: config.singer_icon_path,
        maxFilesSize: config.singer_icon_size
    });
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('parse error: ' + err);
            let output = Response.print(config.error_1, "参数解析错误", err);
            res.send(output);
        } else {
            if (!fields.id || !fields.id[0]) {
                res.send(Response.print(config.error_1, "参数id未传入", fields));
                return false;
            }
            let id = fields.id[0],
                singer_icon = files.icon[0].originalFilename,
                exte = singer_icon.split('.').pop().toLowerCase();
            if (exte) {
                if (exte != 'png' && exte != 'jpg' && exte != 'jpeg' && exte != 'gif' && exte != 'bmp') {
                    let output = Response.print(config.error_3, "歌手icon非图片", exte);
                    res.send(output);
                    return false;
                }
                let path = files.icon[0].path;
                let newName = uuid.v1() + '.' + exte;
                let dstPath = config.singer_icon_path + newName;
                let virtualPath = config.singer_icon_path_v + newName;
                //重命名为真实文件名
                fs.rename(path, dstPath, function(err) {
                    if (err) {
                        let output = Response.print(config.error_x, "图片重命名错误", err);
                        res.send(output);
                    } else {
                        let data = {
                            id: id,
                            singer_icon: virtualPath
                        };
                        let singerObj = new Singer();
                        singerObj.modifySinger(data).updateSingerInDb().then((val) => {
                            if (val.affectedRows > 0) {
                                let output = Response.print(config.error_0, "歌手图片修改成功", val);
                                res.send(output);
                            } else {
                                let output = Response.print(config.error_2, "歌手图片修改失败", val);
                                res.send(output);
                            }
                        })
                    }
                });
            } else {
                let output = Response.print(config.error_3, "上传非图片文件", singer_icon);
                res.send(output);
            }
        }
    });
});

//逻辑删除歌手
router.get('/singer/delete/logic', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.id) {
        res.send(Response.print(config.error_1, "id未传入", req.query));
        return;
    }
    Singer.deleteSingerInDb(req.query.id).then(val => {
        if (val.affectedRows > 0) {
            res.send(Response.print(config.error_0, "删除歌手成功", val));
        } else {
            res.send(Response.print(config.error_2, "删除歌手失败", val));
        }
    })
});

//搜索
router.get('/search', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", config.allow_origin);
    if (!req.query.username) {
        res.send(Response.print(config.error_1, "username未传入", req.query));
        return;
    }
    let content = req.query.content.trim() || '',
        target = req.query.target || 'song',
        username = req.query.username,
        type = req.query.type || 'client',
        role = req.query.role || username,
        page = req.query.page,
        pageSize = req.query.pageSize;
    switch (target) {
        case 'song':
            Song.searchSong(content, username, type, role, page, pageSize).then(val => {
                res.send(Response.print(config.error_0, "搜索歌曲成功", val));
            });
            break;
        case 'album':
            Album.searchAlbum(content, username, type, role, page, pageSize).then(val => {
                res.send(Response.print(config.error_0, "搜索专辑成功", val));
            });
            break;
        case 'singer':
            Singer.searchSinger(content, username, type, role, page, pageSize).then(val => {
                res.send(Response.print(config.error_0, "搜索专辑成功", val));
            });
            break;
        default:
            break;
    }
})

module.exports = router;
