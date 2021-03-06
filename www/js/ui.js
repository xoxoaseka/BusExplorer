/**
#
# DOT Time Tool, based on Pluto data viewer
#
*/

bus.Ui = function() {
    // exported api object
    var exports = {};

    // creates the add cart button
    function addHistogramCard(parentDiv){
        var buttonId = "addHistCard";

        // adds the button
        var btn = bus.UiParts.Button(parentDiv,buttonId, "glyphicon glyphicon-stats");

        btn.on('click', function(){

            // increments the number of active cards
            bus.globalCardId += 1;

            // creates a new card
            var card = new bus.PlotCard("barchart");
            // creates the card
            card.initCard();
        });
    }


    // creates the add cart button
    function addBoxPlotCard(parentDiv){
        var buttonId = "addBoxPlotCard";

        // adds the button
        var btn = bus.UiParts.Button(parentDiv,buttonId, "fa fa-minus-square-o","leftSpace");

        btn.on('click', function(){

            // increments the number of active cards
            bus.globalCardId += 1;

            // creates a new card
            var card = new bus.PlotCard("boxplot");
            // creates the card
            card.initCard(true);
        });
    }

    // creates the add cart button
    function addFilterCard(parentDiv){
        var buttonId = "addFilterCard";

        // adds the button
        var btn = bus.UiParts.Button(parentDiv,buttonId, "glyphicon glyphicon-list-alt","leftSpace");

        btn.on('click', function(){

            if(bus.filterCard != null) {
                bus.filterCard.closeCard();
                bus.filterCard = null;
                return;
            }

            // increments the number of active cards
            bus.globalCardId += 1;

            // creates a new card
            bus.filterCard = new bus.FilterCard();
            // creates the card
            bus.filterCard.initCard(true);
        });
    }

    // creates the add cart button
    function addExportCard(parentDiv){
        var buttonId = "addExportCard";

        // adds the button
        var btn = bus.UiParts.Button(parentDiv,buttonId, "glyphicon glyphicon-picture","leftSpace");

        btn.on('click', function(){
            bus.map.saveImage();
        });
    }

    // creates the path Selector
    function pathSelector(parentDiv){
        var dropId = "pathSelector";

        // adds the drop down
        var drop = bus.UiParts.DropDown(parentDiv,dropId,"leftSpace");

        // gets the list
        var ul = drop.select("ul");
        // sets the button label
        drop.select("button").html("Selection");

        // binds json to items and appends
        ul.selectAll("li")
            .data(bus.availableLionNames)
            .enter()
            .append('li')
            .html(function(d) { return '<a href="#">' + d + '</a>'; })
            .style("color", "black");

        // updates the button when selecting an item
        ul.selectAll("li")
            .on('click', function(d){
                bus.selectedLionName = d;

                // already loaded
                var index = bus.loadedLions.indexOf(d);
                if( index < 0 ) {
                    d3.select(this).select("a").style("color", "red");
                    __sig__.emit(__sig__.loadDataSet);
                }
                // changes selected
                else {
                    bus.map.removeGeoJSON(d);
                    bus.loadedLions.splice(index, 1);
                    d3.select(this).select("a").style("color", "black");
                    return;
                }

                if(bus.pathCard == null) {
                    bus.pathCard = new bus.PathCard();
                }
                if(bus.pathCard.showed == false) {
                    bus.pathCard.initCard(true);
                }
            });
    }

    // creates the path Selector
    function lineSelector(parentDiv){
        var dropId = "lineSelector";

        // adds the drop down
        var drop = bus.UiParts.DropDown(parentDiv,dropId,"leftSpace");

        // gets the list
        var ul = drop.select("ul");
        // sets the button label
        drop.select("button").html("Bus routes");

        // binds json to items and appends
        ul.selectAll("li")
            .data(bus.availableLineNames)
            .enter()
            .append('li')
            .html(function(d) { return '<a href="#">' + d + '</a>'; })
            .style("color", "black");

        // updates the button when selecting an item
        ul.selectAll("li")
            .on('click', function(d){
                bus.selectedLineName = d;

                // already loaded
                var index = bus.loadedLines.indexOf(d);
                if( index < 0 ) {
                    d3.select(this).select("a").style("color", "red");
                    __sig__.emit(__sig__.loadDataSet);
                }
                // changes selected
                else {
                    bus.map.removeLine(d);
                    bus.loadedLines.splice(index, 1);
                    d3.select(this).select("a").style("color", "black");
                    return;
                }

                if(bus.pathCard == null) {
                    bus.pathCard = new bus.PathCard();
                }
                if(bus.pathCard.showed == false) {
                    bus.pathCard.initCard(true);
                }
            });
    }

    exports.clearPaths = function() {
        d3.select("#lineSelector").selectAll("li").select("a").style("color", "black");
        d3.select("#pathSelector").selectAll("li").select("a").style("color", "black");
    }

    // creates the add cart button
    function addProperty(parentDiv){
        var buttonId = "addProp";

        // adds the button
        var btn = bus.UiParts.Button(parentDiv, buttonId, "glyphicon glyphicon-repeat");

        btn.on('click', function(){
            // send a signal updating colors over the map
            __sig__.emit(__sig__.loadFunctionView);
        });
    }

    // creates the bus Selector
    function renderFunctionSelector(parentDiv){
        var dropId = "renderFunctionSelector";

        // adds the drop down
        var drop = bus.UiParts.DropDown(parentDiv,dropId,"leftSpace");

        // gets the list
        var ul = drop.select("ul");
        // sets the button label
        drop.select("button").html("Color dimension");

        // binds json to items and appends
        ul.selectAll("li")
            .data(bus.availableFunctionNames[0])
            .enter()
            .append('li')
            .html(function(d) { return '<a href="#">' + d + '</a>'; });


        // updates the button when selecting an item
        ul.selectAll("li")
            .on('click', function(d){
                d3.select('#'+ dropId +' button').html(d);
                bus.selectedFunctionName = d;
            });
    }

    // color pallet
    function addSpeedColorPallet(parentDiv){
        var cScale = new bus.ColorScale();
        cScale.drawColorScale(parentDiv, "speedColorscale", "Speed (mph)", [0,26], true);
    }

    function addDwellTimeColorPallet(parentDiv){
        var cScale = new bus.ColorScale();
        cScale.drawColorScale(parentDiv, "dwellTimeColorscale", "Dwell time (s)", [0,300], false);
    }

    // creates the main menu
    function initMainMenu(){
        // gets the main div
        var mainMenu = d3.select("#mainMenu");

        // creates the add card button
        addHistogramCard(mainMenu);
        // creates the add card button
        addBoxPlotCard(mainMenu);
        // creates the add filter button
        addFilterCard(mainMenu);
        // creates the add filter button
        addExportCard(mainMenu);
        // creates the bus selector
        pathSelector(mainMenu);
        lineSelector(mainMenu);
        // creates the bus selector
        // busSelectorCompare(mainMenu);
    }

    // creates the render menu
    function initRenderMenu(){
        // gets the main div
        var renderMenu = d3.select("#renderMenu");

        // creates the add prop button
        // addProperty(renderMenu);
        // creates the pallet
        addSpeedColorPallet(renderMenu);
        addDwellTimeColorPallet(renderMenu);
        // creates the bus selector
        // renderFunctionSelector(renderMenu);
    }

    // creates all menus
    exports.initMenus = function(){
        initMainMenu();
        initRenderMenu();
    };

    // load available bus json names
    exports.loadAvailableNames = function(){
        // gets json to build the interface
        __sig__.emit(__sig__.availableNames);
    };

    // returns the api
    return exports;
};