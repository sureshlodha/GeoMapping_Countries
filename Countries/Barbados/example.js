
    var show_edu = false;

    var x = null;
    var xAxis = null;
  

    var width = 960,
        height = 600;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");


    // Append Div for tooltip to SVG
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
 
    var  g = svg.append("g")
                .attr("transform", "translate(460,40)");


    d3.json("barb.json", function(error, data) {
       // if (error) return console.error(error);
        refresh();
        var subunits = topojson.feature(data, data.objects.barb)
        console.log(data); 
        console.log(subunits); 
        var projection = d3.geoMercator() 
        .rotate([59.5, 0])
        .scale(60000)
        .center([0, 13.2])
        .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);
        
        d3.select("input.education").on("click", edu);
         function edu(){
             show_edu = !show_edu;
             refresh();
            }
    
//console.log(subunits);
 function refresh(){       
if(!show_edu){        
        d3.json("barb.json", function(error, description) {
            var color = d3.scaleThreshold()
                .domain([200, 300, 400, 900, 2500])
                .range(["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#dd1c77", "#980043"]);

            
            
            

            svg.selectAll(".subunit")
                .data(topojson.feature(data, data.objects.barb).features)
                .enter().append("path")
                .style("fill", function(d){
                    if(d.properties.Name)
                        return color(d.properties.description);
                })
                .attr("d", path)
                //tooltip on mouseover
                .on("mouseover", function(d) {
                    if(d.properties.Name){
                        d3.select(this).attr("class", "highlight");

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        div.append("div").text("Name: "+d.properties.Name);
                        div.append("div").text("Population: "+d.properties.begin);
                        div.append("div").text("Population per km sq: "+d.properties.description);
                    }
                })
                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlight", false);
                    div.selectAll("*").remove();
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });

           x = d3.scaleLog()
                .domain([100,2500])
                .range([0, 480]);

           xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues([100, 200, 300, 400, 900, 2500])
                .tickFormat(function(d) { return d  ? d : 0; });

            
             
           

            g.selectAll("text").remove();
            g.selectAll("rect").remove();
            g.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                        z: d
                    };
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });

            g.call(xAxis).append("text")
                .attr("class", "caption")
                .attr("y", -6)
                .attr("fill", "#000")
                .text("Population per Sqr. Kilometer");
            
        });

    }
        
if(show_edu){
     d3.json("barb.json", function(error, description) {
             color = d3.scaleThreshold()
                .domain([16, 17, 18, 19, 20])
                .range(["#f7fcb9", "#c2e699", "#78c679", "#31a354", "#238443"]);

            
            
            

            svg.selectAll(".subunit")
                .data(topojson.feature(data, data.objects.barb).features)
                .enter().append("path")
                .style("fill", function(d){
                    if(d.properties.Name)
                        return color(d.properties.timestamp);
                })
                .attr("d", path)
                //tooltip on mouseover
                .on("mouseover", function(d) {
                    if(d.properties.Name){
                        d3.select(this).attr("class", "highlight");

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        div.append("div").text("Name: "+d.properties.Name);
                        div.append("div").text("Population: "+d.properties.begin);
                        div.append("div").text("Percent of pop. that is a full time student: "+d.properties.timestamp);
                    }
                })
                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlight", false);
                    div.selectAll("*").remove();
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });
            
             x = d3.scaleLog()
                .domain([15,20])
                .range([0, 480]);

             xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues([15, 16, 17, 18, 19, 20])
                .tickFormat(function(d) { return d  ? d : 0; });

         
            g.selectAll("text").remove();
            g.selectAll("rect").remove();

            g.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                        z: d
                    };
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });


         g.call(xAxis).append("text")
                .attr("class", "caption")
                .attr("y", -6)
                .attr("fill", "#000")
                .text("Percentage of Population enrolled as Full Time Students");
           
        });
}  }      
    });