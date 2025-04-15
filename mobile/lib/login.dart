import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:loading_indicator/loading_indicator.dart';
import 'package:mobile/escavalon_material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final webTokenStorage = const FlutterSecureStorage();

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return EscavalonPage(child: _LoginForm());
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

  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return Center (
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

                  SizedBox(height: 20,),
                ],
              )
            ),

            SizedBox(height: 20,),

            Builder(
              builder: (context) {
                if (_isLoading == false) {
                  return EscavalonButton(
                    text: 'Login', 
                    onPressed: () {
                      if (_formKey.currentState!.validate() == false) return;
                      _tryLogin(username!, password!);
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
    );
  }

  Future<void> _storeToken(String token) async {
    await webTokenStorage.write(key: "token", value: token);
  }

  Future<void> _tryLogin(String username, String password) async {
    if (_isLoading) return; // shouldn't be able to call this function if already loading

    setState(() {
      _isLoading = true;
    });

    final response = await http.post(
      Uri.parse('http://escavalon.quest/api/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'password': password,
      }),
    );

    String? errorMessage;

    if (response.statusCode == 200) {
      if (response.headers['set-cookie'] == null) {
        errorMessage == "No cookie found";
      } else {
        Cookie cookie = Cookie.fromSetCookieValue(response.headers['set-cookie']!);
        _storeToken(cookie.value);
      }

    } else {
      final dynamic responseBody = jsonDecode(response.body);
      if (responseBody is Map<String, dynamic>) {
        errorMessage = responseBody['message'] ?? "Unknown error";
      } else {
        errorMessage = "Unknown error";
      }
    }

    _processLoginResponse(errorMessage);
  } 

  void _processLoginResponse(String? message) {
    setState(() {
      _isLoading = false;
    });

    if (message != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Login"),
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
      Navigator.pop(context, [username, webTokenStorage]);
    }
  }
}

