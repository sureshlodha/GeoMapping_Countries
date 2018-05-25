// Noriaki Nakano 
// nnakano@ucsc.edu
// 1418185

//Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
	width = 960 - margin.left -margin.right,
	height = 960 - margin.top - margin.bottom;


//Define SVG
var svg = d3.select("body")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//define projection values 
var projection = d3.geoMercator()
	.scale(1500)
	.rotate([0.0,0.0,0.0])
	.translate([-3200, 1400]);

//define path 
var path = d3.geoPath()
	.projection(projection);
	
//Japanese key conversion 
var japanese_key = {
	"number" : "番号", 
	"prefecture": "都道府県",
	"density": "密度",
	"population_density": "人口密度" 
};

//Id conversion of geoJSON for Japan 
var id_conversion = [
	23, 5, 2, 12, 38, 18, 40,
	7, 21, 10, 34, 1, 28, 8,
	17, 3, 37, 46, 14, 39, 43,
	26, 24, 4, 45, 20, 42, 29, 
	15, 44, 33, 47, 27, 41, 11,
	25, 32, 22, 9, 36, 13, 31,
	16, 30, 6, 35, 19
];

// scale from blue -> green -> red 
var color_scale = d3.scaleLinear()
	.range(['#00F', '#0F0', '#F00']); 
	
var data; // store data from CSV file 

// load CSV file 
d3.csv("japan_populationdensity.csv", (e, d) => {
	
	data = d;
	
	// set up min, pivot, and max
	var min =  d3.min(d.map((v) => {
		return parseFloat(v[japanese_key["population_density"]]);
	}));
	
	var mean = d3.mean(d.map((v) => {
		return parseFloat(v[japanese_key["population_density"]]);
	}));
	
	var max = d3.max(d.map((v) => {
		return parseFloat(v[japanese_key["population_density"]]);
	}));
	
	// set color scale domain 
	color_scale.domain([
		min, 
		mean,
		max	
	]);
	
	// draw legend colored rectangles
	svg.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width",380)
		.attr("height", 180)
		.attr("fill", "lightgrey")
		.style("stroke-size", "1px");

	svg.append("circle")
		.attr("r", 20)
		.attr("cx", 30)
		.attr("cy", 30)
		.style("fill", color_scale(max));
	
	svg.append("circle")
		.attr("r", 20)
		.attr("cx", 30)
		.attr("cy", 90)
		.style("fill", color_scale(mean));

	svg.append("circle")
		.attr("r", 20)
		.attr("cx", 30)
		.attr("cy", 150)
		.style("fill", color_scale(min));

	svg.append("text")
		.attr("class", "label")
		.attr("x", 370)
		.attr("y", 35)
		.style("text-anchor", "end")
		.text("maximum: " + max.toFixed(1) + " people/kilometer^2");

	svg.append("text")
		.attr("class", "label")
		.attr("x", 360)
		.attr("y", 95)
		.style("text-anchor", "end")
		.text("mean: " + mean.toFixed(1) + " people/kilometer^2");

	svg.append("text")
		.attr("class", "label")
		.attr("x", 350)
		.attr("y", 155)
		.style("text-anchor", "end")
		.text("minimum: " + min.toFixed(1) + " people/kilometer^2");
	
});
	
d3.json("japan.json", (e, d) => {// load JSON file 
	
	// draw GeoJSON 
	svg.selectAll("path")
		.data(d.features)
		.enter()
		.append("path")
		.attr("d", (v)=> {return path(v);}) // send path value to append 
		.attr("fill", (v, i) => color_scale(data[id_conversion[i] - 1][japanese_key["population_density"]]))
		.attr("stroke", "#222");
		
});


	