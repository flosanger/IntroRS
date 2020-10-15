var area = /* color: #d63000 */ee.Geometry.MultiPoint(),
    landsat8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR"),
    landsat5 = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR"),
    Landsat7 = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR");

//Before starting, draw a polygon surrounding your study area in the map below
// Be sure the geometry is renamed to 'area'

//create spatial filter
// for the .filterBounds change the prefix to be either landsat5 or Landsat8
var SpatFiltered = landsat5.filterBounds(area);
print ('filter', SpatFiltered); 

//create temporal filter -
// you can change the dates or add more filters. 
    var F1 = ee.Filter.date('2007-06-01','2007-08-31');
    var F2 = ee.Filter.date('2008-06-01','2008-08-31');

// Create joint Filter
    var TimeFilter = ee.Filter.or(F1, F2); 

//apply temporal filter
var SpatTimeFilt = SpatFiltered.filter(TimeFilter);
print ('SpatTimeFilt', SpatTimeFilt); 

//filter by clouds - create filter searching for the amount fo cloud cover in the image metadata
//and selecting less than 10%

var qualityfilter = SpatTimeFilt.filterMetadata('CLOUD_COVER_LAND','less_than',10);
print('allfilters',qualityfilter);

//Select the first image in the list for visualization 
var firstfilterimage = qualityfilter.first()
print ('first all filtered landsat image', firstfilterimage);

//visualize the single band
var singlebandviz = {min:1000, max:5000, palette:['black','white']};
Map.addLayer (firstfilterimage.select('B5'),singlebandviz,"A NIR band low clouds");

/// The image still have clouds. The following script allows to remove (mask out) clouds from each image
// Function to mask clouds using the landsat QA band.

    function maskS2clouds(image) {
      var qa = image.select('pixel_qa')
    
      // Bits 3 and 5 are clouds and cloud shadows, respectively. Here we select those bits
      var cloudBitMask = 1 << 3;
      var cirrusBitMask = 1 << 5;
    
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
       Map.addLayer (CloudMFirst.select('B5'), singlebandViz, "a cloud masked NIR");
  // visualize the image as a false color RGB : swir-NIR-Red
      var falseColor1 = {
      bands: ["B5", "B4", "B3"],
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
      bands: ["B5", "B4", "B3"],
      min: 0,
      max: 0.5 
      };
      
    Map.addLayer (CloudMaskMedian, falseColor1, "median cloud masked false color");
    print ('median of all filterd ',CloudMaskMedian);
    

////// Export  image, specifying scale and region.
// in this case it will be downloaded into afolder called FP in your Google Drive
// in the .select indicate the bands to be downloaded- not hta tthe names will be differnt for landsat 8 and landsat 5
// the output will be a SINGLE tiff image that contains all the selected bands. 
var median = CloudMaskMedian.select (["B1","B2", "B3", "B4", "B5", "B6","B7"]); 

        Export.image.toDrive({
          image: median,
          folder: 'FP',
          description: 'Download-image',
          scale: 30,
          maxPixels:  965244740,
          region: area
        });

