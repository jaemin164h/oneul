import { describe, expect, it } from '@jest/globals';

import { calculateAndroidSteps, resolveIosSteps } from './walk';

describe('platform step calculations', () => {
  it('Android 구독 기준값과 센서 오프셋을 반영한다', () => {
    expect(calculateAndroidSteps(1200, 25)).toBe(1225);
    expect(calculateAndroidSteps(0, 105, 100)).toBe(5);
    expect(calculateAndroidSteps(0, 95, 100)).toBe(0);
  });

  it('iOS의 오래된 응답으로 걸음 수가 감소하지 않는다', () => {
    expect(resolveIosSteps(1200, 1190, false)).toBe(1200);
    expect(resolveIosSteps(1200, 1210, false)).toBe(1210);
  });

  it('새 날짜에는 iOS 기기 값을 그대로 사용한다', () => {
    expect(resolveIosSteps(1200, 12, true)).toBe(12);
  });
});
