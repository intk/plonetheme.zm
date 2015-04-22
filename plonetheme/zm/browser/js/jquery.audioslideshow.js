
(function( $ ) {
  
	$.fn.audioSlideshow = function( options ) {
      	var $audio_control = $($('.audio-control-interface')[0]);

		var settings = {
			jPlayerPath: "/lib/swf",
			suppliedFileType: "mp3",
			playSelector: ".audio-play",
			pauseSelector: ".audio-pause",
			currentTimeSelector: ".play-time",
			durationSelector: ".total-time",
			playheadSelector: ".playhead",
			timelineSelector: ".timeline"
		};
	  
		if(options){
		  jQuery.extend(settings,options);
		}
		
		// Begin to iterate over the jQuery collection that the method was called on
		return this.each(function () {
		  
			// Cache `this`
			var $that = $(this),
				$slides = $(".slick-slide").not(".slick-cloned").find("img"),
				
				$currentTime = $audio_control.find(settings.currentTimeSelector),
				$duration = $audio_control.find(settings.durationSelector),
				$playhead = $audio_control.find(settings.playheadSelector),
				$timeline = $audio_control.find(settings.timelineSelector),
				$playButton = $audio_control.find(settings.playSelector),
				$pauseButton = $audio_control.find(settings.pauseSelector),

				slidesCount = $slides.length,
				slideTimes = new Array(),
				audioDurationinSeconds = parseInt($that.attr('data-audio-duration')),
				totalDuration = parseInt($that.attr('data-audio-duration')),
				isPlaying = false,
				currentSlide = -1;

			$pauseButton.hide();
				
			// Setup slides			
			$slides.each(function(index,el){
				var $el = $(el);
				//$el.hide();

				var second = parseInt($el.attr('data-slide-time')),
					thumbnail = $el.attr('data-thumbnail');
				
				if(index > 0) {
					slideTimes.push(second);
				
					var img = '<span><img src="' + thumbnail + '"></span>',
						$marker = $('<a href="javascript:;" class="marker" data-time="' + second + '">' + img + '</a>'),
						l = (second / audioDurationinSeconds) * $timeline.width();
		  
					$marker.css('left',l).click(function(e){
						$jPlayerObj.jPlayer("play", parseInt($(this).attr('data-time')) + .5);
					});

					$timeline.append($marker);
				}
			});

			var $jPlayerObj = $('<div></div>');
			$that.append($jPlayerObj);
		
			$jPlayerObj.jPlayer({
				ready: function () {
					$.jPlayer.timeFormat.padMin = false;
					$(this).jPlayer("setMedia", {
						mp3: $that.attr('data-audio')
					});
				},
				swfPath: settings.jPlayerPath,
				supplied: settings.suppliedFileType,
				preload: 'auto',
				cssSelectorAncestor: ""
			});
				
			$jPlayerObj.bind($.jPlayer.event.timeupdate, function(event) { // Add a listener to report the time play began
				var curTime = event.jPlayer.status.currentTime;
				audioDurationinSeconds = event.jPlayer.status.duration;
				var p = (curTime / audioDurationinSeconds) * 100 + "%";

				$currentTime.text($.jPlayer.convertTime(curTime));
				$duration.text($.jPlayer.convertTime(audioDurationinSeconds));

				$playhead.width(p);

				if(slidesCount){
					var nxtSlide = 0;
					for(var i = 0; i < slidesCount; i++){
						if(slideTimes[i] < curTime){
							nxtSlide = i + 1;
							setAudioSlide(nxtSlide);
						}
					}


					
				}
			});
				
			$jPlayerObj.bind($.jPlayer.event.play, function(event) { // Add a listener to report the time play began
				isPlaying = true;
				$playButton.hide();
				$pauseButton.show();
			});
			
			$jPlayerObj.bind($.jPlayer.event.pause, function(event) { // Add a listener to report the time pause began
				isPlaying = false;
				$pauseButton.hide();
				$playButton.show();
			});
			
			$playButton.click(function(event){
				$jPlayerObj.jPlayer("play");
			});
				
			$pauseButton.click(function(event){
				$jPlayerObj.jPlayer("pause");
			});
			
			$timeline.click(function(event){
				var l = event.pageX -  $(this).offset().left;
				var t = (l / $timeline.width()) * audioDurationinSeconds;

				$jPlayerObj.jPlayer("play", t);
			});

			setAudioSlide(0);

			settings.slickSlideshow.$obj.slickSetOption('onAfterChange', afterChange, true);
			
			function setAudioSlide(n){
				if (n != currentSlide) {
					settings.slickSlideshow.$obj.slickGoTo(n);
					currentSlide = n;
				}
			}

			function afterChange(event) {
				var n = event.currentSlide;
				settings.slickSlideshow.addDescription(n);
				if (n != currentSlide) {
					currentSlide = n;
					if (currentSlide > 0) {
						slide_duration = slideTimes[currentSlide-1];
						p = (slide_duration / totalDuration) * 100 + "%";
						$currentTime.text($.jPlayer.convertTime(slide_duration));
						$duration.text($.jPlayer.convertTime(totalDuration));
						
						$jPlayerObj.jPlayer("play", slide_duration);
						$playhead.width(p);
					} else {
						slide_duration = 0;
						$currentTime.text($.jPlayer.convertTime(slide_duration));
						$duration.text($.jPlayer.convertTime(totalDuration));

						$jPlayerObj.jPlayer("play", slide_duration);
						$playhead.width(slide_duration);
					}
				}
			}
				
		});
	};
}(jQuery));

