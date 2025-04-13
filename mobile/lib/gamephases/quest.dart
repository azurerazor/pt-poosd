import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';

int _deltaQuestsWon = 0; // positive if good, negative if evil

class QuestRunner extends StatefulWidget {
  final Function((Team, List<Team?>)) sendQuestResults;
  final FlutterTts flutterTts;

  const QuestRunner({
    super.key, 
    required this.sendQuestResults,
    required this.flutterTts,
  });

  @override
  State<StatefulWidget> createState() => _QuestRunnerState();
}

class _QuestRunnerState extends State<QuestRunner> {
  int currentQuest = 0; // 0 indexed. would be better to use 1 indexed but this is easier for different things
  int currentQuestPhase = 0;
  int numFailedVotes = 0;
  List<Team?> questResults = List<Team?>.generate(5, (int idx) => null, growable: false);

  @override
  Widget build(BuildContext context) {
    
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Align(
          alignment: Alignment.topCenter,
          child: EscavalonCard(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Text(
                  "Quest ${currentQuest + 1}",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                Text(
                  "Size of quest: ${questRequirements[globalNumPlayers]![currentQuest + 1]}\n${currentQuest != 3 ? "One traitor" : "Two traitors"} required for mission to fail.",
                  textAlign: TextAlign.center,
                ),
              ],
            )
          ),
        ),

        Expanded(
          child: Center(
            child: Builder(builder: (context) {
              if (currentQuestPhase == 0) {
                return _Discussion(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  twoFailsRequired: currentQuest == 3,
                  updateQuestRunnerPhase: updateQuestRunnerPhase,
                );
              }
                
              if (currentQuestPhase == 1) {
                return _Vote(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  updateQuestRunnerPhaseWithPossibleRepeat: updateQuestRunnerPhaseWithPossibleRepeat
                );
              }

              // otherwise we're running the quest
              return _Mission(
                numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                twoFailsRequired: currentQuest == 3,
                updateQuestRunnerPhaseWithQuestVictor: updateQuestRunnerPhaseWithQuestVictor,
              );
            }),
          )
        ),
      ],
    );

  }
  
  void updateQuestRunnerPhase() {
    setState(() {
      currentQuestPhase++;
      if (currentQuestPhase == 3) {
        currentQuest++;
        currentQuestPhase = 0;
      }
    });

    if (currentQuest == 5) {
      widget.sendQuestResults(
        (
          (_deltaQuestsWon > 0) ? Team.good : Team.evil, 
          questResults
        ),
      );
    }
  }

  void updateQuestRunnerPhaseWithPossibleRepeat(bool repeat) {
    if (repeat) {
      setState(() {
        numFailedVotes++;
        currentQuestPhase = 0;
      });

      if (numFailedVotes == 5) {
        updateQuestRunnerPhaseWithQuestVictor(Team.evil);
        return;
      }
    } else {
      setState(() {
        numFailedVotes = 0;
      });
      updateQuestRunnerPhase();
    }
  }

  void updateQuestRunnerPhaseWithQuestVictor(Team questVictor) {
    setState(() {
      questResults[currentQuest] = questVictor;
    });

    if (questVictor == Team.good) {
      _deltaQuestsWon++;
    } else {
      _deltaQuestsWon--;
    }

    if (_deltaQuestsWon.abs() >= 3) {
      widget.sendQuestResults(
        (
          (_deltaQuestsWon > 0) ? Team.good : Team.evil, 
          questResults
        ),
      );

      return;
    }

    updateQuestRunnerPhase();
  }

}

// TODO: implement discussion
class _Discussion extends StatelessWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function() updateQuestRunnerPhase;

  const _Discussion({
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestRunnerPhase,
  });

  @override
  Widget build(BuildContext context) {
    return Text("Discussion phase: $numOnQuest, $twoFailsRequired");
  }
}

// TODO: implement vote
class _Vote extends StatelessWidget {
  final int numOnQuest;
  final Function(bool) updateQuestRunnerPhaseWithPossibleRepeat;

  const _Vote({
    required this.numOnQuest,
    required this.updateQuestRunnerPhaseWithPossibleRepeat,
  });

  @override
  Widget build(BuildContext context) {
    return Text("Voting phase: $numOnQuest");
  }
}

// TODO: implement mission
class _Mission extends StatelessWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function(Team) updateQuestRunnerPhaseWithQuestVictor;

  const _Mission({
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestRunnerPhaseWithQuestVictor,
  });

  @override
  Widget build(BuildContext context) {
    return Text("Mission phase: $numOnQuest, $twoFailsRequired");
  }
}
