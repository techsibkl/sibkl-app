import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/shared/my_text_widgets.dart";
import "package:sibkl_cms/shared/my_theme_divider.dart";

class MyConfirmDialog extends StatelessWidget {
  final String title;
  final String body;
  final String actionText;
  final Color? actionColor;
  final VoidCallback? actionFunction;

  const MyConfirmDialog({
    super.key,
    required this.title,
    required this.body,
    required this.actionText,
    this.actionColor,
    this.actionFunction,
  });

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService = Get.put(MyThemeServiceController());
    return Dialog(
      clipBehavior: Clip.antiAlias,
      insetPadding: EdgeInsets.symmetric(horizontal: 60),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        SizedBox(height: 30),
        Padding(
            padding: EdgeInsets.symmetric(horizontal: 32),
            child: MyTextBolded(title, fontSize: 24, textAlign: TextAlign.center)),
        SizedBox(height: 20),
        Padding(padding: EdgeInsets.symmetric(horizontal: 32), child: MyText(body, textAlign: TextAlign.center)),
        SizedBox(height: 20),
        Container(
            margin: EdgeInsets.all(0),
            width: MediaQuery.of(context).size.width,
            height: 60,
            color: Colors.transparent,
            child: TextButton(
                onPressed: actionFunction,
                child: MyTextBolded(actionText, color: actionColor ?? Theme.of(context).colorScheme.secondary))),
        ThemedDivider(height: 0),
        Container(
            margin: EdgeInsets.all(0),
            width: MediaQuery.of(context).size.width,
            height: 60,
            color: Colors.transparent,
            child: TextButton(onPressed: () => Get.back(), child: MyText("Cancel", color: themeService.textColor54))),
      ]),
    );
  }
}
