import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";

class AuthRichText extends StatelessWidget {
  final String coloredText;
  final String text;
  final MyThemeServiceController themeService =
      Get.find<MyThemeServiceController>();

  AuthRichText({super.key, required this.coloredText, required this.text});

  @override
  Widget build(BuildContext context) {
    return RichText(
      maxLines: 3,
      text: TextSpan(children: [
        TextSpan(
          text: coloredText,
          style: TextStyle(
              color: Theme.of(context).primaryColor,
              fontSize: 39,
              fontWeight: FontWeight.bold,
              fontFamily: "Nunito",
              height: 1.1),
        ),
        TextSpan(
          text: text,
          style: TextStyle(
              color: themeService.textColor,
              fontSize: 39,
              fontWeight: FontWeight.bold,
              fontFamily: "Nunito",
              height: 1.1),
        )
      ]),
    );
  }
}
