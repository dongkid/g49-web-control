import { stateManager } from "./state.js";
import { transport } from "./transport.js";
import { MouseApi } from "./mouse-api.js";
import { t } from "./i18n.js";
import { icon } from "./icons.js";
import {
  parseUpgradeFile,
  matchUpgradeFile,
  formatVersion,
  CXFILE_TYPE,
  CXFILE_TYPE_NAMES,
  FIRMWARE_MANIFEST_URL,
  fetchFirmwareManifest,
  FirmwareUpdater,
  MCU_NAMES,
} from "./firmware.js";

const BOOT_WAIT_MS = 5000;

export class FirmwareUI {
  constructor(containerId, modalId, notifyFn) {
    this.container = document.getElementById(containerId);
    this.modal = document.getElementById(modalId);
    this.notify = notifyFn || console.log;
    this.parsed = null;
    this.updater = null;
    this.updating = false;
    this.bootDevice = null;
    this.init();
  }

  init() {
    stateManager.subscribe(() => this.render());
    this.render();
    this.initModal();
  }

  initModal() {
    const closeBtn = this.modal.querySelector("#closeFirmwareModalBtn");
    const doneBtn = this.modal.querySelector("#firmwareCloseBtn");
    const abortBtn = this.modal.querySelector("#firmwareAbortBtn");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
    if (doneBtn) doneBtn.addEventListener("click", () => this.closeModal());
    if (abortBtn) abortBtn.addEventListener("click", () => this.abort());
  }

  // The 1K USB PIDs are shared between the G49 (MID 4) and the M916 Pro 1K
  // (MID 5), so firmware matching must prefer the board identity read live
  // from the device over the static PID table.
  getDeviceIdentity() {
    const base = transport.getDeviceInfo();
    if (!base) return null;
    const state = stateManager.current;
    return {
      ...base,
      cid: state.cid || base.cid,
      mid: state.mid || base.mid,
    };
  }

