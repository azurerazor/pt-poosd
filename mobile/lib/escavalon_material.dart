import 'package:flutter/material.dart';
import 'package:flutter_timer_countdown/flutter_timer_countdown.dart';
import 'package:flutter_tts/flutter_tts.dart';

// includes UI components and constants for the Escavalon game
const Map<int, int> numEvil = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
};

const Map<String, String> roleDescriptions = {
  "Merlin": "Merlin is an optional Character on the Side of Good. He knows who the Evil players are, but if he is killed, the Evil players win. Adding Merlin into the game will make the Good side more powerful and win more often.",
  "Percival": "Percival is an optional Character on the Side of Good. Pervival's special power is knowledge of Merlin at the start of the game. Using Percival's knowledge wisely is key to protecting Merlin's identity. Adding Percival into the game will make the Good side more powerful and win more often.",
  "Assassin": "Assassin is an optional Character on the Side of Evil. They make the final decision on who to kill at the end of the game. If they kill Merlin, the Evil players win.",
  "Morgana": "Morgana is an optional Character on the Side of Evil. Morgana's special power is that she appears as Merlin to Percival at the start of the game. Adding Morgana into the game will make the Evil side more powerful and win more ofen.",  
  "Oberon": "Oberon is an optional Character on the Side of Evil. He does not know who the Evil players are. Adding Oberon into the game will make the Good side more powerful and win more often.",
  "Mordred": "Mordred is an optional Character on the Side of Evil. He appears as Good to Merlin. Adding Mordred into the game will make the Evil side more powerful and win more ofen.",
};

// source: https://api.flutter.dev/flutter/dart-ui/ColorFilter/ColorFilter.matrix.html
const ColorFilter greyscale = ColorFilter.matrix(<double>[
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]);

const Map<int, Map<int, int>> questRequirements = { // [numPlayers][questNum]
  5: {1: 2, 2: 3, 3: 2, 4: 3, 5: 3},
  6: {1: 2, 2: 3, 3: 4, 4: 3, 5: 4},
  7: {1: 2, 2: 3, 3: 3, 4: 4, 5: 4},
  8: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
  9: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
  10: {1: 3, 2: 4, 3: 4, 4: 5, 5: 5},
};

class EscavalonPage extends StatelessWidget {
  final Widget child;

  const EscavalonPage({super.key, 
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primary,
        title: Text("Escavalon"),
      ),
      body: SizedBox.expand(
        child: Stack(
            children: <Widget>[
              Positioned.fill(
                child: Image.asset(
                  "assets/paper.jpg",
                  fit: BoxFit.cover,
                ),
              ),

              Container(
                padding: const EdgeInsets.all(16.0),
                child: child,
              )
            ],
          )
      )
    );
  }

}

class EscavalonCard extends StatelessWidget {
  final Widget child;

  const EscavalonCard({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: double.infinity,
        child: Card(
          shape: BeveledRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),  
          child: Container(
            padding: const EdgeInsets.all(16.0),
            child: child,
          ),
        )
    );
  }
}

class EscavalonButton extends StatelessWidget {
  final String? text;
  final Widget? child; // if text is null, use child
  final TextStyle? textStyle;
  final VoidCallback onPressed;

  const EscavalonButton({
    super.key,
    this.text,
    this.child,
    required this.onPressed,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          shape: BeveledRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        ),
        onPressed: onPressed,
        child: Builder(
          builder: (context) {
            if (text != null) {
              return Text(text!, style: textStyle);
            } else if (child != null) {
              return child!;
            } else {
              return SizedBox(
                width: 0,
                height: 0,
              );
            }
          }
        ),
      )
    );
  }
}

class ExtendableCountDownTimer extends StatefulWidget {
  final Duration initialDuration;
  final Duration extensionDuration;
  final VoidCallback? onTimerFinished;
  final String? extendButtonText;

  const ExtendableCountDownTimer({
    super.key, 
    required this.initialDuration,
    this.extensionDuration = const Duration(seconds: 5),
    this.onTimerFinished,
    this.extendButtonText,
  });

  @override
  State<ExtendableCountDownTimer> createState() => _ExtendableCountDownTimerState();
}

class _ExtendableCountDownTimerState extends State<ExtendableCountDownTimer> {
  late DateTime _endTime;

  @override
  void initState() {
    super.initState();
    _endTime = DateTime.now().add(widget.initialDuration);
  }

  void _extendTimer() {
    setState(() {
      _endTime = _endTime.add(widget.extensionDuration);
    });
  }

  void _onTimerFinished() {
    if (widget.onTimerFinished != null) {
      widget.onTimerFinished!();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        EscavalonCard(
          child: Center(
            child: TimerCountdown(
              format: CountDownTimerFormat.minutesSeconds,
              endTime: _endTime,
              onEnd: _onTimerFinished,
              timeTextStyle: TextStyle(fontSize: 24),
            ),
          )
        ),

        EscavalonButton(
          text: widget.extendButtonText ?? "Extend Timer",
          onPressed: () => _extendTimer(),
        ),
      ],
    );
  }
}

FlutterTts createTts() {
  FlutterTts result = FlutterTts();
  result.setLanguage("en-US");
  result.setSpeechRate(0.5);
  result.setVolume(1.0);
  return result;
}
