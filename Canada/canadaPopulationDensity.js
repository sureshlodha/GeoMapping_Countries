
//Width and height
var w = 750;
var h = 500;

//Define map projection
//var projection = d3.geoMercator().translate([w, h+170]).scale([230]);
var projection = d3.geoAlbers().scale([700]).translate([w/2,h+45]).parallels([50,70])

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Define quantize scale to sort data values into buckets of color
var colorList = ["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"];
var color = d3.scaleQuantize().range(colorList);

var colorList2 = ["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"];
var color2 = d3.scaleThreshold().range(colorList2);

//Number formatting for population values
var formatAsThousands = d3.format(",");  //e.g. converts 123456 to "123,456"

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("text-align", "center");

//Define Tooltip here
var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

defaultData();

function defaultData(){
//Load in population data
d3.csv("CanadaPopulation2016simple.csv", function(data) {
    svg.selectAll("path").remove();
    document.getElementById("title").innerHTML = "Canada Population Density, 2016";
    data.forEach( function(d){
        d.value = +d.value;
        d.area = +d.area; //in km squared
        d.popDensity = d.value/d.area;
        //console.log(d);
    })
    
    //console.log(d3.extent( data, function(d) { return d.popDensity;}));
    //Set input domain for color scale
    var bounds = d3.extent( data, function(d) { return d.popDensity;})
    color.domain(bounds);
    var x = d3.scaleSqrt()
              .domain([0, 4500])
            .rangeRound([440, 950]);

    //Load in GeoJSON data
    d3.json("canada.json", function(json) {

        //Merge the data and GeoJSON
        //Loop through once for each data value
        for (var i = 0; i < data.length; i++) {
            var dataLoc = data[i].location;	
            var dataValue = parseFloat(data[i].value);	//Grab data value, and convert from string to float
            var dataArea = parseFloat(data[i].area);
            var dataPopDensity = parseFloat(data[i].popDensity);
            
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonLoc = json.features[j].properties.Name;
                if (dataLoc == jsonLoc) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataPopDensity;

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
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "black";
                }
           }).on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .95);
            div.html( "<b>"+d.properties.Name+
                     "</br>Population Density: "+ d.properties.value+"</b>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
       })
       .on("mouseout", function(d) {
            div.transition()
               .duration(500)
               .style("opacity", 0);
       });
        

    });

    
    
    var legendX = 30;
    var legendY = h-70;
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 200)
        .attr("height", 60)
        .attr("fill", "lightgrey")
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList[0])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+40)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList[1])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+80)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList[2])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+120)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList[3])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+160)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList[4])
        .style("stroke-size", "1px");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+10)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("≤ 5");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+50)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~10");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+90)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~15");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+130)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~20");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+170)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~25");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+100)
        .attr("y", legendY+50)
        .style("text-anchor", "middle")
        .text("Population Density");
});
};

function otherData(){
    document.getElementById("title").innerHTML = "Number of Police Officers, 2016";
    console.log("help");
    svg.selectAll("path").remove();
    d3.csv("CanadaPoliceOfficers2016simple.csv", function( data) {
    data.forEach( function(d){
        d.value = +d.value;
        //d.area = +d.area; //in km squared
        //d.popDensity = d.value/d.area;
        console.log(d);
    })
    
    //console.log(d3.extent( data, function(d) { return d.value;}));
    //Set input domain for color scale
    color2.domain([5000,10000,15000,20000, 25000]);

    //Load in GeoJSON data
    d3.json("canada.json", function(json) {

        //Merge the data and GeoJSON
        //Loop through once for each data value
        for (var i = 0; i < data.length; i++) {
            var dataLoc = data[i].location;	
            var dataValue = parseFloat(data[i].value);	//Grab data value, and convert from string to float
            var dataArea = parseFloat(data[i].area);
            var dataPopDensity = parseFloat(data[i].popDensity);
            
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {

                var jsonLoc = json.features[j].properties.Name;
                if (dataLoc == jsonLoc) {
                    //Copy the data value into the JSON
                    json.features[j].properties.value = dataValue;

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
                var value = d.properties.value;

                if (value) {
                    //If value exists…
                    return color2(value);
                } else {
                    //If value is undefined…
                    return "black";
                }
           }).on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .95);
            div.html( "<b>"+d.properties.Name+
                     "</br>Number of Police Officers: "+ d.properties.value+"</b>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
       })
       .on("mouseout", function(d) {
            div.transition()
               .duration(500)
               .style("opacity", 0);
       });
        

    });

        
    
    var legendX = 30;
    var legendY = h-70;
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 200)
        .attr("height", 60)
        .attr("fill", "lightgrey")
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList2[0])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+40)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList2[1])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+80)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList2[2])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+120)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList2[3])
        .style("stroke-size", "1px");
    svg.append("rect")
        .attr("x", legendX+160)
        .attr("y", legendY)
        .attr("width", 40)
        .attr("height", 30)
        .attr("fill", colorList2[4])
        .style("stroke-size", "1px");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+3)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("≤ 5k");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+45)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~10k");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+85)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~15k");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+125)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~20k");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+165)
        .attr("y", legendY+20)
        .style("text-anchor", "start")
        .text("~25k");
    svg.append("text")
        .attr("class", "label")
        .attr("x", legendX+100)
        .attr("y", legendY+50)
        .style("text-anchor", "middle")
        .text("Number of Police Officers");
    });  
};