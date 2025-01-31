# Websocket API

When first connected the server will assign an ID and send the first message.

## Commands

### ListGames
Requests a list of available games.

**Request structure:**
```json
{
  "type": "Command",
  "command": "ListGames"
}
```

### CreateGame
Create a new game with the specified nickname.

**Request Structure:**
```json
{
  "type": "Command",
  "command": "CreateGame",
  "nickname": "Your nickname"
}
```

### JoinGame
Join an existing game with the specified game ID and nickname.

**Request Structure:**
```json
{
  "type": "Command",
  "command": "JoinGame",
  "game_id": 123,
  "nickname": "Your nickname"
}
```

### ChatMessage
Send a chat message.

**Request Structure:**
```json
{
  "type": "Command",
  "command": "ChatMessage",
  "message": "Your chat message"
}
```

### LeaveGame
Leave the current game. Will return an error if the client is not in a game.

**Request Structure:**
```json
{
  "type": "Command",
  "command": "LeaveGame"
}
```

## Game Actions

Once the client is in a game, the following actions are available:

### CreateDeck

Create a new deck at a location with the specified cards.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "CreateDeck"
  "x": 0,
  "y": 0,
  "card_inits": [["S", 0], ["S", 1], ["S", 2]]
}
```

### CreateStandardDecks

Create one or more standard decks at a location, optionally including jokers.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "CreateStandardDecks",
  "x": 0,
  "y": 0,
  "n": 2,
  "jokers": true
}
```

### CutDeck

Cut a deck into two at the specified depth and place the cut portion at a new location.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "CutDeck",
  "deck": 123,
  "n": 26,
  "x1": 10,
  "y1": 20
}
```

### FlipCardsFromDeck

Flip the top N cards from a deck and place them at a new location.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "FlipCardsFromDeck",
  "deck": 123,
  "n": 3,
  "x1": 10,
  "y1": 20
}
```

### ShuffleDeck

Shuffle a specified deck.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "ShuffleDeck",
  "deck": 123
}
```

### CollectDeck

Combine all cards at a location into a new deck at the specified location.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "CollectDeck",
  "deck_id": 456,
  "x1": 10,
  "y1": 20
}
```

### DrawCardFromTable

Draw a card from the table.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "DrawCardFromTable",
  "card": 789
}
```

### DrawCardsFromLocation

Draw all cards at a specific location.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "DrawCardsFromLocation",
  "x": 10,
  "y": 20
}
```

### DrawCardFromDeck

Draw the top card from a specified deck.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "DrawCardFromDeck",
  "deck": 123
}
```

### MoveEntity

Move an entity to a new location.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "MoveEntity",
  "entity": 456,
  "x1": 10,
  "y1": 20
}
```

### RemoveEntity

Remove an entity from the game.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "RemoveEntity",
  "entity": 456
}
```

### PlayHandCards

Play cards from a hand to a location, optionally face up or down.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "PlayHandCards",
  "cards": [1, 2, 3],
  "x": 10,
  "y": 20,
  "faceup": true
}
```

### PlayHandCardsToDeck

Play cards from a hand to a specified deck.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "PlayHandCardsToDeck",
  "cards": [1, 2, 3],
  "deck": 123
}
```

### ShowHandCards

Show or hide specific cards in a hand.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "ShowHandCards",
  "cards": [1, 2, 3],
  "shown": true
}
```

### AddHand

Add a new hand to the game with a specified nickname.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "AddHand",
  "nickname": "Player1"
}
```

### RemoveHand

Remove the current player's hand from the game.

**Request Structure:**
```json
{
  "type": "GameAction",
  "action": "RemoveHand"
}
```

## Responses

### AvailableGames

Sent when the client requests a list of available games.

**Response Structure:**
```json
{
  "type": "AvailableGames",
  "games": [
    {
      "game_id": 123,
      "player_ids": [2, 3, 4]
    }
  ]
}
```

### GameCreated

Sent when a new game is successfully created.

**Response Structure:**
```json
{
  "type": "GameCreated",
  "game_id": 456
}
```

### Ok

Sent to acknowledge successful receipt or execution of a client request.

**Response Structure:**
```json
{
  "type": "Ok"
}
```

### Error

Sent when an error occurs during request processing.

**Response Structure:**
```json
{
  "type": "Error",
  "message": "An error occurred"
}
```

### Delta

Sent to notify the client about changes in the game state.

**Response Structure:**
```json
{
  "type": "Delta",
  "changed": ...,
  "deleted": [
    123,
    456
  ]
}
```

### ChatMessage

Sent when a chat message is received in the game.

**Response Structure:**
```json
{
  "type": "ChatMessage",
  "client_id": 789,
  "message": "Hello, world!"
}
```

### GameClosed

Sent when the game is closed and no further actions can be taken.

**Response Structure:**
```json
{
  "type": "GameClosed"
}
```

### GameJoined

Sent when the client successfully joins a game.

**Response Structure:**
```json
{
  "type": "GameJoined",
  "game_id": 456
}
```

### GameLeft

Sent when the client leaves a game or the game is closed.

```json
{
  "type": "GameLeft"
}
```

## Game Delta

The game delta contains all game updates, anonymized to the receiver. The client can use this information to update its local state.

```json
{
  "type": "Delta",
  "changed": null,
  "deleted": null
}
```

```json
{
  "type": "Delta",
  "changed": {
    "entities": [1, 2, 3],
    "positions": {
      "1": {
        "x": 10,
        "y": 20,
        "z": 0,
        "rotation": 0
      },
      "2": {
        "x": 30,
        "y": 40,
        "z": 0,
        "rotation": 0
      },
      "3": {
        "x": 50,
        "y": 60,
        "z": 0,
        "rotation": 0
      }
    },
    "cards": {
      "1": {
        "type": "Card",
        "rank": 10,
        "suit": "S",
        "deck_id": 123
      },
      "2": {
        "type": "AnonCard",
        "deck_id": 123
      }
    },
    "decks": {
      "3": {
        "deck_id": 123,
        "card_count": 52
      }
    },
    "hands": {
      "4": {
        "nickname": "Player1",
        "client_id": 567,
        "cards": [
          {
            "type": "HandCard",
            "rank": 1,
            "suit": "S",
            "deck_id": 123
          },
          {
            "type": "AnonHandCard",
            "deck_id": 123
          }
        ]
      }
    }
  },
  "deleted": [5, 6]
}

```