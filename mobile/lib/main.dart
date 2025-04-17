import 'package:flutter/material.dart';
import 'home.dart';

// Constants used throughtout app
// ignore: constant_identifier_names
const String URL = 'http://escavalon.quest:5050'; // with port (for making API calls)
const String webAppURL = 'http://escavalon.quest';

// used by both register and login
const String usernameRequirements = "3-16 letters, numbers, underscores or hyphens";
const String emailRequirements = "Enter a valid email address";
const String passwordRequirements = "Password must be at least 8 characters";
final RegExp checkUsername = RegExp(r'^[A-Za-z0-9]+(?:[-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+$');
final RegExp checkEmail = RegExp(r"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$");

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
          backgroundColor: const Color.fromARGB(255, 237, 229, 206),
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
