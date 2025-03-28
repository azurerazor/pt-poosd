import 'dart:async';
import 'dart:convert';
import 'login.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class RegisterPage extends StatelessWidget {
  const RegisterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Register"),
        ),
        body: Container(
          padding: EdgeInsets.all(40.0),
          child: _RegisterForm()
        )
    );
  }
}

class _RegisterForm extends StatefulWidget {
  @override
  State<_RegisterForm> createState() {
    return _RegisterFormState();
  }
}

class _RegisterFormState extends State<_RegisterForm> {
  String? username, email, password;
  final String usernameRequirements = "3-16 letters, numbers, underscores or hyphens";
  final String emailRequirements = "Enter a valid email address";
  final String passwordRequirements = "Password must be at least 8 characters";
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final RegExp checkUsername = RegExp(r'^[A-Za-z0-9]+(?:[-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+$');

  // Future<http.Response>? _futureResponse;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center (
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              TextFormField(
                decoration: const InputDecoration(
                  icon: Icon(Icons.person),
                  hintText: "super-cool-username",
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

              TextFormField(
                decoration: const InputDecoration(
                  icon: Icon(Icons.mail),
                  hintText: "you@gmail.com",
                  labelText: "Email"
                ),

                onChanged: (String? value) {
                  setState(() {
                    email = value;
                  });
                },

                autovalidateMode: AutovalidateMode.onUnfocus,

                validator: (String? value) {
                  if (value == null || value.length < 3) {
                    return emailRequirements;
                  } else {
                    return null;
                  }
                },
              ),
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

              OutlinedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate() == false) return;

                  showDialog(
                    context: context, 
                    builder: (context) => AlertDialog(
                      title: const Text("Register"),
                      content: Text("successfully registered with username: $username, email: $email, password: $password"),
                      actions: <Widget>[
                        TextButton(
                          child: const Text("OK"),
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => LoginPage()
                              )
                            );
                          },
                        ),
                      ]
                    ));
                  
                  
                }, 
                child: const Text('Register')
              ),
            ],
          )
        ),
      )
    );
  }
}


Future<Message> createMessage(String username, String email, String password) async {
  final response = await http.post(
    Uri.parse('https://example.com/api/register'),
    headers: <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: jsonEncode(<String, String>{
      'username': username,
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    return Message.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create message.');
  }
} 

class Message {
  final String message;
  const Message({
    required this.message,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      message: json['message'] as String,
    );
  }
}