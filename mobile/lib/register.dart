import 'dart:async';
import 'dart:convert';

import 'package:loading_indicator/loading_indicator.dart';
import 'escavalon_material.dart';
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
  final RegExp checkEmail = RegExp(r"^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$");

  bool _isLoading = false;

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
                  children: [
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
                        });               
                      },

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
                    // email
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
                        if (
                          value == null || 
                          value.length < 3 ||
                          !checkEmail.hasMatch(value)
                        ) {
                          return emailRequirements;
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

              Builder(
                builder: (context) {
                  if (_isLoading == false) {
                    return EscavalonButton(
                      text: 'Register', 
                      onPressed: () {
                        if (_formKey.currentState!.validate() == false) return;
                        _tryRegister(username!, email!, password!);
                      },
                    );
                  } else {
                    return EscavalonButton(
                      child: SizedBox(
                        width: 21,
                        height: 21,
                        child: LoadingIndicator(
                          indicatorType: Indicator.ballPulse
                        ),
                      ),
                      onPressed: () => {} // do nothing
                    );
                  }
                }
              ),

            ],
          )
        ),
      )
    );
  }

  Future<void> _tryRegister(String username, String email, String password) async {
    setState(() {
      _isLoading = true;
    });

    final response = await http.post(
      Uri.parse('http://45.55.60.192:5050/api/register'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      return _processRegisterResponse(null);
    } else {
      final dynamic responseBody = jsonDecode(response.body);
      if (responseBody is Map<String, dynamic>) {
        return _processRegisterResponse(responseBody['message'] ?? "Unknown error");
      } else {
        return _processRegisterResponse("Unknown error");
      }
    }
  }  

  void _processRegisterResponse(String? message) {
    setState(() {
      _isLoading = false;
    });

    if (message != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Error registering"),
          content: Text(message),
          actions: <Widget>[
            TextButton(
              child: Text("OK"),
              onPressed: () {
                Navigator.pop(context);
              },
            )
          ]
        ),
      );
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Registered successfully!"),
          content: Text("Username: $username\nEmail: $email"),
          actions: <Widget>[
            TextButton(
              child: Text("Proceed to login"),
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => LoginPage(),
                  ),
                );
              },
            )
          ]
        ),
      );
    }

  }
}

