import 'package:flutter/material.dart';

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
              return Text("button content", style: textStyle);
            }
          }
        ),
      )
    );
  }
}
