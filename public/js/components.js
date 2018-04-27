/* global FLOW, UTILITY, Vector2D */

/**
 * Constructs a Node
 * 
 * @param 	{Object} args
 * @returns {Node}
 */
var Node = function ( args ) {
	args = args || {};

	
	this.id 					= args.id 					|| UTILITY.randomId();
	this.type					= args.type					|| "generic";
	this.shape 					= args.shape 				|| "roundedBox";
	this.icon 					= args.icon 				|| "contact.svg";
	this.title 					= args.title 				|| "Contact Tagged";
	this.subTitle 				= args.subTitle 			|| "click to configure";
	this.connectors 			= args.connectors 			|| [];
	this.buttons 				= args.buttons 				|| [];
	this.tags 					= args.tags 				|| [];
	this.allowedConnections 	= args.allowedConnections 	|| [];
	this.position 				= args.position 			|| new Vector2D();
	this.configured 			= args.configured 			|| false;
	this.socket 				= args.socket 				|| new Vector2D(0, FLOW.NODE_WIDTH/2);
	this.color					= args.color				|| FLOW.C.BLUE;

	if ( args.publishedButtons !== undefined ) this.buttons = this.buttons.concat( args.publishedButtons );
};

/**
 * Returns a connector by connection id
 * 
 * @param {String} connection_id 
 * @returns {Connector}
 */
Node.prototype.getConnectorForConnection = function( connection_id ) {
	return this.connectors.filter( function( connector ){ return connector.connection === connection_id })[0];
};



/**
 * Hides all buttons
 * (except for the ones set to always be visible)
 * 
 * @returns {undefined}
 */
Node.prototype.hideButtons = function(){

	var scope = this;

	scope.buttons.forEach( function( button ){
		if ( button.alwaysVisible === false ) {
			d3.select( "#" + scope.id ).select( '#' + button.id ).style('visibility','hidden');
		}
	});
};



/**
 * Updates the state of the node and redraws
 * 
 * 	@returns {undefined}
 */
Node.prototype.updateState = function() {
	this.hideButtons();

	FLOW.updateState();
};



/**
 * Sets the node's position and updates the view model
 * 
 * @param 	{Vector2D} position
 * @returns {undefined} 
 */
Node.prototype.setPosition = function( position ) {

	var scope = this;

	scope.position = position;

	d3.select('#' + scope.id )
		.attr('transform', 'translate(' + scope.position.x + ',' + scope.position.y + ')');

};



/**
 * Translates the node a given delta
 * 
 * @param 	{Vector2D} delta
 * @returns {undefined} 
 */
Node.prototype.translate = function( delta ) {
	
	var scope = this;

	scope.setPosition( addVectors2D( scope.position, delta ) );

};


/**
 * Returns the Node's stored id
 * 
 * @returns {String}
 */
Node.prototype.getId = function( args ){

	var scope = this;

	args = args || {};

	var useMap = ( args.useMap !== undefined ) ? args.useMap : true;

	var id = scope.id;

	if ( useMap && FLOW.ID_MAP !== undefined ) {

		var index = Object.values( FLOW.ID_MAP ).indexOf( scope.id );

		if ( index >=0 ) id = Object.keys( FLOW.ID_MAP )[index];
	}

	return id;
};



/**
 * Returns the nodes center position
 * 
 * @returns {Vector2D}
 */
Node.prototype.getCenter = function(){

	var scope = this;

	var center =  scope.position.clone().add( FLOW.NODE_WIDTH / 2 );

	return center;
};



/**
 * Returns a list of all the Node's connections
 * 
 * @returns {Array} Connection
 */
Node.prototype.getConnections = function(){

	var scope = this;

	var connections = FLOW.connections.filter( function ( connection ) {
		
		var isRelatedNode =
		( connection.source === scope.id ) ||
		( connection.target === scope.id );
		
		return ( isRelatedNode );
	});

	return connections;

};



/**
 * Returns the source point on this node's periphery
 * for a connection to the specified target
 * 
 * @param {Vector2D} target 
 * @returns {Vector2D}
 */
