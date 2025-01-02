import "package:flutter/cupertino.dart";
import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";

enum MyAppBarType { back, xmark }

class MyPageAppBar extends StatelessWidget {
  final String title;
  final MyAppBarType appBarType;
  final VoidCallback? backFunction;
  final MyThemeServiceController themeService =
      Get.put(MyThemeServiceController());

  MyPageAppBar({
    super.key,
    required this.title,
    required this.appBarType,
    this.backFunction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        GestureDetector(
          onTap: backFunction ?? () => Get.back(),
          behavior: HitTestBehavior.translucent,
          child: Container(
            height: 50,
            width: 50,
            alignment: Alignment.center,
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: themeService.textColor26,
                width: 0.5,
              ),
            ),
            child: Icon(
              appBarType == MyAppBarType.back
                  ? CupertinoIcons.back
                  : CupertinoIcons.xmark,
              color: themeService.textColor,
            ),
          ),
        ),
        Text(
          title,
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.bold,
            fontFamily: "Nunito",
            color: themeService.textColor,
          ),
        ),
        Container(
          alignment: Alignment.center,
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Icon(
            Icons.cancel_outlined,
            color: Colors.transparent,
            size: 25,
          ),
        ),
      ],
    );
  }
}
