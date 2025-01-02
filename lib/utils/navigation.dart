import "package:get/get.dart";
import "package:sibkl_cms/screens/auth/pages/auth_home.dart";
import "package:sibkl_cms/screens/auth/pages/auth_wrapper.dart";
import "package:sibkl_cms/screens/home/home_wrapper.dart";

// Future navigateToCredits() async {
//   return await Get.to(() => CreditsPage());
// }

// Future navigateToPrivacyPolicy() async {
//   return await Get.to(() => PrivacyPolicyPage());
// }

// Future navigateToTermsAndConditions() async {
//   return await Get.to(() => TermsAndConditionsPage());
// }

Future navigateOffAllAuthHome() async {
  return await Get.offAll(() => AuthHome(), transition: Transition.native);
}

// // Future navigateToCreateAccAddress() async {
// //   return await Get.to(() => CreateAccAddress());
// // }

// // Future navigateToCreateAccHome(String accountEmail) async {
// //   return await Get.to(() => CreateAccHome(accountEmail: accountEmail));
// // }

// Future navigateToSettingsInfo() async {
//   return await Get.to(() => SettingsInformationPage());
// }

// Future navigateToSettingsFAQ() async {
//   return await Get.to(() => SettingsFAQPage());
// }

// Future navigateToSettingsMain() async {
//   return await Get.to(() => SettingsMain(),
//       transition: Transition.noTransition);
// }

// Future navigateToEditUsername() async {
//   return await Get.to(() => EditUsernamePage());
// }

// Future navigateToEditEmail() async {
//   return await Get.to(() => EditEmailPage());
// }

// Future navigateToEditGender() async {
//   return await Get.to(() => EditGenderPage());
// }

// Future navigateToEditAddress() async {
//   return await Get.to(() => EditAddressPage());
// }

// Future navigateToVRegDate() async {
//   return await Get.to(() => VRegDate(), transition: Transition.rightToLeftWithFade);
// }

// Future navigateToVRegExitDate() async {
//   return await Get.to(() => VRegExitDate());
// }

Future navigateOffAllHome() async {
  return await Get.offAll(() => HomeWrapper(), transition: Transition.zoom);
}

Future navigateOffAllWrapper() async {
  return await Get.offAll(() => AuthWrapper(), transition: Transition.zoom);
}

// Future navigateToSplashScreen() async {
//   return await Get.to(() => SplashScreen());
// }
