CANVAS.CONTROLS = {
    ZOOM_BUTTON_WIDTH: 40,
    ZOOM_BUTTON_ICON_COVERAGE: 0.6,
    ZOOM_PLUS_ICON: 'icons/zoom-plus.svg',
    ZOOM_MINUS_ICON: 'icons/zoom-minus.svg'
};


//* SETUP CANVAS CONTROLS
FLOW.canvasControls = d3.select('#canvasControls')
    .style('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH + "px")
    .on('mouseover', function(){
        FLOW.stopDragging();
    });

FLOW.canvasControls.svg = FLOW.canvasControls.append('svg')
    .attr('xmlns',"http://www.w3.org/2000/svg")
    .attr('oncontextmenu', 'return false;')
    .style('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH + "px")
    .style('height', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH*2 + "px");

//* ZOOM +/- CONTROLS
FLOW.canvasControls.zoom = FLOW.canvasControls.svg.append('svg:g');
FLOW.canvasControls.zoom.pendingAction = false;

//* DEF: ZOOM IN
FLOW.canvasControls.zoom.inProto = FLOW.canvasControls.zoom
.append('svg:def')
    .append('svg:g')
        .attr('id','defZoomInButton');

FLOW.canvasControls.zoom.inProto
    .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH)
        .attr('height', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH)
        .style('fill',"#f5f5f5")
        .style('stroke-width', 1)
        .style('stroke', "#cccbcb")
        .attr('y',0);

FLOW.canvasControls.zoom.inProto
    .append('image')
        .attr('xlink:href', CANVAS.CONTROLS.ZOOM_PLUS_ICON )
        .attr('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE )
        .attr('height', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE )
        .attr('x', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * ( 1 - CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE ) / 2 )
        .attr('y', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * ( 1 - CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE ) / 2 )
        .style('opacity', 0.3);

//* DEF: ZOOM OUT
FLOW.canvasControls.zoom.outProto = FLOW.canvasControls.zoom
.append('svg:def')
    .append('svg:g')
        .attr('id','defZoomOutButton');

FLOW.canvasControls.zoom.outProto
    .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH)
        .attr('height', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH)
        .style('fill',"#f5f5f5")
        .style('stroke-width', 1)
        .style('stroke', "#cccbcb")
        .attr('y',0);

FLOW.canvasControls.zoom.outProto
    .append('image')
        .attr('xlink:href', CANVAS.CONTROLS.ZOOM_MINUS_ICON )
        .attr('width', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE )
        .attr('height', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE )
        .attr('x', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * ( 1 - CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE ) / 2 )
        .attr('y', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH * ( 1 - CANVAS.CONTROLS.ZOOM_BUTTON_ICON_COVERAGE ) / 2 )
        .style('opacity', 0.3);




CANVAS.CONTROLS.zoom = function( direction ){

    var button = FLOW.canvasControls.zoom.pendingAction;

    CANVAS.zoom( direction ).then( function( zoom ){

        if ( zoom >= FLOW.MAX_ZOOM ) {
            d3.select(button).classed('disabled', true);
        }
        else if ( zoom <= FLOW.MIN_ZOOM ) {
            d3.select(button).classed('disabled', true);
        }
        else {
            d3.selectAll(".canvasControl.zoom").classed('disabled', false);
        }
    });
};

CANVAS.CONTROLS.zoomIn = function(){ return CANVAS.CONTROLS.zoom(1); };
CANVAS.CONTROLS.zoomOut = function(){ return CANVAS.CONTROLS.zoom(-1); };

//* SETUP BUTTONS
FLOW.canvasControls.zoom.append('svg:g').attr('class','button canvasControl zoom')
    .on('mousedown', function(){
        FLOW.canvasControls.zoom.pendingAction = this;
    })
    .on('mouseup', function(){
        if ( FLOW.canvasControls.zoom.pendingAction === this && this.classList.contains('disabled') === false ) CANVAS.CONTROLS.zoomIn();
    })
    .on('mouseout', function(){
        FLOW.canvasControls.zoom.pendingAction = false;
    })
    .append('use')
        .attr('xlink:href', '#defZoomInButton')
        .attr('y', 0);


FLOW.canvasControls.zoom.append('svg:g').attr('class','button canvasControl zoom')
    .on('mousedown', function(){
        FLOW.canvasControls.zoom.pendingAction = this;
    })
    .on('mouseup', function(){
        if ( FLOW.canvasControls.zoom.pendingAction === this && this.classList.contains('disabled') === false ) CANVAS.CONTROLS.zoomOut();
    })
    .on('mouseout', function(){
        FLOW.canvasControls.zoom.pendingAction = false;
    })
    .append('use')
        .attr('xlink:href', '#defZoomOutButton')
        .attr('y', CANVAS.CONTROLS.ZOOM_BUTTON_WIDTH);



/**
 * Updates the position of the controls according to the canvas size
 * 
 * @param {Object} canvasSize
 * @returns {undefined} 
 */
CANVAS.CONTROLS.updatePosition = function(){

    var canvasSize = CANVAS.getSize();

    FLOW.canvasControls.style('bottom', '5px');
    
    if ( NODELIST.hidden ) {
        FLOW.canvasControls.style('right', 12 + "px");
    }
    else {
        FLOW.canvasControls.style('right', document.getElementById("nodeList").offsetWidth + 12 + "px");
    }
};

CANVAS.CONTROLS.updatePosition();