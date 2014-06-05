// very cheap and cheerful
var monthsMap = {
	"01" : "January",
	"02" : "February",
	"03" : "March",
	"04" : "April",
	"05" : "May",
	"06" : "June",
	"07" : "July",
	"08" : "August",
	"09" : "September",
	"10" : "October",
	"11" : "November",
	"12" : "December"
};

// add commas to long numbers
var addCommas = function(n) {
	n += '';
	x = n.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

// create a percentage from a customer satisfaction number (1-5)
var scoreToPercentage = function(score) {
	var maxScore = 5, minScore = 1;
	var p = ((maxScore - score) / (maxScore - minScore)) * 100;
	return Math.round( p * 10 ) / 10;
};

// Returns a random integer between min and max
var getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Raphael funcs /////////////////////////////////////////////////////////////////////

// Pie charts
var renderPie = function(domElement, x, y, r, data, colours, circleColour) {
    var rEl = Raphael(domElement);
    var chart = rEl.piechart(x, y, r, data, {
        stroke: "transparent",
        startFromFixedAngle: 90,
        colors: colours
    });
    var lid = rEl
        .circle(x, y, r/2)
        .attr({
            fill: circleColour,
            stroke: "transparent"
        });
}
