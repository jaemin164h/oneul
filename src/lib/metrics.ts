export function formatNumber(value: number) {
  return Math.max(0, Math.round(value)).toLocaleString('ko-KR');
}

export function stepsToKm(steps: number, strideCm: number) {
  return (steps * strideCm) / 100 / 1000;
}

export function stepsToMinutes(steps: number) {
  return Math.round(steps / 110);
}

export function stepsToKcal(steps: number) {
  return Math.round(steps * 0.04);
}

export function formatKm(km: number) {
  if (km < 0.1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
