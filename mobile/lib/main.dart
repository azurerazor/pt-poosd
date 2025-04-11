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
        colorScheme: ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 27, 51, 90)),
      ),
      home: const Home(),
    );
  }
}
