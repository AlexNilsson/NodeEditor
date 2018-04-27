/* global window, d3, C, EventNode, ActionNode, ConditionNode, Vector2D, FLOW */

// handles to link and node element groups
FLOW.gConnections 	= FLOW.svg.append('svg:g').attr("class", "transformable connectionContainer").selectAll('path');
FLOW.gNodes 		= FLOW.svg.append('svg:g').attr("class", "transformable nodeContainer").selectAll('g');

FLOW.nodes = [];
FLOW.connections = [];
FLOW.nodeProperties = {};

FLOW.status = FLOW.DEFAULT_STATUS;

// mouse event vars
var mousedown_node;
var mouseup_node;
var mousedown_bg;
var mouseover_node;

var dashConnector;
var dashConnectorPos;

var buttonIsPressed = false;
var linkDrag = false;
var nodeMoved;

var grabOffset = new Vector2D();
var pendingAction;
var activeConnector;

var connectionPendingDelete = false;


/**
 * Clears state variables
 * 
 * 	@returns {undefined}
 */
FLOW.resetMouseVars = function() {
	
  	mousedown_node = false;
  	mouseup_node = false;
	mousedown_bg = false;
	
	dashConnector = undefined;
	dashConnectorPos = undefined;

	buttonIsPressed = false;
	linkDrag = false;
	nodeMoved = false;

	d3.selectAll("#tempId").remove();

	grabOffset = new Vector2D();
	pendingAction = undefined;
	activeConnector = undefined;
};


/**
 * Dropps all nodes or connections being dragged
 * Used to let go of components as the cursor leaves the canvas.
 * 
 * 	@returns {undefined}
 */
FLOW.stopDragging = function(){

	if( mousedown_node && !linkDrag ){

		FLOW.resetMouseVars();
	}
	if( linkDrag ) {
		d3.select( '#' + activeConnector.id ).classed('hidden', false);
		d3.select( '#' + activeConnector.id + "-helper" ).classed('hidden', false);
		
		FLOW.resetMouseVars();
		d3.selectAll(".dragline").classed('hidden', true);
		d3.select("#dragLine-label").remove();
	}
};



/**
 * Retrieves a Node by id
 * 
 * @param {String} node_id 
 * @returns {Node}
 */
FLOW.getNode = function( node_id ) {
	return FLOW.nodes.filter( function( node ) { return node.id === node_id; })[0];
};



/**
 * Retrieves a Connection node by id
 * 
 * @param {String} connection_id 
 * @returns {Node}
 */
FLOW.getConnection = function( connection_id ) {
	return FLOW.connections.filter( function( connection ) { return connection.id === connection_id; })[0];
};



/**
 * Adds a Connection between two nodes
 * 
 * @param   {Node} a 
 * @param   {Node} b 
 * @returns {false || undefined}
 */
FLOW.connectNodes = function ( a, b ) {

    // a node can not connect to itself
    if ( a.id === b.id ) return false;

    // only connect a to b if a has tags allowed by b
    if ( UTILITY.hasCommonEntry( a.tags, b.allowedConnections ) === false ) return false;

    var connection = new Connection( a.id, b.id );

    connection.color = activeConnector.color;
    connection.event = activeConnector.event;

	activeConnector.connection = connection.id;

    FLOW.connections.push( connection );
    
    FLOW.updateState();
};



/**
 * Returns true if the FLOW is in a Published state.
 * 
 * @returns {Boolean}
 */
FLOW.isPublished = function(){
	return !!FLOW.PUBLISHED_STATES.find( function(x) { return x === FLOW.status; } );
};



/**
 * Returns the FLOW's current state
 * 
 * @returns {String}
 */
FLOW.getStatus = function(){
	return FLOW.status;
};



/**
 * Sets the state of the FLOW and updates the view
 * 
 * @param 	{String} status
 * @returns {undefined}
 */
FLOW.setStatus = function( status ){

	FLOW.status = status;

	FLOW.updateState();

};


/**
 * Initializes a new flow
 * 
 * @returns {undefined}
 */
FLOW.init = function(){

	FLOW.resetMouseVars();

	CANVAS.updateSize();

	CANVAS.transform();

	FLOW.updateState();

	console.log("Flow ready!");
};


//* APP START
FLOW.init();