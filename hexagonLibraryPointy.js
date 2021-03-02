/**
*Copyright 2017-2021 Mark Butler
*
*This file is part of Hexagon Library.
*
*Hexagon Library is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.  You must provide attribution.
*
*Hexagon Library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
*You should have received a copy of the GNU Lesser General Public License along with Hexagon Library. If not, see http://www.gnu.org/licenses/

module.exports = {
	Point: Point,
	HexagonGridCalculator: HexagonGridCalculator,
	HexagonMapCalculator: HexagonMapCalculator,
	LineOfSight: LineOfSight
};
*/

function getEdgePointType(x,y){

	var type = '';
	var facingNumber = 0;
	var checkX = x + 0.5;
	checkX /= 2;
	var hexagonPointX = Math.floor(checkX);
	checkX = hexagonPointX % 2;
	hexagonPointX *= 2;
	if(checkX == 0){
		type = "odd";
	}
	else{
		type = "even";
	}

	var checkY = y + 1;
	if(type == "even") checkY += 2;
	checkY /= 4;
	var hexagonPointY = Math.floor(checkY);
	hexagonPointY *= 4;
	if(type == "even") hexagonPointY -= 2;

	var diffX = x - hexagonPointX;
	var diffY = y - hexagonPointY;

	if(diffX == 0 && diffY == -1) facingNumber = 1;
	if(diffX == 0.5 && diffY == -0.5) facingNumber = 2;
	if(diffX == 0.5 && diffY == 0.5) facingNumber = 3;
	if(diffX == 0 && diffY == 1) facingNumber = 4;
	if(diffX == -0.5 && diffY == 0.5) facingNumber = 5;
	if(diffX == -0.5 && diffY == -0.5) facingNumber = 6;

	return facingNumber;
}

/**
* Point
*
* The x, y coordinates are used to calculate line of sight, range, bearing and unit facing.
*
* @class Point
* @constructor
*/
function Point() {

	this.x = 0;
	this.y = 0;

	if ( Point.arguments.length == 1
			&& Point.arguments[0].constructor == Point ) {

		this.x = Point.arguments[0].x;
		this.y = Point.arguments[0].y;
	}

	if ( Point.arguments.length == 2
			&& Point.arguments[0].constructor == Number
			&& Point.arguments[1].constructor == Number ) {

		this.x = Point.arguments[0];
		this.y = Point.arguments[1];
	}
}

/**
* method to see if two points are the same
*
* @method Point.equals
* @memberof Point
* @param point {Point} another point
* @return {boolean} true/false
*/
Point.prototype.equals = function(point) {
		var isEqual;
		isEqual = false;

		if (this.x == point.getX() && this.y == point.getY()) {
			isEqual = true;
		}

		return isEqual;
}

/**
* method to get x coordinate of a Point
*
* @method Point.getX
* @return {integer} x coordinate
*/
Point.prototype.getX = function() {
	return this.x;
}

/**
* method to get y coordinate of a Point
*
* @method Point.getY
* @return {integer} y coordinate
*/
Point.prototype.getY = function() {

	return this.y;
}

/**
* method to set x, y coordinate of a Point
*
* @method Point.setXY
* @param x {integer} x coordinate
* @param y {integer} y coordinate
*/
Point.prototype.setXY = function(x, y) {

	this.x = x;
	this.y = y;
}

/**
* HexagonMapCalculator is an object that parses the screen's pixel coordinates into hexagon coordinates
*
* @class HexagonMapCalculator
* @constructor
*/
function HexagonMapCalculator(mapData) {

	var hexagonWidth, hexagonHeight;

	// x, y on map measured from upper left corner of visible map
	var mapPixel;
	// x, y on map measured from hexagon grid origin
	var gridPixel;
	// x, y from grid origin to upper left corner of map
	var offsetPixel;

	// points on the map calculated from mouse coordinates
	var hexagonPoint;
	var gridPoint;
	var edgePoint;
	var vertexPoint;

	// screen coordinates
	this.mapPixel = new Point();
	this.gridPixel = new Point();
	this.offsetPixel = new Point();

	// hexagon grid coordinates
	this.hexagonPoint = new Point();
	this.gridPoint = new Point();
	this.edgePoint = new Point();
	this.vertexPoint = new Point();

	if(mapData.hexagonGridDimentions != null){
		this.hexagonGridDimentions = mapData.hexagonGridDimentions;
		this.hexagonWidth = this.hexagonGridDimentions.hexagonWidth;
		this.hexagonHeight = this.hexagonGridDimentions.hexagonHeight;
		this.offsetPixel.x = this.hexagonGridDimentions.hexagonGridOffsetX;
		this.offsetPixel.y = this.hexagonGridDimentions.hexagonGridOffsetY;
	}
}

/**
* method to set the map x, y from the grid point coordinate
*
* @method calculateGridPixelAndMapPixelXY
*
*/
HexagonMapCalculator.prototype.calculateGridPixelAndMapPixelXY = function(gridPointX, gridPointY) {

	var halfHexagonColumnHeight = 3 * this.hexagonHeight / 8;
	var halfHexagonWidth = this.hexagonWidth / 2;
	var oneFourthHexagonWidth = this.hexagonWidth / 4;

	this.gridPixel.x = oneFourthHexagonWidth * gridPointX;
	this.gridPixel.y = halfHexagonColumnHeight * gridPointY;

	this.mapPixel.x = this.gridPixel.x - this.offsetPixel.x;
	this.mapPixel.y = this.gridPixel.y - this.offsetPixel.y;
}

