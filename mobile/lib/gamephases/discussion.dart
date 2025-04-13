import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:mobile/escavalon_material.dart';

class Discussion extends StatefulWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function() updateQuestPhase;

  const Discussion({
    super.key, 
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestPhase,
  });
  
  @override
  State<StatefulWidget> createState() => _DiscussionState();
}

class _DiscussionState extends State<Discussion> {
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
