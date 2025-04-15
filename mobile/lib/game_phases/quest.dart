import 'package:flutter/material.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';

import 'assassinate.dart';
import 'quest_phase_templates.dart';

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
  int currentQuestPhase = 0; // 0 - discussion, 1 - vote, 2 - mission, -1 - assassinate
  int numFailedVotes = 0;
  List<Team?> questResults = List<Team?>.generate(5, (int idx) => null, growable: false);
  bool twoFailsRequired = false;

  @override
  void initState() {
    super.initState();
    _deltaQuestsWon = 0;
  }

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
                      "Size of quest: ${questRequirements[globalNumPlayers]![currentQuest + 1]}\n${twoFailsRequired ? "Two traitors" : "One traitor"} required for mission to fail.\nNumber of failed proposals: $numFailedVotes",
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
                return DiscussionTemplate(
                  endDiscussion: updateQuestPhase, 
                  continueText: "Start vote", 
                  startingScript: "Create a team of ${questRequirements[globalNumPlayers]![currentQuest + 1]!} players to go on this mission. ${twoFailsRequired ? "Minions of Mordred, remember that you need two traitors to fail this mission for the entire quest to fail." : ""}", 
                  endingScript: "Time has run out! Starting voting phase."
                );
              }
                
              if (currentQuestPhase == 1) {
                return VoteTemplate(
                  displayText: "Leader, propose a team.\nThen have everyone vote.\nDid the vote pass or fail?", 
                  succeedText: "PASS", 
                  failText: "FAIL", 
                  script: getVoteScript(questRequirements[globalNumPlayers]![currentQuest + 1]!), 
                  onSucceed: () => updateQuestPhaseWithPossibleRepeat(false), 
                  onFail: () => updateQuestPhaseWithPossibleRepeat(true),
                );
              }

              if (currentQuestPhase == 2) {
                return VoteTemplate(
                  displayText: "Distribute vote cards.\nThen, reveal the votes.\nDid the quest succeed?", 
                  succeedText: "SUCCEED", 
                  failText: "FAIL", 
                  script: getMissionScript(twoFailsRequired), 
                  onSucceed: () => updateQuestPhaseWithQuestVictor(Team.good), 
                  onFail: () => updateQuestPhaseWithQuestVictor(Team.evil), 
                );
              }

              // otherwise we're assassinating merlin
              return Assassinate(
                includesAssassin: globalRolesSelected["Assassin"]!, 
                sendAssassinationResults: (bool assassinationSuccessful) => widget.sendQuestResults((
                  assassinationSuccessful ? Team.evil : Team.good,
                  questResults
                ))
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
      if (_deltaQuestsWon > 0) {
        setState(() {
          currentQuestPhase = -1;  // assassinating merlin
        });
      } else {
        widget.sendQuestResults(
          (
            Team.evil, 
            questResults
          ),
        );
      }
    }
  }

  void updateQuestPhaseWithPossibleRepeat(bool repeat) {
    if (repeat) {
      setState(() {
        numFailedVotes++;
        currentQuestPhase = 0;
      });

      if (numFailedVotes == 5) {
        numFailedVotes = 0;
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
      if (_deltaQuestsWon > 0) {
        setState(() {
          currentQuestPhase = -1; // assassinating merlin
        });
      } else {
        widget.sendQuestResults(
          (
            Team.evil, 
            questResults
          ),
        );
      }

      return;
    }

    updateQuestPhase();
  }

}