/**
* method to calculate the gridPoint and hexagonPoint
*
* @method calculateGridPointAndHexagonPoint
*
*/
HexagonMapCalculator.prototype.calculateGridPointAndHexagonPoint = function() {

	var x, y;
	var TAU = Math.PI * 2;

	// vertical spacing between hexagon centers
	var verticalSpacing = 3 * this.hexagonHeight / 4;
	// add distance from (0,0) center to left edge of hexagon(0,0) to start column count
	var rowOffset = this.hexagonHeight / 2;

	var row = Math.floor((this.gridPixel.y + rowOffset) / verticalSpacing);
	var column;
	var distanceFromTopEdgeOfHexagon = (this.gridPixel.y + rowOffset) - (row * verticalSpacing);

	var hexsideHeight = this.hexagonHeight / 4;
	var halfHexagonWidth = this.hexagonWidth / 2;
	var oneFourthHexagonWidth = this.hexagonWidth / 4;

	var distanceFromLeftEdgeOfHexagon;
	
	if (distanceFromTopEdgeOfHexagon < hexsideHeight){
		y = (2 * row) - 1;
		column = Math.floor(this.gridPixel.x / halfHexagonWidth);
		x = (2 * column) + 1;
		distanceFromLeftEdgeOfHexagon = this.gridPixel.x - (column * halfHexagonWidth);
	}
	else {
		// it's a center or left hexside
		y = 2 * (row);
		column = Math.floor( (this.gridPixel.x + oneFourthHexagonWidth) / halfHexagonWidth );
		x = (2 * column);
		distanceFromLeftEdgeOfHexagon = this.gridPixel.x + oneFourthHexagonWidth - (column * halfHexagonWidth);
	}

	this.gridPoint.setXY(x, y);
	var hexagonGridCalculator = new HexagonGridCalculator();
	hexagonGridCalculator.setPoint(this.gridPoint);

	switch (hexagonGridCalculator.getGridPointType()) {
			case 0:
				this.hexagonPoint.setXY(x, y);
				this.edgePoint.setXY(x,y);
				this.tangent = 0;
				this.degrees = 0;
				break;

			case 1:
				if (distanceFromLeftEdgeOfHexagon < oneFourthHexagonWidth){
					this.hexagonPoint.setXY(x - 2, y);
					this.edgePoint.setXY(x - 1, y);
				}
				else {
					this.hexagonPoint.setXY(x + 2, y);
					this.edgePoint.setXY(x + 1, y);
				}
				this.tangent = 0;
				this.degrees = 0;
				break;

			case 2:
				// check the tangent of the hexside line with tangent of the map point
				//
				// the hexside line tangent is opposite / adjacent = hexsideHeight / halfHexagonWidth
				// the map point tangent is opposite / adjacent =	distanceFromTopEdgeOfHexagon / distanceFromLeftEdgeOfHexagon
				//
				// is map point tangent <	line tangent ?
				// (distanceFromTopEdgeOfHexagon / distanceFromLeftEdg-eOfHexagon) < (hexsideHeight / halfHexagonWidth)
				//
				// multiply both sides by halfHexagonWidth
				// (distanceFromTopEdgeOfHexagon / distanceFromLeftEdgeOfHexagon) * halfHexagonWidth	< (hexsideHeight )
				//
				// multiply both sides by this.distanceFromTopEdgeOfHexagon
				// (distanceFromTopEdgeOfHexagon * halfHexagonWidth ) < (distanceFromLeftEdgeOfHexagon * hexsideHeight)
				//
				if (distanceFromTopEdgeOfHexagon * halfHexagonWidth < distanceFromLeftEdgeOfHexagon * hexsideHeight) {
				//	_______
				//	|			/|
				//	|	*	 / |
				//	|	 /	 |
				//	|/_____|
				//
					this.hexagonPoint.setXY(x - 1, y - 1);
					this.edgePoint.setXY(x - 0.5, y - 0.5);
				}
				else {
				//	_______
				//	|			/|
				//	|		/	 |
				//	|	 / * |
				//	|/_____|
				//
					this.hexagonPoint.setXY(x + 1, y + 1);
					this.edgePoint.setXY(x + 0.5, y + 0.5);
				}
				if(distanceFromLeftEdgeOfHexagon > 0) {
					this.tangent = distanceFromTopEdgeOfHexagon / distanceFromLeftEdgeOfHexagon;
					this.degrees = Math.floor(Math.atan(this.tangent) * (360 / TAU));
				}
				else {
					this.tangent = 0;
					this.degrees = 0;
				}
				break;

			case 6:
				// check the tangent of the hexside line with tangent of the map point
				//
				// see above
				//
				//	 check from right side now
				var distanceFromBottomEdgeOfHexagon = hexsideHeight - distanceFromTopEdgeOfHexagon;
				if (distanceFromBottomEdgeOfHexagon * halfHexagonWidth < distanceFromLeftEdgeOfHexagon * hexsideHeight)	{
				//	 _______
				//	|\	    |
				//	|	 \		|
				//	|	*	 \  |
				//	|______\|
				//
					this.hexagonPoint.setXY(x - 1, y + 1);
					this.edgePoint.setXY(x - 0.5, y + 0.5);
				}
				else {
				//  _______
				//	|\	   |
				//  |	 \ * |
				//	|		\	 |
				//	|_____\|
				//
					this.hexagonPoint.setXY(x + 1, y - 1);
					this.edgePoint.setXY(x + 0.5, y - 0.5);
				}
        if (distanceFromBottomEdgeOfHexagon > 0)  {
          this.tangent = distanceFromLeftEdgeOfHexagon / distanceFromBottomEdgeOfHexagon;
          this.degrees = Math.floor(Math.atan(this.tangent) * (360 / TAU));
        }
        else {
          this.tangent = 0;
          this.degrees = 0;
        }
				break;
	}
}

/**
* method to calculate the Vertex
*
* @method calculateVertexPoint
*
*/
HexagonMapCalculator.prototype.calculateVertexPoint = function() {

	this.vertexPoint.x = 0;
	this.vertexPoint.y = 0;
	this.vertexType = "";
	this.vertexTypeNumber = 0;

	var verticalSpacing = 3 * this.hexagonHeight / 4;
	var vertexRow = verticalSpacing / 3;

	// move left edge over 1/2 vertexRow to adjust rows
	//	then divide by 1/3 vertical spacing which is the vertex row width
	var row = Math.floor((this.gridPixel.y + (vertexRow / 2))/ vertexRow);
	this.vertexPoint.y =  row * 2;

	// move left 1/8 hexagon width to adjust columns
	//	then divide by 1/4 hexagon width, then multiply by 3 to adjust scale to x scale
	var oneFourthHexagonWidth = this.hexagonWidth / 4;
	this.vertexPoint.x = (Math.floor((this.gridPixel.x + (oneFourthHexagonWidth/2)) / oneFourthHexagonWidth)) * 3;

	this.calculateVertexType();
}

