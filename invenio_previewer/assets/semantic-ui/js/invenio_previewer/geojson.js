/*
 * This file is part of Invenio.
 * Copyright (C) 2025 Brian Kelly.
 *
 * Invenio is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import L from "leaflet"
import "leaflet/dist/leaflet.css";

document.addEventListener("DOMContentLoaded", () => {
  const mapElement = document.getElementById('map')
  const fileUri = mapElement.getAttribute('data-file-uri')
  const fileUrl = new URL(fileUri, window.location.href);

  const map = L.map('map').setView([0, 0], 13);
  let initialView = null;

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  const homeControl = L.control({ position: 'topleft' });
  homeControl.onAdd = function () {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const button = L.DomUtil.create('a', 'geojson-previewer-home-button', container);
    button.href = '#';
    button.title = 'Reset view';
    button.innerHTML = '&#8962;';
    L.DomEvent.disableClickPropagation(button);
    L.DomEvent.on(button, 'click', function (e) {
      L.DomEvent.stop(e);
      if (initialView) {
        map.setView(initialView.center, initialView.zoom);
      }
    });
    return container;
  };
  homeControl.addTo(map);

  fetch(fileUrl.href).then(res => res.json()).then(data => {
    const geoJsonLayer = L.geoJson(data, {
      style: {
        color: "#3399ff",
        weight: 2,
        opacity: 0.5
      },
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 4,
        fillColor: "#3399ff",
        color: "#3399ff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
    })
    geoJsonLayer.addTo(map);
    const bounds = geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { animate: false });
      initialView = { center: map.getCenter(), zoom: map.getZoom() };
    }
    map.invalidateSize();
  });
});
