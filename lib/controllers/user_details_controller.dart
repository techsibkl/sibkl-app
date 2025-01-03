import "package:cloud_firestore/cloud_firestore.dart";
import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/models/model_user.dart";
import "package:sibkl_cms/screens/auth/pages/auth_sign_in.dart";
import "package:sibkl_cms/services/auth.dart";
import "package:sibkl_cms/services/firestore.dart";
import "package:sibkl_cms/shared/my_confirm_dialog.dart";
import "package:sibkl_cms/shared/open_inbox.dart";
import "package:sibkl_cms/shared/shared_classes.dart";

class UserDetailsController extends GetxController {
  final TextEditingController fullNameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  // final RxBool genderIsMaleController = false.obs;

  final GlobalKey<FormState> fullNameKey = GlobalKey<FormState>();
  final DatabaseService _db = Get.find();
  final AuthService authService = Get.find();

  // Database
  final CollectionReference usersCollection =
      FirebaseFirestore.instance.collection("users");

  // Rx vars - editing changes
  RxBool isLoading = false.obs;
  RxBool fullNameHasChanges = false.obs;
  RxBool emailHasChanges = false.obs;
  // RxBool genderHasChanges = false.obs;

  // Getters - App User
  AppUser get appUser => authService.appUser;
  String? get fullName => appUser.fullName.value;
  String? get email => appUser.email;

  // Getters - Editing details
  String get editedFullName => (fullNameController.text.trim());
  String get editedEmail => (emailController.text.trim());
  bool get validateFullName => (fullNameKey.currentState!.validate());

  // Methods - Editing details
  void updateEditChanges() {
    fullNameHasChanges.value = editedFullName != fullName;
    emailHasChanges.value = editedEmail != email;
    // genderHasChanges.value = genderIsMaleController.value != genderIsMale;
  }

  Future<void> updateFullName() async {
    if (!fullNameHasChanges.value) return;
    // NEXT: Validation
    isLoading(true);
    ReturnValue result = await _db.updateUser({"fullName": editedFullName});
    isLoading(false);
    if (!result.success) {
      Get.showSnackbar(GetSnackBar(
          message:
              "Failed to update name! Please check your connection and try again.",
          duration: Duration(seconds: 2)));
      return;
    }
    appUser.fullName.value = editedFullName;
    Get.back();
  }

  // Future<void> updateGender() async {
  //   if (!genderHasChanges.value) return;
  //   // NEXT: Validation
  //   isLoading(true);
  //   ReturnValue result =
  //       await _db.updateUser({"genderIsMale": genderIsMaleController.value});
  //   isLoading(false);
  //   if (!result.success) {
  //     Get.showSnackbar(GetSnackBar(
  //         message:
  //             "Failed to update gender! Please check your connection and try again.",
  //         duration: Duration(seconds: 2)));
  //     return;
  //   }
  //   // appUser.genderIsMale = genderIsMaleController.value;
  //   Get.back();
  // }

  // Future<void> updatePoints(int points) async {
  //   appUser.points.value += points;
  //   isLoading(true);
  //   ReturnValue result = await _db.updateUser({"points": this.points});
  //   _db.getRanking();
  //   isLoading(false);
  //   if (!result.success) {
  //     Get.showSnackbar(GetSnackBar(
  //         message:
  //             "Failed to update points! Please check your connection and try again.",
  //         duration: Duration(seconds: 2)));
  //     return;
  //   }
  // }

  // Future<void> updateNotificationComplete(Notification Notification) async {
  //   if (!completedNotificationIDs.contains(Notification.id)) {
  //     completedNotificationIDs.add(Notification.id);
  //   }
  //   isLoading(true);
  //   ReturnValue result =
  //       await _db.updateUser({"completedNotificationIDs": completedNotificationIDs});
  //   isLoading(false);
  //   if (!result.success) {
  //     Get.showSnackbar(GetSnackBar(
  //         message:
  //             "Failed to update completion! Please check your connection and try again.",
  //         duration: Duration(seconds: 2)));
  //     return;
  //   }
  // }

  void updateEmail() async {
    if (!emailHasChanges.value) return;
    isLoading(true);
    // NEXT: Validation
    ReturnValue result =
        await authService.sendUpdateVerificationEmail(editedEmail);
    isLoading(false);
    if (!result.success) {
      Get.showSnackbar(GetSnackBar(
          message: "Failed to update email! ${result.value}",
          duration: Duration(seconds: 3)));
      return;
    }
    // SUCCESS
    Get.to(
      () => OpenInboxScreen(
          description:
              "A verification email was sent to $editedEmail.  If you do not see the email in a few minutes, check your junk mail or spam folder.",
          completedMessage: "Click here after verifiying your email",
          completeFunction: () => Get.dialog(MyConfirmDialog(
              title: "Email updated",
              body: "Once verified, you can login with your new email address.",
              actionText: "Login",
              actionFunction: () =>
                  Get.offAll(() => AuthSignIn(preEmail: editedEmail))))),
    );
  }

  void submitCreateAccDetails() async {
    isLoading(true);
    ReturnValue result = await _db.updateUser({
      "fullName": editedFullName,
      // "genderIsMale": genderIsMaleController.value,
      // "points": 0,
      // "completedNotificationIDs": [],
    });
    isLoading(false);
    authService.reload();

    if (!result.success) {
      Get.showSnackbar(GetSnackBar(
          message:
              "Failed to create account! Please check your connection and try again.",
          duration: Duration(seconds: 2)));
    }
  }
}
