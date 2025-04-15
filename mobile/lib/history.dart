import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/material.dart';
import 'package:mobile/escavalon_material.dart';

import 'game.dart';

FlutterSecureStorage? webTokenStorage;

class HistoryPage extends StatelessWidget {
  final FlutterSecureStorage? token;
  
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
  late List<_GameRecord> games;

  @override
  void initState() {
    super.initState();
    doneLoading = false;
    _loadGames();
  }

  void _loadGames() async {



    // setState(() {
    //   doneLoading = true;
    // });

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
                return ListView(
                  scrollDirection: Axis.vertical,
                  children: games,
                );
              } else {
                return const Text(
                  "Loading game history...",
                  style: TextStyle(
                    fontSize: 24,
                    // fontWeight: FontWeight.bold,
                    fontStyle: FontStyle.italic
                  ),
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
          Text(DateTime.parse(timeStarted).toLocal().toString(), style: TextStyle(fontStyle: FontStyle.italic),),
          Text("Victory for ${victor == Team.good ? "Good" : "Evil"}!", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),),
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



