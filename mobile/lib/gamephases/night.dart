import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';

class Night extends StatefulWidget {
  final Function(int) updateGamePhase;
  final FlutterTts flutterTts;

  const Night({
    super.key, 
    required this.updateGamePhase,
    required this.flutterTts,
  });

  @override
  State<StatefulWidget> createState() => _NightState();
}

class _NightState extends State<Night> {
  int scriptIdx = 0;
  // not yet used : will be used to determine appearance of the screen (e.g. display merlin during merlin phase)
  // _NightPhase _nightPhase = _NightPhase.start;
  List<(_NightPhase, String, int)>? script;

  @override
  void initState() {
    super.initState();
    widget.flutterTts.setCompletionHandler(() {
      updateIndex();
    });

    script = _getNightScript(
      numEvil[globalNumPlayers] ?? 2,
      globalRolesSelected["Merlin"],
      globalRolesSelected["Percival"],
      globalRolesSelected["Oberon"],
      globalRolesSelected["Mordred"],
    );
  }
  
  @override
  Widget build(BuildContext context) {
    if (scriptIdx == script!.length) {
      return Text(
        "Night phase complete. Good luck on your quests!",
        style: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
        textAlign: TextAlign.center,
      );
    }

    speak(script![scriptIdx].$2);
    return Text(
      script![scriptIdx].$2,
      style: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
      ),
      textAlign: TextAlign.center,
    );
  }
  
  Future<void> speak(String text) async {
    await widget.flutterTts.speak(text);
  }

  Future<void> updateIndex() async {
    await Future.delayed(Duration(seconds: script![scriptIdx].$3));

    setState(() {
      scriptIdx++;
    });

    // once we're done with the script, we can move on to the next phase of the game
    if (scriptIdx == script!.length) {
      widget.updateGamePhase(1);
    }
  }

}

enum _NightPhase {
  start,
  evil,
  merlin,
  percival,
  end,
}

// script builder for the night phase
List<(_NightPhase, String, int)> _getNightScript(int numEvil, bool? includesMerlin, bool? includesPercival, bool? includesOberon, bool? includesMordred) {
  List<(_NightPhase, String, int)> result = [];

  result.add((_NightPhase.start, "Starting Escavalon game. Everybody, close your eyes.", 3));

  result.addAll(
    _getEvilScript(numEvil, includesOberon)
  );

  if (includesMerlin == true) {
    result.addAll(
      _getMerlinScript(numEvil, includesMordred)
    );
  }

  if (includesPercival == true) {
    result.addAll(
      _getPercivalScript()
    );
  }

  result.add((_NightPhase.end, "Everybody, open your eyes. The night is over. Good luck on your quests!", 3));

  return result;

}

List<(_NightPhase, String, int)> _getEvilScript(int numEvil, bool? includesOberon) {
  String firstPart = "All Minions of Mordred, ";

  if (includesOberon == true) {
    firstPart += "excluding Oberon, ";
  }

  firstPart += "open your eyes, raise your hands, and look for each other. ";

  numEvil -= 1; // they don't see themselves
  if (includesOberon == true) {
    numEvil -= 1; // they don't see Oberon
  }
  
  if (numEvil == 0) {
    firstPart += "You should see no other players with their hands raised. ";
  } else if (numEvil == 1) {
    firstPart += "You should see $numEvil other player with their hand raised. ";
  } else if (numEvil > 1) {
    firstPart += "You should see $numEvil other players with their hands raised. ";
  }

  List<(_NightPhase, String, int)> result = [
    (_NightPhase.evil, firstPart, 8), 
    (_NightPhase.evil, "All Minions of Mordred, close your eyes and put your hands down.", 3)
  ];
  return result;
}

List <(_NightPhase, String, int)> _getMerlinScript(int numEvil, bool? includesMordred) {
  String firstPart = "Merlin, open your eyes. All Minions of Mordred, ";

  if (includesMordred == true) {
    firstPart += "except for Mordred himself, ";
  }

  firstPart += "keep your eyes closed and raise your hands. ";

  if (includesMordred == true) {
    numEvil -= 1;
  }

  if (numEvil == 1) {
    firstPart += "Merlin, you should see $numEvil player with their hand raised. ";
  } else if (numEvil > 1) {
    firstPart += "Merlin, you should see $numEvil players with their hands raised. ";
  }

  List<(_NightPhase, String, int)> result = [
    (_NightPhase.merlin, firstPart, 8), 
    (_NightPhase.merlin, "Merlin, close your eyes. All Minions of Mordred, put your hands down.", 3),
  ];
  return result;
}

List<(_NightPhase, String, int)> _getPercivalScript() {
  List<(_NightPhase, String, int)> result = [
    (_NightPhase.percival, "Percival, open your eyes. Merlin and Morgana, keep your eyes closed and raise your hands. Percival, you should see 2 players with their hands raised.", 8),
    (_NightPhase.percival, "Percival, close your eyes. Merlin and Morgana, put your hands down. ", 3),
  ];
  return result;
}
