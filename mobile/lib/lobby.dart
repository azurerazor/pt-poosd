import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/escavalon_material.dart';

const Map<int, int> numEvil = {
  5: 2,
  6: 2,
  7: 3,
  8: 3,
  9: 3,
  10: 4,
};

const Map<String, String> roleDescriptions = {
  "Merlin": "Merlin is an optional Character on the Side of Good. He knows who the Evil players are, but if he is killed, the Evil players win. Adding Merlin into the game will mkae the Good side more powerful and win more ofen.",
  "Percival": "Percival is an optional Character on the Side of Good. Pervival's special power is knowledge of Merlin at the start of the game. Using Percival's knowledge wisely is key to protecting Merlin's identity. Adding Percival into the game will make the Good side more powerful and win more often.",
  "Assassin": "Assassin is an optional Character on the Side of Evil. They make the final decision on who to kill at the end of the game. If they kill Merlin, the Evil players win.",
  "Morgana": "Morgana is an optional Character on the Side of Evil. Morgana's special power",  
  "Oberon": "Oberon is an optional Character on the Side of Evil. He does not know who the Evil players are, but if he is killed, the Good players win.",
  "Mordred": "Mordred is an optional Character on the Side of Evil. He appears as Good to Merlin, but if he is killed, the Good players win.",
};

// source: https://api.flutter.dev/flutter/dart-ui/ColorFilter/ColorFilter.matrix.html
const ColorFilter greyscale = ColorFilter.matrix(<double>[
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
]);

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

    return Scaffold(
      appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Escavalon"),
        ),
        body: Center(
          child: 
            Container(
              padding: const EdgeInsets.all(16.0), 
              child: _LobbyPageContent()
            )
        ),
    );
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
            
            showDialog(
              context: context, 
              builder: (context) => AlertDialog(
                title: const Text("Game Starting"),
                content: Text("Roles selected:\n\tMerlin: ${_rolesSelected["Merlin"]}\n\tPercival: ${_rolesSelected["Percival"]}\n\tMorgana: ${_rolesSelected["Morgana"]}\n\tMordred: ${_rolesSelected["Mordred"]}\n\tAssassin: ${_rolesSelected["Assassin"]}\n\tOberon: ${_rolesSelected["Oberon"]}"),
                actions: <Widget>[
                  TextButton(
                    child: const Text("OK"),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  ),
                ],
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
    Widget thisImage = Image(
      image: ResizeImage(
        AssetImage("assets/$role.png"),
        width: 150,
      )
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
