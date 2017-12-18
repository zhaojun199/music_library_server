var configModule = {

	//mysql config
	host: 'localhost',
	user: 'root',
    password: '',
    port: '3306',
    database: 'music_admin',

    table_admin: 'admin',   //账户信息表
    table_album: 'album_info',	//专辑信息表
    table_singer: 'singer_info',	//歌手信息表
    table_song: 'song_info',	//歌曲信息表
    table_type: 'type_info',	//类型信息表

    //page size
    pageSize: 10,

    //save path
    static_path: 'C:/Users/zz/Desktop/musiclibrary/resource/public/music',
    album_icon_path: 'C:/Users/zz/Desktop/musiclibrary/resource/public/music/image/album/',
    song_icon_path: 'C:/Users/zz/Desktop/musiclibrary/resource/public/music/image/song/',
    song_audio_path: 'C:/Users/zz/Desktop/musiclibrary/resource/public/music/audio/',
    singer_icon_path: 'C:/Users/zz/Desktop/musiclibrary/resource/public/music/image/singer/',
    //virtual path
    album_icon_path_v: 'public/image/album/',
    song_icon_path_v: 'public/image/song/',
    song_audio_path_v: 'public/audio/',
    singer_icon_path_v: 'public/image/singer/',

    //file size
    album_icon_size: '2 * 1024 * 1024',
    song_icon_size: '2 * 1024 * 1024',
    singer_icon_size: '2 * 1024 * 1024',

    //error code
    error_x: -1,	//未知错误码
    error_0: 0,	//正确码
    error_1: 1,	//参数错误码
    error_2: 2,	//数据库错误码
    error_3: 3,	//限制错误码
    error_4: 4,	//重复值
    error_5: 5,	//

    //allow post origin
    // allow_origin: "http://192.168.1.124:8080"
    allow_origin: "*"
};

module.exports = configModule;

