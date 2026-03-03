(function widgetAliasBootstrap(window, document) {
  "use strict";

  var current = document.currentScript;
  if (!current || !current.src) {
    return;
  }

  var sourceUrl = current.src.replace(/widget\.js(?:\?.*)?$/i, "linkget.js");
  var script = document.createElement("script");
  script.src = sourceUrl;
  script.async = true;
  script.defer = true;
  script.setAttribute("data-linkget-widget", "true");

  var datasetKeys = Object.keys(current.dataset || {});
  datasetKeys.forEach(function forwardDataAttribute(key) {
    script.dataset[key] = current.dataset[key];
  });

  document.head.appendChild(script);
})(window, document);
