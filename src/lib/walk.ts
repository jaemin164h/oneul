export function calculateAndroidSteps(
  base: number,
  sensorSteps: number,
  sensorOffset = 0,
) {
  return Math.max(0, Math.round(base + Math.max(0, sensorSteps - sensorOffset)));
}

export function resolveIosSteps(
  current: number,
  deviceSteps: number,
  replace: boolean,
) {
  const safeDeviceSteps = Math.max(0, Math.round(deviceSteps));
  return replace ? safeDeviceSteps : Math.max(current, safeDeviceSteps);
}
