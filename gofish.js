function Game() {
    this.deck = [];
    this.players = [];
    this.playing = true;
    this.init = function(people) {
        var game = this;
        game.fillCards();
        game.shuffle();
        _.each(people, function(player) {
            player.playGoFish(game);
        });
        game.deal();
        _.each(this.players, function(player) {
            player.removePairs(game);
        });
        this.players[0].showStartButton();
    }
    // var winner = this.findWinner();
    // console.log("The game has ended and " + winner.name +
    //     " is the winner with " + winner.score + " pairs.");
    this.deal = function() {
        var game = this;
        _(handSize).times(function() {
            _.each(game.players, function(player) {
                player.hand.push(game.deck.pop());
            });
        });
        _.each(game.players, function(player) {
            player.displayHandDown();
        });
    };
    this.shuffle = function() {
        this.deck = _.shuffle(this.deck);
    };
    this.fillCards = function() {
        for (var i = 0; i < cardsInSuit; i++) {
            this.deck.push(new Card("clubs", i));
            this.deck.push(new Card("hearts", i));
            this.deck.push(new Card("diamonds", i));
            this.deck.push(new Card("spades", i));
        }
    };
    this.findWinner = function() {
        return _.max(this.players, function(player) {
            return player.score;
        });
    };
    this.nextplayer = function(player) {
        return this.players[_.indexOf(this.players, player)];
    };
}

function Player(name, imgURL) {
    this.name = name;
    this.image = imgURL || defaultPic;
    this.hand = [];
    this.score = 0;
    $(".players").append(playerTemplate(this));
}
Player.prototype.playGoFish = function(game) {
    game.players.push(this);
};
Player.prototype.hasCard = function(card) {
    return _.indexOf(this.hand, _.findWhere(this.hand, {
        number: card.number
    }));
};
Player.prototype.goFishing = function(game) {
    this.hand.push(game.deck.pop());
};
Player.prototype.displayHand = function() {
    var handID = "#" + this.name + "Hand";
    $(handID).html("");
    _.each(this.hand, function(card, idx) {
        $(handID).append(cardTemplate(card));
    });
};
Player.prototype.displayHandDown = function() {
    var handID = "#" + this.name + "Hand";
    $(handID).html("");
    _.each(this.hand, function(card, idx) {
        $(handID).append(cardBack);
    });
};
Player.prototype.showStartButton = function() {
    var turnButton = "#" + this.name + "StartTurn";
    $(turnButton).removeClass("hidden");
}
Player.prototype.takeTurn = function(game) {
    var player = this;
    player.displayHand();
    if (game.playing) {
        player.removePairs(game);
        var person = _.filter(game.players, function(thisPlayer) {
            return player.name === thisPlayer.name;
        });
        player.ask(person[0], player.hand[0], game);
        var gotPair = player.removePairs(game);
        if (gotPair > 0) {
            player.takeTurn(game);
        } else {
            game.nextplayer(player).showStartButton();
        }
    }
};
Player.prototype.removePairs = function(game) {
    var numCards = this.hand.length;
    this.hand = _.chain(this.hand).groupBy(function(card) {
        return card.number;
    }).filter(function(group) {
        return group.length % 2 === 1;
    }).flatten().value();
    // var scoreDiff = ((numCards-this.hand.length)/2);
    var threes = _.chain(this.hand).groupBy(function(card) {
        return card.number;
    }).filter(function(group) {
        return group.length === 3;
    }).value();
    if (threes.length > 0) {
        console.log("you had three " + threes[0][1].number + "s");
        this.hand = _.chain(this.hand).groupBy(function(card) {
            return card.number;
        }).filter(function(group) {
            return group.length != 3;
        }).flatten().value();
        this.hand.push(threes[0][1]);
    }
    var scoreDiff = ((numCards - this.hand.length) / 2);
    this.score += scoreDiff;
    if (scoreDiff > 0) {
        console.log(this.name + ", you got a pair! Your score is now " +
            this.score);
    }
    if (this.hand.length === 0) {
        game.playing = false;
    }
    return scoreDiff;
};
Player.prototype.ask = function(player, card, game) {
    var cardIndex = player.hasCard(card);
    if (cardIndex === -1) {
        console.log("go fishing, " + this.name);
        this.goFishing(game);
    } else {
        //get the card from their hand
        this.hand.push(player.hand.splice(cardIndex, 1));
        this.removePairs(game);
    }
};

function Card(suit, number) {
    this.suit = suit;
    this.number = number;
    this.suitcode = cardCodes[suit];
    this.cardcode = cardCodes[number];
}
var gamePage = {
    init: function(argument) {
        gamePage.events();
        gamePage.styling();
    },
    events: function() {
        $("#addPlayer").on("click", function() {
            $("form").removeClass("hidden");
            $("#submit").removeClass("hidden");
        });
        $("#submit").on("click", function(event) {
            event.preventDefault();
            var newPlayer = new Player($("#playerName").val(),
                $("#playerURL").val());
            newPlayer.playGoFish(gamePage.thisGame);
            $("#playerName").val("");
            $("#playerURL").val("");
            if (gamePage.thisGame.players.length > 1) {
                $("#startGame").attr('disabled', false);
            }
        });
        $("#startGame").on("click", function(event) {
            $(".instructions").addClass("hidden");
            gamePage.thisGame.init();
        });
        $(".players").on("click", ".startTurn", function(argument) {
            $(this).addClass("hidden");
            var playerName = $(this).attr("id").replace("StartTurn","");
            var player = _.findWhere(gamePage.thisGame.players, {
                name: playerName
            });
            player.takeTurn(gamePage.thisGame);
        });
        $(".players").on("click", ".card", function() {});
    },
    styling: function() {
        gamePage.thisGame = new Game();
    },
    cardEvents: function() {},
    thisGame: {},
};
$("document").ready(function() {
    gamePage.init();
});
