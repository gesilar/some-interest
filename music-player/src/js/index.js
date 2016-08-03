(function (window, $) {
	var MusicPlayer = function ($el) {
		ctx.$el=$el;
		this.init();
	}

	var ctx = {
		$el:null,
		$playList: null,
		$diskCovers: null,
		$needle: null,
		$backImg: null,
		$processBar: null,
		$currentTime: null,
		$totalTime: null,
		$loop: null,
		$prevBtn: null,
		$nextBtn: null,
		$playBtn: null,
		$playListBtn: null,
		$title: null,
		$remark: null
	};
	var playList,
		covers=[],
		currentIndex = 1,
		totalLength,
		cacheBackImgLength,
		singleLoop = false,
		isPlayListHidden = true;


	MusicPlayer.prototype = {
		init: function () {
			var self = this;
			$.ajax({
				url: "http://localhost:3500/getMusicInfo.do",
				type: 'get',
				success: function (response) {
					playList=JSON.parse(response).result.tracks;
					self.initData(playList);
					self.initState();
					self.bindEvents();
					self.start();
				},
				error: function () {

				}
			})
		},
		initData: function (playList) {
			ctx = $.extend({
				$playList: $('.play-list ul',ctx.$el),
				$diskCovers: $('.disk',ctx.$el),
				$needle: $('.disk-switcher',ctx.$el),
				$backImg: $('.bg',ctx.$el),
				$processBar: $('.current-progress',ctx.$el),
				$timeBtn: $('.time-btn',ctx.$el),
				$currentTime: $('.my-player-progress .fl',ctx.$el),
				$totalTime: $('.my-player-progress .fr',ctx.$el),
				$loop: $('.loop-btn',ctx.$el),
				$prevBtn: $('.btn-pre',ctx.$el),
				$nextBtn: $('.btn-next',ctx.$el),
				$playBtn: $('.btn-middle',ctx.$el),
				$playListBtn: $('.list-btn',ctx.$el),
				$title: $('.music-name',ctx.$el),
				$remark: $('.music-remark',ctx.$el),
				$audio: $('.player',ctx.$el)[0],

			})

			playList = playList;
			totalLength = playList.length;
			currentDisk = playList[0];
		},
		getPlayList:function () {
			return playList;
		},
		getCurrentDisk:function () {
			return currentDisk;
		},
		initState: function () {
			var img,i=0,j=3;
			for(;i<j;i++){
				img=new Image();
				img.src=playList[i].album.blurPicUrl;
				covers[i]=img.src;
			}
			cacheBackImgLength=3
			var url='url("'+covers[0]+'")';
			ctx.$backImg.css('background-image',url);
			ctx.$diskCovers.css('background-image',url);
			ctx.$title.text(currentDisk.name);
			ctx.$remark.text(currentDisk.artists[0].name);
			ctx.$currentTime.text("00:00");
			ctx.$totalTime.text("00:00");
			ctx.$processBar.css("width", '0%');

			var playListHtml=$("<ul>");
			playListHtml.addClass("list-group");
			$(playList).each(function (index,item) {
				var $li = $("<li>");
				$li.addClass("list-group-item");
				$li.attr("index",index);
				$li.append(item.name);
				playListHtml.append($li);
			})
			ctx.$playList.html(playListHtml.html());

			ctx.$audio.src = currentDisk.mp3Url;
		},

		switchMusic: function () {
			clearInterval(this.interval);

			if(currentIndex>=cacheBackImgLength-1&&!covers[cacheBackImgLength-1]){
				var surl=playList[cacheBackImgLength].album.blurPicUrl;
				var a=new Image();
				a.src=surl;
				covers[cacheBackImgLength]=surl;
				cacheBackImgLength++;
			}

			if(!covers[currentIndex-1]){
				covers[currentIndex-1]=playList[currentIndex-1].album.blurPicUrl;
			}
			var url='url("'+covers[currentIndex-1]+'")';
			ctx.$backImg.css('background-image',url);
			ctx.$diskCovers.css('background-image',url);
			ctx.$title.text(currentDisk.name);
			ctx.$remark.text(currentDisk.artists[0].name);
			ctx.$currentTime.text("00:00");
			ctx.$totalTime.text("00:00");
			ctx.$processBar.css("width", '0%');
			ctx.$audio.src = currentDisk.mp3Url;
			this.start();
		},


		_transTime:function (num) {
			var minute=parseInt(num/60)
			var second=parseInt(num%60);
			minute=minute>=10?minute+"":"0"+minute;
			second=second>=10?second+"":"0"+second;
			return minute+":"+second;
		},
		start:function () {
			var self=this;
			ctx.$audio.src=currentDisk.mp3Url;
			ctx.$audio.oncanplay=function () {
				ctx.$needle.addClass('disk-switcher-play');
				ctx.$diskCovers.addClass('disk-play');
				ctx.$playBtn.addClass('btn-middle-played');
				ctx.$audio.play();
				var duration=ctx.$audio.duration;
				ctx.$totalTime.text(self._transTime(duration));
				self.interval=setInterval(function () {
					var ct=ctx.$audio.currentTime;
					ctx.$processBar.css('width',(ct*100/duration)+"%");
					ctx.$currentTime.text(self._transTime(ct));
				},500)
			}


		},
		musicPlay: function () {
			ctx.$needle.addClass('disk-switcher-play');
			ctx.$diskCovers.addClass('disk-play');
			ctx.$playBtn.addClass('btn-middle-played');
			ctx.$audio.play();
		},
		musicPause: function () {
			ctx.$needle.removeClass('disk-switcher-play');
			ctx.$diskCovers.removeClass('disk-play');
			ctx.$playBtn.removeClass('btn-middle-played');
			ctx.$audio.pause();
		},
		bindEvents: function () {
			var self=this;
			ctx.$playBtn.on('click', function (e) {
				var tar = $(e.currentTarget);
				if (ctx.$audio.paused) {//如果是暂停状态
					self.musicPlay();
				} else {
					self.musicPause();
				}
			});

			ctx.$prevBtn.on('click', function () {
				if (currentIndex == 1) {
					currentDisk = playList[totalLength - 1];
					currentIndex = totalLength;
				} else {
					currentDisk = playList[currentIndex - 1];
					currentIndex -= 1;
				}
				self.switchMusic();
			});

			ctx.$nextBtn.on('click', function () {
				if (currentIndex == totalLength) {
					currentDisk = playList[0];
					currentIndex = 1;
				} else {
					currentDisk = playList[currentIndex + 1];
					currentIndex += 1;
				}
				self.switchMusic();
			});

			ctx.$playListBtn.on('click', function () {
				if (isPlayListHidden) {
					isPlayListHidden=false;
					ctx.$playList.addClass("play-list-show");
				} else {
					isPlayListHidden=true;
					ctx.$playList.removeClass("play-list-show");
				}
			})
			ctx.$playList.on('click',function (e) {
				var tar=$(e.target);
				var index=tar.attr("index");
				currentIndex=index;
				currentDisk=playList[index]
				self.switchMusic();
			})

		}
	}

	$.fn.musicPlayer = function (options) {
		var $this=$(this);
		var musicPlayer;
		musicPlayer=$this.data('musicPlayer');
		if(!musicPlayer){
			musicPlayer=new MusicPlayer($this);
		}
		if(typeof options=='string'){
			options.apply(musicPlayer);
		}
	}
})(window, jQuery)