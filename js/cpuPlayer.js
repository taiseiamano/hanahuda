// CPU Player AI for Hanafuda (Hana-Awase)
// Decides which card to play from hand, and which match to select if multiple choices exist.

/**
 * Basic weights for Hanafuda card types
 */
const TYPE_WEIGHTS = {
  hikari: 100,
  tane: 50,
  tanzaku: 25,
  kasu: 5
};

/**
 * Analyzes cards and scores them to find the best move.
 */
export const CPUPlayer = {
  /**
   * Selects a card from the CPU's hand to play.
   * @param {Object} game - The current HanafudaGame instance
   * @returns {string} The card ID to play
   */
  selectCardToPlay(game) {
    const hand = game.hands.cpu;
    const field = game.field;
    
    if (hand.length === 0) return null;

    let bestCard = null;
    let maxScore = -9999;

    // Evaluate each card in hand
    for (const card of hand) {
      const matches = field.filter(c => c.month === card.month);
      let score = 0;

      if (matches.length > 0) {
        // Playing this card matches something!
        score += 200; // General bonus for making a match

        // Add weight for the played card and matching cards
        score += TYPE_WEIGHTS[card.type] || 0;
        
        matches.forEach(m => {
          score += TYPE_WEIGHTS[m.type] || 0;
          
          // Yaku synergy bonus
          score += this.evaluateSynergy(m, game.captured.cpu);
        });

        // Small random factor to prevent repetitive choices
        score += Math.random() * 5;
      } else {
        // Playing this card will just go to the field (no match)
        // We want to discard low-value cards, preferably Kasu (chaff)
        score -= TYPE_WEIGHTS[card.type] || 0;
        
        // Penalize discarding a high-value card that the opponent might match later
        if (card.type === 'hikari') score -= 150;
        if (card.type === 'tane') score -= 75;

        // Discard cards that aren't matching anything, favoring high-month (less likely to match or just trash)
        score += card.month * 0.5;
        score += Math.random() * 5;
      }

      if (score > maxScore) {
        maxScore = score;
        bestCard = card;
      }
    }

    return bestCard ? bestCard.id : hand[0].id;
  },

  /**
   * Selects which card to match when multiple choices exist on the field.
   * @param {Object} game - The current HanafudaGame instance
   * @param {Array} choices - The matching cards on the field
   * @returns {string} The card ID of the chosen field card
   */
  selectMatchChoice(game, choices) {
    if (choices.length === 0) return null;
    
    let bestChoice = choices[0];
    let maxScore = -9999;

    for (const choice of choices) {
      let score = TYPE_WEIGHTS[choice.type] || 0;
      
      // Check Yaku completion value
      score += this.evaluateSynergy(choice, game.captured.cpu);
      
      if (score > maxScore) {
        maxScore = score;
        bestChoice = choice;
      }
    }

    return bestChoice.id;
  },

  /**
   * Evaluates if capturing this card contributes significantly to a Yaku
   */
  evaluateSynergy(card, captured) {
    let synergy = 0;

    // Check Ino-Shika-Cho (Deer, Boar, Butterfly)
    const isInoshikacho = ["m7_1", "m10_1", "m6_1"].includes(card.id);
    if (isInoshikacho) {
      const alreadyCapturedCount = captured.filter(c => ["m7_1", "m10_1", "m6_1"].includes(c.id)).length;
      // The more we already have, the higher the urgency to grab the matching piece!
      synergy += (alreadyCapturedCount + 1) * 80;
    }

    // Check Blue Ribbons (Aotan)
    if (card.ribbonType === "aotan") {
      const alreadyCapturedCount = captured.filter(c => c.ribbonType === "aotan").length;
      synergy += (alreadyCapturedCount + 1) * 60;
    }

    // Check Red Poetry Ribbons (Akatan)
    if (card.ribbonType === "akatan") {
      const alreadyCapturedCount = captured.filter(c => c.ribbonType === "akatan").length;
      synergy += (alreadyCapturedCount + 1) * 60;
    }

    // Check Brights (Gokou/Shikou)
    if (card.type === "hikari") {
      const brightsCount = captured.filter(c => c.type === "hikari").length;
      synergy += (brightsCount + 1) * 100;
    }

    // Check Sake Cup (Tsukimi/Hanami Sake)
    if (card.id === "m9_1") {
      // Very high priority since it opens two strong Yaku
      synergy += 150;
      
      const hasMoon = captured.some(c => c.id === "m8_1");
      const hasCurtain = captured.some(c => c.id === "m3_1");
      if (hasMoon || hasCurtain) {
        synergy += 200; // Instant Yaku completion!
      }
    }

    // If opponent has Moon/Curtain, block their Sake Cup!
    if (card.id === "m9_1") {
      // Cup is always highly contested
      synergy += 50;
    }

    return synergy;
  }
};
