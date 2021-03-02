// copyright (c) 2015 Mark Butler

/**
* HexagonNameCalculator
* It's purpose is to provide a hexagon name.
* It can convert it's x,y coordinate into a hexagon name
* It can convert it's hexagon name into a x,y coordinate
*
* @class HexagonNameCalculator
* @constructor
* @param x {integer} x coordinate
* @param y {integer} y coordinate
*/

/**
* HexagonNameCalculator
*
* @class HexagonNameCalculator
* @constructor
* @param hexagonLabel
*/

/**
* HexagonNameCalculator
*
* @class HexagonNameCalculator
* @constructor
* @param Point
*/

// HexagonNameCalculator Constructor
//
//  purpose of the HexagonNameCalculator is to store the x,y coordinate of the hexagon and
//     to display the wargame's labeling system for that hexagon
//

function HexagonNameCalculator() {

	var x, y;		// the coordinate for the hexagon
	var name;	// name of hexagon, like 0101
							//   note: this is a string type

	this.x = 0;
	this.y = 0;
	this.name = "";

	var mapViewPort;
	// HexagonNameCalculator(point)
	//   use the x,y of the coordinate
	if ( HexagonNameCalculator.arguments.length == 1 &&  HexagonNameCalculator.arguments[0].constructor == Point )
	{
		this.setXY(HexagonNameCalculator.arguments[0].getX(), HexagonNameCalculator.arguments[0].getY());
	}

	// HexagonNameCalculator(x, y)
	//    use the x, y in the arguments
	if ( HexagonNameCalculator.arguments.length == 2
			&& HexagonNameCalculator.arguments[0].constructor == Number
			&& HexagonNameCalculator.arguments[0].constructor == Number)
	{
        this.setXY(parseInt(HexagonNameCalculator.arguments[0]), parseInt(HexagonNameCalculator.arguments[1]));
	}

	// HexagonNameCalculator(name)
	//    calculate the x, y by parsing the hexagon name
	if ( HexagonNameCalculator.arguments.length == 1 &&  HexagonNameCalculator.arguments[0].constructor == String)
	{
        this.setName(HexagonNameCalculator.arguments[0]);
	}
}

/**
* method to get x coordinate
*
* @method getX
* @return {integer} x coordinate
*/
HexagonNameCalculator.prototype.getX = function() {

	return this.x;
}

/**
* method to get y coordinate
*
* @method getY
* @return {integer} y coordinate
*/
HexagonNameCalculator.prototype.getY = function() {

    return this.y;
}

/**
* method to get hexagon name
*
* @method getName
* @return {string} hexagon name
*/
HexagonNameCalculator.prototype.getDisplayName = function() {

	var displayLabel = "";

	displayLabel = this.name;

	return this.name;
}


/**
* method to get hexagon name
*
* @method getName
* @return {string} hexagon name
*/
HexagonNameCalculator.prototype.getName = function() {

	return this.name;
}

/**
* method to get hexagonPoint
*
* @method getHexagonPoint
* @return {point} Point
*/
HexagonNameCalculator.prototype.getHexagonPoint = function() {
	var hexagonPoint = new Point(this.x, this.y);
	return hexagonPoint;
}

HexagonNameCalculator.prototype.setMapViewPort = function(mapViewPort) {
// set the hexagon name and calculate the x, y
	this.mapViewPort = mapViewPort;
}

/**
* method to set the x coordinate and the y coordinate of the hexagon
*
* @method setHexagonName
* @param x {point} hexagon point
*/
HexagonNameCalculator.prototype.setHexagonPoint = function(hexagonPoint) {
// set the hexagon x,y
	var x = hexagonPoint.getX();
	var y = hexagonPoint.getY();
	this.setXY(x,y);
}


/**
* method to set the name of the hexagon
*
* @method setName
* @param name {string} The name of the hexagon to set
*/

HexagonNameCalculator.prototype.setName = function( name )
// set the hexagon name and calculate the x, y
{
	this.name = name;
	var labelNumber = Number(name);
	var rowNumber = Math.floor(labelNumber/100);
	var columnNumber = labelNumber % 100;

  this.y = 2 * (columnNumber + 1);
  this.x = 4 * rowNumber;
  if( columnNumber % 2 == 0 ) this.x += 2;
}

/**
* method to set the x coordinate and the y coordinate of the hexagon
*
* @method setXY
* @param x {integer} x coordinate
* @param y {integer} y coordinate
*/

HexagonNameCalculator.prototype.setXY = function( x, y )
//  set the x, y and then calculate the name
{

	this.x = x;
	this.y = y;
	this.name = "";

	var rowNumber = Math.floor(this.y / 2) - 2;
	var columnNumber = Math.floor(this.x / 4);

	if( rowNumber < 10 ) this.name += "0";
 	this.name += rowNumber.toString();
	 if( columnNumber < 10 ) this.name += "0";
	 this.name += columnNumber.toString();
 
}
