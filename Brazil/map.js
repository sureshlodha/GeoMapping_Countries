var geoMap = (function(){
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = 800 - margin.left -margin.right,
    height = 800 - margin.top - margin.bottom;
var svg;
var uri = 'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';
var projection = d3.geoEquirectangular().translate([width/2, height/2]);
var path = d3.geoPath().projection(projection);
var color = d3.scaleQuantize().range(["rgb(237,248,233)", "rgb(186,228,179)",
"rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
var v_color = d3.scaleQuantize().range(["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"]);
    
var pop_scale = d3.scaleThreshold().range(["rgb(237,248,233)", "rgb(186,228,179)",
"rgb(116,196,118)", "rgb(49,163,84)", "rgb(0,109,44)"]);
var crime_scale = d3.scaleThreshold().range(["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"]);
var toggle = true;

var key;
var x = d3.scaleSqrt()
.rangeRound([width/2,width ]).nice();
var x2 = d3.scaleSqrt()
    .rangeRound([width/2, width]).nice();
function mergeGeoData(data){
    var orderByName = function(a,b) {
        return a.name < b.name ? -1 : a.name === b.name ? 0 : 1;
    };
    
    data[1].sort(orderByName);
    data[2].sort(orderByName); 
    
    for(var i = 0; i < data[0].features.length; i++){
        data[0].features[i].properties['population'] = +data[1][i].population.replace(/,/g ,"").replace(/\./g, '');
        data[0].features[i].properties['violence'] = +(data[2][i].percentage/100);
    }
    return data;
}
    
function init() {
    d3.select("body")
        .append("button")
        .attr("class", "switch-data")
        .text("toggle");
    drawSvg(d3.select("body"));
    key = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)")
    .attr("id", "population");
    
    key2 = svg.append("g")
    .attr("class", "hide-key")
    .attr("transform", "translate(0,40)")
    .attr("id", "crime");
    
    
    Promise.all([getGeoData(uri),getGeoCSV("./state_population.csv"),getGeoCSV("./violence.csv")])
    .then(mergeGeoData).then(setUpMap);
}
    
function setUpMap(data){
    console.log(data);
    projection.fitSize([width,height],data[0]); // makes the projection fit the data
    setColorDomains(data);
    x.domain([
        d3.min(data[0].features, function(d){ return d.properties.population; }),
        d3.max(data[0].features, function(d){ return d.properties.population; })
    ]);
    x2.domain([
        d3.min(data[0].features, function(d){ return d.properties.violence; }),
        d3.max(data[0].features, function(d){ return d.properties.violence; })
    ]);
    key.selectAll("rect")
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
    
    key.call(d3.axisBottom(x)
    .tickSize(13)
    .tickValues(color.domain()).ticks(5).tickArguments([20,"s"]))
    .select(".domain")
    .remove();
    
    key2.selectAll("rect")
      .data(v_color.range().map(function(d) {
          d = v_color.invertExtent(d);
          if (d[0] == null) d[0] = x2.domain()[0];
          if (d[1] == null) d[1] = x2.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x2(d[0]); })
        .attr("width", function(d) { return x2(d[1]) - x2(d[0]); })
        .attr("fill", function(d) { return v_color(d[0]); });
    
    
    
    key2.call(d3.axisBottom(x2)
    .tickSize(13)
    .tickValues(v_color.domain()).tickArguments([20,"%"]))
    .select(".domain")
    .remove();
    
    svg.append("g")
        .attr("class", "brazil-path")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill",function(d){ return color(d.properties.population); })
        .style("stroke","rgb(0,0,0)");
    
    d3.select(".switch-data").on("click", changeData);
    
    svg.append("g")
        .attr("id", "population-title")
        .attr("x", width/2)
        .append("text")
        .text("Brazilian Population 2014")
        .style("font-weight", "bold");
    
     svg.append("g")
        .attr("id", "crime-title")
        .attr("class","hide-key")
        .attr("x", width/2)
        .append("text")
        .text("Brazilian Crime by Percentage of Population 2013")
        .style("font-weight", "bold");
        
    addHTML();
}
function setColorDomains(data){
    color.domain([
        d3.min(data[0].features, function(d){ return d.properties.population; }),
        d3.max(data[0].features, function(d){ return d.properties.population; })
    ]);
    
    pop_scale.domain([
        d3.min(data[0].features, function(d){ return d.properties.population; }),
        d3.max(data[0].features, function(d){ return d.properties.population; })
    ]);
    
    v_color.domain([
        d3.min(data[0].features, function(d){ return d.properties.violence; }),
        d3.max(data[0].features, function(d){ return d.properties.violence; })
    ]);
    
    crime_scale.domain([
        d3.min(data[0].features, function(d){ return d.properties.violence; }),
        d3.max(data[0].features, function(d){ return d.properties.violence; })
    ]);
}
    
function getGeoCSV(uri){
    return new Promise(function(resolve,reject){
        d3.csv(uri, function(error, data){
            if(error) reject(error);
            
            resolve(data);
        });
    });
}
function getGeoData(link){
    return new Promise(function(resolve,reject){
        d3.json(link, function(error, data){
            if(error) reject(error);
            
            resolve(data);
        });
    });
}
function drawSvg(element){
    //! change to element
    svg = element
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("class", "innerGroup")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
}

function changeData(){
    if(toggle){
       svg.select(".brazil-path")
        .selectAll("path").each(function(d){
            d3.select(this).style("fill", function(d){ return v_color(d.properties.violence); });
        });
        d3.select("#crime").classed("hide-key", false);
        d3.select("#crime-title").classed("hide-key",false);
        d3.select("#population-title").classed("hide-key",true);
        d3.select("#population").classed("hide-key",true);
        
    }else {
        svg.select(".brazil-path")
        .selectAll("path").each(function(d){
            d3.select(this).style("fill", function(d){ return color(d.properties.population); });
        }); 
        d3.select("#population").classed("hide-key", false);
        d3.select("#population-title").classed("hide-key",false);
        d3.select("#crime-title").classed("hide-key",true);
        d3.select("#crime").classed("hide-key",true);
    }
    toggle = !toggle;
    
}
   
function addHTML(){
    var body = d3.select("body");
    body
        .append('a')
        .attr('href', "https://ww2.ibge.gov.br/english/estatistica/populacao/contagem2007/default.shtm" )
        .text('IBGE (Brazilian Institute of Geography & Statistics');
    
    body.append('a')
        .attr('href', "https://ww2.ibge.gov.br/english/estatistica/populacao/contagem2007/default.shtm" )
        .text('World Population Review');
    
    body.append('a')
        .attr('href', "http://2015.index.okfn.org/place/brazil/statistics" )
        .text('Global Open Data Index');
    
    body.append('a')
        .attr('href', "https://downloads.ibge.gov.br/downloads_estatisticas.htm#" )
        .text('IBGE Download Data');
    
    
}
return {
    init: init,
    color: color,
};
})()

geoMap.init();