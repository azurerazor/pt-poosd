import 'dart:convert';
import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/escavalon_material.dart';
import 'package:http/http.dart' as http;

import 'game.dart';
import 'main.dart';

FlutterSecureStorage webTokenStorage = FlutterSecureStorage();
DateFormat dateFormat = DateFormat("yyyy-MM-dd HH:mm:ss");

class HistoryPage extends StatelessWidget {
  final FlutterSecureStorage token;
  
  const HistoryPage({
    super.key,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    webTokenStorage = token;

    return EscavalonPage(child: _HistoryPageContent());
  }
  
}

class _HistoryPageContent extends StatefulWidget {
  const _HistoryPageContent();

  @override
  State<_HistoryPageContent> createState() => _HistoryPageContentState();
}

class _HistoryPageContentState extends State<_HistoryPageContent> {
  late bool doneLoading;
  List<_GameRecord> games = [];

  @override
  void initState() {
    super.initState();
    doneLoading = false;
    _loadGames();
  }

  void _loadGames() async {
    final String? token = await webTokenStorage.read(key: "token");

    final response = await http.get(
      Uri.parse('$URL/api/game_history/get'),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        HttpHeaders.cookieHeader: "token=${token!}"
      },
    );

    if (response.statusCode == 200) {
      List<dynamic> gamesList = jsonDecode(response.body)['games'];

      for (var info in gamesList) {
        games.add(
          _GameRecord(
            timeStarted: info['timeStarted'], 
            numPlayers: info['numPlayers'], 
            victor: info['goodWin'] ? Team.good : Team.evil, 
            questResults: (info['missionOutcomes'] as List<dynamic>)
                .map((outcome) {
              switch (outcome) {
                case false:
                  return Team.evil;
                case true:
                  return Team.good;
                case null:
                default:
                  return null;
              }
            }).toList(), 
            specialRoles: List<String>.from(info['roles'])
          )
        );
      }
    }
    
    setState(() => doneLoading = true,);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Align(
          alignment: Alignment.topCenter,
          child: EscavalonCard(
            child: const Text(
              "Game History",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            )
          ),
        ),
        Expanded(child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Builder(builder: (context) {
              if (doneLoading) {
                if (games.isEmpty) {
                  return Text(
                    "No game history found",
                    style: TextStyle(
                      fontSize: 24,
                      // fontWeight: FontWeight.bold,
                      fontStyle: FontStyle.italic
                    ),
                  );
                }

                return SizedBox(
                  height: 500,
                  child: ListView(
                    scrollDirection: Axis.vertical,
                    children: games
                  )
                );
              } else {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Loading game history",
                      style: TextStyle(
                        fontSize: 24,
                        // fontWeight: FontWeight.bold,
                        fontStyle: FontStyle.italic
                      ),
                    ),
                    SizedBox(width: 20,),
                    SizedBox(
                        width: 21,
                        height: 21,
                        child: CircularProgressIndicator()
                      ),
                  ],
                );
              }
            })
          ],
        )),
      ],
    );
  }

}

class _GameRecord extends StatelessWidget {
  final String timeStarted;
  final Team victor;
  final List<Team?> questResults;
  final int numPlayers;
  final List<String> specialRoles; 

  const _GameRecord({
    required this.timeStarted,
    required this.numPlayers,
    required this.victor,
    required this.questResults,
    required this.specialRoles,
  });

  @override
  Widget build(BuildContext context) {
    return EscavalonCard(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(dateFormat.format(DateTime.parse(timeStarted).toLocal()), style: TextStyle(fontStyle: FontStyle.italic),),
          SizedBox(height: 10,),
          Text("Victory for ${victor == Team.good ? "Good" : "Evil"}!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),),
          SizedBox(height: 10,),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(
              5,
              (index) {
                if (questResults[index] == Team.good) {
                  return Icon(Icons.check);
                } else if (questResults[index] == Team.evil) {
                  return Icon(Icons.close);
                }

                return Icon(Icons.question_mark);
              },
            ),
          ),
          SizedBox(height: 10,),
          Text("Number of players: $numPlayers"),
          Text("Special Roles included: ${_getSpecialRoles()}"),
        ],
      )
    );
  }

  String _getSpecialRoles() {
    if (specialRoles.isEmpty) {
      return "none";
    } else if (specialRoles.length == 1) {
      return specialRoles[0];
    } else if (specialRoles.length == 2) {
      return "${specialRoles[0]} and ${specialRoles[1]}";
    } else {
      return "${(specialRoles.sublist(0, specialRoles.length - 1)).join(', ')}, and ${specialRoles.last}"; 
    }
  }
}



