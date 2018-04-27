/* global FLOW */


/**
 * Sets a Node's functional properties
 * 
 * @param   {String} node_id 
 * @param   {Object} data
 * @returns {undefined}
 */
FLOW.setNodeProperties = function( node_id, data ){
    
    FLOW.nodeProperties[node_id] = data;
    
};



/**
 * Returns a Node's functional properties
 * 
 * @param   {String} node_id 
 * @returns {Object}
 */
FLOW.getNodeProperties = function( node_id ){

    return FLOW.nodeProperties[node_id] || {};

};



/**
 * Loads a flow into the scene and initiates the node editor
 * 
 * @param   {String <JSON>} data
 * @returns {undefined}
 */
FLOW.loadData = function( data ){

    if ( typeof data === "string" ) {

        FLOW.nodes          = [];
        FLOW.connections    = [];
        FLOW.nodeProperties = [];

        //* To prevent a dom-selection bug new id's needs to be assigned to nodes and connectors
        //* this object keeps track of these changes while instanciating the components
        FLOW.ID_MAP = {};

        var data = JSON.parse( data );
        
        FLOW.status = data.flow.status;

        if ( FLOW.isPublished() ) {

            NODELIST.hide();

        } else {

            NODELIST.show();

        }

        //* CANVAS TRANSFORM
        CANVAS.zoomValue = parseFloat( data.flow.canvas_zoom );

        var _canvasTranslation = JSON.parse( data.flow.canvas_translation );
        CANVAS.translation = new Vector2D( _canvasTranslation.x, _canvasTranslation.y );


        //* NODES
        data.flow_steps.forEach( function( node,i ){
            
            // Determine the Node's Archetype
            var nodeType = node.step_type.split('_')[0].toLowerCase() + "Nodes";
            if( nodeType === "triggerNodes") nodeType = "eventNodes";

            var nodeArchetype = NODELIST[nodeType].find(function(x){ return x.type === node.step_type; });

            // Connectors
            var connectors = JSON.parse( node.attributes.connectors );
            connectors = connectors.map( function( args ){

                args.id = undefined;

                args.position = new Vector2D( args.position.x, args.position.y );
                args.target = new Vector2D( args.target.x, args.target.y );

                if ( args.connection !== undefined ) {

                    var newId = UTILITY.randomId();

                    FLOW.ID_MAP[ args.connection ] = newId;

                    args.connection = newId;
                }

                return new Connector( args ); 
            });

            // Position
            var _pos = JSON.parse( node.attributes.position );
            var position = new Vector2D( _pos.x, _pos.y );

            var buttons = [];

            nodeArchetype.buttons.forEach( function( button ){
                var btnInstance = new Button(
                    button.action,
                    {
                        alwaysVisible: button.alwaysVisible,
                        icon: button.icon,
                        showWhenPublished: button.showWhenPublished,
                        width: button.width
                    }
                );

                btnInstance.position = button.position;

                buttons.push( btnInstance );
            });


            // Create Node Instance
            var nodeInstance = new Node({
                "type":               node.step_type,
                "subTitle":           node.attributes.subtitle,
                "configured":         node.attributes.configured,
                "connectors":         connectors,
                "position":           position,

                "buttons":            buttons,

                "shape":              nodeArchetype.shape,
                "icon":               nodeArchetype.icon,
                "title":              nodeArchetype.title,
                "tags":               nodeArchetype.tags,
                "allowedConnections": nodeArchetype.allowedConnections,
                "socket":             nodeArchetype.socket,
                "color":              nodeArchetype.color
            });

            FLOW.nodes.push( nodeInstance );

            FLOW.ID_MAP[ node.internal_id ] = nodeInstance.id;

            FLOW.nodeProperties[nodeInstance.id] = node.properties;

            FLOW.updateState();
            
        });


        //* CONNECTIONS
        data.flow_transitions.forEach( function( connection ){
            FLOW.connections.push( new Connection(
                FLOW.ID_MAP[ connection.source_id ],
                FLOW.ID_MAP[ connection.target_id ],
                {
                    "id": FLOW.ID_MAP[ connection.internal_id ],
                    "event": connection.transition_type,
                    "color": FLOW.CONNECTION_EVENT_COLORS[connection.transition_type]
                }
            ));

            FLOW.updateState();
        });

        
        CANVAS.OVERLAY.hide();

        FLOW.init();
    }
    else {
        console.error( "Could not load Flow: invalid data format" );
    }
};



/**
 * Returns all flow data as a JSON string
 * 
 * @param   {String} flow_name the name to call the flow
 * @returns {String <JSON>}
 */
FLOW.getData = function( flow_name, args ){
    
    args = args || {};

    var useMap = !args.withNewIds;

    var _nodes = [];
    var _connections = [];

    FLOW.nodes.forEach( function( node ) {
        _nodes.push({
            "step_type":            node.type,
            "internal_id":          node.getId({ useMap: useMap }),
            "attributes" : {
                "shape":                node.shape,
                "icon":                 node.icon,
                "title":                node.title,
                "subtitle":             node.subTitle,
                "connectors":           JSON.stringify( node.connectors ),
                "tags":                 JSON.stringify( node.tags ),
                "allowed_connections":  JSON.stringify( node.allowedConnections ),
                "position":             JSON.stringify( node.position ),
                "configured":           node.configured,
                "socket":               JSON.stringify( node.socket ),
                "buttons":              JSON.stringify( node.buttons ),
                "color":                node.color
            },
            "properties":           FLOW.getNodeProperties( node.id )
        });
    });

    FLOW.connections.forEach( function( connection ) {
        _connections.push({
            "internal_id":      connection.id,
            "transition_type":  connection.event,
            "source_id":        FLOW.getNode(connection.source).getId({ useMap: useMap }),
            "target_id":        FLOW.getNode(connection.target).getId({ useMap: useMap })
        });
    });


    var first_trigger = FLOW.nodes
        .filter( function( node ){ return node.type.split("_")[0] === "trigger"; } )
        .map( function( node ){ return node.getId({ useMap: useMap }); })[0];

    var flow = {
        name: flow_name,
        canvas_zoom: CANVAS.zoomValue,
        canvas_translation: JSON.stringify( CANVAS.translation ),
        initial_step_id: first_trigger || "",
        status: FLOW.status
    };

    var data = {
        flow: flow,
        flow_steps: _nodes,
        flow_transitions: _connections
    };
    
    return JSON.stringify(data);
};