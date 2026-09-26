// Sensor capability profiles for the Compx CX52850P SDK family (M916 Pro / G49).
//
// Register semantics differ per sensor. Facts extracted from the official
// Redragon G49 driver (`driver_sensor.h`, `Config.ini`) and a live flash dump:
// - PAW3395 (M916 Pro 1K/4K): linear register codes, dpi = (code + 1) * 50;
//   dpiEx high bits extend past 12,800 DPI up to 26,000.
// - PAW3311 (Redragon G49 base, CID 23 / MID 4): quantized register table
//   covering 50..10,000 DPI (SUPPORT_SENSOR_MODE_SEL). Above 10,000 the dpiEx
//   flags scale the base code (0x22 = x2, 0x11 = x2, both set = x4), up to
//   24,000 DPI per the official driver's Config.ini DPIRange. DPI stages are
//   stored as [xCode, yCode, dpiEx, checksum].
// - SUPPORT_MOTION_SYNC and SUPPORT_MOUSEPAD_CAL (MTK surface calibration)
//   list only 3395/3370. On 3311 firmware the motionSync register reads a
//   constant 0x80 and must not be shown as a toggle or rewritten as 0/1.
// - SUPPORT_RIPPLE and SUPPORT_FIXLINE (angle snapping) include 3311, so
//   those two toggles stay available.

export const SENSOR_IDS = {
  PAW3395: "PAW3395",
  PAW3311: "PAW3311",
};

export const SENSORS = {
  [SENSOR_IDS.PAW3395]: {
    id: SENSOR_IDS.PAW3395,
    label: "PixArt PAW3395",
    modelHint: "M916 Pro 1K / 4K",
    modelHintKey: "sensor.hint.pro",
    maxDpi: 26000,
    capabilities: {
      motionSync: true,
      rippleControl: true,
      linearCorrection: true,
      surfaceCalibration: true,
    },
  },
  [SENSOR_IDS.PAW3311]: {
    id: SENSOR_IDS.PAW3311,
    label: "PixArt PAW3311",
    modelHint: "Redragon G49 base (CID 23 / MID 4)",
    modelHintKey: "sensor.hint.g49",
    maxDpi: 24000,
    capabilities: {
      motionSync: false,
      rippleControl: true,
      linearCorrection: true,
      surfaceCalibration: false,
      // Write-tested on live hardware: 0x56 rejects writes on this firmware
      // (stays 0xFF), so the ECO toggle has no backing register and is hidden.
      powerSaving: false,
    },
    // Register addresses captured from the official G49 driver: the 3311
    // firmware keeps some perf toggles in the 0xA0+ region instead of the
    // 3395 layout. Registers in perfSkip are never written: motion sync and
    // allLedOffTime are firmware constants, and 0x56 (ECO) rejects writes
    // (verified by a live write/read-back test).
    perfOverrides: {
      linearCorrection: 0x00af,
      rippleControl: 0x00b1,
    },
    perfSkip: [
      "motionSync",
      "allLedOffTime",
      "powerSaving",
    ],
  },
};

