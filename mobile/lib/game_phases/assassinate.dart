import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:mobile/escavalon_material.dart';

class Assassinate extends StatefulWidget {
  final bool includesAssassin;
  final Function(bool) sendAssassinationResults;

  const Assassinate({
    super.key, 
    required this.includesAssassin,
    required this.sendAssassinationResults,
  });
  
  @override
  State<StatefulWidget> createState() => _AssassinateState();
}

class _AssassinateState extends State<Assassinate> {
  bool finishedSpeaking = false;
  bool discussing = true;

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    if (discussing) {
      return DiscussionTemplate(
        endDiscussion: () => setState(() {
          discussing = false;
        }), 
        continueText: "Assassinate!", 
        startingScript: "Minions of Mordred, you still have a chance to win! Victory is yours if you successfully assassinate Merlin. ${widget.includesAssassin ? "Assassin, you will make the final decision about who to kill." : "Once you are done discussing, you will vote on who to kill. If there is a tie, nobody gets killed."} ", 
        endingScript: "Time has run out! Starting assassination."
      );
    } else {
      return buildTrueAssassinationPhase();
    }
  }

  Widget buildTrueAssassinationPhase() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(
          "${widget.includesAssassin ? "Assassin, decide!" : "Minions, vote!"}\nDid you successfully assassinate Merlin?",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 20,),

        EscavalonButton(
          text: "YES",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.sendAssassinationResults(true)
            }
          },
        ),
        
        EscavalonButton(
          text: "NO",
          onPressed: () => {
            if (finishedSpeaking) {
              widget.sendAssassinationResults(false)
            }
          },        
        ),
      ],
    );
  }

  void readAssassinateScript() async {
    FlutterTts thisTts = createTts();

    List<(String, int)> script = []; 

    if (widget.includesAssassin) {
      script.add(("Assassin, it's up to you! Point to who you think is Merlin." , 3));
    } else {
      script.add(("Minions of Mordred, it's time to vote! Point to who you think is Merlin in 3", 1));
      script.add(("2", 1));
      script.add(("1.", 1));
    }

    script.add(("Assassinated player, are you Merlin?", 5));

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
