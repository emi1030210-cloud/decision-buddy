export const duckReactions = {
  purchase: {
    alreadyOwnYes: "suspicious",
    conditionDead: "shocked",
    budgetIrresponsible: "shocked",
    usageNever: "judging",
    desireMonthPlus: "happy",
  },
  food: { craving: "curious", rejected: "i-knew-it" },
  result: {
    buy: "celebrating",
    wait: "thinking",
    dontBuy: "suspicious",
    rejected: "i-knew-it",
  },
  history: { empty: "sleeping" },
} as const;