/**
* method to set calculate vertex type
*
* @method calculateVertexType
*/
HexagonMapCalculator.prototype.calculateVertexType = function() {

	this.vertexTypeNumber = ((this.vertexPoint.x % 12) + 1) * 100;
	this.vertexTypeNumber += (this.vertexPoint.y % 12) + 1;
	this.vertexType = "";
	switch(this.vertexTypeNumber){
		case 11:
		case 40:
			this.vertexType = "N corner";
			break;
		case 20:
		case 51:
			this.vertexType = "S corner";
			break;
		case 20:
		case 44:
			this.vertexType = "edge";
			break;
		case 30:
		case 54:
			this.vertexType = "edge";
			break;
		case 24:
		case 60:
			this.vertexType = "edge";
			break;
		case 14:
		case 50:
			this.vertexType = "edge";
			break;
		case 40:
		case 64:
			this.vertexType = "edge";
			break;
		case 34:
		case 70:
			this.vertexType = "edge";
			break;
	}
}

/**
* method to get edgePoint
*
* @method getEdgePoint
* @return {Point}
*/
HexagonMapCalculator.prototype.getEdgePoint = function () {
	return this.edgePoint;
}

/**
* method to get Degrees
*
* @method getDegrees
* @return {int}
*/
HexagonMapCalculator.prototype.getDegrees = function () {
	return this.degrees;
}

/**
* method to get GridPixel
*
* @method getGridPixel
* @return {Point}
*/
HexagonMapCalculator.prototype.getGridPixel = function() {
	return this.gridPixel;
}

/**
* method to get GridPoint
*
* @method getGridPoint
* @return {Point}
*/
HexagonMapCalculator.prototype.getGridPoint = function() {
		return this.gridPoint;
}

/**
* method to get Hexagon Point
*
* @method getHexagonPoint
* @return {Point} hexagon
*/
HexagonMapCalculator.prototype.getHexagonPoint = function() {
		return this.hexagonPoint;
}

/**
* method to get HexagonHeight
*
* @method getHexagonHeight
* @return {int} hexagon height
*/
HexagonMapCalculator.prototype.getHexagonHeight = function() {
		return this.hexagonGridDimentions.hexagonHeight;
}

/**
* method to get HexagonWidth
*
* @method getHexagonWidth
* @return {int} hexagon width
*/
HexagonMapCalculator.prototype.getHexagonWidth = function() {
		return this.hexagonGridDimentions.hexagonWidth;
}

/**
* method to get MapPixel
*
* @method getMapPixel
* @return {Point} mapPixel
*/
HexagonMapCalculator.prototype.getMapPixel = function() {
		return this.mapPixel;
}

/**
* method to get mapPixelHexagonCornerPoint
*
* @method getMapPixelCorner
* @param {integer} direction
* @return {Point} mapPixel
*/
HexagonMapCalculator.prototype.getMapPixelHexagonCornerPoint = function(direction) {

	var halfHexsideWidth = this.hexagonWidth / 2;
	var quarterHexagonHeight = this.hexagonHeight / 4;

	var point = new Point();

		switch(direction) {

			case 1:
				point.x = this.mapPixel.x - halfHexsideWidth;
				point.y = this.mapPixel.y - quarterHexagonHeight;
				break;

			case 2:
				point.x = this.mapPixel.x;
				point.y = this.mapPixel.y - (2 * quarterHexagonHeight);
				break;

			case 3:
				point.x = this.mapPixel.x + halfHexsideWidth;
				point.y = this.mapPixel.y - quarterHexagonHeight;
				break;

			case 4:
				point.x = this.mapPixel.x + halfHexsideWidth;
				point.y = this.mapPixel.y + quarterHexagonHeight;
				break;

			case 5:
				point.x = this.mapPixel.x;
				point.y = this.mapPixel.y + (2 * quarterHexagonHeight);
			 break;

			case 6:
				point.x = this.mapPixel.x - halfHexsideWidth;
				point.y = this.mapPixel.y + quarterHexagonHeight;
			 break;
		}
		return point;
	}

/**
* method to get tangent
*
* @method getTangent
* @return {number} tangent
*/
HexagonMapCalculator.prototype.getTangent = function() {
		return this.tangent;
}

/**
* method to get vertex point
*
* @method getVertexPoint
* @return {Point} vertexPoint
*/
HexagonMapCalculator.prototype.getVertexPoint = function() {
		return this.vertexPoint;
}

/**
 * method to get vertex type
 * 
 * @method getVertexType
 * @return {string} vertexType
 * 
 */
HexagonMapCalculator.prototype.getVertexType = function(){
	return this.vertexType;
}

/**
 * method to get vertex type number
 * 
 * @method getVertexTypeNumber
 * @return {integer} vertexTypeNumber
 * 
 */
HexagonMapCalculator.prototype.getVertexTypeNumber = function(){
	return this.vertexTypeNumber;
}

/**
* method to set the hexagon grid dimentions
*
* @method setHexagonGridDimentions
* @param {integer} x hexagon coordinate
* @param {integer} y hexagon coordinate
*/
HexagonMapCalculator.prototype.setHexagonGridDimentions = function(hexagonGridDimentions) {
	this.hexagonWidth = hexagonGridDimentions.hexagonWidth;
	this.hexagonHeight = hexagonGridDimentions.hexagonHeight;
	this.offsetPixel.x = hexagonGridDimentions.offsetPixelX;
	this.offsetPixel.y = hexagonGridDimentions.offsetPixelY;
}


/**
* method to set the edge point x, y
*
* @method setEdgePointXY
* @param {integer} x coordinate
* @param {integer} y coordinate
*/
HexagonMapCalculator.prototype.setEdgePointXY = function (x, y) {
	this.gridPoint.setXY(x, y);
	var hexagonGridCalculator = new HexagonGridCalculator();
	hexagonGridCalculator.setPoint(this.gridPoint);
	this.hexagonPoint.setXY(hexagonGridCalculator.getReferenceHexagonPoint().getX(), hexagonGridCalculator.getReferenceHexagonPoint().getY());
	this.calculateGridPixelAndMapPixelXY(x, y);
}

