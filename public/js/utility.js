/* global FLOW */

var UTILITY = {};


/**
 * Generates a random id
 * 
 * @returns {String}
 */
UTILITY.randomId = function(){
    var result = "";
    
    var charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for( var i=0; i < 32; i++ )
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return result;
};



/**
 * Maps actions to icons
 * 
 * @param {String} action 
 * @returns {String}
 */
UTILITY.iconForAction = function ( action ) {
    if ( action === "config") return "warning.svg";
    if ( action === "remove") return "remove.svg";

    return "warning.svg";
};



/**
 * Returns an array with the vertices of a n sided polygon
 * 
 * @param   {Number} n 
 * @returns {Array<Objects>}
 */
UTILITY.generatePolygon = function ( n ) {

	var points = [];

    points[0] = {
        x: Math.cos( 3 * Math.PI / n ) / 2,
	    y: Math.sin( 3 * Math.PI / n ) / 2
    };
	

	for ( var i = 2; i <= n; i++ ) {
        points[i-1] = {
            x: Math.cos( (2 * i * Math.PI + Math.PI) / n ) / 2,
			y: Math.sin( (2 * i * Math.PI + Math.PI) / n ) / 2
        };
	}

    return points;
};



/**
 * Returns an svg polygon with n sides
 * 
 * @param   {Number} n 
 * @param   {Number} width 
 * @returns {String <svg>}
 */
UTILITY.generateSvgPolygon = function ( n, width ) {

    var points = UTILITY.generatePolygon( n );

    var x = points.map(function(x){ return x.x;});

    var min = Math.min.apply(null,x);
    var max = Math.max.apply(null,x);

    var scale = width / (max - min);

    return points.map(
        function( point ) {
            return ( point.x * scale + width / 2 ) + "," + ( point.y * scale + width / 2 );
        }
    ).join(" ");
};



/**
 * Returns true if the arrays has at least one common entry
 * 
 * @param   {Array} arrayA 
 * @param   {Array} arrayB 
 * @returns {Boolean}
 */
UTILITY.hasCommonEntry = function (arrayA, arrayB) {
    return arrayB.some(function (x) {
        return arrayA.indexOf(x) >= 0;
    });
};



/**
 * Converts a string to its snake case equivalent:
 * Some Title -> some_title
 * 
 * @param   {String} string
 * @returns {String}
 */
UTILITY.snake_case = function( string ) {
    return string.replace(/ /g, "_").toLowerCase();
};



/**
 * Converts HEX values to DEC
 * 
 * @param {String} hex_value 
 * @returns {Number}
 */
UTILITY.hexToDec = function( hex_value ){
    return parseInt( hex_value, 16 );
};



/**
 * Converts DEC values to HEX
 * 
 * @param {Number} int 
 * @returns {String}
 */
UTILITY.decToHex = function( int ){
    return int.toString(16);
};



/**
 * 
 * 
 * @param {String<hex>} color 
 * @param {Number} factor 
 * @returns {String}
 */
UTILITY.makeHexColorBrighter = function( color, factor ) {

    // Extract Hex Values
    var r = color.substring(1,3);
    var g = color.substring(3,5);
    var b = color.substring(5,7);

    var colors = [r,g,b];

    colors = colors.map( function( color ){
        
        // decode hex to decimal value
        color = UTILITY.hexToDec( color ) + factor;

        // round and clamp max value
        color = Math.min( Math.round( color ), 255 );

        // convert back to hex
        color = UTILITY.decToHex( color );

        // add leading zero if single digit
        if ( color.length === 1 ) color = "0" + color;

        return color;
    });

    return "#" + colors.join("");
};


/**
 * Limits the length of a text string
 * 
 * @param {String} string 
 * @returns {String}
 */
UTILITY.limitTextLength = function( string ) {

    var MAX_CHARS = 10;

    var result = string.substring( 0, MAX_CHARS );

    if ( string.length > 10 ) result += '...';

    return result;

};


/**
 * Converts the first char of a string to upper case and returns
 * 
 * @param   {String} string 
 * @returns {String}
 */
function ucFirst( string ) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}