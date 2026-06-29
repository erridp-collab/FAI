export const TEST_MODE_HEADER = "x-fai-test-mode";

export function isTestModeEnabled() {
  return process.env.NEXT_PUBLIC_ALLOW_DEV_MODE === "1";
}

export function isTestModeValue(value: boolean | string | null | undefined) {
  return value === true || value === "1";
}

export function getResponsesTable(isTestMode: boolean) {
  return isTestMode ? "fai_responses_test" : "fai_responses";
}

export function getTokensTable(isTestMode: boolean) {
  return isTestMode ? "access_tokens_test" : "access_tokens";
}
