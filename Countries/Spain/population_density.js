var d3;

//Width and height
var w = 1000;
var h = 700;

// Reference: https://bost.ocks.org/mike/map/
var projection = d3.geoAlbers()
    .rotate([4.4, 0])
    .scale(1000)
    .translate([w / 1.5, h + 200]);

var path = d3.geoPath()
  .projection(projection);


// Assign a color-picking scale function such that the indput down has multiple subsets for colors and the output range returns the corresponding value using schemeOr
// Reference: https://bl.ocks.org/mbostock/5562380
var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 3000, 6000])
    .range(d3.schemeBuPu[7]);


// Define what to do when panning or zooming (From CS 165 Course Textbook)
var zooming = function(d) {

    //New offset array
    var offset = [d3.event.transform.x, d3.event.transform.y];

    //Calculate new scale
    var newScale = d3.event.transform.k * 9000;

    //Update projection with new offset and scale
    projection.translate(offset)
              .scale(newScale);

    //Update all paths and circles
    svg.selectAll("path")
        .attr("d", path);

}

//Then define the zoom behavior
var zoom = d3.zoom()
             .on("zoom", zooming);


// Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

//The center of the projection of Spain, roughly
var center = projection([-97.0, 39.0]);

//Create a container in which all zoom-able elements will live
var map = svg.append("g")
            .attr("id", "map")
            .call(zoom)  //Bind the zoom behavior
            .call(zoom.transform, d3.zoomIdentity  //Then apply the initial transform
                .translate(w/2, h/2)
                .scale(0.25)
                .translate(-center[0], -center[1]));

//Create a new, invisible background rect to catch zoom events
map.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("opacity", 0);

// Source for data: http://en.classora.com/reports/t57578/ranking-of-the-provinces-of-spain-by-population-density?id=575&groupCount=50&startIndex=1
d3.csv("population_density.csv", function(data) {

    data.forEach(function(d) {
        d.province = d.province;
        d.population = +d.population
        d.area = +d.area;
    });
    
    
    // Load in GeoJSON data
    d3.json("spain.json", function(json) {
        
        // Merge the csv data and GeoJSON
        // Loop through once for each province
        for (var i = 0; i < data.length; i++) {

            // Grab province name
            var dataProvince = data[i].province;
            
            // Grab province population density (total population / area)
            var dataDensity = parseFloat(data[i].population) / parseFloat(data[i].area);

            // Find the corresponding province inside Spain GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonProvince = json.features[j].properties.NAME_2;

                if (dataProvince == jsonProvince) {

                    // REecord into the JSON's properties the dataDensity found
                    json.features[j].properties.density = dataDensity;
                    break;
                }
            }		
        }

        // Bind data and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", function(d) { return d.properties.NAME_2;})
            .attr("fill", function(d) { return color(d.properties.density); })
			.attr("stroke", "black");
        
    })

});

// Reference: https://bl.ocks.org/mbostock/5562380
// Create a scale for our legend
var x = d3.scaleSqrt()
    .domain([0, 6000])
    .rangeRound([440, 950]);

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-50, 500)");

// Create a legend for the colors 
g.selectAll("rect")
    // Maps values of the output range such that d is the extend of values in the domain of color for corresponding range values
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    // Scale the legend according to the domain x
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

// Append the title of the legend
g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Population Density per kilometer squared");


// Generate axis for the legend
g.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()))
  .select(".domain")
    .remove();