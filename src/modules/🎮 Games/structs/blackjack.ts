import { AttachmentBuilder, ButtonBuilder, ButtonInteraction, Collection, Colors, EmbedBuilder, Message } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { continueBust, continueCheckDealerBJ, continueUserBJ, denyInsurance, doubleDownButton, hitButton, insuranceButton, splitButton, standButton } from "../buttons/blackjack";
import { SQL } from "../../../cache";
import { board } from "../canvas/blackjack";
import { numberWithCommas } from "../../../utils/util";

const validSuits = ["clubs", "diamonds", "hearts", "spades"];

const maxSplits = 3;

const resultNumLen = 35;

const sep = "━";

const xpBonus = 0.25;

const cards = new Collection<string, Card>();

export const games = new Collection<string, Blackjack>();

export class Blackjack {
    deck: Collection<string, Card>;
    hand: Hand;
    dealer: Hand;

    lastUpdate: number;
    msg: Message<boolean>;

    firstRoundIsOver: boolean;
    wasInsured: boolean;
    ended: boolean;

    bet: number;

    uid: string;
    gid: string;

    ddSplits: number[];

    actions: {action: string, amount: number}[];

    focusedSplit: number;

    template: Buffer;

    footerText: string;

    lastInteraction: ButtonInteraction;

    constructor(bet: number, uid: string, gid: string) {
        this.deck = new Collection(cards);
        this.bet = bet;
        this.uid = uid;
        this.gid = gid;
        this.ended = false;
        this.ddSplits = [];
        this.actions = [{action: "Bet", amount: bet}];
        this.hand = new Hand();
        this.dealer = new Hand(true);
        this.firstRoundIsOver = false;
        this.wasInsured = false;
        this.focusedSplit = 0;
        this.footerText = "";
        this._deal();
    }

    private _getRandDelete() {
        const c = this.deck.random();
        this.deck.delete(c.toString());
        return c;
    }

    private _deal() {
        const u1 = this._getRandDelete();
        const d1 = this._getRandDelete();
        const u2 = this._getRandDelete();
        const d2 = this._getRandDelete();

        this.hand.add(u1);
        this.hand.add(u2);
        this.dealer.add(d1);
        this.dealer.add(d2);
    }

    addGame(msg: Message<boolean>) {
        games.set(msg.id, this);
        this.lastUpdate = Date.now();
        this.msg = msg;
    }

    removeGame() {
        games.delete(this.msg.id);
    }

    async getButtons(): Promise<ButtonBuilder[]> {
        const cards: ButtonBuilder[] = [];

        //User has Blackjack imediately or blackjack on a target split.
        if(this.isBlackjack(this.hand, this.focusedSplit)) {
            this.footerText = this.focusedSplit + 1 === this.hand.getNumOfSplits()
              ? "Blackjack! Continue to reveal dealer's hand."
              : "Blackjack! Continue to next split.";
            return [ continueUserBJ() ];
        }
        
        //Dealer has possible Blackjack (10 value card)
        if(this.dealer.first().value === 10 && !this.firstRoundIsOver) {
            this.firstRoundIsOver = true;
            this.footerText = "Dealer has a possible Blackjack. Continue to see.";
            return [ continueCheckDealerBJ() ];
        }

        //Dealer has an Ace, but user cannot afford insurance.
        if(this.dealer.first().value === 1 && !await this.shouldOfferInsurance() && !this.firstRoundIsOver) {
            this.firstRoundIsOver = true;
            this.footerText = "Dealer has a possible Blackjack, but you cannot afford insurance.";
            return [ continueCheckDealerBJ() ];
        }

        //Dealer has an Ace, offer insurance.
        if(await this.shouldOfferInsurance() && !this.firstRoundIsOver) {
            this.firstRoundIsOver = true;
            this.footerText = "Dealer has a possible Blackjack. Would you like to purchase insurance?";
            return [ insuranceButton(), denyInsurance() ];
        }
          
        //Player has a value of 21, but has more than two cards in the current split.
        if(this.hand.getScore(this.focusedSplit) === 21 && this.hand.getCardsInSplit(this.focusedSplit) > 2) {
            this.footerText = "You have a value of 21. Stand to reveal dealer's hand.";
            return [ standButton() ];
        }

        //User busted on current split offer to continue.
        if(this.hand.getNumOfSplits() === this.focusedSplit || this.hand.getScore(this.focusedSplit) > 21) {
            this.footerText = "You busted!";
            return [ continueBust() ];
        }

        //Hit
        cards.push( hitButton() );

        //Stand
        cards.push( standButton() );

        //Double Down
        if(this.hand.getCardsInSplit(this.focusedSplit) === 2 && await this.canAffordDoubleDown())
            cards.push( doubleDownButton() );

        //Split
        if(this.hand.getCardsInSplit(this.focusedSplit) === 2 && this.hand.canSplit(this.focusedSplit) && this.hand.getNumOfSplits() < maxSplits && this.canAffordDoubleDown())
            cards.push( splitButton() );

        this.firstRoundIsOver = true;

        return cards;
    }

