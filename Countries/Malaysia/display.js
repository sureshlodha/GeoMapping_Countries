//Define Margin
var margin = {left: 0, right: 0, top: 50, bottom: 0 }, 
    width = 1400 - margin.left -margin.right,
    height = 630 - margin.top - margin.bottom,
    scaleWidth=width + margin.left + margin.right,
    scaleHeight=50;

//Define SVG
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var scale = d3.select("body").append("svg")
    .attr("width", scaleWidth)
    .attr("height", scaleHeight);

var color0 = "#f7fcfd", color1 = "#e0ecf4", color10 = "#bfd3e6", color200 = "#9ebcda", color500="#8856a7", color1000="#810f7c", color1500="#225ea8", color5000="#253494";

var color = d3.scaleLinear()
    .domain([0,1,50,200,500,1000,1500,6000])
    .range([d3.rgb(color0), d3.rgb(color1), d3.rgb(color10), d3.rgb(color200),d3.rgb(color500), d3.rgb(color1000), d3.rgb(color1500), d3.rgb(color5000)]);

//map
// change the scales here because malaysia was small and centering helped.
var projection = d3.geoMercator()
							  .scale([3400])
                              .center([105,4.8]);

var path = d3.geoPath()
    .projection(projection);

// get the information from the Malaysia popular density csv.

var popularArea = null;
d3.csv("malaypop.csv", function(data) {
    data.forEach(function(d) { 
        d.Population = +d.Population;
        d.Area = +d.Area;
    });
     popularArea = data;
});

// call the .json file to draw out the map
d3.json("malaysia.json", function(data) {
    var features = data.features;
  
    // Drawing the district borders
    svg.selectAll('path')
        .data(features)
        .enter().append('path')
        .attr('d', path)
        .attr("fill", fillArea)
        .attr("stroke","black")
        .attr("stroke-width", 1);
});

//legend
var legend = d3.select('svg')
.append('g')
.selectAll('g')
.data(color.range())
.enter()
.append('g')
.attr('class', 'legend')
.text("hi there")
.attr('transform', function(d, i){
    var height = 30;
    var x = 500;
    var y = i * height;
    return 'translate(' + x + ',' + (y + 30) + ')';
   });
                           
legend.append('rect')
     .attr('width', 20)
     .attr('height', 20)
     .style('fill', function(d){ return d; })
     .style('stroke', color);
 legend.append('text')
      .attr('x', 25)
      .attr('y', 16)
      .text(function(d, i){ 
      var ranges = ["1-50", "51-200", "201-500", "501-1000", "1001-1500", "1501-5000", "5001-6000", ">6000"];
      return ranges[i] + "   people/square km";
                    });

function Compare(str1, str2, n) {
    if(str1.legnth < n || str2.length < n)
        return false;
    for(var i = 0; i < n; ++i) {
        if(str1[i] !== str2[i])
            return false;
    }
    return true;
}

function fillArea(d) {
    var poparea = pArea(d.properties.NAME_2);
    if(poparea != null) {
        if(poparea.Area != null) {
            var density = poparea.Population / poparea.Area
            return color(density);
        }
        else {
            console.log(poparea.Population);
        }
    }
    else {
        return "white";
    }
}

function pArea(district) {
    for(var i = 0; i < popularArea.length; ++i) {
        if(Compare( popularArea[i].District, district, district.length/2))
            return  popularArea[i];   
    }
    return null;
}

