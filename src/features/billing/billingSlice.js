import { createSlice } from '@reduxjs/toolkit';

// Global "upgrade" prompt. Any API call that hits a plan limit (HTTP 402) opens it,
// see baseQuery.js, so individual pages don't need their own limit handling.
const slice = createSlice({
  name: 'billing',
  initialState: { upgradePrompt: { open: false, message: '' } },
  reducers: {
    upgradePromptOpened: (s, { payload }) => {
      s.upgradePrompt = { open: true, message: payload || '' };
    },
    upgradePromptClosed: (s) => {
      s.upgradePrompt = { open: false, message: '' };
    },
  },
});

export const { upgradePromptOpened, upgradePromptClosed } = slice.actions;
export default slice.reducer;
export const selectUpgradePrompt = (s) => s.billing.upgradePrompt;