  render() {
    if (!this.container) return;
    const state = stateManager.current;
    const devInfo = this.getDeviceIdentity();
    const isWired = !!(devInfo && /wired/i.test(devInfo.mode || ""));
    const file = this.parsed;
    const fileVersion =
      file && file.ok ? formatVersion(file.header.version) : null;
    const match = file && devInfo ? matchUpgradeFile(file, devInfo) : null;

    const fileBadge = !file
      ? ""
      : file.ok
        ? match && match.ok
          ? `<span class="device-badge firmware-badge success">${icon("checkCircle", 12, "var(--success)")} ${t("fw.badgeValid")}</span>`
          : `<span class="device-badge firmware-badge warning">${icon("alertTriangle", 12, "var(--warning)")} ${t("fw.badgeMismatch")}</span>`
        : `<span class="device-badge firmware-badge danger">${icon("alertCircle", 12, "var(--danger)")} ${t("fw.badgeInvalid")}</span>`;

    const fileInfo = !file
      ? `<p class="setting-help">${t("fw.dropHelpHtml")}</p>`
      : `<div class="firmware-meta">
           <div><span>${t("fw.metaTarget")}</span><strong>${CXFILE_TYPE_NAMES[file.header.deviceType] ? t(`fw.type.${file.header.deviceType}`) : file.header.deviceType}</strong></div>
           <div><span>${t("fw.metaMcu")}</span><strong>${file.header.icName || t("common.na")}</strong></div>
           <div><span>${t("fw.metaCidMid")}</span><strong>${file.header.cid} / ${file.header.mid}</strong></div>
           <div><span>${t("fw.metaVersion")}</span><strong>v${fileVersion || "?"}</strong></div>
           <div><span>${t("fw.metaFwLen")}</span><strong>${file.header.fwLength.toLocaleString()} B</strong></div>
           <div><span>${t("fw.metaFileSize")}</span><strong>${file.bytes.length.toLocaleString()} B</strong></div>
         </div>`;

    const matchErrors =
      match && match.errors && match.errors.length
        ? match.errors.map((e) => `<li>${e}</li>`).join("")
        : "";
    const invalidErrors =
      file && !file.ok && file.errors.length
        ? file.errors.map((e) => `<li>${e}</li>`).join("")
        : "";

    const canFlash =
      !!file &&
      file.ok &&
      !!match &&
      match.ok &&
      isWired &&
      !!devInfo &&
      !this.updating;

    this.container.innerHTML = `
      <div class="grid-2col">
        <div class="col-stack">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">${icon("zap", 18)} ${t("fw.title")}</span>
                <span class="card-desc">${t("fw.desc")}</span>
              </div>
              <span class="device-badge">${
                isWired
                  ? t("fw.readyBadge")
                  : t("fw.wirelessBadge")
              }</span>
            </div>
            <div class="card-body">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("fw.mouseFw")}</span>
                  <span class="setting-help">${t("fw.mouseFwHelp")}</span>
                </div>
                <strong class="font-mono">v${state.version || "?.?"}</strong>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("fw.dongleFw")}</span>
                  <span class="setting-help">${t("fw.dongleFwHelp")}</span>
                </div>
                <strong class="font-mono">${t("common.na")}</strong>
              </div>
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">${t("fw.checkUpdates")}</span>
                  <span class="setting-help">${
                    FIRMWARE_MANIFEST_URL
                      ? t("fw.checkManifestHelp")
                      : t("fw.checkNoManifestHelp")
                  }</span>
                </div>
                <button class="btn sm" id="checkUpdatesBtn">${t("fw.checkBtn")}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-stack">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <span class="card-title">${icon("upload", 18)} ${t("fw.packageTitle")}</span>
                <span class="card-desc">${t("fw.packageDesc")}</span>
              </div>
              ${fileBadge}
            </div>
            <div class="card-body">
              <div class="firmware-drop" id="firmwareDrop">
                <input type="file" id="firmwareFileInput" accept=".bin,.hex" hidden />
                <div class="firmware-drop-inner">
                  ${icon("upload", 20, "var(--text-muted)")}
                  <span>${t("fw.dropTextHtml")}</span>
                  <button class="btn sm" id="pickFileBtn">${t("fw.browse")}</button>
                </div>
              </div>
              <div class="mt-md">${fileInfo}</div>
              ${
                matchErrors || invalidErrors
                  ? `<ul class="firmware-errors">${matchErrors || invalidErrors}</ul>`
                  : ""
              }
              <div class="firmware-actions">
                <button class="btn ghost" id="traceBtn" ${canFlash ? "" : "disabled"}>
                  ${icon("terminal", 13)} ${t("fw.trace")}
                </button>
                <button class="btn accent" id="flashBtn" ${canFlash ? "" : "disabled"}>
                  ${icon("zap", 13)} ${t("fw.start")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const input = this.container.querySelector("#firmwareFileInput");
    const pick = this.container.querySelector("#pickFileBtn");
    if (input && pick) {
      pick.addEventListener("click", () => input.click());
      input.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) this.loadFile(file);
        e.target.value = "";
      });
    }

    const drop = this.container.querySelector("#firmwareDrop");
    if (drop && input) {
      drop.addEventListener("click", (e) => {
        if (e.target.tagName !== "BUTTON") input.click();
      });
      drop.addEventListener("dragover", (e) => {
        e.preventDefault();
        drop.classList.add("dragging");
      });
      drop.addEventListener("dragleave", () =>
        drop.classList.remove("dragging"),
      );
      drop.addEventListener("drop", (e) => {
        e.preventDefault();
        drop.classList.remove("dragging");
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) this.loadFile(file);
      });
    }

    const checkBtn = this.container.querySelector("#checkUpdatesBtn");
    if (checkBtn) checkBtn.addEventListener("click", () => this.checkUpdates());

    const traceBtn = this.container.querySelector("#traceBtn");
    if (traceBtn)
      traceBtn.addEventListener("click", () => this.start(false, true));

    const flashBtn = this.container.querySelector("#flashBtn");
    if (flashBtn)
      flashBtn.addEventListener("click", () => this.start(true, false));
  }

  async loadFile(file) {
    const buf = new Uint8Array(await file.arrayBuffer());
    this.parsed = parseUpgradeFile(buf);
    this.render();
    if (this.parsed.ok) {
      this.notify(
        `Loaded ${file.name}, version ${formatVersion(this.parsed.header.version)} for ${CXFILE_TYPE_NAMES[this.parsed.header.deviceType]}`,
        this.parsed.ok ? "info" : "error",
      );
    } else {
      this.notify(
        `Invalid firmware package: ${this.parsed.errors[0]}`,
        "error",
      );
    }
  }

  async checkUpdates() {
    try {
      const list = await fetchFirmwareManifest();
      if (!list) {
        this.notify(t("fw.manifestNone"), "warning");
        return;
      }
      const devInfo = this.getDeviceIdentity();
      const matches = list.filter(
        (item) =>
          devInfo &&
          item.type === CXFILE_TYPE.Mouse &&
          String(item.icName || "").toUpperCase() === MCU_NAMES.mouse,
      );
      if (matches.length) {
        this.notify(
          t("fw.available", { v: formatVersion(matches[0].version) }),
          "info",
        );
      } else {
        this.notify(t("fw.noNewer"), "success");
      }
    } catch (err) {
      this.notify(t("fw.checkFail", { err: err.message }), "error");
    }
  }

  openModal() {
    this.modal.classList.add("active");
    const fill = this.modal.querySelector("#firmwareProgressFill");
    const badge = this.modal.querySelector("#firmwareStatusBadge");
    const logEl = this.modal.querySelector("#firmwareLog");
    if (fill) fill.style.width = "0%";
    if (badge) {
      badge.className = "wizard-status-badge in-progress";
      badge.textContent = "Starting...";
    }
    if (logEl) logEl.innerHTML = "";
  }

  closeModal() {
    this.modal.classList.remove("active");
  }

  appendLog(line) {
    const logEl = this.modal.querySelector("#firmwareLog");
    if (!logEl) return;
    const div = document.createElement("div");
    div.textContent = line;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  setProgress(pct) {
    const fill = this.modal.querySelector("#firmwareProgressFill");
    const badge = this.modal.querySelector("#firmwareStatusBadge");
    if (fill) fill.style.width = `${Math.min(100, pct)}%`;
    if (badge) badge.textContent = `Flashing... ${Math.min(100, pct)}%`;
  }

  setStatus(text, kind = "in-progress") {
    const badge = this.modal.querySelector("#firmwareStatusBadge");
    if (!badge) return;
    badge.className = `wizard-status-badge ${kind}`;
    badge.textContent = text;
  }

  showBootPicker() {
    const btn = this.modal.querySelector("#firmwarePickBootBtn");
    const tip = this.modal.querySelector("#firmwarePickBootTip");
    if (btn) btn.style.display = "";
    if (tip) tip.style.display = "flex";
  }

  hideBootPicker() {
    const btn = this.modal.querySelector("#firmwarePickBootBtn");
    const tip = this.modal.querySelector("#firmwarePickBootTip");
    if (btn) btn.style.display = "none";
    if (tip) tip.style.display = "none";
  }

  async start(isReal, traceOnly) {
    const file = this.parsed;
    if (!file || !file.ok) {
      this.notify("Load a valid .bin upgrade package first", "error");
      return;
    }
    const devInfo = this.getDeviceIdentity();
    const match = matchUpgradeFile(file, devInfo);
    if (!match.ok) {
      this.notify(match.errors[0], "error");
      return;
    }

    if (isReal) {
      const ok = window.confirm(t("fw.confirm"));
      if (!ok) return;
    }

    window.firmwareUpdateBusy = true;
    this.updating = true;
    this.bootDevice = null;
    this.updater = new FirmwareUpdater({
      onLog: (line) => this.appendLog(line),
      onProgress: (pct) => this.setProgress(pct),
    });
    this.openModal();

    try {
      if (traceOnly) {
        this.setStatus(t("fw.statusTrace"));
        const result = await this.updater.flash(file, { traceOnly: true });
        this.setStatus(t("fw.traceDone", { n: result.frames }), "success");
        this.notify(t("fw.dryRunToast"), "success");
        return;
      }

      this.setStatus(t("fw.requesting"));
      await this.updater.enterUpdateMode();

      this.setStatus(t("fw.waitingBoot"));
      await new Promise((r) => setTimeout(r, 1200));
      this.bootDevice = await this.updater.waitForBootDevice({
        timeoutMs: BOOT_WAIT_MS,
      });

      if (!this.bootDevice) {
        this.setStatus(t("fw.bootNotFound"));
        this.showBootPicker();
        const pickBtn = this.modal.querySelector("#firmwarePickBootBtn");
        if (pickBtn) {
          pickBtn.addEventListener(
            "click",
            () => this.connectBootViaPicker(file),
            { once: true },
          );
        }
        return;
      }

      await this.runUpdate(file);
    } catch (err) {
      this.fail(err);
    } finally {
      window.firmwareUpdateBusy = false;
      this.updating = false;
    }
  }

  async connectBootViaPicker(file) {
    try {
      this.bootDevice = await this.updater.requestBootDevicePicker();
      if (this.bootDevice) this.hideBootPicker();
      await this.runUpdate(file);
    } catch (err) {
      this.fail(err);
    } finally {
      window.firmwareUpdateBusy = false;
      this.updating = false;
    }
  }

  async runUpdate(file) {
    try {
      await this.runFlash(file);
    } catch (err) {
      this.fail(err);
    }
  }

  fail(err) {
    const aborted = /aborted by user/.test(err.message || "");
    this.setStatus(
      aborted ? t("fw.aborted") : t("fw.failed", { err: err.message }),
      "error",
    );
    this.appendLog(`${aborted ? "ABORTED" : "ERROR"}: ${err.message}`);
    if (!aborted) this.notify(t("fw.failed", { err: err.message }), "error");
  }

  async runFlash(file) {
    this.setStatus(t("fw.flashing", { pct: 0 }));
    const result = await this.updater.flash(file, {
      bootDevice: this.bootDevice,
    });
    this.setStatus(
      result.traceOnly ? t("fw.traceComplete") : t("fw.updateComplete"),
      "success",
    );
    this.appendLog(
      result.traceOnly
        ? t("fw.traceLog")
        : t("fw.doneLog", {
            frames: result.frames,
            bytes: result.bytes,
            acks: result.ackCount,
          }),
    );
    this.notify(
      result.traceOnly ? t("fw.dryRunDone") : t("fw.successToast"),
      result.traceOnly ? "info" : "success",
    );
    if (!result.traceOnly) {
      this.updating = false;
      await new Promise((r) => setTimeout(r, 3000));
      this.closeModal();
      if (transport.isConnected()) {
        try {
          const settings = await MouseApi.readAllSettings();
          stateManager.setCommittedState(settings);
        } catch (_) {}
      }
    }
  }

  abort() {
    if (this.updater) this.updater.abort();
    this.appendLog("Aborting...");
  }
}
