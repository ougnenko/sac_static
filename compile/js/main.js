/**
 * [ description]
 * @return {[type]} [description]
 */
var VideoPlayer = function() {
	this.CSS = {
		"BG": "bg-video",
		"VIDEO": "video",
		"HEADER": "header",
		"SVG": "#bg-svg"
	}
	this.elements = {
		"BG": document.getElementById(this.CSS["BG"]),
		"VIDEO": document.getElementById(this.CSS["VIDEO"]),
		"HEADER": $(this.CSS["HEADER"]),
		"SVG": $(this.CSS["SVG"])
	}

	this.video = $("#video");
	this.endedCallback = {};

	this.onTimeupdate_ = function(e) {
		if(e.currentTarget.duration - e.currentTarget.currentTime < 0.2) {
			e.currentTarget.pause();
			this.endedCallback();
      this.video.off('playing');
		}
	}

	this.video.on('timeupdate', $.proxy(this.onTimeupdate_, this));

	this.play = function(videoPath, config) {
		this.video.attr("src", videoPath);

		if(config && config.poster) {
			this.video.attr("poster", config.poster);	
		}
		
		if(config && config.onEndedCallback) {
			this.endedCallback = config.onEndedCallback;
		}
	  this.video.on('playing', function(){if (config.map) {config.map.setBgImage()}});
		
		this.video[0].load();
		this.video[0].play();
		$(this.elements["BG"]).show();
	}

	this.hide = function() {
		$(this.elements["BG"]).hide();
	}
}

/**
 * [MiniMapWriter Работает с отображением и логикой мини карты слева]
 */
var MiniMapWriter = function() {
	this.CSS = {
		"CONTAINER": "#miniMap",
		"TEXT": " a"
	}
	this.elements = {
		"CONTAINER": $(this.CSS["CONTAINER"]),
		"TEXT": $(this.CSS["CONTAINER"]+this.CSS["TEXT"])
	}

	this.show = function(imagePath, callback) {
		this.elements["CONTAINER"].addClass("onShow");
		this.elements["TEXT"].css("backgroundImage", "url('"+imagePath+"')");
		this.elements["CONTAINER"].off("click");
		this.elements["CONTAINER"].on("click", callback);
	}

	this.hiden = function() {
		this.elements["CONTAINER"].removeClass("onShow");
		this.elements["TEXT"].css("backgroundImage", "none");
		this.elements["CONTAINER"].off("click");
	}

	this.opacityHidden = function() {
		this.elements["CONTAINER"].removeClass("onShow");
	}

	this.opacityShow = function() {
		this.elements["CONTAINER"].addClass("onShow");
	}

	this.setText = function(text) {
		this.elements["TEXT"].html(text);
	}
}

/**
 * [LoadingState description]
 * @param {[type]} app [description]
 */
var LoadingState = function(app) {
	this.app = app;
	this.stateCSS = {
		"BG-IMAGE": "#bg-image",
		"NAV-ELEMENTS": ".nav-elements",
		"LOADER": "#load",
		"LOAD-IMAGE": "#load-image",
		"LOADING-TEXT": "#loading"
	}
	this.animateSpeed = 2000;

	this.elements = {
		"BG-IMAGE": $(this.stateCSS["BG-IMAGE"]),
		"NAV-ELEMENTS": $(this.stateCSS["NAV-ELEMENTS"]),
		"LOADER": $(this.stateCSS["LOADER"]),
		"LOAD-IMAGE": $(this.stateCSS["LOAD-IMAGE"]),
		"LOADING-TEXT": $(this.stateCSS["LOADING-TEXT"])
	}

	this.run = function() {
		this.elements["BG-IMAGE"].addClass("blur");
		this.elements["BG-IMAGE"].css("backgroundImage", "url('/static/images/map/100.png')");
		this.elements["LOADER"].addClass("onShow");
	}

	this.stop = function(callback) {
		this.elements["BG-IMAGE"].removeClass("blur");
		this.elements["NAV-ELEMENTS"].addClass("onShow");
		this.elements["LOADER"].removeClass("onShow");

		if(callback) {
			callback();	
		}
	}

	this.updateText = function(currentFile, allFile) {
		this.elements["LOADING-TEXT"].html("");
		this.elements["LOADING-TEXT"].html('Загружено: '+parseInt(currentFile)+' из '+ allFile +' </p>');
	}

	this.clearText = function() {
		this.elements["LOADING-TEXT"].html("");
	}
}

/**
 * [Application description]
 */
