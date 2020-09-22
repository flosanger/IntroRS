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
        [[[-71.99143006229647, 42.43996457033652],
          [-71.99143006229647, 42.202364403486115],
          [-71.65909363651522, 42.202364403486115],
          [-71.65909363651522, 42.43996457033652]]], null, false);




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
var singlebandviz = {min:1000, max:5000, palette:['black','white']};
//map band 8 of hte first image of the list 
Map.addLayer (firstimage.select('B8'),singlebandviz,"A NIR band");

//filter by clouds - create filter
var qualityfilter = Summer2019.filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',10);
print('allfilters',qualityfilter);

//Select one image for visualization 
var firstfilterimage = qualityfilter.first()
print ('first all filtered sentinel image', firstfilterimage);
//visualize the single band
var singlebandviz = {min:1000, max:5000, palette:['black','white']};
Map.addLayer (firstfilterimage.select('B8'),singlebandviz,"A NIR band low clouds");

/// The image still have clouds. The following script allows to remove (mask out) clouds from each image

// Function to mask clouds using the Sentinel-2 QA band.

    function maskS2clouds(image) {
      var qa = image.select('QA60')
    
      // Bits 10 and 11 are clouds and cirrus, respectively. Here we select those bits
      var cloudBitMask = 1 << 10;
      var cirrusBitMask = 1 << 11;
    
      // Both flags should be set to zero, indicating clear conditions. We keep the pixel if the Bit is zero
      var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
                 qa.bitwiseAnd(cirrusBitMask).eq(0))
    
      // Return the masked and scaled data, without the QA bands.
      return image.updateMask(mask).divide(10000)
          .select("B.*")
          .copyProperties(image, ["system:time_start"])
    }

//Once the function is created, we can apply function to the selected images
var CloudMasked = qualityfilter.map(maskS2clouds)
print ("all cloud masked", CloudMasked);

// visualize single band using a palette from balck (0) to white (255)
  // first create visualization (if you did this already you don't need to re-do it!)
       var singlebandViz = {min: 0, max: 1, palette: ['black', 'white']};
     // map layer using the visualization settings
      // first select one of the images (e.g.  the first one)
       var CloudMFirst = CloudMasked.first();
    // then select hte band to visualize in this case sentinel band 8 (NIR)
       Map.addLayer (CloudMFirst.select('B8'), singlebandViz, "a cloud masked NIR");
  // visualize the image as a false color RGB : swir-NIR-Red
      var falseColor1 = {
      bands: ["B11", "B8", "B4"],
      min: 0,
      max: 0.5 
      };
  //Map the false color
    Map.addLayer (CloudMFirst, falseColor1, "a cloud masked false color composite");
    
    
// But the image still has clouds
// We can combine sections of cloud free images from multiple dates to create  cloud free bands and composites
// The operations to combine multiple bands is called REDUCERS

// Cloud free reducer to calcualte the median across all bands

    var CloudMaskMedian = CloudMasked.median();
    
    var falseColor1 = {
      bands: ["B11", "B8", "B4"],
      min: 0,
      max: 0.5 
      };
      
    Map.addLayer (CloudMaskMedian, falseColor1, "median cloud masked false color");
    print ('median of all filterd ',CloudMaskMedian);
    
    

//Indices can be calcualted though the normalized difference operation
// the order of bands is: "first, second"  the normalized difference equation: (first - second)/(first + second)
// Create an NDVI image from cloud filtered medians, define visualization parameters and display.


var ndvi = CloudMaskMedian.normalizedDifference(["B8", "B4"]);
var ndviViz = {min: 0, max: 1, palette: ['blue', 'white', 'yellow', 'green']};
Map.addLayer(ndvi, ndviViz, 'NDVI', false);



// Create a binary layer using logical operations 
// .lt values of 1 below threshold and zero above
// .gt values of 1 above threshold and zero below

//select NDVI greater than 0.5
var ndvihigh = (ndvi.gt(0.5));
Map.addLayer(ndvihigh, {}, 'NDVI > 0.5', false);




////// Export  image, specifying scale and region.
//        Export.image.toDrive({
//          image: ndvihigh,
//          folder: 'XXX',
//          description: 'NDVI-image',
//          scale: 20,
//          maxPixels:  965244740,
//          region: geometry
//        });