/**
* method to set the map x, y from the grid point coordinate
*
* @method setGridPixelXY
*
*/
HexagonMapCalculator.prototype.setGridPixelXY = function(x,y) {

	var halfHexagonColumnHeight = 3 * this.hexagonHeight / 8;
	var oneFourthHexagonWidth = this.hexagonWidth / 4;

	this.gridPixel.x = oneFourthHexagonWidth * x;
	this.gridPixel.y = halfHexagonColumnHeight * y;

	this.mapPixel.x = this.gridPixel.x - this.offsetPixel.x;
	this.mapPixel.y = this.gridPixel.y - this.offsetPixel.y;
}
/**
* method to set the grid point x, y
*
* @method setGridPointXY
* @param {integer} x coordinate
* @param {integer} y coordinate
*/
HexagonMapCalculator.prototype.setGridPointXY = function(x, y){
	this.gridPoint.setXY(x, y);
	var hexagonGridCalculator = new HexagonGridCalculator();
	hexagonGridCalculator.setPoint(this.gridPoint);
	this.hexagonPoint.setXY(hexagonGridCalculator.getReferenceHexagonPoint().getX(), hexagonGridCalculator.getReferenceHexagonPoint().getY());
	this.calculateGridPixelAndMapPixelXY(x, y);
}

/**
* method to set the hexagon x, y
*
* @method setHexagonXY
* @param {integer} x hexagon coordinate
* @param {integer} y hexagon coordinate
*/
HexagonMapCalculator.prototype.setHexagonXY = function(x, y) {
	this.hexagonPoint.setXY(x, y);
	this.gridPoint.setXY(x, y);
	this.calculateGridPixelAndMapPixelXY(x, y);
}

/**
* method to set the hexagon point	x, y
*
* @method setHexagonPointXY
* @param {integer} x hexagon coordinate
* @param {integer} y hexagon coordinate
*/
HexagonMapCalculator.prototype.setHexagonPointXY = function(x, y) {
	this.hexagonPoint.setXY(x, y);
	this.gridPoint.setXY(x, y);
	this.calculateGridPixelAndMapPixelXY(x, y);
}

/**
* method to set the hexagon width and height
*
* @method setHexagonWidthAndHeight
* @param {integer} width
* @param {integer} height
*/

HexagonMapCalculator.prototype.setHexagonWidthAndHeight = function(width, height) {
	this.hexagonWidth = width;
	this.hexagonHeight = height;
}

/**
* method to set the setMapPixelXY
*
* @method setMapPixelXY
* @param {integer} x
* @param {integer} y
*/
HexagonMapCalculator.prototype.setMapPixelXY = function(x, y) {

	this.mapPixel.x = x;
	this.mapPixel.y = y;

	// adjust for origin
	this.gridPixel.x = this.mapPixel.x + this.offsetPixel.x;
	this.gridPixel.y = this.mapPixel.y + this.offsetPixel.y;

	this.calculateGridPointAndHexagonPoint();
	this.calculateVertexPoint();
}

/**
* method to set the offset pixel
*
* @method setOffsetPixel
* @param {integer} x
* @param {integer} y
*/
HexagonMapCalculator.prototype.setOffsetPixel = function(x,y) {
	this.offsetPixel = new Point(x,y);
}

/**
* method to set the vertex
*
* @method setVertexPointWithHexagonXYandDirection
* @param {integer} x
* @param {integer} y
* @param {integer} direction
*/
HexagonMapCalculator.prototype.setVertexPointWithHexagonXYandDirection = function(x, y, direction) {
	this.setHexagonPointXY(x,y);
	var vertexPoint = this.getMapPixelHexagonCornerPoint(direction);
}

/**
* method to set the vertex point
*
* @method setVertexPointWithHexagonXYandDirection
* @param {integer} x
* @param {integer} y
*/
HexagonMapCalculator.prototype.setVertexPointXY = function(x, y) {
	var verticalSpacing = 3 * this.hexagonHeight / 4;
	var vertexRowSize = verticalSpacing / 6;
	var vertexColumnSize = this.hexagonWidth / 12;

	this.vertexPoint.x = x;
	this.vertexPoint.y = y;

	this.calculateVertexType();

	// calculate gridPixel
	this.gridPixel.x = vertexColumnSize * x;
	this.gridPixel.y = vertexRowSize * y;

	this.mapPixel.x = this.gridPixel.x - this.offsetPixel.x;
	this.mapPixel.y = this.gridPixel.y - this.offsetPixel.y;

	this.gridPoint.x = (x/3).toFixed(1);
	this.gridPoint.y = (y/3).toFixed(1)
}

/**
*Copyright 2017 Mark Butler
*
*This file is part of Hexagon Library.
*
*Hexagon Library is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
*
*Hexagon Library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
*You should have received a copy of the GNU Lesser General Public License along with Hexagon Library. If not, see http://www.gnu.org/licenses/.
*/

/**
* HexagonGridCalculator
*
*/

/*
// coordinate types
const HEXAGON_CENTER = 0;
const CENTER_HEXAGON = 0;
const NULL_HEXSIDE = 0;
const LEFT_HEXSIDE = 1;
const UPPER_LEFT_HEXSIDE = 2;
const UPPER_RIGHT_HEXSIDE = 3;
const RIGHT_HEXSIDE = 4;
const LOWER_RIGHT_HEXSIDE = 5;
const LOWER_LEFT_HEXSIDE = 6;
*/
/*
var gridPointPointyTypeStringArray = [];
gridPointPointyTypeStringArray[0] = "CENTER_HEXAGON";
gridPointPointyTypeStringArray[1] = "LEFT_HEXSIDE";
gridPointPointyTypeStringArray[2] = "UPPER_LEFT_HEXSIDE";
gridPointPointyTypeStringArray[3] = "UPPER_RIGHT_HEXSIDE";
gridPointPointyTypeStringArray[4] = "RIGHT_HEXSIDE";
gridPointPointyTypeStringArray[5] = "LOWER_RIGHT_HEXSIDE";
gridPointPointyTypeStringArray[6] = "LOWER_LEFT_HEXSIDE";


function getGridPointPointyTypeNumberFromString(s) {
	var gridPointTypeNumber = 0;
	for( var i = 0; i < gridPointTypeStringArray.length; i++ ) {
		if( gridPointTypeStringArray[i] == s ) {
			gridPointTypeNumber = i;
			break;
		}
	}
	return i;
}
*/

function HexagonGridCalculator(mapType) {
	var hexagonGridCalculator;
	hexagonGridCalculator = new HexagonGridCalculator();
	return hexagonGridCalculator;
}

/** HexagonGridCalculator calculates the name of a hexagon coordinate system point
*	 and determines if it is a hexside or a hexagon center
*
* @class HexagonGridCalculator
* @constructor
*/
function HexagonGridCalculator(){

	var gridPoint;
	var gridPointType;
	var referenceHexagonPoint;

	this.gridPoint = new Point();
	this.name = "";
	this.referenceHexagonPoint = new Point();
}

