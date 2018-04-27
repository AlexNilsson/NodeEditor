/* global ActionNode, FLOW, CANVAS, restart, d3, svg, mousedown_node, linkDrag, buttonIsPressed, grabOffset, nodes, links, drag_line, addVectors2D, Vector2D, activeConnector */

var dummyPos;

/**
 * Returns the mouse position inside the scope
 * adjusted to the scope's scale and translation
 * 
 * @param   {Object} scope 
 * @param   {Object} args 
 * @returns {Vector2D}
 */
var getMousePos = function ( scope, args ) {

    args = args || {};

    var point = d3.mouse( scope );

    var v = new Vector2D( point[0], point[1] );

    if ( args.scale === true ) v.scale( 1/CANVAS.zoomValue );

    if ( args.translate === true ) v.subVector( CANVAS.translation );

    return v;
};



/**
 * Handles the mouse_down event
 * 
 * @returns {undefined}
 */
var mousedown = function () {

    FLOW.svg.classed('active', true);

    if ( mousedown_node ) return;

    if ( dashConnector ) return;

    mousedown_bg = getMousePos( this );

    FLOW.updateState();
};



/**
 * Handles the mouse_move event
 * 
 * @returns {undefined}
 */
var mousemove = function () {

    var point;

    if ( FLOW.isPublished() === false ) {

        // Drag Node
        if ( mousedown_node && !buttonIsPressed && !linkDrag ) {

            point = getMousePos(this, {scale: true, translate:true});

            if(!nodeMoved) dummyPos = mousedown_node.position.x + mousedown_node.position.y;

            mousedown_node.setPosition( subVectors2D( point, grabOffset ) );

            if ( !nodeMoved && Math.round(dummyPos) !== Math.round(mousedown_node.position.x + mousedown_node.position.y) ) {
                //necessary check, because "onmoved" is fired once on click for some reason
                nodeMoved = true;
            }
            
            // remove eventual "remove" buttons that are stuck on the screen on connections
            d3.selectAll("#tempId").remove();
        }
        
        // Drag Connection
        if ( linkDrag ) {

            point = getMousePos(this, {scale: true, translate:true});

            d3.select( '#' + activeConnector.id ).classed('hidden', true);
            d3.select( '#' + activeConnector.id + "-helper").classed('hidden', true);

            d3.select(".dragline." + activeConnector.color).classed('hidden', false);

            // boundary point marking the source of the connection
            var source = mousedown_node.getConnectionSourcePointForTarget( point );

            d3.select(".dragline." + activeConnector.color).attr('d', 'M' + source.x + ',' + source.y + 'L' + point.x + ',' + point.y);
        
            //* Add a label to the drag connection if the event is not "default"
            if ( activeConnector.event !== 'default' ) {
                var label = d3.select("#dragLine-label");

                var a = source.clone().addVector( CANVAS.translation ).scale( CANVAS.zoomValue );
                var b = point.clone().addVector( CANVAS.translation ).scale( CANVAS.zoomValue );

                var labelData = new ConnectionLabel( activeConnector.event, a, b );

                if ( label.empty() ) {

                    //* add new label
                    d3.select( '#canvasArea svg' ).append('text')
                        .attr('id', "dragLine-label")
                        .attr('x', labelData.position.x )
                        .attr('y', labelData.position.y )
                        .attr('transform', labelData.rotationTransform)
                        .attr('font-family', 'Verdana')
                        .attr('font-size', FLOW.CONNECTION_LABEL_FONT_SIZE)
                        .attr('font-weight', 'bold')
                        .style('text-anchor', 'middle')
                        .style('fill', FLOW.C[activeConnector.color.toUpperCase()])
                        .text( labelData.text );

                } else {

                    //* update existing label;
                    label
                        .attr('x', labelData.position.x )
                        .attr('y', labelData.position.y )
                        .attr('transform', labelData.rotationTransform);
                }
            }
        }
    
    }



    //* SPAWN NEW NODE
    if ( NODELIST.hasNodeSelected ) {

        if ( FLOW.isPublished() === false ) {

            point = getMousePos(this, {scale: true, translate:true});

            var nodeArchetype = NODELIST.getNode( NODELIST.selectedNode.id );

            var args = {};

            Object.keys(nodeArchetype).forEach( function( key ){
                args[key] = nodeArchetype[key];
            });

            args.id = undefined;
            args.buttons = [];
            args.connectors = [];

            nodeArchetype.buttons.forEach(function( button ){
                var btn_args = {};
                Object.keys(button).forEach( function(key){
                    btn_args[key] = button[key];
                });

                btn_args.id = undefined;

                args.buttons.push( new Button( button.action, btn_args ));
            });

            nodeArchetype.connectors.forEach(function( connector ){
                var connector_args = {};
                Object.keys(connector).forEach( function(key){
                    connector_args[key] = connector[key];
                });

                connector_args.id = undefined;

                args.connectors.push( new Connector( connector_args ));
            });

            var node = new Node( args );

            
            node.position = point.clone().sub( 50 );
            FLOW.nodes.push( node );
            
            mousedown_node = node;
            grabOffset = new Vector2D(50,50);
            
            CANVAS.OVERLAY.hide();

        }

        NODELIST.resetSelection();
    }



    //* Translate canvas
    if ( mousedown_bg ) {

        FLOW.svg.classed('panning', true );

        point = getMousePos( this );

        var delta = subVectors2D( point, mousedown_bg );

        delta.scale( 1/CANVAS.zoomValue ).round();

        if ( delta.getLength() > 1){ mousedown_bg = point.clone(); }

        CANVAS.translate( delta );
    }
    
    // Remove connection hover states when hovering away
    if ( d3.select("#tempId")[0][0] ) {

        var point = d3.mouse(this);
        point = new Vector2D( point[0], point[1] );
        
        var delta = subVectors2D( dashConnectorPos, point ).getLength();

        if ( delta > FLOW.CONNECTION_REMOVE_ICON_SIZE + 10 ) {
            d3.select("#tempId").remove();
            connectionPendingDelete = false;
            dashConnector = undefined;
        }
    }

    FLOW.updateState();
};



