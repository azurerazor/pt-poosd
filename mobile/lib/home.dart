import 'package:flutter/material.dart';

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
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,

            children: <Widget>[
              OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RegisterPage()
                    )
                  );
                }, 
                child: const Text('Register')
              ),
              OutlinedButton(

                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => LoginPage()
                    )
                  );
                }, 
                child: const Text('Login')
              ),
              OutlinedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GamePage()
                    )
                  );
                }, 
                child: const Text('Play as guest')
              ),

            ],
          ),
        ),
    );
  }
}