/**
* method to calculate the name
*
* @method calculateReferenceHexagonPoint
*
*/
HexagonGridCalculator.prototype.calculateReferenceHexagonPoint = function() {

 	switch (this.gridPointType) {

			case 0:
			this.referenceHexagonPoint.setXY(this.x, this.y);
			break;

			case 1:
			this.referenceHexagonPoint.setXY(this.x + 2, this.y);
			break;

			case 2:
			this.referenceHexagonPoint.setXY(this.x + 1, this.y + 1);
			break;

			case 6:
			this.referenceHexagonPoint.setXY(this.x + 1, this.y - 1);
			break;
	}
}

/**
* method to calculate the gridPoint type
*
* @method calculateGridPointType
*
*/
HexagonGridCalculator.prototype.calculateGridPointType = function() {

	this.gridPointType = null;
	var modX = this.x % 4;
	var modY = this.y % 4;
		 // 8 cases
	switch (modX) {
 		case 0:
			switch (modY) {
				case 0:
					this.gridPointType = 0;
					break;
				case 2:
					this.gridPointType = 1;
					break;
			}
			break;

 		case 1:
			switch (modY) {
				case 1:
					this.gridPointType = 2;
					break;
				case 3:
					this.gridPointType = 6;
					break;
			}
			break;

 		case 2:
			switch (modY) {
				case 0:
					this.gridPointType = 1;
					break;
				case 2:
					this.gridPointType = 0;
					break;
			}
	 		break;

	 	case 3:
			switch (modY) {
				case 1:
					this.gridPointType = 6;
					break;
				case 3:
					this.gridPointType = 2;
					break;
			}
			break;
			}
	//if( this.gridPointType == null )
	//{
		//console.log("bad HexagonGridCalculator construct");
	//}
}

/**
* method to calculate the adjacent hexagon
*
* @method getAdjacentHexagonPoint
*
* @param direction {integer} W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
* @return {Point} point
*/
HexagonGridCalculator.prototype.getAdjacentHexagonPoint = function(direction) {

	// CONSTANTS set in constants.js
	// direction W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
	// range :	HEXSIDE_DISTANCE = 1, HEXAGON_DISTANCE = 2

	return this.getAdjacentPoint(direction, 2);
}

/**
* method to calculate the adjacent grid point
*
* @method getAdjacentGridPoint
*
* @param direction {integer} W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
* @return {Point} point
*/
HexagonGridCalculator.prototype.getAdjacentGridPoint = function(direction) {

	// CONSTANTS set in constants.js
	// direction W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
	// range :	HEXSIDE_DISTANCE = 1, HEXAGON_DISTANCE = 2

	return this.getAdjacentPoint(direction, 1);
}

/**
* method to calculate the adjacent point
*
* @method getAdjacentPoint
*
* @param direction {integer} W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
* @param range {integer} HEXSIDE_DISTANCE = 1, HEXAGON_DISTANCE = 2
* @return {Point} point
*/
HexagonGridCalculator.prototype.getAdjacentPoint = function(direction, range) {

	// CONSTANTS set in constants.js
	// direction W = 1, NW = 2, NE = 3, E = 4, SE = 5, SW = 6
	// range :	HEXSIDE_DISTANCE = 1, HEXAGON_DISTANCE = 2

	var pointXadjustment = new Array( 0, -2, -1,	1,	2,	1, -1 );
	var pointYadjustment = new Array( 0,	0, -1, -1,	0,	1,	1 );

	var pointX, pointY;
	pointX = this.x + pointXadjustment[direction] * range;
	pointY = this.y + pointYadjustment[direction] * range;

	var point = new Point(pointX, pointY);

	return point;
}

/**
* method to get GridPoint
*
* @method getGridPoint
* @return {GridPoint} gridPoint
*/
HexagonGridCalculator.prototype.getGridPoint = function() {
	return this.gridPoint;
}

/**
* method to get gridPointType
*
* method getGridPointType
* @return {integer} gridPointType
*/
HexagonGridCalculator.prototype.getGridPointType = function() {
	return this.gridPointType;
}

/**
* method to get gridPointTypeConstant
*
* @method getPointTypeConstant
* @return {integer} pointType CONSTANT name
*/
HexagonGridCalculator.prototype.getGridPointTypeConstant = function() {
		var gridPointTypeConstant = new Array("CENTER_HEXAGON", "LEFT_HEXSIDE", "UPPER_LEFT_HEXSIDE", "UPPER_RIGHT_HEXSIDE", "RIGHT_HEXSIDE", "LOWER_RIGHT_HEXSIDE", "LOWER_LEFT_HEXSIDE");
		return gridPointTypeConstant[this.gridPointType];
}

/**
* method to get type as a string
*
* @method getGridPointTypeName
* @return {String} name of gridPointType type
*/
HexagonGridCalculator.prototype.getGridPointTypeName = function() {
		var gridPointTypeName = new Array("center", "left", "upperLeft", "upperRight", "right", "lowerRight", "lowerLeft");
		return gridPointTypeName[this.gridPointType];
}

/**
* method to get of reference hexagon
*
* @method getReferenceHexagon
* @return {Point}	of reference coordinate
*/
HexagonGridCalculator.prototype.getReferenceHexagonPoint = function() {
	return this.referenceHexagonPoint;
}

/**
* method to get x coordinate of gridPoint
*
* @method getX
* @return {integer} x coordinate
*/
HexagonGridCalculator.prototype.getX = function() {
	return this.x;
}

/**
* method to get y coordinate of gridPoint
*
* @method getY
* @return {integer} y coordinate
*/
HexagonGridCalculator.prototype.getY = function() {
	return this.y;
}

/**
* method to check if gridPoint is a center type
*
* @method isCenter
* @return {boolean}
*/
HexagonGridCalculator.prototype.isCenter = function() {
	var isCenter = false;

	if( this.gridPointType == 0 ) 	{
		isCenter = true;
	}
	return isCenter;
}

/**
* method to check if gridPoint is a hexside type
*
* @method isHexside
* @return {boolean}
*/
HexagonGridCalculator.prototype.isHexside = function() {
	var isHexside = true;
	if( this.gridPointType == 0) {
		isHexside = false;
	}
	return isHexside;
}

