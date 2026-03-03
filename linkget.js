(function linkgetWidgetIIFE(window, document) {
  "use strict";

  if (!window || !document) {
    return;
  }

  if (window.LinkgetWidget && window.LinkgetWidget.initialized) {
    return;
  }

  var NAMESPACE = "linkget";
  var ROOT_CLASS = "linkget-root";
  var LOCK_CLASS = "linkget-body-locked";
  var SCRIPT_SELECTOR = 'script[data-linkget-widget], script[src*="linkget.js"], script[src*="widget.js"]';
  var DEFAULT_CONFIG = {
    position: "bottom-right",
    buttonColor: "#2A6BFF",
    buttonIcon: "chat",
    title: "Поделиться страницей",
    shareText: "Нажмите, чтобы поделиться",
    phoneLabel: "Предпочитаете звонить?",
    phoneNumber: "",
    telegramEnabled: true,
    whatsappEnabled: true,
    viberEnabled: true,
    maxEnabled: true,
    telegramIcon: "icons/telegram.svg",
    whatsappIcon: "icons/whatsapp.svg",
    viberIcon: "icons/viber.svg",
    maxIcon: "icons/max.svg",
    closeIcon: "icons/close.svg",
    qrSize: 200,
    lazyLoad: true,
    analytics: false,
    analyticsCallback: "",
    maxShareUrlTemplate: "https://max.ru/?text={text}"
  };

  var state = {
    initialized: false,
    domReady: false,
    modalBuilt: false,
    isOpen: false,
    previousBodyOverflow: "",
    root: null,
    trigger: null,
    overlay: null,
    modal: null,
    qrContainer: null,
    escHandlerBound: null
  };

  var currentScript = document.currentScript || document.querySelector(SCRIPT_SELECTOR);
  var scriptBaseUrl = resolveScriptBaseUrl(currentScript);
  var config = mergeConfig(DEFAULT_CONFIG, readDataConfig(currentScript), readGlobalConfig());
  normalizeConfig(config);
  resolveIconUrls(config, scriptBaseUrl);

  function resolveScriptBaseUrl(scriptElement) {
    if (!scriptElement || !scriptElement.src) {
      return "";
    }
    try {
      var srcUrl = new URL(scriptElement.src, window.location.href);
      srcUrl.hash = "";
      srcUrl.search = "";
      return srcUrl.href.slice(0, srcUrl.href.lastIndexOf("/") + 1);
    } catch (error) {
      return "";
    }
  }

  function resolveIconUrls(targetConfig, baseUrl) {
    var iconKeys = ["telegramIcon", "whatsappIcon", "viberIcon", "maxIcon", "closeIcon"];
    iconKeys.forEach(function resolveKey(key) {
      targetConfig[key] = resolveUrl(targetConfig[key], baseUrl);
    });
  }

  function resolveUrl(value, baseUrl) {
    if (!value || typeof value !== "string") {
      return "";
    }
    var isAbsolute = /^(?:https?:)?\/\//i.test(value) || /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
    if (isAbsolute || value.charAt(0) === "/") {
      return value;
    }
    if (!baseUrl) {
      return value;
    }
    return baseUrl + value.replace(/^\.?\//, "");
  }

  function readGlobalConfig() {
    if (!window.LinkgetWidgetConfig || typeof window.LinkgetWidgetConfig !== "object") {
      return {};
    }
    return window.LinkgetWidgetConfig;
  }

  function readDataConfig(scriptElement) {
    if (!scriptElement || !scriptElement.dataset) {
      return {};
    }
    var dataset = scriptElement.dataset;
    return {
      position: dataset.position,
      buttonColor: dataset.buttonColor,
      buttonIcon: dataset.buttonIcon,
      title: dataset.title,
      shareText: dataset.shareText,
      phoneLabel: dataset.phoneLabel,
      phoneNumber: dataset.phoneNumber,
      telegramEnabled: parseBoolean(dataset.telegram, DEFAULT_CONFIG.telegramEnabled),
      whatsappEnabled: parseBoolean(dataset.whatsapp, DEFAULT_CONFIG.whatsappEnabled),
      viberEnabled: parseBoolean(dataset.viber, DEFAULT_CONFIG.viberEnabled),
      maxEnabled: parseBoolean(dataset.max, DEFAULT_CONFIG.maxEnabled),
      telegramIcon: dataset.telegramIcon,
      whatsappIcon: dataset.whatsappIcon,
      viberIcon: dataset.viberIcon,
      maxIcon: dataset.maxIcon,
      closeIcon: dataset.closeIcon,
      qrSize: parseNumber(dataset.qrSize, DEFAULT_CONFIG.qrSize),
      lazyLoad: parseBoolean(dataset.lazyLoad, DEFAULT_CONFIG.lazyLoad),
      analytics: parseBoolean(dataset.analytics, DEFAULT_CONFIG.analytics),
      analyticsCallback: dataset.analyticsCallback,
      maxShareUrlTemplate: dataset.maxShareTemplate
    };
  }

  function parseBoolean(rawValue, fallbackValue) {
    if (typeof rawValue !== "string") {
      return fallbackValue;
    }
    var normalized = rawValue.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
    return fallbackValue;
  }

  function parseNumber(rawValue, fallbackValue) {
    var parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackValue;
  }

  function normalizeConfig(targetConfig) {
    targetConfig.position = targetConfig.position === "bottom-left" ? "bottom-left" : "bottom-right";
    targetConfig.buttonIcon = targetConfig.buttonIcon === "message" ? "message" : "chat";
    targetConfig.title = String(targetConfig.title || DEFAULT_CONFIG.title);
    targetConfig.shareText = String(targetConfig.shareText || DEFAULT_CONFIG.shareText);
    targetConfig.phoneLabel = String(targetConfig.phoneLabel || DEFAULT_CONFIG.phoneLabel);
    targetConfig.phoneNumber = String(targetConfig.phoneNumber || "").trim();
    targetConfig.qrSize = Math.max(128, Math.min(320, parseInt(targetConfig.qrSize, 10) || DEFAULT_CONFIG.qrSize));
    targetConfig.buttonColor = isValidColor(targetConfig.buttonColor) ? targetConfig.buttonColor : DEFAULT_CONFIG.buttonColor;
    targetConfig.maxShareUrlTemplate = String(targetConfig.maxShareUrlTemplate || DEFAULT_CONFIG.maxShareUrlTemplate);
  }

  function isValidColor(value) {
    if (typeof value !== "string") {
      return false;
    }
    var option = new Option();
    option.style.color = value;
    return Boolean(option.style.color);
  }

  function mergeConfig() {
    var output = {};
    for (var sourceIndex = 0; sourceIndex < arguments.length; sourceIndex += 1) {
      var source = arguments[sourceIndex];
      if (!source || typeof source !== "object") {
        continue;
      }
      Object.keys(source).forEach(function assignKey(key) {
        var value = source[key];
        if (value !== undefined && value !== null && value !== "") {
          output[key] = value;
        }
      });
    }
    return output;
  }

  function onDomReady(callback) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }

  function init() {
    if (state.initialized) {
      return;
    }
    state.initialized = true;
    state.domReady = true;
    mountRoot();
    createTriggerButton();
    bindRootEvents();
  }

  function mountRoot() {
    var existingRoot = document.querySelector("." + ROOT_CLASS);
    if (existingRoot) {
      state.root = existingRoot;
      return;
    }
    var root = document.createElement("section");
    root.className = ROOT_CLASS + " linkget-position-" + config.position;
    root.setAttribute("data-linkget", "root");
    root.setAttribute("aria-live", "polite");
    root.style.setProperty("--linkget-accent", config.buttonColor);
    document.body.appendChild(root);
    state.root = root;
  }

  function createTriggerButton() {
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = NAMESPACE + "-trigger";
    trigger.setAttribute("aria-label", "Открыть окно шаринга");
    trigger.setAttribute("data-linkget-action", "open");
    trigger.innerHTML = getTriggerIconSvg();
    state.root.appendChild(trigger);
    state.trigger = trigger;
  }

  function getTriggerIconSvg() {
    if (config.buttonIcon === "message") {
      return (
        '<svg class="linkget-icon-chat" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
        '<path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5.5L10 21.5a1 1 0 0 1-1.7-.7V17H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1.5 4.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6.5 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"></path>' +
        "</svg>"
      );
    }
    return (
      '<svg class="linkget-icon-chat" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M12 2C6.48 2 2 6.02 2 10.98c0 2.68 1.34 5.09 3.48 6.73L4.36 22l4.73-2.6c.92.26 1.9.4 2.91.4 5.52 0 10-4.02 10-8.98C22 6.02 17.52 2 12 2zm0 14.9c-.88 0-1.73-.13-2.5-.38l-.73-.24-2.78 1.53.67-2.56-.63-.51C4.39 13.4 3.7 12.24 3.7 10.98 3.7 7.14 7.42 4.1 12 4.1s8.3 3.04 8.3 6.88-3.72 5.92-8.3 5.92z"></path>' +
      "</svg>"
    );
  }

  function ensureModalBuilt() {
    if (state.modalBuilt) {
      return;
    }

    var overlay = document.createElement("div");
    overlay.className = NAMESPACE + "-overlay";
    overlay.setAttribute("data-linkget-action", "overlay-close");
    overlay.setAttribute("aria-hidden", "true");

    var modal = document.createElement("aside");
    modal.className = NAMESPACE + "-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Поделиться страницей");

    var closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = NAMESPACE + "-close";
    closeButton.setAttribute("data-linkget-action", "close");
    closeButton.setAttribute("aria-label", "Закрыть окно");
    closeButton.innerHTML = buildCloseIconContent();

    var title = document.createElement("h2");
    title.className = NAMESPACE + "-title";
    title.textContent = config.title;

    var subtitle = document.createElement("p");
    subtitle.className = NAMESPACE + "-subtitle";
    subtitle.textContent = config.shareText;

    var qrWrap = document.createElement("div");
    qrWrap.className = NAMESPACE + "-qr-wrap";
    var qrHolder = document.createElement("div");
    qrHolder.className = NAMESPACE + "-qr-fallback";
    qrHolder.setAttribute("data-linkget-qr", "placeholder");
    qrHolder.textContent = "Генерация QR-кода...";
    qrWrap.appendChild(qrHolder);

    var messengers = buildMessengerLinks();
    var callBlock = buildCallBlock();

    modal.appendChild(closeButton);
    modal.appendChild(title);
    modal.appendChild(subtitle);
    modal.appendChild(qrWrap);
    modal.appendChild(messengers);
    if (callBlock) {
      modal.appendChild(callBlock);
    }

    state.root.appendChild(overlay);
    state.root.appendChild(modal);

    state.overlay = overlay;
    state.modal = modal;
    state.qrContainer = qrWrap;
    state.modalBuilt = true;
  }

  function buildCloseIconContent() {
    if (config.closeIcon) {
      return (
        '<img class="linkget-close-icon" src="' +
        sanitizeAttribute(config.closeIcon) +
        '" alt="" aria-hidden="true" referrerpolicy="no-referrer">'
      );
    }
    return (
      '<svg class="linkget-close-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
      '<path d="M4.2 4.2a1 1 0 0 1 1.4 0L10 8.6l4.4-4.4a1 1 0 0 1 1.4 1.4L11.4 10l4.4 4.4a1 1 0 1 1-1.4 1.4L10 11.4l-4.4 4.4a1 1 0 1 1-1.4-1.4L8.6 10 4.2 5.6a1 1 0 0 1 0-1.4z"></path>' +
      "</svg>"
    );
  }

  function buildMessengerLinks() {
    var url = getCurrentPageUrl();
    var text = config.shareText + " " + url;
    var list = document.createElement("div");
    list.className = NAMESPACE + "-messengers";
    list.setAttribute("aria-label", "Выберите мессенджер для шаринга");

    var messengerDefinitions = [
      {
        key: "telegram",
        enabled: config.telegramEnabled,
        href: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(config.shareText),
        icon: config.telegramIcon,
        label: "Telegram"
      },
      {
        key: "whatsapp",
        enabled: config.whatsappEnabled,
        href: "https://wa.me/?text=" + encodeURIComponent(text),
        icon: config.whatsappIcon,
        label: "WhatsApp"
      },
      {
        key: "viber",
        enabled: config.viberEnabled,
        href: "viber://forward?text=" + encodeURIComponent(text),
        icon: config.viberIcon,
        label: "Viber"
      },
      {
        key: "max",
        enabled: config.maxEnabled,
        href: buildMaxShareUrl(url, config.shareText),
        icon: config.maxIcon,
        label: "Max"
      }
    ];

    messengerDefinitions.forEach(function appendItem(definition) {
      if (!definition.enabled) {
        return;
      }
      var safeHref = isSafeShareUrl(definition.href) ? definition.href : "javascript:void(0)";
      var anchor = document.createElement("a");
      anchor.className = NAMESPACE + "-messenger-link";
      anchor.setAttribute("href", safeHref);
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer nofollow");
      anchor.setAttribute("aria-label", "Поделиться через " + definition.label);
      anchor.setAttribute("data-linkget-action", "messenger");
      anchor.setAttribute("data-linkget-messenger", definition.key);

      var icon = document.createElement("img");
      icon.className = NAMESPACE + "-messenger-icon";
      icon.src = definition.icon;
      icon.alt = definition.label;
      icon.loading = "lazy";
      icon.referrerPolicy = "no-referrer";
      icon.onerror = function handleIconError() {
        icon.style.display = "none";
        anchor.textContent = definition.label.slice(0, 1);
        anchor.setAttribute("title", definition.label);
      };

      anchor.appendChild(icon);
      list.appendChild(anchor);
    });

    if (!list.childElementCount) {
      var emptyState = document.createElement("p");
      emptyState.className = NAMESPACE + "-subtitle";
      emptyState.textContent = "Мессенджеры отключены в конфигурации";
      list.appendChild(emptyState);
    }

    return list;
  }

  function buildCallBlock() {
    if (!config.phoneNumber) {
      return null;
    }
    var call = document.createElement("div");
    call.className = NAMESPACE + "-call";

    var label = document.createElement("p");
    label.className = NAMESPACE + "-call-label";
    label.textContent = config.phoneLabel;

    var phoneLink = document.createElement("a");
    phoneLink.className = NAMESPACE + "-phone-link";
    phoneLink.textContent = config.phoneNumber;
    phoneLink.setAttribute("href", "tel:" + config.phoneNumber.replace(/[^\d+]/g, ""));
    phoneLink.setAttribute("aria-label", "Позвонить " + config.phoneNumber);
    phoneLink.setAttribute("data-linkget-action", "phone");

    call.appendChild(label);
    call.appendChild(phoneLink);
    return call;
  }

  function buildMaxShareUrl(url, title) {
    var template = config.maxShareUrlTemplate;
    return template.replace("{url}", encodeURIComponent(url)).replace("{text}", encodeURIComponent(title));
  }

  function sanitizeAttribute(value) {
    return String(value).replace(/"/g, "&quot;");
  }

  function bindRootEvents() {
    if (!state.root) {
      return;
    }
    state.root.addEventListener("click", handleRootClick);
    state.root.addEventListener("keydown", handleRootKeydown);
    state.root.addEventListener("mouseenter", handleTriggerPrefetch, { passive: true });
  }

  function handleTriggerPrefetch(event) {
    var target = event.target;
    if (!target || !target.classList || !target.classList.contains("linkget-trigger")) {
      return;
    }
    if (config.lazyLoad) {
      ensureModalBuilt();
      renderQr();
    }
  }

  function handleRootClick(event) {
    var actionNode = event.target && event.target.closest ? event.target.closest("[data-linkget-action]") : null;
    if (!actionNode) {
      return;
    }
    var action = actionNode.getAttribute("data-linkget-action");
    if (action === "open") {
      openModal();
      return;
    }
    if (action === "close" || action === "overlay-close") {
      closeModal();
      return;
    }
    if (action === "messenger") {
      var messengerName = actionNode.getAttribute("data-linkget-messenger") || "unknown";
      sendAnalytics("click_messenger_" + messengerName);
      return;
    }
    if (action === "phone") {
      sendAnalytics("click_phone");
    }
  }

  function handleRootKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    var actionNode = event.target && event.target.closest ? event.target.closest("[data-linkget-action='open']") : null;
    if (!actionNode) {
      return;
    }
    event.preventDefault();
    openModal();
  }

  function bindEscClose() {
    if (state.escHandlerBound) {
      return;
    }
    state.escHandlerBound = function onEscKey(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", state.escHandlerBound);
  }

  function unbindEscClose() {
    if (!state.escHandlerBound) {
      return;
    }
    document.removeEventListener("keydown", state.escHandlerBound);
    state.escHandlerBound = null;
  }

  function preventBodyScroll() {
    if (document.body.classList.contains(LOCK_CLASS)) {
      return;
    }
    state.previousBodyOverflow = document.body.style.overflow || "";
    document.body.classList.add(LOCK_CLASS);
    document.body.style.overflow = "hidden";
  }

  function restoreBodyScroll() {
    document.body.classList.remove(LOCK_CLASS);
    document.body.style.overflow = state.previousBodyOverflow;
  }

  function renderQr() {
    if (!state.qrContainer) {
      return;
    }
    var url = getCurrentPageUrl();
    var size = config.qrSize;
    state.qrContainer.innerHTML = "";
    var fallback = createQrFallback(url);

    if (window.QRCode && typeof window.QRCode === "function") {
      try {
        var qrNode = document.createElement("div");
        qrNode.className = NAMESPACE + "-qr";
        state.qrContainer.appendChild(qrNode);
        new window.QRCode(qrNode, {
          text: url,
          width: size,
          height: size
        });
        return;
      } catch (error) {
        state.qrContainer.innerHTML = "";
      }
    }

    var image = document.createElement("img");
    image.className = NAMESPACE + "-qr";
    image.width = size;
    image.height = size;
    image.loading = "lazy";
    image.alt = "QR-код текущей страницы";
    image.referrerPolicy = "no-referrer";
    image.src = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encodeURIComponent(url);
    image.onerror = function onQrLoadError() {
      state.qrContainer.innerHTML = "";
      state.qrContainer.appendChild(fallback);
    };
    state.qrContainer.appendChild(image);
  }

  function createQrFallback(url) {
    var fallback = document.createElement("div");
    fallback.className = NAMESPACE + "-qr-fallback";
    fallback.textContent = "Не удалось загрузить QR-код. Ссылка: " + url;
    return fallback;
  }

  function getCurrentPageUrl() {
    var rawUrl = window.location.href;
    try {
      var parsedUrl = new URL(rawUrl);
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return window.location.origin;
      }
      return parsedUrl.href;
    } catch (error) {
      return window.location.origin || "";
    }
  }

  function isSafeShareUrl(url) {
    if (!url || typeof url !== "string") {
      return false;
    }
    try {
      var parsed = new URL(url, window.location.href);
      var allowedProtocols = ["https:", "http:", "viber:"];
      return allowedProtocols.indexOf(parsed.protocol) >= 0;
    } catch (error) {
      return false;
    }
  }

  function openModal() {
    ensureModalBuilt();
    if (!state.modal || !state.overlay) {
      return;
    }
    renderQr();
    state.isOpen = true;
    state.overlay.classList.add("is-open");
    state.modal.classList.add("is-open");
    bindEscClose();
    preventBodyScroll();
    sendAnalytics("open_modal");
  }

  function closeModal() {
    if (!state.modal || !state.overlay) {
      return;
    }
    state.isOpen = false;
    state.overlay.classList.remove("is-open");
    state.modal.classList.remove("is-open");
    unbindEscClose();
    restoreBodyScroll();
    sendAnalytics("close_modal");
  }

  function sendAnalytics(actionName) {
    if (!config.analytics) {
      return;
    }
    var payload = {
      namespace: NAMESPACE,
      action: actionName,
      page: getCurrentPageUrl(),
      timestamp: Date.now()
    };
    window.dispatchEvent(new CustomEvent("linkget:action", { detail: payload }));

    if (!config.analyticsCallback) {
      return;
    }
    var callback = window[config.analyticsCallback];
    if (typeof callback === "function") {
      callback(payload);
    }
  }

  function scheduleInit() {
    var boot = function bootWidget() {
      if (config.lazyLoad && "requestIdleCallback" in window) {
        window.requestIdleCallback(init, { timeout: 1500 });
        return;
      }
      window.setTimeout(init, 0);
    };
    onDomReady(boot);
  }

  scheduleInit();

  window.LinkgetWidget = {
    initialized: true,
    openModal: openModal,
    closeModal: closeModal,
    getCurrentPageUrl: getCurrentPageUrl,
    config: config
  };
})(window, document);
