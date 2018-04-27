/* global window, d3, FLOW, UTILITY */

//* SETUP CANVAS
FLOW.canvasArea = document.getElementById("canvasArea");

FLOW.svg = d3.select('#canvasArea')
	.append('svg')
	.attr('oncontextmenu', 'return false;');


//*-------------------------------------------------------------------
//* Link markers

//* LINK END MARKER BLACK
FLOW.svg.append('svg:defs').append('svg:marker')
	.attr('id', 'end-arrow-black')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
	.append('svg:path')
		.attr('d', 'M0,-5L10,0L0,5');

//* LINK END MARKER GREEN
FLOW.svg.append('svg:defs').append('svg:marker')
	.attr('id', 'end-arrow-green')
	.attr('fill', FLOW.C.GREEN)
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
	.append('svg:path')
		.attr('d', 'M0,-5L10,0L0,5');

//* LINK END MARKER RED
FLOW.svg.append('svg:defs').append('svg:marker')
	.attr('id', 'end-arrow-red')
	.attr('fill', FLOW.C.RED)
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 6)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
	.append('svg:path')
		.attr('d', 'M0,-5L10,0L0,5');

//* LINK START MARKER
FLOW.svg.append('svg:defs').append('svg:marker')
	.attr('id', 'start-socket')
	.attr('viewBox', '0 -5 10 10')
	.attr('refX', 4)
	.attr('markerWidth', 3)
	.attr('markerHeight', 3)
	.attr('orient', 'auto')
	.append('svg:circle')
		.attr('cx', 4)
		.attr('r', 4);


//*-------------------------------------------------------------------
//* line displayed when dragging new connections

//* DRAG LINE BLACK
FLOW.svg.append('svg:path')
	.attr('class', 'link dragline black transformable hidden')
	.attr('d', 'M0,0L0,0')
	.style('marker-start', 'url(#start-socket)')
	.style('marker-end', 'url(#end-arrow-black)');

//* DRAG LINE GREEN
FLOW.svg.append('svg:path')
	.attr('class', 'link dragline green transformable hidden')
	.attr('d', 'M0,0L0,0')
	.style('marker-start', 'url(#start-socket)')
	.style('marker-end', 'url(#end-arrow-green)');

//* DRAG LINE RED
FLOW.svg.append('svg:path')
	.attr('class', 'link dragline red transformable hidden')
	.attr('d', 'M0,0L0,0')
	.style('marker-start', 'url(#start-socket)')
	.style('marker-end', 'url(#end-arrow-red)');


//*-------------------------------------------------------------------
//* Svg Shapes

//* CIRCLE
FLOW.svg.append('svg:defs').append('g').attr('id','circle')
	.append('circle')
		.attr('cx', FLOW.NODE_WIDTH/2)
		.attr('cy', FLOW.NODE_WIDTH/2)
		.attr('r', FLOW.NODE_WIDTH/2)
		.style('text-anchor', 'middle');

//* ROUNDED BOX
FLOW.svg.append('svg:defs').append('g').attr('id','roundedBox')
	.append('rect')
		.attr('x', 0)
		.attr('y', 0)
		.attr('rx', FLOW.NODE_ROUNDED_BOX_RADIUS)
		.attr('ry', FLOW.NODE_ROUNDED_BOX_RADIUS)
		.attr('width', FLOW.NODE_WIDTH)
		.attr('height', FLOW.NODE_WIDTH);

//* OCTAGON
FLOW.svg.append('svg:defs').append('g').attr('id','octagon')
	.append('polygon')
		.attr('points', UTILITY.generateSvgPolygon(8, FLOW.NODE_WIDTH));