/* global window, d3, FLOW, UTILITY */

var NODELIST = {};

NODELIST.groups = [];

NODELIST.hidden = false;

NODELIST.padding = 5;

NODELIST.nodeWidth = FLOW.NODE_SIDEBAR_WIDTH + 2 * NODELIST.padding;
NODELIST.nodeHeight = FLOW.NODE_SIDEBAR_WIDTH;
NODELIST.columns = FLOW.NODELIST_COLUMNS;
NODELIST.nodeCount = 0;

NODELIST.selectedNode = {
	id: undefined,
	offset: undefined,
	originalTransform: undefined
};

NODELIST.selectedNodeOffset = undefined;


NODELIST.view = d3.select('#nodeList')
  .append('svg')
	.classed("hidden", NODELIST.hidden )
  	.attr('oncontextmenu', 'return false;')
	.attr('width', NODELIST.nodeWidth * NODELIST.columns)
	.attr('height', NODELIST.nodeWidth * NODELIST.columns)
	.on('mousemove', function(){

		// drop any nodes or connections currently being dragged on the main canvas
		FLOW.stopDragging();

		if ( NODELIST.hasNodeSelected ) {

			var node = d3.select("#" + NODELIST.selectedNode.id );

			var mouseCoord = getMousePos(this);
			var nodeCoord = subVectors2D( mouseCoord, NODELIST.selectedNode.offset );

			// Drag selected node within the List View
			node.attr("transform","translate(" + nodeCoord.x + "," + nodeCoord.y +")");

			// Reset the List View and return the selected node if dragged outside the List ( and not onto the canvas )
			if ( 
				mouseCoord.x > NODELIST.nodeWidth * NODELIST.columns - 10 ||
				mouseCoord.y < 10 ||
				mouseCoord.y > NODELIST.canvasHeight - 10
			) {
				NODELIST.resetSelection();
			}

		}

	})
	.on('mouseup', function(){
		
		NODELIST.resetSelection();

	});



/**
 * Hides the NODELIST
 * 
 * @returns {undefined}
 */
NODELIST.hide = function(){

	NODELIST.hidden = true;
	
	NODELIST.view.classed( "hidden", NODELIST.hidden );
};



/**
 * Hides the NODELIST
 * 
 * @returns {undefined}
 */
NODELIST.show = function(){

	NODELIST.hidden = false;
	
	NODELIST.view.classed( "hidden", NODELIST.hidden );
};



/**
 * Updates the node list canvas size according the the nodes filling it
 * 
 * @returns { undefined }
 */
NODELIST.updateHeight = function(){

	// canvas height taken by all titles
	var totalTitleHeight = NODELIST.groups.length * ( FLOW.NODELIST_TITLE_PADDING + FLOW.NODELIST_TITLE_HEIGHT );

	// canvas height taken by all nodes
	var nodeHeight = NODELIST.groups.map( function( group ){
		var group_rows = Math.ceil( group.nodes.length / FLOW.NODELIST_COLUMNS );
		return group_rows * FLOW.NODE_SIDEBAR_WIDTH;
	}).reduce( function( a, b ){ return a + b; });

	// total required height
	var height = totalTitleHeight + nodeHeight;

	NODELIST.canvasHeight = height;

	NODELIST.view.attr('height', height);
};
	


NODELIST.resetSelection = function() {

	NODELIST.hasNodeSelected = false;

	d3.select( "#" + NODELIST.selectedNode.id )
		.attr( "transform", NODELIST.selectedNode.originalTransform );

	NODELIST.selectedNode = {};
};


