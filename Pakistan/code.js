// Width and height of svg
var w = 960;
var h = 500;

// Bollean variables for flagging certain button click events
var PDclicked = true;
var RDclicked = false;
var firstTime = true;

// Defines map projection
var projection = d3.geoMercator()
        .center([35,10])
        .translate([0, 1.2*h]) 
        .scale([900]); 
//        .translate([w*0.6, h/2]) 
//        //.center([10,50])
//        .scale([200]); 

//Define path generator
var path = d3.geoPath()
        .projection(projection);

//Create SVG element
var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

//Define Tooltip 
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load Population Density and number of Districts .csv data by region
d3.csv("pakistan.csv", function(data) {
    
    //Load in GeoJSON data for Pakistan (lv1 GeoJSON attributes -> 8 regions of Pakistan)
    d3.json("pakistan456.json", function(json) {

        //Merge the population density and districts data with Pakistan GeoJSON data
        //Loop through once for each region to get population, area, and districts data
        for (var i = 0; i < data.length; i++) {

            //Grab region name
            var dataRegion = data[i].region;
            
            //Grab area
            var dataArea = +data[i].area;

            //Grab population
            var dataPopulation = +data[i].population;
            
            //Grab districts
            var dataDistricts= parseFloat(+data[i].districts);
            
            //Calculate Population Density
            var dataPopDensity = parseFloat(dataPopulation/dataArea);
console.log(dataPopDensity);///
            //Find the corresponding region inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonRegion = json.features[j].properties.Name; // References name property in GeoJSON data

                // If the name on the GeoJSON matches the name for the region, assign current pop. density and districts data to GeoJSON feature
                if (dataRegion == jsonRegion) {

                    //Copy the data value into the JSON for Population density and districts
                    json.features[j].properties.PopulationDensity = dataPopDensity;
                    json.features[j].properties.Districts = dataDistricts;

                    //Stop looking through the JSON
                    break;

                }
            }		
        }
        
        // Displays by default upon loading the page the population density data
        if(firstTime) {
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
                .attr('stroke-width', function(d) { return 0.2; })
                .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.PopulationDensity;

                    if (value) {
                        //If value exists…
                        return color1(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "PDgraphinitial");
        }

        // Event handler for displaying the Population density data on the map canvas
        var PDbutton = document.getElementById("PD");
        PDbutton.onclick = function(d) {                
            firstTime = false;
            d3.selectAll("#PDgraphinitial").remove();
            
            PDclicked = true;
            RDclicked = false;
            
            d3.selectAll("#RDgraph").remove();
        
            if(PDclicked) {
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr('stroke-width', function(d) { return 0.2; })
               .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.PopulationDensity;
                    if (value) {
                        //If value exists…
                        return color1(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "PDgraph");
            }                                  
        };
        
        // Event handler for displaying the districts data on the Pakistan map canvas
        var RDbutton = document.getElementById("RD");
            RDbutton.onclick = function(d) {
                
            firstTime = false;
            d3.selectAll("#PDgraphinitial").remove();
            
            PDclicked = false;
            RDclicked = true;
        
            d3.selectAll("#PDgraph").remove();
        
            if(RDclicked) { 
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr('stroke-width', function(d) { return 0.2; })
                .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.Districts;

                    if (value) {
                        //If value exists…
                        return color2(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "RDgraph");
            }
        };
        
    });
});

/* Definitions for legends are below */

// Define the color scales based on thresholds (ending values for color ranges)
var color1 = d3.scaleThreshold()
//    .domain([50, 195, 345, 536, 2447])
    .domain([50, 180, 300, 400, 2447])
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

var color2 = d3.scaleThreshold()
    .domain([7, 15, 23, 31, 39])
    .range(["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"]);

// Define how the axes sclae with the data on the legends
var x = d3.scaleLinear()
    .domain([14, 2447])
    .rangeRound([340, 900]);

var y = d3.scaleLinear()
    .domain([0, 39])
    .rangeRound([340,900]);

// Make two different group classes for the svg for displaying different attributes for the two graphs
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-40,20)");

var h = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-40,60)");

// Append necessary rectangles, captions, and axis ticks to the specific legends.
// Code below was taken from Mike Bostock's California Population Denisty Map and modified for use in my graph (https://bl.ocks.org/mbostock/5562380)
g.selectAll("rect")
      .data(color1.range().map(function(d) {
          d = color1.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { 
        return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color1(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square kilometer");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color1.domain()))
      .select(".domain")
        .remove();

h.selectAll("rect")
      .data(color2.range().map(function(d) {
          d = color2.invertExtent(d);
          if (d[0] == null) d[0] = y.domain()[0];
          if (d[1] == null) d[1] = y.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 7)
        .attr("x", function(d) { 
        return y(d[0]); })
        .attr("width", function(d) { return y(d[1]) - y(d[0]); })
        .attr("fill", function(d) { return color2(d[0]); });

    h.append("text")
        .attr("class", "caption")
        .attr("x", y.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Districts per region");

    h.call(d3.axisBottom(y)
        .tickSize(13)
        .tickValues(color2.domain()))
      .select(".domain")
        .remove();
