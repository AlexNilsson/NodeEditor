/* global FLOW, UTILITY */

var Vector2D = function( x, y ){
	this.x = x || 0;
	this.y = y || 0;
};

Vector2D.prototype.add = function( scalar ) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

Vector2D.prototype.sub = function( scalar ) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

Vector2D.prototype.addVector = function( vector ) {
	this.x += vector.x;
	this.y += vector.y;
	return this;
};

Vector2D.prototype.subVector = function( vector ) {
	this.x -= vector.x;
	this.y -= vector.y;
	return this;
};

Vector2D.prototype.getLength = function() {

	return Math.hypot( this.x, this.y );

};

Vector2D.prototype.getAngle = function() {

	return Math.atan2( this.y, this.x );

};

Vector2D.prototype.scale = function( x ) {
	
	this.x *= x;
	this.y *= x;
	
	return this;
};

Vector2D.prototype.rotate = function( angle ) {
	
	var length = this.getLength();
	var currentAngle = this.getAngle();

	this.x = length * Math.cos( currentAngle + angle );
	this.y = length * Math.sin( currentAngle + angle );
	
	return this;
};

Vector2D.prototype.round = function() {
	
	this.x = Math.round( this.x );
	this.y = Math.round( this.y );
	
	return this;
};

Vector2D.prototype.clone = function() {

	return new Vector2D( this.x, this.y );

};

Vector2D.prototype.normalize = function() {
	
	this.scale(1 / this.getLength() );

	return this;
};

var addVectors2D = function( a, b ) {
    return new Vector2D( a.x + b.x, a.y + b.y );
};

var subVectors2D = function( a, b ) {
    return new Vector2D( a.x - b.x, a.y - b.y );
};

var getVectorDotProduct2D = function( a, b ) {
	return a.x * b.x + a.y * b.y;
};

var toDeg = function( rad ) {
	return rad * 180 / Math.PI;
};

var toRad = function( deg ) {
	return deg * Math.PI / 180;
};