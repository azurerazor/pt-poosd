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

class GamePage extends StatelessWidget {
  const GamePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: Text("Escavalon"),
        ),
        body: Center(
          child: 
            Container(
              padding: const EdgeInsets.all(16.0), 
              child: _GamePageContent()
            )
        ),
    );
  }
  
}

class _GamePageContent extends StatefulWidget {
  const _GamePageContent();

  @override
  State<_GamePageContent> createState() => _GamePageContentState();
}

class _GamePageContentState extends State<_GamePageContent> {
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
          child: Form(
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
          )
        ),
        
        EscavalonButton(
          text: 'Merlin', 
          onPressed: () {
            setState(() {
              _rolesSelected["Merlin"] = !_rolesSelected["Merlin"]!;
            });
          },
        ),

        EscavalonButton(
          text: 'Percival', 
          onPressed: () {
            if (addEvilRole("Morgana")) {
              setState(() {
                _rolesSelected["Percival"] = !_rolesSelected["Percival"]!;
              });
            }
          },
        ),

        EscavalonButton(
          text: 'Morgana', 
          onPressed: () {
            if (addEvilRole("Morgana")) {
              setState(() {
                _rolesSelected["Percival"] = !_rolesSelected["Percival"]!;
              });
            }
          },
        ),

        EscavalonButton(
          text: 'Mordred', 
          onPressed: () {
            addEvilRole("Mordred");
          },
        ),

        EscavalonButton(
          text: 'Assassin', 
          onPressed: () {
            addEvilRole("Assassin");
          },
        ),

        EscavalonButton(
          text: 'Oberon', 
          onPressed: () {
            addEvilRole("Oberon");
          },
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

  bool addEvilRole(String role) {
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

  bool canAddEvilRole() {
    if (numEvil[_numPlayers] == null) {
      return false; // or throw an error
      // current validation should prevent even reaching this point but who knows
    }

    int maxNumEvil = numEvil[_numPlayers] ?? 2;
    return (_numEvilRoles < maxNumEvil);
  }
}




// class _RoleCard extends StatelessWidget {
//   final String name;
//   final bool status;
//   const _RoleCard({required this.name, required this.status});
  
//   @override
//   Widget build(BuildContext context) {
//     return Text(name);
//     // return ConstrainedBox(
//     //   constraints: BoxConstraints(
//     //     maxWidth: 80,
//     //   ),
//     //   child: Column(
//     //     mainAxisAlignment: MainAxisAlignment.center,
//     //     children: <Widget>[
//     //       ConstrainedBox(
//     //         constraints: BoxConstraints(
//     //           minWidth: 80,
//     //           minHeight: 160,
//     //           maxWidth: 80,
//     //           maxHeight: 160,
//     //         ),
//     //         child: Image.asset(
//     //             "assets/percival.png",
//     //             fit: BoxFit.cover,
//     //           )
//     //       ),
//     //       EscavalonButton(
//     //         text: name,
//     //         textStyle: TextStyle(
//     //           fontSize: 8,
//     //         ),
//     //         onPressed: () => showDialog(
//     //           context: context,
//     //           builder: (context) => AlertDialog(
//     //             title: Text(name),
//     //             content: Text(roleDescriptions[name]!),
//     //             actions: <Widget>[
//     //               TextButton(
//     //                 child: const Text("OK"),
//     //                 onPressed: () {
//     //                   Navigator.of(context).pop();
//     //                 },
//     //               ),
//     //             ],
//     //           )
//     //         ),
//     //       ),
//     //     ],
//     //   ),
//     // );
//   }
// }
