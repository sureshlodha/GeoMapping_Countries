/*global d3*/
/*jslint plusplus: true */

var margin = {left: 80, right: 80, top: 50, bottom: 50 },
    w = 1000 - margin.left - margin.right,
    h = 600 - margin.top - margin.bottom;

//Define map projection
var projection = d3.geoMercator()
    .translate([0, 70])
    .scale([1300]);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Create SVG element
var svg = d3.select("body")
    .append("svg")
    .attr("width", w + 400)
    .attr("height", h-50)
    .append("g")
    .style("stroke", "grey")
    .attr("transform", "translate(" + ((-2.5) * w) + "," + (margin.top + 50) + ")");

var colorValues = d3.scaleSequential(d3.interpolateReds);
var colorIncomes = d3.scaleSequential(d3.interpolateBlues);
var color = colorIncomes;
var changed = 0;

//Load in data
d3.csv("2015-population.csv", function (data) {
    "use strict";
    //Set input domain for color scale
console.log("min: "+d3.min(data, function (d) { return parseFloat(d.value); }));
console.log("max: "+d3.max(data, function (d) { return parseFloat(d.value); }));
    colorValues.domain([
        d3.min(data, function (d) { return parseFloat(d.value); }),
        d3.max(data, function (d) { return parseFloat(d.value); })
    ]);
console.log("min: "+d3.min(data, function (d) { return parseFloat(d.income); }));
console.log("max: "+d3.max(data, function (d) { return parseFloat(d.income); }));
    colorIncomes.domain([
        d3.min(data, function (d) { return parseFloat(d.income); }),
        d3.max(data, function (d) { return parseFloat(d.income); })
    ]);
    
    //Load in GeoJSON data
	d3.json("ind.json", function (json) {

        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        var i, dataState, dataValue, j, jsonState, dataIncome;
        for (i = 0; i < data.length; i++) {
				
            //Grab state name
            dataState = data[i].province;
						
            //Grab data value, and convert from string to float
            dataValue = parseFloat(data[i].value);
            dataIncome = parseFloat(data[i].income);
				
            //Find the corresponding state inside the GeoJSON
            for (j = 0; j < json.features.length; j++) {
						
                jsonState = json.features[j].properties.NAME_1;
                if (dataState === jsonState) {

                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;
                    json.features[j].properties.income = dataIncome;
								
                    //Stop looking through the JSON
                    break;
                }
            }
        }
//Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function (d) {
                //Get data value
                var value = d.properties.value;
                if (value) {
                    //If value exists…
//console.log("d.properties.value: "+d.properties.value);
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#ccc";
                }
            });
//Legend
        var svgLegend = d3.select("body")
            .append("svg")
            .attr("width", w+800)
            .attr("height", 100)
        svgLegend.append("g")
            .attr("class", "legendSequential")
            .attr("transform", "translate(20, 20)");
        svgLegend.append("text")
            .attr("x", 100)
            .attr("y", 15)
            .text("Population density in 2015 per km^2");

        var legendSequential = d3.legendColor()
            .shapeWidth(60)
            .cells(10)
            .orient("horizontal")
            .scale(colorValues)
        svgLegend.select(".legendSequential").call(legendSequential);
        
        var svgLegend2 = d3.select("body")
            .append("svg")
            .attr("width", w+300)
            .attr("height", 60)
        svgLegend2.append("g")
            .attr("class", "legendSequential2")
            .attr("transform", "translate(20,20)");

        svgLegend.append("text")
            .attr("x", 100)
            .attr("y", 100)
            .text("Average income in 2016");        
            var legendSequential2 = d3.legendColor()
                .shapeWidth(60)
                .cells(10)
                .orient("horizontal")
                .scale(colorIncomes)
            svgLegend2.select(".legendSequential2").call(legendSequential2);
        
        
// button
        d3.select(".button-to-change-data")
        
            .on("click.position", function () {
                changed = (changed + 1) % 2;
                if (changed) {
                    color = colorValues;
                    svg.selectAll("path")
                        .transition().duration(500)
                        .style("fill",  function(d) {
console.log(d.properties.value);
                            return color(d.properties.value); 
                        });
                    
                    svgLegend.selectAll("svglegend")
                        .transition().duration(500)
                        .style("fill", color);
                
                } else {
                    color = colorIncomes;
                    
                    svg.selectAll("path")
                        .transition().duration(500)
                        .style("fill",  function(d) {
                            return color(d.properties.income); 
                        });
                    
                    svgLegend.selectAll("svgLegend")
                        .transition().duration(500)
                        .style("fill", color);
                    
                }
            })        
    });
});