import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:mobile/escavalon_material.dart';

enum Team { good, evil, }

FlutterSecureStorage? globalToken;
int globalNumPlayers = 5;
Map<String, bool> globalRolesSelected = {
  "Merlin": false,
  "Percival": false,
  "Assassin": false,
  "Morgana": false,
  "Oberon": false,
  "Mordred": false,
};

class GamePage extends StatelessWidget {
  final FlutterSecureStorage? token;
  final int numPlayers;
  final Map<String, bool> rolesSelected;
  
  const GamePage({
    super.key,
    required this.token,
    required this.numPlayers,
    required this.rolesSelected,
  });

  @override
  Widget build(BuildContext context) {
    globalToken = token;
    globalNumPlayers = numPlayers;
    globalRolesSelected = rolesSelected;

    return Scaffold(
      appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Escavalon"),
        ),
        body: Center(
          child: 
            Container(
              padding: const EdgeInsets.all(16.0), 
              child: _GamePageContent()
            )
        ),
    );
  }
}

class _GamePageContent extends StatefulWidget {
  const _GamePageContent();

  @override
  State<_GamePageContent> createState() => _GamePageContentState();
}

class _GamePageContentState extends State<_GamePageContent> {
  final startTime = DateTime.now();
  Team? winner;
  int questNum = 1;
  final Map<Team, int> numVictories = {
    Team.good: 0,
    Team.evil: 0,
  };

  int gamePhase = 0; // 0: start, 1: quests, 2: assassinate, 3: end
  List<Team?> questResults = List<Team?>.generate(5, (int idx) => null, growable: false);

  @override
  Widget build(BuildContext context) {
    switch (gamePhase) {
      case 0:
        return _Night(updateGamePhase: (newPhase) => setState(() {
          gamePhase = newPhase;
        }));
      case 1:
        return Text("Questing...");
      case 2:
        if (numVictories[Team.evil] == 3) {
          setState(() {
            gamePhase = 3;
          });
        }
        return Text("Assassinating Merlin...");
      case 3:
        return Text("Ending game...");
      default:
        throw ErrorDescription("Invalid game phase: $gamePhase");
    }
  }

  void runQuest(BuildContext context) {
    // TODO: say number of players
    // TODO: time discussion
    // TODO: vote for team (repeat until vote passes)
    // TODO: run quest and return results
  }

  void endGame(BuildContext context) {
    // TODO: implement Merlin assassination
    if (numVictories[Team.good] == 3) {

    }

    // TODO: send game results to server
    // time started, winner, numPlayers, special roles used, winners of each round
    // remember to send time as UTC!

    // return to home screen
    Navigator.of(context).pop();
  }
}

class _Night extends StatefulWidget {
  final Function(int) updateGamePhase;
  const _Night({
    required this.updateGamePhase,
  });

  @override
  State<StatefulWidget> createState() => _NightState();
}

class _NightState extends State<_Night> {
  int nightPhase = 0; // 0: evil, 1: merlin, 2: percival
  
  @override
  Widget build(BuildContext context) {
    switch (nightPhase) {
      case 0: // TODO: reveal evil roles to Merlin (check for Mordred)


        if (globalRolesSelected["Merlin"] == true) {
          setState(() {
            nightPhase = 1;
          });
        } else {
          widget.updateGamePhase(1);
        }
      case 1: // TODO: reveal Merlin/Morgana to Percival


      case 2: // TODO: reveal evil roles to eachother (check for Oberon)

      default:
        throw ErrorDescription("Invalid night phase: $nightPhase");
    }

    return Text("Revealing pertinent information...");
  }
  
}

