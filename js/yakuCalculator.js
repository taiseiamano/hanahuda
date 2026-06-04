// Hanafuda Yaku (Combination) Calculator
// Designed to be easily modular: Yaku rules can be enabled/disabled or added in the list below.

export const YAKU_RULES = [
  {
    id: "gokou",
    nameEn: "Five Brights",
    nameJa: "五光 (ごこう)",
    basePoints: 10,
    check(cards) {
      const brights = cards.filter(c => c.type === "hikari");
      return brights.length === 5 ? { matched: true, points: 15, cards: brights } : { matched: false };
    }
  },
  {
    id: "shikou",
    nameEn: "Four Brights",
    nameJa: "四光 (しこう)",
    basePoints: 8,
    check(cards) {
      const brights = cards.filter(c => c.type === "hikari");
      return brights.length === 4 ? { matched: true, points: 8, cards: brights } : { matched: false };
    }
  },
  {
    id: "sankou",
    nameEn: "Three Brights",
    nameJa: "三光 (さんこう)",
    basePoints: 5,
    check(cards) {
      const brights = cards.filter(c => c.type === "hikari");
      const hasRainBright = brights.some(c => c.id === "m11_1");
      // Must not contain the Willow Bright, and exactly 3 brights
      return (brights.length === 3 && !hasRainBright) ? { matched: true, points: 5, cards: brights } : { matched: false };
    }
  },
  {
    id: "inoshikacho",
    nameEn: "Boar, Deer & Butterfly",
    nameJa: "猪鹿蝶 (いのしかちょう)",
    basePoints: 5,
    check(cards) {
      const targetIds = ["m7_1", "m10_1", "m6_1"]; // Boar (Hagi), Deer (Kaede), Butterflies (Botan)
      const matchedCards = cards.filter(c => targetIds.includes(c.id) || targetIds.includes(c.animalTaneBaseId));
      if (matchedCards.length >= 3) {
        return { matched: true, points: 5, cards: matchedCards };
      }
      return { matched: false };
    }
  },
  {
    id: "akatan",
    nameEn: "Red Poetry Ribbons",
    nameJa: "赤短 (あかたん)",
    basePoints: 5,
    check(cards) {
      const matchedCards = cards.filter(c => c.ribbonType === "akatan");
      if (matchedCards.length >= 3) {
        const points = 5 + ((matchedCards.length - 3) * 2);
        return { matched: true, points, cards: matchedCards };
      }
      return { matched: false };
    }
  },
  {
    id: "aotan",
    nameEn: "Blue Ribbons",
    nameJa: "青短 (あおたん)",
    basePoints: 5,
    check(cards) {
      const matchedCards = cards.filter(c => c.ribbonType === "aotan");
      if (matchedCards.length >= 3) {
        const points = 5 + ((matchedCards.length - 3) * 2);
        return { matched: true, points, cards: matchedCards };
      }
      return { matched: false };
    }
  },
  {
    id: "tane",
    nameEn: "Animals",
    nameJa: "タネ",
    basePoints: 1,
    check(cards) {
      const taneCards = cards.filter(c => c.type === "tane");
      if (taneCards.length >= 5) {
        // 5 cards = 1 point, each additional card = +1 point
        const points = 1 + (taneCards.length - 5);
        return { matched: true, points, cards: taneCards };
      }
      return { matched: false };
    }
  },
  {
    id: "tanzaku",
    nameEn: "Ribbons",
    nameJa: "タン (短冊)",
    basePoints: 1,
    check(cards) {
      const tanzakuCards = cards.filter(c => c.type === "tanzaku");
      if (tanzakuCards.length >= 5) {
        // 5 cards = 1 point, each additional card = +1 point
        const points = 1 + (tanzakuCards.length - 5);
        return { matched: true, points, cards: tanzakuCards };
      }
      return { matched: false };
    }
  },
  {
    id: "kasu",
    nameEn: "Chaff",
    nameJa: "カス",
    basePoints: 1,
    check(cards) {
      const kasuCards = cards.filter(c => c.type === "kasu" || (c.id === "m9_1" && c.isCup)); // Sake cup counts as Kasu as well!
      if (kasuCards.length >= 10) {
        // 10 cards = 1 point, each additional card = +1 point
        const points = 1 + (kasuCards.length - 10);
        return { matched: true, points, cards: kasuCards };
      }
      return { matched: false };
    }
  },
  {
    id: "tsukimizake",
    nameEn: "Moon-viewing Sake",
    nameJa: "月見で一杯 (つきみでいっぱい)",
    basePoints: 5,
    check(cards) {
      const moon = cards.find(c => c.id === "m8_1"); // Susuki Moon
      const cup = cards.find(c => c.id === "m9_1"); // Sake Cup
      if (moon && cup) {
        return { matched: true, points: 5, cards: [moon, cup] };
      }
      return { matched: false };
    }
  },
  {
    id: "hanamizake",
    nameEn: "Flower-viewing Sake",
    nameJa: "花見で一杯 (はなみでいっぱい)",
    basePoints: 5,
    check(cards) {
      const curtain = cards.find(c => c.id === "m3_1"); // Cherry Curtain
      const cup = cards.find(c => c.id === "m9_1"); // Sake Cup
      if (curtain && cup) {
        return { matched: true, points: 5, cards: [curtain, cup] };
      }
      return { matched: false };
    }
  }
];

/**
 * Calculates all active Yakus for a set of captured cards
 * @param {Array} capturedCards - Cards captured by the player
 * @returns {Object} result containing list of matched yakus and total points
 */
export function calculateScore(capturedCards) {
  const matchedYakus = [];
  let totalPoints = 0;

  for (const rule of YAKU_RULES) {
    const result = rule.check(capturedCards);
    if (result.matched) {
      matchedYakus.push({
        id: rule.id,
        nameEn: rule.nameEn,
        nameJa: rule.nameJa,
        points: result.points,
        cards: result.cards
      });
      totalPoints += result.points;
    }
  }

  let cardSum = 0;
  capturedCards.forEach(c => {
    if (c.type === "hikari") cardSum += 20;
    else if (c.type === "tane") cardSum += 10;
    else if (c.type === "tanzaku") cardSum += 5;
    else if (c.type === "kasu") cardSum += 1;
  });

  return {
    yakus: matchedYakus,
    yakuPoints: totalPoints,
    cardPoints: cardSum,
    totalPoints: totalPoints + cardSum,
    traditionalScore: cardSum
  };
}
