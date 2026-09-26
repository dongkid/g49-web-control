// Verifies the sensor-aware DPI codec against the real flash dump captured
// by the official G49 driver (reference/g49-flash-dump.bin).
import fs from "node:fs";
import {
  setActiveSensorId,
  getActiveSensorId,
  SENSOR_IDS,
  sensorMaxDpi,
} from "../js/sensors.js";
import { encodeDpiRecord, decodeDpiRecord } from "../js/protocol.js";

const dumpUrl = new URL("./g49-flash-dump.bin", import.meta.url);
if (!fs.existsSync(dumpUrl)) {
  // The dump is a local capture of your own mouse and is intentionally not
  // committed. Place one at reference/g49-flash-dump.bin to run this check.
  console.error(
    "SKIPPED: reference/g49-flash-dump.bin not found.\n" +
      "Capture a flash dump from the official driver log and place it there to run this regression.",
  );
  process.exit(0);
}
const flash = fs.readFileSync(dumpUrl);
let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${JSON.stringify(actual)}${ok ? "" : ` != ${JSON.stringify(expected)}`}`);
};

// --- 1. decode the 8 real DPI stage records -------------------------------
setActiveSensorId(SENSOR_IDS.PAW3311);
const stages = [];
for (let i = 0; i < 8; i++) {
  stages.push(decodeDpiRecord(flash.subarray(0x000c + i * 4, 0x000c + i * 4 + 4)));
}
check("flash stages decode", stages, [1200, 2000, 4000, 8000, 12000, 12000, 12000, 12000]);

// --- 2. encode round-trips byte-identical to what the official driver wrote
for (const [dpi, off] of [
  [1200, 0x0c],
  [2000, 0x10],
  [4000, 0x14],
  [8000, 0x18],
  [12000, 0x1c],
]) {
  check(`encode(${dpi}) bytes`, encodeDpiRecord(dpi), [...flash.subarray(off, off + 4)]);
}

// --- 3. round-trip a sweep of DPI values ----------------------------------
let sweepOk = true;
for (let dpi = 50; dpi <= 24000; dpi += 50) {
  const rec = encodeDpiRecord(dpi);
  const back = decodeDpiRecord(rec);
  if (back !== dpi) {
    // >10000 regions snap to 100/200 granularity
    const snapped = dpi <= 10000 ? dpi : dpi <= 20000 ? Math.round(dpi / 100) * 100 : Math.round(dpi / 200) * 200;
    if (back !== snapped) {
      sweepOk = false;
      console.log(`FAIL  roundtrip ${dpi} -> ${back} (expected ${snapped})`);
      failures++;
    }
  }
}
if (sweepOk) console.log("PASS  roundtrip sweep 50..24000 (step 50)");

// --- 4. out-of-range clamping ---------------------------------------------
check("clamp 30000", decodeDpiRecord(encodeDpiRecord(30000)), 24000);
check("clamp 10", decodeDpiRecord(encodeDpiRecord(10)), 50);

// --- 5. 3395 linear path unchanged ----------------------------------------
setActiveSensorId(SENSOR_IDS.PAW3395);
check("3395 encode 1600", encodeDpiRecord(1600), [31, 31, 0, (0x55 - 62) & 0xff]);
check("3395 encode 26000", encodeDpiRecord(26000), [0x07, 0x07, 0x88, (0x55 - (0x07 + 0x07 + 0x88)) & 0xff]);
check("3395 max dpi", sensorMaxDpi(SENSOR_IDS.PAW3395), 26000);

// --- 6. sniper code conversion on 3311 ------------------------------------
setActiveSensorId(SENSOR_IDS.PAW3311);
console.log(`${getActiveSensorId() === SENSOR_IDS.PAW3311 ? "PASS" : "FAIL"}  active sensor = ${getActiveSensorId()}`);

// --- 7. dual-model compatibility ------------------------------------------
const { sensorIdForMid, isKnownPaw3311Code, peekStoredSensorId } = await import(
  "../js/sensors.js"
);
check("mid 4 -> PAW3311", sensorIdForMid(4), SENSOR_IDS.PAW3311);
check("mid 5 -> PAW3395", sensorIdForMid(5), SENSOR_IDS.PAW3395);
check("mid 6 -> PAW3395", sensorIdForMid(6), SENSOR_IDS.PAW3395);
check("mid 99 -> null", sensorIdForMid(99), null);

// Skipped-code evidence: 0x07 is not a valid 3311 register code, so a stage
// using it must be 3395-encoded (400 DPI under the linear codec).
check("0x07 unknown to 3311", isKnownPaw3311Code(0x07), false);
check("0xEF unknown to 3311", isKnownPaw3311Code(0xef), false);
setActiveSensorId(SENSOR_IDS.PAW3395, false);
check("3395 decode of foreign code", decodeDpiRecord([0x07, 0x07, 0x00, (0x55 - 14) & 0xff], SENSOR_IDS.PAW3395), 400);

// Every real stage code in the G49 flash dump IS a valid 3311 code, so the
// heuristic must not fire on this mouse.
let dumpCodesKnown = true;
for (let i = 0; i < 8; i++) {
  const code = flash[0x000c + i * 4];
  if (code !== 0xff && !isKnownPaw3311Code(code)) dumpCodesKnown = false;
}
check("G49 dump codes all valid 3311", dumpCodesKnown, true);

// No stored sensor choice in this environment (no localStorage) -> the MID
// rule is allowed to auto-set; auto-sets never persist.
check("no stored choice in node", peekStoredSensorId(), null);
setActiveSensorId(SENSOR_IDS.PAW3311, false);
console.log(`${getActiveSensorId() === SENSOR_IDS.PAW3311 ? "PASS" : "FAIL"}  non-persisting switch applied`);

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