/**
* method to set the gridPoint point
*
* @method setPoint
* @param point {point} point
*/
HexagonGridCalculator.prototype.setPoint = function(point) {
	var x = point.getX();
	var y = point.getY();
	this.setXY(x,y);
}
/**
* method to set the gridPoint x, y
*
* @method setXY
* @param x {integer} x
* @param y {integer} y
*/
HexagonGridCalculator.prototype.setXY = function(x, y) {
	this.x = x;
	this.y = y;

	this.calculateGridPointType();
	this.calculateReferenceHexagonPoint();
}

/**
*Copyright 2017 Mark Butler
*
*This file is part of Hexagon Library.
*
*Line of Sight Calculator Library is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
*
*Line of Sight Calculator Library is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
*You should have received a copy of the GNU Lesser General Public License along with Line of Sight Calculator Library. If not, see http://www.gnu.org/licenses/
*/

/**
* Line of Sight Calculator
*
*/

/**
* LineOfSight is an object that calculates Line of Sight.
*
* The line of Sight provides range, bearing, and facing.
*
* The line of Sight also contains an array of the hexagons and hexsides on the path of the line of sight.
*
* @class LineOfSight
* @constructor
*/
function LineOfSight()
{
	this.originX = 0;
	this.originY = 0;
	this.endPointX = 0;
	this.endPointY = 0;
	this.hexagonRange = 0;
	//this.gridRange = 0;
	this.bearingNumber = 0;
	this.facing = 0;
	this.bearingNumberArray = [];
	this.blocked = false;
	this.isCornerExpanded = true;
	this.isMiddleHexsideIncluded = false;
	this.losArray = [];

	// a "los bearing number" is either a 30 degree line or an area between (2) 30 degree lines on a compass
	this.bearingNumberArray = [
		0,	1,	2,	3,	4,	5,	6,
		0, 11, 10,	9,	8,	7,	0,
	 12, 13, 14, 15, 16, 17, 18,
		0, 23, 22, 21, 20, 19,	0];
}

/**
* @method caclulateBearingNumber
*
*/
LineOfSight.prototype.caclulateBearingNumber = function()
{
	var delta_x, delta_y;
	var absolute_x, absolute_y;
	var y3times, sector, quadrant;

	//	step 1. find the delta
	delta_x = this.endPointX - this.originX;
	delta_y = this.endPointY - this.originY;

	//	step 2. check if at the origin
	if( delta_x == 0 && delta_y == 0 ) {
		this.bearingNumber = -1;
	} else {
	//	step 3. find the sector

		absolute_x = Math.abs(delta_x);
		absolute_y = Math.abs(delta_y);
		y3times = 3 * absolute_y;
		if( delta_y == 0 )										sector = 1;
			else {
				if(delta_x == 0)									sector = 7;
				else {
				if( absolute_y == absolute_x)			sector = 5;
				else {
					if(absolute_y > absolute_x)			sector = 6;
					else {
						if( y3times == absolute_x)		sector = 3;
						else {
							if( y3times < absolute_x)		sector = 2;
							else												sector = 4;
							}
						}
					}
			}
		}

		//	step 4. find the quadrant
		if( delta_y >= 0 ) 	{
			if( delta_x < 0)	quadrant = 4;
			else							quadrant = 3;
		}
		else {
			if( delta_x > 0)	quadrant = 2;
			else							quadrant = 1;
		}

		this.bearingNumber = this.bearingNumberArray[((quadrant - 1) * 7) + sector - 1];
	}

	this.quadrant = quadrant;
	this.sector = sector;
}

/**
* @method calculateFacing
*
* direction	N = 1, NE = 2, SE = 3, S = 4, SW = 5, NW = 6
*/
LineOfSight.prototype.calculateFacing = function()
{

	this.facing = Math.floor((this.bearingNumber + 1)/ 4) + 1;
}

