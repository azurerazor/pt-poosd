// import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/escavalon_material.dart';
// import 'package:http/http.dart' as http;

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


              EscavalonButton(
                text: "Login",
                onPressed: () {
                  if (_formKey.currentState!.validate() == false) return;

                  showDialog(
                    context: context, 
                    builder: (context) => AlertDialog(
                      title: const Text("Log In"),
                      content: Text("successfully logged in with username: $username, password: $password"),
                      actions: <Widget>[
                        TextButton(
                          child: const Text("OK"),
                          onPressed: () {
                            Navigator.pop(context);
                            Navigator.pop(context);
                          },
                        ),
                      ]
                    )
                  );
                }, 
              ),
            ],
          )
        ),
      )
    );
  }







}
