import 'dart:convert';
import 'dart:io';

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

  Future<bool>? _gameSavedSuccessfully;
  bool _gameSaved = false;

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
        // TODO: implement Merlin assassination
        return Text("Assassinating Merlin...");
      case 3:




        return endGame(context);
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

  Widget endGame(BuildContext context) {
    if (globalToken != null) {
      _gameSavedSuccessfully = trySave();
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        EscavalonCard(
          child: Text(
            "Game Over!\nVictory for:\n${winner == Team.good ? "Good" : "Evil"}",
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          )
        ),

        // save game status
        Builder(
          builder: (context) {
            if (globalToken != null) {
              return saveStatus(context);
            } else {
              return const SizedBox.shrink();
            }
          }
        ),

        EscavalonButton(
          text: "Return to Home Screen",
          onPressed: () {
            bool returnToHome = true;

            if (globalToken != null && _gameSaved == false) {
              showDialog(
                context: context, 
                builder: (context) => AlertDialog(
                  title: const Text("Warning!"),
                  content: const Text("Game not saved. Are you sure you want to return to the home screen?"),
                  actions: <Widget>[
                    TextButton(
                      child: const Text("NO"),
                      onPressed: () {
                        returnToHome = false;
                        Navigator.of(context).pop();
                      },
                    ),
                    TextButton(
                      child: const Text("YES"),
                      onPressed: () {
                        returnToHome = true;
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              );
            }

            if (returnToHome) {
              Navigator.of(context).pop();
            }
          },
        ),
      // 
      ]
    );
  }

  FutureBuilder<bool> saveStatus(BuildContext context) {
    return FutureBuilder<bool>(
      future: _gameSavedSuccessfully,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Row(
            children: const <Widget>[
              Expanded(
                child: Text(
                  "Saving game...",
                  textAlign: TextAlign.center,
                ),
              ),
              CircularProgressIndicator(),
            ],
          );
        } else if (snapshot.hasError) {
          return Row(
            children: [
              Expanded(
                child: Text(
                  "Failed to save game: ${snapshot.error}",
                  textAlign: TextAlign.center,
                ),
              ),
              Icon(Icons.close),
            ],
          );
        } else if (snapshot.hasData && snapshot.data == true) {
          return Row(
            children: [
              Expanded(
                child: Text(
                  "Game saved successfully!",
                  textAlign: TextAlign.center,
                ),
              ),
              Icon(Icons.check),
            ],
          );
        } else {
          return Row(
            children: [
              Expanded(
                child: Text(
                  "Failed to save game.",
                  textAlign: TextAlign.center,
                ),
              ),
              Icon(Icons.close),
            ],
          );        
        }
      },
    );
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
      case 0: // TODO: reveal evil roles to eachother (check for Oberon)


        setState(() {
          nightPhase = 1;
        });
      case 1: // TODO: reveal evil roles to Merlin (check for Mordred)


      case 2: // TODO: reveal Merlin/Morgana to Percival

      default:
        throw ErrorDescription("Invalid night phase: $nightPhase");
    }

    return Text("Revealing pertinent information...");
  }
  
}

// TODO: send game results to server
// time started, winner, numPlayers, special roles used (probably just as 'RoleName':'True/False'), whether each round suceeded/failed
// remember to send time as UTC!
Future<bool> trySave() async {
  return true;
  // final HttpResponse response;

  // if (response.statusCode == 201) {
  //   return true;
  // } else {
  //   final dynamic responseBody = jsonDecode(response.body);
  //   if (responseBody is Map<String, dynamic>) {
  //     final String errorMessage = responseBody['message'] ?? "Unknown error";
  //     throw Exception(errorMessage);
  //   } else {
  //     throw Exception("Unknown error");
  //   }
  // }

}