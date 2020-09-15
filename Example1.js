var sentinel = ee.ImageCollection("COPERNICUS/S2_SR"),
    area = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-72.21115662479647, 42.47036123157294],
          [-72.21115662479647, 42.039386429927255],
          [-71.45859314823397, 42.039386429927255],
          [-71.45859314823397, 42.47036123157294]]], null, false);
          
          

//create spatial filter
var SpatFiltered = sentinel.filterBounds(area);
print ('filter', SpatFiltered);

//create temporal filter
var Summer2019Filter = ee.Filter.date('2019-06-01', '2019-08-31');

//apply temporal filter
var Summer2019 = SpatFiltered.filter(Summer2019Filter);
print ('Summer2019', Summer2019); 
//Select the first image of the 'summer 2019' list
var firstimage = Summer2019.first();
print ('first sentinel image', firstimage);

//create visualization palette
var singlebandviz = {min:1000, max:5000, palette:['white','black']};
//map band 8 of hte first image of the list 
Map.addLayer (firstimage.select('B8'),singlebandviz,"A NIR band");

//filter by clouds - create filter
var qualityfilter = Summer2019.filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',5);
print('allfilters',qualityfilter);

//Select one image for visualization 
var firstfilterimage = qualityfilter.first()
print ('first all filtered sentinel image', firstfilterimage);
//visualize the single band
var singlebandviz = {min:1000, max:5000, palette:['black','white']};
Map.addLayer (firstfilterimage.select('B8'),singlebandviz,"A NIR band low clouds");
