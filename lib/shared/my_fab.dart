import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";

class MyFAB extends StatelessWidget {
  final VoidCallback? onPressedFunc;

  const MyFAB({super.key, this.onPressedFunc});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      extendedPadding: EdgeInsets.fromLTRB(25, 10, 25, 10),
      onPressed: onPressedFunc,
      backgroundColor: Theme.of(context).primaryColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(35), // Circular shape
      ),
      label: Text("Start Chat"),
      icon: Icon(
        CupertinoIcons.chat_bubble_2,
        color: Colors.white,
        size: 30,
      ),
    );
  }
}
