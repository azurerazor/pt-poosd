// import 'dart:convert';
// import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:mobile/escavalon_material.dart';

import 'game_phases/night.dart';
import 'game_phases/quest.dart';

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

    return EscavalonPage(child: Expanded(child: _GamePageContent()));
  }
}

class _GamePageContent extends StatefulWidget {
  const _GamePageContent();

  @override
  State<_GamePageContent> createState() => _GamePageContentState();
}

class _GamePageContentState extends State<_GamePageContent> {
  final startTime = DateTime.now();

  int gamePhase = 0; // 0: start, 1: quests (+ killing merlin), 2: end

  Team? victor;
  List<Team?> questResults = List<Team?>.generate(5, (int idx) => null, growable: false);

  Future<bool>? _gameSavedSuccessfully;
  final bool _gameSaved = false; 

  FlutterTts flutterTts = FlutterTts();

  @override
  void initState() {
    super.initState();
    flutterTts.setLanguage("en-US");
    flutterTts.setSpeechRate(0.5);
    flutterTts.setVolume(1.0);
  }

  @override
  Widget build(BuildContext context) {
    switch (gamePhase) {
      case 0:
        return Builder(
          builder: (context) => Night(
            updateGamePhase: () => setState(() {
              gamePhase++;
            }),
          )
        );
      case 1:
        return Builder(
          builder: (context) => Quest(
            sendQuestResults: (results) => setState(() {
              victor = results.$1;
              questResults = results.$2;
              gamePhase++;
            }),
          )
        );
      case 2:
        return endGame(context);
      default:
        throw ErrorDescription("Invalid game phase: $gamePhase");
    }
  }

  // not yet tested
  Widget endGame(BuildContext context) {
    // if user is logged in, we can try to save the game
    if (globalToken != null) {
      _gameSavedSuccessfully = trySave();
    }

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        EscavalonCard(
          child: Text(
            "Game Over!\nVictory for:\n${victor == Team.good ? "Good" : "Evil"}",
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

  // TODO: send game results to server
  // time started, victor, numPlayers, special roles used (probably just as 'RoleName':'True/False'), whether each round suceeded/failed
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
}