    hit() {
        const card = this._getRandDelete();
        this.hand.add(card, this.focusedSplit);
        this.hand.getScore(this.focusedSplit);
    }

    async canAffordInsurance(): Promise<boolean> {
        const [wallet, bank] = await SQL.Economy.getBalance(this.uid, this.gid);
        return wallet >= this.bet / 2;
    }

    async canAffordDoubleDown(): Promise<boolean> {
        const [wallet, bank] = await SQL.Economy.getBalance(this.uid, this.gid);
        return wallet >= this.bet;
    }

    async end(insurance = false) {
      this.ended = true;
      games.delete(this.msg.id);
  
      this.dealer.toggleHidden();
      while (this.dealer.getScore() < 17) {
          const card = this._getRandDelete();
          this.dealer.add(card);
      }

      const [wallet, bank] = await SQL.Economy.getBalance(this.uid, this.gid);

      const wins = [];

      let totalWinnings = 0;

      if(insurance && this.wasInsured) {
        totalWinnings += this.bet;
        wins.push({ winnings: this.bet, action: "Insurance" });
        await SQL.Economy.addBalance(this.uid, this.gid, this.bet);
      }

      if(!insurance) {
        for (let splitIndex = 0; splitIndex < this.hand.getNumOfSplits(); splitIndex++) {
            const { winner, winnings, bet } = await this.getWinner(splitIndex);
            totalWinnings += winnings;
            if(winnings) wins.push({ winnings, action: winnings === bet ? "Tie" : winnings === bet * 2.5 ? "Blackjack" : "Win"});

            /*let resultText = "";
    
            const playerScore = this.hand.getScore(splitIndex);
            const dealerScore = this.dealer.getScore();
            const playerBlackjack = this.isBlackjack(this.hand, splitIndex);
            const dealerBlackjack = this.isBlackjack(this.dealer);
    
            if (winner === "Player") {
                if (playerBlackjack && !dealerBlackjack) {
                    resultText = `You won with a blackjack! You won $${winnings}.`;
                } else if (dealerScore > 21) {
                    resultText = `You won because the dealer busted! You won $${winnings}.`;
                } else {
                    resultText = `You won with a score of ${playerScore} against the dealer's ${dealerScore}! You won $${winnings}.`;
                }
            } else if (winner === "Tie") {
                resultText = `It's a tie! You get back your bet of $${winnings}.`;
            } else {
                if (dealerBlackjack && !playerBlackjack) {
                    resultText = "You lost to the dealer's blackjack!";
                } else if (playerScore > 21) {
                    resultText = "You lost because you busted!";
                } else {
                    resultText = `You lost with a score of ${playerScore} against the dealer's ${dealerScore}!`;
                }
            }*/
        }
      }

      const totalLosses = this.actions.reduce((a, b) => a + b.amount, 0);

      const xp = await SQL.Economy.getXP(this.uid, this.gid);

      let upxp = totalLosses;
      if(totalWinnings - totalLosses > 0) upxp += (totalWinnings - totalLosses) * xpBonus;

      const nxp = await SQL.Economy.addXP(this.uid, this.gid, upxp);
  
      //this.footerText = results.join("\n") + `\nTotal winnings: $${totalWinnings}`;
      this.footerText = "Final Board";

      //⚜️ 💵

      const embed = new EmbedBuilder()
          .setColor(Colors.White)
          .setAuthor({ name: "Blackjack Results", iconURL: this.lastInteraction.user.displayAvatarURL() })


      const balString = numberWithCommas(wallet + totalLosses);
      const balEntry = `\`Wallet${" ".repeat(resultNumLen - balString.length - 6)}${balString}\``;

      const actionsStrings = this.actions.map(a => {
        const actLength = a.action.length;
        const amoStr = `-${numberWithCommas(a.amount)}`;
        const amountLength = amoStr.length;
        return `\`${a.action}${" ".repeat(resultNumLen - actLength - amountLength)}${amoStr}\``;
      });

      const winningsStrings = wins.map(w => {
        const actLength = w.action.length;
        const amoStr = `+${numberWithCommas(w.winnings)}`;
        const amountLength = amoStr.length;
        return `\`${w.action}${" ".repeat(resultNumLen - actLength - amountLength)}${amoStr}\``;
      });

      if(actionsStrings.length === 1 && !winningsStrings.length) winningsStrings.push(`\`${" ".repeat(resultNumLen)}\``);
      const winningString = winningsStrings.length ? `${winningsStrings.join("\n")}\n`: "";

      const seperator = `\`${sep.repeat(resultNumLen)}\``;

      const newBal = numberWithCommas(wallet + totalLosses + (totalWinnings - totalLosses));
      const newBalStr = `\`New Wallet${" ".repeat(resultNumLen - newBal.length - 10)}${newBal}\``;

      const totWinningsStr = numberWithCommas(totalWinnings - totalLosses);
      const totWinningFormatted = `\`Winnings${" ".repeat(resultNumLen - totWinningsStr.length - 8)}${totWinningsStr}\``;

      const xpStr = numberWithCommas(xp);
      const xpFormatted = `\`XP${" ".repeat(resultNumLen - xpStr.length - 2)}${xpStr}\``;

      const xpRegStr = numberWithCommas(totalLosses);
      const xpRegFormatted = `\`Bets${" ".repeat(resultNumLen - xpRegStr.length - 4)}${xpRegStr}\``;

      const xpBonusStr = numberWithCommas((totalWinnings - totalLosses) > 0 ? (totalWinnings - totalLosses) * xpBonus : 0);
      const xpBonusFormatted = `\`Wins +25%${" ".repeat(resultNumLen - xpBonusStr.length - 9)}${xpBonusStr}\``;

      let fillerRows = [];
      if(actionsStrings.length + winningsStrings.length > 2) {
        const fillerRowsNum = (actionsStrings.length + winningsStrings.length) - 2;
        fillerRows = Array(fillerRowsNum).fill(`\`${" ".repeat(resultNumLen)}\``);
      }

      const fillerString = fillerRows.length ? `${fillerRows.join("\n")}\n` : "";

      const newXP = numberWithCommas(nxp);
      const newXPStr = `\`New XP${" ".repeat(resultNumLen - newXP.length - 6)}${newXP}\``;

      const totXPStr = numberWithCommas(upxp);
      const totXPFormatted = `\`XP Gained${" ".repeat(resultNumLen - totXPStr.length - 9)}${totXPStr}\``;

      embed.addFields({
        name: "💵 Money",
        value: `${balEntry}\n${actionsStrings.join("\n")}\n${winningString}${seperator}\n${newBalStr}\n${totWinningFormatted}`,
        inline: true
      },{
        name: "⚜️ XP",
        value: `${xpFormatted}\n${xpRegFormatted}\n${xpBonusFormatted}\n${fillerString}${seperator}\n${newXPStr}\n${totXPFormatted}`,
        inline: true
      })
      
      const buf = await board(this.template, this, this.lastInteraction.user, this.footerText);
      const attachment = new AttachmentBuilder(buf, {name: "balance.png"});
      await this.lastInteraction.editReply({ files: [ attachment ], components: [], embeds: [ embed ] });


  }
  
