import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';

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
                return _Discussion(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  twoFailsRequired: twoFailsRequired,
                  updateQuestPhase: updateQuestPhase,
                );
              }
                
              if (currentQuestPhase == 1) {
                return _Vote(
                  numOnQuest: questRequirements[globalNumPlayers]![currentQuest + 1]!,
                  updateQuestPhaseWithPossibleRepeat: updateQuestPhaseWithPossibleRepeat
                );
              }

              // otherwise we're running the quest
              return _Mission(
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

class _Discussion extends StatefulWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function() updateQuestPhase;

  const _Discussion({
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestPhase,
  });
  
  @override
  State<StatefulWidget> createState() => _DiscussionState();
}

class _DiscussionState extends State<_Discussion> {
  bool finishedSpeaking = false;

  @override
  void initState() {
    super.initState();
    readScript();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        ExtendableCountDownTimer(
          initialDuration: Duration(minutes: 7),
          extensionDuration: Duration(minutes: 5),
          onTimerFinished: onTimerFinished,
          extendButtonText: "Extend discussion by 5 minutes",
        ),

        SizedBox(height: 20),

        EscavalonButton(
          text: "Start vote",
          onPressed: () => {
            if (finishedSpeaking) widget.updateQuestPhase()
          },
        ),
      ],
    );
  }

  void onTimerFinished() async {
    setState(() {
      finishedSpeaking = false;
    });

    void startVote() async {
      await Future.delayed(Duration(seconds: 4));
      widget.updateQuestPhase();
    }

    FlutterTts thisTts = createTts();
    thisTts.setCompletionHandler(() {
      startVote();
    });
    
    thisTts.speak("Time has run out! Starting voting phase.");
  }

  void readScript() async {
    FlutterTts thisTts = createTts();

    thisTts.speak(
      "Create a team of ${widget.numOnQuest} players to go on this mission. ${widget.twoFailsRequired ? "Minions of Mordred, remember that you need two traitors to fail this mission for the entire quest to fail." : ""}"
    );    
    
    setState(() {
      finishedSpeaking = true;
    });
  }

}

class _Vote extends StatefulWidget {
  final int numOnQuest;
  final Function(bool) updateQuestPhaseWithPossibleRepeat;

  const _Vote({
    required this.numOnQuest,
    required this.updateQuestPhaseWithPossibleRepeat,
  });
  
  @override
  State<StatefulWidget> createState() => _VoteState();

}

class _VoteState extends State<_Vote> {
  bool finishedSpeaking = false;

  @override
  void initState() {
    super.initState();
    readScript();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        const Text(
          "Leader, propose a team.\nThen have everyone vote.\nDid the vote pass or fail?",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 20,),

        EscavalonButton(
          text: "PASS",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.updateQuestPhaseWithPossibleRepeat(false)
            }
          },
        ),
        
        EscavalonButton(
          text: "FAIL",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.updateQuestPhaseWithPossibleRepeat(true)
            }
          },        
        ),
      ],
    );
  }

  void readScript() async {
    FlutterTts thisTts = createTts();

    List<(String, int)> script = [("Leader, propose a team of $widget.numOnQuest players.", 30)];
    script.add(("Everybody, in 3", 1));
    script.add(("2", 1));
    script.add(("1", 1));
    script.add(("vote!", 5));
    script.add(("Did the vote pass or fail?", 0));

    for (var line in script) {
      await thisTts.speak(line.$1);
      Completer<void> completer = Completer<void>();
      
      thisTts.setCompletionHandler(() {
        completer.complete();
      });
      await completer.future;

      await Future.delayed(Duration(seconds: line.$2)); 
    }

    setState(() {
      finishedSpeaking = true;
    });
  }

}

class _Mission extends StatefulWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function(Team) updateQuestPhaseWithQuestVictor;

  const _Mission({
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestPhaseWithQuestVictor,
  });
  
  @override
  State<StatefulWidget> createState() => _MissionState();

}

class _MissionState extends State<_Mission> {
  bool finishedSpeaking = false;

  @override
  void initState() {
    super.initState();
    readScript();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(
          "Distribute vote cards.\nThen, reveal the votes.\nDid the quest succeed?",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 20,),

        EscavalonButton(
          text: "SUCCEED",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.updateQuestPhaseWithQuestVictor(Team.good)
            }
          },
        ),
        
        EscavalonButton(
          text: "FAIL",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.updateQuestPhaseWithQuestVictor(Team.evil)
            }
          },        
        ),
      ],
    );  
  }
  
  void readScript() async {
    FlutterTts thisTts = createTts();

    List<(String, int)> script = [("Distribute vote cards among players on mission.", 5)];
    script.add(("Loyal Servants of Arthur, vote success.", 1));
    script.add(("Minions of Mordred, you can choose to between chosing to suceed or fail.", 1));
    script.add(("1", 1));

    if (widget.twoFailsRequired) {
      script.add(("Remember, you need two fail votes for the entire quest to fail.", 7));
    } else {
      script.add(("Remember, even one fail vote will cause the entire quest to fail.", 7));
    }

    script.add(("Reveal the vote cards. Did the quest succeed or fail?", 0));

    for (var line in script) {
      await thisTts.speak(line.$1);
      Completer<void> completer = Completer<void>();
      
      thisTts.setCompletionHandler(() {
        completer.complete();
      });
      await completer.future;

      await Future.delayed(Duration(seconds: line.$2)); 
    }

    setState(() {
      finishedSpeaking = true;
    });
  }

}
