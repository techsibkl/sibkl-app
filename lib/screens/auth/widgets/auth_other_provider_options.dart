import "package:flutter/material.dart";
import "package:font_awesome_flutter/font_awesome_flutter.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";

class OtherAuthProviderOptions extends StatelessWidget {
  final String text;
  final MyThemeServiceController themeService =
      Get.put(MyThemeServiceController());
  OtherAuthProviderOptions({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.all(20),
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(100),
              side: BorderSide(color: themeService.textColor12),
            ),
          ),
          onPressed: () async {},
          child: Icon(
            FontAwesomeIcons.facebookF,
            color: Colors.blue[400],
            size: 20,
          ),
        ),
        SizedBox(width: 12),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            padding: EdgeInsets.all(20),
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(100),
              side: BorderSide(color: themeService.textColor12),
            ),
          ),
          onPressed: () async {},
          child: Icon(
            FontAwesomeIcons.google,
            color: Colors.red[400],
            size: 20,
          ),
        ),
        // SizedBox(width: 25),
        Expanded(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
                fontFamily: "Nunito",
                color: themeService.textColor54,
                fontWeight: FontWeight.w400,
                fontSize: 14),
          ),
        ),
      ],
    );
  }
}