Node.prototype.getConnectionSourcePointForTarget = function( target ){
	
	var scope = this;
	
	var nodeCenter = scope.getCenter();

	var connectionAngle = subVectors2D( target, nodeCenter ).getAngle();

	var centerOffset = scope.getBoundaryVector( connectionAngle );
	
	var sourcePoint = addVectors2D( nodeCenter, centerOffset );

	return sourcePoint;
};
		


/**
 * Returns a vector from the center of the node to
 * its boundary with the specified angle.
 * 
 * @param 	{Number} angle
 * @returns {Vector2D}
 */
Node.prototype.getBoundaryVector = function( angle ){

	var scope = this;

	var nodeShape = scope.shape;

	var boundaryVector;

	switch( nodeShape ){

		default:
		case "circle":

			var radius = FLOW.NODE_WIDTH / 2;

			boundaryVector = new Vector2D( Math.cos( angle ), Math.sin( angle ) );

			boundaryVector.scale( radius );

		break;

		case "roundedBox":

			var R = FLOW.NODE_WIDTH / 2;
			var r = FLOW.NODE_ROUNDED_BOX_RADIUS;

			var generateBaseBoundaryVector = function( angle ) {

				var edgeDist = Math.tan( angle ) * R;
				
				var over_shoot = R - Math.abs( edgeDist );

				var sign = Math.sign( edgeDist );
				
				var a = sign * Math.atan( 1 - over_shoot / r );

				var dr = R - r;
				
				var rx = r * Math.cos(a);
				var ry = r * Math.sin(a);

				if ( over_shoot < r ) {
					
					boundaryVector = new Vector2D( dr + rx, sign * dr + ry );

				} else {

					boundaryVector = new Vector2D( R, edgeDist );

				}

				return boundaryVector;
			};



			// Right
			if ( angle >= -Math.PI/4 && angle < Math.PI/4 ) {

				var baseBoundaryVector = generateBaseBoundaryVector( angle );

				boundaryVector = baseBoundaryVector;

			}

			// Left
			if ( angle >= 3*Math.PI/4 || angle < -3*Math.PI/4 ) {

				var baseBoundaryVector = generateBaseBoundaryVector( angle );

				boundaryVector = baseBoundaryVector.scale(-1);

			}

			// Top
			if ( angle >= -3*Math.PI/4 && angle < -Math.PI/4 ) {

				var baseBoundaryVector = generateBaseBoundaryVector( angle + Math.PI/2 );

				boundaryVector = new Vector2D( baseBoundaryVector.y, -baseBoundaryVector.x );

			}

			// Bottom
			if ( angle >= Math.PI/4 && angle < 3*Math.PI/4 ) {

				var baseBoundaryVector = generateBaseBoundaryVector( angle + Math.PI/2 );

				boundaryVector = new Vector2D( 1 - baseBoundaryVector.y, baseBoundaryVector.x );

			}

		break;

		case "octagon":

			var radius = FLOW.NODE_WIDTH / 2;

			var edgeDist = radius * Math.tan( angle );

			boundaryVector = new Vector2D(100,100);

			// Right
			if ( angle >= -Math.PI/8 && angle < Math.PI/8 ) {

				boundaryVector = new Vector2D( radius, radius * Math.tan( angle ) );

			}

			// Left
			if ( angle >= 7*Math.PI/8 || angle < -7*Math.PI/8 ) {
			
				boundaryVector = new Vector2D( - radius, 1 - radius * Math.tan( angle ) );

			}

			// Top
			if ( angle >= -5*Math.PI/8 && angle < -3*Math.PI/8 ) {
			
				boundaryVector = new Vector2D( radius * Math.tan( angle + Math.PI/2 ), -radius );

			}

			// Bottom
			if ( angle >= 3*Math.PI/8 && angle < 7*Math.PI/8 ) {
			
				boundaryVector = new Vector2D( -radius * Math.tan( angle + Math.PI/2 ), radius );

			}

			var halfSideDist = radius * Math.tan( Math.PI/8 );
			var hyp = radius / Math.cos( Math.PI/8 );

			var sign = Math.sign( Math.cos(angle) * Math.sin(angle) );
			
			var a = angle - sign * Math.PI/8;
			
			var x = hyp * Math.sin(a) / ( Math.SQRT2 * Math.sin( (5*Math.PI/8) - sign * a) );

			// Top-Right
			if ( angle >= -3*Math.PI/8 && angle < -1*Math.PI/8 ) {
				
				boundaryVector = new Vector2D( 
					Math.sign( Math.cos(angle) ) * radius - Math.sign( Math.sin(angle) ) * x,
					Math.sign( Math.sin(angle) ) * halfSideDist + Math.sign( Math.cos(angle) ) * x
				);

			}

			// Top-Left
			if ( angle >= -7*Math.PI/8 && angle < -5*Math.PI/8 ) {
				
				boundaryVector = new Vector2D(
					Math.sign( Math.cos(angle) ) * radius - Math.sign( Math.sin(angle) ) * x,
					Math.sign( Math.sin(angle) ) * halfSideDist + Math.sign( Math.cos(angle) ) * x
				);

			}

			// Bottom-Left
			if ( angle >= 5*Math.PI/8 && angle < 7*Math.PI/8 ) {

				boundaryVector = new Vector2D(
					Math.sign( Math.cos(angle) ) * radius - Math.sign( Math.sin(angle) ) * x,
					Math.sign( Math.sin(angle) ) * halfSideDist + Math.sign( Math.cos(angle) ) * x
				);

			}

			// Bottom-Right
			if ( angle >= 1*Math.PI/8 && angle < 3*Math.PI/8 ) {

				boundaryVector = new Vector2D(
					Math.sign( Math.cos(angle) ) * radius - Math.sign( Math.sin(angle) ) * x,
					Math.sign( Math.sin(angle) ) * halfSideDist + Math.sign( Math.cos(angle) ) * x
				);

			}
			

		break;
	}

	return boundaryVector;
};