// dpi -> register code, extracted verbatim from driver_sensor.h (SENSOR_3311_DPI_*)
export const PAW3311_DPI_CODE = new Map([
  [50, 0x01], [100, 0x02], [150, 0x03], [200, 0x04], [250, 0x05], [300, 0x06],
  [350, 0x08], [400, 0x09], [450, 0x0A], [500, 0x0B], [550, 0x0C], [600, 0x0E],
  [650, 0x0F], [700, 0x10], [750, 0x11], [800, 0x12], [850, 0x13], [900, 0x15],
  [950, 0x16], [1000, 0x17], [1050, 0x18], [1100, 0x19], [1150, 0x1B], [1200, 0x1C],
  [1250, 0x1D], [1300, 0x1E], [1350, 0x1F], [1400, 0x20], [1450, 0x22], [1500, 0x23],
  [1550, 0x24], [1600, 0x25], [1650, 0x26], [1700, 0x27], [1750, 0x29], [1800, 0x2A],
  [1850, 0x2B], [1900, 0x2C], [1950, 0x2D], [2000, 0x2F], [2050, 0x30], [2100, 0x31],
  [2150, 0x32], [2200, 0x33], [2250, 0x34], [2300, 0x36], [2350, 0x37], [2400, 0x38],
  [2450, 0x39], [2500, 0x3A], [2550, 0x3B], [2600, 0x3D], [2650, 0x3E], [2700, 0x3F],
  [2750, 0x40], [2800, 0x41], [2850, 0x43], [2900, 0x44], [2950, 0x45], [3000, 0x46],
  [3050, 0x47], [3100, 0x48], [3150, 0x4A], [3200, 0x4B], [3250, 0x4C], [3300, 0x4D],
  [3350, 0x4E], [3400, 0x4F], [3450, 0x51], [3500, 0x52], [3550, 0x53], [3600, 0x54],
  [3650, 0x55], [3700, 0x57], [3750, 0x58], [3800, 0x59], [3850, 0x5A], [3900, 0x5B],
  [3950, 0x5C], [4000, 0x5E], [4050, 0x5F], [4100, 0x60], [4150, 0x61], [4200, 0x62],
  [4250, 0x63], [4300, 0x65], [4350, 0x66], [4400, 0x67], [4450, 0x68], [4500, 0x69],
  [4550, 0x6B], [4600, 0x6C], [4650, 0x6D], [4700, 0x6E], [4750, 0x6F], [4800, 0x70],
  [4850, 0x72], [4900, 0x73], [4950, 0x74], [5000, 0x75], [5050, 0x76], [5100, 0x77],
  [5150, 0x79], [5200, 0x7A], [5250, 0x7B], [5300, 0x7C], [5350, 0x7D], [5400, 0x7F],
  [5450, 0x80], [5500, 0x81], [5550, 0x82], [5600, 0x83], [5650, 0x84], [5700, 0x86],
  [5750, 0x87], [5800, 0x88], [5850, 0x89], [5900, 0x8A], [5950, 0x8B], [6000, 0x8D],
  [6050, 0x8E], [6100, 0x8F], [6150, 0x90], [6200, 0x91], [6250, 0x93], [6300, 0x94],
  [6350, 0x95], [6400, 0x96], [6450, 0x97], [6500, 0x98], [6550, 0x9A], [6600, 0x9B],
  [6650, 0x9C], [6700, 0x9D], [6750, 0x9E], [6800, 0x9F], [6850, 0xA1], [6900, 0xA2],
  [6950, 0xA3], [7000, 0xA4], [7050, 0xA5], [7100, 0xA7], [7150, 0xA8], [7200, 0xA9],
  [7250, 0xAA], [7300, 0xAB], [7350, 0xAC], [7400, 0xAE], [7450, 0xAF], [7500, 0xB0],
  [7550, 0xB1], [7600, 0xB2], [7650, 0xB3], [7700, 0xB5], [7750, 0xB6], [7800, 0xB7],
  [7850, 0xB8], [7900, 0xB9], [7950, 0xBB], [8000, 0xBC], [8050, 0xBD], [8100, 0xBE],
  [8150, 0xBF], [8200, 0xC0], [8250, 0xC2], [8300, 0xC3], [8350, 0xC4], [8400, 0xC5],
  [8450, 0xC6], [8500, 0xC7], [8550, 0xC9], [8600, 0xCA], [8650, 0xCB], [8700, 0xCC],
  [8750, 0xCD], [8800, 0xCF], [8850, 0xD0], [8900, 0xD1], [8950, 0xD2], [9000, 0xD3],
  [9050, 0xD4], [9100, 0xD6], [9150, 0xD7], [9200, 0xD8], [9250, 0xD9], [9300, 0xDA],
  [9350, 0xDB], [9400, 0xDD], [9450, 0xDE], [9500, 0xDF], [9550, 0xE0], [9600, 0xE1],
  [9650, 0xE3], [9700, 0xE4], [9750, 0xE5], [9800, 0xE6], [9850, 0xE7], [9900, 0xE8],
  [9950, 0xEA], [10000, 0xEB],
]);

