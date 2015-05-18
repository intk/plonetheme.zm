/* ------------------------------------------------------------------------------
    S L I D E S H O W - E N H A N C E M E N T S
--------------------------------------------------------------------------------- */

// Load YouTube Frame API
/*(function(){ //Closure, to not leak to the scope
  var s = document.createElement("script");
  s.src = "http://www.youtube.com/iframe_api"; 
  var before = document.getElementsByTagName("script")[0];
  before.parentNode.insertBefore(s, before);
})();*/

// Pinterest
/*(function(){ //Closure, to not leak to the scope
  var s = document.createElement("script");
  s.src = "//assets.pinterest.com/js/pinit.js"; 
  var before = document.getElementsByTagName("script")[0];
  before.parentNode.insertBefore(s, before);
})();*/

// Twitter
/*!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
*/

function isElementInViewport (el) {
    //special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        Math.abs(rect.top) <= $(el).height()
    );
};


/* Slideshow specific */

slickSlideshow.players = {};
slickSlideshow.playing = false;
slickSlideshow.youtube_ready = false;
slickSlideshow.initiated_youtube = false;

slickSlideshow.slideMouseMove = function() {
  if (slickSlideshow.$obj.getSlick() != undefined) {

    if ($("#slickslideshow").hasClass("fullscreen")) {
      $("#portal-header-wrapper").fadeIn();

      if (slickSlideshow.$obj.slickCurrentSlide() == 0) {
        $("body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeIn();
        
        if (slickSlideshow.playing != true) {
          $(".video-play-btn").css("opacity", 0.75);
        }
        if ($(".slideshowWrapper").hasClass("moved")) {
          $(".slideshowWrapper").removeClass("moved");
        }
      }

      if (slickSlideshow.playing != true) {
        $(".wrap-prev, .wrap-next").css("opacity", 1);
      }

      if (slickSlideshow.moved) {
        if (slickSlideshow.playing != true) {
          $("#slideshow-controls").fadeIn();
        }
      } else {
        if (slickSlideshow.$obj.slickCurrentSlide() == 0) {
          $("body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeIn();
          if ($(".slideshowWrapper").hasClass("moved")) {
            $(".slideshowWrapper").removeClass("moved");
          }
        }
      }
    }
  }
};

slickSlideshow.onPlayerStateChange = function(iframeID) {
	return function(event) {
		if (event.data == 1) {
			$("#slideshow-controls").fadeOut();
			$(".wrap-prev, .wrap-next").css("opacity", 0);
			
			slickSlideshow.playing = true;
			
			setTimeout(function() {
				$(".slick-active.video-slide img.overlay-image").hide();
				$(".video-play-btn").css("opacity", 0);
				$(".video-play-btn").hide();
				$(".slick-active.video-slide iframe").show();
			}, 400);

		} else if (event.data == 2) {
			$("#slideshow-controls").fadeIn();
			$(".wrap-prev, .wrap-next").css("opacity", 1);
			$("#portal-header-wrapper").fadeIn();
			slickSlideshow.playing = false;
		}

		/* Video ended 
		 * Got to next slide */
		else if (event.data == 0) {
			slickSlideshow.$obj.slickNext();
		}
	}
};

slickSlideshow.createYTEvent = function(iframeID, first_slide) {
	return function(event) {
		var player = slickSlideshow.players[iframeID];
		if (first_slide.hasClass('video-slide')) {
			var slide_iframeID = $(first_slide.find('iframe')[0]).attr('id');
			if (slide_iframeID == iframeID) {
				slickSlideshow.startFirstVideo(first_slide);
			}
		}
	}
};

slickSlideshow.pauseCurrentSlide = function() {
	var curr = slickSlideshow.$obj.slickCurrentSlide();
	var $slide = $(slickSlideshow.$obj.getSlick().$slides[curr]);
	if ($slide.hasClass("video-slide")) {
		var frameID = $($slide.find('iframe')[0]).attr("id");
		// Pause video
		var slide_player = slickSlideshow.players[frameID];
		if (slide_player != undefined) {
			slide_player.pauseVideo();
		}
	}
};

slickSlideshow.changeWrapperOpacity = function() {
	$(".slideshowWrapper:before").css('opacity', 0);
};

slickSlideshow.YT_ready = function() {
	if (slickSlideshow.$obj.getSlick() != undefined) { 
		var $first_slide = $(slickSlideshow.$obj.getSlick().$slides[slickSlideshow.initialSlide]);

		$(".video-slide:not(.slick-cloned) iframe").each(function() {
			var iframeID = this.id;
			slickSlideshow.players[iframeID] = new YT.Player(iframeID, {
				events: {
					"onReady": slickSlideshow.createYTEvent(iframeID, $first_slide),
					"onStateChange": slickSlideshow.onPlayerStateChange(iframeID)
				}
			});
		});
	}
};


function onYouTubePlayerAPIReady() {
	slickSlideshow.youtube_ready = true;
	if (slickSlideshow.initiated_youtube == false) {
		if (slickSlideshow.$obj != undefined) { 
			slickSlideshow.YT_ready();
		}
	}
};


/* Responsive storytelling enhancement */

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

_logger = {}
_logger.debug = false;

_logger.log = function(text) {
	if (_logger.debug) {
		console.log(text);
	}
};

slickSlideshow.change_height = function(img) {
	img.attr("style", "height:100%; width: auto;");
	img_elem = img[0];

	if (img_elem != undefined) {
		var w = img_elem.clientWidth;
	} else {
		var w = img.width();
	}

	if (w == 0) {
		return img.width();
	}

	return w;
};

slickSlideshow.change_width = function(img) {
	img.attr("style", "width:100%; height: auto;");
	var img_elem = img[0];

	if (img_elem != undefined) {
		var h = img_elem.clientHeight;
	} else {
		var h = img.height();
	}

	if (h == 0) {
		return img.height();
	}

	return h;
};

slickSlideshow.resizeSlide = function() {
	h = slickSlideshow.$obj.height();
	w = slickSlideshow.$obj.width();

	$slick = slickSlideshow.$obj.getSlick();
	$slides = $($slick.$slides);

	$slides.each(function(index) {	
		if (slickSlideshow.view_type == 'double_view' || slickSlideshow.view_type == 'multiple_view') {
			var $imgs = $($(this).find('img'));
			$imgs.each(function(index) {
				var $img = $(this);
				$img.load(function() {
					var image_h = slickSlideshow.change_width($(this));
					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}
					if (!$img.hasClass("loaded")) {
						$img.addClass('loaded');
					}
				});
			});
		} else {
			var $img = $($(this).find('img')[0]);
			$img.load(function() {
				var image_h = slickSlideshow.change_width($(this));
				if (image_h > h) {
					slickSlideshow.change_height($(this));
				}
			});
		}
	});

	$(".slick-cloned").each(function(index) {
		if (slickSlideshow.view_type == 'double_view' || slickSlideshow.view_type == 'multiple_view') {
			var $imgs = $($(this).find('img'));
			$imgs.each(function(index) {
				var $img = $(this);
				$img.load(function() {
					var image_h = slickSlideshow.change_width($(this));
					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}
					if (!$img.hasClass("loaded")) {
						$img.addClass('loaded');
					}
				});
			});
		} else {
			var $img = $($(this).find('img')[0]);
			$img.load(function() {
				var image_h = slickSlideshow.change_width($(this));
				if (image_h > h) {
					slickSlideshow.change_height($(this));
				}
			});
		}
	});
};

