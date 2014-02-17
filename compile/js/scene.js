var OnSceneInfoUpdateEvent = function(app) {
    this.app = app;

//    this.onGraphDataRequest_ = function(data) {
//        $(this.app.graphWidget.CSS["LOAD"]).removeClass("onShow");
//        this.app.graphWidget.showGraph();
//        this.app.graphWidget.updateContent(data);
//    }
//
//    this.app.graphManager.getGraph(
//        this.app.graphRegionsSelectorWidget.getCurrentIds(),
//        this.app.graphParamsSelector.getCurrentIds(),
//        this.app.graphWidget.getBeginData(),
//        this.app.graphWidget.getEndData(),
//        $.proxy(this.onGraphDataRequest_, this)
//    );
}


// Example: w = new SceneInfoWidget(app); w.show();

var SceneInfoWidget = function(app) {
    this.app = app;
    this.scrollApi = null;
    this.onUpdateSceneInfo = new signals.Signal();
    this.onUpdateSceneInfo.add(OnSceneInfoUpdateEvent);

    this.CSS = {
        "MAIN": "#sceneinfo-content",
        "LOAD": "#load",
        "SCENEINFO": "#sceneinfo-panel"
    }

    this.elements = {
        "MAIN": $(this.CSS["MAIN"]),
        "SCENEINFO": $(this.CSS["SCENEINFO"])
    }

    this.onUpdateSceneInfoDispather_ = function() {
        this.onUpdateSceneInfo.dispatch(this.app);
    }

    this.show = function() {
        this.showInfo(false);
        this.elements["MAIN"].removeClass('hidden');
    }

    this.hide = function() {
        this.elements["MAIN"].addClass('hidden');
    }

    this.setContent = function (content) {
        this.elements["SCENEINFO"].html(content);
    }

    this.showInfo = function (hide) {
        if (!_.isBoolean(hide)){
          hide.preventDefault()
        }
        that = this;
        if (hide) that.elements["SCENEINFO"].addClass('hidden');
        $('#sceneinfo-main', this.elements["MAIN"]).siblings().removeClass('current');
        $('#sceneinfo-main', this.elements["MAIN"]).addClass('current');
        setTimeout(function() {
            $.get('/static/compile/scene/info.html', {}, function (data, status, jqxhr) {
                that.elements["SCENEINFO"].html(data);
                that.elements["SCENEINFO"].removeClass('hidden');
                // Page stuff
                var menu_items = $("#scene-info-selector li");
                menu_items.on('click', function (e) {
                    e.preventDefault();
                    menu_items.removeClass('current');
                    $(this).addClass('current');
                    var target = $('#'+$(this).attr('data-target'));
                    target.removeClass('hidden-left hidden-right hidden');
                    target.prevAll('section').addClass('hidden hidden-left').removeClass('hidden-right');
                    target.nextAll('section').addClass('hidden hidden-right').removeClass('hidden-left');
                });
            });
        }, (hide ? 400 : 0));
    }

    this.showMap = function (e) {
        e.preventDefault()
        that = this;
        that.elements["SCENEINFO"].addClass('hidden');
        $('#sceneinfo-map', this.elements["MAIN"]).siblings().removeClass('current');
        $('#sceneinfo-map', this.elements["MAIN"]).addClass('current');
        setTimeout(function() {
            $.get('/static/compile/scene/map.html', {}, function (data, status, jqxhr) {
                that.elements["SCENEINFO"].html(data);
                that.elements["SCENEINFO"].removeClass('hidden');
                // Map stuff
                // TODO: Map scripts
            });
        }, 400);
    }

    this.showText = function (e) {
        e.preventDefault()
        that = this;
        that.elements["SCENEINFO"].addClass('hidden')
          .html('<h1>Текст</h1>')
          .removeClass('hidden');
    }

    this.showGraph = function (e) {
        e.preventDefault()
        that = this;
        that.elements["SCENEINFO"].addClass('hidden')
          .html('<img src="/static/images/connect.png" />')
          .removeClass('hidden');
    }

    this.showDiagram = function (e) {
        e.preventDefault()
        that = this;
        that.elements["SCENEINFO"].addClass('hidden')
          .html('<h1>Диаграмма</h1>')
          .removeClass('hidden');
    }

    // Bind events to main menu
    $('#sceneinfo-main   a', this.elements["MAIN"]).on('click', $.proxy(this.showInfo, this));
    $('#sceneinfo-map    a', this.elements["MAIN"]).on('click', $.proxy(this.showMap, this));
    $('#sceneinfo-forces a', this.elements["MAIN"]).on('click', $.proxy(this.showForces, this));

}

var OnSceneInfoExtraUpdateEvent = function(app) {
    this.app = app;

//    this.onGraphDataRequest_ = function(data) {
//        $(this.app.graphWidget.CSS["LOAD"]).removeClass("onShow");
//        this.app.graphWidget.showGraph();
//        this.app.graphWidget.updateContent(data);
//    }
//
//    this.app.graphManager.getGraph(
//        this.app.graphRegionsSelectorWidget.getCurrentIds(),
//        this.app.graphParamsSelector.getCurrentIds(),
//        this.app.graphWidget.getBeginData(),
//        this.app.graphWidget.getEndData(),
//        $.proxy(this.onGraphDataRequest_, this)
//    );
}

// Example: wx2 = new SceneInfoExtraWidget(app, {MAIN: '#sceneinfo-extra-2'}); wx2.show();

// _.each([1,2,3,4,5,6], function(i){ w = new SceneInfoExtraWidget(app, {MAIN: '#sceneinfo-extra-'+i}); w.show();})

var SceneInfoExtraWidget = function(app, options) {
    this.app = app;
    this.onUpdateSceneInfoExtra = new signals.Signal();
    this.onUpdateSceneInfoExtra.add(OnSceneInfoExtraUpdateEvent);

    this.CSS = jQuery.extend({
        "MAIN": "#sceneinfo-extra-1",
        "LOAD": "#load",
        "ONSHOW": function() {},
        "ONHIDE": function() {},
        "ONCLICK": function() {}
    }, options);

    this.elements = {
        "MAIN": $(this.CSS["MAIN"]),
        "SCENEINFO": $('.sceneinfo-extra-panel', this.CSS["MAIN"])
    }

    this.onUpdateSceneInfoExtraDispather_ = function() {
        this.onUpdateSceneInfoExtra.dispatch(this.app);
    }

    this.show = function() {
        this.elements["MAIN"].removeClass('hidden');
        this.CSS["ONSHOW"]();
    }

    this.hide = function() {
        this.elements["MAIN"].addClass('hidden');
        this.CSS["ONHIDE"]();
    }

    this.setContent = function (content) {
        this.elements["SCENEINFO"].html(content);
    }

    this.elements["MAIN"].on('click', $.proxy(this.CSS["ONCLICK"], this));

}
