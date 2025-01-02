import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/screens/home/pages/home.dart";
import "package:sibkl_cms/shared/my_bottom_navbar.dart";

class HomeWrapper extends StatelessWidget {
  const HomeWrapper({super.key});

  // final AuthService authService = Get.put(AuthService());
  @override
  Widget build(BuildContext context) {
    final PageController pageController =
        Get.put(PageController(initialPage: 0));

    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());
    return SafeArea(
      child: Scaffold(
        body: PageView(
          controller: pageController,
          onPageChanged: (value) => themeService.homePageSelected(value == 0),
          children: [
            Home(),
            // SettingsMain(),
          ],
        ),
        // floatingActionButton: MyFAB(),
        // floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        bottomNavigationBar: MyBottomNavBar(pageController: pageController),
      ),
    );
  }
}
