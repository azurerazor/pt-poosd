import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:mobile/escavalon_material.dart';

class DiscussionTemplate extends StatefulWidget {
  final VoidCallback endDiscussion;
  final String continueText, startingScript, endingScript;

  const DiscussionTemplate({
    super.key,
    required this.endDiscussion,
    required this.continueText,
    required this.startingScript,
    required this.endingScript,
  });

  @override
  State<StatefulWidget> createState() => _DiscussionTemplateState();
}

class _DiscussionTemplateState extends State<DiscussionTemplate> {
  bool isSpeaking = false;
  late FlutterTts thisTts;

  @override
  void initState() {
    super.initState();
    thisTts = createTts();
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
          onTimerFinished: endDiscussion,
          extendButtonText: "Extend discussion by 5 minutes",
        ),

        SizedBox(height: 20),

        EscavalonButton(
          text: widget.continueText,
          onPressed: () => {
            if (!isSpeaking) widget.endDiscussion()
          },
        ),
      ],
    );
  }
  
  void readScript() async {
    setState(() {
      isSpeaking = true;
    });

    thisTts.setCompletionHandler(
      () => setState(() {
        isSpeaking = false;
      })
    );

    thisTts.speak(widget.startingScript);    
  }
  
  void endDiscussion() async {
    setState(() {
      isSpeaking = true;
    });

    void startVote() async {
      await Future.delayed(Duration(seconds: 2));
      widget.endDiscussion();
    }

    FlutterTts thisTts = createTts();
    thisTts.setCompletionHandler(() {
      startVote();
    });
    
    thisTts.speak(widget.endingScript);
  }

  @override
  void dispose() {
    thisTts.stop();
    super.dispose();
  }
}

class VoteTemplate extends StatefulWidget {
  final String displayText, succeedText, failText;
  final List<(String, int)> script;
  final VoidCallback onSucceed, onFail;

  const VoteTemplate({
    super.key, 
    required this.displayText,
    required this.succeedText,
    required this.failText,
    required this.script,
    required this.onSucceed,
    required this.onFail,
  });
  
  @override
  State<StatefulWidget> createState() => _VoteTemplateState();

}

class _VoteTemplateState extends State<VoteTemplate> {
  bool isSpeaking = false;
  late FlutterTts thisTts;

  @override
  void initState() {
    super.initState();
    thisTts = createTts();
    readScript();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Text(
          widget.displayText,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 20,),

        EscavalonButton(
          text: widget.succeedText,
          onPressed: () => {
            if (!isSpeaking) {
              widget.onSucceed()
            }
          },
        ),
        
        EscavalonButton(
          text: widget.failText,
          onPressed: () => {
            if (!isSpeaking) {
              widget.onFail()
            }
          },        
        ),
      ],
    );
  }

  void readScript() async {
    setState(() {
      isSpeaking = true;
    });

    for (var line in widget.script) {
      await thisTts.speak(line.$1);
      Completer<void> completer = Completer<void>();
      
      thisTts.setCompletionHandler(() {
        completer.complete();
      });
      await completer.future;

      await Future.delayed(Duration(seconds: line.$2)); 
    }

    setState(() {
      isSpeaking = false;
    });
  }

  @override
  void dispose() {
    thisTts.stop();
    super.dispose();
  }
}

List<(String, int)> getMissionScript(bool twoFailsRequired) {
  List<(String, int)> script = [("Distribute vote cards among players on mission.", 2)];
  script.add(("Loyal Servants of Arthur, vote success.", 1));
  script.add(("Minions of Mordred, you can either succeed or fail.", 1));
  script.add(("1", 1));

  if (twoFailsRequired) {
    script.add(("Remember, you need two fail votes for the entire quest to fail.", 2));
  } else {
    script.add(("Remember, even one fail vote will cause the entire quest to fail.", 2));
  }

  script.add(("Reveal the vote cards. Did the quest succeed or fail?", 0));

  return script;
}

List<(String, int)> getVoteScript(int numOnQuest) {
    List<(String, int)> script = [("Leader, propose a team of $numOnQuest players.", 2)];
    script.add(("Everybody, in 3", 1));
    script.add(("2", 1));
    script.add(("1", 1));
    script.add(("vote!", 2));
    script.add(("Did the vote pass or fail?", 0));

  return script;
}