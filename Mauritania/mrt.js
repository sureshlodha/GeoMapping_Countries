 //Width and height
 var margin = {
         left: 10,
         right: 10,
         top: 0,
         bottom: 0
     },
     width = 920 - margin.left - margin.right,
     height = 620 - margin.top - margin.bottom;

 //Define map projection
 var projection = d3.geoMercator()
     .scale([2300])
     .translate([1000, 1200])

 //Define path generator
 var path = d3.geoPath()
     .projection(projection);

 //Define quantize scale to sort data values into buckets of color
 var color = d3.scaleLinear() //                           
     .range(d3.schemeReds[3]);

 //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
 //https://github.com/d3/d3-scale-chromatic

 //Create SVG element
 var svg = d3.select("body")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
     .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


 //Create legend svg
 //Define Legend SVG
 var svgLegend = d3.select("body")
     .append("svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", 300 + margin.top + margin.bottom)
     .attr("transform", "translate(" + margin.left + "," + -520 + ")");


 var legend = d3.legendColor()
     .shapeWidth(100)
     .title("test")
     .cells([
         .5, 1, 5, 10, 20, 30, 50, 3500
     ])
     .orient('vertical')
     .scale(color);

 svgLegend.append("g")
     .attr("class", "legend");
 svgLegend.select(".legend")
     .call(legend);

var counties = svg.append("g")
    .attr("id", "Mauritania");

 //Load in agriculture data
 d3.csv("pop_dens.csv", function(data) {

     //Set input domain for color scale
     color.domain([
         d3.min(data, function(d) {
             return d.value;
         }),
         d3.max(data, function(d) {
             return d.value;
         })
     ]);

     //Load in GeoJSON data
     d3.json("MRT_2.json", function(json) {

         //Merge the ag. data and GeoJSON
         //Loop through once for each ag. data value
         for (var i = 0; i < data.length; i++) {

             //Grab state name
             var dataState = data[i].state;

             //Grab data value, and convert fr om string to float
             var dataValue = parseFloat(data[i].value);

             //Find the corresponding state inside the GeoJSON
             for (var j = 0; j < json.features.length; j++) {

                 var jsonState = json.features[j].properties.Name;

                 if (dataState == jsonState) {

                     //Copy the data value into the JSON
                     json.features[j].properties.value = dataValue;
                     //                            console.log(dataValue);
                     //Stop looking through the JSON
                     break;

                 }
             }
         }

         //Bind data and create one path per GeoJSON feature
         counties.selectAll("path")
             .data(json.features)
             .enter()
             .append("path")
             .attr("d", path)
             .style("fill", function(d) {
                 //Get data value
                 var value = d.properties.value;

                 if (value) {
                     //If value exists…
                     return color(value);
                 } else {
                     //If value is undefined…
                     return "blue";
                 }
             });

     });

 });