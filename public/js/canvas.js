var CANVAS = {};

CANVAS.zoomValue = 1;
CANVAS.translation = new Vector2D();



/**
 * Updates the Transform on the canvas svg element
 * 
 * @returns {undefined}
 */
CANVAS.transform = function() {
    FLOW.svg.selectAll(".transformable").attr("transform","scale(" + CANVAS.zoomValue +") translate(" + CANVAS.translation.x + "," + CANVAS.translation.y + ")");
};



/**
 * Translated the canvas
 * 
 * @param {Vector2D} delta
 * @returns {undefined}
 */
CANVAS.translate = function( delta ) {

    CANVAS.translation = addVectors2D( CANVAS.translation, delta );

    CANVAS.transform();
};



/**
 * Zooms/Scales the canvas
 * 
 * @param {Number<-1/1>} direction
 * @returns {Promise<Number>} //zoom value
 */
CANVAS.zoom = function( direction ){

	var promise = new Promise( function( resolve, reject ){

		var frames = 5;
		var speed = 5; //ms

		var bit = direction * FLOW.ZOOM_STEP / frames;

		var zoomAnimation = function(){
			CANVAS.zoomValue += bit;
			CANVAS.zoomValue = parseFloat( CANVAS.zoomValue.toFixed(2) );
			
			CANVAS.transform();
		};

		var onAnimationComplete = function(){
			if ( CANVAS.zoomValue > FLOW.MAX_ZOOM ) CANVAS.zoomValue = FLOW.MAX_ZOOM;
			if ( CANVAS.zoomValue < FLOW.MIN_ZOOM ) CANVAS.zoomValue = FLOW.MIN_ZOOM;

			resolve( CANVAS.zoomValue );
		};

		for ( var i = 0; i < frames; i++ ) {
			setTimeout(zoomAnimation, speed*i);
		}
		setTimeout(onAnimationComplete, speed*frames);

	});
	
	return promise;
};



/**
 * Returns the size of the canvas
 * 
 * @returns {Object}
 */
CANVAS.getSize = function(){
	var result = {};

	var editorContainer = document.getElementById("nodeEditor");
	
	result.height = editorContainer.offsetHeight;

	result.width = editorContainer.offsetWidth;
	
	if ( NODELIST.hidden === false ) result.width -= NODELIST.nodeWidth * NODELIST.columns;

	if ( result.width < 0 ) result.width = 0;

	return result;
};



/**
 * Updates the canvas size to fit the container
 * 
 * @returns {undefined}
 */
CANVAS.updateSize = function() {

	var size = this.getSize();

	d3.select('#canvasArea').select('svg')
		.attr('width', size.width)
		.attr('height', size.height);

	CANVAS.CONTROLS.updatePosition();

	CANVAS.OVERLAY.updatePosition();
};