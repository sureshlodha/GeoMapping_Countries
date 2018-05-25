//Width and height
var w = 1000;
var h = 700;

//Define map projection
var projection = d3.geoMercator()
                   .translate([-3000, 30500])
                   .scale(30000);

//Define path generator
var path = d3.geoPath()
             .projection(projection);

var color = d3.scaleLinear()
              .domain([0,770])
              .range(["rgb(0,90,0)","rgb(0,255,0)"]);
								
//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

var svg = d3.select("svg");

svg.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(400,20)");

var legendLinear = d3.legendColor()
  .shapeWidth(40)
  .cells(11)
  .orient('horizontal')
  .title("Population per Square Mile")
  .scale(color);

svg.select(".legendLinear")
  .call(legendLinear);

d3.csv("Luxembourg.csv", function(data) {

    //Set input domain for color scale
    color.domain([
        d3.min(data, function(d) { return d.population; }), 
        d3.max(data, function(d) { return d.population; })
    ]);

    //Load in GeoJSON data
    d3.json("gadm36_LUX_2.json", function(json) {
        //Merge the ag. data and GeoJSON
        //Loop through once for each ag. data value
        for (var i = 0; i < data.length; i++) {
            //Grab state name
            var dataState = data[i].district;
            
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].population);
            
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.Name;
				if (dataState == jsonState) {
				    //Copy the data value into the JSON
				    json.features[j].properties.population = dataValue;
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
           .style("fill", function(d) {
                //Get data value
                var value = d.properties.population;
				if (value) {
                    //If value exists…
				    return color(value);
				} else {
				    //If value is undefined…
				    return "#ccc";
				}
            });
			
    });
});