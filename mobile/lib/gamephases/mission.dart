import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:mobile/escavalon_material.dart';
import 'package:mobile/game.dart';

class Mission extends StatefulWidget {
  final int numOnQuest;
  final bool twoFailsRequired;
  final Function(Team) updateQuestPhaseWithQuestVictor;

  const Mission({
    super.key, 
    required this.numOnQuest,
    required this.twoFailsRequired,
    required this.updateQuestPhaseWithQuestVictor,
  });
  
  @override
  State<StatefulWidget> createState() => _MissionState();

}

class _MissionState extends State<Mission> {
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