export const PAW3311_CODE_DPI = new Map(
  [...PAW3311_DPI_CODE].map(([dpi, code]) => [code, dpi]),
);

export const PAW3311_MAX_DPI = 24000;
export const PAW3311_LINEAR_MAX_DPI = 10000;

// Returns [xCode, yCode, dpiEx] (checksum added by the caller).
export function encodeDpiPaw3311(targetDPI) {
  let dpi = Math.round((Number(targetDPI) || 800) / 50) * 50;
  dpi = Math.max(50, Math.min(PAW3311_MAX_DPI, dpi));

  let base = dpi;
  let dpiEx = 0;
  if (dpi > 20000) {
    base = Math.round(dpi / 200) * 50;
    dpiEx = 0x33;
  } else if (dpi > PAW3311_LINEAR_MAX_DPI) {
    base = Math.round(dpi / 100) * 50;
    dpiEx = 0x22;
  }
  base = Math.max(50, Math.min(PAW3311_LINEAR_MAX_DPI, base));

  const code = PAW3311_DPI_CODE.get(base) ?? Math.floor(base / 50) - 1;
  return [code, code, dpiEx];
}

// Returns the DPI a stage record resolves to on a 3311, or null when the
// code is not in the sensor table (unprogrammed flash or foreign encoding).
export function decodeDpiPaw3311(record) {
  const code = record && record[0];
  if (code === undefined || code === 0xff || code === 0) return null;
  const base = PAW3311_CODE_DPI.get(code);
  if (base === undefined) return null;
  const dpiEx = record[2];
  return base * (dpiEx & 0x22 ? 2 : 1) * (dpiEx & 0x11 ? 2 : 1);
}

// Sniper / DPI-lock bindings carry the raw sensor code in a single byte.
export function dpiToPaw3311Code(dpi) {
  return encodeDpiPaw3311(dpi)[0];
}

// The 3311 register table skips certain codes; a flash stage using one of
// those codes can only come from a different (3395-style linear) encoding.
export function isKnownPaw3311Code(code) {
  return PAW3311_CODE_DPI.has(code);
}

// Board MID -> sensor profile. 4 = G49 base, 5 = M916 Pro 1K, 6 = 4K.
export const SENSOR_FOR_MID = {
  4: SENSOR_IDS.PAW3311,
  5: SENSOR_IDS.PAW3395,
  6: SENSOR_IDS.PAW3395,
};

export function sensorIdForMid(mid) {
  return SENSOR_FOR_MID[mid] || null;
}

export function sensorMaxDpi(sensorId = activeSensorId) {
  const sensor = SENSORS[sensorId];
  return sensor ? sensor.maxDpi : SENSORS[SENSOR_IDS.PAW3395].maxDpi;
}

const STORAGE_KEY = "m916_sensor";
let activeSensorId = loadSavedSensorId() || SENSOR_IDS.PAW3311;

function loadSavedSensorId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SENSORS[saved]) return saved;
  } catch (_) {}
  return null;
}

// Explicit user choice (persisted), or null when the sensor was never
// manually picked. Auto-detection must not write to this store.
export function peekStoredSensorId() {
  return loadSavedSensorId();
}

export function getActiveSensorId() {
  return activeSensorId;
}

export function getActiveSensor() {
  return SENSORS[activeSensorId];
}

export function setActiveSensorId(id, persist = true) {
  if (!SENSORS[id]) return;
  activeSensorId = id;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (_) {}
  }
}
