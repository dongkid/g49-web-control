// Canonical English dictionary. Every key used via t() / data-i18n must live
// here; reference/check-locales.mjs verifies parity with other locales and
// coverage against the sources.
export const en = {
  // ---- generic ----
  "common.na": "N/A",

  // ---- header / toolbar / overlay (index.html + app.js) ----
  "header.disconnect": "Disconnected",
  "header.connecting": "Connecting...",
  "header.connected": "Connected",
  "header.readingDevice": "Reading device...",
  "header.connect": "Connect",
  "header.switchDevice": "Switch device",
  "header.toggleTheme": "Toggle dark mode",
  "header.language": "Language",

  "nav.buttons": "Buttons & Binds",
  "nav.dpi": "DPI & Performance",
  "nav.sensor": "Sensor & Advanced",
  "nav.dongle": "Receiver & Pairing",
  "nav.shortcuts": "Shortcuts",
  "nav.macro": "Macro Manager",
  "nav.firmware": "Firmware Update",

  "toolbar.profile": "Profile",
  "toolbar.profile1": "Profile 1",
  "toolbar.profile2": "Profile 2",
  "toolbar.profile3": "Profile 3",
  "toolbar.profile4": "Profile 4",
  "toolbar.read": "Read",
  "toolbar.commit": "Commit",
  "toolbar.export": "Export",
  "toolbar.import": "Import",
  "toolbar.reset": "Reset",
  "toolbar.autosave": "Auto-save",

  "overlay.title": "Device Disconnected",
  "overlay.msg":
    "Connect your Redragon G49 / M916 Pro via 2.4GHz USB dongle or USB-C cable and click Connect.",
  "overlay.retry": "Connect Device",
  "overlay.connectingTitle": "Connecting to device...",
  "overlay.switchingTitle": "Switching device...",
  "overlay.connectingMsg":
    "Opening the WebHID connection and waking up the receiver link...",
  "overlay.pickMsg":
    "Pick your Redragon G49 / M916 Pro from the browser prompt, then wait for the configuration to load.",
  "overlay.readingTitle": "Reading device configuration...",
  "overlay.readingMsg":
    "Reading settings and macros from the mouse flash memory. This normally takes a few seconds.",
  "overlay.errorTitle": "Connection Failed",

  // ---- toasts / global messages (app.js) ----
  "toast.notSupported":
    "Please open this app in Google Chrome, Microsoft Edge, or a Chromium-based browser with WebHID support.",
  "toast.notSupportedOverlay":
    "WebHID is not supported in this browser. Please use Chrome, Edge, or Brave.",
  "toast.connected": "{name} connected!",
  "toast.reading":
    "Reading configuration from mouse flash memory...",
  "toast.readOk": "Flash configuration loaded successfully!",
  "toast.readFail": "Failed to read from mouse: {err}",
  "toast.readFailPartial":
    "Connected, but reading flash failed: {err}",
  "toast.unsupportedDevice":
    "That device is not a supported Redragon mouse (identity check failed). Disconnected. If you switched to a wired connection or another receiver, click \"Connect device\" below to pick it.",
  "toast.connectFail": "Connection failed: {err}",
  "toast.switchDiscardConfirm":
    "You have unsaved changes. Switching devices will discard them. Continue?",
  "toast.switchCancelledRestored":
    "No new device selected; the previous connection was restored.",
  "toast.newDevicePending":
    "Wired connection detected, but you have unsaved changes. Save or discard them, then click the device info badge to switch.",
  "toast.autosaveOn":
    "Auto-save enabled: changes are written to the device about 2s after you stop editing.",
  "toast.autosaveOff": "Auto-save disabled — use the Commit button to save manually.",
  "toast.writing": "Writing settings to mouse flash memory...",
  "toast.writeOk": "Settings saved to mouse hardware!",
  "toast.writeFail": "Failed to save settings: {err}",
  "toast.factoryResetConfirm":
    "Are you sure you want to restore default factory settings? All on-board calibrations and profile mappings will be reset.",
  "toast.factoryResetOk":
    "Factory reset applied! Reloading settings...",
  "toast.factoryResetFail": "Factory reset failed: {err}",
  "toast.exportOk": "Profile exported to JSON",
  "toast.exportFail": "Export failed: {err}",
  "toast.importOk":
    "Profile imported! Click Commit to save it to the mouse.",
  "toast.importFail": "Import failed: {err}",
  "toast.sensorAutoSet":
    "Sensor profile auto-set to {sensor} based on the connected device.",
  "toast.profileApplied": "Profile {n} activated on sensor DSP",

  // ---- physical button names (protocol.js defaults, mouse svg, modal) ----
  "btn.name.0": "Left Click",
  "btn.name.1": "Right Click",
  "btn.name.2": "Middle Click",
  "btn.name.3": "Side Backward",
  "btn.name.4": "Side Forward",
  "btn.name.5": "DPI Switch",
  "btn.name.5.und": "DPI Switch (Underside)",

  // ---- binding labels (state.js formatBindingSummary) ----
  "bind.unbound": "Unbound",
  "bind.unknown": "Unknown Action",
  "bind.mouse.1": "Left Click",
  "bind.mouse.2": "Right Click",
  "bind.mouse.4": "Middle Click",
  "bind.mouse.8": "Side Backward",
  "bind.mouse.16": "Side Forward",
  "bind.mouse.hex": "Mouse Click (0x{code})",
  "bind.dpi.1": "DPI Loop (Cycle)",
  "bind.dpi.2": "DPI + (Increase)",
  "bind.dpi.3": "DPI - (Decrease)",
  "bind.class.0x00": "Disabled",
  "bind.class.0x01": "Mouse Button",
  "bind.class.0x02": "DPI Switch",
  "bind.class.0x03": "Tilt Scroll",
  "bind.class.0x04": "Rapid Fire",
  "bind.class.0x05": "Multimedia / Shortcut",
  "bind.class.0x06": "Macro Action",
  "bind.class.0x07": "Polling Rate Cycle",
  "bind.class.0x08": "Lighting Toggle",
  "bind.class.0x09": "Profile Switch",
  "bind.class.0x0a": "Sniper / DPI Lock",
  "bind.class.0x0b": "Scroll Wheel",
  "bind.scroll.1": "Scroll Left",
  "bind.scroll.2": "Scroll Right",
  "bind.fire": "Rapid Fire ({ms} ms, {times})",
  "bind.fire.held": "Held",
  "bind.fire.count": "{n}x",
  "bind.shortcut": "Shortcut #{n}",
  "bind.media": "Multimedia: {name}",
  "bind.macro": "Macro #{n} ({loop})",
  "bind.profileSwitch": "Profile Switch",
  "bind.sniper": "Sniper Lock ({dpi} DPI)",
  "bind.lightsAll": "Lights On/Off",
  "bind.lightsStrip": "Strip On/Off",
  "bind.lightsCycle": "Cycle RGB",
  "bind.rebind": "Rebind",
  "bind.rebindTitle": "Rebind {name} (Button #{n})",
  "bind.modalSubtitle":
    "Choose a physical hardware action or multimedia key",
  "bind.save": "Save Binding",
  "bind.cancel": "Cancel",

  // ---- bind modal categories (ui-buttons.js) ----
  "bind.cat.mouse": "Mouse Button",
  "bind.cat.mouseDesc": "Left, right, middle or side clicks",
  "bind.cat.dpi": "DPI Switch",
  "bind.cat.dpiDesc": "Cycle DPI stages, DPI +, DPI -",
  "bind.cat.fire": "Rapid Fire",
  "bind.cat.fireDesc": "Burst fire interval & repeat",
  "bind.cat.media": "Multimedia",
  "bind.cat.mediaDesc": "Volume, playback, browser keys",
  "bind.cat.macro": "Macro Trigger",
  "bind.cat.macroDesc": "Execute custom macro sequence",
  "bind.cat.sniper": "Sniper / DPI Lock",
  "bind.cat.sniperDesc": "Lock custom DPI while held",
  "bind.cat.rate": "Polling Rate Cycle",
  "bind.cat.rateDesc": "Toggle 125/250/500/1000 Hz",
  "bind.cat.profile": "Profile Switch",
  "bind.cat.profileDesc": "Toggle between profile 1 & 2",
  "bind.cat.tilt": "Tilt Scroll",
  "bind.cat.tiltDesc": "Horizontal tilt-wheel scroll",
  "bind.cat.wheel": "Scroll Wheel",
  "bind.cat.wheelDesc": "Scroll up or down",
  "bind.cat.disabled": "Disabled",
  "bind.cat.disabledDesc": "Disable button output",

  // ---- bind modal options (ui-buttons.js) ----
  "bind.opt.selectAction": "Select Mouse Action",
  "bind.opt.mouse.1": "Left Click (Primary)",
  "bind.opt.mouse.2": "Right Click (Secondary)",
  "bind.opt.mouse.4": "Middle Click (Wheel Click)",
  "bind.opt.mouse.8": "Side Backward (Browser Back)",
  "bind.opt.mouse.16": "Side Forward (Browser Forward)",
  "bind.opt.dpiBehavior": "DPI Switch Behavior",
  "bind.opt.fireInterval": "Fire Interval (ms)",
  "bind.opt.fireIntervalHelp":
    "Delay between clicks in burst (1 to 255 ms)",
  "bind.opt.repeatCount": "Repeat Count",
  "bind.opt.repeatHelp":
    "0 fires while the button is held. 1 to 255 fires a fixed count",
  "bind.opt.shots": "shots",
  "bind.opt.selectMedia": "Select Multimedia / System Function",
  "bind.opt.noMacros":
    "No macros created yet. Create one in the Macro Manager tab.",
  "bind.opt.macroSlot": "Macro Slot",
  "bind.opt.macroSlotHelp": "Select one of your macros (up to {n})",
  "bind.opt.macroNum": "Macro #{n}",
  "bind.opt.execMode": "Execution Mode",
  "bind.opt.playOnce": "Play Once",
  "bind.opt.loopHeld": "Loop While Held",
  "bind.opt.loopUntil": "Loop Until Key Pressed",
  "bind.opt.repeatN": "Repeat {n}x",
  "bind.opt.sniperDpi": "Sniper DPI Value",
  "bind.opt.sniperHelp":
    "Sensor switches to this DPI while holding button",
  "bind.opt.tiltLabel": "Tilt Scroll Direction",
  "bind.opt.scrollLabel": "Scroll Direction",
  "bind.opt.scrollUp": "Scroll Up",
  "bind.opt.scrollDown": "Scroll Down",
  "bind.opt.noConfig": "This action needs no additional configuration.",

  // ---- multimedia key names (protocol.js MULTIMEDIA_KEYS) ----
  "media.player": "Media Player",
  "media.play": "Play/Pause",
  "media.next": "Next Track",
  "media.prev": "Previous Track",
  "media.stop": "Stop",
  "media.mute": "Mute",
  "media.volUp": "Volume Up",
  "media.volDown": "Volume Down",
  "media.email": "Email",
  "media.calc": "Calculator",
  "media.mypc": "My Computer",
  "media.home": "Browser Home",
  "media.search": "Web Search",
  "media.refresh": "Web Refresh",
  "media.fwd": "Web Forward",
  "media.back": "Web Back",
  "media.fav": "Web Favorites",
  "media.webStop": "Web Stop",

  // ---- mouse visualizer (ui-mouse-svg.js) ----
  "svg.topView": "Top View (Keys 1-5)",
  "svg.bottomView": "Underside View (Key 6)",
  "svg.btnTitle": "Button {n}: {name}",

  // ---- DPI pane (ui-dpi.js) ----
  "dpi.pollingTitle": "Polling Rate",
  "dpi.pollingDesc": "USB report frequency sent to the operating system",
  "dpi.badge1k": "1K Standard",
  "dpi.badge4k": "4K High-Speed",
  "dpi.fourKOnly": "(4K only)",
  "dpi.responseTitle": "Response & Lift-off (LOD)",
  "dpi.responseDesc":
    "Mechanical switch debounce and optical sensor height",
  "dpi.debounce": "Key Debounce Time",
  "dpi.debounceHelp":
    "Prevents accidental double-clicks (0 to 20 ms)",
  "dpi.lod": "Lift-Off Distance (LOD)",
  "dpi.lodHelp": "Cutoff tracking height when lifting the mouse",
  "dpi.lodLow": "1.0 mm (Low)",
  "dpi.lodHigh": "2.0 mm (High)",
  "dpi.stagesTitle": "DPI Resolution Stages ({n} Active)",
  "dpi.stagesDesc":
    "{sensor} — click any stage to live-activate (50 to {max} DPI)",
  "dpi.remove": "Remove",
  "dpi.add": "Add",
  "dpi.activeTooltip": "Active Live Stage",
  "dpi.switchTooltip": "Switch Live Stage",

  // ---- sensor pane (ui-sensor.js + sensors.js) ----
  "sensor.trackingTitle": "{sensor} Optical Tracking",
  "sensor.desc": "Sensor calibration and synchronization parameters",
  "sensor.variant": "Sensor Variant",
  "sensor.variantHelp":
    "Pick the sensor your model shipped with — it changes DPI encoding and available options",
  "sensor.motionSync": "Motion Sync",
  "sensor.motionSyncHelp":
    "Synchronizes sensor frames with USB polling for 1:1 input linearity",
  "sensor.modeSelect": "Mode Select",
  "sensor.modeSelectHelp":
    "Sensor power mode: LP favors battery life, HP favors tracking performance",
  "sensor.firepower": "Peak Performance",
  "sensor.firepowerHelp":
    "Runs the mouse at peak performance for the selected duration, then reverts automatically",
  "sensor.firepowerTimer": "Peak Performance Timer",
  "sensor.firepowerTimerHelp":
    "How long Peak Performance stays active once enabled",
  "sensor.ripple": "Ripple Control",
  "sensor.rippleHelp":
    "Filters high-frequency jitter at resolutions above 5000 DPI",
  "sensor.angleSnap": "Angle Snapping (Linear Correction)",
  "sensor.angleSnapHelp":
    "Assists in drawing straight horizontal and vertical lines",
  "sensor.rfTitle": "2.4GHz RF Front-End & Connectivity",
  "sensor.rfDesc": "Radio frequency transmission power and amplifier modes",
  "sensor.longRange": "Long Range Mode (High-Power RF Amplifier)",
  "sensor.longRangeHelp":
    "Boosts transmission strength to cut packet drops around dense 2.4GHz Wi-Fi",
  "sensor.powerTitle": "Power Management & Sleep Timers",
  "sensor.powerDesc": "Low-power sleep modes and battery optimization",
  "sensor.eco": "Sensor ECO Power Saving",
  "sensor.ecoHelp":
    "Reduces sensor LED current in wireless mode for longer battery life",
  "sensor.deepSleep": "Deep Sleep Inactivity",
  "sensor.deepSleepHelp":
    "Allow MCU to enter ultra-low-power sleep when idle",
  "sensor.timeout": "Inactivity Timeout",
  "sensor.timeoutHelp":
    "Idle time before MCU deep sleep engages (1 to 254 min)",
  "sensor.calibTitle": "{sensor} Surface Calibration",
  "sensor.calibDesc":
    "Calibrates laser diode current and surface reflection coefficient for your mousepad",
  "sensor.calibHelp":
    "Optimizes tracking precision and minimizes lift-off jitter on cloth, glass, or hybrid pads",
  "sensor.calibBtn": "Start Surface Calibration (MTK)",
  "sensor.calibMustConnect": "Device must be connected to calibrate",
  "sensor.calibStatusTitle": "Calibrating Optical Sensor",
  "sensor.calibBrief": "Calibrating...",
  "sensor.calibInstructionHtml":
    "Move your mouse continuously in circles across your mousepad for <strong>5 seconds</strong> while calibration is running.",
  "sensor.calibStatus":
    "Calibrating: Move mouse in circles across your pad...",
  "sensor.calibDone": "Surface Calibration Complete!",
  "sensor.calibApplied":
    "Sensor surface calibration applied to {sensor}!",
  "sensor.calibFail": "Error: {err}",
  "sensor.hint.pro": "M916 Pro 1K / 4K",
  "sensor.hint.g49": "Redragon G49 base (CID 23 / MID 4)",

  // ---- receiver / pairing (ui-dongle.js + index.html) ----
  "dongle.rgbTitle": "4K Receiver RGB Status Indicator",
  "dongle.rgbDesc":
    "Configure the LED indicator behavior on the 4K High-Speed receiver dongle",
  "dongle.badge": "4K Dongle Active",
  "dongle.mode1": "Mode 1: Low Battery Alert Only",
  "dongle.mode1Desc":
    "LED stays off and blinks red only when the battery drops below 15%",
  "dongle.mode2": "Mode 2: Dynamic Battery Level Indicator",
  "dongle.mode2Desc":
    "Displays Green (100%), Yellow (66%), Orange (33%), Red (Low)",
  "dongle.mode3": "Mode 3: Live Polling Rate Indicator",
  "dongle.mode3Desc":
    "125 Hz (Red), 250 Hz (Blue), 500 Hz (Yellow), 1000 Hz (Orange), 2000 Hz (Purple), 4 kHz (Green)",
  "dongle.pairTitle": "2.4GHz RF Receiver Pairing",
  "dongle.pairDesc":
    "Pair this mouse with a new 1K or 4K USB receiver dongle",
  "dongle.pairHelp":
    "Put the dongle in pairing mode and press Left + Middle + Right for 3 seconds.",
  "dongle.pairBtn": "Launch 2.4GHz Pairing Wizard",
  "dongle.pairNeedConnection":
    "Device must be connected via USB dongle to pair",
  "dongle.wizardTitle": "2.4GHz Wireless Pairing Wizard",
  "dongle.wizardSub":
    "Sync your mouse to a 1K or 4K USB receiver dongle",
  "dongle.scanning": "Scanning for Mouse Broadcast",
  "dongle.instructionHtml":
    "Press and hold <strong>Left + Middle (Wheel) + Right</strong> buttons simultaneously for <strong>3 seconds</strong> until the yellow LED begins flashing.",
  "dongle.inProgress": "Pairing in Progress...",
  "dongle.holdInstruction":
    "Pairing mode active. Hold Left + Middle + Right for 3 seconds",
  "dongle.success": "Pairing successful. Device linked.",
  "dongle.successToast": "2.4GHz Receiver paired successfully!",
  "dongle.failed": "Pairing Failed. Please try again.",
  "dongle.timeout": "Pairing Timed Out. Please retry.",

  // ---- shortcuts (ui-shortcuts.js) ----
  "sc.title": "Shortcut Key Slots ({n} / {max})",
  "sc.desc":
    "Stored key combinations played by shortcut bindings",
  "sc.empty": "Empty",
  "sc.name": "Shortcut #{n}",
  "sc.editorTitle": "Shortcut #{n} Editor",
  "sc.editorDesc": "Up to {n} keys in sequence",
  "sc.clear": "Clear",
  "sc.keys": "Keys ({n} / {max})",
  "sc.addKey": "Add Key",
  "sc.pressKey": "Press Key...",
  "sc.click": "Click",
  "sc.removeKey": "Remove Key",
  "sc.emptyHint":
    'No keys. Press "+ Add Key" and type, or add a mouse click.',
  "sc.bindHint":
    "Bind a shortcut via the Buttons tab using the Multimedia / Shortcut action.",

  // ---- macros (ui-macros.js + mouse-api.js step decoding) ----
  "macro.title": "Hardware Macros ({n} / {max})",
  "macro.desc": "On-board flash macro definitions",
  "macro.new": "New Macro",
  "macro.steps": "{n} Steps",
  "macro.select": "Select",
  "macro.deleteTitle": "Delete Macro",
  "macro.none": "No macros created yet.",
  "macro.createFirst": "Create First Macro",
  "macro.editor": "Macro Sequence Editor",
  "macro.editorDesc":
    "Configure keystrokes, mouse buttons and delay steps",
  "macro.delete": "Delete Macro",
  "macro.name": "Macro Name",
  "macro.nameHelp": "Name stored in on-board MCU flash",
  "macro.sequence": "Sequence Steps ({n} / {max})",
  "macro.addKey": "Add Key",
  "macro.pressKey": "Press Key...",
  "macro.click": "Click",
  "macro.delay": "Delay",
  "macro.clickSelectTitle": "Mouse button to add",
  "macro.emptyHint":
    'Sequence is empty. Click "+ Add Key", "+ Click", or "+ Delay" above.',
  "macro.noneSelected":
    "Create or select a macro from the left panel to edit sequence steps.",
  "macro.limitToast": "Maximum limit of {n} hardware macros reached",
  "macro.created": "Created {name}",
  "macro.deleted": "Macro deleted",
  "macro.addedKey": "Added key: {key}",
  "macro.defaultName": "Macro {n}",
  "macro.step.keyDown": "Key {key} Down",
  "macro.step.keyUp": "Key {key} Up",
  "macro.step.mouseDown": "{btn} Down",
  "macro.step.mouseUp": "{btn} Up",
  "macro.step.delay": "Delay {ms} ms",

  // ---- firmware (ui-firmware.js + firmware.js) ----
  "fw.title": "Firmware Update",
  "fw.desc":
    "Flash the mouse MCU (CX52850P) or the receiver dongle (CX52650N / CH32V305)",
  "fw.readyBadge": "Wired USB, ready to update",
  "fw.wirelessBadge": "Wireless, plug in the USB cable first",
  "fw.mouseFw": "Mouse firmware (current)",
  "fw.mouseFwHelp":
    "Mouse firmware version, readable on both wired and 2.4G wireless links",
  "fw.dongleFw": "Receiver firmware (current)",
  "fw.dongleFwHelp":
    "The receiver's own firmware version, read over the 2.4G link",
  "fw.checkUpdates": "Check for updates",
  "fw.checkManifestHelp":
    "Compares against the configured firmware manifest",
  "fw.checkNoManifestHelp":
    "The official driver ships .bin packages next to the exe. Load one below, or set FIRMWARE_MANIFEST_URL in js/firmware.js to enable update checks",
  "fw.checkBtn": "Check",
  "fw.packageTitle": "Update Package (.bin)",
  "fw.packageDesc": "A packaged upgrade file: 728-byte header + images",
  "fw.dropTextHtml":
    "Choose or drop a <code>.bin</code> upgrade file",
  "fw.browse": "Browse...",
  "fw.dropHelpHtml":
    "Drop a <code>.bin</code> upgrade file from Redragon's driver package to load firmware.",
  "fw.badgeValid": "Valid & matches device",
  "fw.badgeMismatch": "Does not match device",
  "fw.badgeInvalid": "Invalid file",
  "fw.metaTarget": "Target",
  "fw.metaMcu": "MCU (icName)",
  "fw.metaCidMid": "CID / MID",
  "fw.metaVersion": "Version",
  "fw.metaFwLen": "FW length",
  "fw.metaFileSize": "File size",
  "fw.trace": "Trace (dry run)",
  "fw.start": "Start Update",
  "fw.modalTitle": "Firmware Update",
  "fw.modalSub":
    "USB DFU transfer. Do not unplug the device until it finishes",
  "fw.wizardTitle": "Flashing Firmware",
  "fw.wizardSub":
    "The device is being put into its USB DFU bootloader and the image is transferred in 32-byte chunks.",
  "fw.starting": "Starting...",
  "fw.bootTip":
    "Press the button and select the bootloader device in the browser dialog.",
  "fw.pickBoot": "Select Bootloader Device",
  "fw.abort": "Abort",
  "fw.close": "Close",
  "fw.statusTrace": "Tracing frame stream (dry run)",
  "fw.traceDone": "Trace complete. {n} frames",
  "fw.dryRunToast":
    "Dry run finished. Nothing was written to the device.",
  "fw.requesting": "Requesting update mode...",
  "fw.waitingBoot": "Waiting for bootloader device...",
  "fw.bootNotFound": "Bootloader not detected automatically",
  "fw.flashing": "Flashing... {pct}%",
  "fw.traceComplete": "Trace complete",
  "fw.updateComplete": "Update complete",
  "fw.doneLog":
    "Done: {frames} chunks, {bytes} bytes, {acks} ACKs.",
  "fw.traceLog": "Trace only, no data was written.",
  "fw.dryRunDone": "Dry run finished.",
  "fw.successToast": "Firmware update completed successfully!",
  "fw.aborted": "Update aborted",
  "fw.failed": "Update failed: {err}",
  "fw.confirm":
    "This will replace the firmware on your device and it must not be unplugged until it finishes.\n\nA failed or mismatched flash can brick the device. Only continue with a genuine Redragon .bin for your exact model, connected by USB cable.\n\nContinue?",
  "fw.manifestNone":
    "No update manifest is configured. The official app ships .bin packages without a server. Load one above.",
  "fw.available":
    "Firmware v{v} is available. Download the .bin and load it above.",
  "fw.noNewer": "No newer firmware listed for this device.",
  "fw.checkFail": "Update check failed: {err}",

  // firmware.js validation errors
  "fw.err.unsupportedType":
    "Unsupported file type {t}. Expected 210 (mouse) or 211 (dongle)",
  "fw.err.badCid": "CID {c} is not this device's CID (23)",
  "fw.err.unknownMid":
    "MID {m} is unknown (4 = G49, 5 = 1K Pro, 6 = 4K)",
  "fw.err.noIcName": "icName field is empty",
  "fw.err.badDownloadAddr": "File has no valid download address",
  "fw.err.fwTooSmall": "fwLength {n} is implausibly small",
  "fw.err.tooSmallBoot":
    "File is smaller than the 8 KB boot section",
  "fw.err.noFile": "No file selected",
  "fw.err.tooSmallFile": "File too small: {n} bytes",
  "fw.err.noDevice": "No device connected",
  "fw.err.notWired":
    "The mouse must be connected by USB cable to get a firmware update. Flashing over RF can brick it.",
  "fw.err.dongleFile":
    "This file targets the receiver dongle. Plug the dongle into USB to update it.",
  "fw.err.midMismatch":
    "MID mismatch: file targets {file}, connected device is {dev}",
  "fw.err.cidMismatch":
    "CID mismatch: file targets {file}, device reports {dev}",
  "fw.err.mcuMismatch":
    'MCU mismatch: this target needs {expect} but the file carries icName "{actual}".',
  "fw.err.bootReport":
    "Could not send bootloader report. The bootloader may use a different report layout. Use Trace mode to inspect frames.",
  "fw.err.noPayload": "No firmware payload in this file",
  "fw.err.bootNotFoundLong":
    'Bootloader device not found after the update-mode command. Unplug and replug the USB cable, then click "Select Bootloader Device" or retry.',
  "fw.err.noAck":
    "No ACK from the bootloader at chunk {i}/{n} (address 0x{addr}). Update failed. The device is still in bootloader mode and can be retried.",

  // device type names (firmware.js CXFILE_TYPE_NAMES)
  "fw.type.0": "Boot loader",
  "fw.type.209": "Keyboard",
  "fw.type.210": "Mouse",
  "fw.type.211": "Receiver dongle",
  "fw.type.212": "Common",

  // shared duration formatting (ui-sensor.js timer dropdowns)
  "time.sec": "{n} s",
  "time.min": "{n} min",
};