/**
 * Check all connections tied to this node and if
 * any connection falls within the set snap angle
 * move the node to straighten that connection
 * 
 * A.K.A the OCD feature
 * 
 * @returns {undefined}
 */
Node.prototype.snapIntoPosition = function(){

	var scope = this;

	var nodeConnections = mousedown_node.getConnections();
	
	for ( var i = 0; i < nodeConnections.length; i++ ){

		var connectionAngle = toDeg( nodeConnections[i].getAngle() ) % 90;
		
		// Adjust angle to closest axis
		if ( Math.abs( connectionAngle ) > 45 ) connectionAngle -= Math.sign( connectionAngle ) * 90;

		if ( Math.abs( connectionAngle ) <= FLOW.SNAP_ANGLE ) {

			// Sign switch to account for connection direction
			if ( scope.id === nodeConnections[i].source ) connectionAngle = -connectionAngle;

			var connectionVector = nodeConnections[i].getVector();

			var snappedConnectionVector = connectionVector.clone().rotate( toRad( connectionAngle ) );
			
			var delta = subVectors2D( snappedConnectionVector, connectionVector );

			scope.translate( delta );

			return; // Break loop to only snap to the first possible connection
		}
	}
};



/**
 * Constructs a Button
 * 
 * @param 	{String} type 
 * @param 	{Object} args
 * @returns {Button}
 */
var Button = function ( type, args ) {
	args = args || {};

	this.action 			= type;
	
	this.id 				= args.id 				|| UTILITY.randomId();
	this.icon 				= args.icon 			|| undefined;
	this.alwaysVisible 		= args.alwaysVisible 	|| false;
	this.width 				= args.width 			|| 22;

	this.showWhenPublished 	= args.showWhenPublished || false;
	
	var offset 				= args.offset || 0;

	if ( typeof args.position === "string" ) {

		switch ( args.position ) {
			
			default:;
			case "top-right": 		this.position = new Vector2D( 2 + FLOW.NODE_WIDTH - 26 + offset, 2 - offset ); break;
			case "top-left": 		this.position = new Vector2D( 2 - offset, 2 - offset ); break;
			case "bottom-left": 	this.position = new Vector2D( 2 - offset, 2 + FLOW.NODE_WIDTH - 26 + offset ); break;
			case "bottom-right": 	this.position = new Vector2D( 2 + FLOW.NODE_WIDTH - 26 + offset, 2 + FLOW.NODE_WIDTH - 26 + offset ); break;
			
		}
	}
	else {

		this.position = args.position;
	
	}

};



