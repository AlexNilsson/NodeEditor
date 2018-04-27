/* global CANVAS, d3, FLOW, NODELIST */

CANVAS.OVERLAY = {
    CONTAINER_ID: "canvasOverlay"
};

/**
 * Returns the Overlay Container as a d3 Object
 * 
 * @returns {Object}
 */
CANVAS.OVERLAY.getContainer = function() {
    
    var scope = this;

	return d3.select("#" + scope.CONTAINER_ID);
};



/**
 * Returns the real dimensions of the overlay img 
 * 
 * @returns {Object}
 */
CANVAS.OVERLAY.getImgDimensions = function() {

    var scope = this;

    var dimensions = {};

    dimensions.width =  document.getElementById( scope.CONTAINER_ID ).getElementsByTagName("img")[0].naturalWidth;
    dimensions.height = document.getElementById( scope.CONTAINER_ID ).getElementsByTagName("img")[0].naturalHeight;

	return dimensions;
};



/**
 * Hide Canvas Overlay
 * 
 * @returns {undefined}
 */
CANVAS.OVERLAY.hide = function() {
	CANVAS.OVERLAY.getContainer().classed('hidden', true);
};



/**
 * Show Canvas Overlay
 * 
 * @returns {undefined}
 */
CANVAS.OVERLAY.show = function() {
	CANVAS.OVERLAY.getContainer().classed('hidden', false);
};



/**
 * Updates the Overlay Position according to the Canvas
 * 
 * @returns {undefined}
 */
CANVAS.OVERLAY.updatePosition = function() {

    var scope = this;

    var overlay = CANVAS.OVERLAY.getContainer();

    var canvasSize = CANVAS.getSize();
    
    var imgDim = scope.getImgDimensions();

    var posLeft = ( canvasSize.width - imgDim.width ) / 2;
    var posTop = ( canvasSize.height - imgDim.height) / 2;

    overlay.style("left", posLeft + "px");
    overlay.style("top", posTop + "px");

};



/**
 * Show Initial Canvas Overlay
 * 
 * @returns {undefined}
 */
CANVAS.OVERLAY.showInitOverlay = function() {
	this.show();
};



// Hides the overlay when nodes are dragged onto it
CANVAS.OVERLAY.getContainer()
    .on("mouseover", function(){

        if ( NODELIST.hasNodeSelected ) CANVAS.OVERLAY.hide(); 

    });