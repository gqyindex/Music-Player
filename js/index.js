$(function () {

    var touchstart = 'touchstart';
    var touchmove = 'touchmove';
    var touchend = 'touchend';
    /*正则验证,判断当前是在pc还是m端操作*/
    var isMobile = /Mobile/i.test(navigator.userAgent);
    var id = 0;
    var time_lyric = null;

    /*在PC端则改为mouse事件*/
    if (!isMobile) {
        touchstart = 'mousedown';
        touchmove = 'mousemove';
        touchend = 'mouseup';
        $('.music_lyric').css('bottom','0px')
    };

    function int() {
        musicList();
        /*渲染音乐列表*/

        roll();
        /*滚动条滑动*/

        bind();
        /*控制时间，歌曲播放*/
    }

    /*function roll() {
        var myScroll2 = new IScroll('.content', {click: true});


    }*/

    function musicList() {
        $.ajax({
            url: 'http://localhost/Music/php/musicList.php',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                $.each(data, function (i, item) {
                    var $li = '<li musicId = ' + (item.id) + '> <p> ' + (item.musicName) + ' </p> <p> ' + (item.name) + ' </p> </li>';
                    $('#List').append($li);
                })
            }
        });
        /*ajax*/
    };

    function roll() {

        $('.content').on(touchstart,function(ev){

            if($('.content').height> $('ul').height){return false;}
            var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
            var This = this;
            downY = touch.pageY;
            prevY = touch.pageY;
            downT = $(this).position().top;
            onoff1 = true;
            onoff2 = true;
            onoff3 = true;
            $(document).on(touchmove+'.move',function(ev){
                onoff3 = false;
                var touch = ev.originalEvent.changedTouches ? ev.originalEvent.changedTouches[0] : ev;
                var iTop = $(This).position().top;

                speed = touch.pageY - prevY;
                prevY = touch.pageY;

                if(iTop >= 0){   //头
                    if(onoff1){
                        onoff1 = false;
                        downY = touch.pageY;
                    }
                    $(This).css('transform','translate3d(0,'+(touch.pageY - downY)/3+'px,0)');
                }
                else if(iTop <= $('.content').height - $('ul').height){  //尾
                    if(onoff2){
                        onoff2 = false;
                        downY = touch.pageY;
                    }
                    $(This).css('transform','translate3d(0,'+((touch.pageY - downY)/3 + ($('.content').height - $('ul').height))+'px,0)');
                }
                else{
                    $(This).css('transform','translate3d(0,'+(touch.pageY - downY + downT)+'px,0)');
                }

            });
            $(document).on(touchend+'.move',function(){
                $(this).off('.move');

                //console.log(speed);
                if(!onoff3){
                    timer = setInterval(function(){
                        var iTop = $(This).position().top;
                        if(Math.abs(speed) <= 1 || iTop > 50 || iTop < $('.content').height - $('ul').height - 50){
                            clearInterval(timer);
                            if(iTop >= 0){
                                $(This).css('transition','.2s');
                                $(This).css('transform','translate3d(0,0,0)');
                            }
                            else if(iTop <= $('.content').height - $('ul').height){
                                $(This).css('transition','.2s');
                                $(This).css('transform','translate3d(0,'+($('.content').height - $('ul').height)+'px,0)');
                            }
                        }
                        else{
                            speed *= 0.9;
                            $(This).css('transform','translate3d(0,'+(iTop + speed)+'px,0)');
                        }

                    },13);
                }
            });
            return false;
        });
        $('ul').on('transitonend webkitTransitionEnd',function(){
            $(this).css('transition','');
        });
    };

    function bind() {


        $('#music_detail').css('top','1000px');

        /*加上active样式，区分播放和未播放状态*/

        $('#List').delegate('li',touchend,function () {


            $(this).addClass('active').siblings().removeClass('active');


            /*把得到的id传送到后端找对应数据*/
            id = $(this).attr('musicId');

                $.ajax({
                    url: 'http://localhost/Music/php/musicAudio.php',
                    type: 'GET',
                    dataType: 'json',
                    async: true,
                    data: {id, id},
                    success: function (data) {

                        $('#singhead').attr('src','img/'+data.img).addClass('rotate');

                        $('#musicAudio').find('p:first-child').html(data.musicName);

                        $('#musicAudio').find('p:last-child').html(data.name);

                        $('#player').attr('src','img/'+data.audio);

                        $('#list_audioPlay').attr('src','img/list_audioPause.png');

                        $('#audio').css('background','url("img/details_pause.png")');

                        $('#player')[0].play();//点击音乐默认播放

                        musicplay();/*点击暂停音乐，再点击播放*/

                        $('#music_detail').find('h3').html(data.musicName);

                        $('#music_detail').find('p').html(data.name);

                        audioTime(); /*音乐默认播放设置，对音乐进度条拖拽，音乐按进度播放*/

                        musicloop(data.lyric)/*当前歌曲播放完后重复播放本首歌曲*/

                        musicnext(id);/*下一首歌*/

                        musicpre(id);/*上一首歌曲*/

                        lyric(data.lyric);

                    }/*success*/
                })/*ajax数据渲染结束*/;
        });

       /* $('#login').on(touchstart, function () {
            /!*跳转到登录页面*!/
            window.location = 'http://localhost/register/register.html';
        });*/

        /*音乐详情页的展开与隐藏*/
        $("#slide_up").on(touchstart, function () {
            $('#music_detail').css('transition','.5s');
            $('#music_detail').css('transform','translate3d(0,0,0)');
            $('#music_detail').css('top', '0');
        });

        $('#slide_down').on(touchstart, function () {
            var hideHeight = $('#music_detail').height();
            $('#music_detail').css('top', +hideHeight + 'px');
        });

        function musicplay() {
            $('#list_audioPlay').add('#audio').on(touchstart, function () {


                if ($('#player')[0].paused) {

                    $('#player')[0].play();

                    $('#list_audioPlay').attr('src', 'img/list_audioPause.png');

                    $('#audio').css('background', 'url("img/details_pause.png")');


                } else {
                    $('#player')[0].pause();

                    $('#list_audioPlay').attr('src', 'img/list_audioPlay.png');

                    $('#audio').css('background', 'url("img/details_play.png")');
                }
            });
        };

        function audioTime() {
            var distance = 0;
            var sum = 0;
            var timer = null;
             timer = setInterval(function () {
                  str = $('#player')[0].currentTime;
                  str1 = $('#player')[0].duration;

                //默认自动播放情况下的进度条事件
                persent = Math.round(str / str1 * 10000) / 100.00 + "%";
                num = parseFloat(persent);
                currentWidth = $(window).width() * 0.8 * 0.6 * num / 100;

                alltime = formatTime(str1);
                nowtime = formatTime(str);
                $('#now-time').html(nowtime);
                $('#end-time').html(alltime);
                $('#progress-cover').css('width', currentWidth);
                $('#progress-point').css('left', currentWidth);
            }, 1000);//自动播放程序块

            $('#progress-point').on('touchstart',function (e) {
                startX = e.originalEvent.changedTouches[0].clientX ;
               // clearInterval(timer);

            });

            $('#progress-point').on('touchend',function (e) {
                endX = e.originalEvent.changedTouches[0].clientX ;
                distance = endX- startX;
                sum = sum + distance;
                playing();

            });


        //PC端的拖动事件
         $('.move').on('mousedown',function (event) {
                           startX = event.pageX ;

                       });
         $('.move').on('mouseup',function (event) {
                           endX = event.pageX ;
                           distance = endX- startX;
                           sum = sum + distance;
                           playing();
                       });
        /*audioTime*/
            function playing(){
                new_present = sum / $(window).width() * 0.8 * 0.6;
                str = str1 * new_present;
                $('#player')[0].currentTime = str;
                new_present = Math.round(str / str1 * 10000) / 100.00 + "%";
                num = parseFloat(new_present);
                changeWidth = $(window).width() * 0.8 * 0.6 * num / 100;
                alltime = formatTime(str1);
                nowtime = formatTime(str);
                $('#now-time').html(nowtime);
                $('#end-time').html(alltime);
                $('#progress-cover').css('width', changeWidth);
                $('#progress-point').css('left',changeWidth );
            }


        };

        function formatTime(num) {   //格式日期
            var iM = Math.floor(num / 60);
            var iS = Math.floor(num % 60);
            return toZero(iM) + ':' + toZero(iS);
        };

        function toZero(num) {    //补零操作
            if (num < 10) {
                return '0' + num;
            }
            else {
                return '' + num;
            }
        };

        function musicloop(lyric_loop) {

            $('#player').on('ended',function () {
                $('#player')[0].play();
                audioTime();
                lyric(lyric_loop);/*自动循环从开始重复显示歌词*/
            });

        };

        function musicnext(id) {

            $('#audio-next').on(touchstart,function () {

                id = Number(id) + 1;
                if (id >=11){
                    id = 1;
                }
                $('#List li').eq(id - 1 ).addClass('active').siblings().removeClass('active');

                clearInterval(time_lyric);

                $.ajax({
                    url: 'http://localhost/Music/php/musicAudio.php',
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    data: {id, id},
                    success: function (data) {

                        $('#singhead').attr('src','img/'+data.img).addClass('rotate');

                        $('#musicAudio').find('p:first-child').html(data.musicName);

                        $('#musicAudio').find('p:last-child').html(data.name);

                        $('#player').attr('src','img/'+data.audio);

                        $('#list_audioPlay').attr('src','img/list_audioPause.png');

                        $('#audio').css('background','url("img/details_pause.png")');

                        $('#player')[0].play();//点击音乐默认播放

                        musicplay();/*点击暂停音乐，再点击播放*/

                        $('#music_detail').find('h3').html(data.musicName);

                        $('#music_detail').find('p').html(data.name);

                        audioTime(); /*音乐默认播放设置，对音乐进度条拖拽，音乐按进度播放*/

                        musicloop()/*当前歌曲播放完后重复播放本首歌曲*/

                        lyric(data.lyric);/*显示歌词*/
                    }/*success*/
                })
            })

        };

        function musicpre(id) {
            $('#audio-prev').on(touchstart,function () {
                    id = Number(id) - 1;
                    if (id <=0){
                        id = 10;
                    }
                    $('#List li').eq(id - 1).addClass('active').siblings().removeClass('active');

                   clearInterval(time_lyric);

                $.ajax({
                    url: 'http://localhost/Music/php/musicAudio.php',
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    data: {id, id},
                    success: function (data) {

                        $('#singhead').attr('src','img/'+data.img).addClass('rotate');

                        $('#musicAudio').find('p:first-child').html(data.musicName);

                        $('#musicAudio').find('p:last-child').html(data.name);

                        $('#player').attr('src','img/'+data.audio);

                        $('#list_audioPlay').attr('src','img/list_audioPause.png');

                        $('#audio').css('background','url("img/details_pause.png")');

                        $('#player')[0].play();//点击音乐默认播放

                        musicplay();/*点击暂停音乐，再点击播放*/

                        $('#music_detail').find('h3').html(data.musicName);

                        $('#music_detail').find('p').html(data.name);

                        audioTime(); /*音乐默认播放设置，对音乐进度条拖拽，音乐按进度播放*/

                        musicloop()/*当前歌曲播放完后重复播放本首歌曲*/

                        lyric(data.lyric)/*显示歌词*/


                    }/*success*/
                });

            })
        };

        function lyric(lyric) {

            $('.music_lyric').css('top','0px');

            $('#lyric').empty();

            var reg = /\[[^[]+/g;
            arr = lyric.match(reg);//将lyric分割成【00：00.00】天涯的尽头是风沙

            for (var i=0;i < arr.length;i++){
                arr[i] = [FormateTime(arr[i].substring(0,10)) , arr[i].substring(10).trim()];
            } ;//将【00：00.00】和'天涯的尽头是风沙'分割开，渲染
            for(var j=0;j<arr.length;j++){
                $('#lyric').append('<li>'+arr[j][1]+'</li>');
            };

            $li = $('#lyric').find('li');
            $li.first().attr('class','active');

            time_lyric = setInterval('lyric_show(arr)',1000);
           /* setInterval(function () {
                for(var k=0;k<arr.length;k++){
                    if( k != arr.length-1 && $('#player')[0].currentTime > arr[k][0] && $('#player')[0].currentTime < arr[k+1][0] ){
                        $li.eq(k).attr('class','active').siblings().attr('class','');
                        console.log(k);
                        console.log($('#player')[0].currentTime);
                        if (k > 4 && k < arr.length -4){
                            $('.music_lyric').css('top',- $('#lyric li').height()*(k-3)+'px');
                        };
                    }else if (k == arr.length - 1 && $('#player')[0].currentTime > arr[k][0]) {
                        $li.eq(k).attr('class','active').siblings().attr('class','');
                    };
                };
            },1000)*/
        };

         lyric_show = function(arr) {

             for(var k=0;k<arr.length;k++){
                if( k != arr.length-1 && $('#player')[0].currentTime > arr[k][0] && $('#player')[0].currentTime < arr[k+1][0] ){
                    $li.eq(k).attr('class','active').siblings().attr('class','');
                    if (k > 4 && k < arr.length -4){
                        $('.music_lyric').css('top',- $('#lyric li').height()*(k-3)+'px');
                    };
                }else if (k == arr.length - 1 && $('#player')[0].currentTime > arr[k][0]) {
                    $li.eq(k).attr('class','active').siblings().attr('class','');
                };
            };
        };/*lyric_show*/


        function FormateTime(num) {
            num = num.substring(1,num.length-1);
            var arr = num.split(':');
            return (parseFloat(arr[0]*60) + parseFloat(arr[1])).toFixed(2);
        };//将时间转化为number，对比前后时间，显示对应歌词


    };
    /*bind*/

    int();






});

