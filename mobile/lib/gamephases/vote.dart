import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import 'package:mobile/escavalon_material.dart';

class Vote extends StatefulWidget {
  final int numOnQuest;
  final Function(bool) updateQuestPhaseWithPossibleRepeat;

  const Vote({
    super.key, 
    required this.numOnQuest,
    required this.updateQuestPhaseWithPossibleRepeat,
  });
  
  @override
  State<StatefulWidget> createState() => _VoteState();

}

class _VoteState extends State<Vote> {
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
