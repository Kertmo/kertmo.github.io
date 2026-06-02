import * as layers from "./layers.js";
import * as turfPractice from "./turfPractice.js";

let map = L.map('map', {
  center: [58.373523, 26.716045],
  zoom: 10,
  zoomControl: true // Enable default zoom control
});

map.createPane('customDistrictsPane');
map.getPane('customDistrictsPane').style.zIndex = 390;

map.zoomControl.setPosition('topright');

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Esri, Maxar, Earthstar Geographics, and the GIS community',
  maxZoom: 19
});

const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 17,
  attribution: 'Map data: &amp;copy; OpenStreetMap contributors, SRTM | Map style: &amp;copy; OpenTopoMap (CC-BY-SA)'
});

// Default map settings
function defaultMapSettings() {
  map.setView([58.373523, 26.716045], 12)
};
export { defaultMapSettings }

const baseLayers = {
  "OpenStreetMap": osmLayer,
  "Satellite": satelliteLayer,
  "Topographic": topoLayer
};

let districtsLayer;
let choroplethLayer;
let heatMapLayer;
let markersLayer;
let activeWmsLayers = {};

// Districts GeoJSON
async function loadDistrictsLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    
    districtsLayer = L.geoJson(data, {
      style: function(feature) {
        return {
          fillColor: getDistrictColor(feature.properties.OBJECTID),
          fillOpacity: 0.5,
          weight: 1,
          opacity: 1,
          color: 'grey'
        };
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup(feature.properties.NIMI || 'District ' + feature.properties.OBJECTID);
      },
      pane: 'customDistrictsPane'
    });
  } catch (error) {
    console.error("Error loading districts data:", error);
  }
}


// color function
function getDistrictColor(id) {
  switch (id) {
    case 1: return '#ff0000';
    case 13: return '#009933';
    case 6: return '#0000ff';
    case 7: return '#ff0066';
    default: return '#ffffff';
  }
}

// Choropleth layer
async function loadChoroplethLayer() {
  try {
    const response = await fetch('geojson/tartu_city_districts_edu.geojson');
    const data = await response.json();
    
    choroplethLayer = L.choropleth(data, {
      valueProperty: 'OBJECTID',
      scale: ['#e6ffe6', '#004d00'],
      steps: 11,
      mode: 'q',
      style: {
        color: '#fff',
        weight: 2,
        fillOpacity: 0.8,
      },
      onEachFeature: function(feature, layer) {
        layer.bindPopup('Value: ' + feature.properties.OBJECTID);
      },
      pane: 'customDistrictsPane'
    });
  } catch (error) {
    console.error("Error loading choropleth data:", error);
  }
}

// Heat Map Layer
async function loadHeatMapLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const heatData = data.features.map(function(feature) {
      return [
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0],
        feature.properties.area || 1
      ]
    })
    
    heatMapLayer = L.heatLayer(heatData, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
    })

  } catch (error) {
    console.error("Error loading heatmap data:", error)
  }
}

// Cell Towers - Markers with Clusters
async function loadMarkersLayer() {
  try {
    const response = await fetch('geojson/tartu_city_celltowers_edu.geojson')
    const data = await response.json()
    
    const geoJsonLayer = L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 5,
          fillColor: 'red',
          fillOpacity: 0.5,
          color: 'red',
          weight: 1,
          opacity: 1
        })
      },
      onEachFeature: function(feature, layer) {
        if (feature.properties) {
          layer.bindPopup('Cell Tower<br>Area: ' + (feature.properties.area || 'Unknown'))
        }
      }
    })
    
    markersLayer = L.markerClusterGroup()
    markersLayer.addLayer(geoJsonLayer)
  } catch (error) {
    console.error("Error loading markers data:", error)
  }
}

