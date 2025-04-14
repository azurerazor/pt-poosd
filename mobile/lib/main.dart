import 'package:flutter/material.dart';
import 'home.dart';

void main() {
  runApp(const Escavalon());
}

class Escavalon extends StatelessWidget {
  const Escavalon({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Escavalon',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 5, 8, 91)),
        fontFamily: "Abel",
        dialogTheme: DialogTheme(
          backgroundColor: const Color.fromARGB(255, 231, 223, 198),
          shape: BeveledRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: BorderSide(color: Theme.of(context).primaryColor, width: 1.0)
          ),
        ),
      ),
      home: const Home(),
    );
  }
}
