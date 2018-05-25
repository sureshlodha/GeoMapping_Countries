/* global d3 */

// color
var density_color = d3.scaleThreshold()
                .range(['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b']);

// color scale for displaying growth rate
var growth_color = d3.scaleThreshold()
                .range(['#cb181d','#fb6a4a','#fcae91','#fee5d9', '#eff3ff','#bdd7e7','#6baed6','#3182bd','#08519c']);

//Define Margin
var margin = {left: 90, right: 80, top: 50, bottom: 50 },
    width = 960 - margin.left -margin.right,
    height = 600 - margin.top - margin.bottom;

//Define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Define map projection
var projection = d3.geoMercator()
                   .center([35.8,38.0])
                   .translate([width/2, height/2])
                   .scale([2000]);

//Define path generator
var path = d3.geoPath()
             .projection(projection);

// used for toggling between growth_rate and population_density
var toggle = false;

d3.select("h1").style("text-align", "center");

d3.csv("turkey_data.csv", function(data){
    
    var d_min = d3.min(data, function(d) { return +d.density; });
    var d_max = d3.max(data, function(d) { return +d.density; });
    
    var g_min = d3.min(data, function(d) { return +d.growth_rate; });
    var g_max = d3.max(data, function(d) { return +d.growth_rate; });
    
    density_color.domain([ d_min-1, 20, 50, 75, 100, 300, 500, 1000, d_max ]);
    growth_color.domain([ -15, -10, -5, 0, 5, 10, 15, 20, 35 ]);
    
    d3.json("turkey.json", function(json){
        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {
            //Grab state name
            var dataState = data[i].province;

            //Grab data value, and convert from string to float
            var density_value = +parseFloat(data[i].density);
            var growth = +parseFloat(data[i].growth_rate);

            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonState = json.features[j].properties.NAME_1;

                if (dataState == jsonState) {
                    //Copy the data value into the JSON
                    json.features[j].properties.density = density_value;
                    json.features[j].properties.growth_rate = growth;

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
           .on("mouseover", mouseOverHandler)
           .on("mouseout", mouseOutHandler)
           .style("fill", function(d) {
                //Get data value
                var value = d.properties.density;

                if (value) {
                    //If value exists…
                    return density_color(value);
                } else {
                    //If value is undefined…
                    return "#000";
                }
           })
           .style("stroke", "000");
        
        svg.append("g")
            .attr("id", "d_legend")
            .attr("transform", "translate(-30,380)");
        
        svg.select("#d_legend")
            .call(density_legend);
        
        svg.append("g")
            .attr("id", "g_legend")
            .attr("transform", "translate(-30,475)");
        
        svg.select("#g_legend")
            .call(growth_legend);

    });
})

var density_legend = d3.legendColor()
    .labelFormat(d3.format(".2d"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(density_color)
    .shapeWidth(90)
    .orient("horizontal")
    .title("People per square kilometer");

var growth_legend = d3.legendColor()
    .labelFormat(d3.format(".2d"))
    .labels(d3.legendHelpers.thresholdLabels)
    .scale(growth_color)
    .shapeWidth(90)
    .orient("horizontal")
    .title("Growth Rate (% change)");

function toggleVar(d){
    toggle = !toggle;
    svg.selectAll("path").style("fill", function(d) {
        //Get data value
        var scale;
        var value;
        if(!toggle){
            scale = density_color;
            value = d.properties.density;
        }else{
            scale = growth_color;
            value = d.properties.growth_rate;
        }
        if (value) {
            //If value exists…
            return scale(value);
        } else {
            //If value is undefined…
            return "#ccc";
        }
       })
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}


//**************************************************************************
//    Tooltip Stuff
//**************************************************************************

// tooltip variable
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")				
    .style("opacity", 0);

// handle mouseover event
var mouseOverHandler = function(d){
    var value;
    if(!toggle) value = d.properties.density;
    else value = d.properties.growth_rate;
    tooltip.transition()		
           .duration(200)		
           .style("opacity", .9);
    tooltip.html( d.properties.NAME_1 + "<br>" +
                  "Population: "+ precisionRound(value,2))
           .style("left", (d3.event.pageX + 10 ) + "px")
           .style("top", (d3.event.pageY - 28) + "px");
}

// handle mouseout event
var mouseOutHandler = function(){
    tooltip.transition()		
           .duration(500)		
           .style("opacity", 0);
}