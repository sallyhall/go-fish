var handSize = 4;
var cardsInSuit = 13;

function Game(){
  this.deck = [];
  this.players = [];
  this.playing = true;
  this.init = function (people) {
    var game = this;
    game.fillCards();
    game.shuffle();
    _.each(people,function (player) {
      player.playGoFish(game);
    });
    game.deal();
    _.each(this.players, function(player) {
      player.removePairs(game);
    });
    while(this.playing){
      _.each(this.players, function(player) {
        player.takeTurn(game);
      });
    }
    var winner = this.findWinner();
    console.log("The game has ended and "+winner.name+" is the winner with "+ winner.score +" pairs.");
  };
  this.deal = function () {
    var game = this;
    _(handSize).times(function(){
      _.each(game.players, function (player) {
        player.hand.push(game.deck.pop());
      });
    });
  };
  this.shuffle = function () {
    this.deck = _.shuffle(this.deck);
  };
  this.fillCards = function () {
    for(var i=0;i<cardsInSuit;i++){
      this.deck.push(new Card("clubs",i));
      this.deck.push(new Card("hearts",i));
      this.deck.push(new Card("diamonds",i));
      this.deck.push(new Card("spades",i));
    }
  };
  this.findWinner = function(){
    return _.max(this.players, function(player){
      return player.score;
    });
  };
}

function Player(name){
  this.name = name;
  this.hand = [];
  this.score = 0;
  this.takeTurn = function (game) {
    console.log(this.name+"'s turn:'");
    if(game.playing){
      this.removePairs(game);
      var card = Number(prompt(
        "Hi, " + this.name + ". Which card number do you want to ask for?"+
        " Your cards are:" + this.displayHand()
      ))-1;
      var personName = prompt("Which person do you want to ask?");
      var person = _.filter(game.players,function (player) {
        return player.name === personName;
      });
      this.ask(person[0],this.hand[card],game);
      var gotPair = this.removePairs(game);
      if(gotPair>0){
        this.takeTurn(game);
      }
    }
  };
  this.ask = function (player,card,game) {
    var cardIndex = player.hasCard(card);
    if (cardIndex===-1){
      console.log("go fishing, "+this.name);
      this.goFishing(game);
    }
    else{
      //get the card from their hand
      this.hand.push(player.hand.splice(cardIndex,1));
      this.removePairs(game);
    }
  };
  this.playGoFish = function(game){
    game.players.push(this);
  };
  this.hasCard = function (card) {
    return _.indexOf(this.hand, _.findWhere(this.hand,{number: card.number}));
  };
  this.removePairs = function (game) {
    var numCards = this.hand.length;
    this.hand = _.chain(this.hand)
    .groupBy(function(card){return card.number;})
    .filter(function(group){return group.length%2===1;})
    .flatten()
    .value();
    var scoreDiff = ((numCards-this.hand.length)/2);
    this.score+= scoreDiff;
    if (scoreDiff>0){
      console.log(this.name + ", you got a pair! Your score is now "+this.score);
    }
    if (this.hand.length===0){
      game.playing = false;
    }
    return scoreDiff;
  };
  this.goFishing = function(game){
    this.hand.push(game.deck.pop());
    var gotPair = this.removePairs(game);
    if (gotPair>0){
      this.takeTurn(game);
    }
  };
  this.displayHand = function(){
    var text = "";
    _.each(this.hand, function (card,idx) {
      var num = idx+1;
      var cardText = "";
      switch (card.number){
          case 0:
            cardText = "Ace";
            break;
          case 1:
            cardText = "King";
            break;
          case 11:
            cardText = "Jack";
            break;
          case 12:
            cardText = "Queen";
            break;
          default:
            cardText = card.number;
          }
      text+="\n "+num+": "+cardText +" of "+card.suit;
    });
    return text;
  };

}

function Card(suit,number){
  this.suit = suit;
  this.number = number;
}
