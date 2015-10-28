var handSize = 7;

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
    for(var i=0;i<13;i++){
      this.deck.push(new Card("clubs",i));
      this.deck.push(new Card("hearts",i));
      this.deck.push(new Card("diamonds",i));
      this.deck.push(new Card("spades",i));
    }
  };
}

function Player(name){
  this.name = name;
  this.hand = [];
  this.score = 0;
  this.takeTurn = function (game) {
    var cards =[];
    if(game.playing){
      this.removePairs(game);
      _.each(this.hand, function (card) {
        cards.push(card.number +" of "+card.suit);
      });
      var card = prompt(
        "Hi, " + this.name + "which card index do you want to ask for?"+
        "Your cards are:" + cards
      );
      var personName = prompt("which person do you want to ask?");
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

}

function Card(suit,number){
  this.suit = suit;
  this.number = number;
}