/**
* @method calculateLosArray
* @return { Array } array
*/
LineOfSight.prototype.calculateLosArray = function()
{
	this.losArray = [];
	var hexagonLosArray = [];

	var b, x, y, x1, y1, x2, y2, i, pointX, pointY;
	var offset1, offset2;

	var stepX = [ -4, -6, -2,	0,	2,	6,	4,	6,	2,	0, -2, -6, -4 ];
	var stepY = [	0, -2, -2, -4, -2, -2,	0,	2,	2,	4,	2,	2,	0 ];

	// check to make sure orgin and endpoint are hexagons
	var hgc = new HexagonGridCalculator();
	hgc.setXY(this.originX,this.originY);
	var isOriginHexagon = hgc.isCenter();
	hgc.setXY(this.endPointX,this.endPointY);
	var isEndPointHexagon = hgc.isCenter();

	if(isOriginHexagon && isEndPointHexagon){
	b = this.getBearingNumber();

	if ( b >= 0 ) {

		// for even bearing numbers
		if ( ( b % 2 ) == 0 ) {

			i =	Math.floor( b / 2 ) ;
			x = this.originX;
			y = this.originY;

			var origin = new Point(x, y);
			this.losArray.push(origin);
			do {
				// if corner
				if ( this.bearingIsCornerType() && this.isCornerExpanded ) {
					// corner types are: 2,	6, 10, 14, 18,	22
					// i values are:		 1,	3,	5,	7,	9,	11
					// add 2 near corner hexsides
					pointX = ( x + ( x + stepX[i-1] ) ) / 2;
					pointY = ( y + ( y + stepY[i-1] ) ) / 2;

					var nearLeftHexside = new Point(pointX, pointY);
					this.losArray.push(nearLeftHexside);

					pointX = ( x + ( x + stepX[i+1] ) ) / 2;
					pointY = ( y + ( y + stepY[i+1] ) ) / 2;

					var nearRightHexside = new Point(pointX, pointY);
					this.losArray.push(nearRightHexside);

					pointX = x + stepX[i-1];
					pointY = y + stepY[i-1];

					var leftHexagon = new Point(pointX, pointY);
					this.losArray.push(leftHexagon);
				} // end if corner

				var checkMiddleHexside = true;
				if(this.bearingIsCornerType() && this.isMiddleHexsideIncluded == false){
					checkMiddleHexside = false
				}
				if(checkMiddleHexside){
					// middle hexside
					pointX = ( x + (x + stepX[i]) ) / 2;
					pointY = ( y + (y + stepY[i]) ) / 2;

					var middleHexside = new Point(pointX, pointY);
					this.losArray.push(middleHexside);
				}

				// if corner again
				if ( this.bearingIsCornerType() && this.isCornerExpanded	) {
					// corner types are: 2,	6, 10, 14, 18,	22
					// i values are:		 1,	3,	5,	7,	9,	11

					pointX = x + stepX[i+1];
					pointY = y + stepY[i+1];

					var rightHexagon = new Point(pointX, pointY);
					this.losArray.push(rightHexagon);

					// add 2 far corner hexsides
					pointX = ( x + ( x + stepX[i] + stepX[i-1] ) ) / 2;
					pointY = ( y + ( y + stepY[i] + stepY[i-1] ) ) / 2;

					var farLeftHexside = new Point(pointX, pointY);
					this.losArray.push(farLeftHexside);

					pointX = ( x + ( x + stepX[i] + stepX[i+1] ) ) / 2;
					pointY = ( y + ( y + stepY[i] + stepY[i+1] ) ) / 2;

					var farRightHexside = new Point(pointX, pointY);
					this.losArray.push(farRightHexside);
				} // end if corner

				// then do hexagon
				x = x + stepX[i];
				y = y + stepY[i];

				var nextHexagon = new Point(x, y);
				this.losArray.push(nextHexagon);
			// end do loop
			} while ( ( x != this.endPointX ) || ( y != this.endPointY ));

		// end if even bearing number check
		} else {

			// for odd bearing numbers zigzag
			i = Math.floor( b / 4 ) * 2 ;
			x = this.originX;
			y = this.originY;

			var origin = new Point(x, y);
			this.losArray.push(origin);

			do {
				x1 = x + stepX[i];
				y1 = y + stepY[i];
				x2 = x + stepX[i+2];
				y2 = y + stepY[i+2];

				// it's this easy
				offset1 = Math.abs( this.originX*this.endPointY - this.originX*y1 - this.endPointX*this.originY + this.endPointX*y1 + x1*this.originY - x1*this.endPointY );
				offset2 = Math.abs( this.originX*this.endPointY - this.originX*y2 - this.endPointX*this.originY + this.endPointX*y2 + x2*this.originY - x2*this.endPointY );

				if ( offset1 != offset2 ) {
					if ( offset1 < offset2 ) {
						pointX = ( x + x1 ) / 2;
						pointY = ( y + y1 ) / 2;
						x = x1;
						y = y1;
					} else {
						pointX = ( x + x2 ) / 2;
						pointY = ( y + y2 ) / 2;
						x = x2;
						y = y2;
					}

					var hexside = new Point(pointX, pointY);
					this.losArray.push(hexside);

					var nextHexagon = new Point(x, y);
					this.losArray.push(nextHexagon);
				} else {

					// offset1 == offset2
					// double hexagon traverse
					// first of near hexagons
					var leftHexagon = new Point(x1, y1);

					// second of near hexagon
					var rightHexagon = new Point(x2, y2);
					// wait till hexside to push

					// find the first near hexside
					var leftHexsideX = (x + x1) / 2;
					var leftHexsideY = (y + y1) / 2;
					var leftHexsideOffset = Math.abs( this.originX*this.endPointY - this.originX*leftHexsideY - this.endPointX*this.originY + this.endPointX*leftHexsideY + leftHexsideX*this.originY - leftHexsideX*this.endPointY );

					// find the second near hexside
					var rightHexsideX = (x + x2) / 2;
					var rightHexsideY = (y + y2) / 2;
					var rightHexsideOffset = Math.abs( this.originX*this.endPointY - this.originX*rightHexsideY - this.endPointX*this.originY + this.endPointX*rightHexsideY + rightHexsideX*this.originY - rightHexsideX*this.endPointY );

					var nearHexside = new Point();
					// select closest
					if( leftHexsideOffset < rightHexsideOffset ) {
						nearHexside.setXY(leftHexsideX, leftHexsideY);
					} else {
						nearHexside.setXY(rightHexsideX, rightHexsideY);
					}

					// find middle hexside
					pointX =	x + ((stepX[i] + stepX[i+2]) / 2 );
					hexsideY =	y + ((stepY[i] + stepY[i+2]) / 2 );
					var middleHexside = new Point(pointX, hexsideY);

					// find hexagon which is at range of 2
					x = x + stepX[i] + stepX[i+2];
					y = y + stepY[i] + stepY[i+2];
					var endHexagon = new Point(x, y);

					// x,y have changed to far hexagon
					// find the first far hexside
					var farLeftHexsideX = (x + x1) / 2;
					var farLeftHexsideY = (y + y1) / 2;
					var farLeftHexsideOffset = Math.abs( this.originX*this.endPointY - this.originX*farLeftHexsideY - this.endPointX*this.originY + this.endPointX*farLeftHexsideY + farLeftHexsideX*this.originY - farLeftHexsideX*this.endPointY );

					// find the second far hexside
					var farRightHexsideX = (x + x2) / 2;
					var farRightHexsideY = (y + y2) / 2;
					var farRightHexsideOffset = Math.abs( this.originX*this.endPointY - this.originX*farRightHexsideY - this.endPointX*this.originY + this.endPointX*farRightHexsideY + farRightHexsideX*this.originY - farRightHexsideX*this.endPointY );

					var farHexside = new Point();
					// select closest
					if( farLeftHexsideOffset < farRightHexsideOffset ) {
						farHexside.setXY(farLeftHexsideX, farLeftHexsideY);
					}	else {
						farHexside.setXY(farRightHexsideX, farRightHexsideY);
					}

					this.losArray.push(nearHexside);
					this.losArray.push(leftHexagon);
					this.losArray.push(middleHexside);
					this.losArray.push(rightHexagon);
					this.losArray.push(farHexside);
					this.losArray.push(endHexagon);
				} // end if offset1 == offset2
			// end do loop
			} while ( ( x != this.endPointX) || ( y != this.endPointY ) );
		} // end if odd bearing number
	 } // end if bearing number is valid
	}
}

/**
* @method getBearingNumber
* @return { integer } bearingNumber 0 .. 23
*/
LineOfSight.prototype.getBearingNumber = function()
{
	return this.bearingNumber;
}

/**
* @method getFacing
* @return { integer } facing
* direction	N = 1, NE = 2, SE = 3, S = 4, SW = 5, NW = 6
*/
LineOfSight.prototype.getFacing = function()
{
	return this.facing;
}

