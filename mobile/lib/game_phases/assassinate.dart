import 'package:flutter/material.dart';
import 'quest_phase_templates.dart';

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
    discussing = true;
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
      return VoteTemplate(
        displayText: "${widget.includesAssassin ? "Assassin, decide!" : "Minions, vote!"}\nDid you successfully assassinate Merlin?", 
        succeedText: "YES", 
        failText: "NO", 
        script: getAssassinateScript(), 
        onSucceed: () => widget.sendAssassinationResults(true), 
        onFail: ()=> widget.sendAssassinationResults(false),
      );
    }
  }

  List<(String, int)> getAssassinateScript() {
    List<(String, int)> script = []; 

    if (widget.includesAssassin) {
      script.add(("Assassin, it's up to you! Point to who you think is Merlin." , 3));
    } else {
      script.add(("Minions of Mordred, it's time to vote! Point to who you think is Merlin in 3", 1));
      script.add(("2", 1));
      script.add(("1.", 1));
    }

    script.add(("Assassinated player, are you Merlin?", 0));

    return script;
  }
}
