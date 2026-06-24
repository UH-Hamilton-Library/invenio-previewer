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

  const previewIframe = window.parent?.document?.getElementById('preview-iframe');
  let iframeFullscreen = false;
  let iframeStyles = null;

  const toggleIframeFullscreen = () => {
    if (!previewIframe) return;
    if (!iframeFullscreen) {
      iframeStyles = {
        position: previewIframe.style.position,
        zIndex: previewIframe.style.zIndex,
        height: previewIframe.style.height,
        width: previewIframe.style.width,
        top: previewIframe.style.top,
        left: previewIframe.style.left,
        backgroundColor: previewIframe.style.backgroundColor,
      };
      previewIframe.style.position = 'fixed';
      previewIframe.style.zIndex = '9999';
      previewIframe.style.height = '100%';
      previewIframe.style.width = '100%';
      previewIframe.style.top = '0';
      previewIframe.style.left = '0';
      previewIframe.style.backgroundColor = 'white';
      window.parent.document.body.style.overflow = 'hidden';
      iframeFullscreen = true;
    } else {
      previewIframe.style.position = iframeStyles.position;
      previewIframe.style.zIndex = iframeStyles.zIndex;
      previewIframe.style.height = iframeStyles.height;
      previewIframe.style.width = iframeStyles.width;
      previewIframe.style.top = iframeStyles.top;
      previewIframe.style.left = iframeStyles.left;
      previewIframe.style.backgroundColor = iframeStyles.backgroundColor;
      window.parent.document.body.style.overflow = '';
      iframeFullscreen = false;
    }
    window.setTimeout(() => map.invalidateSize(), 100);
  };

  const mapControls = L.control({ position: 'topleft' });
  mapControls.onAdd = function () {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    L.DomEvent.disableClickPropagation(container);

    const homeButton = L.DomUtil.create('a', 'geojson-previewer-map-button', container);
    homeButton.href = '#';
    homeButton.title = 'Reset view';
    homeButton.innerHTML = '&#8962;';
    L.DomEvent.on(homeButton, 'click', function (e) {
      L.DomEvent.stop(e);
      if (initialView) {
        map.setView(initialView.center, initialView.zoom);
      }
    });

    if (previewIframe) {
      const fullscreenButton = L.DomUtil.create('a', 'geojson-previewer-map-button', container);
      fullscreenButton.href = '#';
      fullscreenButton.title = 'Full screen';
      fullscreenButton.innerHTML = '&#9974;';
      L.DomEvent.on(fullscreenButton, 'click', function (e) {
        L.DomEvent.stop(e);
        toggleIframeFullscreen();
      });
    }

    return container;
  };
  mapControls.addTo(map);

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
