/**
 * 테이블 설정 코드 생성 유틸리티
 *
 * 포맷: {storeCode}{4자리 랜덤}
 * 예: SW31AA (storeCode="SW" + "31AA")
 *
 * 4자리 랜덤 부분은 숫자+대문자 조합 (O/I 제외)
 */

const CHARS = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // O, I 제외 (가독성)

/** 4자리 랜덤 코드 생성 */
export function generateRandomCode(length = 4): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

/** 전체 설정 코드 생성 (storeCode + 4자리) */
export function generateSetupCode(storeCode: string): string {
  return storeCode.toUpperCase() + generateRandomCode();
}
