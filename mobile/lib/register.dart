import 'dart:async';
import 'dart:convert';

import 'package:loading_indicator/loading_indicator.dart';
import 'escavalon_material.dart';
import 'login.dart';
import 'main.dart';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

/// Should be wrapped in an EscavalonPage widget. Changed it while cleaning up code,
/// might revert it back to using RegisterPage and RegisterPageContent if dealing with 
/// other pages ends up being uglier.
class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() {
    return _RegisterPageState();
  }
}

class _RegisterPageState extends State<RegisterPage> {
  String? _username, _email, _password;

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();


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
                children: [
                  // username
                  TextFormField(
                    decoration: const InputDecoration(
                      icon: Icon(Icons.person),
                      hintText: "cool-_username",
                      labelText: "Username"
                    ),
                    onChanged: (String? value) {
                      setState(() {
                        _username = value;
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
                        _email = value;
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
                        _password = value;
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
                  
                  SizedBox(height: 20,)

                ],
              )
            ),

            SizedBox(height: 20,),

            Builder(
              builder: (context) {
                if (_isLoading == false) {
                  return EscavalonButton(
                    text: 'Register', 
                    onPressed: () {
                      if (_formKey.currentState!.validate() == false) return;
                      _tryRegister(_username!, _email!, _password!);
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

  /// Tries to register with username, email, and password, and then processes register response. 
  Future<void> _tryRegister(String username, String email, String password) async {
    setState(() {
      _isLoading = true;
    });

    // sends post request
    final response = await http.post(
      Uri.parse('$URL/api/register'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    // register was successful
    if (response.statusCode == 201) {
      return _processRegisterResponse(null);
    // otherwise it wasn't. send error message from response if found, otherwise, sends an unknown error
    } else {
      final dynamic responseBody = jsonDecode(response.body);
      if (responseBody is Map<String, dynamic>) {
        return _processRegisterResponse(responseBody['message'] ?? 'Unknown error');
      } else {
        return _processRegisterResponse('Unknown error');
      }
    }
  }  

  /// Proccesses register response.
  /// If error is null, will assume register was successful and display a dialog to send user to login.
  /// Otherwise, will display a dialog displaying the error.
  void _processRegisterResponse(String? error) {
    setState(() {
      _isLoading = false;
    });

    // if there is a message, we've encountered an error
    if (error != null) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Error registering"),
          content: Text(error),
          actions: <Widget>[
            TextButton(
              child: Text("OK"),
              onPressed: () {
                Navigator.pop(context); // delete dialog
              },
            )
          ]
        ),
      );
     // otherwise we're good to login
    } else {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text("Registered successfully!"),
          content: Text("Check your email for a verification link.\nUsername: $_username\nEmail: $_email"),
          actions: <Widget>[
            TextButton(
              child: Text("Proceed to login"),
              onPressed: () {
                Navigator.pop(context); // remove dialog box
                Navigator.pop(context); // go back to home
                Navigator.push( // go to login page
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
