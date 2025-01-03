import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/controllers/user_details_controller.dart";
import "package:sibkl_cms/screens/profile/pages/profile_main.dart";

class HomeAppBar extends StatelessWidget {
  const HomeAppBar({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final UserDetailsController userDetailsController =
        Get.put(UserDetailsController());
    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());

    return Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Flexible(
            child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.fromLTRB(1, 0, 0, 0),
                    child: Obx(
                      () => Text(
                        "Welcome, ${userDetailsController.fullName}",
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: themeService.textColor54,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 2.5),
                  Text(
                    "SIBKL Community",
                    style: TextStyle(
                      fontSize: 25,
                      fontWeight: FontWeight.bold,
                      color: themeService.textColor87,
                    ),
                  ),
                ]),
          ),
          GestureDetector(
            onTap: () => Get.to(() => const UserProfile()),
            child: Container(
              alignment: Alignment.center,
              padding: EdgeInsets.all(0),
              height: 50,
              width: 50,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                color: Colors.blue[100],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image(
                  image: AssetImage("assets/images/face.png"),
                  height: 30,
                  width: 30,
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
        ]);
  }
}
