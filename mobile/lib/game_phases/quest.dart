import 'package:flutter/material.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';
import 'discussion.dart';
import 'vote.dart';
import 'mission.dart';

int _deltaQuestsWon = 0; // positive if good, negative if evil

class Quest extends StatefulWidget {
  final Function((Team, List<Team?>)) sendQuestResults;

  const Quest({
    super.key, 
    required this.sendQuestResults,
  });

  @override
  State<StatefulWidget> createState() => _QuestState();
}

class _QuestState extends State<Quest> {
  int currentQuest = 0; // 0 indexed. would be better to use 1 indexed but this is easier for different things
  int currentQuestPhase = 0;
  int numFailedVotes = 0;
  List<Team?> questResults = List<Team?>.generate(5, (int idx) => null, growable: false);
  bool twoFailsRequired = false;

  @override
  Widget build(BuildContext context) {   
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Align(
          alignment: Alignment.topCenter,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              EscavalonCard(
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
                      "Size of quest: ${questRequirements[globalNumPlayers]![currentQuest + 1]}\n${twoFailsRequired ? "Two traitors" : "One traitor"} required for mission to fail.\nNumber of failed proposals: $numFailedVotes.",
                      textAlign: TextAlign.center,
                    ),
                  ],
                )
              ),

              SizedBox(height: 20,),

              EscavalonCard(child: Row(
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
              )),
            ],
          ),
        ),

        Expanded(
          child: Center(
            child: Builder(builder: (context) {
              if (currentQuestPhase == 0) {
                return Discussion(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  twoFailsRequired: twoFailsRequired,
                  updateQuestPhase: updateQuestPhase,
                );
              }
                
              if (currentQuestPhase == 1) {
                return Vote(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  updateQuestPhaseWithPossibleRepeat: updateQuestPhaseWithPossibleRepeat
                );
              }

              // otherwise we're running the quest
              return Mission(
                numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                twoFailsRequired: twoFailsRequired,
                updateQuestPhaseWithQuestVictor: updateQuestPhaseWithQuestVictor,
              );
            }),
          )
        ),
      ],
    );

  }
  
  void updateQuestPhase() {
    setState(() {
      currentQuestPhase++;
      if (currentQuestPhase == 3) {
        currentQuest++;
        currentQuestPhase = 0;
      }

      if (currentQuest == 3 && globalNumPlayers > 6) {
        twoFailsRequired = true;
      } else {
        twoFailsRequired = false;
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

  void updateQuestPhaseWithPossibleRepeat(bool repeat) {
    if (repeat) {
      setState(() {
        numFailedVotes++;
        currentQuestPhase = 0;
      });

      if (numFailedVotes == 5) {
        updateQuestPhaseWithQuestVictor(Team.evil);
        return;
      }
    } else {
      setState(() {
        numFailedVotes = 0;
      });
      updateQuestPhase();
    }
  }

  void updateQuestPhaseWithQuestVictor(Team questVictor) {
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

    updateQuestPhase();
  }

}

