import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/screens/auth/pages/auth_sign_in.dart";
import "package:sibkl_cms/screens/auth/pages/auth_sign_up.dart";

class AuthHome extends StatelessWidget {
  const AuthHome({super.key});

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService = Get.put(MyThemeServiceController());

    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  alignment: Alignment.center,
                  padding: EdgeInsets.symmetric(horizontal: 100),
                  child: Image(
                    image: AssetImage("assets/icons/pre-scam-ai-icon.png"),
                  ),
                ),
                SizedBox(height: 20),
                Text(
                  "PreScam.AI",
                  style: TextStyle(
                    fontSize: 35,
                    fontWeight: FontWeight.bold,
                    fontFamily: "Nunito",
                    color: themeService.textColor,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  "AI Vaccine for Scams",
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    fontFamily: "Nunito",
                    color: themeService.textColor,
                  ),
                ),
              ],
            ),
          ),
          Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.black26, width: 1),
              ),
              alignment: Alignment.center,
              height: 140,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  SizedBox(
                    height: 60,
                    width: 170,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).primaryColor,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                        ),
                        textStyle: TextStyle(
                            fontFamily: "Nunito", color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      onPressed: () => Get.to(() => AuthSignIn()),
                      child: Text(
                        "I have an account",
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 60,
                    width: 170,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.secondary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                        ),
                        textStyle: TextStyle(
                            fontFamily: "Nunito", color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16),
                      ),
                      onPressed: () => Get.to(() => AuthSignUp()),
                      child: Text(
                        "Sign up",
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  )
                ],
              )),
        ],
      ),
    );
  }
}