    async getWinner(split = 0): Promise<{ winner: string; winnings: number; bet: number }> {
        const dealerScore = this.dealer.getScore();
        const dealerBlackjack = this.isBlackjack(this.dealer);
        const handScore = this.hand.getScore(split);
        const playerBlackjack = this.isBlackjack(this.hand, split);
        const bet = this.ddSplits.includes(split) ? this.bet * 2 : this.bet;

        if (handScore > 21) return { winner: "Dealer", winnings: 0, bet };
    
        if ((playerBlackjack && !dealerBlackjack) || (handScore <= 21 && (handScore > dealerScore || dealerScore > 21))) {
            const winnings = playerBlackjack ? bet * 2.5 : bet * 2;
            await SQL.Economy.addBalance(this.uid, this.gid, winnings);
            return { winner: "Player", winnings, bet };
        } else if (handScore === dealerScore && !playerBlackjack && !dealerBlackjack) {
            await SQL.Economy.addBalance(this.uid, this.gid, bet);
            return { winner: "Tie", winnings: bet, bet };
        } else if (dealerBlackjack && playerBlackjack) {
            return { winner: "Tie", winnings: 0, bet };
        } else {
            return { winner: "Dealer", winnings: 0, bet };
        }
    }
  

    async stand(): Promise<void> {
      if(this.hand.getNumOfSplits() > this.focusedSplit + 1)
        this.focusedSplit++;
      else {
        await this.end();
      }
    }

