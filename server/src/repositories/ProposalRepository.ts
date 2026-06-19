import {
  MatchStatus,
  OfferStatus,
  Prisma,
  ProposalStatus,
} from "@prisma/client";

import { prisma } from "../prisma.js";
import {
  CreateProposalDTO,
  UpdateProposalDTO,
  UpdateProposalStatusDTO,
} from "../DTOs/proposalDTO.js";

const PROPOSAL_INCLUDE = {
  buyer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  },
  offer: {
    include: {
      media: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
        },
      },
    },
  },
  match: {
    include: {
      preference: true,
    },
  },
} as const;

export class ProposalRepository {
  private toDecimal(value?: number | null) {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Prisma.Decimal(value);
  }

  async create(data: CreateProposalDTO) {
    return prisma.proposal.create({
      data: {
        offerId: data.offerId,
        buyerId: data.buyerId,
        matchId: data.matchId ?? undefined,
        message: data.message,
        value: this.toDecimal(data.value),
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findById(id: string) {
    return prisma.proposal.findUnique({
      where: { id },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findByBuyerId(buyerId: string) {
    return prisma.proposal.findMany({
      where: { buyerId },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findReceivedBySellerId(sellerId: string) {
    return prisma.proposal.findMany({
      where: {
        offer: {
          userId: sellerId,
        },
      },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findByOfferId(offerId: string) {
    return prisma.proposal.findMany({
      where: { offerId },
      include: PROPOSAL_INCLUDE,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findExistingByBuyerAndOffer(offerId: string, buyerId: string) {
    return prisma.proposal.findUnique({
      where: {
        offerId_buyerId: {
          offerId,
          buyerId,
        },
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async findOfferById(offerId: string) {
    return prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
  }

  async findMatchForProposal(
    matchId: string,
    offerId: string,
    buyerId: string,
  ) {
    return prisma.match.findFirst({
      where: {
        id: matchId,
        offerId,
        preference: {
          userId: buyerId,
        },
      },
      include: {
        preference: true,
        offer: true,
      },
    });
  }

  async update(id: string, data: UpdateProposalDTO) {
    const updateData: Prisma.ProposalUpdateInput = {};

    if ("message" in data) {
      updateData.message = data.message;
    }

    if ("value" in data) {
      updateData.value = this.toDecimal(data.value);
    }

    return prisma.proposal.update({
      where: { id },
      data: updateData,
      include: PROPOSAL_INCLUDE,
    });
  }

  async updateStatus(id: string, data: UpdateProposalStatusDTO) {
    return prisma.proposal.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: PROPOSAL_INCLUDE,
    });
  }

  async updateStatusAndApplyBusinessEffects(
    id: string,
    data: UpdateProposalStatusDTO,
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedProposal = await tx.proposal.update({
        where: { id },
        data: {
          status: data.status,
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
          offer: {
            include: {
              media: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
          match: {
            include: {
              preference: true,
            },
          },
        },
      });

      if (data.status === ProposalStatus.ACEITA) {
        await tx.offer.update({
          where: {
            id: updatedProposal.offerId,
          },
          data: {
            status: OfferStatus.PAUSADA,
          },
        });

        await tx.proposal.updateMany({
          where: {
            offerId: updatedProposal.offerId,
            id: {
              not: updatedProposal.id,
            },
            status: ProposalStatus.PENDENTE,
          },
          data: {
            status: ProposalStatus.RECUSADA,
          },
        });

        if (updatedProposal.matchId) {
          await tx.match.update({
            where: {
              id: updatedProposal.matchId,
            },
            data: {
              status: MatchStatus.FEITO,
            },
          });

          await tx.match.updateMany({
            where: {
              offerId: updatedProposal.offerId,
              id: {
                not: updatedProposal.matchId,
              },
            },
            data: {
              status: MatchStatus.RECUSADO,
            },
          });
        } else {
          await tx.match.updateMany({
            where: {
              offerId: updatedProposal.offerId,
              preference: {
                userId: updatedProposal.buyerId,
              },
            },
            data: {
              status: MatchStatus.FEITO,
            },
          });

          await tx.match.updateMany({
            where: {
              offerId: updatedProposal.offerId,
              preference: {
                userId: {
                  not: updatedProposal.buyerId,
                },
              },
            },
            data: {
              status: MatchStatus.RECUSADO,
            },
          });
        }
      }

      if (data.status === ProposalStatus.RECUSADA) {
        if (updatedProposal.matchId) {
          await tx.match.update({
            where: {
              id: updatedProposal.matchId,
            },
            data: {
              status: MatchStatus.RECUSADO,
            },
          });
        } else {
          await tx.match.updateMany({
            where: {
              offerId: updatedProposal.offerId,
              preference: {
                userId: updatedProposal.buyerId,
              },
            },
            data: {
              status: MatchStatus.RECUSADO,
            },
          });
        }
      }

      if (data.status === ProposalStatus.CANCELADA) {
        if (updatedProposal.matchId) {
          await tx.match.update({
            where: {
              id: updatedProposal.matchId,
            },
            data: {
              status: MatchStatus.PENDENTE,
            },
          });
        } else {
          await tx.match.updateMany({
            where: {
              offerId: updatedProposal.offerId,
              preference: {
                userId: updatedProposal.buyerId,
              },
            },
            data: {
              status: MatchStatus.PENDENTE,
            },
          });
        }
      }

      const proposal = await tx.proposal.findUnique({
        where: { id },
        include: PROPOSAL_INCLUDE,
      });

      return proposal;
    });
  }

  async markRelatedMatchesAsProposalSent(
    offerId: string,
    buyerId: string,
    matchId?: string | null,
  ) {
    if (matchId) {
      return prisma.match.update({
        where: {
          id: matchId,
        },
        data: {
          status: MatchStatus.PROPOSTA_ENVIADA,
        },
      });
    }

    return prisma.match.updateMany({
      where: {
        offerId,
        preference: {
          userId: buyerId,
        },
      },
      data: {
        status: MatchStatus.PROPOSTA_ENVIADA,
      },
    });
  }
}
