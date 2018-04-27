/* global d3, FLOW*/

FLOW.updateState = function() {

	//* connections container
  	FLOW.gConnections = FLOW.gConnections.data( FLOW.connections, function(d) { return d.id; } );

	//* update existing connections
	FLOW.connections.forEach( function( connection ) {
		d3.select( '#' + connection.id )
		.attr('d', function(d){ return d.getPositionTransform(); })
		.attr('class', function(d){ return 'link ' + d.color; })
		.classed('selected', function(d){ return ( dashConnector ) ? d.id === dashConnector.id : false; })
		.classed('published', FLOW.isPublished());

		//* Add a label to all connections which aren't 'default'
		if ( connection.event !== 'default' ) {
		
			var label = d3.select("#" + connection.id + "-label");
			var labelData = connection.getLabel();

			if ( label.empty() ) {

				//* add new label
				d3.select( '.connectionContainer' ).append('text')
					.attr('id', connection.id + "-label")
					.attr('x', labelData.position.x )
					.attr('y', labelData.position.y )
					.attr('transform', labelData.rotationTransform)
					.attr('font-family', 'Verdana')
					.attr('font-size', FLOW.CONNECTION_LABEL_FONT_SIZE)
					.attr('font-weight', 'bold')
					.style('text-anchor', 'middle')
					.style('fill', FLOW.C[connection.color.toUpperCase()])
					.text( labelData.text );

			} else {

				//* update existing label;
				label
					.attr('x', labelData.position.x )
					.attr('y', labelData.position.y )
					.attr('transform', labelData.rotationTransform);
			}
		}
	});


	

	//* add new connections
  	FLOW.gConnections.enter().append('svg:path')
		.attr('class', function(d){ return 'link ' + d.color; })
		.attr('id', function(d){ return d.id; })
		.attr('d', function(d){ return d.getPositionTransform(); })
		.style('marker-start', 'url(#start-socket)')
		.style('marker-end', function(d){ return 'url(#end-arrow-'+ d.color +')'; })
		.on('mouseover', function(d) {

			if ( FLOW.isPublished() === false ) {

				if ( mousedown_node || linkDrag ) return false;

				dashConnector = this;
				connectionPendingDelete = true;

				d3.selectAll("#tempId").remove();

				var point = getMousePos(this);

				dashConnectorPos = getMousePos(document.getElementById("canvasArea"));

				d3.select(this.parentNode).append('image')
					.attr('xlink:href', 'icons/' + UTILITY.iconForAction( "remove" ))
					.attr('x', point.x - FLOW.CONNECTION_REMOVE_ICON_SIZE/2 )
					.attr('y', point.y - FLOW.CONNECTION_REMOVE_ICON_SIZE/2 )
					.attr('width', FLOW.CONNECTION_REMOVE_ICON_SIZE)
					.attr('height', FLOW.CONNECTION_REMOVE_ICON_SIZE)
					.attr('id', "tempId" )
					.attr('action', "remove" )
					.classed('button',true)
					.on('mouseout', function(b) {

						d3.select(this).remove();
						connectionPendingDelete = false;
						dashConnector = undefined;

						FLOW.updateState();

					})
					.on('mousedown', function() {

						buttonIsPressed = true;
						pendingAction = { id: "tempId", action: "removeConnection" };

					})
					.on('mouseup', function() {
						if ( JSON.stringify( pendingAction ) === JSON.stringify( { id: "tempId", action: "removeConnection" })) {
							FLOW.nodeAction(d.id, "removeConnection" );
							d3.select(this).remove();
						}
					});

				FLOW.updateState();
			}
		});
	
	//* remove old connections
  	FLOW.gConnections.exit().each( function( d ){
		d3.select("#" + d.id + "-label").remove();
	  }).remove();

	//* nodes container
	FLOW.gNodes = FLOW.gNodes.data(FLOW.nodes, function(d) { return d.id; });
	
	//* update existing nodes
	FLOW.nodes.forEach( function( node ) {

		var configButton = node.buttons.filter( function( button ){ return button.action === "config"; })[0];
		if ( configButton !== undefined ) {

			configButton.alwaysVisible = !node.configured;

			d3.select( '#' + configButton.id )
				.attr('visibility', configButton.alwaysVisible ? 'visible' : 'hidden')
				.style('visibility', configButton.alwaysVisible ? 'visible' : 'hidden');
		}

		d3.select( '#' + node.id )
			.select(".subTitle").text( node.subTitle );

		var node_color = node.color;

		if( mouseover_node === node.id ){
			node_color = UTILITY.makeHexColorBrighter( node.color, FLOW.NODE_HOVER_BRIGHTNESS_FACTOR );
		}
		
		d3.select( '#' + node.id )
			.select(".mainShape")
				.attr('fill', node_color );

	});

	//* add new nodes
	var n = FLOW.gNodes.enter().append('svg:g')
		.attr('id', function(d){ return d.id; })
		.classed('node',true)
		.attr('transform', function(d){ return 'translate(' + d.position.x + ',' + d.position.y + ')'; });

	n.each( function( node, b ){

		//* SHAPE
		n.append('use')
		.attr('xlink:href', '#' + node.shape )
		.attr('class', 'mainShape')
		.attr('fill', node.color);

		//* CONNECTORS
		node.connectors.forEach( function( connector, i ){

			if ( FLOW.isPublished() === false ) {

				var setConnectionStateHover = function(){
					d3.select("#" + connector.id ).attr('d', 'M' + connector.position.x + ',' + connector.position.y + 'L' + ( connector.target.x + 5) + ',' + connector.target.y);
				};

				var setConnectionStateDefault = function(){
					d3.select("#" + connector.id ).attr('d', 'M' + connector.position.x + ',' + connector.position.y + 'L' + connector.target.x + ',' + connector.target.y);
				};

				// selection helper circle
				n.append('svg:circle')
					.attr('id', connector.id + "-helper")
					.attr('class','button')
					.attr('cx', connector.position.x)
					.attr('cy', connector.position.y)
					.attr('opacity', 0)
					.classed("hidden", connector.connection !== undefined)
					.attr('r', 20)
					.on('mouseover', function(d) {
						setConnectionStateHover();
					})
					.on('mouseout', function(d) {
						setConnectionStateDefault();
					})
					.on('mousedown', function(d) {

						linkDrag = true;

						activeConnector = connector;
						
					});

				n.append('svg:path')
				.attr('class', 'link')
				.attr('id', connector.id)
				.attr('d', 'M' + connector.position.x + ',' + connector.position.y + 'L' + connector.target.x + ',' + connector.target.y)
				.style('marker-start', 'url(#start-socket)')
				.style('marker-end', 'url(#end-arrow-' + connector.color + ')')
				.classed(connector.color, true)
				.classed("hidden", connector.connection !== undefined)
				.on('mouseover', function(d) {
						setConnectionStateHover();
					})
					.on('mouseout', function(d) {
						setConnectionStateDefault();
					})
					.on('mousedown', function(d) {

						linkDrag = true;

						activeConnector = connector;
						
					})
					.on('mouseup', function(d) {

					});
			}

		});

		//* ICON
		n.append('image')
		.attr('xlink:href', 'icons/' + node.icon )
		.attr('x', FLOW.NODE_WIDTH * 0.40 )
		.attr('y', FLOW.NODE_WIDTH * 0.16 )
		.attr('width', FLOW.NODE_WIDTH/100 * 22)
		.attr('height', FLOW.NODE_WIDTH/100 * 22);

		//* TITLE
		n.append('text')
		.attr('class','title')
		.attr('x', FLOW.NODE_WIDTH / 2 )
		.attr('y', FLOW.NODE_WIDTH * 0.54 )
		.attr('font-family', 'Verdana')
		.attr('font-size', 11)
		.style('text-anchor', 'middle')
		.style('fill', '#fff')
		.text( node.title );

		//* SUB TITLE
		n.append('text')
		.attr('class','subTitle')
		.attr('x', FLOW.NODE_WIDTH / 2 )
		.attr('y', FLOW.NODE_WIDTH * 0.70 )
		.attr('font-family', 'Verdana')
		.attr('font-size', 8)
		.style('text-anchor', 'middle')
		.style('fill', '#fff')
		.text( node.subTitle );

		

		//* Active Count
		if( FLOW.isPublished() && FLOW.getNodeProperties(node.id).active_count != undefined){

			n.append('text')
			.attr('class','')
			.attr('x', FLOW.NODE_WIDTH / 2 )
			.attr('y', FLOW.NODE_WIDTH + 16 )
			.attr('font-family', 'Verdana')
			.attr('font-size', 10)
			.style('text-anchor', 'middle')
			.style('fill', '#000')
			.text( FLOW.getNodeProperties(node.id).active_count + " Active" );

		}


		//* BUTTONS
		node.buttons.forEach( function( button ){

			if ( FLOW.isPublished() === button.showWhenPublished ) {

				n.append('image')
					.attr('xlink:href', 'icons/' + button.getIcon())
					.attr('x', button.position.x )
					.attr('y', button.position.y )
					.attr('width', button.width )
					.attr('height', button.width )
					.attr('id', button.id )
					.attr('visibility', button.alwaysVisible ? 'visible' : 'hidden')
					.attr('action', button.action )
					.classed('button',true)
					.on('mouseover', function(d) {
						d3.select(this)
							.attr('width', button.width + 2)
							.attr('height', button.width + 2)
							.attr('x', button.position.x - 1 )
							.attr('y', button.position.y - 1 );

					})
					.on('mouseout', function(d) {
						d3.select(this)
						.attr('width', button.width)
						.attr('height', button.width)
						.attr('x', button.position.x )
						.attr('y', button.position.y );

					})
					.on('mousedown', function(d) {
						buttonIsPressed = true;
						pendingAction = { id: d.id, action: button.action };

					})
					.on('mouseup', function(d) {
						if ( JSON.stringify( pendingAction ) === JSON.stringify( { id: d.id, action: button.action })) {
							FLOW.nodeAction(d.id, button.action );
						}
					});
			
			}

		});

		//* MOUSE EVENTS
		n.on('mouseover', function(d) {

			mouseover_node = d.id;

			d.buttons.forEach( function( button ){

				if ( button.action !== "config" || !d.configured ) {
					d3.select("#" + button.id).style('visibility','visible');
				}
			});

			d3.select(this).selectAll(".linkButton").style('visibility','visible');

		})
		.on('mouseout', function(d) {

			mouseover_node = undefined;

			var scope = this;

			d.hideButtons();

		})
		.on('mousedown', function(d) {

			mousedown_node = d;
			
			grabOffset = getMousePos(this);

			this.parentNode.appendChild(this);

		})
		.on('mouseup', function(d) {

			mouseup_node = d;

		});

	});

	//* remove old nodes
	FLOW.gNodes.exit().remove();

	//* If the canvas is empty, display the Init Overlay
	if ( FLOW.nodes.length < 1 ) CANVAS.OVERLAY.showInitOverlay();

	// Fix to prevent img-drag in FireFox
	var images = document.getElementsByTagName('image');
	for ( var i = 0; i < images.length; i++) {
		images[i].onmousedown = function(e){ e.preventDefault(); };
	}
};