/**
* @method getLosList
* @return { Array } array
*/
LineOfSight.prototype.getLosList = function()
{
	return this.losArray;
}

/**
* @method getLosArray
* @return { Array } array
*/
LineOfSight.prototype.getLosArray = function()
{
	return this.losArray;
}


/**
* @method getHexagonLosArray
* @return { Array } array
*/
LineOfSight.prototype.getHexagonLosArray = function()
{
	var hexagonLosArray = [];
	var hgc = new HexagonGridCalculator();
	for(var i = 0; i < this.losArray.length; i++){
		hgc.setPoint(this.losArray[i]);
		if(hgc.isCenter()){
			hexagonLosArray.push(this.losArray[i]);
		}
	}
	return hexagonLosArray;
}

/**
* @method getHexagonRange
* @return { integer } range
*/
LineOfSight.prototype.getHexagonRange = function()
{
	return this.hexagonRange;
}

/**
* @method getGridRange
* @return { integer }
*/
LineOfSight.prototype.getGridRange = function()
{
	var stepNumber;
	var absX = Math.abs(gridPoint1.x - gridPoint2.x);
	var absY = Math.abs(gridPoint1.y - gridPoint2.y);
	if (absX > absY) {
		stepNumber = (absX + absY) / 2;
	} else {
		stepNumber = absY;
	}
	return stepNumber;
}

/**
* @method getStepNumber
* @return { integer }
*/
LineOfSight.prototype.getStepNumber = function(gridPoint1, gridPoint2) {
	var stepNumber;
	var absX = Math.abs(gridPoint1.x - gridPoint2.x);
	var absY = Math.abs(gridPoint1.y - gridPoint2.y);
	if (absX > absY) {
		stepNumber = (absX + absY) / 2;
	} else {
		stepNumber = absY;
	}
	return stepNumber;
}

/**
* @method isStaightType
* @return { boolean } true/false
*/
LineOfSight.prototype.isStaightType = function()
{
	var isStraight = false;

	// 0, 4, 8, 12, 16, 20
	if ( (this.bearingNumber % 4) == 0 )
	{
		isStraight = true;
	}
	return isStraight;
}

/**
* @method bearingIsCornerType
* @return { boolean } true/false
*/
LineOfSight.prototype.bearingIsCornerType = function()
{
	var isCorner = false;

	// 2, 6, 10, 14, 18, 22
	if ( (this.bearingNumber % 4) == 2 )
	{
		isCorner = true;
	}
	return isCorner;
}

/**
* @method isZigZagType
* @return { boolean } true/false
*/
LineOfSight.prototype.isZigZagType = function()
{
	var isZigZag = false;

	// 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23
	if ( ( this.bearingNumber % 2) == 1 )
	{
		isZigZag = true;
	}
	return isZigZag;
}


/**
* method to set the isCornerExpanded flag
*
* @method setIsCornerExpanded
* @param {boolean} true/false
*/
LineOfSight.prototype.setIsCornerExpanded= function( value ) {
	this.isCornerExpanded = value;

}

/**
* method to set the isMiddleHexsideIncluded flag
*
* @method setIsMiddleHexsideIncluded
* @param {boolean} true/false
*/
LineOfSight.prototype.setIsMiddleHexsideIncluded= function( value ) {
	this.isMiddleHexsideIncluded = value;

}

/**
* method to set the origin and endpoint
*
* @method setOriginAndEndPoint
* @param {Point} originHexagon
* @param {Point} endpointHexagon
*/
LineOfSight.prototype.setOriginAndEndPoint = function( originHexagon, endpointHexagon )
{
	this.originX = originHexagon.getX();
	this.originY = originHexagon.getY();
	this.endPointX = endpointHexagon.getX();
	this.endPointY = endpointHexagon.getY();
	this.calculateRange();
	this.caclulateBearingNumber();
	this.calculateFacing();
	this.calculateLosArray();
}

/**
* method to set the origin and endpoint
*
* @method setOriginAndEndPointXY
* @param {integer} x1
* @param {integer} y1
* @param {integer} x2
* @param {integer} y2
*/
LineOfSight.prototype.setOriginAndEndPointXY = function( x1, y1, x2, y2 )
{
	this.originX = x1;
	this.originY = y1;
	this.endPointX = x2;
	this.endPointY = y2;
	this.calculateRange();
	this.caclulateBearingNumber();
	this.calculateFacing();
	this.calculateLosArray();
}

/**
* @method caLculateRange
*
*/
LineOfSight.prototype.calculateRange = function()
{
	// see programming note below to understand why this works

	var absX = Math.abs( this.endPointX - this.originX );
	var absY = Math.abs( this.endPointY - this.originY );
	if ( absX > absY ) {
		this.hexagonRange = ( absX + absY ) / 4;
		this.gridRange = ( absX + absY ) / 2;
	} else {
		this.hexagonRange = absY / 2;
		this.gridRange = absY;
	}
}

// Notes on the range algorithm
//																	there are 2 cases to check the range
//y axis														case 1:
//.								 x3,y3								x3,y3 is above the 30 degree line, and it's range can be calculated
//.								.										 draw a 30 degree line from (x3,y3) to the y axis at (x2,y2)
//.						.												 get the range from (x1,y1) to (x2,y2) and add the range from (x2,y2) to (x3,y3)
//.				.														 the range (x1,y1) to (x2,y2) is:	 (y2-y1)/4
//.		 .																the range (x3,y3) to (x2,y2) is:	 (x3-x2)/2
//. .																			 we do not know the value of x2,y2, but since the 30 degree line has a
//. x2 y2																	 useful feature: at any point on this line, (x3-x2) = (y3-y2), so y2 = y3 - x3 + x2
//.												.								and x2 = x1
//.										.
//.			30 degree. line from origin		 substitute for x2 and y2
//.						.														total range = ((y3 - x3 + x1) - y1)/4	+	(x3 - x1)/2
//.				.			 x4,y4																= ( y3 - x3 + x1 + 2x3 - 2x1 ) / 4
//.		 .																							 = ( (x3-x1) + (y3-y1) ) / 4
//. .
//...................x axis				 case 2:
//x1, y1																x4,y4 is below the 30 degree line, and it's range can be calculated
//																					total range = (x4-x1) / 2
//
//