slickSlideshow.resizeImages = function() {

	h = slickSlideshow.$obj.height();
	w = slickSlideshow.$obj.width();

	$slick = slickSlideshow.$obj.getSlick();
	$slides = $($slick.$slides);

	$(".slick-cloned").each(function(index) {
		if (slickSlideshow.view_type == "double_view" || slickSlideshow.view_type == 'multiple_view' || $("body").hasClass("template-instruments_view")) {
			
			var $imgs = $($(this).find('img'));
			$imgs.each(function(index_imgs) {
				var $img = $(this);
				$img.load(function() {
					var image_h = slickSlideshow.change_width($(this));
					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}
					if (!$img.hasClass("loaded")) {
						$img.addClass('loaded');
					}
				});
			});
		} else {
			var $img = $($(this).find('img')[0]);
			//$img.hide();
			$img.load(function() {
				var image_h = slickSlideshow.change_width($(this));
				if (image_h > h) {
					slickSlideshow.change_height($(this));
				}
				$img.show();
			});
		}
	});

	$slides.each(function(index) {	
		if (slickSlideshow.view_type == "double_view" || slickSlideshow.view_type == 'multiple_view' || $("body").hasClass("template-instruments_view")) {
			var $imgs = $($(this).find('img'));
			$imgs.each(function(index_imgs) {
				var $img = $(this);
				$img.load(function() {
					var image_h = slickSlideshow.change_width($(this));
					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}
					if (!$img.hasClass("loaded")) {
						$img.addClass('loaded');
					}
				});
			});
		} else {
			var $img = $($(this).find('img')[0]);
			//$img.hide();
			$img.load(function() {
				var image_h = slickSlideshow.change_width($(this));
				if (image_h > h) {
					slickSlideshow.change_height($(this));
				}
				$img.show();
			});
		}
	});
};

slickSlideshow.startPlayInstrument = function(currSlide) {
	/*var slide = currSlide;
	setTimeout(function() { currSlide.slickPlay(); }, 3000);*/
};

slickSlideshow.resizeImage = function(current) {
	var gap = slickSlideshow.gap;

	if (slickSlideshow.isCollection) {
		var h = $(".slideshow").height();
	} else if (!slickSlideshow.regular){
		var h = $(window).height();
	} else if (slickSlideshow.regular) {
		var h = $(".slideshow").height();
	}

	if ((h - gap > 0) && slickSlideshow.regular != true) {
		slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");
	} else if (slickSlideshow.regular) {
		slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");
	}
	
	if (slickSlideshow.resize) {
		h = slickSlideshow.$obj.height();
		w = slickSlideshow.$obj.width();

		$slick = slickSlideshow.$obj.getSlick();
		currentSlide = $slick.currentSlide;

		$slides = $slick.$slides;
		var total = $slides.length;

		if (slickSlideshow.view_type != "double_view") {
			if (currentSlide > 0 && currentSlide < $slides.length-1) {
				if (current) {
					$slides = $slides.slice(currentSlide-1, currentSlide+1);
				} else {
					$slides = [$slides[currentSlide-1], $slides[currentSlide+1]];
				}
			} else if (currentSlide == 0 && total > 1) {
				if (current) {
					$slides = [$slides[total-1], $slides[currentSlide], $slides[currentSlide+1]];
				} else {
					$slides = [$slides[total-1], $slides[currentSlide+1]];
				}
			} else if (currentSlide == total-1) {
				if (current) {
					$slides = [$slides[total-2], $slides[0]];
				}
			}
		}

		$($slides).each(function(index) {
			if (slickSlideshow.view_type == "double_view" || slickSlideshow.view_type == "multiple_view") {
				var $imgs = $($(this).find('img'));
				$imgs.each(function(index) {
					var $img = $(this);
					var image_h = slickSlideshow.change_width($(this));
					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}
				});
			} else {
				if (!$(this).hasClass('video-slide')) {
					var $img = $($(this).find('img')[0]);
					var image_h = slickSlideshow.change_width($img);
					if (image_h > h) {
						slickSlideshow.change_height($img);
					}
				}
			}
		});
	}
};