async function initializeLayers() {
  await Promise.all([
    loadDistrictsLayer(),
    loadChoroplethLayer(),
    loadHeatMapLayer(),
    loadMarkersLayer()
  ])

  const overlayLayers = {
    "Markers": markersLayer,
    "Heatmap": heatMapLayer,
    "Choropleth layer": choroplethLayer,
    "Tartu districts": districtsLayer,
  }

// insert function call here
loadWmsLayers(layers.wmsLayers, overlayLayers, activeWmsLayers)
  
  const layerControlOptions = {
    collapsed: false,
    position: 'topleft'
  };

  const layerControl = L.control.layers(baseLayers, overlayLayers, layerControlOptions);

  layerControl.addTo(map);
  
  const container = layerControl.getContainer();
  
  const button = document.createElement("button");
  button.innerText = "Default View";
  button.style.width = "100%";
  button.style.padding = "6px";
  
  container.insertBefore(button, container.firstChild);
  
  button.addEventListener("click", defaultMapSettings);

  osmLayer.addTo(map);

  // districtsLayer.addTo(map);
}

function loadWmsLayers(layersList, overlayLayers, activeWmsLayers) {
  layersList.forEach(layer => {

    let paneName = `${layer.layers}-pane`
    map.createPane(paneName)
    map.getPane(paneName).style.zIndex = layer.zIndex
    let newLayer = L.tileLayer.wms(layer.url, {
      version: layer.version,
      layers: layer.layers,
      format: layer.format,
      transparent: layer.transparent,
      zIndex: layer.zIndex,
      crs: L.CRS.EPSG3857,
      pane: paneName
    });

    overlayLayers[layer.title.en] = newLayer;
    activeWmsLayers[layer.layers] = false;
  });
}

turfPractice.turfFunctions(map);

function toggleActiveState(layerId, boolean) {
  if (typeof(activeWmsLayers[layerId]) == "boolean") {
    activeWmsLayers[layerId] = boolean;
  }
}

map.on('overlayadd', (event) => {
  let layerId = event.layer.options.layers;
  toggleActiveState(layerId, true);
  console.log(activeWmsLayers);
});

map.on('overlayremove', (event) => {
  let layerId = event.layer.options.layers;
  toggleActiveState(layerId, false);
  console.log(activeWmsLayers);
});


map.on('click', function(event) {

  const infoWindowContent = document.getElementById('info-content');
  infoWindowContent.innerHTML = "";

  Object.entries(activeWmsLayers).forEach(([key, value]) => {
    if (value === true) {
      document.getElementById('info-box').style.display = 'block';

      console.log(`Querying ${key}...`);

      const url = buildRequestUrl(
        event,
        'https://landscape-geoinformatics.ut.ee/geoserver/pa2023/wms?',
        key
      );
      fetchWmsData(url, key);
    }
  });
});

function buildRequestUrl(e, baseUrl, layerName) {
  const bounds = map.getBounds();
  const bbox = [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth()
  ].join(',');

  const size = map.getSize();
  const sizeX = size.x;
  const sizeY = size.y;

  const xPoint = Math.floor(e.containerPoint.x);
  const yPoint = Math.floor(e.containerPoint.y);

  const wmsUrl = baseUrl;
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.1.1',
    request: 'GetFeatureInfo',
    query_layers: layerName,
    layers: layerName,
    info_format: 'application/json',
    x: xPoint,
    y: yPoint,
    srs: 'EPSG:4326',
    width: sizeX,
    height: sizeY,
    bbox: `${bbox}`
  });

  return wmsUrl + params;
}

function getLayerName(layersData, layerName) {
  const layer = layersData.filter(entry => entry.layers == layerName)
  return layer[0].title.en
}

function fetchWmsData(fullUrl, layerName) {
  fetch(fullUrl)
    .then(response => response.json())
    .then(data => {
    const content = document.getElementById('info-content')
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const props = feature.properties
      // show the title of the layer
      let html = `<h4>${getLayerName(layers.wmsLayers, layerName)}</h4><ul>`      
      // show each entry in properties by looping through them
      for (const key in props) {
        // display properties as a list
        html += `<li><strong>${key}:</strong> ${props[key]}</li>`
      }
      // close the unordered list
      html += '</ul>'
      // update the content of the element by adding the new html
      content.innerHTML += html
    } else {
      // fallback message to show
      content.innerHTML += `<em>No features found for ${getLayerName(layers.wmsLayers, layerName)}</em><br>`
    }
    })
    .catch(error => {
      console.error('Request failed:', error);
    });
}

document.getElementById('info-close').addEventListener('click', () => {
  document.getElementById('info-box').style.display = 'none';
});

initializeLayers();

