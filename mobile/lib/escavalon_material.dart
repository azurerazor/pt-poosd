import 'package:flutter/material.dart';

// includes UI components and constants for the Escavalon game
const Map<int, int> numEvil = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
};

const Map<String, String> roleDescriptions = {
  "Merlin": "Merlin is an optional Character on the Side of Good. He knows who the Evil players are, but if he is killed, the Evil players win. Adding Merlin into the game will mkae the Good side more powerful and win more ofen.",
  "Percival": "Percival is an optional Character on the Side of Good. Pervival's special power is knowledge of Merlin at the start of the game. Using Percival's knowledge wisely is key to protecting Merlin's identity. Adding Percival into the game will make the Good side more powerful and win more often.",
  "Assassin": "Assassin is an optional Character on the Side of Evil. They make the final decision on who to kill at the end of the game. If they kill Merlin, the Evil players win.",
  "Morgana": "Morgana is an optional Character on the Side of Evil. Morgana's special power",  
  "Oberon": "Oberon is an optional Character on the Side of Evil. He does not know who the Evil players are, but if he is killed, the Good players win.",
  "Mordred": "Mordred is an optional Character on the Side of Evil. He appears as Good to Merlin, but if he is killed, the Good players win.",
};

// source: https://api.flutter.dev/flutter/dart-ui/ColorFilter/ColorFilter.matrix.html
const ColorFilter greyscale = ColorFilter.matrix(<double>[
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]);

const Map<int, Map<int, int>> questRequirements = { // [numPlayers][questNum]
  5: {1: 2, 2: 3, 3: 2, 4: 3, 5: 3},
  6: {1: 2, 2: 3, 3: 4, 4: 3, 5: 4},
  7: {1: 2, 2: 3, 3: 3, 4: 4, 5: 4},
  8: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
  9: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
  10: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
};

class EscavalonCard extends StatelessWidget {
  final Widget child;

  const EscavalonCard({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: double.infinity,
        child: Card(
          shape: BeveledRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),  
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: child,
          ),
        )
    );
  }
}

class EscavalonButton extends StatelessWidget {
  final String? text;
  final Widget? child; // if text is null, use child
  final TextStyle? textStyle;
  final VoidCallback onPressed;

  const EscavalonButton({
    super.key,
    this.text,
    this.child,
    required this.onPressed,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          shape: BeveledRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        ),
        onPressed: onPressed,
        child: Builder(
          builder: (context) {
            if (text != null) {
              return Text(text!, style: textStyle);
            } else if (child != null) {
              return child!;
            } else {
              return SizedBox(
                width: 0,
                height: 0,
              );
            }
          }
        ),
      )
    );
  }
}


// Night Script
enum NightPhase {
  start,
  evil,
  merlin,
  percival,
  end,
}

List<(NightPhase, String, int)> getNightScript(int numEvil, bool? includesMerlin, bool? includesPercival, bool? includesOberon, bool? includesMordred) {
  List<(NightPhase, String, int)> result = [];

  result.add((NightPhase.start, "Starting Escavalon game. Everybody, close your eyes.", 3));

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

  result.add((NightPhase.end, "Everybody, open your eyes. The night is over. Good luck on your quests!", 3));

  return result;

}

List<(NightPhase, String, int)> _getEvilScript(int numEvil, bool? includesOberon) {
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

  List<(NightPhase, String, int)> result = [
    (NightPhase.evil, firstPart, 8), 
    (NightPhase.evil, "All Minions of Mordred, close your eyes and put your hands down.", 3)
  ];
  return result;
}

List <(NightPhase, String, int)> _getMerlinScript(int numEvil, bool? includesMordred) {
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

  List<(NightPhase, String, int)> result = [
    (NightPhase.merlin, firstPart, 8), 
    (NightPhase.merlin, "Merlin, close your eyes. All Minions of Mordred, put your hands down.", 3),
  ];
  return result;
}

List<(NightPhase, String, int)> _getPercivalScript() {
  List<(NightPhase, String, int)> result = [
    (NightPhase.percival, "Percival, open your eyes. Merlin and Morgana, keep your eyes closed and raise your hands. Percival, you should see 2 players with their hands raised.", 8),
    (NightPhase.percival, "Percival, close your eyes. Merlin and Morgana, put your hands down. ", 3),
  ];
  return result;
}
