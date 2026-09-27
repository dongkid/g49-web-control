import { stateManager } from "./state.js";
import { MouseApi } from "./mouse-api.js";
import { transport } from "./transport.js";
import { SENSORS, getActiveSensor, getActiveSensorId, setActiveSensorId } from "./sensors.js";
import { FIREPOWER_TIMER_OPTIONS } from "./protocol.js";
import { t } from "./i18n.js";
import { icon } from "./icons.js";

export class SensorUI {
  constructor(containerId, calibrationModalId, notifyFn) {
    this.container = document.getElementById(containerId);
    this.calibrationModal = document.getElementById(calibrationModalId);
    this.notify = notifyFn || console.log;
    this.calibrationTimer = null;
    this.init();
  }

  init() {
    stateManager.subscribe(() => {
      this.render();
    });
    this.render();
    this.initWizards();
  }

  initWizards() {
    const closeCalBtn = this.calibrationModal.querySelector(
      "#closeCalibrationModalBtn",
    );
    if (closeCalBtn) {
      closeCalBtn.addEventListener("click", () =>
        this.closeCalibrationWizard(),
      );
    }
  }

  render() {
    if (!this.container) return;

    const state = stateManager.current;
    const p = state.perf || {};
    const sensor = getActiveSensor();
    const caps = sensor.capabilities;

    const sensorOptions = Object.values(SENSORS)
      .map(
        (s) =>
          `<option value="${s.id}" ${s.id === getActiveSensorId() ? "selected" : ""}>
            ${s.label} — ${t(s.modelHintKey, null, s.modelHint)}
          </option>`,
      )
      .join("");

    const motionSyncRow = caps.motionSync
      ? `
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.motionSync")}</span>
                  <span class="setting-help">${t("sensor.motionSyncHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="motionSyncSwitch" ${p.motionSync ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>
      `
      : "";

    const modeSelectRow = caps.modeSelect
      ? `
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.modeSelect")}</span>
                  <span class="setting-help">${t("sensor.modeSelectHelp")}</span>
                </div>
                <select id="modeSelectSelect" style="width: 7rem;">
                  <option value="0" ${Number(p.modeSelect) === 0 ? "selected" : ""}>LP</option>
                  <option value="1" ${Number(p.modeSelect) === 1 ? "selected" : ""}>HP</option>
                </select>
              </div>
      `
      : "";

    const timerLabel = (seconds) =>
      seconds < 60
        ? t("time.sec", { n: seconds })
        : t("time.min", { n: seconds / 60 });
    const timerOptions = FIREPOWER_TIMER_OPTIONS.map(
      (o) =>
        `<option value="${o.value}" ${p.firepowerTimer === o.value ? "selected" : ""}>${timerLabel(o.seconds)}</option>`,
    ).join("");

    const firepowerRow = caps.firepower
      ? `
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.firepower")}</span>
                  <span class="setting-help">${t("sensor.firepowerHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="firepowerSwitch" ${p.firepower ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.firepowerTimer")}</span>
                  <span class="setting-help">${t("sensor.firepowerTimerHelp")}</span>
                </div>
                <select id="firepowerTimerSelect" style="width: 7rem;">${timerOptions}</select>
              </div>
      `
      : "";

    this.container.innerHTML = `
      <div class="grid-2col">
        <div class="col-stack">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">
                  ${icon("cpu", 18)}
                  ${t("sensor.trackingTitle", { sensor: sensor.label })}
                </span>
                <span class="card-desc">${t("sensor.desc")}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.variant")}</span>
                  <span class="setting-help">${t("sensor.variantHelp")}</span>
                </div>
                <select id="sensorSelect">${sensorOptions}</select>
              </div>
              ${motionSyncRow}
              ${modeSelectRow}
              ${firepowerRow}

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.ripple")}</span>
                  <span class="setting-help">${t("sensor.rippleHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="rippleControlSwitch" ${p.rippleControl ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.angleSnap")}</span>
                  <span class="setting-help">${t("sensor.angleSnapHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="linearCorrectionSwitch" ${p.linearCorrection ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          ${caps.surfaceCalibration
            ? `
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">
                  ${icon("crosshair", 18)}
                  ${t("sensor.calibTitle", { sensor: sensor.label })}
                </span>
                <span class="card-desc">${t("sensor.calibDesc")}</span>
              </div>
            </div>
            <div class="card-body">
              <p class="setting-help">${t("sensor.calibHelp")}</p>
              <button class="btn accent self-start" id="startCalibrationBtn">
                ${t("sensor.calibBtn")}
              </button>
            </div>
          </div>
          `
            : ""}
        </div>

        <div class="col-stack">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">
                  ${icon("radio", 18)}
                  ${t("sensor.rfTitle")}
                </span>
                <span class="card-desc">${t("sensor.rfDesc")}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.longRange")}</span>
                  <span class="setting-help">${t("sensor.longRangeHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="longRangeSwitch" ${state.longRangeMode ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">
                  ${icon("battery", 18)}
                  ${t("sensor.powerTitle")}
                </span>
                <span class="card-desc">${t("sensor.powerDesc")}</span>
              </div>
            </div>
            <div class="card-body">
              ${
                caps.powerSaving !== false
                  ? `
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.eco")}</span>
                  <span class="setting-help">${t("sensor.ecoHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="powerSavingSwitch" ${p.powerSaving ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>
              `
                  : ""
              }

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("sensor.deepSleep")}</span>
                  <span class="setting-help">${t("sensor.deepSleepHelp")}</span>
                </div>
                <label class="switch">
                  <input type="checkbox" id="sleepEnableSwitch" ${p.customSleepEnable !== false ? "checked" : ""}>
                  <span class="switch-slider"></span>
                </label>
              </div>

              <div id="sleepTimeWrap" style="${p.customSleepEnable !== false ? "" : "opacity: 0.4; pointer-events: none;"}">
                <div class="setting-row">
                  <div class="setting-info">
                    <span class="setting-label">${t("sensor.timeout")}</span>
                    <span class="setting-help">${t("sensor.timeoutHelp")}</span>
                  </div>
                  <div class="num-input-wrap">
                    <input type="number" id="sleepTimeNum" min="1" max="254" value="${Math.min(254, Math.max(1, p.sensorSleepTime || 2))}">
                    <span class="unit">min</span>
                  </div>
                </div>
                <input type="range" id="sleepTimeRange" min="1" max="254" value="${Math.min(254, Math.max(1, p.sensorSleepTime || 2))}">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const sensorSelect = this.container.querySelector("#sensorSelect");
    if (sensorSelect) {
      sensorSelect.addEventListener("change", () => {
        setActiveSensorId(sensorSelect.value);
        // Re-render every panel: DPI range and visible options depend on the
        // selected sensor's capabilities.
        stateManager.notify();
      });
    }

    const motionSync = this.container.querySelector("#motionSyncSwitch");
    if (motionSync) {
      motionSync.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.motionSync = motionSync.checked;
        });
      });
    }

    const rippleControl = this.container.querySelector("#rippleControlSwitch");
    if (rippleControl) {
      rippleControl.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.rippleControl = rippleControl.checked;
        });
      });
    }

    const linearCorrection = this.container.querySelector(
      "#linearCorrectionSwitch",
    );
    if (linearCorrection) {
      linearCorrection.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.linearCorrection = linearCorrection.checked;
        });
      });
    }

    const modeSelect = this.container.querySelector("#modeSelectSelect");
    if (modeSelect) {
      modeSelect.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.modeSelect = Number(modeSelect.value) === 1 ? 1 : 0;
        });
      });
    }

    const firepower = this.container.querySelector("#firepowerSwitch");
    if (firepower) {
      firepower.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.firepower = firepower.checked;
        });
      });
    }

    const firepowerTimer = this.container.querySelector(
      "#firepowerTimerSelect",
    );
    if (firepowerTimer) {
      firepowerTimer.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.firepowerTimer = Number(firepowerTimer.value);
        });
      });
    }

    const powerSaving = this.container.querySelector("#powerSavingSwitch");
    if (powerSaving) {
      powerSaving.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.powerSaving = powerSaving.checked;
        });
      });
    }

    const sleepEnable = this.container.querySelector("#sleepEnableSwitch");
    if (sleepEnable) {
      sleepEnable.addEventListener("change", () => {
        stateManager.updateState((draft) => {
          draft.perf.customSleepEnable = sleepEnable.checked;
        });
      });
    }

    const sleepNum = this.container.querySelector("#sleepTimeNum");
    const sleepRange = this.container.querySelector("#sleepTimeRange");
    if (sleepNum && sleepRange) {
      sleepNum.addEventListener("change", () => {
        const val = Math.max(
          1,
          Math.min(254, parseInt(sleepNum.value, 10) || 2),
        );
        sleepRange.value = val;
        stateManager.updateState((draft) => {
          draft.perf.sensorSleepTime = val;
        });
      });
      sleepRange.addEventListener("input", () => {
        const val = parseInt(sleepRange.value, 10);
        sleepNum.value = val;
        stateManager.updateState((draft) => {
          draft.perf.sensorSleepTime = val;
        });
      });
    }

    const longRange = this.container.querySelector("#longRangeSwitch");
    if (longRange) {
      longRange.addEventListener("change", () => {
        stateManager.updateState({ longRangeMode: longRange.checked });
      });
    }

    const startCalBtn = this.container.querySelector("#startCalibrationBtn");
    if (startCalBtn) {
      startCalBtn.addEventListener("click", () => this.openCalibrationWizard());
    }
  }

  async openCalibrationWizard() {
    if (!transport.isConnected()) {
      this.notify(t("sensor.calibMustConnect"), "error");
      return;
    }

    this.calibrationModal.classList.add("active");
    const statusEl = this.calibrationModal.querySelector(
      "#calibrationStatusBadge",
    );
    const progressEl = this.calibrationModal.querySelector(
      "#calibrationProgressFill",
    );

    if (statusEl) {
      statusEl.className = "wizard-status-badge in-progress";
      statusEl.textContent = t("sensor.calibStatus");
    }

    try {
      await MouseApi.enterSurfaceCalibration();
      let elapsed = 0;
      const duration = 5000;
      const interval = 100;

      this.calibrationTimer = setInterval(() => {
        elapsed += interval;
        const pct = Math.min(100, (elapsed / duration) * 100);
        if (progressEl) progressEl.style.width = `${pct}%`;

        if (elapsed >= duration) {
          clearInterval(this.calibrationTimer);
          if (statusEl) {
            statusEl.className = "wizard-status-badge success";
            statusEl.textContent = t("sensor.calibDone");
          }
          this.notify(
            t("sensor.calibApplied", { sensor: getActiveSensor().label }),
            "success",
          );
          setTimeout(() => this.closeCalibrationWizard(), 2000);
        }
      }, interval);
    } catch (err) {
      if (statusEl) {
        statusEl.className = "wizard-status-badge error";
        statusEl.textContent = t("sensor.calibFail", { err: err.message });
      }
    }
  }

  closeCalibrationWizard() {
    if (this.calibrationTimer) {
      clearInterval(this.calibrationTimer);
      this.calibrationTimer = null;
    }
    this.calibrationModal.classList.remove("active");
  }
}
