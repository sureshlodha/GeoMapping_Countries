var width = 960,
        height = 700;
    
var projection_data = {
	center: [0, 22],
	rotate: [-82.58, 0, 0],
	parallels: [7, 38],
	scale: 1200
};
    
var proj = d3.geoAlbers()
            .center(projection_data.center)
            .rotate(projection_data.rotate)
            .parallels(projection_data.parallels)
            .scale(projection_data.scale)
            .translate([width / 2, height / 2]);
    
var svg = d3.select("svg");

//var proj = d3.geoMercator();
var path = d3.geoPath().projection(proj);

var density = d3.map();

var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

var x = d3.scaleSqrt()
    .domain([0, 7000])
    .rangeRound([440, 950]);
    
var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

//Legend
g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

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
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

d3.queue()
    .defer(d3.json, "india.json")
    .defer(d3.tsv, "density.tsv", function(d) { 
                            density.set(d.district, +d.density); 
                            //console.log(density.get(d.district));
                            })
    .await(ready);    
    
function ready(error, india) {
    if (error) throw error;

    //console.log(density)
    //console.log(topojson.feature(india, india.objects.district).features);
    
  svg.append("g")
      .attr("class", "districts")
    .selectAll("path")
    .data(topojson.feature(india, india.objects.district).features)
    .enter().append("path")
      .attr("fill", function(d) { 
            //console.log(d.properties.District);
            return color(d.density = density.get(d.properties.District));})
      .attr("d", path);

  
  
  svg.append("path")
      .attr("class", "county-borders")
      .attr("d", path(topojson.mesh(india, india.objects.district, function(a, b) { return a !== b; })));
    

}