var d3;
var Promise;

//Width and height
var w = 700;
var h = 850;

var margin = {left: 20, right: 200, top: 30, bottom: 50} // margin/positioning objects
var shift = {left: 600, top: 550}

//Define map projection
var projection = d3.geoMercator() // Mercator, my mortal enemy

//Define path generator
var path = d3.geoPath().projection(projection); // Geopath generator, maps points/lines onto projection

var indScale = d3.scaleSequential(d3.interpolateBlues) // Color scale for individuals, blue
var HHScale = d3.scaleSequential(d3.interpolatePurples) // Color scale for households, purple

var color_legend = d3.legendColor() // External library
    .shapeWidth(30) // width of the color cells
    .cells(10) // # of cells
    .ascending(true) // Make the order go from top to bottom highest to lowest
    .scale(indScale); // Set the initial scale to the individuals color scale

//var province_color = d3.scaleOrdinal(d3.schemeCategory20b);

//Create SVG element
var svg = d3.select("body") // set up the canvas
            .append("svg")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.top + margin.bottom);

var province_g = svg.append('g') // group for the map
    .attr('class', 'borders')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

var legend_g = svg.append('g') // group for the legend
    .attr('id', 'legend')
    .attr('transform', `translate(${shift.left + margin.left}, ${margin.top + 40})`);

var selector = d3.select('#selector') // the dropdown menu
    .style('left', `${shift.left + margin.left}px`)
    .style('top', `${shift.top + margin.top}px`)

var info = d3.select('body').append('div') // the information overlay
    .attr('class', 'info')
    .style('left', `${shift.left + margin.left - 10}px`)
    .style('top', `${shift.top + margin.top + 20}px`)
    .html('<h3>Mouse over map for information</h3>')

var parsedate = d3.timeParse('%Y-%m-%d'); // time and date parsing and formatting
var fmtdate = d3.timeFormat('%b %d, %Y');

function set_info(row) { // Set the informating using a data row
    var title = row['Admin 2']; // title is the commune
    var subtitle = row['Admin 1']; // sub is the province
    var date = parsedate(row['Survey Date (dd-MMM-yyyy)']); // the survey date
    var household = row['HH']; // both datapoints
    var individual = row['Ind'];
    info.html('<h1>' + title + ' Commune</h1>' // set the innerhtml
              + '<h2>' + subtitle + ' Province</h2>'
              + '<h3>Surveyed ' + fmtdate(date) + '</h3>'
              + `${individual} total displaced individuals present, `
              + `${household} total displaced households.`);
}

function clear_info() { // empty the overlay out out
    info.html('');
}

// bluebirdjs promise magic
var json = Promise.promisify(d3.json); // Now they're promises instead of callback
var csv = Promise.promisify(d3.csv);

var L2$ = json ('Burundi_Admin_2_Communes.json') // promise which will resolve to the map json

function transformData(row) { // tranformation for CSV
    row['Ind'] = +row['Ind'];
    row['HH'] = +row['HH'];
    return row;
}

var data$ = csv('dtm-burundi-baseline-assessment-round-25.csv', transformData) // promise which will resolve to the displaced peoples data

function draw_province(p_name, features, which) { // This function draws the communes
    console.log(p_name, features, which);
    
    const province = province_g.select(`#${p_name.replace(' ', '-')}`); // Fixes issues with spaces in IDs
    const data = features.names.map(name => features[name]); // Create an array of features
        
    province.selectAll('.commune')
        .data(data)
        .enter()
        .append('path')
        .attr('class', d => 'commune')
        .attr('id', d => d.geo.properties.Communes) // Each commune is identified
        .attr('d', d => path(d.geo)) // Draw the borders
        .attr('fill', '#AAA') // base fill color
        .on('mouseover', d => { // Activate the overlay
//            d3.select(d3.event.target).style('stroke', () => province_color(p_name));
            set_info(d.data);
        })
        .on('mouseout', _ => { // clear the overlay
//            d3.select(d3.event.target).style('stroke', '');
            clear_info();
        });
    
    color_province(p_name, features, which); // Color the province
}

function color_province(p_name, features, which) { // Sets the fill color based on the datapoint
    const province = province_g.select(`#${p_name.replace(' ', '-')}`);
    const data = features.names.map(name => features[name]); // same as previous
    
    const color_scale = (which === 'HH') ? HHScale : indScale; // pick which color scale to use
    const legend_title = ((which === 'HH') ? 'Households' : 'Individuals') // Used in the legend
    
    province.selectAll('.commune') // Pick each commune
        .data(data)
        .transition()
        .delay(200) // short delay
        .attr('fill', d => color_scale(d.data[which]));
    
    color_legend.title(legend_title) // Swap the legend's color/title
        .scale(color_scale)
    legend_g.call(color_legend); // activate the legend
}

Promise.all([L2$, data$]) // Flatten promises, read data
    .then(([L2, data]) => {
    
    let header = svg.append('g') // One time set of the header
        .attr('id', 'header')
        .attr('transform', `translate(${margin.left}, ${30})`);
    
    header.append('text')
        .attr('class', 'title')
        .text('Internally Displaced People of Burundi');
    
    header.append('text')
        .attr('class', 'subtitle')
        .attr('transform', 'translate(0, 45)')
        .text('As reported in January of 2018')
    
    let provinces = {};
    let names = [];
    
    indScale.domain(d3.extent(data, row => row['Ind'])); // set our color scale domains
    HHScale.domain(d3.extent(data, row => row['HH']));
    
    L2.features.forEach((feature) => { // Data joining
        p_name = feature.properties['Provinces']
        c_name = feature.properties['Communes']
        
        idp = data.find(row => { // Find the data row which matches the feature
            return row['Admin 2'] === c_name;
        })
        
        if (!provinces[p_name]) { // If this is the first time we've seen this province:
            provinces[p_name] = {} // make a new entry for it
            provinces[p_name]['name'] = p_name; // set the province name
            provinces[p_name]['names'] = [] // Set up the array of commune names
            names.push(p_name); // Store the province name in the top level
        }
        provinces[p_name]['names'].push(c_name); // Then store the commune name
        provinces[p_name][c_name] = {geo: feature, data: idp}; // store the map and row data
    })    
    
    projection.fitExtent([[0, 10], [w, h]], L2); // center burundi inside the  view
        
    province_g.selectAll('.province') // Each province has a group
        .data(names.map((name) => provinces[name]))
        .enter()
        .append('g')
        .attr('class', 'province')
        .attr('id', d => d.name.replace(' ', '-')); // set the ID to the province name
    
    function draw(which) { // Function which draws each province
        names.forEach(name => {
            draw_province(name, provinces[name], which);
        })
    }
    
    function color(which) { // Function which recolors each province
        names.forEach(name => {
            color_province(name, provinces[name], which);
        }) 
    }
    
    draw('Ind'); // Draw the provinces
    
    selector.on('change', _ => { // Listener for the selector
            console.log(d3.event.target.value);
            color(d3.event.target.value); // Redraw the colors
        })
}).catch(error => { // Catch any error from inside the promise chain
    console.error(error)
});