NODELIST.appendNode = function (node, x, y) {

	var n = NODELIST.view.append('svg:g')
		.attr('id', node.id)
		.attr('class','node templateNode')
		.attr('transform', 'translate( ' + x +',' + y + ')');

		//* SHAPE
		n.append('use')
		.attr('xlink:href', '#' + node.shape )
		.attr('transform', 'scale(' + 0.6 * FLOW.NODE_SIDEBAR_WIDTH / FLOW.NODE_WIDTH + ')')
		.attr('fill', node.color); 

		//* ICON
		n.append('image')
		.attr('xlink:href', 'icons/' + node.icon )
		.attr('x', 20 )
		.attr('y', 18 )
		.attr('width', 22)
		.attr('height', 22);

		//* TITLE
		n.append('text')
		.attr('x', 30 )
		.attr('y', 76 )
		.attr('font-family', 'open sans')
		.attr('font-size', 11)
		.style('text-anchor', 'middle')
		.style('fill', '#676a6c')
		.style('font-weight', '400')
		.text( node.title );

	n.on('mousedown', function() {

		NODELIST.selectedNode.id = this.id;

		NODELIST.selectedNode.offset = getMousePos(this);

		NODELIST.selectedNode.originalTransform = this.getAttribute("transform");

		this.parentNode.appendChild(this);

		NODELIST.hasNodeSelected = true;

	});
};


NODELIST.addNodeGroup = function ( title, nodeList ) {

	var group_y = Math.ceil( this.nodeCount / this.columns ) * FLOW.NODE_SIDEBAR_WIDTH + FLOW.NODELIST_TITLE_PADDING + this.groups.length * ( 2* FLOW.NODELIST_TITLE_HEIGHT );

	this.groups.push( { title: title, nodes: nodeList } );

	this.nodeCount += nodeList.length;


	var title_x = this.nodeWidth * this.columns / 2 + 4 - NODELIST.padding;

	NODELIST.view.append('text')
	.attr('x', title_x )
	.attr('y', group_y )
	.attr('font-family', 'open sans')
	.attr('font-size', 12)
	.style('text-anchor', 'middle')
	.style('fill', '#676a6c')
	.style('font-weight', '700')
	.text( title );

	nodeList.forEach( function( node, i ){

		var x = (i % NODELIST.columns) * FLOW.NODE_SIDEBAR_WIDTH + 23 + NODELIST.padding;
		var y = group_y + FLOW.NODELIST_TITLE_HEIGHT + Math.floor( i / NODELIST.columns ) * FLOW.NODE_SIDEBAR_WIDTH;

		NODELIST.appendNode(node, x, y);

	});
};

NODELIST.getNode = function( id ){

	var nodes = [];

	this.groups.forEach( function( group ){
		var node = group.nodes.filter( function( node ){ return node.id === id; })[0];
		if ( node !== undefined ) nodes.push( node );
	});

	return nodes[0];
};



NODELIST.eventNodes = [

	new EventNode({
		title: "Tag Trigger"
	}),

	new EventNode({
		title: "Opt In"
	}),

	new EventNode({
		title: "Email Activity"
	}),

	new EventNode({
		title: "Scheduled Trigger"
	})
];



NODELIST.actionNodes = [
	new ActionNode({
		title: "Add Delay"
	}),

	new ActionNode({
		title: "Send Email",
		publishedButtons: [
			new Button( "onPublished", {
				icon: "warning.svg",
				alwaysVisible: true,
				showWhenPublished: true,
				position: "top-right",
				offset: 11
			})
		]
	}),

	new ActionNode({
		title: "Send Text"
	}),

	new ActionNode({
		title: "Add Tags"
	}),

	new ActionNode({
		title: "Remove Tags"
	}),

	new ActionNode({
		title: "Eject from Flow",
		buttons: [
			new Button( "remove", {
				position: "top-left"
			})
		],
		connectors: [],
		configurable: false
	})
];



NODELIST.conditionNodes = [
	new ConditionNode({
		title: "Check Email Status",
		icon: "arrowDown.svg"
	}),

	new ConditionNode({
		title: "Check Text Status"
	}),

	new ConditionNode({
		title: "Has Tags"
	})
];



NODELIST.addNodeGroup( "Triggers", NODELIST.eventNodes );
NODELIST.addNodeGroup( "Actions", NODELIST.actionNodes );
NODELIST.addNodeGroup( "Conditions", NODELIST.conditionNodes );
NODELIST.updateHeight();