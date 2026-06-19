import type { Proposal } from "@/shared/types/domain";

const STORAGE_KEY = "portal-emoveis.negotiated-offers";

export type NegotiatedOfferRecord = {
  offerId: string;
  proposalId?: string;
  buyerId?: string;
  sellerId?: string;
  updatedAt: string;
};

function safeParse(value: string | null): NegotiatedOfferRecord[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getNegotiatedOfferRecords() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function getNegotiatedOfferIds() {
  return new Set(getNegotiatedOfferRecords().map((record) => record.offerId));
}

export function isOfferNegotiated(offerId?: string | null) {
  if (!offerId) return false;
  return getNegotiatedOfferIds().has(offerId);
}

export function markOfferAsNegotiated(record: Omit<NegotiatedOfferRecord, "updatedAt">) {
  if (typeof window === "undefined" || !record.offerId) return;

  const current = getNegotiatedOfferRecords().filter((item) => item.offerId !== record.offerId);
  const next = [
    ...current,
    {
      ...record,
      updatedAt: new Date().toISOString(),
    },
  ];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("portal-emoveis:negotiations-updated"));
}

export function syncAcceptedProposalsAsNegotiated(proposals?: Proposal[]) {
  proposals
    ?.filter((proposal) => proposal.status === "ACEITA")
    .forEach((proposal) => {
      markOfferAsNegotiated({
        offerId: proposal.offerId,
        proposalId: proposal.id,
        buyerId: proposal.buyerId,
        sellerId: proposal.offer?.userId ?? proposal.offer?.user?.id,
      });
    });
}