/**
 * Returns the button's icon
 * 
 * @returns {String}
 */
Button.prototype.getIcon = function() {
	
	var scope = this;

	var icon = scope.icon || UTILITY.iconForAction( scope.action );

	return icon;
};



/**
 * Constructs a Connector
 * 
 * @param 	{Object} args
 * @returns {Connector}
 */
var Connector = function ( args ) {
	args = args || {};

	this.id 			= args.id 			|| UTILITY.randomId();
	this.position 		= args.position 	|| new Vector2D( 0, 0 );
	this.target 		= args.target 		|| new Vector2D( 0, 20 );
	this.connection 	= args.connection	|| undefined;
	this.event 			= args.event 		|| 'default';
	this.color 			= args.color 		|| 'black';
};



/**
 * Constructs a Connection
 * 
 * @param {String} source 
 * @param {String} target 
 * @param {Object} args
 * @returns {Connection}
 */
var Connection = function ( source, target, args ) {
	args = args || {};

	this.id = args.id 		|| UTILITY.randomId();
	
	this.source = source;
	this.target = target;
	
	this.event = args.event || 'default';
	this.color = args.color || 'black';
};



/**
 * Returns the connection's source position
 * 
 * @returns {Vector2D}
 */
Connection.prototype.getSource = function() {
	
	var scope = this;
	
	var sourceNode = FLOW.getNode( scope.source );
	var targetNode = FLOW.getNode( scope.target );

	var source = sourceNode.getConnectionSourcePointForTarget( targetNode.getCenter() );

	return source;
};



/**
 * Returns the connection's target position
 * 
 * @returns {Vector2D}
 */
Connection.prototype.getTarget = function() {
	
	var scope = this;

	var targetNode = FLOW.getNode( scope.target );
	var sourceNode = FLOW.getNode( scope.source );

	var target = targetNode.getConnectionSourcePointForTarget( sourceNode.getCenter() );
	
	// offset to pull the arrow head out from the target node
	var targetOffsetVector = new Vector2D( 1, 0 )
		.rotate( -scope.getAngle() )
		.scale( FLOW.CONNECTION_ARROW_TARGET_OFFSET );

	target.subVector( targetOffsetVector );

	return target;
};



/**
 * Returns the connection vector from source to target
 * 
 * @returns {Vector2D}
 */
Connection.prototype.getVector = function() {
	
	var scope = this;

	var sourceNodeCenter = FLOW.getNode( scope.source ).getCenter();
	
	var targetNodeCenter = FLOW.getNode( scope.target ).getCenter();

	var connectionVector = subVectors2D( targetNodeCenter, sourceNodeCenter );

	return connectionVector;
};



/**
 * Returns the angle of the connection
 * 
 * @returns {Number}
 */
Connection.prototype.getAngle = function() {
	
	var scope = this;

	var angle = - scope.getVector().getAngle();

	return angle;
};



/**
 * Returns the connection's position transform
 * 
 * @returns {String}
 */
Connection.prototype.getPositionTransform = function() {
	
	var scope = this;

	var source = scope.getSource();

	var target = scope.getTarget();

	return 'M' + source.x + ',' + source.y + 'L' + target.x + ',' + target.y;
};



/**
 * Returns a label for this connections
 * 
 * @returns {ConnectionLabel}
 */
Connection.prototype.getLabel = function() {

	var scope = this;
	
	var label = new ConnectionLabel( scope.event, scope.getSource(), scope.getTarget() );

	return label;
};



/**
 * Constructs an EventNode
 * 
 * @param 	{Object} args
 * @returns {EventNode}
 */
