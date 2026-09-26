import { transport } from "./transport.js";
import { stateManager } from "./state.js";
import { MouseApi } from "./mouse-api.js";
import { MouseSvgVisualizer } from "./ui-mouse-svg.js";
import { ButtonMappingUI } from "./ui-buttons.js";
import { DpiUI } from "./ui-dpi.js";
import { SensorUI } from "./ui-sensor.js";
import { DongleUI } from "./ui-dongle.js";
import { MacroUI } from "./ui-macros.js";
import { ShortcutsUI } from "./ui-shortcuts.js";
import { FirmwareUI } from "./ui-firmware.js";
import {
  codeToPollingRate,
  getActiveSensor,
  getActiveSensorId,
  SENSOR_IDS,
} from "./protocol.js";
import {
  t,
  getLocale,
  setLocale,
  initI18n,
  onLocaleChange,
  applyDomTranslations,
} from "./i18n.js";
import { icon } from "./icons.js";

const TOAST_ICONS = {
  success: icon("checkCircle", 16, "var(--success)", "toast-icon"),
  error: icon("alertCircle", 16, "var(--danger)", "toast-icon"),
  warning: icon("alertTriangle", 16, "var(--warning)", "toast-icon"),
  info: icon("info", 16, "var(--info)", "toast-icon"),
};

class App {
  constructor() {
    this.isWorking = false;
    this.isReading = false;
    this.lastOverlay = null;
    initI18n();
    this.initDOMElements();
    this.initTheme();
    this.initComponents();
    this.setupEventListeners();

    this.onDisconnected();
    this.initConnection();
  }

  initDOMElements() {
    this.statusDot = document.getElementById("statusDot");
    this.statusText = document.getElementById("statusText");
    this.deviceBadge = document.getElementById("deviceBadge");
    this.batteryBadge = document.getElementById("batteryBadge");
    this.batteryPercent = document.getElementById("batteryPercent");
    this.batteryVoltage = document.getElementById("batteryVoltage");
    this.chargingIcon = document.getElementById("chargingIcon");
    this.versionBadge = document.getElementById("versionBadge");

    this.appWrapper = document.getElementById("appWrapper");
    this.disconnectOverlay = document.getElementById("disconnectOverlay");
    this.disconnectCard = this.disconnectOverlay?.querySelector(
      ".disconnect-card",
    );
    this.disconnectTitle = document.getElementById("disconnectTitle");
    this.disconnectMsg = document.getElementById("disconnectMsg");
    this.notifyContainer = document.getElementById("notifyContainer");

    this.connectHeaderBtn = document.getElementById("connectHeaderBtn");
    this.retryBtn = document.getElementById("retryBtn");
    this.readBtn = document.getElementById("readBtn");
    this.commitBtn = document.getElementById("commitBtn");
    this.resetBtn = document.getElementById("resetBtn");
    this.exportBtn = document.getElementById("exportBtn");
    this.importBtn = document.getElementById("importBtn");
    this.importFileInput = document.getElementById("importFileInput");
    this.themeToggleBtn = document.getElementById("themeToggleBtn");
    this.themeIconSun = document.getElementById("themeIconSun");
    this.themeIconMoon = document.getElementById("themeIconMoon");

    this.navTabs = document.querySelectorAll(".nav-tab");
    this.tabPanes = document.querySelectorAll(".tab-pane");
    this.profileBtns = document.querySelectorAll(".profile-btn");
  }

  initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) {
      this.setTheme(saved, false);
    } else {
      const systemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = systemDark ? "dark" : "light";
      this.setTheme(theme, false);
    }

    if (window.matchMedia) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", (e) => {
          if (!localStorage.getItem("theme")) {
            this.setTheme(e.matches ? "dark" : "light", false);
          }
        });
    }
  }

  setTheme(theme, save = true) {
    document.documentElement.setAttribute("data-theme", theme);
    if (save) {
      localStorage.setItem("theme", theme);
    }
    if (this.themeIconSun && this.themeIconMoon) {
      if (theme === "light") {
        this.themeIconSun.style.display = "none";
        this.themeIconMoon.style.display = "block";
      } else {
        this.themeIconSun.style.display = "block";
        this.themeIconMoon.style.display = "none";
      }
    }
  }

  toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    this.setTheme(next, true);
  }

  initComponents() {
    this.mouseSvg = new MouseSvgVisualizer(
      "mouseVisualizerWrap",
      (btnIndex) => {
        this.buttonsUI.renderList();
      },
    );

    this.buttonsUI = new ButtonMappingUI(
      "buttonsListGrid",
      "bindModalBackdrop",
      (btnIndex) => {
        this.mouseSvg.selectButton(btnIndex);
        this.mouseSvg.render();
      },
    );

    this.dpiUI = new DpiUI("dpiPane");
    this.sensorUI = new SensorUI(
      "sensorPane",
      "calibrationModalBackdrop",
      (msg, type) => {
        this.notify(msg, type);
      },
    );
    this.dongleUI = new DongleUI(
      "donglePane",
      "pairingModalBackdrop",
      (msg, type) => {
        this.notify(msg, type);
      },
    );
    this.shortcutsUI = new ShortcutsUI("shortcutsPane");
    this.macroUI = new MacroUI("macroPane", (msg, type) => {
      this.notify(msg, type);
    });
    this.firmwareUI = new FirmwareUI(
      "firmwarePane",
      "firmwareModalBackdrop",
      (msg, type) => {
        this.notify(msg, type);
      },
    );

    this.mouseSvg.render();
    this.buttonsUI.renderList();

    stateManager.subscribe((state, hasChanges) => {
      this.syncStateToUI(state, hasChanges);
    });
  }

  setupEventListeners() {
    if (this.connectHeaderBtn) {
      this.connectHeaderBtn.addEventListener("click", () =>
        this.connectDevice(true),
      );
    }
    if (this.retryBtn) {
      this.retryBtn.addEventListener("click", () => this.connectDevice(true));
    }

    if (this.readBtn) {
      this.readBtn.addEventListener("click", () => this.handleRead());
    }
    if (this.commitBtn) {
      this.commitBtn.addEventListener("click", () => this.handleCommit());
    }
    if (this.resetBtn) {
      this.resetBtn.addEventListener("click", () => this.handleFactoryReset());
    }
    if (this.exportBtn) {
      this.exportBtn.addEventListener("click", () => this.handleExport());
    }
    if (this.importBtn && this.importFileInput) {
      this.importBtn.addEventListener("click", () =>
        this.importFileInput.click(),
      );
      this.importFileInput.addEventListener("change", (e) =>
        this.handleImport(e),
      );
    }

    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener("click", () => this.toggleTheme());
    }

    const langSelect = document.getElementById("langSelect");
    if (langSelect) {
      langSelect.value = getLocale();
      langSelect.addEventListener("change", () => setLocale(langSelect.value));
    }

    onLocaleChange(() => {
      applyDomTranslations();
      // 静态 HTML 之外，遮罩与状态文字由 JS 管理，需要重放当前状态
      if (this.lastOverlay) {
        this.showOverlay(
          this.lastOverlay.title,
          this.lastOverlay.msg,
          this.lastOverlay.opts,
        );
      }
      stateManager.notify();
      this.syncStateToUI(stateManager.current, stateManager.hasChanges);
    });

    this.navTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        this.switchTab(target);
      });
    });

    this.profileBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-profile"), 10);
        this.switchProfile(idx);
      });
    });

    window.addEventListener("beforeunload", (e) => {
      if (stateManager.hasChanges) {
        e.preventDefault();
        e.returnValue =
          "You have uncommitted changes. Save them to mouse hardware with Commit before leaving.";
      }
    });

    transport.onConnect(() => {
      if (window.firmwareUpdateBusy) return;
      const info = transport.getDeviceInfo();
      if (!info || info.mode !== "Wired USB-C") {
        this.connectDevice(false);
      }
    });
    transport.onDisconnect(() => {
      if (window.firmwareUpdateBusy) return;
      this.onDisconnected();
    });
    transport.onStatusChange((event) => this.handleUnsolicitedStatus(event));
  }

  switchTab(tabId) {
    stateManager.activeTab = tabId;
    this.navTabs.forEach((t) => {
      t.classList.toggle("active", t.getAttribute("data-tab") === tabId);
    });
    this.tabPanes.forEach((p) => {
      p.classList.toggle("active", p.id === `${tabId}Pane`);
    });

    if (tabId === "buttons") {
      this.mouseSvg.render();
      this.buttonsUI.renderList();
    }
  }

  async switchProfile(profileIndex) {
    if (this.isWorking) return;
    this.profileBtns.forEach((b) => {
      b.classList.toggle(
        "active",
        parseInt(b.getAttribute("data-profile"), 10) === profileIndex,
      );
    });

    stateManager.current.activeProfileIndex = profileIndex;
    stateManager.initialCommitted.activeProfileIndex = profileIndex;
    stateManager.notify();

    if (transport.isConnected()) {
      try {
        this.suppressAutoReload();
        await MouseApi.reloadSensorConfig(profileIndex);
        this.notify(
          t("toast.profileApplied", { n: profileIndex + 1 }),
          "info",
        );
      } catch (_) {}
    }
  }

  async initConnection() {
    if (!transport.isSupported()) {
      this.notify(t("toast.notSupported"), "error", 10000);
      if (this.disconnectMsg) {
        this.disconnectMsg.textContent = t("toast.notSupportedOverlay");
      }
      if (this.retryBtn) this.retryBtn.disabled = true;
      return;
    }

    this.isWorking = true;
    this.showOverlay(
      t("overlay.connectingTitle"),
      t("overlay.connectingMsg"),
      { busy: true },
    );

    try {
      const ok = await transport.connect(false);
      if (ok) {
        await this.handleConnectSuccess();
      } else {
        this.onDisconnected();
      }
    } catch (_) {
      this.onDisconnected();
    } finally {
      this.isWorking = false;
      this.syncButtonStates();
    }
  }

  suppressAutoReload() {
    this.reloadPending = true;
    setTimeout(() => {
      this.reloadPending = false;
    }, 600);
  }

  async connectDevice(interactive = false) {
    if (this.isWorking) return;
    this.isWorking = true;
    this.statusDot.className = "status-dot warning";
    this.statusText.textContent = t("header.connecting");
    this.showOverlay(
      t("overlay.connectingTitle"),
      interactive ? t("overlay.pickMsg") : t("overlay.connectingMsg"),
      { busy: true },
    );

    try {
      const ok = await transport.connect(interactive);
      if (ok) {
        await this.handleConnectSuccess();
      } else {
        this.onDisconnected();
      }
    } catch (err) {
      this.onDisconnected();
      this.showOverlay(
        t("overlay.errorTitle"),
        t("toast.connectFail", { err: err.message }),
        { error: true },
      );
    } finally {
      this.isWorking = false;
      this.syncButtonStates();
    }
  }

  // Post-read identity: the sensor profile (auto-detected or manual) plus
  // the dongle's rate capability resolve to exactly one model, even though
  // the 1K PIDs are shared between the G49 and the M916 Pro 1K.
  resolvedModelName() {
    if (getActiveSensorId() === SENSOR_IDS.PAW3311) return "Redragon G49";
    if ((transport.getDeviceInfo()?.maxRate ?? 1000) >= 4000) {
      return "Redragon M916 Pro 4K";
    }
    return "Redragon M916 Pro 1K";
  }

  async handleConnectSuccess() {
    this.statusDot.className = "status-dot warning";
    this.statusText.textContent = t("header.readingDevice");
    this.showOverlay(
      t("overlay.readingTitle"),
      t("overlay.readingMsg"),
      { busy: true },
    );

    // Reject non-mouse devices that pass the WebHID usage-page filter
    // (e.g. Redragon keyboards) before reading any configuration. The error
    // is shown inside the overlay itself so the fuzzy backdrop can't hide it.
    try {
      await MouseApi.verifySupportedMouse();
    } catch (_) {
      await transport.disconnect();
      this.onDisconnected();
      this.showOverlay(
        t("overlay.errorTitle"),
        t("toast.unsupportedDevice"),
        { error: true },
      );
      return;
    }

    try {
      await this.handleRead(true);
      this.onConnected();
      this.notify(
        t("toast.connected", { name: this.resolvedModelName() }),
        "success",
      );
      this.suppressAutoReload();
      try {
        await MouseApi.reloadSensorConfig(
          stateManager.current.activeProfileIndex || 0,
        );
      } catch (_) {}
    } catch (err) {
      this.onConnected();
      this.notify(
        t("toast.readFailPartial", { err: err.message }),
        "warning",
      );
    }
    this.startBatteryPoll();
  }

  startBatteryPoll() {
    this.stopBatteryPoll();
    this.batteryPollTimer = setInterval(async () => {
      if (!transport.isConnected()) return;
      const battery = await MouseApi.readBattery();
      if (battery) this.applyBattery(battery);
    }, 30000);
  }

  stopBatteryPoll() {
    if (this.batteryPollTimer) {
      clearInterval(this.batteryPollTimer);
      this.batteryPollTimer = null;
    }
  }

  applyBattery(battery) {
    const prev = stateManager.current.battery;
    const changed =
      !prev ||
      prev.percent !== battery.percent ||
      prev.mv !== battery.mv ||
      prev.isCharging !== battery.isCharging;
    if (changed) stateManager.updateState({ battery });
  }

  onConnected() {
    this.hideOverlay();
    this.statusDot.className = "status-dot";
    this.statusText.textContent = t("header.connected");
    this.connectHeaderBtn.style.display = "none";
    this.syncButtonStates();
    this.syncStateToUI(stateManager.current, stateManager.hasChanges);
  }

  showOverlay(title, message, { busy = false, error = false } = {}) {
    this.lastOverlay = { title, message, opts: { busy, error } };
    if (this.disconnectTitle) this.disconnectTitle.textContent = title;
    if (this.disconnectMsg) this.disconnectMsg.textContent = message;
    this.disconnectCard?.classList.toggle("error", error);
    if (this.disconnectOverlay) {
      this.disconnectOverlay.classList.add("visible");
    }
    this.appWrapper.classList.add("offline");
    if (this.retryBtn) this.retryBtn.disabled = busy;
  }

  hideOverlay() {
    this.lastOverlay = null;
    this.disconnectCard?.classList.remove("error");
    if (this.disconnectOverlay) {
      this.disconnectOverlay.classList.remove("visible");
    }
    this.appWrapper.classList.remove("offline");
    if (this.retryBtn) this.retryBtn.disabled = false;
  }

  onDisconnected() {
    this.stopBatteryPoll();
    this.statusDot.className = "status-dot error";
    this.statusText.textContent = t("header.disconnect");
    this.deviceBadge.textContent = "-";
    this.deviceBadge.style.display = "none";
    this.versionBadge.style.display = "none";
    this.batteryBadge.style.display = "none";
    this.connectHeaderBtn.style.display = "";
    this.showOverlay(t("overlay.title"), t("overlay.msg"));
    this.syncButtonStates();
  }

  syncButtonStates() {
    const connected = transport.isConnected();
    const canInteract = connected && !this.isWorking;

    if (this.readBtn) this.readBtn.disabled = !canInteract;
    if (this.commitBtn)
      this.commitBtn.disabled = !canInteract || !stateManager.hasChanges;
    if (this.resetBtn) this.resetBtn.disabled = !canInteract;
    if (this.exportBtn) this.exportBtn.disabled = !canInteract;
    if (this.importBtn) this.importBtn.disabled = !canInteract;
  }

  syncStateToUI(state, hasChanges) {
    if (!transport.isConnected()) {
      this.deviceBadge.style.display = "none";
      this.versionBadge.style.display = "none";
      this.batteryBadge.style.display = "none";
      this.syncButtonStates();
      return;
    }

    const devInfo = transport.getDeviceInfo();
    if (devInfo) {
      this.deviceBadge.style.display = "inline-flex";
      this.deviceBadge.textContent = `${this.resolvedModelName()} · ${getActiveSensor().label} (${devInfo.mode})`;
    }

    if (state.version) {
      this.versionBadge.style.display = "inline-flex";
      this.versionBadge.textContent = `v${state.version}`;
    } else {
      this.versionBadge.style.display = "none";
    }

    this.batteryBadge.style.display = "inline-flex";
    const percent = state.battery ? state.battery.percent : null;
    this.batteryPercent.textContent =
      percent !== null && percent !== undefined ? `${percent}%` : "--%";
    if (this.batteryVoltage) {
      this.batteryVoltage.textContent =
        state.battery && state.battery.mv
          ? `(${(state.battery.mv / 1000).toFixed(2)}V)`
          : "";
    }
    const isCharging = !!(state.battery && state.battery.isCharging);
    this.chargingIcon.style.display = isCharging ? "inline" : "none";
    this.batteryBadge.classList.toggle("charging", isCharging);

    this.syncButtonStates();
  }

  async handleRead(silent = false) {
    if (!transport.isConnected()) return;
    this.isWorking = true;
    this.isReading = true;
    this.syncButtonStates();

    if (!silent)
      this.notify(t("toast.reading"), "info");

    try {
      const settings = await MouseApi.readAllSettings();
      stateManager.setCommittedState(settings);
      this.mouseSvg.render();
      this.buttonsUI.renderList();
      if (settings.sensorAutoSwitched || settings.sensorAutoSet) {
        this.notify(
          t("toast.sensorAutoSet", { sensor: getActiveSensor().label }),
          "info",
        );
      }
      if (!silent)
        this.notify(t("toast.readOk"), "success");
    } catch (err) {
      this.notify(t("toast.readFail", { err: err.message }), "error");
      throw err;
    } finally {
      this.isWorking = false;
      this.isReading = false;
      this.syncButtonStates();
    }
  }

  async handleCommit() {
    if (this.isWorking || !transport.isConnected()) return;
    this.isWorking = true;
    this.syncButtonStates();

    this.notify(t("toast.writing"), "info");

    try {
      const ini = stateManager.initialCommitted;
      await MouseApi.commitSettings(stateManager.current, {
        prevState: ini,
        prevMacros: ini.macros || [],
        prevSlots: (ini.macros || [])
          .map((m) => m.slot)
          .filter((s) => Number.isInteger(s) && s >= 0),
        prevShortcuts: ini.shortcuts || [],
      });
      stateManager.setCommittedState(stateManager.current);
      this.mouseSvg.render();
      this.buttonsUI.renderList();
      this.notify(t("toast.writeOk"), "success");
    } catch (err) {
      this.notify(t("toast.writeFail", { err: err.message }), "error");
    } finally {
      this.isWorking = false;
      this.syncButtonStates();
    }
  }

  async handleFactoryReset() {
    if (this.isWorking || !transport.isConnected()) return;
    if (
      !confirm(
        t("toast.factoryResetConfirm"),
      )
    ) {
      return;
    }

    this.isWorking = true;
    this.syncButtonStates();

    try {
      await MouseApi.factoryReset();
      this.notify(t("toast.factoryResetOk"), "success");
      await transport.sleep(500);
      await this.handleRead(true);
    } catch (err) {
      this.notify(t("toast.factoryResetFail", { err: err.message }), "error");
    } finally {
      this.isWorking = false;
      this.syncButtonStates();
    }
  }

  handleExport() {
    try {
      const json = stateManager.exportProfileJSON();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `M916_Pro_G49_UI_Profile_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.notify(t("toast.exportOk"), "success");
    } catch (err) {
      this.notify(t("toast.exportFail", { err: err.message }), "error");
    }
  }

  handleImport(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        stateManager.importProfileJSON(event.target.result);
        this.mouseSvg.render();
        this.buttonsUI.renderList();
        this.notify(
          t("toast.importOk"),
          "success",
        );
      } catch (err) {
        this.notify(t("toast.importFail", { err: err.message }), "error");
      }
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  async handleUnsolicitedStatus(event) {
    if (event.dpiChanged) {
      try {
        const chunk = await MouseApi.readFlashChunk(0x0004, 2);
        if (chunk && chunk.length >= 1) {
          const newStage = chunk[0];
          stateManager.current.currentDPIIndex = newStage;
          stateManager.initialCommitted.currentDPIIndex = newStage;
          stateManager.notify();
        }
      } catch (_) {}
    }
    if (event.rateChanged) {
      try {
        const chunk = await MouseApi.readFlashChunk(0x0000, 2);
        if (chunk && chunk.length >= 1) {
          const newRate = codeToPollingRate(chunk[0]);
          stateManager.current.reportRate = newRate;
          stateManager.initialCommitted.reportRate = newRate;
          stateManager.notify();
        }
      } catch (_) {}
    }
    if (event.batteryChanged) {
      const battery = await MouseApi.readBattery();
      if (battery) this.applyBattery(battery);
    }
    if (event.configChanged && !this.isReading && !this.isWorking) {
      this.handleRead(true);
    }
  }

  notify(message, type = "info", duration = 4000) {
    if (!this.notifyContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const iconSvg = TOAST_ICONS[type] || TOAST_ICONS.info;

    toast.innerHTML = `
      ${iconSvg}
      <span class="toast-msg">${message}</span>
      <span class="toast-close">${icon("x", 14)}</span>
    `;

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.remove();
    });

    this.notifyContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        setTimeout(() => toast.remove(), 250);
      }
    }, duration);
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new App();
  });
}
