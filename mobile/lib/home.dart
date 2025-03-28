import 'package:flutter/material.dart';

import 'escavalon_material.dart';
import 'game.dart';
import 'login.dart';
import 'register.dart';

class Home extends StatelessWidget {
  const Home({super.key});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Escavalon"),
        ),
        body: Center(
          child: Container ( 
            padding: const EdgeInsets.all(16.0),
            child: const _HomeContent(),
          ),
        ),
    );
  }
}

class _HomeContent extends StatefulWidget {
  const _HomeContent();

  @override
  State<_HomeContent> createState() => _HomeContentState();
}

class _HomeContentState extends State<_HomeContent> {
  String? _username;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        Builder(
          builder: (context) {
            if (_username != null) {
              return Text(
                "Welcome,\n $_username!",
                style: TextStyle(fontSize: 24),
              );
            } else {
              return const Text(
                "Welcome to\n Escavalon!",
                style: TextStyle(fontSize: 24),
              );
            }
          }
        ),

        SizedBox(height: 20,),

        EscavalonButton(
          text: 'New Game', 
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => GamePage()
              )
            );
          }
        ),

        EscavalonButton(
          text: 'Open Web App', 
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => GamePage()
              )
            );
          }
        ),

        Builder(
          builder: (context) {
            if (_username != null) { 
              return Column(
                children: <Widget>[
                  EscavalonButton(
                    text: "History", 
                    onPressed: ()=>{}
                  ),
                  EscavalonButton(
                    text: 'Logout', 
                    onPressed: ()=>{}
                  ),
                ],
              );
            } else {
              return Column(
                children: <Widget>[
                  EscavalonButton(
                    text: 'Login', 
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => LoginPage()
                        )
                      );
                    }
                  ),
                  EscavalonButton(
                    text: 'Register', 
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => RegisterPage()
                        )
                      );
                    }
                  ),
                ],
              );
            }
          }
        ),

      ],
    );
  }
}