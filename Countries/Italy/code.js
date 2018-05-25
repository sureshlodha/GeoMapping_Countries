// Width and height of svg
var w = 900;
var h = 800;

// Bollean variables for flagging certain button click events
var PDclicked = true;
var FRclicked = false;
var firstTime = true;

// Defines map projection (how Italy appears dimensionally on screen)
var projection = d3.geoMercator()
        .translate([w/10000, 3.1*h]) // x and y position for the mercator scale to find Italy
        .scale([w * 2.8]);           // Zoom factor on the mercator scale to display Italy clearly and within the defined translation/svg parameters 

//Define path generator
var path = d3.geoPath()
        .projection(projection);

//Define quantize scale to sort data values into buckets of color for both sets of .csv data
var colorPDdata = d3.scaleQuantize()
                    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
                    //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
                    //https://github.com/d3/d3-scale-chromatic

var colorFRdata = d3.scaleQuantize()
                    .range(["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"]);
                    //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
                    //https://github.com/d3/d3-scale-chromatic

//Create SVG element
var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

//Load blank Italy canvas

//if(firstTime) {
//    d3.json("gadm36_ITA_1small.json", function(json) {
//    svg.selectAll("path")
//       .data(json.features)
//       .enter()
//       .append("path")
//       .attr("d", path)
//       .style("fill", function(d) {
//            return "#ccc";
//            })
//        .attr("id", "blankGraph");
//       })
//}

// Load Population Density and Fertility Rate .csv data by region
d3.csv("popdensityANDfertilityratedata.csv", function(data) {
    
    //Set input domain for pop. density color scale
    colorPDdata.domain([
        d3.min(data, function(d) {return (d.population / d.area); }), // Population divided by area gives you population density for the region
        d3.max(data, function(d) {return (d.population / d.area); })  
    ]);
    
    //Set input domain for fertility rate color scale
    colorFRdata.domain([
        d3.min(data, function(d) {return (d.fertilityrate); }), 
        d3.max(data, function(d) {return (d.fertilityrate); })  
    ]);
    
    //Load in GeoJSON data for Italy (lv1 GeoJSON attributes -> 20 regions of Italy)
    d3.json("Italy.json", function(json) {

        //Merge the pop. density/fertility rate data with Italy GeoJSON data
        //Loop through once for each region to get population, area, and fertility rate data
        for (var i = 0; i < data.length; i++) {

            //Grab region name
            var dataRegion = data[i].region;
            
            //Grab area
            var dataArea = +data[i].area;

            //Grab population
            var dataPopulation = +data[i].population;
            
            //Grab fertility rate
            var dataFertilityRate = parseFloat(+data[i].fertilityrate);
            
            //Calculate Population Density
            var dataPopDensity = parseFloat(dataPopulation/dataArea);

            //Find the corresponding region inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonRegion = json.features[j].properties.Name; // References name property in GeoJSON data

                // If the name on the GeoJSON matches the name for the region, assign current pop. density anf fertility rate data to GeoJSON feature
                if (dataRegion == jsonRegion) {

                    //Copy the data value into the JSON for Population density and fertility rate
                    json.features[j].properties.PopulationDensity = dataPopDensity;
                    json.features[j].properties.FertilityRate = dataFertilityRate;

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
                .attr('stroke-width', function(d) { return 0.1; })
                .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.PopulationDensity;

                    if (value) {
                        //If value exists…
                        return colorPDdata(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "PDgraphinitial");
        }

        // Event handler for displaying the Population density data on the Italy map canvas
        var PDbutton = document.getElementById("PD");
            PDbutton.onclick = function(d) {
                
            firstTime = false;
//            d3.selectAll("#blankGraph").remove();
            d3.selectAll("#PDgraphinitial").remove();
            
            PDclicked = true;
            FRclicked = false;
            
            d3.selectAll("#FRgraph").remove();
        
            if(PDclicked) {
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr('stroke-width', function(d) { return 0.1; })
                .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.PopulationDensity;

                    if (value) {
                        //If value exists…
                        return colorPDdata(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "PDgraph");

        
//            svg.selectAll("text")
//                .data(json.features)
//                .enter()
//                .append("svg:text")
//                .text(function(d){
//                    return d.properties.Name;
//                })
//                .attr("x", function(d){
//                    return path.centroid(d)[0];
//                })
//                .attr("y", function(d){
//                    return  path.centroid(d)[1];
//                })
//                .attr("text-anchor","middle")
//                .attr('font-size','6pt');

                }
                                          
                                         };
        // Event handler for displaying the fertility rate data on the Italy map canvas
        var FRbutton = document.getElementById("FR");
            FRbutton.onclick = function(d) {
                
            firstTime = false;
//            d3.selectAll("#blankGraph").remove();
            d3.selectAll("#PDgraphinitial").remove();
            
            PDclicked = false;
            FRclicked = true;
        
            d3.selectAll("#PDgraph").remove();
        
            if(FRclicked) { 
            //Bind data and create one path per GeoJSON feature
            svg.selectAll("path")
               .data(json.features)
               .enter()
               .append("path")
               .attr("d", path)
               .attr('stroke-width', function(d) { return 0.1; })
                .attr('stroke', function(d) { return 'black'; })
               .style("fill", function(d) {
                    //Get data value
                    var value = d.properties.FertilityRate;

                    if (value) {
                        //If value exists…
                        return colorFRdata(value);
                    } else {
                        //If value is undefined…
                        return "#ccc";
                    }
               })
                .attr("id", "FRgraph");
            }
        };
        
    });
});

/* Definitions for legends are below */

// Define the color scales based on thresholds (ending values for color ranges)
var color1 = d3.scaleThreshold()
    .domain([117, 195, 273, 352, 430])
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

var color2 = d3.scaleThreshold()
    .domain([1.18, 1.30, 1.41, 1.53, 1.64])
    .range(["rgb(242,240,247)","rgb(203,201,226)","rgb(158,154,200)","rgb(117,107,177)","rgb(84,39,143)"]);

// Define how the axes sclae with the data on the legends
var x = d3.scaleLinear()
    .domain([0, 3450])
    .rangeRound([340, 3900]);

var y = d3.scaleLinear()
    .domain([0, 3.00005])
    .rangeRound([340,1150]);

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
        .text("Fertility Rate per region");

    h.call(d3.axisBottom(y)
        .tickSize(13)
        .tickValues(color2.domain()))
      .select(".domain")
        .remove();