/**
 * Handles the mouse_up event
 * 
 * @returns {undefined}
 */
var mouseup = function () {

    if ( mousedown_node ) {

        d3.selectAll(".dragline").classed('hidden', true);
        d3.select("#dragLine-label").remove();
        
        if ( FLOW.isPublished() === false ) {

            //* SNAP INTO POSITION
            mousedown_node.snapIntoPosition();

        }

        //* Node Clicked
        if ( mousedown_node === mouseup_node && !nodeMoved && !buttonIsPressed && !linkDrag ){
            
            // Show node config
            FLOW.nodeAction( mouseup_node.id, "config");
            
        }

    }

    if ( linkDrag && mouseup_node ) {

        var couldConnect = FLOW.connectNodes( mousedown_node, mouseup_node );

        if ( couldConnect === false ) {
            d3.select( '#' + activeConnector.id ).classed('hidden', false);
            d3.select( '#' + activeConnector.id + "-helper" ).classed('hidden', false);
            
        }
    }
    else if ( linkDrag ) {
        d3.select( '#' + activeConnector.id ).classed('hidden', false);
        d3.select( '#' + activeConnector.id + "-helper" ).classed('hidden', false);
    }

    FLOW.svg.classed('panning', false );

    // because :active only works in WebKit?
    FLOW.svg.classed('active', false);

    FLOW.resetMouseVars();
};



/**
 * Handles the mouse_out event
 * ( fires when the cursor exits the canvas )
 * @returns {undefined}
 */
var mouseout = function () {

    //false fires when hovering nodes etc, need to check the mouse coordinates.

    var point = d3.mouse(this);
    var canvas = CANVAS.getSize();

    if (
        ( point[0] < 0 )            ||
        ( point[1] < 0 )            ||
        ( point[0] > canvas.width ) ||
        ( point[1] > canvas.height)
    ){
        FLOW.stopDragging();
    }
};



/**
 * Handles the zoom event
 * 
 * @param {any} e
 * @returns {undefined}
 */
var zoomHandler = function (e) {
    var e = window.event || e;
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    CANVAS.zoom( delta );
};



window.onresize = function(event) { CANVAS.updateSize(); };

FLOW.svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup)
  .on('mouseout', mouseout);

  
//* Scroll bg to zoom
//FLOW.canvasArea.addEventListener("mousewheel", zoomHandler, false);
//FLOW.canvasArea.addEventListener("DOMMouseScroll", zoomHandler, false);

