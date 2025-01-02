import "package:flutter/material.dart";
import "package:sibkl_cms/shared/center_image_text.dart";
import "package:sibkl_cms/shared/my_page_appbar.dart";
import "package:sibkl_cms/utils/navigation.dart";

class OpenInboxScreen extends StatefulWidget {
  final String description;
  final VoidCallback? initFunction;
  final VoidCallback? completeFunction;
  final String? completedMessage;

  const OpenInboxScreen(
      {super.key,
      required this.description,
      this.initFunction,
      this.completedMessage,
      this.completeFunction = navigateOffAllWrapper});

  @override
  State<OpenInboxScreen> createState() => _OpenInboxScreenState();
}

class _OpenInboxScreenState extends State<OpenInboxScreen> {
  @override
  void initState() {
    super.initState();
    if (widget.initFunction != null) widget.initFunction!();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: const EdgeInsets.fromLTRB(35, 32, 35, 22),
          child: Column(
            children: [
              MyPageAppBar(title: "Alert", appBarType: MyAppBarType.xmark),
              Expanded(child: Container()),
              CenterImageText(
                imagePath: "assets/images/inbox.png",
                title: "Check your inbox",
                description: widget.description,
              ),
              Expanded(child: Container()),
              SizedBox(
                height: 65,
                width: MediaQuery.of(context).size.width,
                // margin: EdgeInsets.fromLTRB(30, 0, 30, 0),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.all(Radius.circular(20)),
                    ),
                  ),
                  onPressed: () {},
                  // onPressed: () async {
                  //   final OpenMailAppResult result =
                  //       await OpenMailApp.openMailApp();
                  //   if (!result.didOpen && !result.canOpen) {
                  //     Get.snackbar(
                  //         "No email app", "Oops! No mail apps installed.");
                  //   } else if (!result.didOpen && result.canOpen) {
                  //     Get.dialog(MailAppPickerDialog(mailApps: result.options));
                  //   }
                  // },
                  child: Text(
                    "Open email app",
                    style: TextStyle(
                      fontFamily: "Nunito",
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 15),
              GestureDetector(
                onTap: () => widget.completeFunction!(),
                child: Padding(
                  padding: EdgeInsets.fromLTRB(10, 10, 10, 10),
                  child: Text(
                    widget.completedMessage ?? "Click here to go back home",
                    style: TextStyle(
                        fontFamily: "Nunito",
                        decoration: TextDecoration.underline,
                        decorationColor:
                            Theme.of(context).colorScheme.secondary,
                        color: Theme.of(context).colorScheme.secondary,
                        fontWeight: FontWeight.w400,
                        fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
