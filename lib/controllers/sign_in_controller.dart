import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/services/auth.dart";
import "package:sibkl_cms/services/firestore.dart";
import "package:sibkl_cms/shared/shared_classes.dart";

class SignInController extends GetxController {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  final AuthService authService = Get.find();
  final DatabaseService _db = Get.find();

  RxBool tempToggleAuthScreen = true.obs;

  RxString errMessage = "".obs;
  RxBool isLoading = false.obs;
  bool firstValidation = true;

  bool get isEmpty => (emailController.text.isEmpty);
  bool get shortPassword => (passwordController.text.length < 6);
  bool get invalidEmail => (!emailController.text.contains("@"));
  bool get hasError => (errMessage.string.isNotEmpty);
  String get email => (emailController.text.trim());
  String get password => (passwordController.text);

  bool validateEmail({bool only = false}) {
    if (isEmpty) {
      errMessage("Email cannot be empty");
    } else if (invalidEmail) {
      errMessage("Invalid email address");
    } else {
      //if pass all validations, return (true)
      only ? errMessage("") : null;
      return (true);
    }
    return (false);
  }

  bool validatePassword() {
    if (shortPassword) {
      errMessage("Password must have at least 6 characters");
    } else {
      return (true);
    }
    return (false);
  }

  bool validateEmailAndPassword() {
    if (validateEmail() && validatePassword()) {
      errMessage("");
      return (true);
    }
    return (false);
  }

  void signInEmail() async {
    isLoading(true);
    FocusManager.instance.primaryFocus?.unfocus();

    await Future.delayed(Duration(seconds: 1));
    // Validate email and password input
    if (!validateEmailAndPassword()) {
      firstValidation = false;
      isLoading(false);
      return;
    }

    ReturnValue result = await authService.signInWithEmailPassword(
        email: email, password: password);
    !result.success
        ? errMessage("${result.value}")
        : Get.showSnackbar(GetSnackBar(
            message: "Logged in with ${result.value}!",
            duration: Duration(seconds: 2)));
    isLoading(false);
  }

  void signUpEmail() async {
    isLoading(true);
    FocusManager.instance.primaryFocus?.unfocus();

    await Future.delayed(Duration(seconds: 1));
    // Validate email and password input
    if (!validateEmailAndPassword()) {
      firstValidation = false;
      isLoading(false);
      return;
    }

    ReturnValue result =
        await authService.createEmailAccount(email: email, password: password);
    if (result.success) {
      _db.createNewUser(result.value!, email);
      Get.showSnackbar(GetSnackBar(
          message: "Signed up with $email!", duration: Duration(seconds: 2)));
    } else {
      errMessage("${result.value}");
    }
    isLoading(false);
  }

  void signInGoogle() async {
    isLoading(true);
    FocusManager.instance.primaryFocus?.unfocus();

    ReturnValue result = await authService.signInWithGoogle();
    if (result.success) {
      Get.showSnackbar(GetSnackBar(
          message: "Logged in with ${result.value}!",
          duration: Duration(seconds: 2)));
    } else {
      errMessage("${result.value}");
    }
    isLoading(false);
  }
}
