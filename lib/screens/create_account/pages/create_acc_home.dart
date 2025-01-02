import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/controllers/user_details_controller.dart";
import "package:sibkl_cms/screens/auth/widgets/auth_richtext.dart";
import "package:sibkl_cms/screens/auth/widgets/auth_textfield_email.dart";
import "package:sibkl_cms/screens/create_account/pages/textfield_fullname.dart";
import "package:sibkl_cms/shared/all_loading.dart";
import "package:sibkl_cms/shared/my_expanded_btn.dart";
import "package:sibkl_cms/shared/my_page_appbar.dart";
import "package:sibkl_cms/utils/navigation.dart";

class CreateAccHome extends StatelessWidget {
  final String accountEmail;
  const CreateAccHome({super.key, required this.accountEmail});

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());
    final UserDetailsController userDetailsController =
        Get.put(UserDetailsController());
    return SafeArea(
      child: Scaffold(
          body: CustomScrollView(
        shrinkWrap: true,
        slivers: [
          SliverFillRemaining(
            hasScrollBody: false,
            fillOverscroll: true,
            child: Column(children: [
              Padding(
                  padding: const EdgeInsets.fromLTRB(22, 32, 22, 32),
                  child: Column(children: [
                    MyPageAppBar(
                        title: "Create account",
                        appBarType: MyAppBarType.back,
                        backFunction: navigateOffAllAuthHome),
                    // Expanded(child: Container()),
                    SizedBox(height: 40),
                    Align(
                        alignment: Alignment.centerLeft,
                        child: AuthRichText(
                          coloredText: "Get started!",
                          text: "",
                        )),
                    SizedBox(height: 20),
                    Container(
                        alignment: Alignment.centerLeft,
                        padding: EdgeInsets.fromLTRB(4, 0, 0, 0),
                        child: Text(
                          "First, create your PreScam.AI account.",
                          style: TextStyle(
                              fontFamily: "Nunito",
                              color: themeService.textColor54,
                              fontWeight: FontWeight.w400,
                              fontSize: 14),
                        )),
                    SizedBox(height: 20),
                    AuthTextFieldEmail(
                        initialText: accountEmail, canEdit: false),
                    SizedBox(height: 20),
                    Form(
                        key: userDetailsController.fullNameKey,
                        autovalidateMode: AutovalidateMode.onUserInteraction,
                        child: TextFieldFullName(
                            textController:
                                userDetailsController.fullNameController)),
                    SizedBox(height: 20),
                    // ChooseGender(),
                  ])),
              Expanded(child: Container()),
              Obx(() => userDetailsController.isLoading.isTrue
                  ? CircleLoading(size: 1.5)
                  : MyExpandedButton(
                      text: "Save and continue",
                      onPressFunc: () {
                        if (userDetailsController.validateFullName) {
                          userDetailsController.submitCreateAccDetails();
                        }
                      })),
            ]),
          ),
        ],
      )),
    );
  }
}