var Application = function() {
	this.appSize = [1920, 1080];
	this.currentRegion = 100;
	this.maxZoom = 3;
	this.russianId = 100;

	this.apiHost = ConfigApp["API-HOST"];

	this.loadingState = new LoadingState(this);
	this.configManager = new ConfigManager(this, ConfigApp);
	this.appTimer = new AppTimer(this);
	this.footerNavWidget = new FooterNavWidget(this);

	this.allCacheFile = $(ConfigApp["PRELOAD"]).size();
	this.cachedFile = 0;
	this.res = {};

	var self = this;

	this.getResByPath = function(path) {
		return path;
	}
	
	this.CSS = {
		"APP": "#app",
		"TITLE": "h1"
	}
	this.elements = {
		"APP": $(this.CSS["APP"]),
		"TITLE": $(this.CSS["TITLE"])
	}

	this.run = function() {
		this.loadingState.run();
		this.appTimer.run();

		this.regionManager = new RegionManager(this);
		this.paramsManager = new ParamsManager(this);
		this.legendManager = new LegendManager(this);
		this.graphManager = new GraphManager(this);
		this.regionsManagerLocal = new RegionsManagerLocal(this);
		this.dictionaryManager = new DictionaryManager(this);

		this.initResource_();
	}

	// загружаем ресурсы
	this.initResource_ = function() {
		ImgCache.init(function(){
			$.each(ConfigApp["PRELOAD"],function(key, value) {
				ImgCache.isCached(value, function(e, state, file) {
					if(state == false) {
						ImgCache.cacheFile(value, function(file) {
							self.loadingState.updateText(self.cachedFile, self.allCacheFile);
							self.res[value] = file;
							self.cachedFile = self.cachedFile + 1;
							if(self.allCacheFile == self.cachedFile) {
								self.onCacheLoaded_();
							}
						}, function() {
							self.loadingState.updateText(self.cachedFile, self.allCacheFile);
							self.res[value] = file;
							self.cachedFile = self.cachedFile + 1;
							if(self.allCacheFile == self.cachedFile) {
								self.onCacheLoaded_();
							}
							//location.reload();
						});
					} else {
						self.loadingState.updateText(self.cachedFile, self.allCacheFile);
						self.res[e] = file;
						self.cachedFile = self.cachedFile + 1;
					}
					
					if(self.allCacheFile == self.cachedFile) {
						self.onCacheLoaded_();
					}
				});
			});
		});

		$(document).on("keydown", function(e) {
	        if (e.keyCode == 82 && e.altKey) {
	           ImgCache.clearCache(function() {
	           	location.reload();
	           });
	        }
	    });
	}

	this.init = function() {
		$(this.elements["APP"]).width(this.appSize[0]).height(this.appSize[1]);
	}

	this.onCacheLoaded_ = function() {
		this.loadingState.clearText();
		this.loadingState.stop();

		this.videoPlayer = new VideoPlayer();
		
		this.ageSelectorReportsWidget = new YearSelectWidget(this, {
			years: [2014, 2013, 2012, 2011, 2010, 2009, 2008],
			selectedYear: 2012,
			container: "#reposrts-params-age-selected",
			onAfterYearSelected: $.proxy(this.onFormatUpdateContentEventBind_, this)
		});


		this.legendWidget = new LegendWidget(this);
		this.regionsLegendWidget = new RegionsLegendWidget(this);
		//this.eventsLegendWidget = new EventsLegendWidget(this);
		this.pageTitleWidget = new PageTitleWidget(this);
		
    /*
		this.eventsDrawWidget = new EventsDrawWidget(this);
		this.formatManager = new FormatManager(this);
		this.reportsParamsSelector = new ReportsParamsSelector(this);
		this.reportsDiscSelector = new ReportsDiscSelector(this);
		this.reportsWidget = new ReportsWidget(this);
    */

    this.panels = {
      'EVENTS':     new EventsPanel(this),
      'REGIONS':    new RegionPanel(this),
      /*'DISTRICTS':  new DistrictsPanel(this),
      'FORMATS':    new FormatsPanel(this),
      'GRAPHS':     new GraphPanel(this),
      'REPORTS':    new ReportsPanel(this)*/
    };

		this.footerNavWidget.draw();
		this.loadingState.stop();

    // открываем первую панель
    this.footerNavWidget.elements['MAIN'].find('a').first().click()
	}

	this.setAppTitle = function(title) {
		this.elements["TITLE"].html(title);
	}

	this.init();
}

$(document).ready(function() {
	var application = new Application();
	application.run();
})