var EventNode = function ( args ) {
	args = args || {};

	args.shape 	= "circle";
	args.title 	= args.title || "Event";
	args.type 	= "trigger_" + UTILITY.snake_case( args.title );
	args.color 	= args.color || FLOW.C.BLUE;

	args.buttons = args.buttons || [
		new Button( "remove", {
			position: "top-left"
		}),
		new Button( "config", {
			position: "bottom-left",
			alwaysVisible: true
		})
	];

	args.connectors = [
		new Connector({
			position: new Vector2D( FLOW.NODE_WIDTH, FLOW.NODE_WIDTH/2 ),
			target: new Vector2D( FLOW.NODE_WIDTH + 20, FLOW.NODE_WIDTH/2 )
		}),
	];

	args.tags = ["event"];
	args.allowedConnections = [];

	Node.call( this, args );
};
EventNode.prototype = new Node();



/**
 * Constructs an ActionNode
 * 
 * @param 	{Object} args
 * @returns {ActionNode}
 */
var ActionNode = function ( args ) {
	args = args || {};

	args.shape 	= "roundedBox";
	args.title 	= args.title || "Action";
	args.type 	= "action_" + UTILITY.snake_case( args.title );
	args.color 	= args.color || FLOW.C.RED;
	
	args.buttons = args.buttons || [
		new Button( "remove", {
			position: "top-left",
			offset: 11
		}),
		new Button( "config", {
			position: "bottom-left",
			offset: 11,
			alwaysVisible: true
		})
	];

	args.connectors = args.connectors || [
		new Connector({
			position: new Vector2D( FLOW.NODE_WIDTH, FLOW.NODE_WIDTH/2 ),
			target: new Vector2D( FLOW.NODE_WIDTH + 20, FLOW.NODE_WIDTH/2 )
		}),
	];

	args.tags = ["action"];
	args.allowedConnections = ["event", "action", "condition"];

	Node.call( this, args );
};
EventNode.prototype = new Node();



/**
 * Constructs a ConditionNode
 * 
 * @param 	{Object} args
 * @returns {ConditionNode}
 */
var ConditionNode = function ( args ) {
	args = args || {};

	args.shape = "octagon";
	args.title = args.title || "Condition";
	args.type = "condition_" + UTILITY.snake_case( args.title );
	args.color = args.color || FLOW.C.GREY;

	args.buttons = args.buttons || [
		new Button( "remove", {
			position: "top-left"
		}),
		new Button( "config", {
			position: "bottom-left",
			alwaysVisible: true
		})
	];

	args.connectors = [
		new Connector({
			position: new Vector2D( FLOW.NODE_WIDTH, 0.3 * FLOW.NODE_WIDTH ),
			target: new Vector2D( FLOW.NODE_WIDTH + 20, 0.3 * FLOW.NODE_WIDTH ),
			event: 'true',
			color: 'green'
		}),

		new Connector({
			position: new Vector2D( FLOW.NODE_WIDTH, 0.7 * FLOW.NODE_WIDTH ),
			target: new Vector2D( FLOW.NODE_WIDTH + 20, 0.7 * FLOW.NODE_WIDTH ),
			event: 'false',
			color: 'red'
		})
	];

	args.tags = ["condition"];
	args.allowedConnections = ["event", "action", "condition"];

	Node.call( this, args );
};
EventNode.prototype = new Node();



/**
 * Constructs a ConnectionLabel
 * 
 * @param 	{String} event 
 * @param 	{Vector2D} source 
 * @param 	{Vector2D} target
 * @returns {ConnectionLabel}
 */
var ConnectionLabel = function ( event, source, target ) {

	var connectionVector = subVectors2D( target, source ).scale( FLOW.CONNECTION_LABEL_POSITION_FRACTION );

	//* text
	var text = "default";

	if ( event === "true" ) text = FLOW.CONNECTION_LABELS.TRUE;
	if ( event === "false" ) text = FLOW.CONNECTION_LABELS.FALSE;

	//* rotation
	var rotation = connectionVector.getAngle();
	

	//* position
	var position = addVectors2D( source, connectionVector);

	var labelOffset = new Vector2D(0, FLOW.CONNECTION_LABEL_POSITION_MARGIN ).rotate( rotation );

	position.subVector( labelOffset );

	var labelRotationTransform = 'rotate(' + [ toDeg( rotation ), position.x, position.y ].join(' ') + ')';

	this.text 				= text;
	this.position 			= position;
	this.rotationTransform 	= labelRotationTransform;

};