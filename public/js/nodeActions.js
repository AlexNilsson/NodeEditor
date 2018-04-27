/* global FLOW, alert */

/**
 * Opens the configuration modal of a node
 * 
 * @param {String} node_id
 */
FLOW.configureNode = function ( node_id ){

    // The node data object
    var node = FLOW.getNode( node_id );

    // The node's parameter object
    var properties = FLOW.getNodeProperties( node_id );

    //* EX: Changing a parameter
    properties.new_key = "new value";
    FLOW.setNodeProperties( node_id, properties );

    //* EX: Changing a property on the Node itself
    node.subTitle = "new subTitle";
    node.configured = true;
    
    //* EX: Get the stored / original id.
    var original_id = node.getId();

    
    //* display modal
    //* ...

    console.log( "selected Node:", original_id );
    console.log( "node Object:", node );
    console.log( "node Parameters:", properties );

    alert("display config for node:" + original_id );

    node.updateState();
};



/**
 * Opens the modal of a published node
 * 
 * @param {String} node_id 
 */
FLOW.showPublishedNodePanel = function( node_id ) {
    
    // The node data object
    var node = FLOW.getNode( node_id );

    //* display modal
    //* ...

    //* EX: Get the stored / original id.
    var original_id = node.getId();

    alert("display published modal for node:" + original_id );
    
    node.updateState();
};



/**
 * Removes a node from the flow
 * 
 * @param {String} node_id
 * @returns {undefined}
 */
FLOW.removeNode = function ( node_id ) {

    // 1. remove related connections
    FLOW.connections = FLOW.connections.filter( function ( connection ) {

        var isRelatedNode =
            ( connection.source === node_id ) ||
            ( connection.target === node_id );

        if ( isRelatedNode ) {

            FLOW.nodes.filter( function( node ){ return node.id === connection.source; } )[0]
                .connectors.forEach( function( connector ) {

                if ( connector.connection === connection.id ) {

                    // 2. remove connection from all source node's connectors
                    connector.connection = undefined;

                    // 3. show all source node's connectors
                    d3.select( '#' + connector.id ).classed( 'hidden', false );
                    d3.select( '#' + connector.id + "-helper" ).classed('hidden', false);
                }

            }); 
        }

        return !isRelatedNode;
    });

    // 4. remove the node
    FLOW.nodes = FLOW.nodes.filter( function( node ){ return node.id !== node_id; });

    FLOW.updateState();
};



/**
 * Removes a connection
 * 
 * @param {String} connection_id
 * @returns {undefined}
 */
FLOW.removeConnection = function( connection_id ){

    var connection = FLOW.connections.filter( function ( connection ) {
        return connection.id === connection_id;
    })[0];

    FLOW.nodes.filter( function( node ){ return node.id === connection.source; } )[0]
        .connectors.forEach( function( connector ) {

        if ( connector.connection === connection.id ) {

            // remove connection from all source node's connectors
            connector.connection = undefined;

            // show all source node's connectors
            d3.select( '#' + connector.id ).classed( 'hidden', false );
            d3.select( '#' + connector.id + "-helper" ).classed('hidden', false);
        }

    }); 

    // remove connection
    FLOW.connections = FLOW.connections.filter( function ( connection ) {
        return connection.id !== connection_id;
    });

    FLOW.updateState();
};



/**
 * Handles node action events
 * 
 * @param {any} data 
 * @param {String} action 
 */
FLOW.nodeAction = function ( data, action ) {
    
	switch ( action ) {

        case "remove":              FLOW.removeNode( data ); break;

		case "removeConnection" :   FLOW.removeConnection( data ); break;

        case "config":              FLOW.stopDragging(); FLOW.configureNode( data ); break;
        
        case "onPublished":         FLOW.showPublishedNodePanel( data ); break;

	}
};