
    //Define Margin
    var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
        width = 700 - margin.left -margin.right,
        height = 600 - margin.top - margin.bottom;


    //Define SVG
    var svg = d3.select("div")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("margin-left", "auto")
        .attr("margin-right", "auto");

    // Projection
    // There;s a rotate attribute
    var projection = d3.geoAzimuthalEquidistant()
        .translate([-180, (height) + 2000])
        .scale([2000]);
    
    // Create a path based on the projection
    var path = d3.geoPath(projection);
    var path2 = d3.geoPath(projection);
    
    // Define color scale 
    var color = d3.scaleThreshold()
        .domain([10, 50, 150, 300, 500, 1500, 5000, 10000])
        .range(d3.schemeBuPu[8]);

    // Define sqrt scale for 
    var x = d3.scaleSqrt()
        .domain([0, 20000])
        .rangeRound([300, 800]);

    // Define g for placing legend
    var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(-70,300)");

    // Create legend rectangles based on scale for colors 
    g.selectAll("rect")
      .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 20)
        .attr("x", function(d) { return x(d[0]); })
        
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    // Add label to legend
    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y",  - 6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("font-family", "'Raleway', sans-serif")
        .text("Population per square kilometer");

    // Add appropriate tick marks to the 
    g.call(d3.axisBottom(x)
        .tickSize(25)
        .tickValues(color.domain()))
        .select(".domain")
        .remove();

    // Tooltip
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("left", "28px")
        .text("a simple tooltip");


d3.csv("sweden_city_density.csv", function(error, data) {
    
    d3.json("sweden_geo.json", function(error, json) {
        if (error) throw error; 
        
        for (var i = 0; i < data.length; i++){
            
            // Grab city name
            var dataCity = data[i].cities;
            
            // Grab city's density data
            var dataDensity = parseInt(data[i].density);
            
            // Find corresponding data in JSON
            for(var j = 0; j < json.features.length; j++) {
                var jsonCounty = json.features[j].properties.NAME_2;
                
                if (dataCity == jsonCounty) {
                    json.features[j].properties.value = dataDensity;
                    console.log(json.features[j].properties.value);
                }
            }            
        }
        
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "boundary")
            .style("fill", function (d) {
                
                // Get density value
                var density = d.properties.value; 
            
                if (density != null) {
                    return color(density);
                } else { 
                    return "#dddddd";
                }
            })
            .on("mouseover", function(d){
                tooltip.style("visibility", "visible")
                    .text("City: " + d.properties.NAME_2 + "  ||  " + "Density: " + d.properties.value + " people/km^2");
            })
            .on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            });
    });
});
