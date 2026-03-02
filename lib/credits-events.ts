export const CREDITS_UPDATED_EVENT = 'powerv:credits-updated';

interface CreditsUpdatedDetail {
  total?: number;
}

export function emitCreditsUpdated(detail?: CreditsUpdatedDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<CreditsUpdatedDetail>(CREDITS_UPDATED_EVENT, { detail }));
}

