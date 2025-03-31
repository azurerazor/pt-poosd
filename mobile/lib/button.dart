import 'package:flutter/material.dart';

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