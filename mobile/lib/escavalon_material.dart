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
  final String text;
  final VoidCallback onPressed;

  const EscavalonButton({
    super.key,
    required this.text,
    required this.onPressed,
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
        child: Text(text),
      )
    );
  }
}