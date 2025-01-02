import "package:flutter/material.dart";

class MyFillButton extends StatelessWidget {
  final Icon? icon;
  final String text;
  final Color color;
  final Color? textColor;
  final VoidCallback? onPressFunc;
  const MyFillButton({super.key, 
    required this.onPressFunc,
    required this.text,
    required this.color,
    this.icon,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 65,
      width: MediaQuery.of(context).size.width,
      // margin: EdgeInsets.fromLTRB(30, 0, 30, 0),
      child: ElevatedButton(
          onPressed: onPressFunc,
          style: ElevatedButton.styleFrom(
            elevation: 2, backgroundColor: color,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(20)),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(0, 0, 0, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                icon ?? Container(),
                SizedBox(width: icon == null ? 0 : 10),
                Text(
                  text,
                  style: TextStyle(
                    // shadows: [
                    //   Shadow(
                    //       color: _themeProvider.primaryTextColor26,
                    //       blurRadius: 10,
                    //       offset: Offset(0.5, 0.5))
                    // ],
                    fontFamily: "Nunito",
                    color: textColor ?? Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          )),
    );
  }
}
