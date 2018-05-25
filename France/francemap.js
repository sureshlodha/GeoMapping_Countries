var w = 900;
var h = 600;

//Define map equirectangular projection, creating a flat projection of the map
var projection = d3.geoMercator()
                       .translate([(w/2)-120, (h*4)-280])
                       .scale([2000]);

//Define path generator, which draws all the paths in the geojson file
var path = d3.geoPath()
                 .projection(projection);

//Color scale for the density data, setting the domain of the ranging colors
var colorDensity = d3.scaleThreshold()
    .domain([1, 30, 60, 90, 120, 160, 210, 900])
    .range(d3.schemeReds[9]);

//Color scale for the gdp data, setting the domain of the ranging colors
var colorGDP = d3.scaleThreshold()
    .domain([20000, 22000, 24000, 26000, 28000, 30000])
    .range(d3.schemeGreens[7]);

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

//Density scale, range round set the value between the two value, rounding to the nearest integer
var xDensity = d3.scaleSqrt()
    .domain([0, 1000])
    .rangeRound([440, 810]);

//GDP scale
var xGDP = d3.scaleSqrt()
    .domain([19000, 31000])
    .rangeRound([440, 810]);

//Define legend
var legend = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(70,40)");
    
//Parsing csv data
d3.csv("france.csv", function(data) {

//Load in GeoJSON data
    d3.json("FRA_1.json", function(json) {

    //Merge the data and GeoJSON
    //Loop through once for each data value
        for (var i = 0; i < data.length; i++) {

        //Get the region name
        var dataRegion = data[i].region;

        //Get data value, and convert from string to float
        var dataDensity = parseFloat(data[i].density);

        var dataGDP = parseFloat(data[i].gdp);
            
        //Find the corresponding region inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonRegion = json.features[j].properties.name;

                if (dataRegion == jsonRegion) {

                    //Copy the density and gdp data value into the JSON
                    json.features[j].properties.density = dataDensity;

                    json.features[j].properties.gdp = dataGDP;

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
            .style("stroke", "white")
            .style("fill", function(d) {
            //Get data value, density will be the first data represented upon opening the page, so we get that value first 
            var value = d.properties.density;

                if (value) {

                    //If value exists, return the density color associated to the value
                    return colorDensity(value); 

                } else {
                    //If value is undefined, then return grey 
                    return "#ccc";
                }
            });
        
        //Setting up the legend
        legend.selectAll("rect")
            .data(colorDensity.range().map(function(d) {
            //mapping the color density value to the domain according to the data
            //invert extent return all the values in the domain that corresponds the range
            //looping through the domain, setting the range between each color bar
              d = colorDensity.invertExtent(d);
              if (d[0] == null) d[0] = xDensity.domain()[0]; //get the first and second value, storing then in the map
              if (d[1] == null) d[1] = xDensity.domain()[1]; //this gets the range between each tick
              return d;
            }))
            .enter().append("rect")
            .attr("height", 8) //this creates the color bars between the values
            .attr("x", function(d) { return xDensity(d[0]); })
            .attr("width", function(d) { return xDensity(d[1]) - xDensity(d[0]); })
            .attr("fill", function(d) { return colorDensity(d[0]); });

        //adding the data value title
        legend.append("text")
            .attr("class", "caption")
            .attr("x", xDensity.range()[0])
            .attr("y", -6)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Population Density (2016, people per kilometre square)");
        
        //adding the value of the domain in the legend, creating the x axis using the x scale created for the data
        //tick size is 13 so all the values of the domain will appear on page
        legend.call(d3.axisBottom(xDensity)
            .tickSize(13)
            .tickValues(colorDensity.domain()))
            .select(".domain")
            .remove();
        });

});

//function when the density button is clicked
function density(){
    
    //remove all the legend before replacing with the current legend
    legend.selectAll("*").remove();
    
    //same as the above but this will override the original legend with density color and data
    legend.selectAll("rect")
        .data(colorDensity.range().map(function(d) {
          d = colorDensity.invertExtent(d);
          if (d[0] == null) d[0] = xDensity.domain()[0];
          if (d[1] == null) d[1] = xDensity.domain()[1];
          return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return xDensity(d[0]); })
        .attr("width", function(d) { return xDensity(d[1]) - xDensity(d[0]); })
        .style("fill", function(d) { return colorDensity(d[0]); });

    legend.append("text")
        .attr("class", "caption")
        .attr("x", xDensity.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population Density (2016, people per kilometre square)");

    legend.call(d3.axisBottom(xDensity)
        .tickSize(13)
        .tickValues(colorDensity.domain()))
        .select(".domain")
        .remove();
    
    //same as the above but this will override the original data associated to the color value
    //transition set for a smooth change from the previous graph to the current one
    d3.selectAll("path")
        .style("stroke", "white")
        .transition().duration(1000)
        .style("fill", function(d) {
            //Get data value
            var value = d.properties.density;
            if (value) {
                //If value exists, return the density color associated to the value
                return colorDensity(value);
            } else {
                //If value is undefined, then return grey
                return "#ccc";
            }
         });
}

//function when gdp button is clicked
function gdp(){
    
    //remove all the legend before replacing with the current legend
    legend.selectAll("*").remove();

    //same as the above but this will override the original legend with gdp colors and data
    legend.selectAll("rect")
        .data(colorGDP.range().map(function(d) {
          d = colorGDP.invertExtent(d);
          if (d[0] == null) d[0] = xGDP.domain()[0];
          if (d[1] == null) d[1] = xGDP.domain()[1];
          return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return xGDP(d[0]); })
        .attr("width", 100)
        .style("fill", function(d) { return colorGDP(d[0]); });

    legend.append("text")
        .attr("class", "caption")
        .attr("x", xGDP.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("GDP per Capita in Euros (2013)");

    legend.call(d3.axisBottom(xGDP)
        .tickSize(13)
        .tickValues(colorGDP.domain()))
        .select(".domain")
        .remove();
    
    //same as the above but this will override the original data associated to the color value
    //transition set for a smooth change from the previous graph to the current one
    d3.selectAll("path")
        .style("stroke", "white")
        .transition().duration(1000)
        .style("fill", function(d) {
            //Get data value
            var value = d.properties.gdp;
            if (value) {
                //If value exists, return the density color associated to the value
                return colorGDP(value);
            } else {
                //If value is undefined, then return grey
                return "#ccc";
            }
         });
}





