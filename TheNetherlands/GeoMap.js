// Define Margin, Width & Height
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = 1060 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;
    //width = 500,
    //height = 500;


// Define Map Projections - D3 API Reference on Geo > Geo Projections
//var projection = d3.geoAlbersUsa()
    //.scale(1280)
    //.translate([width / 2, height / 2]);

//var projection = d3.geoMercator()
    //.translate([width/2, height/2])
    //.scale([500]);

var projection = d3.geoEquirectangular().scale([10000]).translate([width/2, height/2]).center([5, 52.5]);

//var projection = d3.geoMercator().scale(2000).translate([0, -1200]);

//var center = d3.geoCentroid(json);

//var projection = d3.geoMercator().scale(2000).translate([0, -1200]).center(center);

//path = d3.geo.path().projection(xy);

//var projection = d3.geoStereographic()
    //.center([3.9, 43.0])
    //.scale(4500)
    //.translate([width / 4, height / 2]);
								  
// Define Path
var path = d3.geoPath().projection(projection);
//var path = d3.geoPath();

// Define color scale. A range of color to represent different shade of the color
// In this example, we will represent the color Blue in different shades. 
var color = d3.scaleQuantize()
    .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);




 // Define Tooltip
 var tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
								
// Define SVG
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");   

// Load Data
d3.csv("NetherlandsPopbyProvince.csv", function(data) {
    color.domain([
        d3.min(data, function(d) { return d.population; }), 
        d3.max(data, function(d) { return d.population; })
    ]);
    
    // Load GeoJSON Data
    d3.json("netherlands.json", function(json) {
        //var center = d3.geoCentroid(json);
        //var projection = d3.geoMercator().scale(150).translate([0, -1200]).center(center);
        for (var i = 0; i < data.length; i++) {
            //console.log(data[i].province);
            var dataState = data[i].province;
            //console.log(data[i].population);
            var dataValue = parseFloat(data[i].population);
            //console.log(dataValue);
            //var dataValue = d.population;
            for (var j = 0; j < json.features.length; j++) {
                // name_1 maybe?
                var jsonState = json.features[j].properties.NAME_1;
                console.log(jsonState);
				if (dataState == jsonState) {
                    //console.log(dataValue);
				    json.features[j].properties.population = dataValue;
                    break;				
				}
            }		
        }

    // Bind Data 
    svg.selectAll("path")
        .data(json.features)
        .enter()    
        .append("path")
        .attr("class", "province-boundary")
        .attr("d", path)
        .style("fill", function(d) {
            var value = d.properties.population;
            return color(value);
        })
        //.attr("d", path)
        .on("mouseover", function(d) {   
            tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            tooltip.html("<strong>" + d.properties.NAME_1 + "</strong>" + "<br/>" + "Population: " +
                        d.properties.population + " Million")			
			   .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");		       
        })
        .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });
        
    
    });
});