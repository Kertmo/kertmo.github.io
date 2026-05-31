let map = L.map('map', {
  center: [58.373523, 26.716045],
  zoom: 12,
  zoomControl: true // Enable default zoom control
});

map.zoomControl.setPosition('topright');

const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: 'OpenStreetMap contributors'
});

osmLayer.addTo(map);
