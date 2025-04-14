import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/escavalon_material.dart';

import 'game.dart';

FlutterSecureStorage? webTokenStorage;

class LobbyPage extends StatelessWidget {
  final FlutterSecureStorage? token;
  
  const LobbyPage({
    super.key,
    required this.token,
  });

  @override
  Widget build(BuildContext context) {
    webTokenStorage = token;

    return EscavalonPage(child: _LobbyPageContent());
  }
  
}

class _LobbyPageContent extends StatefulWidget {
  const _LobbyPageContent();

  @override
  State<_LobbyPageContent> createState() => _LobbyPageContentState();
}

class _LobbyPageContentState extends State<_LobbyPageContent> {
  int _numPlayers = 5;
  int _numEvilRoles = 0;
  final Map<String, bool> _rolesSelected = {
    "Merlin": false,
    "Percival": false,
    "Morgana": false,
    "Assassin": false,
    "Mordred": false,
    "Oberon": false,
  };
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        EscavalonCard(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget> [
              Form(
                key: _formKey,
                child: TextFormField(
                  initialValue: "5",
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly
                  ],
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    hintText: "5-10",
                    labelText: "Number of players"
                  ),
                  onChanged: (String? value) {
                    setState(() {
                      if (value == null) {
                        _numPlayers = 5;
                      } else {
                        _numPlayers = int.tryParse(value) ?? 5;
                      }
                    });                
                  },

                  autovalidateMode: AutovalidateMode.onUnfocus,

                  validator: (String? value) {
                    int? val = (value == null) ? null : int.tryParse(value);
                    if (val == null || val < 5 || val > 10) {
                      return "Enter a number between 5 and 10";
                    }
                    
                    int maxNumEvil = numEvil[val] ?? 2;
                    if (_numEvilRoles > maxNumEvil) {
                      return "Too many evil roles selected";
                    }

                    return null;
                  },
                ),
              ),

              Container(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  "Number of evil players: ${numEvil[_numPlayers] ?? "?"}"
                ),
              )
              
            ],
          )
        ),

        SizedBox(
          height: 300,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              roleCard("Merlin"),
              roleCard("Percival"),
              roleCard("Morgana"),
              roleCard("Mordred"),
              roleCard("Assassin"),
              roleCard("Oberon"),
            ],
          )
        ),

        EscavalonButton(
          text: "Start Game", 
          onPressed: () {
            if (_formKey.currentState!.validate() == false) return;
            
            Navigator.pop(context);
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => GamePage(
                  token: webTokenStorage,
                  numPlayers: _numPlayers,
                  rolesSelected: _rolesSelected
                )
              )
            );
          }
        ),
      ],
    );
  }

  Widget roleCard(String role) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        IconButton(
          icon: getRoleImage(role),
          onPressed: () {
            if (role == "Merlin") {
              setState(() {
                _rolesSelected[role] = !(_rolesSelected[role]!);
              });

              if (_rolesSelected["Merlin"] == true) {
                return;
              }

              if (_rolesSelected["Percival"] == true) {
                _rolesSelected["Percival"] = false;
                addEvilRole("Morgana");
              }

              if (_rolesSelected["Mordred"] == true) {
                addEvilRole("Mordred");
              }

              return;
            }

            if (role == "Percival" || role == "Morgana") {
              if (addEvilRole("Morgana")) {
                setState(() {
                  _rolesSelected["Percival"] = !(_rolesSelected["Percival"]!);
                });

                if (_rolesSelected["Percival"] == true) {
                  _rolesSelected["Merlin"] = true;
                }
              }

              return;
            }

            if (role == "Mordred") {
              if (addEvilRole("Mordred")) {
                if (_rolesSelected["Mordred"] == true) {
                  _rolesSelected["Merlin"] = true;
                }
              }

              return;
            }

            addEvilRole(role);
          },
        ),

        // Info button
        ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: 150,
            maxWidth: 150,
          ),
          child: EscavalonButton(
            onPressed: () => showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: Text(role),
                content: Text(roleDescriptions[role] ?? "No description available"),
                actions: <Widget>[
                  TextButton(
                    child: const Text("OK"),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  ),
                ],
              )
            ),
            child: Row(
              children: <Widget>[                
                Expanded(
                  child: Text(
                    role,
                    textAlign: TextAlign.center
                  )
                ),

                Icon(Icons.info_outline),
              ],
            ),
          ),
        ),
      ],
    );
  }

  bool addEvilRole(String role) {
    bool canAddEvilRole() {
      if (numEvil[_numPlayers] == null) {
        return false; // or throw an error
        // current validation should prevent even reaching this point but who knows
      }

      int maxNumEvil = numEvil[_numPlayers] ?? 2;
      return (_numEvilRoles < maxNumEvil);
    }

    if (_rolesSelected[role] == false) {
      if (!canAddEvilRole()) {
        return false;
      }
    }

    setState(() {
      if (_rolesSelected[role] == true) {
        _numEvilRoles--;
      } else {
        _numEvilRoles++;
      }
      _rolesSelected[role] = !_rolesSelected[role]!;
    });

    return true;
  }

  Widget getRoleImage(String role) {
    Widget thisImage = ClipPath(
      clipper: BeveledRectangleImageClipper(
        border: BeveledRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
      ),
      child: Image.asset(
        'assets/$role.png',
        width: 150,
        height: 220,
        fit: BoxFit.cover,
      ),
    );

    if (_rolesSelected[role]!) {
      return thisImage;
    }

    // if role not selected, return greyed out image
    return ColorFiltered(
      colorFilter: greyscale, 
      child: thisImage
    );
  }

}

class BeveledRectangleImageClipper extends CustomClipper<Path> {
  final BeveledRectangleBorder border;
  final BorderRadius? borderRadius;

  BeveledRectangleImageClipper({required this.border, this.borderRadius});

  @override
  Path getClip(Size size) {
    final Rect rect = Rect.fromLTWH(0, 0, size.width, size.height);
    return border.getOuterPath(rect, textDirection: TextDirection.ltr);
  }

  @override
  bool shouldReclip(covariant BeveledRectangleImageClipper oldClipper) {
    return oldClipper.border != border || oldClipper.borderRadius != borderRadius;
  }
}