slickSlideshow.addSlideInIndex = function(slides, index) {
	_logger.log("Add new bulk on index: "+index);
	for (var i = 0; i < slides.length; i++) {
		item = slides[i];
		slide_item = {
			'url': item.image_url,
			'obj_url': item.url,
			'object_id': item.object_id,
			'title': item.title,
			'description': item.description,
			'body': item.body,
			'schema': item.schema
		}
		slickSlideshow.slides.splice((index+i+1), 0, slide_item);
		
		if (slickSlideshow.double_view == false) { 
			slickSlideshow.$obj.slickAdd("<div data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].url+"' data-body='"+slides[i].body+"'><div class='inner-bg'><img data-lazy='"+slides[i].image_url+"'/></div></div>", (index+i));
		} else if (slickSlideshow.view_type == "double_view") {
			slide_w_images = "<div data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].url+"' data-body='"+slides[i].body+"'><div class='inner-bg'>";
			for (var j = 0; j < slides[i].images.length; j++) {
				slide_w_images += "<div class='double-container'><img data-lazy='"+slides[i].images[j]+"'/></div>";
			};
			slide_w_images += "</div></div>";
			slickSlideshow.$obj.slickAdd(slide_w_images, (index+i));
		}
	}

	slickSlideshow.resizeSlide();
};

slickSlideshow.toggle_play = function(playBtn, slide) {
    if (playBtn.hasClass('playing')) {
      slide.slickPause();
      playBtn.removeClass('playing');
      playBtn.addClass('paused');
      $(".actions-div .play-btn i").removeClass("fa-pause");
      $(".actions-div .play-btn i").addClass("fa-play");
      $(".slideshow").removeClass('playing');
      $(".slideshow").addClass('paused');
    } else {
      slide.slickPlay();
      playBtn.removeClass('paused');
      playBtn.addClass('playing');
      $(".actions-div .play-btn i").removeClass("fa-play");
      $(".actions-div .play-btn i").addClass("fa-pause");
      $(".slideshow").removeClass('paused');
      $(".slideshow").addClass('playing');
    }
};

slickSlideshow.addNavigationSlides = function() {

	slides = slickSlideshow.slides;

	var init_slide = 0;

	if (!$("body").hasClass('template-multiple_view')) {
		init_slide = 1;
	} else {
		/*init_slide = 1;
		var first_slide = slides[0];
		var first_slick_slideshow = $(slickSlideshow.$obj.getSlick().$slides[0]);

		var slide_w_images = "";
		for (var j = 0; j < first_slide.images.length; j++) {
			slide_w_images += "<div><div class='inner-bg'><img data-lazy='"+first_slide.images[j]+"'/></div></div>";
		};
		
		first_slick_slideshow.slickAdd(slide_w_images);*/
	}

	for (var i = init_slide; i < slides.length; i++) {
		if (slickSlideshow.double_view == false) {
			if (slides[i].url != "") {
				slickSlideshow.$obj.slickAdd("<div data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].obj_url+"' data-body='"+slides[i].body+"'><div class='inner-bg'><img data-lazy='"+slides[i].url+"'/></div></div>");
			} else {
				slickSlideshow.$obj.slickAdd("<div data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].obj_url+"' data-body='"+slides[i].body+"' class='no-image-slide'><div class='title-description-wrapper'><h1 class='documentFirstHeading no-image'>"+slides[i].title+"</h1><div class='documentDescription description no-image'>"+slides[i].description+"</div></div></div>");
			}
		} else if (slickSlideshow.view_type == "double_view") {
			slickSlideshow.$obj.addClass('double-view');
			slide_w_images = "<div data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].obj_url+"' data-body='"+slides[i].body+"'>";
			for (var j = 0; j < slides[i].images.length; j++) {
				slide_w_images += "<div class='double-container'><div class='inner-bg'><img data-lazy='"+slides[i].images[j]+"'/></div></div>";
			};
			slide_w_images += "</div>";
			slickSlideshow.$obj.slickAdd(slide_w_images);

		} else if (slickSlideshow.view_type == "multiple_view") {
			slickSlideshow.$obj.addClass('multiple-view');

			slide_w_images = "<div class='inner-slideshow' data-title='"+slides[i].title+"' data-id='"+slides[i].object_id+"' data-description='"+slides[i].description+"' data-url='"+slides[i].obj_url+"' data-body='"+slides[i].body+"'>";
			for (var j = 0; j < slides[i].images.length; j++) {
				slide_w_images += "<div><div class='inner-bg'><img data-lazy='"+slides[i].images[j]+"'/></div></div>";
			};
			slide_w_images += "</div>";
			slickSlideshow.$obj.slickAdd(slide_w_images);
		}
	}

	if (!$("body").hasClass('template-multiple_view')) {
		var $currSlide = $(slickSlideshow.$obj.getSlick().$slides[0]);
		var first = slickSlideshow.slides[0];
		if (first != undefined) {
			$currSlide.attr('data-title', first.title);
			$currSlide.attr('data-id', first.object_id);
			$currSlide.attr('data-description', first.description);
			$currSlide.attr('data-url', first.obj_url);
			$currSlide.attr('data-body', first.body);
			slickSlideshow.resizeImages();
			slickSlideshow.updateSlideDetails(0, $currSlide, $currSlide.attr("data-title"), $currSlide.attr("data-description"));
		}
	} else {
		var $currSlide = $(slickSlideshow.$obj.getSlick().$slides[0]);
		var first = slickSlideshow.slides[0];
		$currSlide.attr('data-title', first.title);
		$currSlide.attr('data-id', first.object_id);
		$currSlide.attr('data-description', first.description);
		$currSlide.attr('data-url', first.obj_url);
		$currSlide.attr('data-body', first.body);
		slickSlideshow.resizeImages();
		slickSlideshow.updateSlideDetails(0, $currSlide, $currSlide.attr("data-title"), $currSlide.attr("data-description"));
		$(".slideshowWrapper").addClass("slick-init");
	}

	return;
};

slickSlideshow.getNavigationContent = function(query, object_id, init) {
	var request_url = "get_nav_objects";
	var URL;

	location_query_split = window.location.href.split('?');
	current_url = location_query_split[0];
	
	if (object_id != "") {
		location_url_split = current_url.split("/");
		location_url_split[location_url_split.length-1] = object_id;
		current_url = location_url_split.join('/');
	}

	// Set request URL
	URL = current_url + "/" + request_url + query;

	slickSlideshow.request_url = URL;
	slickSlideshow.query = query;

	if ($("body").hasClass('template-multiple_view') && query != "") {
		URL += "&bulk=5";
	} else if ($("body").hasClass('template-multiple_view') && query == "") {
		URL += "?bulk=5";
	}
	
	$.getJSON(URL, function(data) {
		if (data != undefined) {
			
			object_to_go = data.object_idx;
			
			slickSlideshow.double_view = data.has_list_images;
			slickSlideshow.total = data.total;
			slickSlideshow.total_items = data.total_items;
			slickSlideshow.view_type = data.view_type;
			slickSlideshow.slideCount = data.index_obj;

			_logger.log(slickSlideshow.total_items);

			$.each(data.list, function(index, item) {
				slide_item = {
					'url': item.image_url,
					'obj_url': item.url,
					'object_id': item.object_id,
					'title': item.title,
					'description': item.description,
					'body': item.body,
					'schema': item.schema
				}

				if (slickSlideshow.double_view) {
					slide_item.images = item.images;
				}
				slickSlideshow.slides.push(slide_item);
			});
			
			slickSlideshow.addNavigationSlides();
			
			if (slickSlideshow.reseted) {
				var push_url = slickSlideshow.slides[0].obj_url + slickSlideshow.query;
				history.replaceState(null, null, push_url);
			}

			if (!init) {
				slickSlideshow.initSlick(object_to_go);
			}

			var $slides = slickSlideshow.$obj.getSlick().$slides;

			var currentSlide = 0;
			$currentSlideObj = $($slides[currentSlide]);
			var description = $currentSlideObj.attr('data-description');
			var title = $currentSlideObj.attr('data-title');
			var original_title =  $currentSlideObj.attr('data-title');

			if (title == undefined) {
				title = "";
			} 

			if (description != undefined) {
				title = "";
			}

			if (title.length > 45) {
				title = title.substring(0, 44);
				title = title + "...";
			}
			

			var title_and_description = title + description;
			if (title_and_description.length > 85) {
				var offset = title_and_description.length - 85;
				title = title.substring(0, title.length-offset-1);
				title = title + "...";
			}

			$("#slideshow-controls #slide-count").html((slickSlideshow.slideCount) + "/" + slickSlideshow.total_items);
			

			if ((title != "") && (description != "")) {
				// TEMP $("#slideshow-controls #slide-description").html(title + ", " + description);
				$("#slideshow-controls #slide-description").html(original_title);
			}

			if (!init) {
				$(".slideshowWrapper").addClass("slick-init");
			} else if ($("body").hasClass("template-double_view")) {
				slickSlideshow.resizeImages();
			}
			
		}
	});

};

slickSlideshow.updateFacebook = function(url) {
	$(".fb-like").attr("data-href", url);
	FB.XFBML.parse();
};

slickSlideshow.updateTwitter = function(url, document_title) {
	$(".twitter-row").html('');
	var structure = '<a href="https://twitter.com/share" class="twitter-share-button" data-url="'+url+'" data-text="'+document_title+'">Tweet</a>';
	$(".twitter-row").html(structure);
	$.getScript("http://platform.twitter.com/widgets.js");
};

slickSlideshow.updatePinterest = function(current) {
	// TODO
	var $slide = $(slickSlideshow.$obj.getSlick().$slides[current])
	var $img = $($slide.find('img')[0])

	var url = $img.attr('data-lazy');
	if (url == undefined) {
		var url = $img.attr('src');
	}
	var pinterest_href = $("#pinterest-btn").attr("href");
	var pinterest_url = pinterest_href + url;
	$("#pinterest-btn").attr("href", pinterest_url);
};

slickSlideshow.updateSocialButtons = function(current, document_title) {
	var browser_url = window.location.href;
	slickSlideshow.updatePinterest(current);
	slickSlideshow.updateFacebook(browser_url);
	slickSlideshow.updateTwitter(browser_url, document_title);
};

slickSlideshow.findHashSlide = function(location_hash)  {

	var hash = location_hash.split("#")[1]

	var slides = slickSlideshow.slides;
	for (var i = 0; i < slides.length; i++) {
		if (slides[i].relative_path != undefined) {
			if (slides[i].relative_path == hash) {
				return i;
			}
		}
	};

	return 0;
};

slickSlideshow.findHashCollectionSlide = function(location_hash) {
	var hash = location_hash.split("#")[1]
	
	var $slides = $(".slick-slideshow div:not(.inner-bg)");
	for (var i = 0; i < $slides.length; i++) {
		var url = $($slides[i]).attr("data-url");
		if (url != undefined) {
			var url_compare = "/"+url.split("/").slice(3).join("/");
			if (url_compare == hash) {
				return i;
			}
		}
	};

	return 0;
};

slickSlideshow.initSlick = function(object_idx) {
	
	if (slickSlideshow.$obj != undefined) {
		
		if (slickSlideshow.regular) {

			if (window.location.hash != "") {
				slickSlideshow.initialSlide = slickSlideshow.findHashSlide(window.location.hash);
			}

			slickSlideshow.$obj.slick({
				accessibility: true,
				dots: false,
				infinite: true,
				speed: 500,
				slidesToShow: 1,
				lazyLoad: "progressive",
				initialSlide: slickSlideshow.initialSlide,
				adaptiveHeight: false,
				focusOnSelect: false,
				onAfterChange: slickSlideshow.afterChange,
				onBeforeChange: slickSlideshow.beforeChange,
				appendArrows: $(".slideshowWrapper"),
				nextArrow: "<div class='wrap-next'><button type='button' class='slick-next'></button></div>",
				prevArrow: "<div class='wrap-prev'><button type='button' class='slick-prev'></button></div>"
			});

			$(".slideshowWrapper").addClass("slick-init");

			slickSlideshow.resizeWindow();
			slickSlideshow.resizeImages();

			$(window).resize(function() {
				slickSlideshow.resizeWindow();
				slickSlideshow.resizeImage(true);
			});

		} else {

			var speed = 500;

			if ($("body").hasClass('template-book_view')) {
				if (window.location.hash != "") {
					slickSlideshow.initialSlide = slickSlideshow.findHashSlide(window.location.hash);
					object_idx = slickSlideshow.initialSlide;
					slickSlideshow.slideCount = slickSlideshow.initialSlide + 1;
				}
				speed = 0;
			}

			if ($("body").hasClass('template-instrument_view')) {
				if (window.location.hash != "") {
					slickSlideshow.initialSlide = slickSlideshow.findHashSlide(window.location.hash);
					object_idx = slickSlideshow.initialSlide;
					slickSlideshow.slideCount = slickSlideshow.initialSlide + 1;
				}
				speed = 0;
			}

			slickSlideshow.$obj.slick({
				accessibility: false,
				dots: false,
				infinite: true,
				speed: speed,
				autoplaySpeed: 500,
				slidesToShow: 1,
				initialSlide: object_idx,
				lazyLoad: 'progressive',
				adaptiveHeight: true,
				focusOnSelect: false,
				onAfterChange: slickSlideshow.afterChange,
				onBeforeChange: slickSlideshow.beforeChange,
				appendArrows: $(".slideshowWrapper"),
				nextArrow: "<div class='wrap-next'><button type='button' class='slick-next'></button></div>",
				prevArrow: "<div class='wrap-prev'><button type='button' class='slick-prev'></button></div>"
			});

			if (slickSlideshow.view_type == "multiple_view") {
				$(".play-btn").removeClass('playing');
				$(".play-btn").addClass('paused');
				$(".actions-div .play-btn i").removeClass("fa-pause");
		      	$(".actions-div .play-btn i").addClass("fa-play");
			}

			var h = $(window).height();
			var gap = slickSlideshow.gap;

			slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");

			if (!$("body").hasClass('template-double_view') && !$("body").hasClass('template-multiple_view') && !$("body").hasClass('template-book_view')) {
				// DO not resize
			} else {
				// Resize
				slickSlideshow.resizeImages();
			}
			
			if (slickSlideshow.view_type == "multiple_view") {
				var $currSlide = $(slickSlideshow.$obj.getSlick().$slides[0]);
			}

			if ($("body").hasClass("template-book_view")) {
				var document_title = document.title.split('—');
				var title = document_title[0];
				$("#slideshow-controls #slide-description").html(title);
			}

			if ($("body").hasClass("template-instruments_view")) {
				$(".play-btn").removeClass('playing');
				$(".play-btn").addClass('paused');
				$(".actions-div .play-btn i").removeClass("fa-pause");
		      	$(".actions-div .play-btn i").addClass("fa-play");
				var document_title = document.title.split('—');
				var title = document_title[0];
				$("#slideshow-controls #slide-description").html(title);
			}

			var $currSlide = $(slickSlideshow.$obj.getSlick().$slides[object_idx]);

			if ($("body").hasClass("template-instrument_view") || $("body").hasClass("template-book_view")) {
				slickSlideshow.updateSlideDetails(0, $currSlide, title, "");
			} else {
				// Metadata comes after slideshow loaded
				//slickSlideshow.updateSlideDetails(0, $currSlide, $currSlide.attr("data-title"), $currSlide.attr("data-description"));
			}

			slickSlideshow.resizeImage(true);
			$("#slideshow-controls").show();

			$(window).resize(function() {
				slickSlideshow.resizeImage(true);
			});
		}
	}
};


slickSlideshow.setLoadingProperties = function() {
	slickSlideshow.bulk = 30;
	slickSlideshow.lastItem = 0;
	slickSlideshow.forward = true;
	slickSlideshow.dangerous_entries = 1;
	slickSlideshow.dangerous_item = slickSlideshow.bulk;
	slickSlideshow.buffer = 5;
	slickSlideshow.total = false;
	slickSlideshow.reseted = false;
	slickSlideshow.regular = false;
	slickSlideshow.isCollection = false;
	slickSlideshow.double_view = false;
	slickSlideshow.multiple_view = false;
	slickSlideshow.view_type = "regular";
	slickSlideshow.total_items = 0;
	slickSlideshow.slideCount = 1;
	slickSlideshow.gap = 160;
	slickSlideshow.resize = true;
	slickSlideshow.moved = false;
	slickSlideshow.editingMode = false;
	slickSlideshow.initialSlide = 0;
	slickSlideshow.no_image = false;

	if ($("body").hasClass('template-multiple_view')) {
		slickSlideshow.bulk = 5;
		slickSlideshow.buffer = 1;
	}
};

slickSlideshow.resizeWindow = function() {
	var w = $(window).width();
	var ratio = 16/9;
	var h = w / ratio;

	$(".slideshow").css("height", h+"px");
	$("#slickslideshow").css("height", h+"px");
};

slickSlideshow.startVideoFromSlide = function(slide) {

	if (!slickSlideshow.editingMode && !isMobile.any()) {
		var iframeID = $(slide.find('iframe')[0]).attr('id');

		var player = slickSlideshow.players[iframeID];
		if (player != undefined) {
			if (player.playVideo) {
				player.playVideo();
			} else {
				$(".slick-active.video-slide img.overlay-image").hide();
				$(".video-play-btn").hide();
				$(".video-play-btn").css("opacity", 0);
				$(".slick-active.video-slide iframe").show();
			}
		}  else {
			$(".slick-active.video-slide img.overlay-image").hide();
			$(".video-play-btn").hide();
			$(".video-play-btn").css("opacity", 0);
			$(".slick-active.video-slide iframe").show();

		}
	}
};

slickSlideshow.startFirstVideo = function(slide) {
	if (!slickSlideshow.editingMode && !isMobile.any()) {
		var iframeID = $(slide.find('iframe')[0]).attr('id');
		var player = slickSlideshow.players[iframeID];
		
		if (player != undefined) {
			if (player.playVideo) {
				player.playVideo();
			} else {
				$(".slick-active.video-slide img.overlay-image").hide();
				$(".video-play-btn").css("opacity", 0);
				$(".slick-active.video-slide iframe").show();
				$(".video-play-btn").hide();
			}
		} else {
			$(".slick-active.video-slide img.overlay-image").hide();
			$(".video-play-btn").css("opacity", 0);
			$(".slick-active.video-slide iframe").show();
			$(".video-play-btn").hide();
		}
	}
};

slickSlideshow.addCollectionItems = function(data) {
	for (i = 0; i < data.length; i++) {
		var remoteURL = data[i].remote_url;
		var _id = data[i]._id;
		var description = data[i].data_description;
		var title = data[i].data_title;
		var url = data[i].data_url;
		var image_path = data[i].image_path;
		
		if (data[i].is_video && data[i].has_overlay) {
			var slide = "<div data-url='"+url+"' data-description='"+description+"' data-title='"+title+"' class='video-slide'>"
			+ "<div class='video-play-btn'></div>"
			+ "<img src='"+image_path+"' class='overlay-image'/>"
			+ "<iframe frameborder='0' allowfullscreen src='"+remoteURL+"' id='"+_id+"' class='video-iframe with-overlay'></iframe>"
			+ "</div>";
			slickSlideshow.$obj.slickAdd(slide);
		} else if (data[i].is_video && !data[i].has_overlay) {
			var slide = "<div data-url='"+url+"' data-description='"+description+"' data-title='"+title+"' class='video-slide'>"
			+ "<iframe frameborder='0' allowfullscreen src='"+remoteURL+"' id='"+_id+"' class='video-iframe without-overlay'></iframe>"
			+ "</div>";
			slickSlideshow.$obj.slickAdd(slide);
		} else {
			var slide = "<div data-url='"+url+"' data-description='"+description+"' data-title='"+title+"'>"
			+ "<div class='inner-bg'>"
			+ "<img src='"+image_path+"'/>"
			+ '</div>'
			+ "</div>";
			slickSlideshow.$obj.slickAdd(slide);
		}
	}
};

slickSlideshow.addNextSlidesCollection = function(data_url) {
	var request_url = "/get_collection_items";

	var URL = data_url + request_url;

	$.getJSON(URL, function(data) {
		if (data != undefined) {
			slickSlideshow.addCollectionItems(data);
		}
	})
};

slickSlideshow.initCollection = function() {
	slickSlideshow.$obj = $($('.slick-slideshow')[0]);

	$("#slickslideshow").toggleClass("fullscreen");
	slickSlideshow.setLoadingProperties();
	
	/* Check editing mode */
	if ($("body").hasClass('userrole-authenticated')) {
		slickSlideshow.editingMode = true;
	}

	slickSlideshow.isCollection = true;

	if (window.location.hash != "") {
		slickSlideshow.initialSlide = slickSlideshow.findHashCollectionSlide(window.location.hash);
	}

	slickSlideshow.slideCount = slickSlideshow.initialSlide + 1;

	slickSlideshow.$obj.slick({
		accessibility: true,
		dots: false,
		infinite: true,
		slidesToShow: 1,
		initialSlide: slickSlideshow.initialSlide,
		speed: 500,
		adaptiveHeight: true,
		focusOnSelect: false,
		onAfterChange: slickSlideshow.afterChange,
		onBeforeChange: slickSlideshow.beforeChange,
		appendArrows: $(".slideshowWrapper"),
		nextArrow: "<div class='wrap-next'><button type='button' class='slick-next'></button></div>",
		prevArrow: "<div class='wrap-prev'><button type='button' class='slick-prev'></button></div>"
	});

	$(".slideshowWrapper").addClass("slick-init");
	slickSlideshow.total_items = slickSlideshow.$obj.getSlick().$slides.length;
	if (slickSlideshow.total_items == 0) {
		$(".slideshow-loader").fadeOut(200)
	}

	$("#slideshow-controls #slide-count").html((slickSlideshow.slideCount) + "/" + slickSlideshow.total_items);
	$("#slideshow-controls #slide-description").html($(slickSlideshow.$obj.getSlick().$slides[slickSlideshow.initialSlide]).attr("data-description"));


	// Check if front-page
	/*var data_url = $("#slickslideshow").attr('data-url');
	if (data_url != undefined) {
		slickSlideshow.addNextSlidesCollection(data_url);
	}*/


	slickSlideshow.resizeWindow();
	slickSlideshow.resizeImages();

	$(window).resize(function() {
		slickSlideshow.resizeWindow();
		slickSlideshow.resizeImage(true);
	});

	$(window).scroll(function() {
		var isvisible = isElementInViewport($("#slickslideshow"));
		
		if (!isvisible) {
			if (slickSlideshow.playing) {
				slickSlideshow.pauseCurrentSlide();
			}
		}
	});

};

slickSlideshow.init = function() {
	var query = location.search;

	$slick_slideshow = $($('.slick-slideshow')[0]);

	/* Collection slideshow */
	if ($slick_slideshow != undefined) {
		if ($slick_slideshow.hasClass('collection')) {
			slickSlideshow.initCollection();
			if (slickSlideshow.youtube_ready) {
				slickSlideshow.initiated_youtube = true;
				slickSlideshow.YT_ready();
			}
			return;
		}
	}

	/* Single content slideshow */
	if ($slick_slideshow.hasClass("regular")) {
		_logger.log("==== INIT Regular slideshow ====");
		slickSlideshow.$obj = $($('.slick-slideshow')[0]);
		slickSlideshow.$contentListingObj = $($('.slick-slideshow a')[0]);
		slickSlideshow.$contentListingObj.remove();
		slickSlideshow.getDetails();
		slickSlideshow.setLoadingProperties();

		/* Check editing mode */
		if ($("body").hasClass('userrole-authenticated')) {
			slickSlideshow.editingMode = true;
		}

		slickSlideshow.regular = true;
		slickSlideshow.double_view = false;
		slickSlideshow.getContentListing("regular");
		
		$("#slickslideshow").toggleClass("fullscreen");

		
		return;
	}

	if ($("body").hasClass('template-instrument_view')) {
		
		_logger.log("==== INIT Regular slideshow ====");
		slickSlideshow.$obj = $($('.slick-slideshow')[0]);

		slickSlideshow.$contentListingObj = $($('.slick-slideshow a')[0]);
		slickSlideshow.$contentListingObj.remove();
		slickSlideshow.getDetails();
		slickSlideshow.setLoadingProperties();

		/* Check editing mode */
		if ($("body").hasClass('userrole-authenticated')) {
			slickSlideshow.editingMode = true;
		}

		var gap = 0;
	    var h = $(window).height();
	    slickSlideshow.gap = gap;  
		slickSlideshow.resize = true;
		
		
		slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");
		slickSlideshow.double_view = false;
		slickSlideshow.getContentListing("regular");
		
		$("#slickslideshow").toggleClass("fullscreen");
		$("header").toggleClass("fullscreen");

		return;
	}

	if ($("body").hasClass('template-book_view')) {
		
		_logger.log("==== INIT Regular slideshow ====");
		slickSlideshow.$obj = $($('.slick-slideshow')[0]);

		slickSlideshow.$contentListingObj = $($('.slick-slideshow a')[0]);
		slickSlideshow.$contentListingObj.remove();
		slickSlideshow.getDetails();
		slickSlideshow.setLoadingProperties();

		/* Check editing mode */
		if ($("body").hasClass('userrole-authenticated')) {
			slickSlideshow.editingMode = true;
		}

		var gap = 160;
	    var h = $(window).height();
	    slickSlideshow.gap = gap;  
		slickSlideshow.resize = true;
		$(".actions-div .expand-btn i").removeClass("fa-compress");
      	$(".actions-div .expand-btn i").addClass("fa-expand");
		
		slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");
		slickSlideshow.double_view = false;
		slickSlideshow.getContentListing("regular");
		
		return;
	}

	/* Storytelling slideshow */
	if (query != "" || query == "") {
		_logger.log("==== INIT Loading feature ====");
		slickSlideshow.$obj = $($('.slick-slideshow')[0]);
		slickSlideshow.$contentListingObj = $($('.slick-slideshow a')[0]);
		slickSlideshow.$contentListingObj.remove();
		slickSlideshow.$container = $($(".slideshowContent")[0]);
		slickSlideshow.getDetails();
		slickSlideshow.setLoadingProperties();
		
		/* Check editing mode */
		if ($("body").hasClass('userrole-authenticated')) {
			slickSlideshow.editingMode = true;
		}

		var gap = 0;
	    var h = $(window).height();
	    slickSlideshow.gap = gap; 


	    if (!$("body").hasClass("template-double_view") && !$("body").hasClass("template-drawing_view") && !$("body").hasClass("template-multiple_view") && !$("body").hasClass('template-instruments_view')) {
		    // FULL SCREEN OPTION
		    $("#slickslideshow").toggleClass("fullscreen");
		    $("header").toggleClass("fullscreen");
		    slickSlideshow.resize = false;
		} else {
			// ZOOMED OUT OPTION
			var gap = 160;
	    	var h = $(window).height();
	    	slickSlideshow.gap = gap;
			slickSlideshow.resize = true;
			$(".actions-div .expand-btn i").removeClass("fa-compress");
      		$(".actions-div .expand-btn i").addClass("fa-expand");
		}

	    slickSlideshow.$obj.attr("style", "height:"+(h-gap)+"px;");
		slickSlideshow.getContentListing("");
	}
};

slickSlideshow.addBulkElements = function(index) {
	var request_url = "get_next_objects";
	var URL;

	location_query_split = window.location.href.split('?');
	current_url = location_query_split[0];

	// Set request URL
	var add_object = slickSlideshow.slides[index];
	if (slickSlideshow.query != "") {
		URL = current_url + "/" + request_url + slickSlideshow.query + "&object_id="+add_object.object_id;
	} else {
		URL = current_url + "/" + request_url + "?object_id="+add_object.object_id;
	}

	if ($("body").hasClass('template-multiple_view')) {
		URL += "&bulk=5";
	}

	_logger.log("[Slideshow bulk] Get next bulk for object_id: "+add_object.object_id)
	
	// Request
	$.getJSON(URL, function(data) {
		if (data.list != undefined) {
			slickSlideshow.total = data.total;
			slickSlideshow.addSlideInIndex(data.list, index);
		}
	});
};

slickSlideshow.resetSlideshow = function(item) {
	var slide_count = slickSlideshow.slideCount;
	slickSlideshow.$obj.html('');
	slickSlideshow.$obj.unslick();
	object_id = slickSlideshow.slides[item].object_id;
	slickSlideshow.slides.length = 0;
	slickSlideshow.slides = [];
	slickSlideshow.setLoadingProperties();
	slickSlideshow.reseted = true;
	slickSlideshow.slideCount = slide_count;
	slickSlideshow.getContentListing(object_id);
};

slickSlideshow.updateSlideshowLoading = function(current) {
	var reset = false;

	if (slickSlideshow.dangerous_item != undefined && slickSlideshow.total == false) {
		dangerous_zone_start = slickSlideshow.dangerous_item - slickSlideshow.buffer;
		dangerous_zone_end = slickSlideshow.dangerous_item + slickSlideshow.buffer;
		
		_logger.log("[Slideshow loading] Current slide: "+current);
		_logger.log("[Slideshow loading] Dangerous zone start: "+dangerous_zone_start);

		if (current >= dangerous_zone_start && current <= dangerous_zone_end) {
			if (slickSlideshow.forward) {
				slickSlideshow.addBulkElements(slickSlideshow.dangerous_item);
				slickSlideshow.dangerous_entries += 1;
				slickSlideshow.dangerous_item = slickSlideshow.bulk*slickSlideshow.dangerous_entries;
			} else {
				reset = true;
				slickSlideshow.reseted = true;
				slickSlideshow.resetSlideshow(dangerous_zone_end);
			}
		}
	}

	return reset;
};

slickSlideshow.updateSchema = function(schema) {	
	if ($("body").hasClass('template-book_view')) {
		slickSlideshow.getSchemaSlide(slickSlideshow.$obj.slickCurrentSlide());
		return false;
	}

	_logger.log("[Update schema] try to update");
	$(".object-fieldset").html('');

	var html = "";
	var body = "";

	for (var i = 0; i < schema.length; i++) {
		if (schema[i].title != "body") {
			html += "<div class='col-lg-5 col-md-5 col-sm-5 col-xs-12 object-label' style='padding-left:0px;'><span>"+schema[i].title+"</span></div><div class='col-lg-7 col-md-7 col-sm-7 col-xs-12 object-value'><p>"+schema[i].value+"</p></div>";
		} else {
			body = schema[i].value;
		}
	}
	
	var no_lt = html.replace(/&lt;/g, "<");
	var res = no_lt.replace(/&gt;/g, ">");
	
	var jsBody = $($.parseHTML(body));
	var htmlBody = $.parseHTML(jsBody.text());
	$("#body-text").html('');
	$("#body-text").html(htmlBody);
	$(".object-fieldset").html(res);
};

slickSlideshow.updateSchemaSlide = function(schema) {
	_logger.log("[Update schema] try to update");
	$(".object-fieldset").html('');

	var html = "";
	var body = "";

	for (var i = 0; i < schema.length; i++) {
		if (schema[i].value != "") {
			if (schema[i].title != "body") {
				html += "<div class='col-lg-5 col-md-5 col-sm-5 col-xs-12 object-label' style='padding-left:0px;'><span>"+schema[i].title+"</span></div><div class='col-lg-7 col-md-7 col-sm-7 col-xs-12 object-value'><p>"+schema[i].value+"</p></div>";
			} else {
				body = schema[i].value;
			}
		}
	}
	
	var no_lt = html.replace(/&lt;/g, "<");
	var res = no_lt.replace(/&gt;/g, ">");

	var jsBody = $($.parseHTML(body));
	var htmlBody = $.parseHTML(jsBody.text());
	
	$("#body-text").html('');
	$("#body-text").html(htmlBody);
	$(".object-fieldset").html(res);
	/*if (slickSlideshow.no_image) {
		$(".portaltype-object #parent-fieldname-text").show();
		$(".container.object-container").show();
		$(".object-fields").show();
		
		//window.location.hash = "#slideshow-controls";
	}*/
};

slickSlideshow.getSchemaSlide = function(currentSlide) {
	var URL = "";
	var request_url = "get_fields";
	var $slide_object = $(slickSlideshow.$obj.getSlick().$slides[currentSlide]);
	var data_url = document.location.href;

	if (document.location.search != "") {
		temp_url = data_url;
		data_url = temp_url.replace(document.location.search, '');
	}

	URL = data_url + "/" + request_url;

	$.getJSON(URL, function(data) {
		if (data.schema != undefined) {
			slickSlideshow.updateSchemaSlide(data.schema);
		}
	});
};


slickSlideshow.updateSchemaCollection = function(currentSlide) {
	var URL = "";
	var request_url = "get_fields";
	var $slide_object = $(slickSlideshow.$obj.getSlick().$slides[currentSlide]);
	var data_url = $slide_object.attr('data-url');

	URL = data_url + "/" + request_url;

	$.getJSON(URL, function(data) {
		if (data.schema != undefined) {
			slickSlideshow.updateSchema(data.schema);
		}
	});
};

slickSlideshow.beforeChange = function(event) {
	if (!$(".slideshowWrapper").hasClass("moved")) {
		$(".slideshowWrapper").addClass("moved")
	}
	currentSlide = event.currentSlide;
	var $currSlider = $(event.$slides[currentSlide]);

	slickSlideshow.changeWrapperOpacity();

	if ($("body").hasClass('template-instruments_view') && $currSlider.hasClass('inner-slideshow')) {
		$(".play-btn").removeClass('playing');
		$(".play-btn").addClass('paused');
		$(".actions-div .play-btn i").removeClass("fa-pause");
      	$(".actions-div .play-btn i").addClass("fa-play");
		$currSlider.slickPause();
	}

	if ($currSlider.hasClass("video-slide")) {
		var frameID = $($currSlider.find('iframe')[0]).attr("id");
		// Pause video
		var slide_player = slickSlideshow.players[frameID];
		if (slide_player != undefined && slide_player.pauseVideo) {
			slide_player.pauseVideo();
		}
	}
};

slickSlideshow.updateDOMTitle = function(body, title) {
	/* Update title */

	var document_title = document.title.split('—');
	document_title[0] = title;

	document.title = document_title.join('—');
	
	// Change title
	$("#content h1.documentFirstHeading:not(.no-image)").html(title);
};

slickSlideshow.updateSlideDescriptionBar = function(title, description) {
	if (title == undefined) {
		title = "";
	}

	if  (description == undefined) {
		description = "";
	}
	
	if (title.length > 45) {
		title = title.substring(0, 44);
		title = title + "...";
	}

	var title_and_description = title + description;
	if (title_and_description.length > 85) {
		var offset = title_and_description.length - 85;
		title = title.substring(0, title.length-offset-1);
		title = title + "...";
	}

	/* **** */
	// Update description bar
	/* **** */

	if (description != "") {
		//$("#slideshow-controls #slide-description").html(title + ", " + description);
		$("#slideshow-controls #slide-description").html(title);
	} else {
		$("#slideshow-controls #slide-description").html(title);
	}
};

slickSlideshow.updateSlideDetails = function(curr, currentSlide, title, description) {
	var $currentSlideObj = currentSlide;

	$("#content div.documentDescription.description:not(.no-image)").html(description);

	// Set length of description
	if (title == undefined) {
		title = "";
	}

	if  (description == undefined) {
		description = "";
	}
	
	if (title.length > 45) {
		title = title.substring(0, 44);
		title = title + "...";
	}

	var title_and_description = title + description;
	if (title_and_description.length > 85) {
		var offset = title_and_description.length - 85;
		title = title.substring(0, title.length-offset-1);
		title = title + "...";
	}

	/* **** */
	// Update description bar
	/* **** */

	$("#slideshow-controls #slide-count").html((slickSlideshow.slideCount) + "/" + slickSlideshow.total_items);
	if (description != "") {
		if ($currentSlideObj.hasClass("video-slide")) {
			$("#slideshow-controls #slide-description").html(description);
		} else {
			$("#slideshow-controls #slide-description").html(title + ", " + description);
		}
	} else {
		if ($currentSlideObj.hasClass("video-slide")) {
			$("#slideshow-controls #slide-description").html('');
		} else {
			$("#slideshow-controls #slide-description").html(title);
		}
	}

	// Update schema of object
	if (slickSlideshow.isCollection != true) {
		var schema = slickSlideshow.slides[curr].schema;
		slickSlideshow.updateSchema(schema);
	} else {
		if (slickSlideshow.regular == false) {
			slickSlideshow.updateSchemaCollection(curr);
		} else {
			var schema = slickSlideshow.slides[curr].schema;
			slickSlideshow.updateSchema(schema);
		}
	}

};

slickSlideshow.updateDOMProperties = function(curr, currentSlide, title, description, body) {
	slickSlideshow.updateDOMTitle(body, title);
	slickSlideshow.updateSlideDetails(curr, currentSlide, title, description);
};

slickSlideshow.contentAJAXrefresh = function(curr, currentObject) {
	var $currentSlideObj = currentObject;



	if (slickSlideshow.isCollection) {
		var description = $currentSlideObj.attr('data-description');
		var title = $currentSlideObj.attr('data-title');
		var body = $currentSlideObj.attr('data-body');
	} else {
		var push_url = $currentSlideObj.attr('data-url') + slickSlideshow.query;
		history.replaceState(null, null, push_url);
		var description = $currentSlideObj.attr('data-description');
		var title = $currentSlideObj.attr('data-title');
		var body = $currentSlideObj.attr('data-body');
		slickSlideshow.updateSocialButtons(0, title);
	}

	slickSlideshow.updateDOMProperties(curr, $currentSlideObj, title, description, body);
	
	if ($currentSlideObj.hasClass('video-slide')) {
		slickSlideshow.startVideoFromSlide($currentSlideObj);
	}
};

slickSlideshow.updateSlideCount = function(currentSlide) {

	var $slides = slickSlideshow.$obj.getSlick().$slides;
	var on_site_total = $slides.length-1;

	if (currentSlide == on_site_total && slickSlideshow.lastItem == 0) {
		slickSlideshow.slideCount -= 1;
		slickSlideshow.forward = false;
		slickSlideshow.lastItem = currentSlide;
	} else if (currentSlide == 0 && slickSlideshow.lastItem == on_site_total) {
		slickSlideshow.slideCount += 1;
		slickSlideshow.forward = true;
		slickSlideshow.lastItem = currentSlide;
	} else if (currentSlide < slickSlideshow.lastItem) {
		slickSlideshow.slideCount -= 1;
		slickSlideshow.forward = false;
		slickSlideshow.lastItem = currentSlide;
	} else {
		slickSlideshow.slideCount += 1;
		slickSlideshow.forward = true;
		slickSlideshow.lastItem = currentSlide;
	}

	if (slickSlideshow.slideCount <= 0) {
		slickSlideshow.slideCount = slickSlideshow.total_items;
	} else if (slickSlideshow.slideCount >= slickSlideshow.total_items+1) {
		slickSlideshow.slideCount = 1;
	}
	
	if (slickSlideshow.forward) {
		
		if (slickSlideshow.moved && $(".slideshow").hasClass('playing')) {
			
    	} else {
			if (!isMobile.any() && $("#slickslideshow").hasClass("fullscreen")) {
				$(".wrap-next").css("opacity", 1);
				$("#portal-header-wrapper, #slideshow-controls, body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeOut();
				if (!$(".slideshowWrapper").hasClass("moved")) {
	            	$(".slideshowWrapper").addClass("moved");
	          	}
				$(".wrap-prev").css("opacity", 0);
	    	} else if (!isMobile.any() && !$("#slickslideshow").hasClass("fullscreen")) {
	    		$("body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeOut();
	    	}
    	}
    	slickSlideshow.moved = true;
	} else {
		
		if (slickSlideshow.moved && $(".slideshow").hasClass('playing')) {
			
    	} else {
    		if (!isMobile.any() && $("#slickslideshow").hasClass("fullscreen")) {
				$(".wrap-prev").css("opacity", 1);
				$("#portal-header-wrapper, #slideshow-controls, body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeOut();
				if (!$(".slideshowWrapper").hasClass("moved")) {
	            	$(".slideshowWrapper").addClass("moved");
	          	}
				$(".wrap-next").css("opacity", 0);
	    	} else if (!isMobile.any() && !$("#slickslideshow").hasClass("fullscreen")) {
	    		$("body.portaltype-portlet-page .documentDescription, body.template-content_view .documentDescription, body.template-content_view .documentFirstHeading").fadeOut();
	    	}
    	}
    	slickSlideshow.moved = true;
	}
};

slickSlideshow.updateSlideURLFragment = function(slide) {
	if (!slickSlideshow.isCollection) {
		var url = slide.relative_path;
		var original_path = window.location.href.split(/\?|#/)[0];
		var absolute_path = original_path + "#" + url;
		history.replaceState(null, null, absolute_path);
	}
};

slickSlideshow.updateSlideCollectionURL = function(slide) {
	var url = slide.attr("data-url");
	var real_url = url.split("/").slice(3).join("/");
	var original_path = window.location.href.split(/\?|#/)[0];
	var absolute_path = original_path + "#/" + real_url;
	history.replaceState(null, null, absolute_path);
};

slickSlideshow.afterChange = function(event) {

	//slickSlideshow.resizeImage(false);

	var currentSlide = slickSlideshow.$obj.getSlick().currentSlide;
	var $slides = slickSlideshow.$obj.getSlick().$slides;

	if (currentSlide == slickSlideshow.lastItem) {
		return;
	}

	/* *********** */
	/* TO BE FIXED */
	/* *********** */
	//$(".video-slide img.overlay-image").hide();

	/* ****************** */
	/* Update slide count */
	/* ****************** */
	slickSlideshow.updateSlideCount(currentSlide);

	/* ******************************** */
	/* Update slideshow Loading feature */
	/* ******************************** */
	var reset = slickSlideshow.updateSlideshowLoading(currentSlide);

	/* ******************* */
	/* Regular slideshow   * 
	/* ******************* */


	if (slickSlideshow.regular || $("body").hasClass('template-book_view') || $("body").hasClass('template-instrument_view') ) {
		var slide = slickSlideshow.slides[currentSlide];
		var description = slide.description;
		$("#slideshow-controls #slide-count").html((slickSlideshow.slideCount) + "/" + slickSlideshow.total_items);
		
		if (!$("body").hasClass('template-book_view') && !$("body").hasClass('template-instrument_view')) {
			$("#slideshow-controls #slide-description").html(description);
		}

		slickSlideshow.updateSlideURLFragment(slide);
	}

	/* ******************* */
	/* Special slideshow    * 
	/* ******************* */
	if (reset == false && slickSlideshow.regular == false && !$("body").hasClass('template-book_view') && !$("body").hasClass('template-instrument_view')) {

		// --- Update object details
		$currentSlideObj = $($slides[currentSlide]);

		if ($currentSlideObj.hasClass('no-image-slide')) {
			if (!$("body").hasClass('no-image-slide')) {
				$("body").addClass("no-image-slide");
			}
		} else {
			if ($("body").hasClass('no-image-slide')) {
				$("body").removeClass("no-image-slide");
			}
		}

		if ($currentSlideObj.hasClass('video-slide')) {
			$(".actions-div").hide();
		} else {
			$(".actions-div").show();
		}

		if (slickSlideshow.isCollection) {
			slickSlideshow.updateSlideCollectionURL($currentSlideObj);
		}

		slickSlideshow.contentAJAXrefresh(currentSlide, $currentSlideObj);

		// Multiple View
		if ($("body").hasClass("template-instruments_view")) {
			if ($(".play-btn").hasClass("playing")) {
				$(".play-btn").removeClass('playing');
				$(".play-btn").addClass('paused');
				$(".actions-div .play-btn i").removeClass("fa-play");
      			$(".actions-div .play-btn i").addClass("fa-pause");
			} else {
				/*$(".play-btn").addClass('playing');
				$(".actions-div .play-btn i").removeClass("fa-play");
      			$(".actions-div .play-btn i").addClass("fa-pause");*/
			}
			/*$(".play-btn").removeClass('playing');
			$(".play-btn").addClass('playing');
			$(".actions-div .play-btn i").removeClass("fa-play");
      		$(".actions-div .play-btn i").addClass("fa-pause");*/

			//setTimeout(function(){ $currentSlideObj.slickPlay() }, 2000);

		}
	} 
};

slickSlideshow.getRegularContent = function() {
	_logger.log('[Content listing : regular]')
	var URL, querystring;
	if (slickSlideshow.url.indexOf("?") != -1) {
		querystring = slickSlideshow.url.slice(slickSlideshow.url.indexOf("?") + 1);
		slickSlideshow.url = slickSlideshow.url.slice(0, slickSlideshow.url.indexOf("?"));
	} else {
		querystring = "";
	}

	// Make it non-recursive
	slickSlideshow.recursive = false;
	querystring = "";

	if (slickSlideshow.recursive) {
		if (querystring == "") {
			URL = slickSlideshow.url + '/slideshowListing';
		} else {
			URL = slickSlideshow.url + '/slideshowListing' + '?' + querystring;
		}
	} else {
		if (querystring == "") {
			URL = slickSlideshow.url + '/slideshowListing?recursive=false';
			if ($("body").hasClass("template-book_view") || $("body").hasClass('template-instrument_view')) {
				URL += "&book_view=true";
			}
		} else {
			URL = slickSlideshow.url + '/slideshowListing' + '?' + querystring + "&recursive=false";
		}
	}

	var slickInited = true;
	if (window.location.hash != "" || $("body").hasClass("template-book_view")) {
		slickInited = false;
	}

	if (slickInited) {
		var lead_image_url = $("meta[property='og:image']").attr("content");
		var lead_image_scale = lead_image_url;

		if (lead_image_scale != undefined) {
			slickSlideshow.$obj.append("<div><div class='inner-bg'><img class='first-image' id='first-image-regular' data-lazy='"+lead_image_scale+"'/></div></div>");
			slickSlideshow.initSlick();
		} else {
			slickInited = false;
		}

		if (lead_image_scale != undefined) {
			$("#first-image-regular").load(function() {
				var h = slickSlideshow.$obj.height();
				var image_h = slickSlideshow.change_width($(this));

				if (image_h > h) {
					slickSlideshow.change_height($(this));
				}

				$(this).addClass("first-loaded");
				$(".slideshowWrapper").addClass("slick-init");
			});
		} 
	}
	
	$.getJSON(URL, function(data) {
		var data_len = $(data).length;
		
		if (data_len == 0) {
			$(".slideshow-loader").fadeOut();
		}

		$.each(data, function(index, item) {
			if (index == data_len - 1) {
				slickSlideshow.getSlideDetails(item, true, slickInited);
			} else {
				slickSlideshow.getSlideDetails(item, false, slickInited);
			}
		});
	});
};

/***** 
	GET CONTENT TYPE
*****/

slickSlideshow.getContentListing = function(object_number) {
	var URL;	
	var query = location.search;
	if (object_number != "regular") {
		// Get lead media first
		if ($("body").hasClass('template-drawing_view') || $("body").hasClass('template-view') || $("body").hasClass('template-instruments_view')) {
			// DRAWINGS
			var lead_image_url = $("meta[property='og:image']").attr("content");
			var lead_image_scale = lead_image_url;
			var title = $("meta[property='og:title']").attr("content");
			var description = $("meta[property='og:description']").attr("content");

			if (lead_image_scale != undefined) { 
				slickSlideshow.$obj.append("<div><div class='inner-bg'><img class='first-image' id='first-image' data-lazy='"+lead_image_scale+"'/></div></div>");
			}

			slickSlideshow.initSlick(0);
			slickSlideshow.getSchemaSlide(0);
			slickSlideshow.updateSlideDescriptionBar(title, description);
			slickSlideshow.getNavigationContent(query, object_number, true);

			if (lead_image_scale != undefined && lead_image_scale != "") { 
				$("#first-image").load(function() {
					var h = slickSlideshow.$obj.height();
					var image_h = slickSlideshow.change_width($(this));

					if (image_h > h) {
						slickSlideshow.change_height($(this));
					}

					$(this).addClass("first-loaded");
					$(".slideshowWrapper").addClass("slick-init");
				});
			} else {
				$(".slideshowWrapper").addClass("slick-init");
				slickSlideshow.no_image = true;
				$("body").addClass("no-img-slideshow");
			}

		} else if ($("body").hasClass('template-double_view')) {
			// DOUBLE VIEW
			slickSlideshow.view_type = "double_view";
			
			var has_double_image = true;

			var lead_image_url = $("meta[property='og:image']").attr("content");
			var lead_image_scale = lead_image_url;
			var title = $("meta[property='og:title']").attr("content");
			var description = $("meta[property='og:description']").attr("content");

			var double_lead_image_url = $("meta[property='teylers:double_image']").attr("content");
			
			if (double_lead_image_url == "") {
				has_double_image = false
			}

			if (has_double_image) {
				var double_lead_image_scale = double_lead_image_url;
			} else {
				var double_lead_image_scale = "";
			}

			var content = "<div><div class='double-container'><div class='inner-bg'><img class='first-image' data-lazy='"+lead_image_scale+"'/></div></div><div class='double-container'><div class='inner-bg'><img class='double-image' data-lazy='"+double_lead_image_scale+"'/></div></div></div>";
			
			slickSlideshow.$obj.append(content);
			slickSlideshow.initSlick(0);
			slickSlideshow.getSchemaSlide(0);
			slickSlideshow.updateSlideDescriptionBar(title, description);
			
			slickSlideshow.resizeImages();
			slickSlideshow.getNavigationContent(query, object_number, true);

			if (has_double_image) {
				$("img.double-image").load(function() {
					$(".slideshowWrapper").addClass("slick-init");
				});
			} else {
				$("img.first-image").load(function() {
					$(".slideshowWrapper").addClass("slick-init");
				});
			}
		} else {
			slickSlideshow.getNavigationContent(query, object_number, false);
		}
	} else if (object_number == "regular") {
		slickSlideshow.getRegularContent();
	}
};

slickSlideshow.getSlideDetails = function(item, last, slickInited) {
	var URL = "";
	var embed = "";
	var isVideo = false;

	var slide_item = {
		'url': item.url,
		'UID': item.UID,
		'relative_path': item.relative_path,
	}

	slickSlideshow.slides.push(slide_item);

	if (item.media.type == "Youtube") {
		embed = slickSlideshow.getYoutubeEmbed(item.media);
		isVideo = true;
	} 

	slide_item.video = isVideo;
	slide_item.embed = embed;
	slide_item.description = item.description;

	if (last) {
		slickSlideshow.addSlides(slickInited);
	}
};

slickSlideshow.addSlides = function(slickInited) {
	if (slickInited) {
		for (var i = 1; i < slickSlideshow.slides.length; i++) {
			if (slickSlideshow.slides[i].video != true) {
				slickSlideshow.$obj.slickAdd("<div><div class='inner-bg'><img data-lazy='"+slickSlideshow.slides[i].url+"/@@images/image/large'/></div></div>");
			} else {
				slickSlideshow.$obj.slickAdd("<div class='video-slide'><div class='inner-bg'>"+slickSlideshow.slides[i].embed+"</div></div>");
			}
		}
	} else {
		for (var i = 0; i < slickSlideshow.slides.length; i++) {
			if (slickSlideshow.slides[i].video != true) {
				slickSlideshow.$obj.append("<div><div class='inner-bg'><img data-lazy='"+slickSlideshow.slides[i].url+"/@@images/image/large'/></div></div>");
			} else {
				slickSlideshow.$obj.append("<div class='video-slide'><div class='inner-bg'>"+slickSlideshow.slides[i].embed+"</div></div>");
			}
		}

		slickSlideshow.initSlick();
		$(".slideshow-loader").fadeOut();
	}

	slickSlideshow.total_items = slickSlideshow.$obj.getSlick().$slides.length;
	$("#slideshow-controls #slide-count").html((slickSlideshow.slideCount) + "/" + slickSlideshow.total_items);
};


