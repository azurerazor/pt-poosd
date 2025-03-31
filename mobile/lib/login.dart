import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:loading_indicator/loading_indicator.dart';
import 'package:mobile/escavalon_material.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Login"),
        ),
        body: Container(
          padding: EdgeInsets.all(16.0),
          child: _LoginForm()
        )
    );
  }
}

class _LoginForm extends StatefulWidget {
  @override
  State<_LoginForm> createState() {
    return _LoginFormState();
  }
}

class _LoginFormState extends State<_LoginForm> {
  String? username, password;
  final String usernameRequirements = "3-16 letters, numbers, underscores or hyphens";
  final String passwordRequirements = "Password must be at least 8 characters";
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final RegExp checkUsername = RegExp(r'^[A-Za-z0-9]+(?:[-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+$');

  Future<String>? _loginResponse;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center (
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              EscavalonCard(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    // username     
                    TextFormField(
                      decoration: const InputDecoration(
                        icon: Icon(Icons.person),
                        hintText: "cool-username",
                        labelText: "Username"
                      ),
                      onChanged: (String? value) {
                        setState(() {
                          username = value;
                        });                },

                      autovalidateMode: AutovalidateMode.onUnfocus,

                      validator: (String? value) {
                        if (
                          value == null || 
                          value.length < 3 ||
                          value.length > 16 || 
                          !checkUsername.hasMatch(value)
                        ) {
                          return usernameRequirements;
                        } else {
                          return null;
                        }
                      },
                    ),
                    // password
                    TextFormField(
                      obscureText: true,

                      decoration: const InputDecoration(
                        icon: Icon(Icons.key),
                        hintText: "password1234",
                        labelText: "Password"
                      ),

                      onChanged: (String? value) {
                        setState(() {
                          password = value;
                        });
                      },

                      autovalidateMode: AutovalidateMode.onUnfocus,

                      validator: (String? value) {
                        if (value == null || value.length < 8) {
                          return passwordRequirements;
                        } else {
                          return null;
                        }
                      },
                    ),

                  ],
                )
              ),

              SizedBox(height: 20,),

              EscavalonButton(
                text: 'Login', 
                onPressed: () {
                  if (_formKey.currentState!.validate() == false) return;

                  _loginResponse = tryLogin(username!, password!);

                  showDialog(
                    context: context, 
                    builder: (context) => buildResponse()
                  );
                },
              ),
            ],
          )
        ),
      )
    );
  }

  // Creates AlertDialog with FutureBuilder 
  // to show loading indicator while waiting for response
  // or allow further action depending on whether they registered successfully or not
  FutureBuilder<String> buildResponse() {
    return FutureBuilder<String>(
      future: _loginResponse,
      builder: (context, snapshot) {
        // If still loading, show loading indicator
        // very ugly for now but it works
        if (snapshot.connectionState == ConnectionState.waiting) {
          return AlertDialog(
            title: Text("Register"),
            content: LoadingIndicator(
              indicatorType: Indicator.ballPulse
            ),
          );
        // Oh no, didn't login successuly
        } else if (snapshot.hasError) {
          return AlertDialog(
            title: Text("Login"),
            content: Text("Error: ${snapshot.error}"),
            actions: <Widget>[
              TextButton(
                child: Text("OK"),
                onPressed: () {
                  Navigator.pop(context);
                },
              )
            ]
          );
        // Logged in successfully
        } else {
          return AlertDialog(
            title: Text("Login"),
            content: Text("Logged in successfully!\nUsername: $username"),
            actions: <Widget>[
              TextButton(
                child: const Text("OK"),
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
              )
            ]
          );
        }
      },
    );
  }
}

Future<String> tryLogin(String username, String password) async {
  final response = await http.post(
    Uri.parse('http://45.55.60.192:5050/api/login'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'username': username,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    return "Logged in successfully!";
  } else {
    throw Exception('Login failed :('); // TODO: return proper error message
  }
} 
