import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/screens/auth/pages/auth_home.dart";
import "package:sibkl_cms/screens/auth/pages/auth_sign_in.dart";
import "package:sibkl_cms/screens/create_account/pages/create_acc_home.dart";
import "package:sibkl_cms/screens/home/home_wrapper.dart";
import "package:sibkl_cms/services/auth.dart";
import "package:sibkl_cms/shared/my_confirm_dialog.dart";
import "package:sibkl_cms/shared/open_inbox.dart";

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  @override
  Widget build(BuildContext context) {
    final AuthService authService = Get.put(AuthService());

    if (authService.appUser.uid == null) {
      return AuthHome();
    } else if (!authService.appUser.hasProfileDetails) {
      return CreateAccHome(accountEmail: authService.appUser.email!);
    } else if (!authService.appUser.isVerified) {
      return OpenInboxScreen(
        initFunction: authService.sendVerificationEmail,
        description:
            "A verification email was sent to ${authService.appUser.email}. If you do not see the email in a few minutes, check your junk mail or spam folder.",
        completedMessage: "Click here after you have verified your email",
        completeFunction: () => Get.dialog(MyConfirmDialog(
            title: "Create account complete",
            body:
                "Once you have verified your email address, you can login to your account.",
            actionText: "Login",
            actionColor: Theme.of(context).colorScheme.secondary,
            actionFunction: () => Get.offAll(
                () => AuthSignIn(preEmail: authService.appUser.email)))),
      );
    } else {
      return HomeWrapper();
    }
  }
}