    async doubleDown() {
        await SQL.Economy.addBalance(this.uid, this.gid, -this.bet);
        this.ddSplits.push(this.focusedSplit);
        this.actions.push({action: "Double Down", amount: this.bet});
        this.hit();
        this.stand();
    }

    async split() {
        this.hand.split(this.focusedSplit);

        const c1 = this._getRandDelete();
        this.hand.add(c1, this.focusedSplit);

        const c2 = this._getRandDelete();
        this.hand.add(c2, this.hand.getNumOfSplits() - 1);
        
        this.actions.push({action: "Split", amount: this.bet});
        await SQL.Economy.addBalance(this.uid, this.gid, -this.bet);
    }

    isBlackjack(hand: Hand, split = 0): boolean {
        return hand.getScore(split) === 21 && hand.getCardsInSplit(split) === 2;
    }

    async shouldOfferInsurance(): Promise<boolean> {
        return this.dealer.first().value === 1 && await this.canAffordInsurance();
    }

    setTemplate(template: Buffer) {
        this.template = template;
    }
}

class Hand {
    private hand: Collection<number, Collection<string, Card>>;
    private hidden: boolean;
  
    constructor(hidden = false) {
      this.hand = new Collection();
      this.hand.set(0, new Collection());
      this.hidden = hidden;
    }
  
    first(): Card {
      return this.hand.get(0).first();
    }

    split(split = 0) {
      const focus = this.hand.get(split);
      const c2 = focus.last();

      this.hand.set(this.getNumOfSplits(), new Collection());
      this.hand.get(this.getNumOfSplits() - 1).set(c2.toString(), c2);
      focus.delete(c2.toString());
    }

    getSplit(split = 0) {
        return this.hand.get(split);
    }
  
    add(card: Card, split = 0): void {
      this.hand.get(split).set(card.toString(), card);
    }
  
    getScore(split = 0): number {
      const hand = this.hand.get(split);
      let score = 0;
      let hasAce = false;
  
      hand.forEach(card => {
        score += card.value;
        if (card.value === 1) {
          hasAce = true;
        }
      });
  
      if (hasAce && score <= 11) {
        score += 10;
      }
  
      return score;
    }
  
    getScoreString(): string {
      if (this.hidden) {
        return `${this.hand.first().first().getValueString()} + ?`;
      }
      return this.hand.map((h, i) => this.getScore(i)).join(" ");
    }
  
    getHandPaths(): string[][] {
      if (this.hidden) return [[this.hand.first().first().path, join(__dirname, "../assets/blackjack/cards/back.png")]];
      return this.hand.map(split => split.map(s => s.path));
    }
  
    canSplit(split = 0): boolean {
      if (this.hand.get(split).size !== 2) {
        return false;
      }
      const cards = Array.from(this.hand.get(split).values());
      return cards[0].value === cards[1].value;
    }
  
    getCardsInSplit(split = 0): number {
      return this.hand.get(split).size;
    }

    getNumOfSplits(): number {
        return this.hand.size;
    }

    getTotCardsInHand(): number {
        return this.hand.reduce((acc, split) => acc + split.size, 0);
    }

    toggleHidden(): void {
        this.hidden = !this.hidden;
    }
}

class Card {
    card: string;
    value: number;
    altValue: number;
    suit: string;
    path: string;

    constructor(card: string, value: number, altValue: number, suit: string, path: string) {
        this.card = card;
        this.value = value;
        this.altValue = altValue;
        this.suit = suit;
        this.path = path;
    }

    getValueString(): string {
        return this.value === this.altValue ? this.value.toString() : `${this.value}/${this.altValue}`;
    }

    toString(): string {
        return this.suit + this.card;
    }
}

const suits = readdirSync(join(__dirname, "../assets/blackjack/cards")).filter(s => validSuits.includes(s));
for (const suit of suits) {
  const c = readdirSync(join(__dirname, "../assets/blackjack/cards", suit));
  for (const card of c) {
    const [name, ext] = card.split(".");
    const [cardSuit, cardName] = name.split("");
    const [value, altValue] = cardName === "A"
      ? [1, 11]
      : isNaN(parseInt(cardName))
        ? [10, 10]
        : [parseInt(cardName), parseInt(cardName)];
    const path = join(__dirname, "../assets/blackjack/cards", suit, card);
    const C = new Card(cardName, value, altValue, suit, path);
    cards.set(C.toString(), C);
  }
}