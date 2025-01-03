import "package:flutter/material.dart";
import "package:get/get.dart";
import "package:sibkl_cms/controllers/theme_service_controller.dart";
import "package:sibkl_cms/shared/my_text_input_decoration.dart";

class TextFieldEmail extends StatelessWidget {
  final TextEditingController? textController;

  const TextFieldEmail({
    super.key,
    this.textController,
  });

  @override
  Widget build(BuildContext context) {
    final MyThemeServiceController themeService =
        Get.put(MyThemeServiceController());

    return TextFormField(
      controller: textController,
      cursorColor: Theme.of(context).primaryColor,
      scrollPadding: EdgeInsets.fromLTRB(0, 0, 0, 80),
      style: TextStyle(color: themeService.textColor, fontSize: 16),
      decoration: textInputDecoration.copyWith(
        contentPadding: EdgeInsets.fromLTRB(20, 0, 0, 0),
        hintText: "Email",
        hintStyle: TextStyle(color: themeService.textColor54),
        labelText: "Email",
        labelStyle: TextStyle(color: themeService.textColor54),
        floatingLabelStyle: TextStyle(
          color: Theme.of(context).primaryColor,
          fontSize: 18,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(10)),
          borderSide: BorderSide(
            color: themeService.textColor26,
            width: 1,
          ),
        ),
        suffixIcon: Icon(
          Icons.edit,
          size: 16,
          color: Theme.of(context).primaryColor,
        ),
        fillColor: Theme.of(context).scaffoldBackgroundColor,
      ),
      validator: (value) {
        if (value == null || value.isEmpty) return ("Field cannot be empty.");
        return null;
      },
      textInputAction: TextInputAction.next,
      // validator: (val) => val.isEmpty
      //     ? "Email cannot be empty."
      //     : null,
    );
  }
}
