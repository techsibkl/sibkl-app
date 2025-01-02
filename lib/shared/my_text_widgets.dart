import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";

class MyText extends StatelessWidget {
  final MyThemeServiceController themeService = Get.put(MyThemeServiceController());
  final String text;
  final Color? color;
  final double? fontSize;
  final TextAlign? textAlign;
  MyText(this.text, {super.key, this.color, this.fontSize, this.textAlign});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      textAlign: textAlign,
      style: TextStyle(
        fontSize: fontSize ?? 16,
        fontWeight: FontWeight.w500,
        fontFamily: "Nunito",
        color: color ?? themeService.textColor,
      ),
    );
  }
}

class MyTextBolded extends StatelessWidget {
  final MyThemeServiceController themeService = Get.put(MyThemeServiceController());
  final String text;
  final Color? color;
  final double? fontSize;
  final TextAlign? textAlign;

  MyTextBolded(this.text, {this.color, this.fontSize, super.key, this.textAlign});

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      textAlign: textAlign,
      style: TextStyle(
        fontSize: fontSize ?? 16,
        fontWeight: FontWeight.w700,
        fontFamily: "Nunito",
        color: color ?? themeService.textColor,
      ),
    );
  }
}
